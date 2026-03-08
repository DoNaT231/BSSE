export default function ReservationSlot({
  dayIndex,
  hour,
  monday,
  ownReservations,
  reservedDates,
  role,
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

  // Saját: ownReservations startTime string -> Date
  const isOwn = ownReservations.some((r) =>
    isSameHour(new Date(r.startTime), cellDate)
  );

  // Másé: reservedDates elemei nálunk UI DTO-k:
  // { startTime: Date, isMine: boolean, ... }
  // Ha te reservedDates-be már eleve csak "másokat" teszel, akkor elég a sameHour check.
  // Biztonságból itt még r.isMine === false-t is figyelembe vesszük, ha benne lenne minden.
  const isOther = reservedDates.some((r) => {
    const t = r.startTime instanceof Date ? r.startTime : new Date(r.startTime);
    return isSameHour(t, cellDate) && (r.isMine === undefined ? true : r.isMine === false);
  });

  let cellClass =
    "h-12 m-0.5 rounded-md border border-gray-200 cursor-pointer transition";

  if (isOwn) {
    cellClass += " bg-amber-500 hover:bg-yellow";
  } else if (isOther && role === "admin") {
    // admin tud kattintani más foglalására is (pl. törlés)
    cellClass += " bg-lightBlue";
  } else if (isOther) {
    // user ne tudjon rákattintani más foglalására
    cellClass += " bg-lightBlue pointer-events-none cursor-not-allowed";
  } else {
    cellClass += " hover:bg-yellow";
  }

  return (
    <div className={cellClass} onClick={() => handleClick(dayIndex, hour)} />
  );
}