import "./Matrix_Card.css";
import { useEffect, useState } from "react";

const CELL_WIDTH = 96;
const CELL_GAP = 8;
const BRACKET_PADDING = 18;

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

const makeLocalMatrix = (label = "Answer", rowCount = 2, columnCount = 2) => ({
  label,
  matrixType: rowCount === columnCount ? "square" : "rectangular",
  rows: Array.from({ length: rowCount }, () => Array(columnCount).fill(0)),
  rowCount,
  columnCount,
  dividerIndex: null,
});

const isMatrixAnswer = (answer) =>
  answer && typeof answer === "object" && Array.isArray(answer.rows);

const isScalarAnswer = (answer) => typeof answer === "number" || answer === "";

export default function Matrix_Card({
  q,
  qIndex,
  updateQuestionField,
  addRow,
  addColumn,
  removeRow,
  removeColumn,
  addAnswerRow,
  addAnswerColumn,
  removeAnswerRow,
  removeAnswerColumn,
  addMatrix,
  removeMatrix,
  updateMatrixLabel,
  duplicateLabels,
}) {
  const [matrixError, setMatrixError] = useState("");

  const matrices = Array.isArray(q.matrices) ? q.matrices : [];
  const expectedAnswers =
    q.expectedAnswers || (q.expectedAnswer ? [q.expectedAnswer] : []);

  useEffect(() => {
    if (duplicateLabels?.length > 0) {
      setMatrixError("Matrix labels must be unique.");
      return;
    }

    setMatrixError("");
  }, [duplicateLabels]);

  const getDividerLeft = (dividerIndex) => {
    if (dividerIndex === null || dividerIndex === undefined) return null;

    return (
      BRACKET_PADDING +
      dividerIndex * CELL_WIDTH +
      (dividerIndex - 1) * CELL_GAP +
      CELL_GAP / 2
    );
  };

  const updateExpectedAnswers = (nextAnswers) => {
    updateQuestionField(qIndex, "expectedAnswers", nextAnswers);
  };

  const addExpectedMatrix = () => {
    const matrixCount = expectedAnswers.filter(isMatrixAnswer).length;

    updateExpectedAnswers([
      ...expectedAnswers,
      makeLocalMatrix(`Answer ${matrixCount + 1}`),
    ]);
  };

  const addExpectedScalar = () => {
    updateExpectedAnswers([...expectedAnswers, 0]);
  };

  const removeExpectedAnswer = (answerIndex) => {
    if (expectedAnswers.length <= 1) return;
    updateExpectedAnswers(expectedAnswers.filter((_, i) => i !== answerIndex));
  };

  const updateScalarAnswer = (answerIndex, value) => {
    const answers = [...expectedAnswers];
    answers[answerIndex] = parseNumberInput(value);
    updateExpectedAnswers(answers);
  };

  const updateExpectedAnswerLabel = (answerIndex, value) => {
    const answers = [...expectedAnswers];
    if (!isMatrixAnswer(answers[answerIndex])) return;

    answers[answerIndex] = {
      ...answers[answerIndex],
      label: value,
    };

    updateExpectedAnswers(answers);
  };

  const updateExpectedAnswerCell = (answerIndex, r, c, value) => {
    const answers = [...expectedAnswers];
    if (!isMatrixAnswer(answers[answerIndex])) return;

    const answer = { ...answers[answerIndex] };
    const updatedRows = answer.rows.map((row) => [...row]);

    updatedRows[r][c] = parseNumberInput(value);

    answers[answerIndex] = {
      ...answer,
      rows: updatedRows,
    };

    updateExpectedAnswers(answers);
  };

  const updateExpectedAnswerDivider = (answerIndex, value) => {
    const answers = [...expectedAnswers];
    if (!isMatrixAnswer(answers[answerIndex])) return;

    answers[answerIndex] = {
      ...answers[answerIndex],
      dividerIndex: value,
    };

    updateExpectedAnswers(answers);
  };

  const updateCell = (matrixIndex, r, c, value) => {
    const nextMatrices = [...matrices];
    if (!nextMatrices[matrixIndex]?.rows) return;

    const updatedRows = nextMatrices[matrixIndex].rows.map((row) => [...row]);

    updatedRows[r][c] = parseNumberInput(value);

    nextMatrices[matrixIndex] = {
      ...nextMatrices[matrixIndex],
      rows: updatedRows,
    };

    updateQuestionField(qIndex, "matrices", nextMatrices);
  };

  const updateDivider = (mIndex, value) => {
    const nextMatrices = [...matrices];
    if (!nextMatrices[mIndex]) return;

    nextMatrices[mIndex] = {
      ...nextMatrices[mIndex],
      dividerIndex: value,
    };

    updateQuestionField(qIndex, "matrices", nextMatrices);
  };

  const renderAnswerModeSelect = () => (
    <div className="matrix-answer-mode-select">
      <label>Answer Mode</label>

      <select
        value={q.answerMode || "single"}
        onChange={(e) =>
          updateQuestionField(qIndex, "answerMode", e.target.value)
        }
      >
        <option value="single">Single Answer</option>
        <option value="multiple">Multiple Answers</option>
        <option value="steps">Step-by-Step</option>
      </select>
    </div>
  );

  const renderDividerSelect = (value, columnCount, onChange) => (
    <div className="matrix-divider-controls">
      <label>Augmented Divider</label>

      <select
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? null : Number(e.target.value))
        }
      >
        <option value="">None</option>

        {Array.from({ length: Math.max(columnCount - 1, 0) }).map((_, i) => (
          <option key={i} value={i + 1}>
            After column {i + 1}
          </option>
        ))}
      </select>
    </div>
  );

  const renderMatrixEditor = ({
    matrix,
    isAnswer = false,
    onCellChange,
    onRemoveRow,
    onRemoveColumn,
    onAddRow,
    onAddColumn,
  }) => {
    const safeRows = Array.isArray(matrix?.rows) ? matrix.rows : [];
    const safeColumnCount = matrix?.columnCount || safeRows[0]?.length || 1;
    const safeRowCount = matrix?.rowCount || safeRows.length || 1;
    const dividerLeft = getDividerLeft(matrix?.dividerIndex);

    return (
      <div className="matrix-editor">
        <div
          className="matrix-col-controls"
          style={{
            gridTemplateColumns: `44px repeat(${safeColumnCount}, ${CELL_WIDTH}px)`,
          }}
        >
          <div className="matrix-control-spacer"></div>

          {Array.from({ length: safeColumnCount }).map((_, c) => (
            <button
              key={c}
              type="button"
              className="matrix-mini-btn"
              onClick={() => onRemoveColumn(c)}
              disabled={safeColumnCount <= 1}
              title={`Remove column ${c + 1}`}
            >
              −
            </button>
          ))}
        </div>

        <div className="matrix-row-shell">
          <div className="matrix-row-buttons">
            {safeRows.map((_, r) => (
              <button
                key={r}
                type="button"
                className="matrix-mini-btn"
                onClick={() => onRemoveRow(r)}
                disabled={safeRowCount <= 1}
                title={`Remove row ${r + 1}`}
              >
                −
              </button>
            ))}
          </div>

          <div className="matrix-bracket-wrap matrix-augmented-wrap">
            {dividerLeft !== null && (
              <div
                className={`matrix-augmented-line ${isAnswer ? "answer" : ""}`}
                style={{ left: `${dividerLeft}px` }}
              />
            )}

            <div
              className="matrix-grid"
              style={{
                gridTemplateColumns: `repeat(${safeColumnCount}, ${CELL_WIDTH}px)`,
              }}
            >
              {safeRows.map((row, r) =>
                row.map((val, c) => (
                  <input
                    key={`${r}-${c}`}
                    type="text"
                    inputMode="decimal"
                    value={decimalToFraction(val)}
                    onChange={(e) => onCellChange(r, c, e.target.value)}
                    className="matrix-input"
                    placeholder="0"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="matrix-add-controls">
          <button
            type="button"
            className="cq-btn matrix-action-btn"
            onClick={onAddRow}
          >
            + Row
          </button>

          <button
            type="button"
            className="cq-btn matrix-action-btn"
            onClick={onAddColumn}
          >
            + Column
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="matrix-builder">
      <div className="matrix-topbar">
        {renderAnswerModeSelect()}

        <div className="matrix-operation-group">
          <label
            title="Doesn't have any effect, strictly for data organization."
            className="cq-label"
          >
            Matrix Operation
          </label>

          <select
            className="cq-select"
            value={q.questionType || "addition"}
            onChange={(e) =>
              updateQuestionField(qIndex, "questionType", e.target.value)
            }
          >
            <option value="addition">Addition</option>
            <option value="subtraction">Subtraction</option>
            <option value="multiplication">Multiplication</option>
            <option value="determinant">Determinant</option>
            <option value="trace">Trace</option>
            <option value="inverse">Inverse</option>
            <option value="transpose">Transpose</option>
            <option value="RREF">RREF</option>
            <option value="REF">REF</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <button
          type="button"
          className="cq-btn matrix-add-matrix-btn"
          onClick={() => addMatrix(qIndex)}
        >
          + Matrix
        </button>
      </div>

      <div className="matrix-list">
        {matrices.map((matrix, mIndex) => (
          <section key={mIndex} className="matrix-block">
            <div className="matrix-header">
              <div>
                <span className="matrix-section-kicker">Question Matrix</span>

                <input
                  type="text"
                  value={matrix.label || ""}
                  onChange={(e) =>
                    updateMatrixLabel(qIndex, mIndex, e.target.value)
                  }
                  className={`matrix-label-input ${
                    duplicateLabels?.includes(
                      (matrix.label || "").trim().toUpperCase()
                    ) || (matrix.label || "").trim() === ""
                      ? "error"
                      : ""
                  }`}
                />
              </div>

              <button
                type="button"
                className="matrix-remove-btn"
                onClick={() => removeMatrix(qIndex, mIndex)}
                disabled={matrices.length <= 1}
                title="Remove matrix"
              >
                ✕
              </button>
            </div>

            {(matrix.label || "").trim() === "" && (
              <div className="matrix-warning">Matrix labels cannot be empty.</div>
            )}

            {renderDividerSelect(
              matrix.dividerIndex,
              matrix.columnCount || matrix.rows?.[0]?.length || 1,
              (val) => updateDivider(mIndex, val)
            )}

            {renderMatrixEditor({
              matrix,
              onCellChange: (r, c, value) => updateCell(mIndex, r, c, value),
              onRemoveRow: (r) => removeRow(qIndex, mIndex, r),
              onRemoveColumn: (c) => removeColumn(qIndex, mIndex, c),
              onAddRow: () => addRow(qIndex, mIndex),
              onAddColumn: () => addColumn(qIndex, mIndex),
            })}
          </section>
        ))}
      </div>

      {matrixError && <div className="matrix-warning">{matrixError}</div>}

      <section className="matrix-answer-builder">
        <div className="matrix-answer-header">
          <div>
            <span className="matrix-section-kicker">Final Answers</span>
            <h4>Expected Answers</h4>
          </div>

          <div className="matrix-add-controls">
            <button
              type="button"
              className="cq-btn matrix-add-matrix-btn"
              onClick={addExpectedMatrix}
            >
              + Matrix Answer
            </button>

            <button
              type="button"
              className="cq-btn matrix-add-matrix-btn"
              onClick={addExpectedScalar}
            >
              + Scalar Answer
            </button>
          </div>
        </div>

        <div className="matrix-list">
          {expectedAnswers.map((answer, answerIndex) => {
            if (isScalarAnswer(answer)) {
              return (
                <section
                  key={answerIndex}
                  className="matrix-block matrix-answer-block scalar-answer-block"
                >
                  <div className="matrix-header">
                    <div>
                      <span className="matrix-section-kicker">
                        {q.answerMode === "steps"
                          ? `Step ${answerIndex + 1}`
                          : `Scalar Answer ${answerIndex + 1}`}
                      </span>

                      <input
                        type="text"
                        inputMode="decimal"
                        className="matrix-input determinant-answer-input"
                        value={decimalToFraction(answer)}
                        onChange={(e) =>
                          updateScalarAnswer(answerIndex, e.target.value)
                        }
                        placeholder="Example: -5/3"
                      />
                    </div>

                    <button
                      type="button"
                      className="matrix-remove-btn"
                      onClick={() => removeExpectedAnswer(answerIndex)}
                      disabled={expectedAnswers.length <= 1}
                      title="Remove scalar answer"
                    >
                      ✕
                    </button>
                  </div>
                </section>
              );
            }

            if (!isMatrixAnswer(answer)) {
              return (
                <section
                  key={answerIndex}
                  className="matrix-block matrix-answer-block"
                >
                  <div className="matrix-warning">
                    Invalid expected answer at position {answerIndex + 1}.
                  </div>
                </section>
              );
            }

            return (
              <section
                key={answerIndex}
                className="matrix-block matrix-answer-block"
              >
                <div className="matrix-header">
                  <div>
                    <span className="matrix-section-kicker">
                      {q.answerMode === "steps"
                        ? `Step ${answerIndex + 1}`
                        : `Expected Matrix ${answerIndex + 1}`}
                    </span>

                    <input
                      type="text"
                      value={answer.label || ""}
                      onChange={(e) =>
                        updateExpectedAnswerLabel(answerIndex, e.target.value)
                      }
                      title="Label for this expected answer"
                      className={`matrix-label-input ${
                        duplicateLabels?.includes(
                          (answer.label || "").trim().toUpperCase()
                        ) || (answer.label || "").trim() === ""
                          ? "error"
                          : ""
                      }`}
                    />
                  </div>

                  <button
                    type="button"
                    className="matrix-remove-btn"
                    onClick={() => removeExpectedAnswer(answerIndex)}
                    disabled={expectedAnswers.length <= 1}
                    title="Remove expected answer"
                  >
                    ✕
                  </button>
                </div>

                {(answer.label || "").trim() === "" && (
                  <div className="matrix-warning">
                    Answer labels cannot be empty.
                  </div>
                )}

                {renderDividerSelect(
                  answer.dividerIndex,
                  answer.columnCount || answer.rows?.[0]?.length || 1,
                  (val) => updateExpectedAnswerDivider(answerIndex, val)
                )}

                {renderMatrixEditor({
                  matrix: answer,
                  isAnswer: true,
                  onCellChange: (r, c, value) =>
                    updateExpectedAnswerCell(answerIndex, r, c, value),
                  onRemoveRow: (r) => removeAnswerRow(qIndex, answerIndex, r),
                  onRemoveColumn: (c) =>
                    removeAnswerColumn(qIndex, answerIndex, c),
                  onAddRow: () => addAnswerRow(qIndex, answerIndex),
                  onAddColumn: () => addAnswerColumn(qIndex, answerIndex),
                })}
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}