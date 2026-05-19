/**
 * Wall-clock időkezelés a tournament_details.available_from mezőhöz.
 * timestamp without time zone – nincs timezone konverzió.
 */

function pad2(n) {
  return String(n).padStart(2, "0");
}

function extractWallClockLiteral(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(raw)) {
    return `${raw}:00`;
  }

  const match = raw.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/
  );

  if (!match) return null;

  const seconds = match[4] ?? "00";
  return `${match[1]} ${match[2]}:${match[3]}:${seconds}`;
}

function formatDateAsWallClock(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;

  // node-pg a timestamp without time zone értéket helyi Date-ként adja vissza
  // (postgres-date: new Date(y, m, d, h, min, s)), ezért local getter kell –
  // dev (Windows/CET) és prod (UTC) környezetben is a tárolt falióra-idő jön ki.
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(
    date.getSeconds()
  )}`;
}

export function normalizeAvailableFrom(value) {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return formatDateAsWallClock(value);
  }

  return extractWallClockLiteral(value);
}

export function parseAvailableFrom(value) {
  const wallClock = normalizeAvailableFrom(value);
  if (!wallClock) return null;

  const [datePart, timePart = "00:00:00"] = wallClock.split(" ");
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
