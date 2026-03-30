export default function MCQ_Card({ q, qIndex, updateChoiceText, setCorrectChoice, addChoice, removeChoice }) {
    return (
        <div className="mcq-question">
            <h5>Choices</h5>

            {q.choices.map((choice, cIndex) => (
            <div className="cq-choice" key={cIndex}>
                <input
                type="text"
                className="cq-input choice-input"
                value={choice.text}
                onChange={(e) =>
                    updateChoiceText(qIndex, cIndex, e.target.value)
                }
                placeholder={`Choice ${cIndex + 1}`}
                required
                />

                <label className="cq-radio">
                <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={choice.isCorrect}
                    onChange={() => setCorrectChoice(qIndex, cIndex)}
                />
                Correct
                </label>

                <button
                type="button"
                className="cq-btn danger-btn"
                onClick={() => removeChoice(qIndex, cIndex)}
                disabled={q.choices.length <= 2}
                >
                Remove
                </button>
            </div>
            ))}

        <button
        type="button"
        className="cq-btn add-choice-btn"
        onClick={() => addChoice(qIndex)}
        >
        + Add Choice
        </button>
    </div>
    )
}