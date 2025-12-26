import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

    console.log("Login: Received userData:", userData);
    // If login requires 2FA:
    if (userData && userData.is2FAEnabled) {
      setStep(2);
      return;
    }

    // If login succeeded normally:
    if (userData && !userData.is2FAEnabled && !userData.hasError) {
      navigate("/");
    }
  };

  return (
    <>
      <h1>Login</h1>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            name="email"
            aria-label="login-email"
            placeholder="Email"
            className="form-inputs"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
          />

          <input
            type="password"
            name="password"
            aria-label="login-password"
            placeholder="Password"
            className="form-inputs"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />

          <button type="submit">Login to StudyZone</button>
        </form>
      )}

      {step === 2 && (
        <>
          <h2>Two-Factor Authentication</h2>
          <p>Enter the 6-digit code from your authenticator app:</p>

          <input
            type="text"
            name="otpCode"
            aria-label="otp-code"
            placeholder="Enter OTP Code"
            className="form-inputs"
            value={otpCode}
            onChange={({ target }) => setOtpCode(target.value)}
          />

          <button onClick={handleVerifyOTP}>Verify OTP</button>
        </>
      )}
    </>
  );
}

