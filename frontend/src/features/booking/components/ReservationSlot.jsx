export default function ReservationSlot({
  dayIndex,
  hour,
  monday,
  ownReservations,
  reservedDates,
  userId,
  role,
  handleClick
}) {

  const cellDate = new Date(monday);
  cellDate.setDate(monday.getDate() + dayIndex);
  cellDate.setHours(hour, 0, 0, 0);

  /**
     * isSameHour:
     * Két Date ugyanarra az órára esik-e (év/hónap/nap/óra egyezés).
     * A cellákhoz tartozó foglaltság ellenőrzésére használod.
     */
    const isSameHour = (d1, d2) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate() &&
      d1.getHours() === d2.getHours();
  

  const isOwn = ownReservations.some(r =>
    isSameHour(new Date(r.startTime), cellDate)
  );

  const isOther = reservedDates.some(
    r =>
      isSameHour(new Date(r.startTime), cellDate) &&
      r.userId !== userId
  );

  let cellClass =
    "h-12 m-0.5 rounded-md border border-gray-200 cursor-pointer transition";

  if (isOwn) {
    cellClass += " bg-yellow";
  } else if (isOther && role) {
    cellClass += " bg-lightBlue";
  } else if (isOther) {
    cellClass += " bg-lightBlue pointer-events-none cursor-not-allowed";
  } else {
    cellClass += " hover:bg-yellow";
  }

  return (
    <div
      className={cellClass}
      onClick={() => handleClick(dayIndex, hour)}
    />
  );
}