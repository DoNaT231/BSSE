import {
  isSameDay,
  parseLocalDateTime,
} from "../utils/reservationDate.utils.js";

/**
 * Ellenőrzi, hogy a user kijelölhet-e egy új foglalási időpontot.
 *
 * Szabályok:
 * - múltbeli időpontra nem lehet foglalni
 * - a mai napra már nem lehet foglalni
 * - holnapra 18:00 után már nem lehet foglalni
 * - egy nap maximum 2 óra foglalható
 * - egy héten maximum 10 óra foglalható
 *
 * Minden dátum local time szerint értelmezett.
 *
 * @param {Object} params
 * @param {Date} params.cellDate - a kattintott cella kezdő időpontja local time-ban
 * @param {Date} params.now - aktuális idő local time-ban
 * @param {Date} params.monday - az aktuális hét hétfője local time-ban
 * @param {Date} params.weekEndExclusive - a hét vége exclusive local time-ban
 * @param {Array<{startTime: string, endTime: string}>} params.draftReservations
 *
 * @returns {string|null} Hibaüzenet, ha szabályt sért; különben null
 */
export function validateReservationSelection({
  cellDate,
  now,
  monday,
  weekEndExclusive,
  draftReservations,
}) {
  const drafts = Array.isArray(draftReservations) ? draftReservations : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (cellDate < now) {
    return "Múltbeli időpontokra nem lehet foglalni.";
  }

  if (isSameDay(today, cellDate)) {
    return "A mai napra már nem lehet foglalni.";
  }

  if (isSameDay(tomorrow, cellDate) && now.getHours() >= 18) {
    return "18 óra után már nem lehet a következő napra foglalni.";
  }

  /**
   * A draft foglalásokat local Date objektummá alakítjuk,
   * timezone-kezelés nélkül.
   */
  const ownDates = drafts
    .map((reservation) => parseLocalDateTime(reservation.startTime))
    .filter(Boolean);

  const dayCount = ownDates.filter((date) => isSameDay(date, cellDate)).length;
  if (dayCount >= 2) {
    return "Egy nap maximum két óra foglalható.";
  }

  const weekCount = ownDates.filter(
    (date) => date >= monday && date < weekEndExclusive
  ).length;

  if (weekCount >= 10) {
    return "Egy héten maximum 10 óra foglalható.";
  }

  return null;
}

/**
 * Visszaadja, milyen üzenetet kapjon a user,
 * ha egy slot nem foglalható.
 *
 * @param {Object|null} slot
 * @returns {string}
 */
export function getBlockedSlotMessage(slot) {
  if (!slot) return "Ez az időpont nem foglalható.";

  if (slot.eventType === "tournament") {
    return "Ez az időpont tournament miatt foglalt.";
  }

  if (slot.eventType === "maintenance") {
    return "Ez az időpont karbantartás miatt nem foglalható.";
  }

  if (slot.eventType === "training") {
    return "Ez az időpont edzés miatt foglalt.";
  }

  return "Ez az időpont már foglalt.";
}