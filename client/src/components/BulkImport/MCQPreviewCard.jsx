export default function MCQPreviewCard({ question, index }) {
  return (
    <div className="bulk-import-question-card">
      <h5>{index + 1}. {question.text}</h5>

      <ul>
        {question.choices.map((choice, i) => (
          <li key={i}>
            {choice.text} {choice.isCorrect && <strong>✓</strong>}
          </li>
        ))}
      </ul>

      <p>Subject: {question.subject}</p>
      {question.explanation && <p>Explanation: {question.explanation}</p>}
    </div>
  );
}