import { useState } from "react";
import { createQuestion } from "../services/question";
import { useAuth } from "../contexts/AuthContext";
import "/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/pages/styles/CreateQuiz.css";
import { Navigate } from "react-router-dom";

export default function CreateQuiz() {
  const { newQuiz, authUserId } = useAuth();

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: []
  });

  const authorId = authUserId;

  const handleChange = (e) => {
    setQuizData({ ...quizData, [e.target.name]: e.target.value });
  };

  const addQuestion = () => {
    setQuizData({
      ...quizData,
      questions: [
        ...quizData.questions,
        {
          text: "",
          points: 1,
          choices: [{ text: "", isCorrect: false }]
        }
      ]
    });
  };

  const updateQuestion = (index, e) => {
    const updated = [...quizData.questions];
    updated[index][e.target.name] = e.target.value;
    setQuizData({ ...quizData, questions: updated });
  };

  const addChoice = (qIndex) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices.push({ text: "", isCorrect: false });
    setQuizData({ ...quizData, questions: updated });
  };

  const updateChoiceText = (qIndex, cIndex, value) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices[cIndex].text = value;
    setQuizData({ ...quizData, questions: updated });
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices.forEach((c, i) => (c.isCorrect = i === cIndex));
    setQuizData({ ...quizData, questions: updated });
  };

  const removeQuestion = (index) => {
    const updated = [...quizData.questions];
    updated.splice(index, 1);
    setQuizData({ ...quizData, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const created = await Promise.all(
        quizData.questions.map((q) => createQuestion(q))
      );

      const payload = {
        title: quizData.title,
        description: quizData.description,
        author: authorId,
        questions: created.map((q) => q._id)
      };

      const result = await newQuiz(payload);

      if (result?.hasError) {
        alert("Failed to create quiz.");
        return;
      }

      alert("Quiz created successfully!");
      <Navigate to="/quizzes" replace={true} />;
    } catch (err) {
      alert("Server error.");
    }
  };

  return (
    <section className="cq-container">
      <h2 className="cq-title">Create Quiz</h2>

      <form onSubmit={handleSubmit} className="cq-form">

        {/* TITLE */}
        <label>Quiz Title</label>
        <input
          type="text"
          name="title"
          value={quizData.title}
          onChange={handleChange}
          className="cq-input"
          required
        />

        {/* DESCRIPTION */}
        <label>Description</label>
        <textarea
          name="description"
          value={quizData.description}
          onChange={handleChange}
          className="cq-textarea"
        />

        {/* ADD QUESTION BUTTON */}
        <button type="button" onClick={addQuestion} className="cq-btn add-btn">
          + Add Question
        </button>

        {/* QUESTIONS LIST */}
        {quizData.questions.map((q, qIndex) => (
          <div className="cq-question-card" key={qIndex}>
            <div className="cq-q-header">
              <h4>Question {qIndex + 1}</h4>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="cq-btn danger-btn"
              >
                Remove
              </button>
            </div>

            <label>Question Text</label>
            <input
              type="text"
              name="text"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, e)}
              className="cq-input"
              required
            />

            <label>Points</label>
            <input
              type="number"
              name="points"
              min="1"
              value={q.points}
              onChange={(e) => updateQuestion(qIndex, e)}
              className="cq-input small"
            />

            {/* CHOICES */}
            <h5>Choices</h5>

            {q.choices.map((choice, cIndex) => (
              <div className="cq-choice" key={cIndex}>
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) => updateChoiceText(qIndex, cIndex, e.target.value)}
                  className="cq-input choice-input"
                  required
                />

                <label className="cq-radio">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={choice.isCorrect}
                    onChange={() => setCorrectChoice(qIndex, cIndex)}
                  />
                  Correct
                </label>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addChoice(qIndex)}
              className="cq-btn add-choice-btn"
            >
              + Add Choice
            </button>
          </div>
        ))}

        {/* SUBMIT */}
        <button type="submit" className="cq-btn submit-btn">
          Create Quiz
        </button>
      </form>
    </section>
  );
}
