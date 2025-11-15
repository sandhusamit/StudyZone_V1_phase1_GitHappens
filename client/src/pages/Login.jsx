<<<<<<< HEAD
import { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

=======
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function login() {
  const { loginUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

>>>>>>> 918ce62af2785af261320dc401251db48ff499c6
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting login with:", formData); // DEBUG: payload

<<<<<<< HEAD
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status); // DEBUG: status

      const data = await response.json();
      console.log("Response data:", data); // DEBUG: what server sent

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token saved to localStorage:", data.token);

        alert("Login successful!");
        setFormData({ username: "", email: "", password: "" });
        window.location.href = "/";
      } else {
        console.error("Login failed:", data.message || data);
        alert("Login failed. Check console for details.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Server error. Try again later.");
    }
=======
    await loginUser(user);
>>>>>>> 918ce62af2785af261320dc401251db48ff499c6
  };

  return (
    <section style={{ margin: "2rem auto", padding: "1rem", maxWidth: "1200px" }}>
      <h2 style={{ color: "#0077ff", marginBottom: "1.5rem", textAlign: "center" }}>
        Login
      </h2>

      <div 
        style={{ 
          display: "flex", 
          alignItems: "flex-start", 
          justifyContent: "center", 
          gap: "2rem", 
          width: "100%" 
        }}
      >
        <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: "500px" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="username">Username</label><br />
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="email">Email</label><br />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="password">Password</label><br />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>

          <button 
            type="submit" 
            style={{
              padding: "0.7rem 1.5rem",
              backgroundColor: "#0077ff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </form>
      </div>
    </section>
  );
}
