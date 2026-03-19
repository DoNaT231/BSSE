/**
 * server.js / index.js
 * ------------------------------------------------------------------
 * Az alkalmazás belépési pontja.
 * Feladata az Express szerver inicializálása, a middleware-ek
 * (CORS, JSON parsing, logging) beállítása, az API route-ok
 * bekötése, valamint a frontend build kiszolgálása.
 *
 * Ez a fájl NEM tartalmaz üzleti logikát vagy adatbázis-műveleteket,
 * kizárólag az alkalmazás struktúráját és működését hangolja össze.
 * ------------------------------------------------------------------
 */

import express from 'express';     // Express web framework
import cors from 'cors';           // Cross-Origin kérések engedélyezése
import dotenv from 'dotenv';       // Környezeti változók kezelése
import path from 'path';           // Fájlútvonal kezelés
import { fileURLToPath } from 'url';

// API route-ok
import authRoutes from './routes/auth.js';
import courtRoutes from './routes/courts.js';
import adminUsersRoutes from "./routes/adminUsers.js";
import userRoutes from './routes/users.js';
import calendarRoutes from "./routes/calendarRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import tournamentRegistrations from './routes/tournamentRegistrationRoutes.js';

// MiddleWarek
import authMiddleware from './middleware/authMiddleware.js';
import adminOnly from './middleware/adminOnly.js';

// Adatbázis kapcsolat inicializálása (side-effect import)
import './db.js';

// __dirname pótlása ES module környezetben
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();                   // .env betöltése

const app = express();             // Express alkalmazás létrehozása

// Globális middleware-ek
app.use(cors());                   // CORS engedélyezése
app.use(express.json());           // JSON body parsing

// API route-ok regisztrálása
app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/user', userRoutes);
app.use("/api/calendar", calendarRoutes);
// Tournament route-ok:
// - minden /api/tournaments kéréshez kell bejelentkezés
// - adminOnly middleware-t a routeren belül, csak admin végpontokra tesszük
app.use("/api/tournaments", authMiddleware, tournamentRoutes);
app.use("/api/reservations", authMiddleware, reservationRoutes);
app.use("/api/admin/users", authMiddleware,adminOnly, adminUsersRoutes);
app.use('/api/tournament-registrations', authMiddleware, tournamentRegistrations);

console.log('Routerek bekötve: auth, courts, users, reservations');

// Kérés–válasz logger middleware
// Minden bejövő API hívást naplóz
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`
📥 API Hívás:
➤ Dátum:        ${new Date().toISOString()}
➤ Módszer:      ${req.method}
➤ URL:          ${req.originalUrl}
➤ IP:           ${req.ip}
➤ Státuszkód:   ${res.statusCode}
➤ Feldolgozási idő: ${duration} ms
➤ Authorization: ${req.headers['authorization'] || 'Nincs'}
➤ Body:         ${JSON.stringify(req.body)}
➤ Query:        ${JSON.stringify(req.query)}
➤ Params:       ${JSON.stringify(req.params)}
➤ Felhasználó:  ${req.user ? JSON.stringify(req.user) : 'Nincs'}
`);
  });

  next();
});

// Frontend (React build) statikus kiszolgálása
app.use(express.static(path.join(__dirname, '../frontend/build')));

// SPA fallback – minden más kérés az index.html-re megy
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Szerver indítása
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server fut a ${PORT}-es porton`);
});
