// +------------------------------------------------------------------+
// |                   thursdayLeaderboardRoutes.js                   |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * thursdayLeaderboardRoutes.js - HTTP route definiciok
 * =====================================================================
 *
 * Funkcio:
 * - Endpointok regisztralasa es middleware lanc osszeallitasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import express from "express";
import * as usersRepository from "../repositories/usersRepository.js";

const router = express.Router();

/**
 * Top 10 felhasználó csütörtöki pont szerint.
 * Válasz: [{ username, points }, ...] — nincs auth.
 */
router.get("/top", async (req, res) => {
  try {
    const entries = await usersRepository.findTopThursdayPoints(10);
    res.status(200).json(entries);
  } catch (error) {
    console.error("GET /api/thursday-leaderboard/top:", error);
    res.status(500).json({
      message: "Nem sikerült betölteni a ranglistát.",
    });
  }
});

export default router;
