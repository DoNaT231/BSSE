import React, { useEffect, useMemo, useState } from "react";
import "./WeeklyTimeGrid.css";
import { Link,  } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Modal from "./Modal.js";
import PrintableSchedule from "./PrintableSchedule.js";
import { API_BASE_URL } from "../config";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import { useNavigate } from 'react-router-dom';
import LoginRegist from "../pages/LoginRegist/LoginRegist.js";
import { tr } from "date-fns/locale";
import sendEmail from "../sendEmail.js";
dayjs.extend(utc)
const days = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap",
];
const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 20:00

function WeeklyCalendar() {
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [adminSelectedSlot, setAdminSelectedSlot] = useState(null);
  const [adminConflict, setAdminConflict] = useState(null);
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [reservedDates, setReservedDates] = useState([]); //osszes reservation
  const [ownReservations, setOwnReservations] = useState([]);// felhasznalo reservtationjei
  
  const [showPrint, setShowPrint] = useState(false);
  const [bookedCourt, setBookedCourt] = useState(null);
  const { loggedIn, userId, role } = useAuth();
  const [courts, setCourts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const token = localStorage.getItem("token");
  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); 
  const [reservationModal, setReservationModal] = useState(false)
  const navigate = useNavigate();

  // ✅ Hétfő és vasárnap számítása weekOffset alapján
  const monday = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0 = vasárnap, 1 = hétfő
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const s = new Date(monday);
    s.setDate(monday.getDate() + 6);
    return s;
  }, [monday]);

  // ✅ Segédfüggvények
  const formatDate = (date) =>
    date.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const isSameHour = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate() &&
    d1.getHours() === d2.getHours();

  const fetchCourts = async () => {
    try {
      const url = `${API_BASE_URL}/api/courts`;
      console.log('?? Fetch URL:', url);
      const response = await fetch(`${API_BASE_URL}/api/courts`);
      if (!response.ok) throw new Error("Hiba a pályák lekérésekor");
      const data = await response.json();
      setCourts(data);
      setBookedCourt(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const syncReservations = async (reservations) => {
    console.log("ezeket kuldi a backendre: ", reservations)
    if(reservations.length === 0){
      reservations.push({
        monday: monday
      })
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reservations/sync?courtIdFromQuery=${bookedCourt}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reservations),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setModal(true);
        setModalMessage("Változtatások sikeresen mentve!");
        await fetchReservations();
      } else {
        console.error("Hiba a szinkronizáláskor:", result);
        setModal(true);
        setModalMessage(result.message || "Hiba történt a szinkronizálás során.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setModal(true);
      setModalMessage("Hálózati hiba vagy szerverhiba.");
    }
    fetchReservations()
  };

  const pasteOwnReservations = (reservations) => {
    const converted = reservations.map((res) => ({
      Court_id: bookedCourt,
      startTime: dayjs(res.startTime).format('YYYY-MM-DDTHH:mm:ss'),
    }));

    setOwnReservations(converted);
  };

const subtactTwoHours = (date) =>{
    const original = new Date(date);
    const adjusted = new Date(original.getTime() - 2 * 60 * 60 * 1000);
    return adjusted
  }
  const fetchReservations = async () => {
    const weekStart = dayjs(monday).format("YYYY-MM-DD");//ezt itt megvaltoztattam
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservations/by-court-week?courtId=${bookedCourt}&weekStart=${weekStart}`
      );
      if (!res.ok) throw new Error("Foglalások lekérése sikertelen");

      const data = await res.json();
console.log("data: " + JSON.stringify(data))
      const formatted = data.map((r) => ({
        startTime: new Date(r.booked_time),
        userId: r.user_id,
        userName: r.username || "Ismeretlen",
      }));
      console.log("fetchelt: ",formatted)
      
      setReservedDates(formatted);
      const own = formatted.filter((r) => Number(r.userId) === Number(userId));
      pasteOwnReservations(own);
    } catch (err) {
      console.error(err);
      setModal(true);
      setModalMessage("Hiba történt a foglalások lekérésekor.");
    }
  };

  const fetchAllReservationsForPrint = async () => {
    const weekStart = monday.toISOString().split("T")[0];
    const results = await Promise.all(
      courts.map(async (court) => {
        const res = await fetch(
          `${API_BASE_URL}/api/reservations/by-court-week?courtId=${court.id}&weekStart=${weekStart}`
        );
        const data = await res.json();
        return data.map((r) => ({
          courtId: court.id,
          courtName: court.name,
          ...r,
        }));
      })
    );
    console.log(results.flat())
    setReservedDates(results.flat());
    setSelectedCourts(courts);
  };

  useEffect(() => { 
    if (!bookedCourt || !userId) return;
    fetchReservations();
  }, [bookedCourt, weekOffset, userId]);

  useEffect(()=>{
    console.log("Ownreservations: ", ownReservations)
    console.log("reservedDates: ", reservedDates)
  }, [ownReservations, reservedDates])

  const handleChangeCourt = (e) => {
    e.preventDefault();
    setBookedCourt(e.target.value);
  };

  const handlePrint = async () => {
    await fetchAllReservationsForPrint(); // ez frissíti a reservedDates-et (de async!)

    // Várj, amíg a state frissül és a komponens renderel
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      fetchReservations()
    }, 100);
  };

  const handleGuestBooking = () =>{
    console.log("bejelentkezett")
  }

  const handleSubmit = async () => {
    if(loggedIn){
      if (!ownReservations.length) {
        setModal(true);
        setModalMessage("Erre a pályára és hétre nincs foglalása");
        await syncReservations(ownReservations);
      }
      sendEmail(userId, ownReservations)
      await syncReservations(ownReservations);
    }
    else setReservationModal(true)
  };

  const handleLoginButton = () =>{
    setReservationModal(false)
    navigate('/bejelentkezes')
  }

  const handleClick = (dayIndex, hour) => {

    //     Atkonvertalja a kalendarium cellait UTC-re
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + dayIndex);
    cellDate.setHours(hour, 0, 0, 0);
    const utcISOString = dayjs(cellDate).format('YYYY-MM-DDTHH:mm:ss');
    const today = new Date()

    const isSameDay = (day1, day2) =>{
      return(
        day1.getFullYear() === day2.getFullYear() &&
        day1.getMonth() === day2.getMonth() &&
        day1.getDate() === day2.getDate()
      )
    }

    //multba ne lehessen foglalni
    if(cellDate<today){
      setModal(true)
      setModalMessage("Múltbeli időpontokra nem lehet foglalni")
      return
    }

    //ugyanazon a napon van?
    if(isSameDay(today, cellDate)){
      setModal(true)
      setModalMessage("A mai napra már nem lehet foglalani")
      return
    }

    //18 után nem lehet foglalni
    let tomorrow = today;
    tomorrow = new Date(tomorrow.setDate(tomorrow.getDate()+1))
    if(isSameDay(tomorrow, cellDate) && today.getHours()>18){
      setModal(true)
      setModalMessage("18 óra után már nem lehet a következő napra foglalni")
      return
    }

    //kiszamolja a heti es napi maxot
    let maxReservationInaWeek = 0
    let maxReservationInaDay = 0;
    
    for(let i = 0; i<ownReservations.length; i++){
      const resDate = new Date(ownReservations[i].startTime)
      if(isSameDay(cellDate, new Date(ownReservations[i].startTime)) &&
       cellDate.getTime()!==resDate.getTime()) maxReservationInaDay++

      if(monday<cellDate && cellDate<sunday && cellDate.getTime()!==resDate.getTime()) maxReservationInaWeek++

      
      if(maxReservationInaDay>=2){
        setModal(true)
        setModalMessage("egy nap maximum két óra foglalható")
        maxReservationInaDay--
        return
      }
      if(maxReservationInaWeek>=10){
        setModal(true)
        setModalMessage("egy héten maximum 10 óra foglalható")
        maxReservationInaDay--
        return
      }
    }


    if (role === "admin") {
      const conflict = reservedDates.find(
        (r) => new Date(r.startTime).getTime() === cellDate.getTime()
      );
      if (conflict) {
        setAdminSelectedSlot(cellDate);
        setAdminConflict(conflict);
        setAdminModalVisible(true);
      }
      return;
    }
    

    //eldonti hogy a saját foglalásod e
    const isOwnReserved = ownReservations.some((r) => { 
      const rDate = new Date(r.startTime);
      return rDate.getTime() === cellDate.getTime();
    });

    // ez az egész annyi hogy törlni az összes felhasználó és a saját reservationjeibol az idopontot ha rakattitasz a sajat foglalasodra
    if (isOwnReserved) {
      console.log("sajat reservatiionre nyomtál")
      setOwnReservations((prev) =>
        prev.filter((r) => new Date(r.startTime).getTime() !== cellDate.getTime())
      );
      console.log("resown: ", ownReservations)
      setReservedDates((prev) =>
        prev.filter(
          (r) =>
            !(
              new Date(r.startTime).getTime() === cellDate.getTime() &&
              Number(r.userId) === Number(userId)
            )
        )
      );
      return;
    }
 //
    
    setOwnReservations((prev) => {
      const exists = prev.some((r) => r.startTime === utcISOString);
      if (exists) {
        return prev.filter((r) => r.startTime !== utcISOString);
      } else {
        return [...prev, { Court_id: bookedCourt, startTime: utcISOString }];
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      {!userId && 
          <div className="overlay">
            <LoginRegist/>
          </div>
        }
      <div className={userId? "" : "blurred"}>

        {adminModalVisible && adminSelectedSlot && adminConflict && (
          <Modal>
            <h2>Foglalás törlése</h2>
            <p>
              <strong>{adminConflict.userName}</strong> foglalt erre az időpontra:
            </p>
            <p>{new Date(adminConflict.startTime).toLocaleString("hu-HU")}</p>
            <button
              onClick={async () => {
                const correctedStartTime = new Date(adminConflict.startTime);
                correctedStartTime.setHours(correctedStartTime.getHours() + 2);
                await fetch(`${API_BASE_URL}/api/reservations/delete-reservation`, {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    court_id: bookedCourt,
                    startTime: correctedStartTime.toISOString(),
                  }),
                })
                .then(res => {
                  if (!res.ok) throw new Error('Törlési hiba');
                  setModal(true)
                  setModalMessage("Hiba: ", res)
                  return res.json();
                })
                .then(data => console.log(data))
                .catch(err => console.error('Frontend fetch error:', err));
                setModal(true);
                setModalMessage("Foglalás törölve.");
                setAdminModalVisible(false);
                await fetchReservations();
              }}
            >
              Foglalás törlése
            </button>
            <button onClick={() => setAdminModalVisible(false)}>Mégse</button>
          </Modal>
        )}

        {modal && (
          <Modal>
            <p>{modalMessage}</p>
            <button onClick={() => setModal(false)}>Rendben</button>
          </Modal>
        )}


        
          <div className="navigation">
            <div className="navigation-button-container">
              <button onClick={() => setWeekOffset((w) => w - 1)}>Előző hét</button>
              <strong>Heti nézet:</strong> {formatDate(monday)} – {formatDate(sunday)}
              <button onClick={() => setWeekOffset((w) => w + 1)}>Következő hét</button>
            </div>

            <div className="navigation-court-select">
              <select
                name="Id"
                id="court"
                onChange={handleChangeCourt}
                value={bookedCourt || ""}
              >
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handlePrint}>Nyomtatás</button>
            {showPrint && reservedDates.length > 0 && (
              <div id="print-root">
                <PrintableSchedule
                  reservations={reservedDates}
                  courts={selectedCourts}
                  weekStart={monday}
                />
              </div>
            )}
            <button onClick={handleSubmit} className="save-btn">
              Mentés
            </button>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <div className="time-label"></div>
              {days.map((day, index) => (
                <div key={index} className="day-header">
                  {day}
                </div>
              ))}
            </div>

            <div className="calendar-grid">
              {hours.map((hour) => (
                <div key={hour} className="hour-row">
                  <div className="time-label">{hour}:00</div>

                  {days.map((_, dayIndex) => {
                    const cellDate = new Date(monday);
                    cellDate.setDate(monday.getDate() + dayIndex);
                    cellDate.setHours(hour, 0, 0, 0);

                    // Foglalás állapotvizsgálatok

                    // Saját foglalás e
                    const isOwn = ownReservations.some((r) => 
                      isSameHour(new Date(r.startTime), cellDate)
                    );
                    // Más foglalása e
                    const isOther = reservedDates.some(
                      (r) =>
                        isSameHour(new Date(r.startTime), cellDate) &&
                        r.userId !== userId
                    );

                    let classNames = "calendar-cell";
                    if (isOwn) {
                      classNames += " owned";
                    } else if (isOther && role) {
                      classNames += " reserved-admin";
                    } else if (isOther) {
                      classNames += " reserved";
                    }

                    const tooltip =
                      role && isOther
                        ? (() => {
                            const match = reservedDates.find((r) =>
                              isSameHour(new Date(r.startTime), cellDate)
                            );
                            return match
                              ? `${match.userName} - ${cellDate.toLocaleString("hu-HU")}`
                              : "";
                          })()
                        : "";

                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className={classNames}
                        onClick={() => handleClick(dayIndex, hour)}
                        title={tooltip}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

export default WeeklyCalendar;
