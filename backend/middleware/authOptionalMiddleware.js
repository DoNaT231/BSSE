import jwt from "jsonwebtoken";

export default function authOptionalMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, ... }
    return next();
  } catch (e) {
    // rossz token esetén is csak "nem belépett"-ként kezeljük
    req.user = null;
    return next();
  }
}