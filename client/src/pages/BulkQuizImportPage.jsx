import React, { useMemo, useState } from "react";
import "../components/GlobalStyle.css";

const BulkQuizImportPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [rawText, setRawText] = useState("");
  const [points, setPoints] = useState(1);

  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const exampleFormat = `1. What is HTML?
A. HyperText Markup Language
B. HighText Markdown Language
C. Hyper Tool Markup Language
D. Home Tool Markup Language
Answer: A

2. What does CSS stand for?
A. Computer Style Sheets
B. Cascading Style Sheets
C. Creative Style Syntax
D. Colorful Style System
Answer: B`;

  const canSubmit = useMemo(() => {
    return (
      title.trim() !== "" &&
      parsedQuestions.length > 0 &&
      parseErrors.length === 0 &&
      !loading
    );
  }, [title, parsedQuestions, parseErrors, loading]);

  const parseBulkQuestions = (input) => {
    const lines = input
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const questions = [];
    const errors = [];
    let current = null;
    let questionNumber = 0;

    const pushCurrentQuestion = () => {
      if (!current) return;

      const hasText = current.text.trim() !== "";
      const hasFourChoices = current.choices.length === 4;
      const correctCount = current.choices.filter((c) => c.isCorrect).length;

      if (!hasText) {
        errors.push(`Question ${questionNumber}: missing question text.`);
      }

      if (!hasFourChoices) {
        errors.push(`Question ${questionNumber}: must have exactly 4 choices.`);
      }

      if (correctCount !== 1) {
        errors.push(`Question ${questionNumber}: must have exactly 1 correct answer.`);
      }

      if (hasText && hasFourChoices && correctCount === 1) {
        questions.push(current);
      }
    };

    for (const line of lines) {
      if (/^\d+\.\s+/.test(line)) {
        pushCurrentQuestion();

        questionNumber += 1;
        current = {
          text: line.replace(/^\d+\.\s+/, "").trim(),
          choices: [],
          points: Number(points) || 1,
        };
      } else if (/^[A-D]\.\s+/.test(line)) {
        if (!current) {
          errors.push(`Choice found before first question: "${line}"`);
          continue;
        }

        const label = line.charAt(0).toUpperCase();
        const choiceText = line.replace(/^[A-D]\.\s+/, "").trim();

        current.choices.push({
          label,
          text: choiceText,
          isCorrect: false,
        });
      } else if (/^Answer:\s*[A-D]$/i.test(line)) {
        if (!current) {
          errors.push(`Answer found before first question: "${line}"`);
          continue;
        }

        const correctLetter = line.split(":")[1].trim().toUpperCase();

        current.choices = current.choices.map((choice) => ({
          ...choice,
          isCorrect: choice.label === correctLetter,
        }));
      } else {
        errors.push(`Unrecognized line: "${line}"`);
      }
    }

    pushCurrentQuestion();

    const cleanedQuestions = questions.map((q) => ({
      text: q.text,
      points: q.points,
      choices: q.choices.map(({ text, isCorrect }) => ({
        text,
        isCorrect,
      })),
    }));

    return { questions: cleanedQuestions, errors };
  };

  const handleParse = () => {
    setStatus("");

    const result = parseBulkQuestions(rawText);
    setParsedQuestions(result.questions);
    setParseErrors(result.errors);

    if (result.questions.length > 0 && result.errors.length === 0) {
      setStatus(`Parsed ${result.questions.length} question(s) successfully.`);
    } else if (result.questions.length > 0 && result.errors.length > 0) {
      setStatus(
        `Parsed ${result.questions.length} question(s), but found ${result.errors.length} issue(s).`
      );
    } else {
      setStatus("Could not parse any valid questions.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);
    setStatus("");

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        visibility,
        questions: parsedQuestions,
      };

      const response = await fetch("/api/quizzes/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create quiz.");
      }

      setStatus("Quiz created successfully.");
      console.log("Created quiz", data);

      setTitle("");
      setDescription("");
      setVisibility("private");
      setRawText("");
      setParsedQuestions([]);
      setParseErrors([]);
      setPoints(1);
    } catch (error) {
      setStatus(error.message || "Something went wrong while saving quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-quiz-page">
      <div className="bulk-quiz-container">
        <h1 className="bulk-quiz-heading">Bulk Quiz Import</h1>
        <p className="bulk-quiz-subheading">
          Paste questions in the required format, preview them, then save the quiz.
        </p>

        <form onSubmit={handleSubmit} className="bulk-quiz-form">
          <div className="bulk-quiz-section">
            <label className="bulk-quiz-label">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="bulk-quiz-input"
            />
          </div>

          <div className="bulk-quiz-section">
            <label className="bulk-quiz-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              rows={3}
              className="bulk-quiz-textarea bulk-quiz-textarea-small"
            />
          </div>

          <div className="bulk-quiz-row">
            <div className="bulk-quiz-field bulk-quiz-field-grow">
              <label className="bulk-quiz-label">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="bulk-quiz-input"
              >
                <option value="private">private</option>
                <option value="unlisted">unlisted</option>
                <option value="public">public</option>
              </select>
            </div>

            <div className="bulk-quiz-field bulk-quiz-field-points">
              <label className="bulk-quiz-label">Points</label>
              <input
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="bulk-quiz-input"
              />
            </div>
          </div>

          <div className="bulk-quiz-section">
            <label className="bulk-quiz-label">Required Format</label>
            <pre className="bulk-quiz-example-box">{exampleFormat}</pre>
          </div>

          <div className="bulk-quiz-section">
            <label className="bulk-quiz-label">Paste Questions</label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your formatted questions here..."
              rows={18}
              className="bulk-quiz-textarea bulk-quiz-textarea-large"
            />
          </div>

          <div className="bulk-quiz-button-row">
            <button
              type="button"
              onClick={handleParse}
              className="bulk-quiz-button"
            >
              Parse Questions
            </button>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`bulk-quiz-button bulk-quiz-button-primary ${
                !canSubmit ? "bulk-quiz-button-disabled" : ""
              }`}
            >
              {loading ? "Saving..." : "Create Quiz"}
            </button>
          </div>
        </form>

        {status && <div className="bulk-quiz-status">{status}</div>}

        {parseErrors.length > 0 && (
          <div className="bulk-quiz-error-box">
            <h3 className="bulk-quiz-error-heading">Parse Errors</h3>
            <ul className="bulk-quiz-list">
              {parseErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {parsedQuestions.length > 0 && (
          <div className="bulk-quiz-preview-section">
            <h2 className="bulk-quiz-preview-heading">
              Preview ({parsedQuestions.length} question
              {parsedQuestions.length !== 1 ? "s" : ""})
            </h2>

            {parsedQuestions.map((question, index) => (
              <div key={index} className="bulk-quiz-question-card">
                <h3 className="bulk-quiz-question-title">
                  {index + 1}. {question.text}
                </h3>

                <ul className="bulk-quiz-list">
                  {question.choices.map((choice, choiceIndex) => (
                    <li key={choiceIndex} className="bulk-quiz-choice-item">
                      {choice.text}{" "}
                      {choice.isCorrect && (
                        <strong className="bulk-quiz-correct-badge">✓ Correct</strong>
                      )}
                    </li>
                  ))}
                </ul>

                <p className="bulk-quiz-points-text">Points: {question.points}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkQuizImportPage;