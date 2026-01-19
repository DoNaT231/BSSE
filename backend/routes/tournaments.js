/**
 * routes/tournaments.js
 * ------------------------------------------------------------------
 * Verseny (tournament) végpontok kezelése.
 *
 * Cél:
 * - Publikus lista: felhasználóknak csak a szükséges mezők (cím, leírás, kategória, kezdés)
 *   -> jelentkezés UI-hoz elég információ
 * - Admin felület: teljes lista + CRUD (létrehozás, módosítás, törlés)
 *
 * Megjegyzés:
 * - Külön "status módosítás" endpoint nincs, az admin módosítás (PUT) kezeli a status-t is.
 * - ID alapú lekérés (GET /:id) nem kell, ezért nincs benne.
 * - A requireAdmin middleware itt egy minta: igazítsd a saját auth rendszeredhez
 *   (pl. req.user.role / req.user.isAdmin).
 * ------------------------------------------------------------------
 */

import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminGuard.js";

const router = express.Router();

/**
 * PUBLIC: Versenyek listája felhasználóknak
 * - Csak a "kijelzéshez szükséges" mezőket adja vissza:
 *   title, description, category, start_at
 * - Szűrés: csak az aktív versenyek (status = 'active')
 */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, description, category, start_at
       FROM tournaments
       WHERE status = 'active'
       ORDER BY start_at ASC NULLS LAST`
    );
    res.json(rows);
  } catch (err) {
    console.error("tournaments PUBLIC GET / error:", err);
    res.status(500).json({ message: "Szerver hiba a versenyek lekérése közben." });
  }
});

/**
 * ADMIN: Összes verseny listája (minden mező, minden státusz)
 * - Admin felületen a teljes táblát szeretnénk látni
 */
router.get("/admin/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, title, description, category, start_at, status, created_by, created_at
       FROM tournaments
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("tournaments ADMIN GET /admin/all error:", err);
    res.status(500).json({ message: "Szerver hiba (admin lista)." });
  }
});

/**
 * ADMIN: Verseny létrehozása
 * Body:
 * - title (kötelező)
 * - category (kötelező)
 * - description (opcionális)
 * - start_at (opcionális, de ajánlott)
 * - status (opcionális, default: 'active')
 *
 * created_by: a bejelentkezett admin user id-ja (ha van)
 */
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      title,
      category,
      description = null,
      start_at = null,
      status = "active",
    } = req.body;
    console.log(req.body)

    if (!title || !category) {
      return res
        .status(400)
        .json({ message: "Hiányzó mezők: title és category kötelező." });
    }

    const createdBy = req.user?.id ?? null;

    const { rows } = await db.query(
      `INSERT INTO tournaments (title, description, category, start_at, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, category, start_at, status, createdBy]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("tournaments ADMIN POST / error:", err);
    res.status(500).json({ message: "Szerver hiba (létrehozás)." });
  }
});

/**
 * ADMIN: Verseny módosítása (egy endpointon belül, status is itt kezelhető)
 * - PUT /:id
 * Body: bármelyik mező jöhet:
 * - title
 * - description
 * - category
 * - start_at
 * - status
 *
 * COALESCE logika:
 * - ha a body-ban nem adod meg, marad a régi érték
 */
router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const {
      title = null,
      description = null,
      category = null,
      start_at = null,
      status = null,
    } = req.body;

    const { rows } = await db.query(
      `UPDATE tournaments
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         category = COALESCE($3, category),
         start_at = COALESCE($4, start_at),
         status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [title, description, category, start_at, status, id]
    );

    if (!rows.length) return res.status(404).json({ message: "Nincs ilyen verseny." });
    res.json(rows[0]);
  } catch (err) {
    console.error("tournaments ADMIN PUT /:id error:", err);
    res.status(500).json({ message: "Szerver hiba (módosítás)." });
  }
});

/**
 * ADMIN: Verseny törlése
 * - ON DELETE CASCADE esetén a hozzá tartozó tournament_registrations sorok is törlődnek
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "Hibás ID." });

    const { rows } = await db.query(
      `DELETE FROM tournaments
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (!rows.length) return res.status(404).json({ message: "Nincs ilyen verseny." });
    res.json({ message: "Törölve.", id: rows[0].id });
  } catch (err) {
    console.error("tournaments ADMIN DELETE /:id error:", err);
    res.status(500).json({ message: "Szerver hiba (törlés)." });
  }
});

export default router;
