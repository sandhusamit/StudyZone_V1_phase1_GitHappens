import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./styles/QuizPlay.css";
import { useAuth } from "../contexts/AuthContext";
import DragDropQuestionCard from "../components/PlayQuiz/DDQ/DragDropQuestion.jsx";

export default function PlayQuiz() {
  const { quizId } = useParams();
  const location = useLocation();
  const guestToken = useMemo(
    () => new URLSearchParams(location.search).get("guestToken"),
    [location.search]
  );

  const { fetchQuiz, fetchGuestQuiz, authLoading } = useAuth();

  const [quiz, setQuiz] = useState(location.state?.quiz ?? null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const [roster, setRoster] = useState([]);

  /* ========================================================
     SAFE QUIZ LOADER (NO RACE CONDITIONS)
  ======================================================== */
  useEffect(() => {
    if (authLoading || !quizId || quiz) return;

    let alive = true;

    const load = async () => {
      try {
        const data = guestToken
          ? await fetchGuestQuiz(quizId, guestToken)
          : await fetchQuiz(quizId);

        const quizData = data?.quiz ?? data;

        if (!alive || !quizData) return;

        setQuiz(quizData);
      } catch (err) {
        console.error("Quiz load failed:", err);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [quizId, guestToken, authLoading, fetchQuiz, fetchGuestQuiz, quiz]);

  /* ========================================================
     SAFE ROSTER GENERATION (NO CRASH ON BAD DATA)
  ======================================================== */
  useEffect(() => {
    if (!quiz?.questions?.length) return;

    const questions = quiz.questions;

    const count =
      typeof quiz.rotation === "number" && quiz.rotation > 0
        ? Math.min(quiz.rotation, questions.length)
        : questions.length;

    const shuffled = [...questions]
      .map((q) => ({ ...q, _r: Math.random() }))
      .sort((a, b) => a._r - b._r)
      .map(({ _r, ...q }) => q);

    setRoster(shuffled.slice(0, count));
  }, [quiz]);

  /* ========================================================
     GUARDS
  ======================================================== */
  if (authLoading || !quiz) return <p>Loading quiz...</p>;

  /* ========================================================
     ANSWER HANDLER
  ======================================================== */
  const handleSelect = (qIndex, choiceIndex) => {
    if (score) return;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: choiceIndex,
    }));
  };

  /* ========================================================
     SAFE GRADING ENGINE
  ======================================================== */
  const handleSubmit = () => {
    let earned = 0;

    const review = roster.map((q, index) => {
      const result = {
        isCorrect: false,
        selectedIndex: undefined,
        correctIndex: undefined,
        explanation: q.explanation || "",
        points: q.points || 0,
        questionType: q.questionType,
      };

      /* ================= MCQ ================= */
      const selectedIndex = answers[index];

      const correctIndex = q.choices?.findIndex((c) => c?.isCorrect);
      const selectedChoice = q.choices?.[selectedIndex];
      const correctChoice = q.choices?.[correctIndex];

      const isCorrect =
        selectedIndex !== undefined &&
        correctIndex !== -1 &&
        selectedIndex === correctIndex;

      result.selectedIndex = selectedIndex;
      result.correctIndex = correctIndex;

      result.selectedText = selectedChoice?.text || "No answer selected";
      result.correctText = correctChoice?.text || "Missing correct answer";

      result.isCorrect = isCorrect;

      /* ================= DDQ ================= */
      if (q.questionType === "ddq") {
        const placed = answers[index] || {};
        const dragItems = q.dragItems || [];

        let correct = 0;
        let wrong = 0;

        (q.dropboxes || []).forEach((box) => {
          (placed[box.id] || []).forEach((item) => {
            if (item?.dropboxId === box.id) correct++;
            else wrong++;
          });
        });

        const isCorrect =
          dragItems.length > 0 &&
          correct === dragItems.length &&
          wrong === 0;

        result.isCorrect = isCorrect;

        if (isCorrect) earned += result.points;
      }

      return result;
    });

    setResults(review);

    setScore({
      earned,
      total: roster.reduce((sum, q) => sum + (q.points || 0), 0),
    });
  };

  /* ========================================================
     MCQ CLASS HELPER (SAFE)
  ======================================================== */
  const getChoiceClass = (qIndex, cIndex) => {
    if (!score) return "";

    const result = results[qIndex];
    if (!result) return "";

    const correct = result.correctIndex;
    const selected = result.selectedIndex;

    if (cIndex === correct) return "correct";

    if (cIndex === selected && selected !== correct) return "wrong";

    return "";
  };

  /* ========================================================
     UI
  ======================================================== */
  return (
    <div className="play-quiz-container">
      <h1>{quiz?.title}</h1>
      <p>{quiz?.description}</p>

      <div className="play-quiz-meta">
        <span>Questions: {roster.length}</span>
      </div>

      {roster.map((q, qIndex) => {
        const result = results[qIndex];

        return (
          <div key={q._id || qIndex} className="play-question-card">
            <h3>
              {qIndex + 1}. {q.text}
            </h3>

            <h4>Points: {q.points || 0}</h4>

            {/* ================= MCQ ================= */}
            {q.questionType === "mcq" && (
              <ul>
                {(q.choices || []).map((choice, cIndex) => {
                  const selected = answers[qIndex] === cIndex;

                  return (
                    <li
                      key={cIndex}
                      className={[
                        selected ? "selected" : "",
                        getChoiceClass(qIndex, cIndex),
                      ].join(" ")}
                    >
                      <label>
                        <input
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={selected}
                          onChange={() => handleSelect(qIndex, cIndex)}
                          disabled={!!score}
                        />
                        {choice?.text}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* ================= DDQ ================= */}
            {q.questionType === "ddq" && (
              <DragDropQuestionCard
                question={q}
                value={answers[qIndex] || {}}
                onChange={(val) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [qIndex]: val,
                  }))
                }
                disabled={!!score}
                result={result}
                showResults={!!score}

              />
            )}

            {/* ================= FEEDBACK ================= */}
            {result && (
              <div className={`feedback-card ${result.isCorrect ? "correct" : "wrong"}`}>

                <div className="feedback-header">
                  <span className="status">
                    {result.isCorrect ? "✅ Correct" : "❌ Incorrect"}
                  </span>
                  <span className="points">
                    +{result.isCorrect ? result.points : 0} pts
                  </span>
                </div>

                {/* YOU */}
                <div className="feedback-row">
                  <span className="label">Your Answer</span>
                  <span className={result.isCorrect ? "good" : "bad"}>
                    {result.selectedText}
                  </span>
                </div>

                {/* CORRECT */}
                {!result.isCorrect && (
                  <div className="feedback-row">
                    <span className="label">Correct Answer</span>
                    <span className="good">{result.correctText}</span>
                  </div>
                )}

                {/* EXPLANATION */}
                {result.explanation && (
                  <div className="feedback-explanation">
                    🧠 {result.explanation}
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}

      {/* ================= SCORE / SUBMIT ================= */}
      {score ? (
        <div className="quiz-score">
          <h2>
            Score: {score.earned} / {score.total}
          </h2>
        </div>
      ) : (
        <button onClick={handleSubmit}>Submit Quiz</button>
      )}
    </div>
  );
}