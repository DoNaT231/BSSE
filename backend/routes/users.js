import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Összes felhasználó lekérése (admin only)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin kérheti le a felhasználókat' });

  try {
    const result = await db.query('SELECT id, username, email, user_type, created_at FROM users');
    res.json(result.rows);
  } catch {
    res.status(500).json({ message: 'Hiba a felhasználók lekérésekor' });
  }
});

// Felhasználó törlése ID alapján (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin törölhet' });

  const { id } = req.params;
  console.log("id: ", id)

  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Felhasználó nem található' });

    result.json({ message: 'Felhasználó törölve' });
  } catch {
    result.status(500).json({ message: 'Hiba a törlés során' });
  }
});

// Felhasználó törlése email alapján (admin only)
router.delete('/by-email/:email', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin törölhet' });

  const { email } = req.params;

  try {
    const result = await db.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Felhasználó nem található' });

    res.json({ message: 'Felhasználó törölve' });
  } catch {
    res.status(500).json({ message: 'Hiba a törlés során' });
  }
});

router.patch('/set-password', authMiddleware, async (req, res) => {
  const userId = req.user.id; // auth middleware által beállított ID
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A jelszónak legalább 6 karakteresnek kell lennie.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'UPDATE users SET password = $1, user_type = $2 WHERE id = $3',
      [hashedPassword, 'user-with-password', userId]
    );
    res.json({ message: 'Jelszó sikeresen beállítva.' });
  } catch (error) {
    console.error('Jelszó beállítás hiba:', error);
    res.status(500).json({ error: 'Szerverhiba' });
  }
});

export default router;
