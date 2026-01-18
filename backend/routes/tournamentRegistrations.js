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
import db from "../db.js";

const router = express.Router();

/**
 * Admin jogosultság ellenőrzés (ugyanaz a logika, mint a tournaments routerben).
 * Igazítsd a saját auth rendszeredhez.
 */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Nincs bejelentkezve." });
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Nincs jogosultság (admin szükséges)." });
  }
  next();
}

/**
 * (Opcionális) Bejelentkezés ellenőrzés.
 * Ha a projektedben a nevezés vendégként is lehetséges, ezt nem kell használni.
 */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ message: "Nincs bejelentkezve." });
  next();
}

/**
 * FELHASZNÁLÓ: Nevezés egy versenyre
 * POST /api/tournament-registrations
 * Body:
 * - tournament_id (kötelező)
 * - email (kötelező)
 * - tel_number (kötelező nálad, mert NOT NULL)
 * - players (kötelezőnek ajánlott, de DB-ben lehet NULL; itt validáljuk)
 *
 * Megjegyzés:
 * - Ha majd bevezeted a user_id-t, ide be tudjuk írni: user_id = req.user.id
 */
router.post("/", async (req, res) => {
  try {
    const { tournament_id, email, tel_number, players } = req.body;

    if (!tournament_id || !email || !tel_number) {
      return res.status(400).json({
        message: "Hiányzó mezők: tournament_id, email, tel_number kötelező.",
      });
    }

    // players legyen tömb, ha küldöd
    if (players !== undefined && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    // opcionális: ellenőrizni, hogy létezik-e a tournament
    const t = await db.query(`SELECT id FROM tournaments WHERE id = $1`, [tournament_id]);
    if (!t.rows.length) return res.status(404).json({ message: "Nincs ilyen verseny." });

    const { rows } = await db.query(
      `INSERT INTO tournament_registrations (tournament_id, email, tel_number, players)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tournament_id, email, tel_number, players ?? null]
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
 *
 * Megjegyzés:
 * - Jelenleg nincs "tulajdonos" ellenőrzés (mert nincs user_id).
 * - Ha bevezeted a user_id-t, itt tudjuk ellenőrizni, hogy csak a sajátját módosítsa.
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const { email = null, tel_number = null, players = null } = req.body;

    if (players !== null && players !== undefined && !Array.isArray(players)) {
      return res.status(400).json({ message: "players mezőnek tömbnek kell lennie." });
    }

    const { rows } = await db.query(
      `UPDATE tournament_registrations
       SET
         email = COALESCE($1, email),
         tel_number = COALESCE($2, tel_number),
         players = COALESCE($3, players)
       WHERE id = $4
       RETURNING *`,
      [email, tel_number, players, id]
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
router.delete("/:id", async (req, res) => {
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
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         tr.id,
         tr.tournament_id,
         t.title AS tournament_title,
         tr.email,
         tr.tel_number,
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

export default router;
