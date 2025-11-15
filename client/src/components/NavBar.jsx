import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/gitLogo.png";
import "./NavBar.css";

export default function NavBar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      if (token) {
        await fetch("http://localhost:3000/api/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    // Clear token + update UI
    localStorage.removeItem("token");
    setIsLoggedIn(false);

    // Redirect
    window.location.href = "/";
  };

  return (
    <div className="navspace">
      <nav className="navbar">
        <div className="logo-div">
          <Link to="/">
            <img src={logo} alt="Git Logo" className="logo" />
          </Link>
        </div>

        <Link to="/">Home</Link> - 
        <Link to="/register">Register</Link> - 
        <Link to="/dashboard">Dashboard</Link> - 
        <Link to="/play">Quiz Play</Link> - 
        <Link to="/create">Create Quiz</Link> - 
        <Link to="/profile">Profile</Link> - 
        <Link to="/leaderboard">Leaderboard</Link> -

        {/* Conditional: show login OR quizzes + logout */}
        {isLoggedIn ? (
          <>
            <Link to="/quizlist">Quizzes</Link> - 
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </div>
  );
}
