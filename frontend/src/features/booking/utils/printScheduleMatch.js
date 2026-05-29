import { isSameWallClockDay, parseWallClockParts } from "./reservationDate.utils.js";

export function getPrintCellEvent(reservations, courtId, day, hour) {
  const tournamentForDay = reservations.find((r) => {
    const parts = parseWallClockParts(r.booked_time);
    return (
      parts &&
      r.eventType === "tournament" &&
      Number(r.courtId) === Number(courtId) &&
      isSameWallClockDay(r.booked_time, day)
    );
  });

  if (tournamentForDay?.username) {
    return { kind: "tournament", text: tournamentForDay.username };
  }

  const reservationForCell = reservations.find((r) => {
    const parts = parseWallClockParts(r.booked_time);
    return (
      parts &&
      r.eventType === "reservation" &&
      Number(r.courtId) === Number(courtId) &&
      isSameWallClockDay(r.booked_time, day) &&
      parts.hour === hour
    );
  });

  if (reservationForCell?.username) {
    return { kind: "reservation", text: reservationForCell.username };
  }

  return { kind: "free", text: "" };
}
