/**
 * routes/tournamentRegistrations.js
 * ------------------------------------------------------------------
 * Verseny nevezések (tournament_registrations) végpontok kezelése.
 *
 * Cél:
 * - Felhasználói oldal:
 *   - Nevezés egy adott versenyre (tournament_id alapján)
 *   - Nevezés módosítása
 *   - Nevezés törlése
 *
 * - Admin oldal:
 *   - Összes nevezés lekérése (áttekintéshez)
 *
 * Adatbázis mezők (jelenlegi táblád alapján):
 * - id, tournament_id, email, tel_number, players (text[]), created_at
 *
 * Fontos:
 * - A "saját nevezéseim" funkcióhoz ajánlott hozzáadni a user_id-t a táblához
 *   (lásd a válasz alján, miért és hogyan).
 * ------------------------------------------------------------------
 */

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminGuard.js";
import db from "../db.js";

const router = express.Router();
/**
 * FELHASZNÁLÓ: Nevezés egy versenyre
 * POST /api/tournament-registrations
 * Body:
 * - tournament_id (kötelező)
 * - team_name
 * - email (kötelező)
 * - tel_number (kötelező nálad, mert NOT NULL)
 * - players (kötelezőnek ajánlott, de DB-ben lehet NULL; itt validáljuk)
 *
 * Megjegyzés:
 * - Ha majd bevezeted a user_id-t, ide be tudjuk írni: user_id = req.user.id
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { tournament_id, email, tel_number, players, team_name } = req.body;

    if (!tournament_id || !email || !tel_number) {
      return res.status(400).json({
        message: "Hiányzó mezők: tournament_id, email, tel_number kötelező.",
      });
    }

    // players legyen tömb, ha küldöd
    if (players !== undefined && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    // ellenőrizni, hogy létezik-e a tournament
    const t = await db.query(`SELECT id FROM tournaments WHERE id = $1`, [tournament_id]);
    if (!t.rows.length) return res.status(404).json({ message: "Nincs ilyen verseny." });

    const { rows } = await db.query(
      `INSERT INTO tournament_registrations (tournament_id, email, tel_number, players, team_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tournament_id, email, tel_number, players ?? null, team_name]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("tournament_registrations POST / error:", err);
    res.status(500).json({ message: "Szerver hiba (nevezés létrehozás)." });
  }
});

/**
 * FELHASZNÁLÓ: Nevezés módosítása
 * PUT /api/tournament-registrations/:id
 * Body (bármelyik jöhet):
 * - email
 * - tel_number
 * - players (text[])
 * - team_name
 *
 * Megjegyzés:
 * - Jelenleg nincs "tulajdonos" ellenőrzés (mert nincs user_id).
 * - Ha bevezeted a user_id-t, itt tudjuk ellenőrizni, hogy csak a sajátját módosítsa.
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const { email = null, tel_number = null, players = null, team_name = null } = req.body;

    if (players !== null && players !== undefined && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    const { rows } = await db.query(
      `UPDATE tournament_registrations
       SET
         email = COALESCE($1, email),
         tel_number = COALESCE($2, tel_number),
         players = COALESCE($3, players)
         team_name = COALESCE($4, team_name)
       WHERE id = $5
       RETURNING *`,
      [email, tel_number, players, team_name, id]
    );

    if (!rows.length) return res.status(404).json({ message: "Nincs ilyen nevezés." });
    res.json(rows[0]);
  } catch (err) {
    console.error("tournament_registrations PUT /:id error:", err);
    res.status(500).json({ message: "Szerver hiba (nevezés módosítás)." });
  }
});

/**
 * FELHASZNÁLÓ: Nevezés törlése
 * DELETE /api/tournament-registrations/:id
 *
 * Megjegyzés:
 * - user_id nélkül nem tudjuk szépen korlátozni, ki törölhet mit.
 * - user_id bevezetése után lehet: WHERE id=$1 AND user_id=$2.
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const { rows } = await db.query(
      `DELETE FROM tournament_registrations
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Nincs ilyen nevezés." });
    res.json({ message: "Törölve.", id: rows[0].id });
  } catch (err) {
    console.error("tournament_registrations DELETE /:id error:", err);
    res.status(500).json({ message: "Szerver hiba (nevezés törlés)." });
  }
});

/**
 * ADMIN: Összes nevezés megtekintése
 * GET /api/tournament-registrations/admin/all
 *
 * Ajánlott: JOIN a tournaments táblára, hogy admin felületen látszódjon a verseny neve is.
 */
router.get("/admin/all", adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         tr.id,
         tr.tournament_id,
         t.title AS tournament_title,
         tr.email,
         tr.tel_number,
         tr.team_name,
         tr.players,

         tr.created_at
       FROM tournament_registrations tr
       JOIN tournaments t ON t.id = tr.tournament_id
       ORDER BY tr.created_at DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("tournament_registrations ADMIN GET /admin/all error:", err);
    res.status(500).json({ message: "Szerver hiba (admin nevezések lista)." });
  }
});
/**
 * ADMIN: Nevezések lekérése egy versenyhez (tournament_id alapján)
 * GET /api/tournament-registrations/admin/by-tournament/:tournamentId
 *
 * Hibák:
 * - 400: hibás tournamentId
 * - 404: nincs ilyen verseny
 * - 500: szerver hiba
 */
router.get("/admin/by-tournament/:tournamentId", adminOnly, async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    if (!Number.isFinite(tournamentId)) {
      return res.status(400).json({ message: "Hibás tournamentId." });
    }

    // 1) ellenőrizzük, hogy létezik-e a verseny + elkérjük a címét
    const t = await db.query(`SELECT id, title FROM tournaments WHERE id = $1`, [tournamentId]);
    if (!t.rows.length) {
      return res.status(404).json({ message: "Nincs ilyen verseny." });
    }

    // 2) lekérjük az adott verseny nevezéseit
    const { rows } = await db.query(
      `SELECT
         tr.id,
         tr.tournament_id,
         tr.email,
         tr.tel_number,
         tr.team_name,
         tr.players,
         tr.created_at
       FROM tournament_registrations tr
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
