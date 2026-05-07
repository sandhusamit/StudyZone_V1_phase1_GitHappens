const getQuestionKey = (q) => `${q.questionModel || "Question"}:${q._id}`;

const getQuestionText = (question) => {
  if (question.questionModel === "MatrixQuestion") {
    return question.prompt || question.title || "Untitled matrix question";
  }

  return question.text || "Untitled question";
};

const getQuestionType = (question) => {
  if (question.questionModel === "MatrixQuestion") {
    return `Matrix: ${question.questionType}`;
  }
  else {

  return question.questionType || "mcq";
  }
};

const getQuestionDetails = (question) => {
  if (question.questionModel === "MatrixQuestion") {
    const matrixCount = question.matrices?.length || 0;
    const answerCount = question.expectedAnswers?.length || 0;

    const scalarCount =
      question.expectedAnswers?.filter((a) => typeof a === "number").length ||
      0;

    const matrixAnswerCount =
      question.expectedAnswers?.filter(
        (a) => a && typeof a === "object" && Array.isArray(a.rows)
      ).length || 0;

    return `${matrixCount} matrices / ${answerCount} answers (${matrixAnswerCount} matrix, ${scalarCount} scalar)`;
  }

  if (question.questionType === "ddq") {
    return `${question.dragItems?.length || 0} items / ${
      question.dropboxes?.length || 0
    } boxes`;
  }

  return `${question.choices?.length || 0} choices`;
};

export default function QuestionPool({
  questionPool,
  poolLoading,
  poolError,
  selectedPoolIds,
  addQuestionFromPool,
}) {
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
              {questionPool.map((question) => {
                const questionKey = getQuestionKey(question);
                const isAdded = selectedPoolIds.has(questionKey);

                return (
                  <tr key={questionKey}>
                    <td>{getQuestionText(question)}</td>
                    <td>{getQuestionType(question)}</td>
                    <td>{question.subject || "General"}</td>
                    <td>{question.points || 0}</td>
                    <td>{getQuestionDetails(question)}</td>
                    <td>
                      <button
                        type="button"
                        className="cq-btn"
                        onClick={() => addQuestionFromPool(question)}
                        disabled={isAdded}
                      >
                        {isAdded ? "Added" : "Add"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}