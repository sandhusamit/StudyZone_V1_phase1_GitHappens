export default function DDQ_Display({ q }) {
    return (
        <>
        <h5>Drag Items</h5>
        {q.dragItems?.map((item, i) => (
            <div className="cq-choice" key={item.id || i}>
            <input
                type="text"
                value={`${item.text} → ${item.dropboxId}`}
                className="cq-input choice-input"
                readOnly
            />
            </div>
        ))}

        <h5>Drop Boxes</h5>
        {q.dropboxes?.map((box, i) => (
            <div className="cq-choice" key={box.id || i}>
            <input
                type="text"
                value={`${box.title} (${box.id})`}
                className="cq-input choice-input"
                readOnly
            />
            </div>
        ))}
        </>
    )
}
