import EmailOTP from '../model/otpModel.js';

export async function generateOTP(email, length = 6) {
  // Generate numeric OTP
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }


  return otp;
}

export async function generateQuizURL(quizId) {
  // Generate a unique URL for the quiz
  return `https://quizapp.com/quiz/${quizId}`;
}