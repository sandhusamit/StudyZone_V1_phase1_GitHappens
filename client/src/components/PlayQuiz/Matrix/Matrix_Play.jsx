import { useState } from "react";
import "./Matrix_Play.css";

const CELL_WIDTH = 60;
const CELL_GAP = 8;
const BRACKET_PADDING = 18;

const getDividerLeft = (dividerIndex) => {
  if (dividerIndex === null || dividerIndex === undefined) return null;

  return (
    BRACKET_PADDING +
    dividerIndex * CELL_WIDTH +
    (dividerIndex - 1) * CELL_GAP +
    CELL_GAP / 2
  );
};

const isMatrixAnswer = (answer) =>
  answer && typeof answer === "object" && Array.isArray(answer.rows);

const isScalarAnswer = (answer) =>
  typeof answer === "number" || answer === "";

const cloneMatrix = (matrix) => matrix.map((row) => [...row]);

function applyRowOperation(rows, operation) {
  const next = cloneMatrix(rows);

  const r1 = Number(operation.rowA);
  const r2 = Number(operation.rowB);
  const factor = Number(operation.factor);

  if (operation.type === "swap") {
    [next[r1], next[r2]] = [next[r2], next[r1]];
  }

  if (operation.type === "scale") {
    if (factor === 0) return next;
    next[r1] = next[r1].map((val) => Number(val) / factor);
  }

  if (operation.type === "pivot") {
    next[r2] = next[r2].map(
      (val, c) => Number(val) + factor * Number(next[r1][c])
    );
  }

  return next;
}

function RowOperationPanel({ rows, answerIndex, onPerform, disabled }) {
  const [operation, setOperation] = useState({
    type: "swap",
    rowA: 0,
    rowB: 1,
    factor: 1,
  });

  const rowCount = rows.length;

  const updateOp = (field, value) => {
    setOperation((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="row-op-panel">
      <div className="row-op-title">
        Row Operation for Step {answerIndex + 1}
      </div>

      <div className="row-op-controls">
        <select
          value={operation.type}
          disabled={disabled}
          onChange={(e) => updateOp("type", e.target.value)}
        >
          <option value="swap">Swap Rows</option>
          <option value="scale">Scale Row</option>
          <option value="pivot">Pivot / Add Multiple</option>
        </select>

        {operation.type === "swap" && (
          <>
            <span>Swap</span>

            <select
              value={operation.rowA}
              disabled={disabled}
              onChange={(e) => updateOp("rowA", e.target.value)}
            >
              {rows.map((_, i) => (
                <option key={i} value={i}>
                  R{i + 1}
                </option>
              ))}
            </select>

            <span>with</span>

            <select
              value={operation.rowB}
              disabled={disabled}
              onChange={(e) => updateOp("rowB", e.target.value)}
            >
              {rows.map((_, i) => (
                <option key={i} value={i}>
                  R{i + 1}
                </option>
              ))}
            </select>
          </>
        )}

        {operation.type === "scale" && (
          <>
            <span>Scale</span>

            <select
              value={operation.rowA}
              disabled={disabled}
              onChange={(e) => updateOp("rowA", e.target.value)}
            >
              {rows.map((_, i) => (
                <option key={i} value={i}>
                  R{i + 1}
                </option>
              ))}
            </select>

            <span>by 1 /</span>

            <input
              type="number"
              value={operation.factor}
              disabled={disabled}
              onChange={(e) => updateOp("factor", e.target.value)}
              className="row-op-number"
            />
          </>
        )}

        {operation.type === "pivot" && (
          <>
            <input
              type="number"
              value={operation.factor}
              disabled={disabled}
              onChange={(e) => updateOp("factor", e.target.value)}
              className="row-op-number"
            />

            <span>×</span>

            <select
              value={operation.rowA}
              disabled={disabled}
              onChange={(e) => updateOp("rowA", e.target.value)}
            >
              {rows.map((_, i) => (
                <option key={i} value={i}>
                  R{i + 1}
                </option>
              ))}
            </select>

            <span>+</span>

            <select
              value={operation.rowB}
              disabled={disabled}
              onChange={(e) => updateOp("rowB", e.target.value)}
            >
              {rows.map((_, i) => (
                <option key={i} value={i}>
                  R{i + 1}
                </option>
              ))}
            </select>

            <span>→ R{Number(operation.rowB) + 1}</span>
          </>
        )}

        <button
          type="button"
          className="row-op-btn"
          disabled={disabled || rowCount < 1}
          onClick={() => onPerform(operation)}
        >
          Perform
        </button>
      </div>
    </div>
  );
}

function MatrixDisplay({ matrix, editable = false, value, onChange, disabled }) {
  const rows = editable ? value : matrix.rows;
  const dividerLeft = getDividerLeft(matrix.dividerIndex);

  return (
    <div className="matrix-play-block">
      {matrix.label && <h4 className="matrix-label">{matrix.label}</h4>}

      <div className="matrix-bracket-wrap matrix-augmented-wrap">
        {dividerLeft !== null && (
          <div
            className="matrix-augmented-line"
            style={{ left: `${dividerLeft}px` }}
          />
        )}

        <div
          className="matrix-grid"
          style={{
            gridTemplateColumns: `repeat(${matrix.columnCount}, ${CELL_WIDTH}px)`,
          }}
        >
          {rows.map((row, r) =>
            row.map((val, c) =>
              editable ? (
                <input
                  key={`${r}-${c}`}
                  type="number"
                  value={val}
                  disabled={disabled}
                  onChange={(e) => onChange(r, c, e.target.value)}
                  className="matrix-input"
                />
              ) : (
                <div key={`${r}-${c}`} className="matrix-cell">
                  {val}
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function Matrix_Play({
  q,
  qIndex,
  answers,
  setAnswers,
  disabled,
}) {
  const expectedAnswers =
    q.expectedAnswers || (q.expectedAnswer ? [q.expectedAnswer] : []);

  const isRowReduction = ["RREF", "REF"].includes(q.questionType);

  const buildInitialAnswers = () =>
    expectedAnswers.map((expected) => {
      if (isScalarAnswer(expected)) return "";

      if (isMatrixAnswer(expected)) {
        return expected.rows.map((row) => row.map(() => ""));
      }

      return "";
    });

  const userAnswers = answers[qIndex] || buildInitialAnswers();

  const updateAnswerAt = (answerIndex, nextValue) => {
    const updated = [...userAnswers];
    updated[answerIndex] = nextValue;

    setAnswers((prev) => ({
      ...prev,
      [qIndex]: updated,
    }));
  };

  const handleMatrixCellChange = (answerIndex, r, c, value) => {
    const matrixAnswer = userAnswers[answerIndex].map((row) => [...row]);
    matrixAnswer[r][c] = value;

    updateAnswerAt(answerIndex, matrixAnswer);
  };

  const handleScalarChange = (answerIndex, value) => {
    updateAnswerAt(answerIndex, value);
  };

  const handlePerformOperation = (answerIndex, operation) => {
    const currentAnswer = userAnswers[answerIndex];

    if (!Array.isArray(currentAnswer)) return;

    const transformed = applyRowOperation(currentAnswer, operation);

    const targetIndex =
      answerIndex + 1 < userAnswers.length ? answerIndex + 1 : answerIndex;

    updateAnswerAt(targetIndex, transformed);
  };

  return (
    <div className="matrix-container">
      <h3 className="matrix-prompt">{q.questionType}</h3>

      <div className="matrix-given">
        {q.matrices.map((matrix) => (
          <MatrixDisplay key={matrix.label} matrix={matrix} />
        ))}
      </div>

      <div className="matrix-answer">
        <h4 className="matrix-answer-title">Your Answer</h4>

        <div className="matrix-answer-list">
          {expectedAnswers.map((expected, answerIndex) => {
            if (isScalarAnswer(expected)) {
              return (
                <div key={answerIndex} className="matrix-step-block">
                  <div className="determinant-play-answer">
                    <label className="matrix-answer-title">
                      {q.answerMode === "steps"
                        ? `Step ${answerIndex + 1}`
                        : `Scalar Answer ${answerIndex + 1}`}
                    </label>

                    <input
                      type="number"
                      className="matrix-input determinant-answer-input"
                      value={userAnswers[answerIndex] ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        handleScalarChange(answerIndex, e.target.value)
                      }
                      placeholder="Enter scalar value"
                    />
                  </div>
                </div>
              );
            }

            if (!isMatrixAnswer(expected)) {
              return (
                <div key={answerIndex} className="matrix-step-block">
                  Invalid expected answer.
                </div>
              );
            }

            const answerMatrixShell = {
              ...expected,
              label:
                expected.label ||
                (q.answerMode === "steps"
                  ? `Step ${answerIndex + 1}`
                  : `Answer ${answerIndex + 1}`),
              rows: userAnswers[answerIndex],
            };

            return (
              <div key={answerIndex} className="matrix-step-block">
                <MatrixDisplay
                  matrix={answerMatrixShell}
                  editable
                  value={userAnswers[answerIndex]}
                  onChange={(r, c, value) =>
                    handleMatrixCellChange(answerIndex, r, c, value)
                  }
                  disabled={disabled}
                />

                {isRowReduction && (
                  <RowOperationPanel
                    rows={userAnswers[answerIndex]}
                    answerIndex={answerIndex}
                    disabled={disabled}
                    onPerform={(operation) =>
                      handlePerformOperation(answerIndex, operation)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}