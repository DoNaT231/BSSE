import { apiGetWeekReservations, apiSyncWeekReservations } 
from "../api/reservations.api";

/**
 * Foglalások lekérése (WeeklyCalendar)
 */
export async function getWeekReservationsSafe({ monday, courtId, token }) {
  try {
    const rows = await apiGetWeekReservations({ monday, courtId, token });

    const data = rows.map((r) => ({
      courtId: Number(r.courtId),
      startTime: new Date(r.startAt),
      isMine: Boolean(r.isMine),
    }));

    return { ok: true, data };

  } catch (e) {
    return {
      ok: false,
      message: e.message || "Hiba a foglalások lekérdezésekor.",
    };
  }
}

/**
 * Foglalások mentése (sync)
 */
export async function syncReservationsSafe({ monday, courtId, token, reservations }) {
  try {
    const result = await apiSyncWeekReservations({
      monday,
      courtId,
      token,
      reservations,
    });

    return { ok: true, data: result };

  } catch (e) {
    return {
      ok: false,
      message: e.message || "Hiba a foglalások mentésekor.",
    };
  }
}