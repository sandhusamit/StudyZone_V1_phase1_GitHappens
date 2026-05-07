import "./MatrixPreviewCard.css";
export default function MatrixPreviewCard({ question, index }) {
  const isMatrix = (answer) =>
    answer && typeof answer === "object" && Array.isArray(answer.rows);

  const isScalar = (answer) =>
    typeof answer === "number" || answer === "";

  const renderMatrix = (matrix) => {
    if (!isMatrix(matrix)) return null;

    return (
      <div className="matrix-preview-block">
        <h6>{matrix.label}</h6>

        <div
          className="matrix-preview-grid"
          style={{
            gridTemplateColumns: `repeat(${matrix.columnCount}, 42px)`,
          }}
        >
          {matrix.rows.map((row, r) =>
            row.map((val, c) => (
              <div key={`${r}-${c}`} className="matrix-preview-cell">
                {val}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderAnswer = (answer, i) => {
    if (isScalar(answer)) {
      return (
        <div className="matrix-preview-block">
          <h6>Scalar Answer {i + 1}</h6>

          <div className="matrix-preview-scalar">
            {answer}
          </div>
        </div>
      );
    }

    return renderMatrix(answer);
  };

  return (
    <div className="bulk-import-question-card">
      <h5>
        {index + 1}. {question.prompt || question.text}
      </h5>

      <p>
        <strong>Type:</strong> Matrix / {question.questionType}
      </p>

      <div className="matrix-preview-section">
        <p>
          <strong>Given Matrices</strong>
        </p>

        <div className="matrix-preview-list">
          {(question.matrices || []).map((matrix, i) => (
            <div key={i}>{renderMatrix(matrix)}</div>
          ))}
        </div>
      </div>

      <div className="matrix-preview-section">
        <p>
          <strong>Expected Answers</strong>
        </p>

        <div className="matrix-preview-list">
          {(question.expectedAnswers || []).map((answer, i) => (
            <div key={i}>{renderAnswer(answer, i)}</div>
          ))}
        </div>
      </div>

      <p>Subject: {question.subject}</p>
      {question.explanation && <p>Explanation: {question.explanation}</p>}
    </div>
  );
}