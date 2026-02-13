/**
 * routes/tournamentRegistrations.js
 * ------------------------------------------------------------------
 * Verseny nevezések (tournament_registrations) végpontok kezelése.
 *
 * Felhasználó:
 * - POST   /api/tournament-registrations              -> nevezés
 * - GET    /api/tournament-registrations/my           -> saját nevezéseim
 * - PUT    /api/tournament-registrations/:id          -> saját nevezés módosítás
 * - DELETE /api/tournament-registrations/:id          -> saját nevezés törlés
 *
 * Admin:
 * - GET /api/tournament-registrations/admin/all
 * - GET /api/tournament-registrations/admin/by-tournament/:tournamentId
 *
 * Ajánlott DB mezők:
 * - id, tournament_id, user_id, tel_number, players (text[]), team_name,
 *   contact_email (nullable), created_at
 *
 * Megjegyzés:
 * - user_id-t mindig authból vesszük (req.user.id), nem a bodyból.
 * - A "contact_email" NEM a login email duplikációja: ez a nevezéshez tartozó
 *   kapcsolati email (ha másra kéred az értesítést).
 * ------------------------------------------------------------------
 */

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminGuard.js";
import db from "../db.js";

const router = express.Router();

// kis helper validálások
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

/**
 * FELHASZNÁLÓ: Nevezés egy versenyre
 * POST /api/tournament-registrations
 * Body:
 * - tournament_id (kötelező)
 * - tel_number (kötelező)
 * - players (tömb, ajánlott kötelező)
 * - team_name (opcionális)
 * - contact_email (opcionális)
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { tournament_id, tel_number, players, team_name, contact_email } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Nincs bejelentkezve." });
    }

    if (!tournament_id || !isNonEmptyString(tel_number)) {
      return res.status(400).json({
        message: "Hiányzó mezők: tournament_id és tel_number kötelező.",
      });
    }

    if (players !== undefined && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    // ellenőrizni, hogy létezik-e a tournament
    const t = await db.query(`SELECT id FROM tournaments WHERE id = $1`, [tournament_id]);
    if (!t.rows.length) return res.status(404).json({ message: "Nincs ilyen verseny." });

    // (Ajánlott) Ne lehessen ugyanarra a versenyre 2 nevezés ugyanattól a usertől
    const existing = await db.query(
      `SELECT id FROM tournament_registrations WHERE tournament_id = $1 AND user_id = $2`,
      [tournament_id, userId]
    );
    if (existing.rows.length) {
      return res.status(409).json({
        message: "Erre a versenyre már van nevezésed. Használd a módosítást.",
        registration_id: existing.rows[0].id,
      });
    }

    // FIGYELEM: ha a tábládban a mező neve email, akkor itt állítsd át
    // contact_email -> email
    const { rows } = await db.query(
      `INSERT INTO tournament_registrations
        (tournament_id, user_id, tel_number, players, team_name, contact_email)
       VALUES
        ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        tournament_id,
        userId,
        tel_number.trim(),
        players ?? null,
        team_name?.trim() || null,
        contact_email?.trim() || null,
      ]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("tournament_registrations POST / error:", err);
    return res.status(500).json({ message: "Szerver hiba (nevezés létrehozás)." });
  }
});

/**
 * FELHASZNÁLÓ: Saját nevezéseim
 * GET /api/tournament-registrations/my
 *
 * Visszaad:
 * - a belépett user összes nevezését (tournament_id-val)
 * - a frontend ebből tud map-et építeni: regByTournamentId[tournament_id] = reg
 */
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nincs bejelentkezve." });

    const { rows } = await db.query(
      `SELECT
         tr.id,
         tr.tournament_id,
         tr.user_id,
         tr.tel_number,
         tr.team_name,
         tr.players,
         tr.contact_email,
         tr.created_at
       FROM tournament_registrations tr
       WHERE tr.user_id = $1
       ORDER BY tr.created_at DESC`,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("tournament_registrations GET /my error:", err);
    return res.status(500).json({ message: "Szerver hiba (saját nevezések)." });
  }
});

/**
 * FELHASZNÁLÓ: Nevezés módosítása (csak a saját)
 * PUT /api/tournament-registrations/:id
 * Body (bármelyik jöhet):
 * - tel_number
 * - players (text[])
 * - team_name
 * - contact_email
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nincs bejelentkezve." });

    const { tel_number, players, team_name, contact_email } = req.body;

    if (players !== undefined && players !== null && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    const { rows } = await db.query(
      `UPDATE tournament_registrations
       SET
         tel_number = COALESCE($1, tel_number),
         players = COALESCE($2, players),
         team_name = COALESCE($3, team_name),
         contact_email = COALESCE($4, contact_email)
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [
        tel_number !== undefined ? (tel_number?.trim() || null) : null,
        players !== undefined ? players : null,
        team_name !== undefined ? (team_name?.trim() || null) : null,
        contact_email !== undefined ? (contact_email?.trim() || null) : null,
        id,
        userId,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Nincs ilyen nevezés, vagy nincs jogosultságod." });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("tournament_registrations PUT /:id error:", err);
    return res.status(500).json({ message: "Szerver hiba (nevezés módosítás)." });
  }
});

/**
 * FELHASZNÁLÓ: Nevezés törlése (csak a saját)
 * DELETE /api/tournament-registrations/:id
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Nincs bejelentkezve." });

    const { rows } = await db.query(
      `DELETE FROM tournament_registrations
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Nincs ilyen nevezés, vagy nincs jogosultságod." });
    }

    return res.json({ message: "Törölve.", id: rows[0].id });
  } catch (err) {
    console.error("tournament_registrations DELETE /:id error:", err);
    return res.status(500).json({ message: "Szerver hiba (nevezés törlés)." });
  }
});

/**
 * ADMIN: Nevezések egy versenyhez
 * GET /api/tournament-registrations/admin/by-tournament/:tournamentId
 */
router.get("/admin/by-tournament/:tournamentId", authMiddleware, adminOnly, async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    if (!Number.isFinite(tournamentId)) {
      return res.status(400).json({ message: "Hibás tournamentId." });
    }

    const t = await db.query(`SELECT id, title FROM tournaments WHERE id = $1`, [tournamentId]);
    if (!t.rows.length) {
      return res.status(404).json({ message: "Nincs ilyen verseny." });
    }

    const { rows } = await db.query(
      `SELECT
         tr.id,
         tr.tournament_id,
         tr.user_id,
         u.email AS user_email,
         tr.contact_email,
         tr.tel_number,
         tr.team_name,
         tr.players,
         tr.created_at
       FROM tournament_registrations tr
       LEFT JOIN users u ON u.id = tr.user_id
       WHERE tr.tournament_id = $1
       ORDER BY tr.created_at DESC`,
      [tournamentId]
    );

    return res.json({
      tournament: t.rows[0],
      registrations: rows,
    });
  } catch (err) {
    console.error("tournament_registrations ADMIN GET /admin/by-tournament/:tournamentId error:", err);
    return res.status(500).json({ message: "Szerver hiba (admin nevezések verseny szerint)." });
  }
});

export default router;
