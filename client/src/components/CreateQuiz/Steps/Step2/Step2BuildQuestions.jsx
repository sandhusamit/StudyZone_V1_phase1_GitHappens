import BulkQuestionImportPanel from "../../../BulkImport/BulkQuizImportPanel.jsx";
import NewQuestionCard from "./NewQuestionCard.jsx";

export default function Step2BuildQuestions({
    quizData, handlers, removePoolQuestionFromQuiz, setStep, showBulkImport, setShowBulkImport, handleBulkImport,

    }) {
    const { updateQuestionField, updateChoiceText, setCorrectChoice, updateDragItemText, updateDragItemDropbox, updateDropBoxTitle,
        addDragItem, removeDragItem, addDropBox, removeDropBox,
        addChoice, removeChoice, addMcqQuestion, addDdqQuestion, removeQuestion
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
        />

        <div className="cq-nav">
        <button type="button" className="cq-btn" onClick={() => setStep(1)}>
            Back
        </button>

        <button title="Next Step" type="button" className="cq-btn" onClick={() => setStep(3)}>
            Next
        </button>
        </div>
    </section>
    );
}

    
