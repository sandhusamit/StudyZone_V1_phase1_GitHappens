import jwt from "jsonwebtoken";

export const generateQuizAccessToken = (user, quizId, expiresIn="7d") => {
  return jwt.sign(
    {
      quizId,
      scope: "quiz_access",
      ownerId: user?.id || user?._id,
    },
    process.env.QUIZ_SHARE_SECRET,
    { expiresIn }
  );
};

export const verifyQuizAccessToken = (token, quizId) => {
  try {
    const decoded = jwt.verify(token, process.env.QUIZ_SHARE_SECRET);

    return (
      decoded?.scope === "quiz_access" &&
      decoded?.quizId?.toString() === quizId?.toString()
    );
  } catch {
    return false;
  }
};

export const generateGuestToken = (guest, quizId = null) => {
  return jwt.sign(
    {
      guestId: guest._id,
      name: guest.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" } // also fix this typo
  );
};