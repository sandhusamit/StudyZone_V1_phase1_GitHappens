import { Link } from "react-router-dom";
import "./styles/Dashboard.css";

export default function Dashboard() {
  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">StudyZone Command Center</p>
          <h1>Welcome back.</h1>
          <p className="dashboard-subtitle">
            Build quizzes, review progress, practice smarter, and keep your study tools close.
          </p>
        </div>

        <div className="dashboard-hero-card">
          <span>Current Focus</span>
          <strong>Quiz Creation</strong>
          <p>Analytics coming soon.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <Link to="/create" className="dashboard-card primary-card">
          <span className="card-icon">＋</span>
          <h3>Create Quiz</h3>
          <p>Build MCQ, drag-drop, matrix, and study questions.</p>
        </Link>

        <Link to="/quizlist" className="dashboard-card">
          <span className="card-icon">📚</span>
          <h3>My Quizzes</h3>
          <p>View, play, manage, and share your quiz collection.</p>
        </Link>

        <Link to="/leaderboard" className="dashboard-card">
          <span className="card-icon">🏆</span>
          <h3>Leaderboard</h3>
          <p>Compare scores and see top public quiz results.</p>
        </Link>

        <Link to="/profile" className="dashboard-card">
        <span className="card-icon">👤</span>
        <h3>Profile</h3>
        <p>Manage your account settings and preferences.</p>
      </Link>
      </section>

      <section className="dashboard-lower-grid">
        <div className="dashboard-panel">
          <h3>Coming Soon: Analytics</h3>

          <div className="stat-row">
            <span>Average Score</span>
            <strong>--%</strong>
          </div>

          <div className="stat-row">
            <span>Last Played Quiz</span>
            <strong>Coming soon</strong>
          </div>

          <div className="stat-row">
            <span>Total Attempts</span>
            <strong>--</strong>
          </div>
        </div>

        <div className="dashboard-panel">
          <h3>Quick Ideas</h3>
          <h4>Ideas to be implemented</h4>

          <ul className="dashboard-ideas" >
            <li>Track weak subjects by quiz category.</li>
            <li>Show last 5 quiz attempts.</li>
            <li>Recommend quizzes to replay.</li>
            <li>Show streaks and weekly study time.</li>
          </ul>
        </div>

        <div className="dashboard-panel feedback-panel">
          <h3>Feedback</h3>

          <p>
            What analytics would you like to see? What would help you study better?
          </p>

          <a
            className="feedback-link"
            href={`mailto:${import.meta.env.VITE_FEEDBACK_EMAIL}?subject=StudyZone Feedback`}          >
            Send suggestions
          </a>
        </div>
      </section>
    </main>
  );
}