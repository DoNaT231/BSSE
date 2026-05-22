import { API_BASE_URL } from "../../../config";
import dayjs from "dayjs";

/**
 * Helper: biztonságos JSON parse
 */
async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Helper: Authorization header
 */
function buildAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Helper: hét kezdete -> backendnek küldött YYYY-MM-DD
 */
function formatWeekStart(monday) {
  return dayjs(monday).format("YYYY-MM-DD");
}

/**
 * GET /api/calendar/slots?courtId=...&weekStart=...
 *
 * Mire jó:
 * - az adott pálya adott heti összes slotja
 * - ebből rajzolja ki a frontend a naptárat
 * - reservation / tournament / maintenance / training is jön innen
 *
 * Várható backend shape:
 * [
 *   {
 *     slotId,
 *     eventId,
 *     courtId,
 *     startTime,
 *     endTime,
 *     slotStatus,
 *     eventType,
 *     title,
 *     createdByUserId,
 *     tournamentId,
 *     organizerName,
 *     organizerLogoUrl
 *   }
 * ]
 */
export async function apiGetWeeklyCalendarSlots({ monday, courtId, token }) {
  const weekStart = formatWeekStart(monday);

  const res = await fetch(
    `${API_BASE_URL}/api/calendar/slots?courtId=${courtId}&weekStart=${weekStart}`,
    {
      method: "GET",
      headers: {
        ...buildAuthHeaders(token),
      },
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "A heti naptár lekérése sikertelen.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return Array.isArray(json) ? json : [];
}

/**
 * GET /api/reservations/my-weekly?courtId=...&weekStart=...
 *
 * Mire jó:
 * - a user saját heti reservationjei
 * - ebből épül fel a frontend selected state
 *
 * Várható backend shape:
 * [
 *   {
 *     slotId,
 *     eventId,
 *     courtId,
 *     startTime,
 *     endTime,
 *     slotStatus
 *   }
 * ]
 */
export async function apiGetOwnWeeklyReservations({ monday, courtId, token }) {
  const weekStart = formatWeekStart(monday);

  const res = await fetch(
    `${API_BASE_URL}/api/reservations/my-weekly?courtId=${courtId}&weekStart=${weekStart}`,
    {
      method: "GET",
      headers: {
        ...buildAuthHeaders(token),
      },
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "A saját heti foglalások lekérése sikertelen.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return Array.isArray(json) ? json : [];
}

/**
 * POST /api/reservations/sync
 *
 * Mire jó:
 * - a frontend beküldi az adott hét végső állapotát
 * - a backend ehhez synceli a reservationöket
 *
 * Paraméter:
 * reservations:
 * [
 *   {
 *     startTime: string,
 *     endTime: string
 *   }
 * ]
 */
export async function apiSyncWeekReservations({
  courtId,
  monday,
  token,
  reservations,
}) {
  const payload = {
    courtId,
    weekStart: formatWeekStart(monday),
    slots: Array.isArray(reservations) ? reservations : [],
  };

  const res = await fetch(`${API_BASE_URL}/api/reservations/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(token),
    },
    body: JSON.stringify(payload),
  });

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "Hiba történt a foglalások szinkronizálása során.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

/**
 * DELETE /api/reservations/:slotId
 *
 * Reservation törlése slot azonosító alapján.
 * Admin jogosultsággal más felhasználó foglalása is törölhető.
 */
export async function apiDeleteReservationBySlotId({ slotId, token }) {
  const res = await fetch(`${API_BASE_URL}/api/reservations/${slotId}`, {
    method: "DELETE",
    headers: {
      ...buildAuthHeaders(token),
    },
  });

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "A foglalás törlése sikertelen.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

/**
 * GET /api/calendar/print?courtId=...&weekStart=...
 *
 * Nyomtatási célra: minden reservation + tournament az adott pályán.
 */
export async function apiGetPrintableReservations({
  courtId,
  monday,
  token,
}) {
  const weekStart = formatWeekStart(monday);

  const query = new URLSearchParams({
    courtId: String(courtId),
    weekStart,
  });

  const res = await fetch(
    `${API_BASE_URL}/api/calendar/print?${query.toString()}`,
    {
    method: "GET",
    headers: {
      ...buildAuthHeaders(token),
    },
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "Nyomtatási adatok lekérése sikertelen.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}

/**
 * GET /api/calendar/print/all?weekStart=...
 *
 * Nyomtatási célra: minden pálya, minden user foglalása + tournament.
 */
export async function apiGetPrintableReservationsAll({ monday, token }) {
  const weekStart = formatWeekStart(monday);

  const query = new URLSearchParams({
    weekStart,
  });

  const res = await fetch(
    `${API_BASE_URL}/api/calendar/print/all?${query.toString()}`,
    {
      method: "GET",
      headers: {
        ...buildAuthHeaders(token),
      },
    }
  );

  const json = await parseJsonSafe(res);

  if (!res.ok) {
    const msg = json?.message || "Nyomtatási adatok lekérése sikertelen.";
    const err = new Error(msg);
    err.status = res.status;
    err.data = json;
    throw err;
  }

  return json;
}