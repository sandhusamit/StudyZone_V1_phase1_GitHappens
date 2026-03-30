export default function QuestionPool({ questionPool, poolLoading, poolError, selectedPoolIds, addQuestionFromPool }) {
    return (
        <section className="cq-section">
            <h2>Question Pool</h2>

            {poolLoading && <p>Loading questions...</p>}
            {poolError && <p className="cq-error">{poolError}</p>}

            {!poolLoading && !poolError && (
            <div className="cq-pool-table-wrapper">
                <table className="cq-pool-table">
                <thead>
                    <tr>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Points</th>
                    <th>Details</th>
                    <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {questionPool.map((question) => (
                    <tr key={question._id}>
                        <td>{question.text}</td>
                        <td>{question.questionType || "mcq"}</td>
                        <td>{question.subject}</td>
                        <td>{question.points}</td>
                        <td>
                        {question.questionType === "ddq"
                            ? `${question.dragItems?.length || 0} items / ${
                                question.dropboxes?.length || 0
                            } boxes`
                            : `${question.choices?.length || 0} choices`}
                        </td>
                        <td>
                        <button
                            type="button"
                            className="cq-btn"
                            onClick={() => addQuestionFromPool(question)}
                            disabled={selectedPoolIds.has(question._id)}
                        >
                            {selectedPoolIds.has(question._id) ? "Added" : "Add"}
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            )}


        </section>
    );
}
                    