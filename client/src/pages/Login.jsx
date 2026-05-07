//Style
import "./styles/Login.css";
//Hooks
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useGuestLogin } from "../utils/Hooks/GuestLogin.js";
//Components
import GuestLoginCard from "../components/Login/GuestLoginCard.jsx";


export default function Login() {

  //Context Methods
  const { loginUser, loginGuest, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const { handleGuestLogin } = useGuestLogin();

  //States - Causes Rendering on change
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1); // 1 = login, 2 = OTP, 4 = guest


  //Component Methods
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = await loginUser({ email, password });

    if (userData?.hasError) {
      alert(userData.message || "Login failed. Please try again.");
      return;
    }

    if (userData?.is2FAEnabled) {
      setStep(2);
      return;
    }

    navigate("/");
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    const result = await verifyOTP(email, otpCode);

    if (result?.hasError) {
      alert("Invalid OTP. Try again.");
      return;
    }

    navigate("/");
  };

  //   e.preventDefault();

  //   if (!guestName.trim()) {
  //     alert("Please enter a guest name.");
  //     return;
  //   }

  //   const guestData = await loginGuest({
  //     name: guestName.trim(),
  //   });

  //   if (guestData?.hasError) {
  //     alert(guestData.message || "Guest login failed. Please try again.");
  //     return;
  //   }

  //   navigate("/");
  // };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">Login</h1>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Email"
              className="form-inputs login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="form-inputs login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="login-button">
              Login to StudyZone
            </button>

            <button
              type="button"
              className="guest-login-button"
              onClick={() => setStep(4)}
            >
              Guest Login
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="otp-section">
            <h2>Two-Factor Authentication</h2>
            <p>Enter the 6-digit code from your authenticator app:</p>

            <input
              type="text"
              className="form-inputs otp-input"
              placeholder="123456"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              required
            />

            <button type="submit" className="login-button">
              Verify OTP
            </button>

            <button type="button" onClick={() => setStep(1)}>
              Back
            </button>
          </form>
        )}

        {step === 4 && (
          <GuestLoginCard
            onGuestLogin={handleGuestLogin}
           />

        )}
      </div>
    </div>
  );
}