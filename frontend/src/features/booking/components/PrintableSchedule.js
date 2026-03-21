import React from "react";
import ReactDOM from "react-dom";
import "./PrintableSchedule.css"; // ebben van a @media print
import { DAYS, HOURS } from "../constants/reservation.constants.js";

const PrintableSchedule = ({ reservations, courts, weekStart }) => {
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeCourts = Array.isArray(courts) ? courts : [];

  const weekStartDate = new Date(weekStart);
  weekStartDate.setHours(0, 0, 0, 0);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate);
    d.setDate(d.getDate() + i);
    return d;
  });

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  function getCellEvent(courtId, day, hour) {
    // Calendar UI-ban a tournament az egész napot blokkolli,
    // ezért a printben is: ha van tournament ezen a napon, akkor minden óracellába ezt írjuk.
    const tournamentForDay = safeReservations.find((r) => {
      const rd = new Date(r.booked_time);
      return (
        r.eventType === "tournament" &&
        Number(r.courtId) === Number(courtId) &&
        isSameDay(rd, day)
      );
    });

    if (tournamentForDay?.username) {
      return { kind: "tournament", text: tournamentForDay.username };
    }

    // Reservationeknél marad a "pont abban az órában" logika.
    const reservationForCell = safeReservations.find((r) => {
      const rd = new Date(r.booked_time);
      return (
        r.eventType === "reservation" &&
        Number(r.courtId) === Number(courtId) &&
        isSameDay(rd, day) &&
        rd.getHours() === hour
      );
    });

    if (reservationForCell?.username) {
      return { kind: "reservation", text: reservationForCell.username };
    }

    return { kind: "free", text: "" };
  }

  return ReactDOM.createPortal(
    <div className="print-container">
      {safeCourts.map((court) => (
        <div key={court.id} className="print-court-block">
          <div className="print-court-title">{court.name}</div>

          <div className="print-calendar">
            <div className="print-header grid grid-cols-[80px_repeat(7,1fr)]">
              <div />
              {DAYS.map((dayLabel) => (
                <div key={dayLabel} className="print-header-cell">
                  {dayLabel}
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div
                key={hour}
                className="print-row grid grid-cols-[80px_repeat(7,1fr)]"
              >
                <div className="print-hour-cell">{hour}:00</div>

                {days.map((day, dayIndex) => {
                  const cell = getCellEvent(court.id, day, hour);
                  const hasEvent = cell.kind !== "free";

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={
                        "print-cell " +
                        (cell.kind === "reservation"
                          ? "print-cell--reserved"
                          : cell.kind === "tournament"
                          ? "print-cell--tournament"
                          : "print-cell--free")
                      }
                    >
                      {cell.text}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>,
    document.getElementById("print-root")
  );
};

export default PrintableSchedule;
