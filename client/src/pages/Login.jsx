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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json"
         },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json(); // assuming your server returns a token
        localStorage.setItem("token", data.token); // save token
        alert("Login successful!");
        setFormData({ username: "", email: "", password: "" });
        window.location.href = "/"; // redirect to home after login
    }
    else {
        console.error("Failed to login");
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Server error. Please try again later.");
    }
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
