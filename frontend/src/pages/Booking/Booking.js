import Header from "../../components/Header";
import WaveDivider from "../../components/WaveDevider";
import WeeklyTimeGrid from "../../components/WeeklyTimeGrid";
import './Booking.css'

export default function Booking(){
    return(
        <div className="booking">
            <Header/>
            <WeeklyTimeGrid/>
            <WaveDivider/>
        </div>
    )
}