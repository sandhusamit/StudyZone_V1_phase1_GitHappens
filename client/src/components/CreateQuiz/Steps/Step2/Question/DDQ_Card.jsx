import './QuestionCard.css';
export default function DDQ_Card({
  q,
  qIndex,
  updateDragItemText,
  updateDragItemDropbox,
  updateDropBoxTitle,
  addDragItem,
  removeDragItem,
  addDropBox,
  removeDropBox,
}) {
  return (
    <div className="question-type-card ddq-question">
      <div className="question-type-header">
        <h5>Drag & Drop Builder</h5>
        <p>Create items, then assign each item to the correct drop box.</p>
      </div>

      <div className="ddq-section">
        <div className="ddq-section-title">
          <h6>Drag Items</h6>
          <span>{q.dragItems.length} item(s)</span>
        </div>

        <div className="choice-list">
          {q.dragItems.map((item, i) => (
            <div key={item.id} className="choice-row ddq-row">
              <div className="choice-index">{i + 1}</div>

              <input
                title="Drag item text"
                type="text"
                value={item.text}
                onChange={(e) =>
                  updateDragItemText(qIndex, i, e.target.value)
                }
                className="cq-input choice-input"
                placeholder={`Drag item ${i + 1}`}
                required
              />

              <select
                title="Dropbox it belongs to."
                value={item.dropboxId}
                onChange={(e) =>
                  updateDragItemDropbox(qIndex, i, e.target.value)
                }
                className="cq-select ddq-select"
              >
                {q.dropboxes.map((box) => (
                  <option key={box.id} value={box.id}>
                    {box.title || box.id}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removeDragItem(qIndex, i)}
                className="mini-danger-btn"
                disabled={q.dragItems.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          title="Add Item"
          type="button"
          onClick={() => addDragItem(qIndex)}
          className="cq-btn add-choice-btn"
        >
          + Add Drag Item
        </button>
      </div>

      <div className="ddq-section">
        <div className="ddq-section-title">
          <h6>Drop Boxes</h6>
          <span>{q.dropboxes.length} box(es)</span>
        </div>

        <div className="choice-list">
          {q.dropboxes.map((box, i) => (
            <div key={box.id} className="choice-row ddq-row">
              <div className="choice-index">{String.fromCharCode(65 + i)}</div>

              <input
                title="Dropbox title"
                type="text"
                value={box.title}
                onChange={(e) =>
                  updateDropBoxTitle(qIndex, i, e.target.value)
                }
                className="cq-input choice-input"
                placeholder={`Drop box ${i + 1} title`}
                required
              />

              <input
                type="text"
                value={box.id}
                className="cq-input ddq-id-input"
                readOnly
              />

              <button
                type="button"
                onClick={() => removeDropBox(qIndex, i)}
                className="mini-danger-btn"
                disabled={q.dropboxes.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => addDropBox(qIndex)}
          className="cq-btn add-choice-btn"
        >
          + Add Drop Box
        </button>
      </div>
    </div>
  );
}