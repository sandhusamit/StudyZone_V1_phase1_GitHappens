export default function Step1QuizInfo({quizData, updateQuizField}) {
  return (
    <div className="step1-container">
        <section className="cq-section">
        <h2>Quiz Details</h2>

        <label className="cq-label">Title</label>
        <input
            type="text"
            className="cq-input"
            value={quizData.title}
            onChange={(e) => updateQuizField("title", e.target.value)}
            placeholder="Enter quiz title"
            required
        />

        <label className="cq-label">Description</label>
        <textarea
            className="cq-input cq-textarea"
            value={quizData.description}
            onChange={(e) => updateQuizField("description", e.target.value)}
            placeholder="Enter quiz description"
        />

        <label className="cq-label">Visibility</label>
        <select
            className="cq-select"
            value={quizData.visibility}
            onChange={(e) => updateQuizField("visibility", e.target.value)}
        >
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
            <option value="public">Public</option>
        </select>



        </section>
    </div>
  );
}