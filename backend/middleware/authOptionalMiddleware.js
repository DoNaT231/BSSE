import jwt from "jsonwebtoken";

/**
 * middleware/authOptionalMiddleware.js
 * --------------------------------------------------
 * Opcionális authentikáció.
 *
 * Feladata:
 * - ha van token → dekódolja
 * - ha nincs token → req.user = null
 * - ha token hibás → req.user = null
 *
 * A request NEM áll le hibával.
 *
 * Így a route eldöntheti:
 * - vendég
 * - bejelentkezett user
 *
 * Használat:
 * router.get("/events", authOptionalMiddleware, handler)
 */

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