import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureRegistrationSchema() {
  const sqlPath = path.join(
    __dirname,
    "../migrations/002_tournament_registration_invoice_sent.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}
