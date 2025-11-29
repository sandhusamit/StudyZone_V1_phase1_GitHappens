import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./styles/QuizPlay.css";

export default function PlayQuiz() {
  const { quizId } = useParams();
  const { state } = useLocation();
  const [quiz, setQuiz] = useState(state?.quiz || null);
  const [answers, setAnswers] = useState({}); // track selected choice per question
  const [score, setScore] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!quiz) {
      const fetchQuiz = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error("Failed to fetch quiz");

          const data = await res.json();
          setQuiz(data);
        } catch (err) {
          console.error("Error fetching quiz:", err);
        }
      };

      fetchQuiz();
    }
  }, [quiz, quizId]);

  if (!quiz) return <p>Loading...</p>;

  const handleSelect = (qIndex, choiceIndex) => {
    setAnswers(prev => ({ ...prev, [qIndex]: choiceIndex }));
  };

  const handleSubmit = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach((q, index) => {
      totalPoints += q.points;
      const selected = answers[index];
      if (selected !== undefined && q.choices[selected]?.isCorrect) {
        earnedPoints += q.points;
      }
    });

    setScore({ earned: earnedPoints, total: totalPoints });
  };

  return (
    <div className="play-quiz-container">
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>

      {quiz.questions.map((q, qIndex) => (
        <div key={q._id || qIndex} className="play-question-card">
          <h3>{q.text}</h3>
          <ul>
            {q.choices.map((choice, cIndex) => (
              <li key={cIndex}>
                <label>
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    checked={answers[qIndex] === cIndex}
                    onChange={() => handleSelect(qIndex, cIndex)}
                  />
                  {choice.text}
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {score ? (
        <div className="quiz-score">
          <h2>Score: {score.earned} / {score.total}</h2>
        </div>
      ) : (
        <button onClick={handleSubmit}>Submit Quiz</button>
      )}
    </div>
  );
}
