// +------------------------------------------------------------------+
// |                              jwt.js                              |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * jwt.js - Seged fuggvenyek gyujtemenye
 * =====================================================================
 *
 * Funkcio:
 * - Ujrafelhasznalhato technikai segedlogika biztositasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import jwt from "jsonwebtoken";

export function generateAccessToken(user) {
  console.log("niga", user)
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      user_type: user.user_type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}