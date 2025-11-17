import { useState } from "react";

export default function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    questions: []
  });

  const authorId = "6913d683591679b7a4d7af58"; // replace with logged-in user

  // ---------------------------
  // Handle title + description
  // ---------------------------
  const handleChange = (e) => {
    setQuizData({
      ...quizData,
      [e.target.name]: e.target.value
    });
  };

  // ---------------------------
  // Add new empty question
  // ---------------------------
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

  // ---------------------------
  // Update question text/points
  // ---------------------------
  const updateQuestion = (index, e) => {
    const updated = [...quizData.questions];
    updated[index][e.target.name] = e.target.value;
    setQuizData({ ...quizData, questions: updated });
  };

  // ---------------------------
  // Add choice to a question
  // ---------------------------
  const addChoice = (qIndex) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices.push({ text: "", isCorrect: false });
    setQuizData({ ...quizData, questions: updated });
  };

  // ---------------------------
  // Update a choice's text
  // ---------------------------
  const updateChoiceText = (qIndex, cIndex, value) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices[cIndex].text = value;
    setQuizData({ ...quizData, questions: updated });
  };

  // ---------------------------
  // Mark correct choice
  // ---------------------------
  const setCorrectChoice = (qIndex, cIndex) => {
    const updated = [...quizData.questions];
    updated[qIndex].choices.forEach((c, i) => (c.isCorrect = i === cIndex));
    setQuizData({ ...quizData, questions: updated });
  };

  // ---------------------------
  // Remove a question
  // ---------------------------
  const removeQuestion = (index) => {
    const updated = [...quizData.questions];
    updated.splice(index, 1);
    setQuizData({ ...quizData, questions: updated });
  };

  // ---------------------------
  // SUBMIT
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Create each Question in the backend
      const createdQuestionIds = [];

      for (const q of quizData.questions) {
        const resQ = await fetch("http://localhost:3000/api/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(q)
        });

        const dataQ = await resQ.json();
        createdQuestionIds.push(dataQ._id);
      }

      // 2. Create Quiz using those Question IDs
      const payload = {
        title: quizData.title,
        description: quizData.description,
        author: authorId,
        questions: createdQuestionIds
      };

      console.log("🔥 SENDING QUESTION PAYLOAD:", {
        text: payload.text,
        choices: payload.choices,
        points: payload.points,
      });
      
      const response = await fetch("http://localhost:3000/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("Quiz created successfully!");
      } else {
        console.error("Failed to create quiz");
      }
    } catch (err) {

      console.error("Error submitting quiz:", err);
    }
  };

  // ==========================
  // RENDER UI
  // ==========================
  return (
    <section style={{ margin: "2rem" }}>
      <h2>Create Quiz</h2>
      <form onSubmit={handleSubmit}>
        {/* ------- Title ------- */}
        <label>Quiz Title:</label>
        <input
          type="text"
          name="title"
          value={quizData.title}
          onChange={handleChange}
          required
        />
        <br /><br />

        {/* ------- Description ------- */}
        <label>Description:</label>
        <textarea
          name="description"
          value={quizData.description}
          onChange={handleChange}
        />
        <br /><br />

        {/* ------- Questions ------- */}
        <button type="button" onClick={addQuestion}>
          Add Question
        </button>

        {quizData.questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: "1px solid #aaa", padding: "1rem", marginTop: "1rem" }}>
            <h4>Question {qIndex + 1}</h4>

            <label>Text:</label>
            <input
              type="text"
              name="text"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, e)}
              required
            />

            <br /><br />

            <label>Points:</label>
            <input
              type="number"
              name="points"
              value={q.points}
              onChange={(e) => updateQuestion(qIndex, e)}
              min="1"
            />

            <br /><br />

            {/* ------- Choices ------- */}
            <h5>Choices</h5>

            {q.choices.map((choice, cIndex) => (
              <div key={cIndex}>
                <input
                  type="text"
                  value={choice.text}
                  onChange={(e) =>
                    updateChoiceText(qIndex, cIndex, e.target.value)
                  }
                  required
                />

                {/* Radio button for correct answer */}
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={choice.isCorrect}
                  onChange={() => setCorrectChoice(qIndex, cIndex)}
                />
                Correct
              </div>
            ))}

            <button type="button" onClick={() => addChoice(qIndex)}>
              Add Choice
            </button>

            <br /><br />
            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              style={{ background: "red", color: "white" }}
            >
              Remove Question
            </button>
          </div>
        ))}

        <br />
        <button type="submit">Create Quiz</button>
      </form>
    </section>
  );
}
