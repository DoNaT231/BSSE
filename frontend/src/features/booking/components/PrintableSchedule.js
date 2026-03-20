import React from "react";
import ReactDOM from "react-dom";
import "./PrintableSchedule.css"; // ebben van a @media print

const PrintableSchedule = ({ reservations, courts, weekStart }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weekEnd = () => {
    const weekend = new Date(weekStart)
    weekend.setDate(weekend.getDate()+7) 
    return weekend
  }

  console.log("reses:", reservations);
  console.log("courts:", courts);
  console.log("weekstart:", weekStart);
  const getReservations = (courtId, day) => {
    return reservations
      .filter(
        (r) =>
          Number(r.courtId) === Number(courtId) &&
          (() => {
            const rd = new Date(r.booked_time);
            return (
              rd.getFullYear() === day.getFullYear() &&
              rd.getMonth() === day.getMonth() &&
              rd.getDate() === day.getDate()
            );
          })()
      )
      .sort(
        (a, b) => new Date(a.booked_time).getTime() - new Date(b.booked_time).getTime()
      );
  };

  return ReactDOM.createPortal(
    <div className="print-container">
      <h1>Heti Foglalási Táblázat ({weekStart.toLocaleDateString()} - {weekEnd().toLocaleDateString()})</h1>
      {courts.map((court) => (
        <div key={court.id} className="court-block">
          <h2>{court.name}</h2>
          <table>
            <thead>
              <tr>
                {days.map((day, idx) => (
                  <th key={idx}>
                    {day.toLocaleDateString('hu-HU', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {days.map((day, idx) => (
                  <td key={idx}>
                    {getReservations(court.id, day).map((res, index) => (
                      <div key={index}>
                        {new Date(res.booked_time).toLocaleTimeString('hu-HU', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        - {res.username || res.guestName || 'Ismeretlen'}
                      </div>
                    ))}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      ))}
    </div>,
    document.getElementById('print-root')
  );
};

export default PrintableSchedule;
