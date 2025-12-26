import EmailOTP from '../model/otpModel.js';

export async function generateAndSaveOTP(email, length = 6) {
  // Generate numeric OTP
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }

  // Set expiry: 2 minutes from now
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); //2 minutes

  // Save to DB
  const otpEntry = new EmailOTP({ email, otp, expiresAt });
  await otpEntry.save();

  return otp;
}
