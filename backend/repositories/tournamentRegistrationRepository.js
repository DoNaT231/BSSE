/**
 * Event módosítása id alapján
 *
 * Csak az átadott mezőket frissíti.
 */
export async function updateEventById(
  id,
  {
    title,
    description,
    status,
    visibility,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(title);
  }

  if (description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(description);
  }

  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }

  if (visibility !== undefined) {
    fields.push(`visibility = $${index++}`);
    values.push(visibility);
  }

  if (fields.length === 0) {
    const { rows } = await client.query(
      `
        SELECT *
        FROM events
        WHERE id = $1
      `,
      [id]
    );

    return rows[0];
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE events
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return rows[0];
}
/**
 * Tournament nevezés módosítása id alapján
 *
 * Csak az átadott mezőket frissíti.
 */
export async function updateById(
  id,
  {
    teamName,
    telNumber,
    contactEmail,
    players,
  },
  client = pool
) {
  const fields = [];
  const values = [];
  let index = 1;

  if (teamName !== undefined) {
    fields.push(`team_name = $${index++}`);
    values.push(teamName);
  }

  if (telNumber !== undefined) {
    fields.push(`tel_number = $${index++}`);
    values.push(telNumber);
  }

  if (contactEmail !== undefined) {
    fields.push(`contact_email = $${index++}`);
    values.push(contactEmail);
  }

  if (players !== undefined) {
    fields.push(`players = $${index++}`);
    values.push(players);
  }

  if (fields.length === 0) {
    return findById(id, client);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await client.query(
    `
      UPDATE tournament_registrations
      SET ${fields.join(", ")}
      WHERE id = $${index}
      RETURNING *
    `,
    values
  );

  return mapRowToTournamentRegistration(rows[0]);
}

/**
 * Tournament nevezés törlése id alapján
 */
export async function deleteById(id, client = pool) {
  const { rows } = await client.query(
    `
      DELETE FROM tournament_registrations
      WHERE id = $1
      RETURNING *
    `,
    [id]
  );

  return mapRowToTournamentRegistration(rows[0]);
}