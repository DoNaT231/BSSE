import dayjs from "dayjs";

/**
 * PostgreSQL timestamp without time zone
 * pl. "2026-03-11 14:00:00"
 * => local Date objektummá alakítja
 */
export function parseLocalDateTime(dateTimeString) {
  if (!dateTimeString) return null;

  const [datePart, timePart = "00:00:00"] = dateTimeString.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, second || 0, 0);
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