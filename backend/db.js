// +------------------------------------------------------------------+
// |                              db.js                               |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * db.js - Adatbazis kapcsolat konfiguracio
 * =====================================================================
 *
 * Funkcio:
 * - Sequelize kapcsolat letrehozasa es exportalasa
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
console.log("� ENV:", process.env.DATABASE_URL);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

db.connect()
  .then(() => console.log('✅ Sikeres kapcsolat az adatbázissal!'))
  .catch((err) => console.error('❌ Adatbázis kapcsolat hiba:', err));

export default db;