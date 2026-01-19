import express from 'express';
import db from '../db.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Minden pálya lekérése
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courts');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Hiba a pályák lekérdezésekor' });
  }
});

// Új pálya létrehozása (admin)
router.post('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin hozhat létre pályát' });
  console.log("p�lya l�trehoz�sa.....");
  const { name, number} = req.body;
  if(!name || !number){
    res.status(500).json({ message: 'Nincs name vagy number' });
  }
  try {
    const result = await db.query(
      'INSERT INTO courts (name, number) VALUES ($1, $2) RETURNING *',
      [name, number]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
	console.log(err.message)
    res.status(500).json({ message: 'Hiba a pálya létrehozásakor' });
  }
});

// Pálya törlése (admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Csak admin törölhet pályát' });

  try {
    const result = await db.query('DELETE FROM courts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Pálya nem található' });
    }
    res.json({ message: 'Pálya törölve' });
  } catch (err) {
    res.status(500).json({ message: 'Hiba a törlés során' });
  }
});

export default router;
