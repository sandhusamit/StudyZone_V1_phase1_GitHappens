import "./styles/CreateQuiz.css";
// Hooks
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useMemo, useState } from "react";
import { useQuestionBuilder } from "../utils/Hooks/useQuestionBuilder.js";

// Helpers 
import { validateQuiz } from "../utils/ErrorManagement/QuizValidation.js";


// Components
import Step1QuizInfo from "../components/CreateQuiz/Steps/Step1/Step1QuizInfo.jsx";
import Step2BuildQuestions from "../components/CreateQuiz/Steps/Step2/Step2BuildQuestions.jsx";
import Step3QuestionPool from "../components/CreateQuiz/Steps/Step3/Step3QuestionPool.jsx";



/* ======================================================== 
   COMPONENT
======================================================== */

export default function CreateQuiz() {

  /* ========================================================
     STATE
  ======================================================== */

  const [step, setStep] = useState(1);
  const [rotationClicked, setRotationClicked] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const [questionPool, setQuestionPool] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [poolError, setPoolError] = useState("");

  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);

  const [stepValid, setStepValid] = useState(false);

  /* ========================================================
    Component Hooks
  ======================================================== */
  const navigate = useNavigate();

  const { newQuiz, createQuestion, createMatrixQuestion, fetchQuestions } =
    useAuth();

  const {
    quizData,
    setQuizData,
    updateQuizField,
    updateQuestionField,
    removeQuestion,
    appendQuestion,
    addMcqQuestion,
    addDdqQuestion,
    addMatrixQuestion,
    handleBulkImport,
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
    updateMatrixAt,
    addRow,
    removeRow,
    addColumn,
    removeColumn,
    addMatrix,
    removeMatrix,
    updateMatrixLabel,
    getDuplicateMatrixLabels,
    updateExpectedAnswerAt,
    addExpectedAnswerMatrix,
    removeExpectedAnswerMatrix,
    updateExpectedAnswerLabel,
    addAnswerRow,
    removeAnswerRow,
    addAnswerColumn,
    removeAnswerColumn
  } = useQuestionBuilder(rotationClicked, setRotationClicked, showBulkImport, setShowBulkImport);
  


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