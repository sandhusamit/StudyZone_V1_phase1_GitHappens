export default function DDQ_Card({ q, qIndex, updateDragItemText, updateDragItemDropbox, updateDropBoxTitle,
    addDragItem, removeDragItem, addDropBox, removeDropBox
    
 }) {
    return (
        <div className="drag-drop-question">
            <h5>Drag Items</h5>

            {q.dragItems.map((item, i) => (
            <div key={item.id} className="cq-choice">
                <input
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
                value={item.dropboxId}
                onChange={(e) =>
                    updateDragItemDropbox(qIndex, i, e.target.value)
                }
                className="cq-select"
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
                className="cq-btn danger-btn"
                disabled={q.dragItems.length <= 1}
                >
                Remove
                </button>
            </div>
            ))}

            <button
            type="button"
            onClick={() => addDragItem(qIndex)}
            className="cq-btn add-choice-btn"
            >
            + Add Drag Item
            </button>

            <h5>Drop Boxes</h5>

            {q.dropboxes.map((box, i) => (
            <div key={box.id} className="cq-choice">
                <input
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
                className="cq-input small"
                readOnly
                />

                <button
                type="button"
                onClick={() => removeDropBox(qIndex, i)}
                className="cq-btn danger-btn"
                disabled={q.dropboxes.length <= 1}
                >
                Remove
                </button>
            </div>
            ))}

            <button
            type="button"
            onClick={() => addDropBox(qIndex)}
            className="cq-btn add-choice-btn"
            >
            + Add Drop Box
            </button>
        </div>
)}