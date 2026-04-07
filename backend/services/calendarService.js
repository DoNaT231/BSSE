import * as calendarRepository from "../repositories/calendarRepository.js";

/**
 * User calendar slotok lekérése egy adott pályára és hétre
 *
 * Mire jó:
 * - heti naptár megjelenítés a frontendben
 * - a frontend ebből tudja eldönteni:
 *   - milyen típusú az esemény
 *   - milyen színnel jelenjen meg
 *   - tournament esetén van-e tournamentId
 *
 * @param {Object} params
 * @param {number} params.courtId - Kiválasztott pálya id
 * @param {string|Date} params.weekStart - Hét kezdete
 * @param {string|Date} params.weekEnd - Hét vége (exclusive)
 * @returns {Promise<Array>} Calendar slot tömb
 */
export async function getWeeklyCalendarSlotsByCourt({
  courtId,
  weekStart,
  weekEnd,
}) {
  return calendarRepository.getWeeklyCalendarSlotsByCourt({
    courtId,
    weekStart,
    weekEnd,
  });
}

/**
 * Admin calendar slotok lekérése egy adott pályára és hétre
 *
 * Mire jó:
 * - admin heti naptár
 * - több adatot ad vissza, mint a user nézet
 * - admin törlés / szerkesztés előtti megjelenítés
 *
 * @param {Object} params
 * @param {number} params.courtId - Kiválasztott pálya id
 * @param {string|Date} params.weekStart - Hét kezdete
 * @param {string|Date} params.weekEnd - Hét vége (exclusive)
 * @returns {Promise<Array>} Admin calendar slot tömb
 */
export async function getAdminWeeklySlotsByCourt({
  courtId,
  weekStart,
  weekEnd,
}) {
  return calendarRepository.getAdminWeeklySlotsByCourt({
    courtId,
    weekStart,
    weekEnd,
  });
}

/**
 * Egy slot részletes lekérése a hozzá tartozó event adataival együtt
 *
 * Mire jó:
 * - admin rákattint egy slotra
 * - meg lehessen jeleníteni a hozzá tartozó adatokat
 *
 * @param {number} slotId
 * @returns {Promise<Object|null>}
 */
export async function getSlotWithEventBySlotId(slotId) {
  return calendarRepository.getSlotWithEventBySlotId(slotId);
}