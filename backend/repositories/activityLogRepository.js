import pool from "../db.js";

function mapRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    createdAt: row.created_at,
    level: row.level,
    category: row.category,
    eventType: row.event_type,
    message: row.message,
    userId: row.user_id,
    userEmail: row.user_email,
    httpMethod: row.http_method,
    httpPath: row.http_path,
    httpStatus: row.http_status,
    durationMs: row.duration_ms,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
  };
}

export async function insertActivityLog(entry) {
  const { rows } = await pool.query(
    `
      INSERT INTO activity_logs (
        level,
        category,
        event_type,
        message,
        user_id,
        user_email,
        http_method,
        http_path,
        http_status,
        duration_ms,
        entity_type,
        entity_id,
        metadata,
        ip_address,
        user_agent
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `,
    [
      entry.level ?? "info",
      entry.category,
      entry.eventType,
      entry.message,
      entry.userId ?? null,
      entry.userEmail ?? null,
      entry.httpMethod ?? null,
      entry.httpPath ?? null,
      entry.httpStatus ?? null,
      entry.durationMs ?? null,
      entry.entityType ?? null,
      entry.entityId ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ipAddress ?? null,
      entry.userAgent ?? null,
    ]
  );

  return mapRow(rows[0]);
}

export async function findActivityLogs({
  from,
  to,
  category,
  eventType,
  userId,
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
  if (eventType) {
    conditions.push(`event_type = $${idx++}`);
    values.push(eventType);
  }
  if (userId) {
    conditions.push(`user_id = $${idx++}`);
    values.push(Number(userId));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM activity_logs ${where}`,
    values
  );

  values.push(safeLimit, offset);
  const { rows } = await pool.query(
    `
      SELECT *
      FROM activity_logs
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

export async function findActivityLogById(id) {
  const { rows } = await pool.query(
    `SELECT * FROM activity_logs WHERE id = $1`,
    [Number(id)]
  );
  return mapRow(rows[0]);
}

export async function getActivitySummarySince(since) {
  const { rows } = await pool.query(
    `
      SELECT
        event_type,
        COUNT(*)::int AS count
      FROM activity_logs
      WHERE created_at >= $1
      GROUP BY event_type
    `,
    [since]
  );
  return rows;
}

export async function deleteOlderThan(cutoffDate) {
  const { rowCount } = await pool.query(
    `DELETE FROM activity_logs WHERE created_at < $1`,
    [cutoffDate]
  );
  return rowCount ?? 0;
}
