export default function DisplayQuestion({ q }) {
    return (
        <>
        <h5>Choices</h5>
        {q.choices.map((choice, cIndex) => (
        <div className="cq-choice" key={cIndex}>
        <input
            type="text"
            value={choice.text}
            className="cq-input choice-input"
            readOnly
        />

        <label className="cq-radio">
            <input
            type="radio"
            name={`pool-correct-${qIndex}`}
            readOnly
            checked={choice.isCorrect}
            />
            Correct
        </label>
        </div>
    ))}
    </>
    )
}
