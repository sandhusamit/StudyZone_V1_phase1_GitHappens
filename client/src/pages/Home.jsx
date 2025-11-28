import { Link } from "react-router-dom";
import "/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/pages/styles/Home.css";
import { useAuth } from '/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/contexts/AuthContext.jsx';

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




    </div>
  );
}
