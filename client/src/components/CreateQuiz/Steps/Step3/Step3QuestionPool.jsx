import React, { useState } from "react";
import QuestionPool from "./QuestionPool";
import SelectedQuestions from "./SelectedQuestions"; // renamed from DisplayQuestion

export default function Step3QuestionPool({
  quizData,
  removePoolQuestionFromQuiz,
  setStep,
  questionPool,
  poolLoading,
  poolError,
  selectedPoolIds,
  addQuestionFromPool,
  submitError,
  submitting,
  removeQuestion,
}) {
  const [showPool, setShowPool] = useState(false);

  const togglePool = () => setShowPool((prev) => !prev);

  return (
    <section className="cq-section">
      {/* 🔹 Header */}
      <div className="cq-toolbar">
        <h2>Question Pool</h2>

        <button
          type="button"
          className="cq-btn"
          onClick={togglePool}
        >
          {showPool ? "Hide Question Pool" : "Show Question Pool"}
        </button>
      </div>

      {/* 🔹 Question Pool (kept mounted for performance) */}
      <div
        className={`cq-pool-container ${showPool ? "open" : "closed"}`}
        style={{ display: showPool ? "block" : "none" }}
      >
        <QuestionPool
          questionPool={questionPool}
          poolLoading={poolLoading}
          poolError={poolError}
          selectedPoolIds={selectedPoolIds}
          addQuestionFromPool={addQuestionFromPool}
        />
      </div>

      {/* 🔹 Selected Questions */}
      <SelectedQuestions
        quizData={quizData}
        submitError={submitError}
        submitting={submitting}
        setStep={setStep}
        removePoolQuestionFromQuiz={removePoolQuestionFromQuiz}
        removeQuestion={removeQuestion}
      />
    </section>
  );
}