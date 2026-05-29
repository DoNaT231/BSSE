import React from "react";
import ReactDOM from "react-dom";
import { DAYS, HOURS } from "../constants/reservation.constants.js";
import {
  getPrintCellClasses,
  PRINT_HEADER_CELL,
  PRINT_HOUR_CELL,
} from "../utils/printScheduleClasses.js";
import { getPrintCellEvent } from "../utils/printScheduleMatch.js";

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

  return ReactDOM.createPortal(
    <div className="w-full bg-white p-0 text-black print:mx-auto">
      {safeCourts.map((court) => (
        <div
          key={court.id}
          className="mb-6 min-h-[450px] break-inside-avoid break-after-page last:break-after-auto"
        >
          <div className="mb-2.5 text-center text-base font-bold">
            {court.name}
          </div>

          <div className="w-full overflow-hidden rounded-[10px] border border-black">
            <div className="grid grid-cols-[80px_repeat(7,1fr)]">
              <div />
              {DAYS.map((dayLabel) => (
                <div
                  key={dayLabel}
                  className={`${PRINT_HEADER_CELL} py-2 text-[11pt]`}
                >
                  {dayLabel}
                </div>
              ))}
            </div>

            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(7,1fr)] border-t border-black"
              >
                <div className={`${PRINT_HOUR_CELL} py-1.5 text-[10.5pt]`}>
                  {hour}:00
                </div>

                {days.map((day, dayIndex) => {
                  const cell = getPrintCellEvent(
                    safeReservations,
                    court.id,
                    day,
                    hour
                  );

                  return (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className={`${getPrintCellClasses(cell.kind)} h-12 px-1.5 text-[10.5pt]`}
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
