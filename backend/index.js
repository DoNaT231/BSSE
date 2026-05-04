// +------------------------------------------------------------------+
// |                             index.js                             |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * index.js - Backend API belepesi pont
 * =====================================================================
 *
 * Funkcio:
 * - Szerver inicializalasa es route-ok bekotese
 *
 * Felelosseg:
 * - A modul sajat retegen beluli feladatainak ellatasa.
 */

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
import thursdayLeaderboardRoutes from './routes/thursdayLeaderboardRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";

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
const allowedOrigins = [
  "https://balatonsse.hu",
  "https://www.balatonsse.hu",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Szerver-szerver és CLI/Postman hívásoknál lehet üres origin.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS: Ez az origin nem engedélyezett."));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);
app.use(express.json());           // JSON body parsing

// API route-ok regisztrálása
console.log("Mount /api/auth");
try { app.use('/api/auth', authRoutes); } catch (e) { console.error("Failed mount authRoutes", e); throw e; }
console.log("Mount /api/courts");
try { app.use('/api/courts', courtRoutes); } catch (e) { console.error("Failed mount courtRoutes", e); throw e; }
console.log("Mount /api/thursday-leaderboard");
try { app.use('/api/thursday-leaderboard', thursdayLeaderboardRoutes); } catch (e) { console.error("Failed mount thursdayLeaderboardRoutes", e); throw e; }
console.log("Mount /api/user");
try { app.use('/api/user', userRoutes); } catch (e) { console.error("Failed mount userRoutes", e); throw e; }
console.log("Mount /api/calendar");
try { app.use("/api/calendar", calendarRoutes); } catch (e) { console.error("Failed mount calendarRoutes", e); throw e; }
console.log("Mount /api/contact")
try { app.use("/api/contact", contactRoutes); } catch (e) { console.error("Failed mount contactRoutes", e); throw e; }
// Tournament route-ok:
// - minden /api/tournaments kéréshez kell bejelentkezés
// - adminOnly middleware-t a routeren belül, csak admin végpontokra tesszük
console.log("Mount /api/tournaments");
app.use("/api/tournaments", authMiddleware, tournamentRoutes);
console.log("Mount /api/reservations");
app.use("/api/reservations", authMiddleware, reservationRoutes);
console.log("Mount /api/admin/users");
app.use("/api/admin/users", authMiddleware, adminOnly, adminUsersRoutes);
console.log("Mount /api/tournament-registrations");
app.use("/api/tournament-registrations", authMiddleware, tournamentRegistrations);

console.log('Routerek bekötve: auth, courts, users, reservations');

// Kérés–válasz logger middleware
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

// SPA fallback – minden nem-API kérés ide jön
app.use((req, res, next) => {
  const indexPath = path.join(__dirname, '../frontend/build/index.html');

  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error("❌ Frontend fallback hiba:", err.message);
      res.status(500).send("Frontend build hiányzik vagy hibás.");
    }
  });
});

// Szerver indítása
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server fut a ${PORT}-es porton`);
});
