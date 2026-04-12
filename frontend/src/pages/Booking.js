import Header from "../components/Header";
import WeeklyCalendar from "../features/booking/pages/WeeklyCalendar";

export default function Booking() {
  return (
    <div className="page-root flex min-h-screen min-w-0 flex-col">
      <Header />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <WeeklyCalendar />
      </div>
    </div>
  );
}