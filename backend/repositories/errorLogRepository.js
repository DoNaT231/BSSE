import pool from "../db.js";

function mapRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    createdAt: row.created_at,
    severity: row.severity,
    category: row.category,
    eventType: row.event_type,
    message: row.message,
    errorName: row.error_name,
    stackTrace: row.stack_trace,
    userId: row.user_id,
    httpMethod: row.http_method,
    httpPath: row.http_path,
    httpStatus: row.http_status,
    requestBody: row.request_body,
    requestQuery: row.request_query,
    metadata: row.metadata,
    resolved: row.resolved,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    resolvedNote: row.resolved_note,
  };
}

export async function insertErrorLog(entry) {
  const { rows } = await pool.query(
    `
      INSERT INTO error_logs (
        severity,
        category,
        event_type,
        message,
        error_name,
        stack_trace,
        user_id,
        http_method,
        http_path,
        http_status,
        request_body,
        request_query,
        metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `,
    [
      entry.severity ?? "error",
      entry.category ?? "system",
      entry.eventType ?? null,
      entry.message,
      entry.errorName ?? null,
      entry.stackTrace ?? null,
      entry.userId ?? null,
      entry.httpMethod ?? null,
      entry.httpPath ?? null,
      entry.httpStatus ?? null,
      entry.requestBody ? JSON.stringify(entry.requestBody) : null,
      entry.requestQuery ? JSON.stringify(entry.requestQuery) : null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ]
  );

  return mapRow(rows[0]);
}

export async function findErrorLogs({
  from,
  to,
  category,
  severity,
  resolved,
  page = 1,
  limit = 50,
}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const conditions = [];
  const values = [];
  let idx = 1;

  if (from) {
    conditions.push(`created_at >= $${idx++}`);
    values.push(from);
  }
  if (to) {
    conditions.push(`created_at <= $${idx++}`);
    values.push(to);
  }
  if (category) {
    conditions.push(`category = $${idx++}`);
    values.push(category);
  }
  if (severity) {
    conditions.push(`severity = $${idx++}`);
    values.push(severity);
  }
  if (resolved !== undefined && resolved !== null && resolved !== "") {
    conditions.push(`resolved = $${idx++}`);
    values.push(String(resolved) === "true");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM error_logs ${where}`,
    values
  );

  values.push(safeLimit, offset);
  const { rows } = await pool.query(
    `
      SELECT *
      FROM error_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `,
    values
  );

  return {
    items: rows.map(mapRow),
    total: countResult.rows[0]?.total ?? 0,
    page: safePage,
    limit: safeLimit,
  };
}

export async function findErrorLogById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM error_logs WHERE id = $1`,
    [Number(id)]
  );
  return mapRow(rows[0]);
}

export async function resolveErrorLog(id, { resolvedBy, resolvedNote }) {
  const { rows } = await pool.query(
    `
      UPDATE error_logs
      SET
        resolved = TRUE,
        resolved_at = NOW(),
        resolved_by = $2,
        resolved_note = $3
      WHERE id = $1
      RETURNING *
    `,
    [Number(id), resolvedBy ?? null, resolvedNote ?? null]
  );
  return mapRow(rows[0]);
}

export async function countUnresolvedSince(since) {
  const { rows } = await pool.query(
    `
      SELECT COUNT(*)::int AS count
      FROM error_logs
      WHERE resolved = FALSE AND created_at >= $1
    `,
    [since]
  );
  return rows[0]?.count ?? 0;
}

export async function findRecentUnresolved(limit = 5) {
  const { rows } = await pool.query(
    `
      SELECT *
      FROM error_logs
      WHERE resolved = FALSE
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [Math.min(Number(limit) || 5, 20)]
  );
  return rows.map(mapRow);
}

export async function deleteOlderThan(cutoffDate) {
  const { rowCount } = await pool.query(
    `DELETE FROM error_logs WHERE created_at < $1`,
    [cutoffDate]
  );
  return rowCount ?? 0;
}
