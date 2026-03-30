import { useLocation, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './styles/QuizPlay.css';
import { useAuth } from '../contexts/AuthContext';
import DragDropQuestionCard from "./DragDropQuestion";

export default function PlayQuiz() {
  const { quizId } = useParams();
  const { state } = useLocation();
  const [quiz, setQuiz] = useState(state?.quiz || null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const [roster, setRoster] = useState([]);
  const { isLoading, fetchQuiz } = useAuth();

  useEffect(() => {
    if (!quiz) {
      const loadQuiz = async () => {
        const data = await fetchQuiz(quizId);
        if (data) {
          setQuiz(data);
        } else {
          alert("Failed to load quiz. Please try again later.");
        }
      };

      if (!isLoading) loadQuiz();
    }
  }, [quiz, quizId, isLoading, fetchQuiz]);

  useEffect(() => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return;

    const rotationCount =
      quiz.rotation && quiz.rotation > 0
        ? Math.min(quiz.rotation, quiz.questions.length)
        : quiz.questions.length;

    const randomQuestions = getRandomQuestions(quiz.questions, rotationCount);
    setRoster(randomQuestions);
  }, [quiz]);

  if (!quiz) return <p>Loading...</p>;

  const handleSelect = (qIndex, choiceIndex) => {
    if (score) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: choiceIndex }));
  };

  const handleSubmit = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    const reviewResults = roster.map((q, index) => {
      totalPoints += q.points;

      if (q.questionType === "mcq") {
        const selectedIndex = answers[index];
        const correctIndex = q.choices.findIndex((choice) => choice.isCorrect);

        const isCorrect =
          selectedIndex !== undefined && selectedIndex === correctIndex;

        if (isCorrect) {
          earnedPoints += q.points;
        }

        return {
          questionIndex: index,
          questionType: "mcq",
          questionText: q.text,
          selectedIndex,
          correctIndex,
          isCorrect,
          points: q.points,
          choices: q.choices,
        };
      }

      if (q.questionType === "ddq") {
        const placed = answers[index] || {};
        let correctCount = 0;
        let wrongCount = 0;

        (q.dropboxes || []).forEach((box) => {
          const items = placed[box.id] || [];
          items.forEach((item) => {
            if (item.dropboxId === box.id) correctCount++;
            else wrongCount++;
          });
        });

        const totalItems = (q.dragItems || []).length;
        const isCorrect = correctCount === totalItems && wrongCount === 0;

        if (isCorrect) {
          earnedPoints += q.points;
        }

        return {
          questionIndex: index,
          questionType: "ddq",
          questionText: q.text,
          isCorrect,
          correctCount,
          wrongCount,
          totalItems,
          placedItems: placed,
          points: q.points,
        };
      }

      return {
        questionIndex: index,
        questionType: q.questionType,
        questionText: q.text,
        isCorrect: false,
        points: q.points,
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

  function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  return (
    <div className="play-quiz-container">
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>

      <div className="play-quiz-meta">
        <span className="play-quiz-progress">
          Questions this round: {roster.length}
        </span>
      </div>

    {roster.map((q, qIndex) => {
      const result = results[qIndex];

      return (
        <div key={q._id || qIndex} className="play-question-card">
          <h3
            style={{
              whiteSpace: "pre-wrap",
              color: result ? (result.isCorrect ? "green" : "red") : "inherit",
            }}
          >
            {qIndex + 1}. {q.text}
          </h3>

          <h4>Points: {q.points}</h4>
          <h5>Subject: {q.subject}</h5>

          {q.questionType === "mcq" && (
            <>
              <ul>
                {q.choices.map((choice, cIndex) => (
                  <li key={cIndex} className={getChoiceClass(qIndex, cIndex)}>
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
                  <p><strong>You got this wrong.</strong></p>
                  <p>
                    Your answer:{" "}
                    {result.selectedIndex !== undefined
                      ? q.choices[result.selectedIndex]?.text
                      : "No answer selected"}
                  </p>
                  <p>
                    Correct answer: {q.choices[result.correctIndex]?.text}
                  </p>
                  <p>
                    Explanation: {q.explanation || "No explanation provided."}
                  </p>
                </div>
              )}

              {score && result && result.isCorrect && (
                <div className="question-feedback correct-feedback">
                  <p><strong>Correct.</strong></p>
                </div>
              )}
            </>
          )}

      {q.questionType === "ddq" && (
        <DragDropQuestionCard
          question={q}
          value={answers[qIndex] || {}}
          onChange={(placedItems) =>
            setAnswers((prev) => ({
              ...prev,
              [qIndex]: placedItems,
            }))
          }
          showResults={!!score}
          disabled={!!score}
        />
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