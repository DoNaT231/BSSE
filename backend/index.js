import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import courtRoutes from './routes/courts.js';
import userRoutes from './routes/users.js';
import reservationRoutes from './routes/reservations.js';
import path from 'path';
import sendEmailRoute from './routes/sendEmail.js';
import { fileURLToPath } from 'url';
import './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/user', userRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api', sendEmailRoute);
console.log('?? Routerek bek�tve: /api/courts �s /api/auth');

//ha történik valami hivas logolja az infokat
app.use((req, res, next) => {
  const start = Date.now();

  // Amikor válasz lezárult, logoljunk
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`\n📥 API Hívás:
  ➤ Dátum:        ${new Date().toISOString()}
  ➤ Módszer:      ${req.method}
  ➤ URL:          ${req.originalUrl}
  ➤ IP:           ${req.ip}
  ➤ Státuszkód:   ${res.statusCode}
  ➤ Feldolgozási idő: ${duration} ms
  ➤ Header(Authorization): ${req.headers['authorization'] || 'Nincs'}
  ➤ Body:         ${JSON.stringify(req.body)}
  ➤ Query paramok:${JSON.stringify(req.query)}
  ➤ Route paramok:${JSON.stringify(req.params)}
  ➤ Felhasználó (ha van): ${req.user ? JSON.stringify(req.user) : 'Nincs'}
`);
  });

  next();
});


app.use(express.static(path.join(__dirname, '../frontend/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server fut a ${PORT}-es porton`);
});
