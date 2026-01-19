/**
 * middleware/adminOnly.js
 * --------------------------------------------------
 * Admin-only guard:
 * - Ellenőrzi, hogy a felhasználó be van-e jelentkezve
 * - Ellenőrzi, hogy admin jogosultsága van-e
 *
 * Előfeltétel:
 * - authMiddleware már lefutott ÉS beállította a req.user-t
 *
 * Használat:
 * router.put("/...", adminOnly, handler)
 * --------------------------------------------------
 */

export default function adminOnly(req, res, next) {
  // nincs bejelentkezve
  if (!req.user) {
    return res.status(401).json({
      message: "Nincs bejelentkezve.",
      code: "NOT_AUTHENTICATED",
    });
  }

  // nem admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Nincs jogosultság (admin szükséges).",
      code: "NOT_AUTHORIZED",
    });
  }

  // minden ok
  next();
}
