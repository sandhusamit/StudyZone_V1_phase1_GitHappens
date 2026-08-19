import "./styles/QuizPlay.css";

// Hooks
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { useGuestLogin } from "../utils/Hooks/GuestLogin.js";
import { useAuth } from "../contexts/AuthContext";

// Components
import QuestionPlaycard from "../components/PlayQuiz/QuestionPlaycard";
import GuestLoginCard from "../components/Login/GuestLoginCard.jsx";

export default function QuizPlay() {
  const { quizId } = useParams();
  const location = useLocation();
  const { handleGuestLogin } = useGuestLogin();

  const accessToken = useMemo(
    () => new URLSearchParams(location.search).get("access"),
    [location.search]
  );

  const {
    fetchQuiz,
    authLoading,
    createScore,
    isGuestLoggedIn,
    isLoggedIn,
  } = useAuth();

  const [quiz, setQuiz] = useState(location.state?.quiz ?? null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [results, setResults] = useState([]);
  const [roster, setRoster] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [accessError, setAccessError] = useState(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const quizStartedAtRef = useRef(null);

  const canPlay = isLoggedIn || isGuestLoggedIn;

  /* ========================================================
     STOPWATCH
  ======================================================== */
  useEffect(() => {
    quizStartedAtRef.current = null;
    setElapsedSeconds(0);
  }, [quizId]);

  useEffect(() => {
    if (!canPlay || pageLoading || !quiz || accessError || score) {
      return;
    }

    if (quizStartedAtRef.current === null) {
      quizStartedAtRef.current = Date.now();
    }

    const updateStopwatch = () => {
      const elapsedMilliseconds =
        Date.now() - quizStartedAtRef.current;

      setElapsedSeconds(
        Math.floor(elapsedMilliseconds / 1000)
      );
    };

    updateStopwatch();

    const intervalId = window.setInterval(
      updateStopwatch,
      1000
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [canPlay, pageLoading, quiz, accessError, score]);

  /* ========================================================
     LOAD QUIZ ONLY AFTER AUTH/GUEST LOGIN
  ======================================================== */
  useEffect(() => {
    if (authLoading || !quizId || !canPlay) {
      setPageLoading(false);
      return;
    }

    let alive = true;

    const load = async () => {
      try {
        setPageLoading(true);
        setAccessError(null);

        const data = await fetchQuiz(quizId, accessToken);

        if (!alive) return;

        if (data?.hasError) {
          setQuiz(null);
          setAccessError(
            data.message ||
              "You are not allowed to access this quiz."
          );
          return;
        }

        const quizData = data?.quiz ?? data;

        if (!quizData) {
          setQuiz(null);
          setAccessError("Quiz not found.");
          return;
        }

        setQuiz(quizData);
      } catch (err) {
        console.error("Quiz load failed:", err);

        if (alive) {
          setQuiz(null);
          setAccessError("Quiz load failed.");
        }
      } finally {
        if (alive) {
          setPageLoading(false);
        }
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, [
    quizId,
    accessToken,
    authLoading,
    isLoggedIn,
    isGuestLoggedIn,
    fetchQuiz,
    canPlay,
  ]);

  /* ========================================================
     ROSTER
  ======================================================== */
  const unwrapQuestion = (item) => {
    const q = item.questionId || item;

    return {
      ...q,
      questionModel:
        item.questionModel ||
        q.questionModel ||
        "Question",
    };
  };

  useEffect(() => {
    if (!quiz?.questions?.length) {
      setRoster([]);
      return;
    }

    const questions = quiz.questions.map(unwrapQuestion);

    const count =
      typeof quiz.rotation === "number" &&
      quiz.rotation > 0
        ? Math.min(quiz.rotation, questions.length)
        : questions.length;

    const shuffled = [...questions]
      .map((q) => ({
        ...q,
        _r: Math.random(),
      }))
      .sort((a, b) => a._r - b._r)
      .map(({ _r, ...q }) => q);

    setRoster(shuffled.slice(0, count));
  }, [quiz]);

  /* ========================================================
     ANSWERS
  ======================================================== */
  const handleSelect = (qIndex, choiceIndex) => {
    if (score) return;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: choiceIndex,
    }));
  };

  /* ========================================================
     SCORE SUBMISSION
  ======================================================== */
  const submitScore = async (scoreData) => {
    const data = await createScore(scoreData);

    if (!data) {
      console.error(
        "Score submission failed: no response"
      );
      return;
    }

    if (data.hasError) {
      console.error(
        "Score submission failed:",
        data.message
      );
      return;
    }

    console.log(
      "Score submitted successfully:",
      data
    );
  };

  /* ========================================================
     GRADING ENGINE
  ======================================================== */
  const handleSubmit = () => {
    if (quizStartedAtRef.current !== null) {
      const elapsedMilliseconds =
        Date.now() - quizStartedAtRef.current;

      setElapsedSeconds(
        Math.floor(elapsedMilliseconds / 1000)
      );
    }

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

      let isCorrect = false;

      /* ================= MCQ ================= */
      if (q.questionType === "mcq") {
        const selectedIndex = answers[index];

        const correctIndex =
          q.choices?.findIndex(
            (choice) => choice?.isCorrect
          );

        const selectedChoice =
          q.choices?.[selectedIndex];

        const correctChoice =
          q.choices?.[correctIndex];

        isCorrect =
          selectedIndex !== undefined &&
          correctIndex !== -1 &&
          selectedIndex === correctIndex;

        result.selectedIndex = selectedIndex;
        result.correctIndex = correctIndex;

        result.selectedText =
          selectedChoice?.text ||
          "No answer selected";

        result.correctText =
          correctChoice?.text ||
          "Missing correct answer";

        if (isCorrect) {
          earned += result.points;
        }
      }

      /* ================= DDQ ================= */
      if (q.questionType === "ddq") {
        const placed = answers[index] || {};
        const dragItems = q.dragItems || [];

        let correct = 0;
        let wrong = 0;

        (q.dropboxes || []).forEach((box) => {
          (placed[box.id] || []).forEach(
            (item) => {
              if (item?.dropboxId === box.id) {
                correct++;
              } else {
                wrong++;
              }
            }
          );
        });

        isCorrect =
          dragItems.length > 0 &&
          correct === dragItems.length &&
          wrong === 0;

        if (isCorrect) {
          earned += result.points;
        }
      }

      /* ================= MATRIX ================= */
      if (q.questionModel === "MatrixQuestion") {
        const expectedAnswers =
          q.expectedAnswers ||
          (q.expectedAnswer
            ? [q.expectedAnswer]
            : []);

        const userAnswers = answers[index] || [];

        const isMatrixAnswer = (answer) =>
          answer &&
          typeof answer === "object" &&
          Array.isArray(answer.rows);

        const isScalarAnswer = (answer) =>
          typeof answer === "number";

        const compareMatrix = (
          expectedMatrix,
          userMatrix
        ) => {
          if (
            !expectedMatrix?.rows ||
            !Array.isArray(userMatrix)
          ) {
            return false;
          }

          return expectedMatrix.rows.every(
            (row, rowIndex) =>
              row.every(
                (value, columnIndex) =>
                  Number(
                    userMatrix?.[rowIndex]?.[
                      columnIndex
                    ]
                  ) === Number(value)
              )
          );
        };

        const compareScalar = (
          expectedScalar,
          userScalar
        ) => {
          return (
            userScalar !== undefined &&
            userScalar !== "" &&
            Number(userScalar) ===
              Number(expectedScalar)
          );
        };

        isCorrect =
          expectedAnswers.length > 0 &&
          expectedAnswers.every(
            (expected, answerIndex) => {
              const userAnswer =
                userAnswers?.[answerIndex];

              if (isScalarAnswer(expected)) {
                return compareScalar(
                  expected,
                  userAnswer
                );
              }

              if (isMatrixAnswer(expected)) {
                return compareMatrix(
                  expected,
                  userAnswer
                );
              }

              return false;
            }
          );

        result.expectedAnswers =
          expectedAnswers;

        result.userAnswers = userAnswers;

        if (isCorrect) {
          earned += result.points;
        }
      }

      result.isCorrect = isCorrect;

      return result;
    });

    setResults(review);

    const total = roster.reduce(
      (sum, question) =>
        sum + (question.points || 0),
      0
    );

    const percentage =
      total > 0
        ? Math.max(
            0,
            Math.min(1, earned / total)
          )
        : 0;

    setScore({
      earned,
      total,
    });

    submitScore({
      quizId,
      score: percentage,
    });
  };

  /* ========================================================
     UI HELPERS
  ======================================================== */
  const getChoiceClass = (
    qIndex,
    cIndex
  ) => {
    if (!score) return "";

    const result = results[qIndex];

    if (!result) return "";

    const correct = result.correctIndex;
    const selected = result.selectedIndex;

    if (cIndex === correct) {
      return "correct";
    }

    if (
      cIndex === selected &&
      selected !== correct
    ) {
      return "wrong";
    }

    return "";
  };

  const formatElapsedTime = (
    totalSeconds
  ) => {
    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    const paddedMinutes = String(
      minutes
    ).padStart(2, "0");

    const paddedSeconds = String(
      seconds
    ).padStart(2, "0");

    if (hours > 0) {
      const paddedHours = String(
        hours
      ).padStart(2, "0");

      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    }

    return `${paddedMinutes}:${paddedSeconds}`;
  };

  /* ========================================================
     UI STATES
  ======================================================== */
  const redirectTo = `/play/${quizId}${
    accessToken
      ? `?access=${encodeURIComponent(
          accessToken
        )}`
      : ""
  }`;

  if (authLoading) {
    return <p>Checking login...</p>;
  }

  if (!canPlay) {
    return (
      <div className="ParentContainer">
        <GuestLoginCard
          onGuestLogin={handleGuestLogin}
          redirectTo={redirectTo}
        />
      </div>
    );
  }

  if (pageLoading) {
    return <p>Loading quiz...</p>;
  }

  if (accessError) {
    return (
      <div className="ParentContainer">
        <h2>Access denied</h2>
        <p>{accessError}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="ParentContainer">
        <h2>Quiz not found</h2>
      </div>
    );
  }

  /* ========================================================
     UI
  ======================================================== */
  return (
    <div className="ParentContainer">
      <div className="play-quiz-container">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>

        <div className="play-quiz-meta">
          <span>
            Questions: {roster.length}
          </span>

          <span
            className="quiz-stopwatch"
            role="timer"
            aria-label={`Elapsed time ${formatElapsedTime(
              elapsedSeconds
            )}`}
          >
            Time:{" "}
            {formatElapsedTime(
              elapsedSeconds
            )}
          </span>
        </div>

        {roster.map((q, qIndex) => {
          const result = results[qIndex];

          return (
            <QuestionPlaycard
              key={q._id || qIndex}
              q={q}
              qIndex={qIndex}
              answers={answers}
              setAnswers={setAnswers}
              result={result}
              getChoiceClass={
                getChoiceClass
              }
              handleSelect={handleSelect}
              disabled={!!score}
            />
          );
        })}

        {score ? (
          <div className="quiz-score">
            <h2>
              Score: {score.earned} /{" "}
              {score.total}
            </h2>
            <h2>
              Time: {formatElapsedTime(
                elapsedSeconds
              )}
            </h2>
          </div>
        ) : (
          <button onClick={handleSubmit}>
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}