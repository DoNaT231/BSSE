import pool from "../db.js";
import User from "../models/User.js";

function mapRowToUser(row) {
  if (!row) return null;

  return new User(
    row.id,
    row.username,
    row.email,
    row.password_hashed,
    row.user_type,
    row.is_active,
    row.is_local,
    row.phone,
    row.updated_at,
    row.created_at
  );
}

/**
 * Egy user lekérése id alapján
 */
export async function findById(id, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE id = $1
    `,
    [id]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Egy user lekérése email alapján
 */
export async function findByEmail(email, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
    `,
    [email]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Egy user lekérése username alapján
 */
export async function findByUsername(username, client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE username = $1
    `,
    [username]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Összes user lekérése admin listázáshoz
 * Ha csak aktív usereket akarod, használd a findAllActive-t
 */
export async function findAll(client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      ORDER BY created_at DESC
    `
  );

  return rows.map(mapRowToUser);
}

/**
 * Csak aktív userek
 */
export async function findAllActive(client = pool) {
  const { rows } = await client.query(
    `
      SELECT *
      FROM users
      WHERE is_active = TRUE
      ORDER BY created_at DESC
    `
  );

  return rows.map(mapRowToUser);
}

/**
 * User létrehozása
 * Regisztrációnál első körben lehet password_hashed = null
 */
export async function create(
  {
    username,
    email,
    passwordHashed = null,
    userType = "USER",
    isLocal = false,
    phone = null,
    isActive = true,
  },
  client = pool
) {
  const { rows } = await client.query(
    `
      INSERT INTO users (
        username,
        email,
        password_hashed,
        user_type,
        is_local,
        phone,
        is_active,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `,
    [username, email, passwordHashed, userType, isLocal, phone, isActive]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Saját profil módosítása
 * Direkt nincs benne user_type és is_active
 */
export async function updateProfileById(
  id,
  {
    username,
    email,
    passwordHashed,
    isLocal,
    phone,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (username !== undefined) {
    fields.push(`username = $${index++}`);
    values.push(username);
  }

  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }

  if (passwordHashed !== undefined) {
    fields.push(`password_hashed = $${index++}`);
    values.push(passwordHashed);
  }

  if (isLocal !== undefined) {
    fields.push(`is_local = $${index++}`);
    values.push(isLocal);
  }

  if (phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(phone);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return mapRowToUser(rows[0]);
}

/**
 * Admin teljes user módosítása
 * Itt már lehet user_type és is_active is
 */
export async function updateById(
  id,
  {
    username,
    email,
    passwordHashed,
    userType,
    isLocal,
    phone,
    isActive,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (username !== undefined) {
    fields.push(`username = $${index++}`);
    values.push(username);
  }

  if (email !== undefined) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }

  if (passwordHashed !== undefined) {
    fields.push(`password_hashed = $${index++}`);
    values.push(passwordHashed);
  }

  if (userType !== undefined) {
    fields.push(`user_type = $${index++}`);
    values.push(userType);
  }

  if (isLocal !== undefined) {
    fields.push(`is_local = $${index++}`);
    values.push(isLocal);
  }

  if (phone !== undefined) {
    fields.push(`phone = $${index++}`);
    values.push(phone);
  }

  if (isActive !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(isActive);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return mapRowToUser(rows[0]);
}

/**
 * Jelszó beállítása / módosítása külön
 */
export async function setPasswordById(id, passwordHashed, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET password_hashed = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, passwordHashed]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Admin flag / role módosítása külön
 */
export async function updateUserTypeById(id, userType, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET user_type = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, userType]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Helyi státusz módosítása külön
 */
export async function updateIsLocalById(id, isLocal, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET is_local = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, isLocal]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Telefonszám módosítása külön
 */
export async function updatePhoneById(id, phone, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET phone = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, phone]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Aktiválás / deaktiválás
 * Ez jobb lehet, mint a fizikai törlés
 */
export async function updateActiveStatusById(id, isActive, client = pool) {
  const { rows } = await client.query(
    `
      UPDATE users
      SET is_active = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, isActive]
  );

  return mapRowToUser(rows[0]);
}

/**
 * User törlése fizikailag
 * Csak ha tényleg ezt akarod
 */
export async function deleteById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM users
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return mapRowToUser(rows[0]);
}

/**
 * Gyors ellenőrzés login/register flow-hoz
 * létezik-e email?
 */
export async function existsByEmail(email, client = pool) {
  const { rows } = await client.query(
    `
      SELECT 1
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return rows.length > 0;
}

/**
 * Megnézi, hogy van-e jelszó beállítva az adott userhez
 */
export async function hasPasswordByEmail(email, client = pool) {
  const { rows } = await client.query(
    `
      SELECT password_hashed
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  if (!rows[0]) return false;

  return !!rows[0].password_hashed;
}