import MCQ_Card from "./MCQ_Card";
import DDQ_Card from "./DDQ_Card";

export default function NewQuestionCard({ quizData, updateQuestionField, updateChoiceText, 
    setCorrectChoice, updateDragItemText, updateDragItemDropbox, 
    updateDropBoxTitle, removePoolQuestionFromQuiz, removeQuestion,
    addDragItem, removeDragItem, addDropBox, removeDropBox,
    addChoice, removeChoice
}) {

    return (
        <div>
            {quizData.questions.map((q, qIndex) => (
            <div key={q._id || qIndex} className="cq-question-card">
                <div className="cq-question-header">
                <h3>
                    Question {qIndex + 1}
                    <span className="cq-type-badge">
                    {q.questionType || "mcq"}
                    </span>
                </h3>

                <button
                    type="button"
                    className="cq-btn danger-btn"
                    onClick={() =>
                    q._id
                        ? removePoolQuestionFromQuiz(q._id)
                        : removeQuestion(qIndex)
                    }
                >
                    Remove Question
                </button>
                </div>

                <label className="cq-label">Question Text</label>
                <textarea
                className="cq-input cq-textarea"
                value={q.text}
                onChange={(e) =>
                    updateQuestionField(qIndex, "text", e.target.value)
                }
                placeholder="Enter question text"
                required
                />

                <div className="cq-grid">
                <div>
                    <label className="cq-label">Points</label>
                    <input
                    type="number"
                    min="1"
                    className="cq-input small"
                    value={q.points}
                    onChange={(e) =>
                        updateQuestionField(qIndex, "points", Number(e.target.value))
                    }
                    />
                </div>

                <div>
                    <label className="cq-label">Subject</label>
                    <select
                    className="cq-select"
                    value={q.subject}
                    onChange={(e) =>
                        updateQuestionField(qIndex, "subject", e.target.value)
                    }
                    >
                    <option value="Math">Math</option>
                    <option value="SWE">SWE</option>
                    <option value="Data">Data</option>
                    <option value="General">General</option>
                    </select>
                </div>
                </div>

                <label className="cq-label">Explanation</label>
                <textarea
                className="cq-input cq-textarea"
                value={q.explanation}
                onChange={(e) =>
                    updateQuestionField(qIndex, "explanation", e.target.value)
                }
                placeholder="Optional explanation"
                />

                {q.questionType === "mcq" && (
                <MCQ_Card
                    q={q}
                    qIndex={qIndex}
                    updateChoiceText={updateChoiceText}
                    setCorrectChoice={setCorrectChoice}
                    addChoice={addChoice}
                    removeChoice={removeChoice}
                />
                )}

                {q.questionType === "ddq" && (
                <DDQ_Card
                    q={q}
                    qIndex={qIndex}
                    updateDragItemText={updateDragItemText}
                    updateDragItemDropbox={updateDragItemDropbox}
                    updateDropBoxTitle={updateDropBoxTitle}
                    addDragItem={addDragItem}
                    removeDragItem={removeDragItem}
                    addDropBox={addDropBox}
                    removeDropBox={removeDropBox}
                />
                )}
            </div>
            ))}

        </div>
    );
}