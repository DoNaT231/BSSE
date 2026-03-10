import ReservationSlot from "./ReservationSlot";

export default function ReservationCalendarGrid({
  days,
  hours,
  monday,
  draftReservations,
  calendarSlots,
  currentUserId,
  role,
  handleClick
}) {

  const safeDraftReservations = Array.isArray(draftReservations)
    ? draftReservations
    : [];

  const safeCalendarSlots = Array.isArray(calendarSlots)
    ? calendarSlots
    : [];

  return (
    <div className="w-full max-w-[960px] mx-auto bg-white border border-border rounded-card overflow-hidden shadow-soft">

      {/* header */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-primaryLight font-semibold text-center text-sm border-b border-border">
        <div></div>
        {days.map(day => (
          <div key={day} className="py-3">
            {day}
          </div>
        ))}
      </div>

      {hours.map(hour => (
        <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] text-sm">

          <div className="py-2 text-center border-r bg-primaryLight border-border">
            {hour}:00
          </div>

          {days.map((_, dayIndex) => (

            <ReservationSlot
              key={`${dayIndex}-${hour}`}
              dayIndex={dayIndex}
              hour={hour}
              monday={monday}

              draftReservations={safeDraftReservations}
              calendarSlots={safeCalendarSlots}

              currentUserId={currentUserId}
              role={role}

              handleClick={handleClick}
            />

          ))}

        </div>
      ))}
    </div>
  );
}