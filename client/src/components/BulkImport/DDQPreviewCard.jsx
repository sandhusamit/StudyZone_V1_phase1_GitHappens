export default function DDQPreviewCard({ question, index }) {
  return (
    <div className="bulk-import-question-card">
      <h5>{index + 1}. {question.text}</h5>

      <p><strong>Dropboxes:</strong></p>
      <ul>
        {question.dropboxes.map((box, i) => (
          <li key={i}>{box.id} → {box.title}</li>
        ))}
      </ul>

      <p><strong>Drag Items:</strong></p>
      <ul>
        {question.dragItems.map((item, i) => (
          <li key={i}>
            {item.text} → {item.dropboxId}
          </li>
        ))}
      </ul>

      <p>Subject: {question.subject}</p>
      {question.explanation && <p>Explanation: {question.explanation}</p>}
    </div>
  );
}