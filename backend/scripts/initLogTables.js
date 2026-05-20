import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureLogTables() {
  const sqlPath = path.join(
    __dirname,
    "../migrations/001_activity_error_logs.sql"
  );
  const sql = fs.readFileSync(sqlPath, "utf8");
  await pool.query(sql);
}
