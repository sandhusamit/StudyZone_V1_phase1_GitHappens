import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/CreateQuiz.css";

import { useAuth } from "../contexts/AuthContext.jsx";
import { validateQuiz } from "../utils/QuizValidation.js";

import Step1QuizInfo from "../components/CreateQuiz/Steps/Step1/Step1QuizInfo.jsx";
import Step2BuildQuestions from "../components/CreateQuiz/Steps/Step2/Step2BuildQuestions.jsx";
import Step3QuestionPool from "../components/CreateQuiz/Steps/Step3/Step3QuestionPool.jsx";

/* ========================================================
   FACTORIES
======================================================== */

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeMatrix = (label = "A", rowCount = 2, columnCount = 2) => ({
  label,
  matrixType: rowCount === columnCount ? "square" : "rectangular",
  rows: Array.from({ length: rowCount }, () => Array(columnCount).fill(0)),
  rowCount,
  columnCount,
  dividerIndex: null,
});

const isMatrixAnswer = (answer) =>
  answer && typeof answer === "object" && Array.isArray(answer.rows);

const makeMcqQuestion = () => ({
  questionModel: "Question",
  questionType: "mcq",
  text: "",
  choices: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  points: 1,
  explanation: "",
  subject: "General",
});

const makeDdqQuestion = () => {
  const box1 = makeId("box");
  const box2 = makeId("box");

  return {
    questionModel: "Question",
    questionType: "ddq",
    text: "",
    points: 1,
    explanation: "",
    subject: "General",
    dragItems: [{ id: makeId("item"), text: "", dropboxId: box1 }],
    dropboxes: [
      { id: box1, title: "" },
      { id: box2, title: "" },
    ],
  };
};

const makeMatrixQuestion = () => ({
  questionModel: "MatrixQuestion",
  questionType: "addition",
  title: "Matrix Addition",
  prompt: "",
  points: 1,
  explanation: "",
  subject: "Math",
  difficulty: "easy",
  answerMode: "single",
  matrices: [makeMatrix("A"), makeMatrix("B")],
  expectedAnswers: [makeMatrix("Answer")],
});

/* ========================================================
   COMPONENT
======================================================== */

export default function CreateQuiz() {
  const navigate = useNavigate();

  const { newQuiz, createQuestion, createMatrixQuestion, fetchQuestions } =
    useAuth();

  /* ========================================================
     STATE
  ======================================================== */

  const [step, setStep] = useState(1);
  const [rotationClicked, setRotationClicked] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    visibility: "private",
    rotation: 0,
    questions: [],
  });

  const [questionPool, setQuestionPool] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);

  const [stepValid, setStepValid] = useState(false);

  /* ========================================================
     LOAD QUESTION POOL
  ======================================================== */

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setPoolLoading(true);
        setPoolError("");

        const data = await fetchQuestions?.();
        setQuestionPool(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load question pool:", err);
        setPoolError("Failed to load question pool.");
      } finally {
        setPoolLoading(false);
      }
    };

    loadQuestions();
  }, [fetchQuestions]);

  /* ========================================================
     AUTO ROTATION
  ======================================================== */

  useEffect(() => {
    if (!rotationClicked) {
      updateQuizField("rotation", quizData.questions.length);
    }
  }, [quizData.questions.length, rotationClicked]);

  /* ========================================================
     GENERAL QUIZ HELPERS
  ======================================================== */

  const updateQuizField = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateQuestionField = (qIndex, field, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];

      questions[qIndex] = {
        ...questions[qIndex],
        [field]: value,
      };

      return {
        ...prev,
        questions,
      };
    });
  };

  const removeQuestion = (qIndex) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  const appendQuestion = (newQuestion) => {
    setQuizData((prev) => {
      const questions = [...prev.questions, newQuestion];

      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? questions.length
            : prev.rotation,
        questions,
      };
    });
  };

  /* ========================================================
     ADD QUESTION HELPERS
  ======================================================== */

  const addMcqQuestion = () => appendQuestion(makeMcqQuestion());

  const addDdqQuestion = () => appendQuestion(makeDdqQuestion());

  const addMatrixQuestion = () => appendQuestion(makeMatrixQuestion());

  const handleBulkImport = (importedQuestions) => {
    setQuizData((prev) => {
      const questions = [...prev.questions, ...importedQuestions];

      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? questions.length
            : prev.rotation,
        questions,
      };
    });

    setShowBulkImport(false);
  };

  /* ========================================================
     MCQ HELPERS
  ======================================================== */

  const addChoice = (qIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.choices = [
        ...(question.choices || []),
        { text: "", isCorrect: false },
      ];

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const removeChoice = (qIndex, cIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.choices = question.choices.filter((_, i) => i !== cIndex);

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const updateChoiceText = (qIndex, cIndex, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.choices = question.choices.map((choice, i) =>
        i === cIndex ? { ...choice, text: value } : choice
      );

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.choices = question.choices.map((choice, i) => ({
        ...choice,
        isCorrect: i === cIndex,
      }));

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  /* ========================================================
     DDQ HELPERS
  ======================================================== */

  const addDragItem = (qIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const defaultBoxId = question.dropboxes?.[0]?.id || "";

      question.dragItems = [
        ...(question.dragItems || []),
        {
          id: makeId("item"),
          text: "",
          dropboxId: defaultBoxId,
        },
      ];

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const removeDragItem = (qIndex, itemIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.dragItems = question.dragItems.filter((_, i) => i !== itemIndex);

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const updateDragItemText = (qIndex, itemIndex, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.dragItems = question.dragItems.map((item, i) =>
        i === itemIndex ? { ...item, text: value } : item
      );

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const updateDragItemDropbox = (qIndex, itemIndex, dropboxId) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.dragItems = question.dragItems.map((item, i) =>
        i === itemIndex ? { ...item, dropboxId } : item
      );

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const addDropBox = (qIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.dropboxes = [
        ...(question.dropboxes || []),
        { id: makeId("box"), title: "" },
      ];

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const removeDropBox = (qIndex, boxIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      if (question.dropboxes.length <= 1) return prev;

      const removedBoxId = question.dropboxes[boxIndex].id;
      const dropboxes = question.dropboxes.filter((_, i) => i !== boxIndex);
      const fallbackId = dropboxes[0]?.id || "";

      question.dropboxes = dropboxes;
      question.dragItems = question.dragItems.map((item) => ({
        ...item,
        dropboxId:
          item.dropboxId === removedBoxId ? fallbackId : item.dropboxId,
      }));

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  const updateDropBoxTitle = (qIndex, boxIndex, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      question.dropboxes = question.dropboxes.map((box, i) =>
        i === boxIndex ? { ...box, title: value } : box
      );

      questions[qIndex] = question;
      return { ...prev, questions };
    });
  };

  /* ========================================================
     MATRIX QUESTION HELPERS
     These edit q.matrices[]
  ======================================================== */

  const updateMatrixAt = (qIndex, matrixIndex, updater) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const matrices = [...(question.matrices || [])];
      const matrix = { ...matrices[matrixIndex] };

      matrices[matrixIndex] = updater(matrix);

      question.matrices = matrices;
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const addRow = (qIndex, matrixIndex, value = 1) => {
    updateMatrixAt(qIndex, matrixIndex, (matrix) => {
      const rows = matrix.rows.map((row) => [...row]);

      for (let i = 0; i < value; i++) {
        rows.push(Array(matrix.columnCount).fill(0));
      }

      return {
        ...matrix,
        rows,
        rowCount: rows.length,
      };
    });
  };

  const removeRow = (qIndex, matrixIndex, rowIndex) => {
    updateMatrixAt(qIndex, matrixIndex, (matrix) => {
      if (matrix.rowCount <= 1) return matrix;

      const rows = matrix.rows
        .filter((_, i) => i !== rowIndex)
        .map((row) => [...row]);

      return {
        ...matrix,
        rows,
        rowCount: rows.length,
      };
    });
  };

  const addColumn = (qIndex, matrixIndex, value = 1) => {
    updateMatrixAt(qIndex, matrixIndex, (matrix) => {
      const rows = matrix.rows.map((row) => [
        ...row,
        ...Array(value).fill(0),
      ]);

      return {
        ...matrix,
        rows,
        columnCount: rows[0]?.length || 0,
      };
    });
  };

  const removeColumn = (qIndex, matrixIndex, colIndex) => {
    updateMatrixAt(qIndex, matrixIndex, (matrix) => {
      if (matrix.columnCount <= 1) return matrix;

      const rows = matrix.rows.map((row) =>
        row.filter((_, i) => i !== colIndex)
      );

      const columnCount = rows[0]?.length || 0;

      return {
        ...matrix,
        rows,
        columnCount,
        dividerIndex:
          matrix.dividerIndex && matrix.dividerIndex >= columnCount
            ? null
            : matrix.dividerIndex,
      };
    });
  };

  const addMatrix = (qIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const matrices = [...(question.matrices || [])];

      const base = matrices[0] || { rowCount: 2, columnCount: 2 };

      matrices.push(
        makeMatrix(
          String.fromCharCode(65 + matrices.length),
          base.rowCount,
          base.columnCount
        )
      );

      question.matrices = matrices;
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const removeMatrix = (qIndex, matrixIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const matrices = [...(question.matrices || [])];

      if (matrices.length <= 1) return prev;

      question.matrices = matrices.filter((_, i) => i !== matrixIndex);
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const updateMatrixLabel = (qIndex, mIndex, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const matrices = [...(question.matrices || [])];

      matrices[mIndex] = {
        ...matrices[mIndex],
        label: value,
      };

      question.matrices = matrices;
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const getDuplicateMatrixLabels = (answerMatrices = [], matrices = []) => {
    const counts = {};

    matrices.forEach((m) => {
      const key = m.label?.trim().toUpperCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });

    answerMatrices.filter(isMatrixAnswer).forEach((a) => {
      const key = a.label?.trim().toUpperCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).filter((key) => counts[key] > 1);
  };

  /* ========================================================
     MATRIX ANSWER HELPERS
     These edit q.expectedAnswers[]
  ======================================================== */

  const updateExpectedAnswerAt = (qIndex, answerIndex, updater) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const expectedAnswers = [...(question.expectedAnswers || [])];
      const currentAnswer = expectedAnswers[answerIndex];

      expectedAnswers[answerIndex] = updater(currentAnswer);

      question.expectedAnswers = expectedAnswers;
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const addExpectedAnswerMatrix = (qIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const expectedAnswers = [...(question.expectedAnswers || [])];

      const matrixAnswers = expectedAnswers.filter(isMatrixAnswer);

      const base =
        matrixAnswers[0] ||
        question.matrices?.[0] ||
        { rowCount: 2, columnCount: 2 };

      expectedAnswers.push(
        makeMatrix(
          `Answer ${matrixAnswers.length + 1}`,
          base.rowCount,
          base.columnCount
        )
      );

      question.expectedAnswers = expectedAnswers;
      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const removeExpectedAnswerMatrix = (qIndex, answerIndex) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIndex] };

      const expectedAnswers = [...(question.expectedAnswers || [])];

      if (expectedAnswers.length <= 1) return prev;

      question.expectedAnswers = expectedAnswers.filter(
        (_, i) => i !== answerIndex
      );

      questions[qIndex] = question;

      return { ...prev, questions };
    });
  };

  const updateExpectedAnswerLabel = (qIndex, answerIndex, value) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
      if (!isMatrixAnswer(answer)) return answer;

      return {
        ...answer,
        label: value,
      };
    });
  };

  const addAnswerRow = (qIndex, answerIndex, value = 1) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
      if (!isMatrixAnswer(answer)) return answer;

      const rows = answer.rows.map((row) => [...row]);

      for (let i = 0; i < value; i++) {
        rows.push(Array(answer.columnCount).fill(0));
      }

      return {
        ...answer,
        rows,
        rowCount: rows.length,
      };
    });
  };

  const removeAnswerRow = (qIndex, answerIndex, rowIndex) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
      if (!isMatrixAnswer(answer)) return answer;
      if (answer.rowCount <= 1) return answer;

      const rows = answer.rows
        .filter((_, i) => i !== rowIndex)
        .map((row) => [...row]);

      return {
        ...answer,
        rows,
        rowCount: rows.length,
      };
    });
  };

  const addAnswerColumn = (qIndex, answerIndex, value = 1) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
      if (!isMatrixAnswer(answer)) return answer;

      const rows = answer.rows.map((row) => [
        ...row,
        ...Array(value).fill(0),
      ]);

      return {
        ...answer,
        rows,
        columnCount: rows[0]?.length || 0,
      };
    });
  };

  const removeAnswerColumn = (qIndex, answerIndex, colIndex) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
      if (!isMatrixAnswer(answer)) return answer;
      if (answer.columnCount <= 1) return answer;

      const rows = answer.rows.map((row) =>
        row.filter((_, i) => i !== colIndex)
      );

      const columnCount = rows[0]?.length || 0;

      return {
        ...answer,
        rows,
        columnCount,
        dividerIndex:
          answer.dividerIndex && answer.dividerIndex >= columnCount
            ? null
            : answer.dividerIndex,
      };
    });
  };

  /* ========================================================
     QUESTION POOL HELPERS
  ======================================================== */

  const getQuestionKey = (q) => `${q.questionModel || "Question"}:${q._id}`;

  const selectedPoolIds = useMemo(
    () =>
      new Set(
        quizData.questions
          .filter((q) => q._id)
          .map((q) => getQuestionKey(q))
      ),
    [quizData.questions]
  );

  const addQuestionFromPool = (question) => {
    const normalizedQuestion = {
      ...question,
      questionModel: question.questionModel || "Question",
    };

    if (selectedPoolIds.has(getQuestionKey(normalizedQuestion))) return;

    appendQuestion(normalizedQuestion);
  };

  const removePoolQuestionFromQuiz = (questionId) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q._id !== questionId),
    }));
  };

  /* ========================================================
     SUBMIT HELPERS
  ======================================================== */

  const createQuestionByModel = async (q) => {
    if (q._id) {
      return {
        questionId: q._id,
        questionModel: q.questionModel || "Question",
      };
    }

    const { questionModel = "Question", ...questionPayload } = q;

    let created;

    if (questionModel === "Question") {
      created = await createQuestion(questionPayload);
    }

    if (questionModel === "MatrixQuestion") {
      created = await createMatrixQuestion(questionPayload);
    }

    if (!created?._id) {
      throw new Error(`Failed to create ${questionModel}`);
    }

    return {
      questionId: created._id,
      questionModel,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateQuiz(quizData)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const quizQuestionRefs = await Promise.all(
        quizData.questions.map((q) => createQuestionByModel(q))
      );

      if (quizQuestionRefs.length !== quizData.questions.length) {
        setSubmitError("Some questions failed to create.");
        setSubmitting(false);
        return;
      }

      const payload = {
        title: quizData.title.trim(),
        description: quizData.description.trim(),
        visibility: quizData.visibility,
        rotation: Number(quizData.rotation) || 0,
        questions: quizQuestionRefs,
      };

      const createdQuiz = await newQuiz(payload);

      if (createdQuiz?.hasError || !createdQuiz?._id) {
        setSubmitError(createdQuiz?.message || "Quiz creation failed.");
        setSubmitting(false);
        return;
      }

      setCreatedQuizId(createdQuiz._id);
      setStep(4);
    } catch (err) {
      console.error("Failed to create quiz:", err);
      setSubmitError(err?.message || "Failed to create quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ========================================================
     HANDLER BUNDLE FOR CHILD CARDS
  ======================================================== */

  const questionHandlers = {
    addMcqQuestion,
    addDdqQuestion,
    addMatrixQuestion,

    updateQuestionField,
    removeQuestion,

    addChoice,
    removeChoice,
    updateChoiceText,
    setCorrectChoice,

    addDragItem,
    removeDragItem,
    updateDragItemText,
    updateDragItemDropbox,
    addDropBox,
    removeDropBox,
    updateDropBoxTitle,

    addRow,
    removeRow,
    addColumn,
    removeColumn,
    addMatrix,
    removeMatrix,
    updateMatrixLabel,
    getDuplicateMatrixLabels,

    addExpectedAnswerMatrix,
    removeExpectedAnswerMatrix,
    updateExpectedAnswerLabel,
    addAnswerRow,
    removeAnswerRow,
    addAnswerColumn,
    removeAnswerColumn,
  };

  /* ========================================================
     UI
  ======================================================== */

  return (
    <div className="create-quiz-page">
      <div className="cq-container">
        <h1 className="cq-title">Create Quiz</h1>

        <div className="cq-steps">
          <button
            type="button"
            className={`cq-step ${step === 1 ? "active" : ""}`}
            onClick={() => setStep(1)}
          >
            1. Quiz Info
          </button>

          <button
            type="button"
            disabled={!stepValid}
            className={`cq-step ${step === 2 ? "active" : ""}`}
            onClick={() => setStep(2)}
          >
            2. Build Questions
          </button>

          <button
            type="button"
            disabled={!stepValid}
            className={`cq-step ${step === 3 ? "active" : ""}`}
            onClick={() => setStep(3)}
          >
            3. Question Pool
          </button>

          <button
            type="button"
            className={`cq-step ${step === 4 ? "active" : ""}`}
            disabled={!createdQuizId}
          >
            4. Complete
          </button>

          <div className="cq-rotation-row">
            <label className="cq-label">Rotation</label>
            <input
              type="number"
              min="0"
              className="cq-input small"
              value={quizData.rotation}
              onChange={(e) => {
                setRotationClicked(true);
                updateQuizField("rotation", Number(e.target.value));
              }}
              placeholder="0 = all questions"
            />
          </div>
        </div>

        <div className="cq-questions-row">
          <label className="cq-label">Total Questions</label>
          <input
            title="Total number of questions in quiz"
            type="number"
            min="0"
            className="cq-input small"
            value={quizData.questions.length}
            readOnly
            placeholder="0 = all questions"
          />
        </div>

        <form onSubmit={handleSubmit} className="cq-form">
          {step === 1 && (
            <section className="cq-section">
              <Step1QuizInfo
                quizData={quizData}
                updateQuizField={updateQuizField}
                stepValid={stepValid}
                setStepValid={setStepValid}
              />

              <div className="cq-nav">
                <button
                  title="Next Step"
                  type="button"
                  disabled={!stepValid}
                  className="cq-btn"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </section>
          )}

          {step === 2 && (
            <Step2BuildQuestions
              quizData={quizData}
              handlers={questionHandlers}
              removePoolQuestionFromQuiz={removePoolQuestionFromQuiz}
              setStep={setStep}
              showBulkImport={showBulkImport}
              setShowBulkImport={setShowBulkImport}
              handleBulkImport={handleBulkImport}
            />
          )}

          {step === 3 && (
            <Step3QuestionPool
              quizData={quizData}
              removePoolQuestionFromQuiz={removePoolQuestionFromQuiz}
              setStep={setStep}
              questionPool={questionPool}
              poolLoading={poolLoading}
              poolError={poolError}
              selectedPoolIds={selectedPoolIds}
              addQuestionFromPool={addQuestionFromPool}
              submitError={submitError}
              submitting={submitting}
              removeQuestion={removeQuestion}
            />
          )}

          {step === 4 && (
            <section className="cq-section">
              <h2>Quiz Created</h2>
              <p>Your quiz was created successfully.</p>

              <div className="cq-nav">
                <button
                  type="button"
                  className="cq-btn primary-btn"
                  onClick={() => navigate(`/play/${createdQuizId}`)}
                >
                  Play Quiz
                </button>

                <button
                  title="Back to Quizzes"
                  type="button"
                  className="cq-btn"
                  onClick={() => navigate("/quizlist")}
                >
                  Back to Quizzes
                </button>
              </div>
            </section>
          )}
        </form>
      </div>
    </div>
  );
}