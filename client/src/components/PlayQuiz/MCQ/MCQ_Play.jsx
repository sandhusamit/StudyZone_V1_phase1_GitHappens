export default function MCQ_Play({
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
        {q.questionType === "mcq" && (
            <ul>
            {(q.choices || []).map((choice, cIndex) => {
                const selected = answers[qIndex] === cIndex;

                return (
                <li
                    key={cIndex}
                    className={[
                    selected ? "selected" : "",
                    getChoiceClass(qIndex, cIndex),
                    ].join(" ")}
                >
                    <label>
                    <input
                        title="Choices"
                        type="radio"
                        name={`q-${qIndex}`}
                        checked={selected}
                        onChange={() => handleSelect(qIndex, cIndex)}
                        disabled={disabled}
                    />
                    {choice?.text}
                    </label>
                </li>
                );
            })}
            </ul>
        )}
    </div>
    );

}
