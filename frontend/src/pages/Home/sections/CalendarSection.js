import React from "react";
import WeeklyCalendar from "../../../features/booking/page/WeeklyTimeGrid";

/**
 * CalendarSection
 * ---------------
 * Pályafoglalás cím + WeeklyTimeGrid komponens.
 */
export default function CalendarSection() {
  return (
    <section className="font-[Anton]">
      <h1 className="text-center text-[40px] mt-16 mb-6">Pályafoglalás</h1>
      <div className="px-4">
        <WeeklyCalendar />
      </div>
    </section>
  );
}
