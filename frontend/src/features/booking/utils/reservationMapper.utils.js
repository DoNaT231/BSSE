import dayjs from "dayjs";
import { parseLocalDateTime } from "../utils/reservationDate.utils.js";

/**
 * PostgreSQL timestamp without timezone formátum.
 * A frontend és backend között ezt használjuk.
 *
 * Példa:
 * 2026-03-11 14:00:00
 */
const LOCAL_TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";

/**
 * Backendből érkező slot objektumot
 * draft reservation formára alakít.
 *
 * Fontos:
 * - nem használunk toISOString()-ot
 * - minden időpont local time formátumban marad
 *
 * @param {Object} slot
 * @returns {{startTime: string, endTime: string}}
 */
export function toDraftReservation(slot) {
  return {
    startTime: dayjs(slot.startTime).format(LOCAL_TIMESTAMP_FORMAT),
    endTime: dayjs(slot.endTime).format(LOCAL_TIMESTAMP_FORMAT),
  };
}

/**
 * Megkeresi, hogy egy naptár cellához
 * tartozik-e backendből érkező slot.
 *
 * Összehasonlítás:
 * cellDate (Date) === slot.startTime
 *
 * @param {Array<Object>} calendarSlots
 * @param {Date} cellDate
 * @returns {Object|undefined}
 */
export function findCalendarSlotAtCell(calendarSlots, cellDate) {
  const cellTime = cellDate.getTime();

  return calendarSlots.find((slot) => {
    const slotStart = parseLocalDateTime(slot.startTime)?.getTime();
    return slotStart === cellTime;
  });
}

/**
 * Megnézi, hogy egy slot átfed-e egy naptárcellával.
 * A cella intervalluma: [cellDate, cellDate + 1 óra).
 *
 * @param {Object} slot - { startTime, endTime }
 * @param {Date} cellDate - cella kezdőidőpontja
 * @returns {boolean}
 */
export function slotOverlapsCell(slot, cellDate) {
  const cellStart = cellDate.getTime();
  const cellEnd = cellStart + 60 * 60 * 1000;

  const slotStart = parseLocalDateTime(slot.startTime)?.getTime();
  const slotEnd = parseLocalDateTime(slot.endTime)?.getTime();

  if (slotStart == null || slotEnd == null) return false;

  // Egész napos esemény: a teljes napot blokkolja,
  // azaz minden, ugyanarra a napra eső cellával átfed.
  if (slot.allDay) {
    const slotDate = parseLocalDateTime(slot.startTime);
    if (!slotDate) return false;
    return (
      slotDate.getFullYear() === cellDate.getFullYear() &&
      slotDate.getMonth() === cellDate.getMonth() &&
      slotDate.getDate() === cellDate.getDate()
    );
  }

  return slotStart < cellEnd && slotEnd > cellStart;
}

/**
 * Visszaadja az összes olyan slotot, ami átfed a megadott cellával.
 *
 * @param {Array<Object>} calendarSlots
 * @param {Date} cellDate
 * @returns {Array<Object>}
 */
export function findSlotsOverlappingCell(calendarSlots, cellDate) {
  return (calendarSlots || []).filter((slot) => slotOverlapsCell(slot, cellDate));
}

/**
 * Ellenőrzi, hogy a user draft foglalásai között
 * szerepel-e a megadott cella.
 *
 * A Date objektumot local timestamp stringgé alakítjuk,
 * majd összehasonlítjuk a draftReservation startTime mezővel.
 *
 * @param {Array<{startTime:string,endTime:string}>} draftReservations
 * @param {Date} cellDate
 * @returns {boolean}
 */
export function isDraftSelected(draftReservations, cellDate) {
  const cellKey = dayjs(cellDate).format(LOCAL_TIMESTAMP_FORMAT);

  return draftReservations.some(
    (reservation) => reservation.startTime === cellKey
  );
}