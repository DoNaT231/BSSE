import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Foglalások szinkronizálása (felülírja a meglévőket az adott héten)
router.post('/sync', authMiddleware, async (req, res) => {
  
  const userId = req.user.id;
  const reservations = req.body;

  console.log("==> Szinkronizálás indul");
  console.log("userId:", userId);
  console.log("received reservations:", reservations);

  if (!Array.isArray(reservations)) {
    return res.status(400).json({ message: 'Hibás adatformátum' });
  }
  if (reservations[0].monday) {
    const weekStart = new Date(reservations[0].monday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    try {
      const del = await db.query(
        'DELETE FROM reservations WHERE user_id = $1 AND booked_time >= $2 AND booked_time < $3',
        [userId, weekStart, weekEnd]
      );
      return res.json({ message: `${del.rowCount} foglalás törölve (üres lista).` });
    } catch(err) {
      console.error('Szinkronizálási hiba3:', err);
      return res.status(500).json({ message: 'Hiba a törlés során' });
    }
  }

  const courtId = reservations[0].Court_id;
  const times = reservations
  .map(r => {
    const dateStr = r.startTime?.replace(' ', 'T');
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  })
  .filter(t => t !== null);

  const times1 = reservations.map(r => {
    const time = new Date(r.startTime);
    if (isNaN(time.getTime())) {
      console.error('Hibás dátumformátum:', r.startTime);
      throw new Error('Érvénytelen időpont formátum: ' + r.startTime);
    }
    return time;
  });
  
  const weekStart = new Date(Math.min(...times.map(t => t.getTime())));
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  try {
    const existing = await db.query(
      'SELECT * FROM reservations WHERE user_id = $1 AND court_id = $2 AND booked_time >= $3 AND booked_time < $4',
      [userId, courtId, weekStart, weekEnd]
    );

    const existingTimes = new Set(existing.rows.map(r => r.booked_time));
    const incomingTimes = new Set(reservations.map(r => r.startTime));

    const conflicts = await db.query(
      `SELECT booked_time, user_id FROM reservations
       WHERE court_id = $1 AND booked_time = ANY($2::timestamp[]) AND user_id != $3`,
      [courtId, Array.from(incomingTimes), userId]
    );

    if (conflicts.rowCount > 0) {
      return res.status(409).json({
        message: 'Már foglalt időpont(ok)',
        conflicts: conflicts.rows
      });
    }

    const toDelete = Array.from(existingTimes).filter(t => !incomingTimes.has(t));
    await db.query(
      'DELETE FROM reservations WHERE user_id = $1 AND court_id = $2 AND booked_time = ANY($3::timestamp[])',
      [userId, courtId, toDelete]
    );
	
    const toInsert = Array.from(incomingTimes).filter(t => !existingTimes.has(t));
    for (const t of toInsert) {
      await db.query(
        `INSERT INTO reservations (user_id, court_id, booked_time, created_at)
        VALUES ($1, $2, $3, NOW())`,
        [userId, courtId, t] // t = string, pl. "2025-07-20 10:00"
      );
    }

    res.json({
      message: `Sikeres szinkronizálás. Hozzáadva: ${toInsert.length}, törölve: ${toDelete.length}`
    });
  } catch (err) {
    console.error('Szinkronizálási hiba1:', err);
    res.status(500).json({ message: 'Hiba a szinkronizálás során' });
  }
});

// Foglalások lekérése adott hétre és pályára
router.get('/by-court-week', async (req, res) => {
  const { courtId, weekStart } = req.query;

  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 8);

  try {
    const result = await db.query(
      `SELECT r.id, r.booked_time, u.id AS user_id, u.username
       FROM reservations r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.court_id = $1 AND r.booked_time >= $2 AND r.booked_time < $3`,
      [parseInt(courtId), start, end]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba a foglalások lekérdezésekor' });
  }
});

// Admin: Foglalás törlése időpont alapján
router.delete('/delete-reservation', authMiddleware, async (req, res) => {
	console.log('?? DELETE /delete-reservation h�v�s �rkezett');
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin törölhet' });

  const { court_id, startTime } = req.body;

  try {
    const result = await db.query(
      'DELETE FROM reservations WHERE court_id = $1 AND booked_time = $2 RETURNING *',
      [court_id, startTime]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: 'Nem található foglalás' });

    res.json({ message: 'Foglalás törölve' });
  } catch {
    console.error('Szinkronizálási hiba2:', err);
    res.status(500).json({ message: 'Hiba a törlés során' });
  }
});

// Vendég foglalás Regisztráció vagy bejelentkezes
router.post('/guest', async (req, res) => {
  const { user_name, user_email, court_id, start_time } = req.body;

  if (!user_name || !user_email || !court_id || !start_time) {
    return res.status(400).json({ message: 'Hiányzó mezők' });
  }

  try {
    const result = await db.query(
      `INSERT INTO reservations (user_id, user_name, user_email, court_id, booked_time, status, reservation_date)
       VALUES (NULL, $1, $2, $3, $4, 'Pending', NOW()) RETURNING *`,
      [user_name, user_email, court_id, start_time]
    );
    res.status(201).json({ message: 'Foglalás sikeres', reservation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Hiba a foglalás során' });
  }
});

export default router;