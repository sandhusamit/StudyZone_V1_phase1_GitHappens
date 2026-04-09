import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/CreateQuiz.css";
import { useAuth } from "../contexts/AuthContext.jsx";
import { validateQuiz } from "../utils/QuizValidation.js";
import Step1QuizInfo from "../components/CreateQuiz/Steps/Step1QuizInfo.jsx";
import Step2BuildQuestions from "../components/CreateQuiz/Steps/Step2/Step2BuildQuestions.jsx";
import Step3QuestionPool from "../components/CreateQuiz/Steps/Step3/Step3QuestionPool.jsx";

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeMcqQuestion = () => ({
  text: "",
  choices: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  points: 1,
  explanation: "",
  subject: "General",
  questionType: "mcq",
});

const makeDdqQuestion = () => {
  const box1 = makeId("box");
  const box2 = makeId("box");

  return {
    text: "",
    points: 1,
    explanation: "",
    subject: "General",
    questionType: "ddq",
    dragItems: [{ id: makeId("item"), text: "", dropboxId: box1 }],
    dropboxes: [
      { id: box1, title: "" },
      { id: box2, title: "" },
    ],
  };
};

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { newQuiz, createQuestion, fetchQuestions } = useAuth();

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

  useEffect(() => {
    
    if (!rotationClicked) {
      updateQuizField("rotation", quizData.questions.length);
    }
  }, [quizData.questions.length]);




  const selectedPoolIds = useMemo(
    () => new Set(quizData.questions.filter((q) => q._id).map((q) => q._id)),
    [quizData.questions]
  );

  const updateQuizField = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addMcqQuestion = () => {
    setQuizData((prev) => {
      const nextQuestions = [...prev.questions, makeMcqQuestion()];
      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? nextQuestions.length
            : prev.rotation,
        questions: nextQuestions,
      };
    });
  };

  const addDdqQuestion = () => {
    setQuizData((prev) => {
      const nextQuestions = [...prev.questions, makeDdqQuestion()];
      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? nextQuestions.length
            : prev.rotation,
        questions: nextQuestions,
      };
    });
  };

  const handleBulkImport = (importedQuestions) => {
    setQuizData((prev) => {
      const nextQuestions = [...prev.questions, ...importedQuestions];
      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? nextQuestions.length
            : prev.rotation,
        questions: nextQuestions,
      };
    });

    setShowBulkImport(false);
  };

  const removeQuestion = (qIndex) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  const updateQuestionField = (qIndex, field, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[qIndex] = {
        ...updatedQuestions[qIndex],
        [field]: value,
      };
      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  // MCQ helpers
  const addChoice = (qIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        choices: [...question.choices, { text: "", isCorrect: false }],
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const removeChoice = (qIndex, cIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        choices: question.choices.filter((_, i) => i !== cIndex),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const updateChoiceText = (qIndex, cIndex, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        choices: question.choices.map((choice, i) =>
          i === cIndex ? { ...choice, text: value } : choice
        ),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        choices: question.choices.map((choice, i) => ({
          ...choice,
          isCorrect: i === cIndex,
        })),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  // DDQ helpers
  const addDragItem = (qIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];
      const defaultBoxId = question.dropboxes[0]?.id || "";

      updatedQuestions[qIndex] = {
        ...question,
        dragItems: [
          ...question.dragItems,
          {
            id: makeId("item"),
            text: "",
            dropboxId: defaultBoxId,
          },
        ],
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const removeDragItem = (qIndex, itemIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        dragItems: question.dragItems.filter((_, i) => i !== itemIndex),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const updateDragItemText = (qIndex, itemIndex, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        dragItems: question.dragItems.map((item, i) =>
          i === itemIndex ? { ...item, text: value } : item
        ),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const updateDragItemDropbox = (qIndex, itemIndex, dropboxId) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        dragItems: question.dragItems.map((item, i) =>
          i === itemIndex ? { ...item, dropboxId } : item
        ),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const addDropBox = (qIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        dropboxes: [
          ...question.dropboxes,
          {
            id: makeId("box"),
            title: "",
          },
        ],
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const removeDropBox = (qIndex, boxIndex) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      if (question.dropboxes.length <= 1) {
        return prev;
      }

      const removedBoxId = question.dropboxes[boxIndex].id;
      const newDropboxes = question.dropboxes.filter((_, i) => i !== boxIndex);
      const fallbackId = newDropboxes[0]?.id || "";

      updatedQuestions[qIndex] = {
        ...question,
        dropboxes: newDropboxes,
        dragItems: question.dragItems.map((item) => ({
          ...item,
          dropboxId: item.dropboxId === removedBoxId ? fallbackId : item.dropboxId,
        })),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  const updateDropBoxTitle = (qIndex, boxIndex, value) => {
    setQuizData((prev) => {
      const updatedQuestions = [...prev.questions];
      const question = updatedQuestions[qIndex];

      updatedQuestions[qIndex] = {
        ...question,
        dropboxes: question.dropboxes.map((box, i) =>
          i === boxIndex ? { ...box, title: value } : box
        ),
      };

      return {
        ...prev,
        questions: updatedQuestions,
      };
    });
  };

  // Pool helpers
  const addQuestionFromPool = (question) => {
    if (selectedPoolIds.has(question._id)) return;

    setQuizData((prev) => {
      const nextQuestions = [...prev.questions, question];
      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? nextQuestions.length
            : prev.rotation,
        questions: nextQuestions,
      };
    });
  };

  const removePoolQuestionFromQuiz = (questionId) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q._id !== questionId),
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuiz(quizData)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      console.log("quizData before submit:", quizData);

      const createdQuestionIds = await Promise.all(
        quizData.questions.map(async (q, index) => {
          if (q._id) return q._id;

          console.log("creating question:", index, q);
          const created = await createQuestion(q);
          console.log("created question response:", index, created);

          return created?._id;
        })
      );

      console.log("createdQuestionIds:", createdQuestionIds);

      const validQuestionIds = createdQuestionIds.filter(
        (id) => typeof id === "string" && id.trim() !== ""
      );

      if (validQuestionIds.length !== quizData.questions.length) {
        setSubmitError(
          "Some questions failed to create. Check your backend question route for DDQ support."
        );
        setSubmitting(false);
        return;
      }

      const payload = {
        title: quizData.title.trim(),
        description: quizData.description.trim(),
        visibility: quizData.visibility,
        rotation: Number(quizData.rotation) || 0,
        questions: validQuestionIds,
      };

      console.log("quiz payload:", payload);

      const createdQuiz = await newQuiz(payload);
      console.log("created quiz response:", createdQuiz);

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

  const questionHandlers = {
  addMcqQuestion,
  addDdqQuestion,
  updateQuestionField,
  updateChoiceText,
  setCorrectChoice,
  updateDragItemText,
  updateDragItemDropbox,
  updateDropBoxTitle,
  removeQuestion,
  addChoice,
  removeChoice,
  addDragItem,
  removeDragItem,
  addDropBox,
  removeDropBox,
  
  };



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
            disabled={stepValid === false}
            className={`cq-step ${step === 2 ? "active" : ""}`}
            onClick={() => setStep(2)}
          >
            2. Build Questions
          </button>

          <button
            type="button"
            disabled={stepValid === false}
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
          <div className="step1-container">
            {step === 1 && (
              <section className="cq-section">
                <Step1QuizInfo quizData={quizData} updateQuizField={updateQuizField} stepValid={stepValid} setStepValid={setStepValid} />



                <div className="cq-nav">
                  <button title="Next Step" type="button" disabled={!stepValid} className="cq-btn" onClick={() => setStep(2)}>
                    Next
                  </button>
                </div>
              </section>
            )}
          </div>

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
