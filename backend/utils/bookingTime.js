/**
 * Time helpers for "timestamp without time zone" fields (wall-clock).
 *
 * A DB-ben a foglalások ideje tz nélkül van tárolva (pl. "YYYY-MM-DD HH:mm:ss"),
 * ezért NE használjunk UTC-alapú ISO konverziót (toISOString), mert "eltolódást"
 * (pl. +1 óra) okozhat különböző környezetekben.
 */

function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * "YYYY-MM-DD HH:mm:ss" -> Date (local components alapján).
 * Ha a string már Date, azt is kezeli.
 */
export function parseLocalDateTime(dateTimeString) {
  if (!dateTimeString) return null;

  if (dateTimeString instanceof Date) {
    return Number.isNaN(dateTimeString.getTime()) ? null : dateTimeString;
  }

  const raw = String(dateTimeString).trim();

  // Támogatjuk az esetet is, ha véletlenül ISO-t kapunk.
  // Ilyenkor a Date->local formatet fogjuk használni később.
  if (raw.includes("T")) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const [datePart, timePart = "00:00:00"] = raw.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    Number.isFinite(second) ? second : 0,
    0
  );
}

/**
 * Date -> "YYYY-MM-DD HH:mm:ss" local formatban.
 */
export function formatLocalDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
    date.getSeconds()
  )}`;
}

function isWallClockDateTimeString(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v);
}

/**
 * Normalizálás összehasonlításhoz / kulcshoz.
 * - ha wall-clock string: marad
 * - ha Date: local -> string
 * - ha ISO: Date parse -> local string
 */
export function normalizeWallClockValue(value) {
  if (!value) return "";
  if (typeof value === "string") {
    const s = value.trim();
    if (isWallClockDateTimeString(s)) return s;
    if (s.includes("T")) {
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? s : formatLocalDateTime(d);
    }
    return s;
  }
  if (value instanceof Date) return formatLocalDateTime(value);
  return String(value);
}

/**
 * Slot key wall-clock stringekből (ne toISOString-ból).
 */
export function makeWallClockSlotKey({ startTime, endTime }) {
  return `${normalizeWallClockValue(startTime)}__${normalizeWallClockValue(endTime)}`;
}

/**
 * weekStart: "YYYY-MM-DD" -> { weekStart, weekEnd } wall-clock stringekkel:
 * - weekStart: "YYYY-MM-DD 00:00:00"
 * - weekEnd:   "YYYY-MM-DD 00:00:00" (7 nappal később)
 */
export function buildWeekRangeFromWeekStart(weekStart) {
  if (!weekStart) throw new Error("Érvénytelen weekStart dátum.");

  const [y, m, d] = String(weekStart).split("-").map(Number);
  if (!y || !m || !d) throw new Error("Érvénytelen weekStart dátum.");

  const startDate = new Date(y, m - 1, d);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const startStr = `${startDate.getFullYear()}-${pad2(
    startDate.getMonth() + 1
  )}-${pad2(startDate.getDate())} 00:00:00`;
  const endStr = `${endDate.getFullYear()}-${pad2(
    endDate.getMonth() + 1
  )}-${pad2(endDate.getDate())} 00:00:00`;

  return { weekStart: startStr, weekEnd: endStr };
}

