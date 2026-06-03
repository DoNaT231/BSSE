import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_FILES = [
  "002_tournament_registration_invoice_sent.sql",
  "003_tournament_registration_cancelled_at.sql",
  "004_drop_legacy_treg_user_unique.sql",
];

export async function ensureRegistrationSchema() {
  for (const file of MIGRATION_FILES) {
    const sqlPath = path.join(__dirname, "../migrations", file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    await pool.query(sql);
  }
}
