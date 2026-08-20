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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleNavigation = () => {
    forceWhiteboardSelect();
    setIsMobileMenuOpen(false);
    setShowTools(false);
  };

  const closeTools = () => {
    forceWhiteboardSelect();
    setShowTools(false);

    if (window.matchMedia("(max-width: 1024px)").matches) {
      setIsMobileMenuOpen(true);
    }
  };

  const toggleMobileMenu = () => {
    if (showTools) forceWhiteboardSelect();
    setShowTools(false);
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleTools = () => {
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
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

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1025px)");

    const handleDesktopChange = (event) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", handleDesktopChange);
    document.addEventListener("keydown", handleEscape);

    return () => {
      desktopQuery.removeEventListener("change", handleDesktopChange);
      document.removeEventListener("keydown", handleEscape);
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
      <nav className="navbar-main" aria-label="Primary navigation">
        <div className="nav-left">
          <Link to="/" onClick={handleNavigation}>
            <img src={logo} alt="StudyZone Logo" className="logo" />
          </Link>
        </div>

        <button
          type="button"
          className="hamburger-button"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="primary-navigation-menu"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div
          id="primary-navigation-menu"
          className={`nav-menu ${isMobileMenuOpen ? "nav-menu-open" : ""}`}
        >
          <div className="nav-center">
            <Link to="/" onClick={handleNavigation}>Home</Link>

            {!authLoading && isFullUser && (
              <>
                <Link to="/dashboard" onClick={handleNavigation}>Dashboard</Link>
                <Link to="/quizlist" onClick={handleNavigation}>Quizzes</Link>
                <Link to="/leaderboard" onClick={handleNavigation}>Leaderboard</Link>
                <Link to="/profile" onClick={handleNavigation}>Profile</Link>
              </>
            )}

            {!authLoading && isGuestUser && (
              <Link to="/quizlist" onClick={handleNavigation}>
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
                <Link to="/login" onClick={handleNavigation}>Login</Link>
                <Link to="/register" onClick={handleNavigation}>Register</Link>
              </>
            )}
          </div>
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

          <button
            type="button"
            onClick={() => setShowCalculator((prev) => !prev)}
          >
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
