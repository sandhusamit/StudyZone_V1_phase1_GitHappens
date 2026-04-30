import DDQ_Display from "./DDQ_Display";
import MCQ_Display from "./MCQ_Display";

const isMatrixAnswer = (answer) =>
  answer && typeof answer === "object" && Array.isArray(answer.rows);

const getTypeLabel = (q) => {
  if (q.questionModel === "MatrixQuestion") {
    return `Matrix: ${q.questionType}`;
  }

  return q.questionType || "mcq";
};

const getQuestionText = (q) => {
  if (q.questionModel === "MatrixQuestion") {
    return q.prompt || q.title || "Untitled matrix question";
  }

  return q.text || "Untitled question";
};

const getMatrixDetails = (q) => {
  const matrixCount = q.matrices?.length || 0;
  const answerCount = q.expectedAnswers?.length || 0;
  const scalarCount =
    q.expectedAnswers?.filter((a) => typeof a === "number").length || 0;
  const matrixAnswerCount =
    q.expectedAnswers?.filter(isMatrixAnswer).length || 0;

  return `${matrixCount} matrices / ${answerCount} answers (${matrixAnswerCount} matrix, ${scalarCount} scalar)`;
};

export default function SelectedQuestions({
  quizData,
  submitError,
  submitting,
  setStep,
  removePoolQuestionFromQuiz,
  removeQuestion,
}) {
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
              <span className="cq-type-badge">{getTypeLabel(q)}</span>
            </h3>

            <button
              type="button"
              className="cq-btn danger-btn"
              onClick={() =>
                q._id ? removePoolQuestionFromQuiz(q._id) : removeQuestion(qIndex)
              }
            >
              Remove
            </button>
          </div>

          <p>
            <strong>Text:</strong> {getQuestionText(q)}
          </p>

          <p>
            <strong>Subject:</strong> {q.subject || "General"}
          </p>

          <p>
            <strong>Points:</strong> {q.points || 0}
          </p>

          {q.questionType === "mcq" && <MCQ_Display q={q} />}

          {q.questionType === "ddq" && <DDQ_Display q={q} />}

          {q.questionModel === "MatrixQuestion" && (
            <div className="matrix-selected-summary">
              <p>
                <strong>Answer Mode:</strong> {q.answerMode || "single"}
              </p>

              <p>
                <strong>Details:</strong> {getMatrixDetails(q)}
              </p>

              <div className="matrix-selected-preview">
                {q.matrices?.map((matrix, mIndex) => (
                  <span key={mIndex} className="cq-type-badge">
                    {matrix.label}: {matrix.rowCount}×{matrix.columnCount}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {submitError && <div className="cq-error">{submitError}</div>}

      <div className="cq-nav">
        <button type="button" className="cq-btn" onClick={() => setStep(2)}>
          Back
        </button>

        <button type="submit" className="cq-btn primary-btn" disabled={submitting}>
          {submitting ? "Creating..." : "Create Quiz"}
        </button>
      </div>
    </div>
  );
}