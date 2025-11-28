import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/EditQuiz.css";

export default function EditQuiz() {
  const { state } = useLocation();  
  const navigate = useNavigate();
  const { updateQuiz, createQuestion, updateQuestion } = useAuth();

  const selectedQuiz = state?.quiz;

  const [title, setTitle] = useState(selectedQuiz?.title || "");
  const [description, setDesc] = useState(selectedQuiz?.description || "");
  const [questions, setQuestions] = useState(
    selectedQuiz?.questions || []
  );

  if (!selectedQuiz) return <p>No quiz found.</p>;

  /** Add a new question */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        points: 1,
        choices: [{ text: "", isCorrect: false }]
      }
    ]);
  };

  /** Add a new choice to a question */
  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  /** Update question text */
  const handleQuestionChange = (index, newValue) => {
    const updated = [...questions];
    updated[index].text = newValue;
    setQuestions(updated);
  };

  /** Update points for a question */
  const handlePointsChange = (index, newValue) => {
    const updated = [...questions];
    updated[index].points = parseInt(newValue, 10);
    setQuestions(updated);
  };

  /** Update choice text */
  const handleChoiceChange = (qIndex, cIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex].text = newText;
    setQuestions(updated);
  };

  /** Mark a choice as correct (single correct enforced) */
  const handleCorrectChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices = updated[qIndex].choices.map((c, i) => ({
      ...c,
      isCorrect: i === cIndex
    }));
    setQuestions(updated);
  };

  /** Remove a choice */
  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    if (updated[qIndex].choices.length > 1) {
      updated[qIndex].choices.splice(cIndex, 1);
      setQuestions(updated);
    }
  };

  /** Remove a question */
  const removeQuestion = (qIndex) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  /** Update quiz in backend */
  const handleUpdate = async () => {
    try {
      const questionIds = await Promise.all(
        questions.map(async (q) => {
          if (q._id) {
            // Existing question → update it
            await updateQuestion(q._id, q);
            return q._id;
          } else {
            // New question → create it
            const created = await createQuestion(q);
            return created._id;
          }
        })
      );
  
      const updatedQuiz = {
        ...selectedQuiz,
        title,
        description,
        questions: questionIds,
      };
  
      console.log("Updating quiz with data:", updatedQuiz);
  
      const response = await updateQuiz(selectedQuiz._id, updatedQuiz);
  
      if (!response.error) {
        navigate("/quizlist");
      } else {
        console.error("Update failed:", response.message);
      }
    } catch (err) {
      console.error("Error while updating quiz:", err);
    }
  };

  return (
    <section className="edit-quiz-container">
      <h2>Edit Quiz</h2>

      <label>Quiz Title</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDesc(e.target.value)} />

      <h3>Questions</h3>

      {questions.map((q, qIndex) => (
        <div key={q._id || qIndex} className="question-input">
          <input
            type="text"
            placeholder={`Question ${qIndex + 1}`}
            value={q.text}
            onChange={e => handleQuestionChange(qIndex, e.target.value)}
          />
          <input
            type="number"
            value={q.points}
            min="1"
            onChange={e => handlePointsChange(qIndex, e.target.value)}
          />

          <h4>Choices</h4>
          {q.choices.map((choice, cIndex) => (
            <div key={cIndex} className="choice-input">
              <input
                type="text"
                placeholder={`Choice ${cIndex + 1}`}
                value={choice.text}
                onChange={e => handleChoiceChange(qIndex, cIndex, e.target.value)}
              />
              <label>
                Correct
                <input
                  type="checkbox"
                  checked={choice.isCorrect}
                  onChange={() => handleCorrectChoice(qIndex, cIndex)}
                />
              </label>
              <button type="button" onClick={() => removeChoice(qIndex, cIndex)}>
                Remove Choice
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addChoice(qIndex)}>
            Add Choice
          </button>
          <button type="button" onClick={() => removeQuestion(qIndex)}>
            Remove Question
          </button>
        </div>
      ))}

      <button onClick={addQuestion}>Add Question</button>
      <button onClick={handleUpdate}>Save Changes</button>
      <button onClick={() => navigate("/quizlist")}>Cancel</button>
    </section>
  );
}
