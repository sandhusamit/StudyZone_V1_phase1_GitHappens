import { useEffect, useState } from "react";

const END_POINT = "http://localhost:3000/api";

export default function MatrixQuestionTestPage() {
  const [matrixQuestion, setMatrixQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState([]);
  const [result, setResult] = useState(null);

  const questionID = "69ee3d0773bc8d0297620c32";

  useEffect(() => {
    async function getMatrixQuestion() {
      const res = await fetch(`${END_POINT}/matrix/${questionID}`);
      const data = await res.json();

      const question = data.data || data;
      setMatrixQuestion(question);

      const answerRows = question.expectedAnswer.rows;
      setUserAnswer(
        answerRows.map((row) => row.map(() => ""))
      );
    }

    getMatrixQuestion();
  }, []);

  const handleInputChange = (rowIndex, colIndex, value) => {
    const updated = userAnswer.map((row) => [...row]);
    updated[rowIndex][colIndex] = value;
    setUserAnswer(updated);
  };

  const checkAnswer = () => {
    const expected = matrixQuestion.expectedAnswer.rows;

    const isCorrect = expected.every((row, r) =>
      row.every((expectedValue, c) => {
        return Number(userAnswer[r][c]) === expectedValue;
      })
    );

    setResult(isCorrect ? "correct" : "incorrect");
  };

  if (!matrixQuestion) return <p>Loading matrix question...</p>;

  return (
    <div>
      <h1>Matrix Question</h1>

      <h2>{matrixQuestion.prompt}</h2>
      <p>Type: {matrixQuestion.questionType}</p>
      <p>Points: {matrixQuestion.points}</p>

      {matrixQuestion.matrices.map((matrix) => (
        <div key={matrix.label}>
          <h3>Matrix {matrix.label}</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${matrix.columnCount}, 50px)`,
              gap: "6px",
              marginBottom: "20px",
            }}
          >
            {matrix.rows.map((row, rowIndex) =>
              row.map((value, colIndex) => (
                <div
                  key={`${matrix.label}-${rowIndex}-${colIndex}`}
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "1px solid #ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {value}
                </div>
              ))
            )}
          </div>
        </div>
      ))}

      <h3>Your Answer</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${matrixQuestion.expectedAnswer.columnCount}, 60px)`,
          gap: "6px",
          marginBottom: "20px",
        }}
      >
        {userAnswer.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`answer-${rowIndex}-${colIndex}`}
              type="number"
              value={value}
              onChange={(e) =>
                handleInputChange(rowIndex, colIndex, e.target.value)
              }
              style={{
                width: "60px",
                height: "50px",
                textAlign: "center",
                fontSize: "18px",
              }}
            />
          ))
        )}
      </div>

      <button onClick={checkAnswer}>Check Answer</button>

      {result === "correct" && <p>✅ Correct.</p>}

      {result === "incorrect" && (
        <div>
          <p>❌ Not quite. Try again.</p>
          <p>{matrixQuestion.explanation}</p>
        </div>
      )}
    </div>
  );
}