import BulkQuestionImportPanel from "../../../BulkImport/Panel/BulkQuizImportPanel.jsx";
import NewQuestionCard from "./NewQuestionCard.jsx";

export default function Step2BuildQuestions({
  quizData,
  handlers,
  removePoolQuestionFromQuiz,
  setStep,
  showBulkImport,
  setShowBulkImport,
  handleBulkImport,
}) {
  const {
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
  } = handlers;

  return (
    <section className="cq-section">
      <div className="cq-toolbar">
        <h2>Build Questions</h2>

        <div className="cq-toolbar-actions">
          <button
            type="button"
            className="cq-btn add-choice-btn"
            onClick={addMcqQuestion}
          >
            + Add MCQ
          </button>

          <button
            type="button"
            className="cq-btn add-choice-btn"
            onClick={addDdqQuestion}
          >
            + Add DDQ
          </button>

          <button
            type="button"
            className="cq-btn add-choice-btn"
            onClick={addMatrixQuestion}
          >
            + Add Matrix
          </button>

          <button
            type="button"
            className="cq-btn add-choice-btn"
            onClick={() => setShowBulkImport((prev) => !prev)}
          >
            {showBulkImport ? "Hide Bulk Import" : "+ Bulk Import MCQs"}
          </button>
        </div>
      </div>

      {showBulkImport && (
        <BulkQuestionImportPanel
          onImport={handleBulkImport}
          onClose={() => setShowBulkImport(false)}
        />
      )}

      {quizData.questions.length === 0 && (
        <p className="cq-empty">No questions added yet.</p>
      )}

      <NewQuestionCard
        quizData={quizData}
        updateQuestionField={updateQuestionField}
        updateChoiceText={updateChoiceText}
        setCorrectChoice={setCorrectChoice}
        updateDragItemText={updateDragItemText}
        updateDragItemDropbox={updateDragItemDropbox}
        updateDropBoxTitle={updateDropBoxTitle}
        removePoolQuestionFromQuiz={removePoolQuestionFromQuiz}
        removeQuestion={removeQuestion}
        addDragItem={addDragItem}
        removeDragItem={removeDragItem}
        addDropBox={addDropBox}
        removeDropBox={removeDropBox}
        addChoice={addChoice}
        removeChoice={removeChoice}
        addRow={addRow}
        addColumn={addColumn}
        removeRow={removeRow}
        removeColumn={removeColumn}
        addAnswerRow={addAnswerRow}
        addAnswerColumn={addAnswerColumn}
        removeAnswerRow={removeAnswerRow}
        removeAnswerColumn={removeAnswerColumn}
        addMatrix={addMatrix}
        removeMatrix={removeMatrix}
        updateMatrixLabel={updateMatrixLabel}
        getDuplicateMatrixLabels={getDuplicateMatrixLabels}
        addExpectedAnswerMatrix={addExpectedAnswerMatrix}
        removeExpectedAnswerMatrix={removeExpectedAnswerMatrix}
        updateExpectedAnswerLabel={updateExpectedAnswerLabel}
      />

      <div className="cq-nav">
        <button type="button" className="cq-btn" onClick={() => setStep(1)}>
          Back
        </button>

        <button
          title="Next Step"
          type="button"
          className="cq-btn"
          onClick={() => setStep(3)}
        >
          Next
        </button>
      </div>
    </section>
  );
}