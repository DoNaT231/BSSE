import { API_BASE_URL } from "../../../config";
import dayjs from "dayjs";

/**
 * Helper: egységes error dobás
 */
async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * GET /api/reservations/by-court-week
 * Backend user DTO (megbeszélt):
 * [
 *   { courtId: number, startAt: string, isMine: boolean }
 * ]
 */
export async function apiGetWeekReservations({ monday, courtId, token }) {
  const weekStart = dayjs(monday).format("YYYY-MM-DD");

  const res = await fetch(
    `${API_BASE_URL}/api/reservations/by-court-week?courtId=${courtId}&weekStart=${weekStart}`,
    {
      method: "GET",
      headers: {
        ...buildAuthHeaders(token),
      },
      // ha cookie-s authot használsz is, maradhat:
      // credentials: "include",
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "Foglalások lekérése sikertelen";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

/**
 * POST /api/reservations/sync?courtIdFromQuery=...
 * Body: ownReservations (vagy [{monday}] ha törlős mód)
 * Response: { message: string, ... }
 */
export async function apiSyncWeekReservations({ courtId, monday, token, reservations }) {
  const payload =
    Array.isArray(reservations) && reservations.length > 0
      ? reservations
      : [{ monday }];

  const res = await fetch(
    `${API_BASE_URL}/api/reservations/sync?courtIdFromQuery=${courtId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(token),
      },
      body: JSON.stringify(payload),
      // credentials: "include",
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "Hiba történt a szinkronizálás során.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}