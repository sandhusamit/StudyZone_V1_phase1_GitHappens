import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './styles/QuizPlay.css';
import { useAuth } from '../contexts/AuthContext';

export default function PlayQuiz() {
  const { quizId } = useParams();
  const { state } = useLocation();
  const [quiz, setQuiz] = useState(state?.quiz || null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const { isLoading } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!quiz) {
      const fetchQuiz = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) throw new Error('Failed to fetch quiz');

          const data = await res.json();
          setQuiz(data);
        } catch (err) {
          console.error('Error fetching quiz:', err);
        }
      };

      if (!isLoading) fetchQuiz();
    }
  }, [quiz, quizId, isLoading]);

  if (!quiz) return <p>Loading...</p>;

  const handleSelect = (qIndex, choiceIndex) => {
    if (score) return; // lock answers after submit
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIndex }));
  };

  const handleSubmit = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    const reviewResults = quiz.questions.map((q, index) => {
      totalPoints += q.points;

      const selectedIndex = answers[index];
      const correctIndex = q.choices.findIndex((choice) => choice.isCorrect);

      const isCorrect =
        selectedIndex !== undefined &&
        selectedIndex === correctIndex;

      if (isCorrect) {
        earnedPoints += q.points;
      }

      return {
        questionIndex: index,
        questionText: q.text,
        selectedIndex,
        correctIndex,
        isCorrect,
        points: q.points,
        choices: q.choices,
      };
    });

    setResults(reviewResults);
    setScore({ earned: earnedPoints, total: totalPoints });
  };

  const getChoiceClass = (qIndex, cIndex) => {
    if (!score) return '';

    const result = results[qIndex];
    if (!result) return '';

    if (cIndex === result.correctIndex) {
      return 'correct';
    }

    if (
      cIndex === result.selectedIndex &&
      result.selectedIndex !== result.correctIndex
    ) {
      return 'wrong';
    }

    return '';
  };

  return (
    <div className="play-quiz-container">
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>

      {quiz.questions.map((q, qIndex) => {
        const result = results[qIndex];

        return (
          <div key={q._id || qIndex} className="play-question-card">
            <h3>{qIndex + 1}. {q.text}</h3>

            <ul>
              {q.choices.map((choice, cIndex) => (
                <li
                  key={cIndex}
                  className={getChoiceClass(qIndex, cIndex)}
                >
                  <label>
                    <input
                      type="radio"
                      name={`question-${qIndex}`}
                      checked={answers[qIndex] === cIndex}
                      onChange={() => handleSelect(qIndex, cIndex)}
                      disabled={!!score}
                    />
                    {choice.text}
                  </label>
                </li>
              ))}
            </ul>

            {score && result && !result.isCorrect && (
              <div className="question-feedback wrong-feedback">
                <p>
                  <strong>You got this wrong.</strong>
                </p>
                <p>
                  Your answer:{" "}
                  {result.selectedIndex !== undefined
                    ? q.choices[result.selectedIndex]?.text
                    : "No answer selected"}
                </p>
                <p>
                  Correct answer: {q.choices[result.correctIndex]?.text}
                </p>
              </div>
            )}

            {score && result && result.isCorrect && (
              <div className="question-feedback correct-feedback">
                <p>
                  <strong>Correct.</strong>
                </p>
              </div>
            )}
          </div>
        );
      })}

      {score ? (
        <div className="quiz-score">
          <h2>
            Score: {score.earned} / {score.total}
          </h2>
          <p>Review the highlighted questions below.</p>
        </div>
      ) : (
        <button onClick={handleSubmit}>Submit Quiz</button>
      )}
    </div>
  );
}