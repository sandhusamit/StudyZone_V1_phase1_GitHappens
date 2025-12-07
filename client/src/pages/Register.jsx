import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2FA states
  const [qrCode, setQrCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      firstName,
      lastName,
      username,
      email,
      password,
      is2FAEnabled: false, 
    };

    const data = await registerUser(user);

    // If registration failed
    if (!data || data.hasError) {
      alert(data?.message || "Registration failed.");
      return;
    }

    // Setup 2FA
    const success = await setup2FA(email);
    if (success) {
      setStep(2);
    }
  };

  const setup2FA = async (email) => {
    try {
      const response = await fetch('/api/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) return false;

      setQrCode(data.qrCodeImageUrl);
      return true;

    } catch (error) {
      return false;
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("2FA successfully enabled!");
      navigate("/login");

    } catch (err) {
      alert("Error verifying 2FA");
    }
  };

  return (
    <>
      <h1>Register Here</h1>

      {step === 1 && (
        <form onSubmit={handleSubmit} className="form">

          <input
            type="text"
            placeholder="First Name"
            className="form-inputs"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Last Name"
            className="form-inputs"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Username"
            className="form-inputs"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="form-inputs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="form-inputs"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Create Account</button>
        </form>
      )}

      {step === 2 && (
        <div className="twofa-container">
          <h2>Set Up Two-Factor Authentication</h2>
          <p>Scan the QR code below with your authenticator app:</p>

          {qrCode && (
            <img
              src={qrCode}
              alt="2FA QR Code"
              style={{ width: 250, height: 250 }}
            />
          )}

          <p>Enter the 6-digit code from your authenticator app:</p>

          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="form-inputs"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <button onClick={handleVerifyOTP}>
            Complete 2FA Setup
          </button>
        </div>
      )}
    </>
  );
}
