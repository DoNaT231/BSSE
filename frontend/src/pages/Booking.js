import Header from "../components/Header";
import WaveDivider from "../components/WaveDevider";
import WeeklyCalendar from "../features/booking/pages/WeeklyCalendar";

export default function Booking(){
    return(
        <div className="mt-24 bg-white">
            <Header/>
            <WeeklyCalendar/>
        </div>
    )
}