import Header from "../components/Header";
import WaveDivider from "../components/WaveDevider";
import WeeklyTimeGrid from "../components/WeeklyTimeGrid";

export default function Booking(){
    return(
        <div className="mt-32 bg-white">
            <Header/>
            <WeeklyTimeGrid/>
        </div>
    )
}