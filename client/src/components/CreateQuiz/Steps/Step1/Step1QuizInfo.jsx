import { useEffect } from "react";
import "./Step1QuizInfo.css";

export default function Step1QuizInfo({
  quizData,
  updateQuizField,
  stepValid,
  setStepValid,
}) {
  useEffect(() => {
    setStepValid(quizData.title.trim() !== "");
  }, [quizData.title, setStepValid]);

  return (
    <div className="step1-container">
      <section className="step1-card">
        <h2 className="step1-title">Quiz Details</h2>

        <div className="step1-form-grid">
          <div className="step1-main-fields">
            <div className="step1-field">
              <label className="step1-label">Title</label>
              <input
                type="text"
                className="step1-input"
                value={quizData.title}
                onChange={(e) => updateQuizField("title", e.target.value)}
                placeholder="Enter quiz title"
                required
              />
            </div>

            <div className="step1-field">
              <label className="step1-label">Description</label>
              <textarea
                className="step1-textarea"
                value={quizData.description}
                onChange={(e) =>
                  updateQuizField("description", e.target.value)
                }
                placeholder="Enter quiz description"
              />
            </div>

            <div className="step1-field">
              <label className="step1-label">Visibility</label>
              <select
                className="step1-select"
                value={quizData.visibility}
                onChange={(e) => updateQuizField("visibility", e.target.value)}
              >
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <aside className="step1-side-panel">
            <h3>Setup Status</h3>
            <p>
              Give your quiz a clear title before moving to question building.
            </p>

            {stepValid ? (
              <div className="step1-valid-note">Ready for the next step.</div>
            ) : (
              <div className="step1-warning">Title is required.</div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}