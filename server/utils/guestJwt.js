import jwt from "jsonwebtoken";

export const generateGuestToken = (guest, quizId = null) => {
  return jwt.sign(
    {
      guestId: guest._id,
      name: guest.name,
      quizId,          // optional (only when needed)
      role: "guest",
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" } // also fix this typo
  );
};

export default generateGuestToken;