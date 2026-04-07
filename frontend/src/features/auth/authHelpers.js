/**
 * Auth helper függvények
 * ---------------------------------------
 * Kisegítő utility függvények az auth
 * folyamat számára:
 * - email normalizálás
 * - email validáció
 * - hibaüzenetek kezelése
 */

/**
 * normalizeEmail(email)
 * ---------------------------------------
 * Az email címet egységes formára alakítja:
 * - whitespace eltávolítása
 * - kisbetűssé alakítás
 */
export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/**
 * isValidEmail(email)
 * ---------------------------------------
 * Ellenőrzi, hogy az email formátuma
 * megfelel-e egy alap regex validációnak.
 */
export function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

/**
 * getErrorMessage(error, fallback)
 * ---------------------------------------
 * Egységes hibaüzenet kezelés.
 *
 * Ha az error egy Error objektum,
 * visszaadja annak message mezőjét.
 *
 * Egyéb esetben fallback üzenetet ad vissza.
 */
export function getErrorMessage(error, fallback = "Hiba történt.") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}