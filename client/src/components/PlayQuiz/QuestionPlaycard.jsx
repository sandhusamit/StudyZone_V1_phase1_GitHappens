import DragDropQuestionCard from "../PlayQuiz/DDQ/DragDropQuestion.jsx";
import MCQ_Play from "../PlayQuiz/MCQ/MCQ_Play.jsx";

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
        {qIndex + 1}. {q.text}
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