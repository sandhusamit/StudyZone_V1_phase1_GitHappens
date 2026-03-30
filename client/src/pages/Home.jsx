import { Link } from "react-router-dom";
import "./styles/Home.css";
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Home() {
  const { isLoggedIn, logoutUser } = useAuth();
  return (
    <div className="home-container">

      {/* Logo + Title */}
      <header className="home-header">
        <h1>StudyZone</h1>
        <p>Your personal study and quiz companion</p>
      </header>

      {/* Features */}
      <section className="home-features">
        <h2>Features</h2>
        <ul>
          <li>✔ Create quizzes with multiple questions</li>
          <li>✔ Manage your questions independently</li>
          <li>✔ Create Multiple Choice Questions in bulk with a single paste.</li>
          <li>✔ Create Drag and Drop Questions</li>
          <li>✔ Set quiz visibility to public or private</li>
          <li>✔ Reuse existing questions created by yourself and others (question pool)</li>


          <li>✔ Take quizzes and track results</li>
          <li>✔ Secure login with JWT authentication</li>
          <li>✔ Profile page to manage your account</li>
        </ul>
      </section>

      {/* Auth Buttons */}
      {isLoggedIn ? (
        <section className="home-actions">
          <button onClick={logoutUser} className="btn btn-secondary">Logout</button>
        </section>
      ) :               
      
      <section className="home-actions">
      <Link to="/login" className="btn">Sign In</Link>
      <Link to="/register" className="btn btn-secondary">Sign Up</Link>
      </section>}

      <div className="home-description">
      <h2 style={
        { color: '#6ab4ff',
          textAlign: 'center',
          marginBottom: '20px',
          textShadow: '0 0 12px rgba(106, 180, 255, 0.25)', 
          
        }}>About StudyZone</h2>
      <p>
        StudyZone is an interactive quiz platform designed to give users full control over how they create and engage with learning content. It allows users to build quizzes manually, import large sets of questions through a bulk parser, select from an existing question pool, and create both traditional multiple-choice and advanced drag-and-drop questions. With user authentication and flexible visibility options (private, unlisted, and public), StudyZone supports personalized and shareable learning experiences. Users can play quizzes with real-time feedback and scoring, 
        while the system is backed by structured data management and automated testing to ensure reliability. Overall, StudyZone provides a dynamic and scalable environment for creating, practicing, and refining knowledge.
      </p>
      </div>


    </div>
  );
}
