// +------------------------------------------------------------------+
// |                           adminOnly.js                           |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * adminOnly.js - Express middleware modul
 * =====================================================================
 *
 * Funkcio:
 * - Keresek elofeldolgozasa, jogosultsag es auth ellenorzes
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

/**
 * middleware/adminOnly.js
 * --------------------------------------------------
 * Admin jogosultság ellenőrző middleware.
 *
 * Előfeltétel:
 * - authMiddleware már lefutott
 * - req.user létezik
 *
 * Feladata:
 * - ellenőrzi hogy a user be van-e jelentkezve
 * - ellenőrzi hogy admin-e
 *
 * Ha nem:
 * → 401 NOT_AUTHENTICATED
 * → 403 NOT_AUTHORIZED
 *
 * Használat:
 * router.put("/users/:id", authMiddleware, adminOnly, handler)
 */

export default function adminOnly(req, res, next) {

  if(req.user===undefined){
  console.log("adminOnly req: ", req)
  console.log("adminOnly user: ", req.user)}

  // nincs bejelentkezve
  if (!req.user) {
    console.log("adminOnly: nincs bejelentkezve")
    return res.status(401).json({
      message: "Nincs bejelentkezve.",
      code: "NOT_AUTHENTICATED",
    });
  }

  // nem admin
  if (req.user.user_type !== 'ADMIN'){
    console.log("adminOnly: nem admin")
    return res.status(403).json({
      message: "Nincs jogosultság (admin szükséges).",
      code: "NOT_AUTHORIZED",
    });
  }

  next();
}