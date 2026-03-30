import jwt from 'jsonwebtoken';

export const generateGuestToken = (quizId) => {
  return jwt.sign(
    { quizId, role: "guest" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

export default generateGuestToken;