import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import "./styles/Login.css";


export default function Login() {
  const { loginUser, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2FA step
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: login, 2: OTP


  const handleVerifyOTP = async (e) => {
    e.preventDefault();
  
    const result = await verifyOTP(email, otpCode);
  
    console.log("OTP Result:", result);
  
    if (result?.hasError) {
      alert("Invalid OTP. Try again.");
      return;
    }
  
    // OTP success → user is authenticated
    navigate("/");
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const creds = { email, password };

    // loginUser now returns backend data
    const userData = await loginUser(creds);

    if (userData?.hasError) {
      alert(userData.message || 'Login failed. Please try again.');
      return;
    }

    console.log("Login: Received userData:", userData);
    // If login requires 2FA:
    if (userData && userData.is2FAEnabled) {
      setStep(2);
      return;
    }

    if (userData && !userData.hasError && !userData.is2FAEnabled) {
      // Login successful without 2FA

      navigate('/');
    }
  };

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
            onChange={({ target }) => setEmail(target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="form-inputs login-input"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />

          <button type="submit" className="login-button">
            Login to StudyZone
          </button>

        </form>
      )}

      {step === 2 && (
        <div className="otp-section">

          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit code from your authenticator app:</p>

          <input
            type="text"
            className="form-inputs otp-input"
            value={otpCode}
            onChange={({ target }) => setOtpCode(target.value)}
          />

          <button onClick={handleVerifyOTP}>
            Verify OTP
          </button>

        </div>
      )}

      {step === 3 && (
        <p className="login-status">
          Login successful! Redirecting...
        </p>
      )}

    </div>

  </div>
);
}

