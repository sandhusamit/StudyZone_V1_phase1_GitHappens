import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRef, useState, useEffect } from 'react';
import logo from '../assets/gitLogo.png';
import './GlobalStyle.css';

function NavBar() {
  const waterRef = useRef(null);
  const musicRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    waterRef.current = new Audio("/water.mp3");
    musicRef.current = new Audio("/music.mp3");

    waterRef.current.loop = true;
    musicRef.current.loop = true;

    return () => {
      waterRef.current.pause();
      waterRef.current.currentTime = 0;
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    };
  }, []);

  const toggleAudio = () => {
    if (!waterRef.current || !musicRef.current) return;

    if (isPlaying) {
      waterRef.current.pause();
      musicRef.current.pause();
    } else {
      waterRef.current.play().catch(err => console.log("Water audio play error:", err));
      musicRef.current.play().catch(err => console.log("Music audio play error:", err));
    }

    setIsPlaying(!isPlaying);
  };

  const { isLoggedIn, logoutUser } = useAuth();

  return (
    <div className="navspace">
      <nav className="navbar">
        <div className="logo-div">
          <Link to="/">
            <img src={logo} alt="Git Logo" className="logo" />
          </Link>
        </div>

        <button onClick={toggleAudio} className="audio-toggle">
          {isPlaying ? "Pause Music" : "Play Music"}
        </button>

        <Link to="/">Home</Link>

        {isLoggedIn && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/quizlist">Quizzes</Link>
            <Link to="/leaderboard">Leaderboard</Link>
            <Link to="/profile">Profile</Link>
            <button onClick={logoutUser}>Logout</button>
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
  );
}

export default NavBar;
