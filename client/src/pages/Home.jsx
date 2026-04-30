import { Link } from "react-router-dom";
import "./styles/Home.css";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function Home() {
  const { isLoggedIn, logoutUser } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-panel">
        <div className="hero-badge">MERN • Quiz Builder • Math Tools • Question Pool</div>

        <h1>StudyZone</h1>

        <p className="hero-subtitle">
          Build, share, and practice interactive quizzes with powerful question types,
          smart organization, and flexible study tools.
        </p>

        <div className="home-actions">
          {isLoggedIn ? (
            <>
              <Link to="/createquiz" className="btn">Create Quiz</Link>
              <Link to="/quizlist" className="btn btn-secondary">Browse Quizzes</Link>
              <button onClick={logoutUser} className="btn btn-danger">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn">Sign In</Link>
              <Link to="/register" className="btn btn-secondary">Sign Up</Link>
            </>
          )}
        </div>
      </section>

      <section className="feature-grid">
        <div className="feature-card">
          <span>🧠</span>
          <h3>Multiple Choice Questions</h3>
          <p>Create clean MCQ questions with choices, answers, explanations, subjects, and scoring.</p>
        </div>

        <div className="feature-card">
          <span>🧩</span>
          <h3>Drag & Drop Questions</h3>
          <p>Build interactive matching-style questions using draggable items and custom dropboxes.</p>
        </div>

        <div className="feature-card">
          <span>矩</span>
          <h3>Matrix Questions</h3>
          <p>Create matrix addition, multiplication, determinant, inverse, transpose, REF, and RREF questions.</p>
        </div>

        <div className="feature-card">
          <span>⚡</span>
          <h3>Bulk Import Parser</h3>
          <p>Paste structured question text and instantly generate multiple questions at once.</p>
        </div>

        <div className="feature-card">
          <span>📚</span>
          <h3>Question Pool</h3>
          <p>Reuse your existing questions and pull from available public questions to build quizzes faster.</p>
        </div>

        <div className="feature-card">
          <span>🔐</span>
          <h3>Secure Accounts</h3>
          <p>User authentication, protected routes, profiles, private quizzes, and account-based content.</p>
        </div>

        <div className="feature-card">
          <span>🎯</span>
          <h3>Quiz Play Mode</h3>
          <p>Take quizzes, receive feedback, track results, and practice with randomized question rotation.</p>
        </div>

        <div className="feature-card">
          <span>🌐</span>
          <h3>Visibility Control</h3>
          <p>Set quizzes as private, public, or shareable depending on how you want others to access them.</p>
        </div>

        <div className="feature-card">
          <span>📊</span>
          <h3>Performance Tracking</h3>
          <p>Track quiz scores, accuracy, and progress over time to identify strengths and weaknesses.</p>
        </div>

        <div className="feature-card">
          <span>📈</span>
          <h3>Analytics & Insights</h3>
          <p>Analyze question difficulty, user performance trends, and overall quiz effectiveness.</p>
        </div>

        <div className="feature-card">
          <span>🧮</span>
          <h3>Optimized Data Handling</h3>
          <p>Efficient data modeling and retrieval using structured schemas for fast quiz loading and performance.</p>
        </div>

        <div className="feature-card">
          <span>🏗️</span>
          <h3>Scalable Backend Design</h3>
          <p>RESTful APIs and modular backend architecture designed for scalability and future feature expansion.</p>
        </div>




      </section>

      <section className="home-description">
        <h2>Why StudyZone?</h2>
        <p>
          StudyZone gives students and creators full control over how they build study content.
          Instead of being limited to simple flashcards or basic quizzes, users can create advanced
          question formats, organize reusable question banks, and practice through interactive quiz play.
        </p>
      </section>
    </div>
  );
}