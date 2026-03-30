import DDQ_Display from "./DDQ_Display";
import MCQ_Display from "./MCQ_Display";

export default function SelectedQuestions({ quizData, submitError, submitting, setStep, removePoolQuestionFromQuiz, removeQuestion }) {
    return (
        <div className="cq-selected-pool">
            <h3>Questions in This Quiz</h3>

            {quizData.questions.length === 0 && (
                <p className="cq-empty">No questions selected or created yet.</p>
            )}

            {quizData.questions.map((q, qIndex) => (
                <div key={q._id || qIndex} className="cq-question-card">
                <div className="cq-question-header">
                    <h3>
                    Question {qIndex + 1}
                    <span className="cq-type-badge">
                        {q.questionType || "mcq"}
                    </span>
                    </h3>

                    <button
                    type="button"
                    className="cq-btn danger-btn"
                    onClick={() =>
                        q._id
                        ? removePoolQuestionFromQuiz(q._id)
                        : removeQuestion(qIndex)
                    }
                    >
                    Remove
                    </button>
                </div>

                <p><strong>Text:</strong> {q.text}</p>
                <p><strong>Subject:</strong> {q.subject}</p>
                <p><strong>Points:</strong> {q.points}</p>

                {q.questionType === "mcq" && (
                    <MCQ_Display q={q} />
                )}

                {q.questionType === "ddq" && (
                    <DDQ_Display q={q} />
                )}
                </div>
            ))}

            {submitError && <div className="cq-error">{submitError}</div>}

            <div className="cq-nav">
                <button type="button" className="cq-btn" onClick={() => setStep(2)}>
                Back
                </button>

                <button
                type="submit"
                className="cq-btn primary-btn"
                disabled={submitting}
                >
                {submitting ? "Creating..." : "Create Quiz"}
                </button>
            </div>
        </div>
    );
}
