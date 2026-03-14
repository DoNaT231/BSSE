export default function ReservationSlot({
  dayIndex,
  hour,
  monday,
  initialReservations = [],
  draftReservations = [],
  calendarSlots = [],
  role,
  currentUserId,
  handleClick,
}) {
  const cellDate = new Date(monday);
  cellDate.setDate(monday.getDate() + dayIndex);
  cellDate.setHours(hour, 0, 0, 0);

  const isSameHour = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours();

  const safeInitialReservations = Array.isArray(initialReservations)
    ? initialReservations
    : [];

  const safeDraftReservations = Array.isArray(draftReservations)
    ? draftReservations
    : [];

  const safeCalendarSlots = Array.isArray(calendarSlots)
    ? calendarSlots
    : [];

  const isInitiallyOwnReservation = safeInitialReservations.some((reservation) =>
    isSameHour(new Date(reservation.startTime), cellDate)
  );

  const isDraftSelected = safeDraftReservations.some((reservation) =>
    isSameHour(new Date(reservation.startTime), cellDate)
  );

  const wasRemovedFromOwnReservations =
    isInitiallyOwnReservation && !isDraftSelected;

  const existingCalendarSlot = safeCalendarSlots.find((slot) =>
    isSameHour(new Date(slot.startTime), cellDate)
  );

  const isOwnExistingReservation =
    !wasRemovedFromOwnReservations &&
    existingCalendarSlot?.eventType === "reservation" &&
    Number(existingCalendarSlot?.createdByUserId) === Number(currentUserId);

  const isBlockedByOtherReservation =
    !wasRemovedFromOwnReservations &&
    existingCalendarSlot?.eventType === "reservation" &&
    Number(existingCalendarSlot?.createdByUserId) !== Number(currentUserId);

  const isTournamentSlot =
    !wasRemovedFromOwnReservations &&
    existingCalendarSlot?.eventType === "tournament";

  const isMaintenanceSlot =
    !wasRemovedFromOwnReservations &&
    existingCalendarSlot?.eventType === "maintenance";

  const isTrainingSlot =
    !wasRemovedFromOwnReservations &&
    existingCalendarSlot?.eventType === "training";

  let cellClass =
    "h-12 m-0.5 rounded-md border border-gray-200 cursor-pointer transition";

  if (isDraftSelected || isOwnExistingReservation) {
    cellClass += " bg-amber-500 hover:bg-yellow";
  } else if (isTournamentSlot) {
    cellClass += " bg-violet-600 text-white";
  } else if (isMaintenanceSlot) {
    cellClass += " bg-yellow-400 border-black";
  } else if (isTrainingSlot) {
    cellClass += " bg-emerald-500 text-white";
  } else if (isBlockedByOtherReservation && role === "admin") {
    cellClass += " bg-lightBlue";
  } else if (isBlockedByOtherReservation) {
    cellClass += " bg-lightBlue pointer-events-none cursor-not-allowed";
  } else {
    cellClass += " hover:bg-yellow";
  }

  return (
    <div
      className={cellClass}
      onClick={() => handleClick(dayIndex, hour)}
      title={
        isTournamentSlot
          ? "Tournament"
          : isMaintenanceSlot
          ? "Karbantartás"
          : isTrainingSlot
          ? "Edzés"
          : isBlockedByOtherReservation
          ? "Foglalt"
          : isDraftSelected || isOwnExistingReservation
          ? "Saját foglalás"
          : "Szabad időpont"
      }
    />
  );
}