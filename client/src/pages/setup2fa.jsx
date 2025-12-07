import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Setup2FA() {
  const navigate = useNavigate();
  const { authUserId, jwtToken } = useAuth();


  //State Variables needed to setup 2FA
  const [email, setEmail] = useState(""); 
  const [qrCode, setQrCode] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // 1: generate QR, 2: enter otp



//request for post in setup2fa route - calls setup2fa
  const handleGenerateQR = async () => {
    try {
      const res = await fetch("/api/setup-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
//secret, qr code, qrcode image URL have been set 
      const data = await res.json();

      // Error handling
      if (!res.ok) {
        setMessage(data.message || "Error generating QR code");
        return;
      }

      setQrCode(data.qrCodeImageUrl);
      setStep(2);
      setMessage("");
    } catch (err) {
      setMessage("Server error while generating QR");
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: otpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Invalid code");
        return;
      }

      setMessage("2FA successfully enabled!");
      setTimeout(() => navigate("/login"), 1500);

    } catch (err) {
      setMessage("Failed to verify 2FA");
    }
  };

  return (
    <div className="twofa-container">
      <h1>Set Up Two-Factor Authentication</h1>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {/* STEP 1 - Enter email + generate QR */}
      {step === 1 && (
        <>
          <p>Enter your account email to begin 2FA setup.</p>

          <input
            type="email"
            placeholder="Email"
            className="form-inputs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={handleGenerateQR}>
            Generate QR Code
          </button>
        </>
      )}

      {/* STEP 2 - Show QR and prompt for OTP */}
      {step === 2 && (
        <>
          <h3>Scan This QR Code</h3>

          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code for 2FA Setup"
              style={{ width: 250, height: 250 }}
            />
          )}

          <p>
            After scanning, enter the 6-digit code from your authenticator app.
          </p>

          <input
            type="text"
            placeholder="Enter 6-digit code"
            className="form-inputs"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
          />

          <button onClick={handleVerify}>
            Verify & Enable 2FA
          </button>
        </>
      )}
    </div>
  );
}
