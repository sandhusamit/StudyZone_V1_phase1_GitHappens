import DragDropQuestionCard from "../PlayQuiz/DDQ/DragDropQuestion.jsx";
import MCQ_Play from "../PlayQuiz/MCQ/MCQ_Play.jsx";
import Matrix_Play from "../PlayQuiz/Matrix/Matrix_Play.jsx";
import "./QuestionPlaycard.css";
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
export default function QuestionPlaycard({
  q,
  qIndex,
  answers,
  setAnswers,
  result,
  getChoiceClass,
  handleSelect,
  disabled,
}) {
  return (
    <div className="play-question-card">
      {/* HEADER */}
      <h3>
        {qIndex + 1}. {q.text || q.prompt}
      </h3>

      <h4>Points: {q.points || 0}</h4>

      {/* MCQ */}
      {q.questionType === "mcq" && (
        <MCQ_Play
          q={q}
          qIndex={qIndex}
          answers={answers}
          setAnswers={setAnswers}
          result={result}
          getChoiceClass={getChoiceClass}
          handleSelect={handleSelect}
          disabled={disabled}
        />
      )}

      {/* DDQ */}
      {q.questionType === "ddq" && (
        <DragDropQuestionCard
          question={q}
          value={answers[qIndex] || {}}
          onChange={(val) =>
            setAnswers((prev) => ({
              ...prev,
              [qIndex]: val,
            }))
          }
          disabled={disabled}
          showResults={disabled}
        />
      )}

      {/* MATRIX */}
      {q.questionModel === "MatrixQuestion" && (
        <Matrix_Play
          q={q}
          qIndex={qIndex}
          answers={answers}
          setAnswers={setAnswers}
          disabled={disabled}
        />
      )}

      {/* FEEDBACK */}
      {result && (
        <div
          className={`feedback-card ${
            result.isCorrect ? "correct" : "wrong"
          }`}
        >
          <div className="feedback-header">
            <span className="status">
              {result.isCorrect ? "✅ Correct" : "❌ Incorrect"}
            </span>

            <span className="points">
              +{result.isCorrect ? result.points : 0} pts
            </span>
          </div>

          {/* USER ANSWER */}
          {q.questionType === "mcq" && (
            <>
              <div className="feedback-row">
                <span className="label">Your Answer</span>
                <span
                  className={result.isCorrect ? "good" : "bad"}
                >
                  {result.selectedText || "No answer"}
                </span>
              </div>

              {!result.isCorrect && (
                <div className="feedback-row">
                  <span className="label">Correct Answer</span>
                  <span className="good">
                    {result.correctText}
                  </span>
                </div>
              )}
            </>
          )}

          {q.questionModel === "MatrixQuestion" && result.expectedAnswers && (
            <div className="matrix-feedback">
              <h4>Expected Result</h4>

              <div className="matrix-feedback-list">
                {result.expectedAnswers.map((expected, answerIndex) => {
                  const isMatrix =
                    expected &&
                    typeof expected === "object" &&
                    Array.isArray(expected.rows);

                  const isScalar = typeof expected === "number";

                  if (isScalar) {
                    return (
                      <div key={answerIndex} className="determinant-feedback-block">
                        <p className="matrix-feedback-label">
                          {q.answerMode === "steps"
                            ? `Step ${answerIndex + 1}`
                            : `Scalar Answer ${answerIndex + 1}`}
                        </p>

                        <div className="feedback-row">
                          <span className="label">Your Answer</span>
                          <span className={result.isCorrect ? "good" : "bad"}>
                            {decimalToFraction(result.userAnswers?.[answerIndex]) || "No answer"}                          </span>
                        </div>

                        {!result.isCorrect && (
                          <div className="feedback-row">
                            <span className="label">Correct Answer</span>
                              <span className="good">{decimalToFraction(expected)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (!isMatrix) {
                    return (
                      <div key={answerIndex} className="matrix-feedback-block">
                        <p className="matrix-feedback-label">
                          Invalid expected answer
                        </p>
                      </div>
                    );
                  }

                  const matrixRows = expected.rows;

                  return (
                    <div key={answerIndex} className="matrix-feedback-block">
                      <p className="matrix-feedback-label">
                        {expected.label ||
                          (q.answerMode === "steps"
                            ? `Step ${answerIndex + 1}`
                            : `Answer ${answerIndex + 1}`)}
                      </p>

                      <div
                        className="matrix-grid"
                        style={{
                          gridTemplateColumns: `repeat(${
                            matrixRows[0]?.length || 1
                          }, 60px)`,
                        }}
                      >
                        {matrixRows.map((row, r) =>
                          row.map((val, c) => (
                            <div key={`${r}-${c}`} className="matrix-cell">
                              {decimalToFraction(val) }
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* EXPLANATION */}
          {result.explanation && (
            <div className="feedback-explanation">
              🧠 {result.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}