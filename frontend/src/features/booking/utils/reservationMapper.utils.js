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