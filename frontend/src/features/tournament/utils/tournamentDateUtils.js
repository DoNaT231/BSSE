/**
 * tournamentDateUtils
 * -----------------------------------------------------------------------------
 * Fontos:
 * - Ez a fájl a tournament feature dátumformázó segédfüggvényeit tartalmazza.
 * - Csak tiszta utility függvények legyenek itt.
 * - Ne legyen benne React hook, state vagy API hívás.
 *
 * Mire használjuk:
 * - backendből kapott ISO dátum átalakítása datetime-local inputhoz
 * - datetime-local input érték átalakítása backend-kompatibilis stringgé
 *
 * Megjegyzés:
 * - A datetime-local input nem timezone-aware mező.
 * - Ezért különösen fontos, hogy a frontend és backend ugyanazt a formátumot várja.
 */
export function toDatetimeLocalValue(isoStringOrNull) {
    if (!isoStringOrNull) return "";
  
    const d = new Date(isoStringOrNull);
    if (Number.isNaN(d.getTime())) return "";
  
    const pad = (n) => String(n).padStart(2, "0");
  
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  
  export function datetimeLocalToString(value) {
    if (!value) return null;
  
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
      console.warn("Invalid datetime-local value:", value);
      return null;
    }
  
    return `${value}:00`;
  }
  export function formatDateTime(value) {
  if (!value) return null;

  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

function extractAvailableFromLiteral(value) {
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

function parseAvailableFromWallClock(value) {
  const wallClock = extractAvailableFromLiteral(value);
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

/** datetime-local -> "YYYY-MM-DD HH:mm:ss" (available_from mentéshez) */
export function availableFromToWallClock(value) {
  if (!value) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) {
    return `${raw.replace("T", " ")}:00`;
  }

  return extractAvailableFromLiteral(raw);
}

/** wall-clock / ISO -> datetime-local input érték */
export function toAvailableFromDatetimeLocal(value) {
  const wallClock = extractAvailableFromLiteral(value);
  if (!wallClock) return "";

  const [datePart, timePart] = wallClock.split(" ");
  const [hour, minute] = timePart.split(":");

  return `${datePart}T${hour}:${minute}`;
}

/** Megjelenítés available_from értékhez */
export function formatAvailableFrom(value) {
  const wallClock = extractAvailableFromLiteral(value);
  if (!wallClock) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toLocaleString("hu-HU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return null;
  }

  const date = parseAvailableFromWallClock(wallClock);
  if (!date || Number.isNaN(date.getTime())) return null;

  return date.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
