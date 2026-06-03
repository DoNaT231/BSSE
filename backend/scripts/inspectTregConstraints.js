import pool from "../db.js";

const constraints = await pool.query(`
  SELECT conname, contype, pg_get_constraintdef(oid) AS def
  FROM pg_constraint
  WHERE conrelid = 'tournament_registrations'::regclass
`);

const indexes = await pool.query(`
  SELECT indexname, indexdef
  FROM pg_indexes
  WHERE tablename = 'tournament_registrations'
`);

console.log("CONSTRAINTS:", JSON.stringify(constraints.rows, null, 2));
console.log("INDEXES:", JSON.stringify(indexes.rows, null, 2));

await pool.end();
