import React from "react";
import ReactDOM from "react-dom";
import { HOURS } from "../constants/reservation.constants.js";
import {
  getPrintCellClasses,
  PRINT_HEADER_CELL,
} from "../utils/printScheduleClasses.js";
import { getPrintCellEvent } from "../utils/printScheduleMatch.js";

const PrintableDailySchedule = ({ reservations, courts, printDate }) => {
  const safeReservations = Array.isArray(reservations) ? reservations : [];
  const safeCourts = Array.isArray(courts) ? courts : [];

  const day = new Date(printDate);
  day.setHours(0, 0, 0, 0);

  const hourGridCols = `120px repeat(${HOURS.length}, 1fr)`;

  const titleDate = day.toLocaleDateString("hu-HU", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return ReactDOM.createPortal(
    <div className="w-full bg-white p-0 text-black print:break-inside-avoid print:break-after-avoid">
      <h1 className="mb-3 text-center text-[14pt] font-bold">
        Napi foglalások – {titleDate}
      </h1>

      <div className="w-full overflow-hidden rounded-lg border border-black">
        <div className="grid" style={{ gridTemplateColumns: hourGridCols }}>
          <div
            className={`${PRINT_HEADER_CELL} border-r border-black px-2 py-1.5 text-left text-[8.5pt]`}
          >
            Pálya
          </div>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className={`${PRINT_HEADER_CELL} border-r border-black px-1 py-1.5 text-[8.5pt] last:border-r-0`}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {safeCourts.map((court) => (
          <div
            key={court.id}
            className="grid border-t border-black"
            style={{ gridTemplateColumns: hourGridCols }}
          >
            <div className="flex items-center border-r border-black bg-[#f3f7ff] px-2 py-1.5 text-[9pt] font-bold">
              {court.name}
            </div>

            {HOURS.map((hour) => {
              const cell = getPrintCellEvent(
                safeReservations,
                court.id,
                day,
                hour
              );
              return (
                <div
                  key={hour}
                  className={`${getPrintCellClasses(cell.kind)} min-h-9 border-r border-black px-1 text-center text-[8pt] last:border-r-0`}
                >
                  {cell.text}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>,
    document.getElementById("print-root")
  );
};

export default PrintableDailySchedule;
