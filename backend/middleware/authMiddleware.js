import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Hiányzó token"
    });
  }

  // Bearer token ellenőrzése
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Hibás Authorization formátum"
    });
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded payload:
    // {
    //   id,
    //   email,
    //   user_type
    // }

    req.user = decoded;

    next();

  } catch (err) {

    console.warn("⛔ Érvénytelen token:", err.message);

    return res.status(403).json({
      message: "Érvénytelen token"
    });
  }
}