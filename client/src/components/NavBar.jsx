import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/gitLogo.png';
import './GlobalStyle.css';

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


        {/* Conditional: show login OR quizzes + logout */}
        {isLoggedIn && (
          <>
            <Link to="/dashboard">Dashboard</Link> - 
            <Link to="/quizlist">Quizzes</Link> - 
            {/* <Link to="/create">Create Quiz</Link> - just make it so theres a + button on quizList  */}
            <Link to="/leaderboard">Leaderboard</Link> -
            <button onClick={logoutUser}>Logout</button>
            <Link to="/profile">Profile</Link> 

          </>
        )}
        {!isLoggedIn && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        
      </nav>
    </div>
    </>
  );
}
export default NavBar;