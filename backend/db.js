import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;
console.log("� ENV:", process.env.DATABASE_URL);
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});
/// jelszo: nehezjelszo123
/*
PORT=5000
JWT_SECRET=valami_nagyon_titkos

DATABASE_URL=postgresql://backenduser:nagyonnehezjelszo123@localhost:5432/foglalas
DB_HOST=localhost
DB_PORT=5432
DB_USER=backenduser
DB_PASSWORD=nehezjelszo123
DB_NAME=foglalas

*/
db.connect()
  .then(() => console.log('✅ Sikeres kapcsolat az adatbázissal!'))
  .catch((err) => console.error('❌ Adatbázis kapcsolat hiba:', err));

export default db;