// +------------------------------------------------------------------+
// |                        authMiddleware.js                         |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * authMiddleware.js - Express middleware modul
 * =====================================================================
 *
 * Funkcio:
 * - Keresek elofeldolgozasa, jogosultsag es auth ellenorzes
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import jwt from "jsonwebtoken";

/**
 * middleware/authMiddleware.js
 * --------------------------------------------------
 * Kötelező authentikációs middleware.
 *
 * Feladata:
 * - Authorization header kiolvasása
 * - Bearer token ellenőrzése
 * - JWT token verifikálása
 * - decoded user payload req.user-be mentése
 *
 * Ha a token hibás vagy hiányzik:
 * → request leáll 401 / 403 hibával
 *
 * req.user formátum:
 * {
 *   id: number,
 *   email: string,
 *   user_type: "admin" | "user"
 * }
 *
 * Használat:
 * router.get("/profile", authMiddleware, handler)
 */

export default function authMiddleware(req, res, next) {


  const showConsoleLogs = true;
  const authHeader = req.headers.authorization;

  if(showConsoleLogs) console.log("AuthMiddleware authheader: ", authHeader)

  if (!authHeader) {
    if(showConsoleLogs) console.log("AuthMiddleware: Hiányzó token")
    return res.status(401).json({
      message: "Hiányzó token"
    });
  }

  // Bearer token ellenőrzése
  if (!authHeader.startsWith("Bearer ")) {
    if(showConsoleLogs) console.log("AuthMiddleware: hibás Authorization formátum")
    return res.status(401).json({
      message: "Hibás Authorization formátum"
    });
  }

  // A fejléc formátuma: "Bearer <token>", ezért a második elem maga a JWT.
  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(showConsoleLogs) console.log("AuthMiddleware decoded: ", decoded)

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