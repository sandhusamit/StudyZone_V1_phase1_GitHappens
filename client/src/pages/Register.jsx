import { useAuth } from '../contexts/AuthContext';
import './styles/Register.css';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  emailOtp,
  setup2fa,
  verifyEmailOtp,
  verifyOTP
} from '../services/auth';
import { getUserByUsername, emailExists } from '../services/user';
import { set } from 'mongoose';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  // --------------------
  // FORM STATE
  // --------------------
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [existingUserEmail, setExistingUserEmail] = useState(null);

  // --------------------
  // FLOW STATE
  // --------------------
  const [step, setStep] = useState(1);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [qrCode, setQrCode] = useState('');

  // --------------------
  // VALIDATION HELPERS
  // --------------------

  const validateRequired = (e) => {
    e.target.setCustomValidity(
      e.target.value ? '' : 'This field is required.'
    );
    e.target.reportValidity();
  };

  const validateEmail = async (e) => {
    const input = e.target;
    validateRequired(e);
  
    if (!input.checkValidity()) return;
  
    const result = await emailExists(input.value);
  
    if (result?.exists) {
      input.setCustomValidity('Email already in use.');
    } else {
      input.setCustomValidity('');
    }
  
    input.reportValidity();
  };
  

  let usernameTimer;

  const validateUsername = (e) => {
    const input = e.target;
    const value = input.value.trim();

    clearTimeout(usernameTimer);

    if (value.length < 3) {
      input.setCustomValidity('Username must be at least 3 characters.');
      input.reportValidity();
      return;
    }

    input.setCustomValidity('');

    usernameTimer = setTimeout(async () => {
      const result = await getUserByUsername(value);

      if (result?.user) {
        input.setCustomValidity('Username already taken.');
      } else {
        input.setCustomValidity('');
      }

      input.reportValidity();
    }, 400);
  };

  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const otpTimerRef = useRef(null);
  
  const startOtpTimer = (duration = 120) => {
    clearInterval(otpTimerRef.current);
  
    setOtpTimeLeft(duration);
  
    otpTimerRef.current = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(otpTimerRef.current);
          onOtpExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const onOtpExpired = () => {
    alert("OTP expired. Please request a new one.");
  };
  


  // --------------------
  // STEP 1 — SEND EMAIL OTP
  // --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    const result = await emailOtp(email);

    if (result?.hasError) {
      alert(result.message);
      return;
    }

    alert('OTP sent to email');
    startOtpTimer(); // Restart timer
    setStep(2);

  };

  const handleResendOtp = async () => {
    const result = await emailOtp(email);

    if (result?.hasError) {
      alert(result.message);
      return;
    }

    alert('OTP resent to email');
    startOtpTimer(); // Restart timer
  }

  // --------------------
  // STEP 2 — VERIFY EMAIL
  // --------------------
  const handleVerifyEmail = async () => {
    console.log("Verifying email OTP for:", email, emailOtpCode);
    const res = await verifyEmailOtp(email, emailOtpCode);

    console.log("Email OTP verification result:", res);
    if (res?.hasError) {
      alert(res.message);
      return;
    }

    const user = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    const registration = await registerUser(user);

    if (registration?.hasError) {
      alert(registration.message);
      return;
    }

    const success = await setup2FA();
    if (success) setStep(3);
  };

  const setup2FA = async () => {
    const res = await setup2fa(email);
    if (res?.hasError) return false;

    setQrCode(res.qrCodeImageUrl);
    return true;
  };

  // --------------------
  // VERIFY 2FA
  // --------------------
  const handleVerifyOTP = async () => {
    const res = await verifyOTP(email, otpCode);

    if (res?.hasError) {
      alert(res.message);
      return;
    }

    alert('2FA enabled successfully!');
    navigate('/login');
  };

  // --------------------
  // UI
  // --------------------
return (
  <div className="register-page">
    <div className="register-container">
      <h1 className="register-title">Register Here</h1>
      <p className="register-subtitle">Create your StudyZone account</p>

      {step === 1 && (
        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <input
            type="text"
            placeholder="First Name"
            className="form-inputs register-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={validateRequired}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            className="form-inputs register-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={validateRequired}
            required
          />

          <input
            type="text"
            placeholder="Username"
            className="form-inputs register-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={validateUsername}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="form-inputs register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="form-inputs register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <div className="register-button-row">
            <button type="submit" className="register-button">
              Create Account
            </button>

            <button
              type="button"
              className="register-button register-button-secondary"
              onClick={() => {
                setFirstName("");
                setLastName("");
                setUsername("");
                setEmail("");
                setPassword("");
              }}
            >
              Clear
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="verify-email-section">
          <h2>Verify Email</h2>
          <p className="verify-email-text">
            Enter the 6-digit code sent to your email.
          </p>

          <input
            type="text"
            className="form-inputs verify-email-input"
            placeholder="6-digit code"
            value={emailOtpCode}
            onChange={(e) => setEmailOtpCode(e.target.value)}
          />

          <span className="verify-email-timer">
            {String(Math.floor(otpTimeLeft / 60)).padStart(2, "0")}:
            {String(otpTimeLeft % 60).padStart(2, "0")}
          </span>

          <div className="register-button-row">
            <button onClick={handleVerifyEmail} className="register-button">
              Verify Email
            </button>

            <button
              onClick={handleResendOtp}
              className="register-button register-button-secondary"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="twofa-section">
          <h2>Two-Factor Authentication</h2>
          <p className="twofa-text">
            Scan the QR code with your authenticator app, then enter the 6-digit code.
          </p>

          {qrCode && (
            <img src={qrCode} alt="QR Code" className="twofa-qr" />
          )}

          <input
            type="text"
            className="form-inputs twofa-input"
            placeholder="6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <button onClick={handleVerifyOTP} className="register-button">
            Complete Setup
          </button>
        </div>
      )}
    </div>
  </div>
);
}
