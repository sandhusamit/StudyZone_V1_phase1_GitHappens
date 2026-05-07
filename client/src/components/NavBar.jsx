import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useRef, useState, useEffect } from "react";
import logo from "../assets/gitLogo.png";
import "./GlobalStyle.css";
import Whiteboard from "./Tools/Whiteboard";
import SmartCalculator from "./Tools/SmartCalculator";

function NavBar() {
  const waterRef = useRef(null);
  const musicRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const {
    isLoggedIn,
    isGuestLoggedIn,
    isGuest,
    authLoading,
    logoutUser,
  } = useAuth();

  const isAuthenticated = isLoggedIn || isGuestLoggedIn || isGuest;
  const isFullUser = isLoggedIn && !isGuestLoggedIn && !isGuest;
  const isGuestUser = isGuestLoggedIn || isGuest;

  const forceWhiteboardSelect = () => {
    window.dispatchEvent(new CustomEvent("whiteboard-force-select"));
  };

  const closeTools = () => {
    forceWhiteboardSelect();
    setShowTools(false);
  };

  const toggleTools = () => {
    setShowTools((prev) => {
      if (prev) forceWhiteboardSelect();
      return !prev;
    });
  };

  const toggleWhiteboard = () => {
    setShowWhiteboard((prev) => {
      const next = !prev;
      if (!next) forceWhiteboardSelect();
      return next;
    });
  };

  const handleLogout = () => {
    forceWhiteboardSelect();
    setShowTools(false);
    logoutUser();
  };

  useEffect(() => {
    waterRef.current = new Audio("/water.mp3");
    musicRef.current = new Audio("/music.mp3");

    waterRef.current.loop = true;
    musicRef.current.loop = true;

    return () => {
      waterRef.current?.pause();
      musicRef.current?.pause();
    };
  }, []);

  const toggleAudio = () => {
    if (!waterRef.current || !musicRef.current) return;

    if (isPlaying) {
      waterRef.current.pause();
      musicRef.current.pause();
    } else {
      waterRef.current
        .play()
        .catch((err) => console.log("Water audio play error:", err));

      musicRef.current
        .play()
        .catch((err) => console.log("Music audio play error:", err));
    }

    setIsPlaying((prev) => !prev);
  };


  return (
    <div className="navspace">
      <nav className="navbar-main">
        <div className="nav-left">
          <Link to="/" onClick={forceWhiteboardSelect}>
            <img src={logo} alt="StudyZone Logo" className="logo" />
          </Link>
        </div>

        <div className="nav-center">
          <Link to="/" onClick={forceWhiteboardSelect}>Home</Link>

          {!authLoading && isFullUser && (
            <>
              <Link to="/dashboard" onClick={forceWhiteboardSelect}>Dashboard</Link>
              <Link to="/quizlist" onClick={forceWhiteboardSelect}>Quizzes</Link>
              <Link to="/leaderboard" onClick={forceWhiteboardSelect}>Leaderboard</Link>
              <Link to="/profile" onClick={forceWhiteboardSelect}>Profile</Link>
            </>
          )}

          {!authLoading && isGuestUser && (
            <Link to="/quizlist" onClick={forceWhiteboardSelect}>
              Public Quizzes
            </Link>
          )}
        </div>

        <div className="nav-right">
          <button type="button" onClick={toggleTools}>
            Tools ▾
          </button>

          {!authLoading && isAuthenticated && (
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          )}

          {!authLoading && !isAuthenticated && (
            <>
              <Link to="/login" onClick={forceWhiteboardSelect}>Login</Link>
              <Link to="/register" onClick={forceWhiteboardSelect}>Register</Link>
            </>
          )}
        </div>
      </nav>

      <div
        className={`tools-dropdown ${
          showTools ? "tools-dropdown-show" : "tools-dropdown-hide"
        }`}
      >
        <div className="tools-dropdown-header">
          <div>
            <h3>Study Tools</h3>
            <p>Music, whiteboard, matrix work, and quick notes.</p>
          </div>

          <button
            type="button"
            onClick={closeTools}
            className="close-tools-btn"
          >
            ✕
          </button>
        </div>

        <div className="tools-actions">
          <button type="button" onClick={toggleAudio}>
            {isPlaying ? "Pause Music" : "Play Music"}
          </button>

          <button type="button" onClick={toggleWhiteboard}>
            {showWhiteboard ? "Hide Whiteboard" : "Open Whiteboard"}
          </button>

          <button type="button" onClick={() => setShowCalculator(!showCalculator)}>
            {showCalculator ? "Hide Calculator" : "Open Calculator"}
          </button>
        </div>

        <div
          className={`navbar-whiteboard-panel ${
            showWhiteboard
              ? "navbar-whiteboard-show"
              : "navbar-whiteboard-hide"
          }`}
        >
          <Whiteboard />
        </div>

        <div
          className={`navbar-calculator-panel ${
            showCalculator
              ? "navbar-calculator-show"
              : "navbar-calculator-hide"
          }`}
        >
          <SmartCalculator />
        </div>
      </div>
    </div>
  );
}

export default NavBar;