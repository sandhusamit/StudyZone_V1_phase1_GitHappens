import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/gitLogo.png';
import './NavBar.css';

function NavBar() {
  const { isLoggedIn, logoutUser } = useAuth();

  return (
    <>
      <div className="navspace">
        <nav className="navbar">
          <div className="logo-div">
            <Link to="/">
              <img src={logo} alt="Git Logo" className="logo" />
            </Link>
          </div>
          <Link to="/">Home</Link>
          {isLoggedIn ? (
            <button onClick={logoutUser}>Logout</button>
          ) : (
            <>
              -<Link to="/login">Login</Link>-<Link to="/register">Register</Link> -
              <Link to="/dashboard">Dashboard</Link> -
            </>
          )}
          <Link to="/quizlist">Quizzes</Link> -<Link to="/play">Quiz Play</Link> -
          <Link to="/create">Create Quiz</Link> -<Link to="/profile">Profile</Link> -
          <Link to="/leaderboard">Leaderboard</Link>
        </nav>
      </div>
    </>
  );
}
export default NavBar;
