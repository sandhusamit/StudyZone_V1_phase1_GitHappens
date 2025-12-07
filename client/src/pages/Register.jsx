import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { setup2FA } from '../../../server/controller/user';


export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  // 2FA states
  const [qrCode, setQrCode] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState(1); // 1: registration, 2: 2FA setup


  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = {
      firstName,
      lastName,
      username,
      email,
      password,
    };

    const data = await registerUser(user);


    // 2FA setup can be done here after registration if needed
    const success = await setup2FA(email);
    if (success) {
      // setError(''); 
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
// Gives us the URL of the QR code image to display
      const data = await response.json();

      if (!response.ok) {
        // setError(data.message || 'Error setting up 2FA');
        return false;
      }

      setQrCode(data.qrCodeImageUrl);
      return true;
    } catch (error) {
      // setError('Server error during 2FA setup');
      return false;
    }
  }

  
  return (
    <>
      <h1>Register Here </h1>
      {step === 1 && (
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="firstName"
          aria-label="firstName"
          placeholder="First Name"
          className="form-inputs"
          value={firstName}
          onChange={({ target: { value } }) => setFirstName(value)}
        />

        <input
          type="text"
          name="lastName"
          aria-label="lastName"
          placeholder="Last Name"
          className="form-inputs"
          value={lastName}
          onChange={({ target: { value } }) => setLastName(value)}
        />

        <input
          type="text"
          name="username"
          aria-label="username"
          placeholder="Username"
          className="form-inputs"
          value={username}
          onChange={({ target: { value } }) => setUsername(value)}
        />

        <input
          type="email"
          name="email"
          aria-label="email"
          placeholder="Email"
          className="form-inputs"
          value={email}
          onChange={({ target: { value } }) => setEmail(value)}
        />

        <input
          type="password"
          name="password"
          aria-label="password"
          placeholder="Password"
          className="form-inputs"
          value={password}
          onChange={({ target: { value } }) => setPassword(value)}
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
              alt="QR Code for 2FA Setup"
              style={{ width: 250, height: 250 }}
            />
          )}
          <p>After scanning, enter the 6-digit code from your authenticator app to complete setup.</p>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="form-inputs"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />
          <button onClick={() => navigate('/')}>
            Complete Registration
          </button>
        </div>
      )}
    </>
  );
}
