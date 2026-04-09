import jwt from "jsonwebtoken";

export const guestMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; 
  // Bearer token

  if (!token) {
    return res.status(401).json({ message: "Missing guest token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "guest") {
      return res.status(403).json({ message: "Invalid role" });
    }

    req.guest = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Guest token expired or invalid" });
  }
};

export default guestMiddleware;