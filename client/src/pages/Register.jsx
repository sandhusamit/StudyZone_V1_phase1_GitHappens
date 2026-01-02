import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
    setStep(2);
  };

  // --------------------
  // STEP 2 — VERIFY EMAIL
  // --------------------
  const handleVerifyEmail = async () => {
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
    <>
      <h1>Register Here</h1>

      {step === 1 && (
        <form className="form" onSubmit={handleSubmit} noValidate>

          <input
            type="text"
            placeholder="First Name"
            className="form-inputs"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={validateRequired}
            required
          />

          <input
            type="text"
            placeholder="Last Name"
            className="form-inputs"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={validateRequired}
            required
          />

          <input
            type="text"
            placeholder="Username"
            className="form-inputs"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onBlur={validateUsername}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className="form-inputs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateEmail}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="form-inputs"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          <button type="submit">Create Account</button>
          <button type="button" onClick={() => {
            setFirstName('');
            setLastName('');
            setUsername('');
            setEmail('');
            setPassword('');
          }}>
            Clear
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="verify-email">
          <h2>Verify Email</h2>
          <input
            type="text"
            className="form-inputs"
            placeholder="6-digit code"
            value={emailOtpCode}
            onChange={(e) => setEmailOtpCode(e.target.value)}
          />
          <button onClick={handleVerifyEmail}>Verify Email</button>
        </div>
      )}

      {step === 3 && (
        <div className="twofa-container">
          <h2>Two-Factor Authentication</h2>

          {qrCode && (
            <img src={qrCode} alt="QR Code" width={250} />
          )}

          <input
            type="text"
            className="form-inputs"
            placeholder="6-digit code"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <button onClick={handleVerifyOTP}>
            Complete Setup
          </button>
        </div>
      )}
    </>
  );
}
