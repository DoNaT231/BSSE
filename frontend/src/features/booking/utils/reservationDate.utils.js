import dayjs from "dayjs";

/**
 * Falióra részek kiolvasása stringből — Date objektum nélkül (nyomtatás, illesztés).
 * Elfogadja: "2026-03-11 14:00:00", "2026-03-11T14:00:00"
 */
export function parseWallClockParts(dateTimeString) {
  if (dateTimeString == null) return null;

  const normalized = String(dateTimeString)
    .trim()
    .replace("T", " ")
    .replace(/\.\d+$/, "")
    .replace(/Z$/i, "");

  const match = normalized.match(
    /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] || 0),
  };
}

/**
 * Falióra (wall-clock) → Date, időzóna-eltolás nélkül.
 */
export function parseLocalDateTime(dateTimeString) {
  const parts = parseWallClockParts(dateTimeString);
  if (!parts) return null;

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
    0
  );
}

export function getWallClockHour(dateTimeString) {
  return parseWallClockParts(dateTimeString)?.hour ?? null;
}

export function isSameWallClockDay(dateTimeString, dayDate) {
  const parts = parseWallClockParts(dateTimeString);
  if (!parts || !dayDate) return false;

  return (
    parts.year === dayDate.getFullYear() &&
    parts.month === dayDate.getMonth() + 1 &&
    parts.day === dayDate.getDate()
  );
}

export function getMondayFromOffset(weekOffset) {
  const now = new Date();
  const clone = new Date(now);
  const day = clone.getDay();
  const diff = clone.getDate() - day + (day === 0 ? -6 : 1);

  clone.setDate(diff);
  clone.setHours(0, 0, 0, 0);
  clone.setDate(clone.getDate() + weekOffset * 7);

  return clone;
}

export function getSundayFromMonday(monday) {
  const end = new Date(monday);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function getWeekEndExclusive(monday) {
  const end = new Date(monday);
  end.setDate(end.getDate() + 7);
  end.setHours(0, 0, 0, 0);
  return end;
}

export function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function getCellDate(monday, dayIndex, hour) {
  const cellDate = new Date(monday);
  cellDate.setDate(monday.getDate() + dayIndex);
  cellDate.setHours(hour, 0, 0, 0);
  return cellDate;
}

export function getCellEndDate(startDate) {
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + 1);
  return endDate;
}

export function toIso(date) {
  return dayjs(date).toISOString();
}