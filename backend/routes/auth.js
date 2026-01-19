import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
import dns from 'dns/promises';

dotenv.config();

const router = express.Router();

// Helper: Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.user_type,
    },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
};

// Checking if user exists
router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email megadása kötelező.' });
  }

  const domain = email.split('@')[1];
  try {
    const mx = await dns.resolveMx(domain);
    if (!mx || mx.length === 0) {
      return res.status(400).json({ error: 'Ez a domain nem tud e-mailt fogadni (hiányzó MX rekord).' });
    }
  } catch (err) {
    return res.status(400).json({ error: 'Érvénytelen domain vagy nem elérhető e-mail szolgáltatás.' });
  }

  try {
    const result = await db.query('SELECT id, username, password, user_type FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        status: 'name_required',
        message: 'Nincs ilyen felhasználó, kérjük, adja meg a nevét a regisztrációhoz.'
      });
    }

    const user = result.rows[0];

    if (user.password) {
      return res.status(200).json({
        status: 'password_required',
        message: 'Ehhez a fiókhoz jelszó szükséges.'
      });
    } else {

      const token = generateToken(user)

      return res.status(200).json({
        status: 'ok',
        message: 'Felhasználó létezik, jelszó nélkül be lehet lépni.',
        token
      });
    }
  } catch (err) {
    console.error('Hiba az email ellenőrzésekor:', err);
    return res.status(500).json({ error: 'Szerverhiba.' });
  }
});

// regisztralas email és nevvel
router.post('/register', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ status: 'missing_fields', error: 'Név és email szükséges.' });
  }

  const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ status: 'user_exists', error: 'Ez az email már regisztrálva van.' });
  }

  try {
    const insert = await db.query(
      'INSERT INTO users (username, email, user_type, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, 'user-without-password', new Date() ]
    );
    const user = insert.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      status: 'success',
      message: 'Sikeres regisztráció',
      token
    });
  } catch (err) {
    console.error('Regisztrációs hiba:', err);
    return res.status(500).json({ status: 'server_error', error: 'Szerverhiba történt.' });
  }
});

// belepes ha van password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 'missing_fields', error: 'Email és jelszó szükséges.' });
  }

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

  if (result.rows.length === 0) {
    return res.status(404).json({ status: 'not_found', error: 'Nincs ilyen felhasználó.' });
  }

  const user = result.rows[0];

  if (!user.password) {
    return res.status(403).json({ status: 'no_password_set', error: 'Ehhez a fiókhoz nincs jelszó beállítva.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ status: 'invalid_password', error: 'Hibás jelszó.' });
  }

  const token = generateToken(user);

  return res.json({
    status: 'success',
    message: 'Sikeres bejelentkezés',
    token
  });
});

export default router;
