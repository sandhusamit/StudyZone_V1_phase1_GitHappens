import { useState } from "react";
import "./Matrix_Play.css";

const CELL_WIDTH = 90;
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

const isScalarAnswer = (answer) => typeof answer === "number" || answer === "";

const parseNumberInput = (value) => {
  if (value === "") return "";

  const trimmed = String(value).trim();

  if (/^-?\d+\/-?\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split("/").map(Number);
    if (den === 0) return value;
    return num / den;
  }

  const number = Number(trimmed);
  return Number.isNaN(number) ? value : number;
};

const decimalToFraction = (value, tolerance = 1e-6) => {
  if (value === "" || value === null || value === undefined) return "";

  const number = Number(value);

  if (Number.isNaN(number)) return value;
  if (Number.isInteger(number)) return String(number);

  let bestNumerator = Math.round(number);
  let bestDenominator = 1;
  let bestError = Math.abs(number - bestNumerator / bestDenominator);

  for (let denominator = 1; denominator <= 100; denominator++) {
    const numerator = Math.round(number * denominator);
    const error = Math.abs(number - numerator / denominator);

    if (error < bestError) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      bestError = error;
    }

    if (error < tolerance) break;
  }

  return `${bestNumerator}/${bestDenominator}`;
};

const cloneMatrix = (matrix) => matrix.map((row) => [...row]);

function applyRowOperation(rows, operation) {
  const next = cloneMatrix(rows);

  const r1 = Number(operation.rowA);
  const r2 = Number(operation.rowB);
  const factor = parseNumberInput(operation.factor);

  if (typeof factor !== "number" || Number.isNaN(factor)) return next;

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
      <div className="row-op-title">Row Operation for Step {answerIndex + 1}</div>

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
              type="text"
              inputMode="decimal"
              value={operation.factor}
              disabled={disabled}
              onChange={(e) => updateOp("factor", e.target.value)}
              className="row-op-number"
              placeholder="2 or 3/4"
            />
          </>
        )}

        {operation.type === "pivot" && (
          <>
            <input
              type="text"
              inputMode="decimal"
              value={operation.factor}
              disabled={disabled}
              onChange={(e) => updateOp("factor", e.target.value)}
              className="row-op-number"
              placeholder="-2 or -5/3"
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
                  type="text"
                  inputMode="decimal"
                  value={decimalToFraction(val)}
                  disabled={disabled}
                  onChange={(e) => onChange(r, c, e.target.value)}
                  className="matrix-input"
                  placeholder="0"
                />
              ) : (
                <div key={`${r}-${c}`} className="matrix-cell">
                  {decimalToFraction(val)}
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
    matrixAnswer[r][c] = parseNumberInput(value);
    updateAnswerAt(answerIndex, matrixAnswer);
  };

  const handleScalarChange = (answerIndex, value) => {
    updateAnswerAt(answerIndex, parseNumberInput(value));
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
        {(q.matrices || []).map((matrix) => (
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
                      type="text"
                      inputMode="decimal"
                      className="matrix-input determinant-answer-input"
                      value={decimalToFraction(userAnswers[answerIndex])}
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