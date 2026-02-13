/**
 * WeeklyCalendar (WeeklyTimeGrid)
 * --------------------------------
 * Heti naptár nézet pályafoglalásokhoz (9:00–20:00, hétfő–vasárnap).
 *
 * Fő funkciók:
 * - Pályák lekérése (courts) és kiválasztása (bookedCourt)
 * - Foglalások lekérése adott pályára + hétre (reservedDates)
 * - Saját foglalások elkülönítése és szerkesztése (ownReservations)
 * - Mentés (sync) a backend felé
 * - Admin jogosultság: ütközés (conflict) esetén foglalás törlés modalból
 * - Nyomtatás: összes pálya foglalásainak lekérése és PrintableSchedule render + window.print()
 *
 * Fontos megjegyzések / implicit szabályok:
 * - Múltbeli időpontra nem lehet foglalni
 * - A mai napra már nem lehet foglalni
 * - 18:00 után nem lehet a következő napra foglalni
 * - Limit: 1 nap max 2 óra foglalható (a kód számláló logikája alapján)
 * - Limit: 1 hét max 10 óra foglalható
 *
 * Használt kontextus:
 * - useAuth(): loggedIn, userId, role ("admin" esetén admin funkciók)
 *
 * Használt backend endpointok (API_BASE_URL):
 * - GET  /api/courts
 * - GET  /api/reservations/by-court-week?courtId=...&weekStart=YYYY-MM-DD
 * - POST /api/reservations/sync?courtIdFromQuery=...
 * - DELETE /api/reservations/delete-reservation
 *
 * Időkezelés:
 * - A cellák dátuma a hétfő (monday) alapján képződik.
 * - dayjs utc plugin be van húzva, de a cellDate -> utcISOString formázás itt inkább csak string formátum,
 *   nem explicit time-zone konverzió (nincs .utc()) – fontos lehet, ha backend UTC-t vár.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // (Link import itt jelenleg nincs használva)
import { useAuth } from "../AuthContext";
import Modal from "./Modal.js";
import PrintableSchedule from "./PrintableSchedule.js";
import { API_BASE_URL } from "../config";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router-dom";
import LoginRegist from "../pages/LoginRegist/LoginRegist.js";
import { tr } from "date-fns/locale"; // (import itt jelenleg nincs használva)
import sendEmail from "../sendEmail.js";
import "../styleComponents.css";
import AuthFrostLock from "./AuthLock.js";

dayjs.extend(utc);

/** Magyar napnevek a fejlécben */
const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

/** Órák listája (12 slot): 9..20 */
const hours = Array.from({ length: 12 }, (_, i) => i + 9);

function WeeklyCalendar() {
  // -------------------------
  // Állapotok (state-ek)
  // -------------------------

  /**
   * selectedCourts:
   * Nyomtatáshoz használt pályalista (print módban több pálya foglalásait tölti be).
   */
  const [selectedCourts, setSelectedCourts] = useState([]);

  /**
   * Admin törléshez:
   * - adminSelectedSlot: a kattintott időpont (Date)
   * - adminConflict: a foglalás adatai azon a sloton (userName, startTime, userId)
   * - adminModalVisible: admin törlés modal láthatósága
   */
  const [adminSelectedSlot, setAdminSelectedSlot] = useState(null);
  const [adminConflict, setAdminConflict] = useState(null);
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  /**
   * reservedDates:
   * Az aktuálisan kiválasztott pálya + hét összes foglalása (mindenkié).
   * Formátum (frontend): { startTime: Date, userId: ..., userName: ... }
   */
  const [reservedDates, setReservedDates] = useState([]);

  /**
   * ownReservations:
   * A bejelentkezett user adott héten a kiválasztott pályára felvett foglalásai (szerkeszthető).
   * Formátum (sync felé): { Court_id: bookedCourt, startTime: 'YYYY-MM-DDTHH:mm:ss' }
   */
  const [ownReservations, setOwnReservations] = useState([]);

  /** Nyomtatás megjelenítésének kapcsolója */
  const [showPrint, setShowPrint] = useState(false);

  /** Aktuálisan kiválasztott pálya ID */
  const [bookedCourt, setBookedCourt] = useState(null);

  /** Auth adatok */
  const { loggedIn, userId, role } = useAuth();

  /** Pályák listája a dropdownhoz */
  const [courts, setCourts] = useState([]);

  /** Hétléptetés: 0 = jelen hét, -1 = előző hét, +1 = következő hét, stb. */
  const [weekOffset, setWeekOffset] = useState(0);

  /** Token a szinkronhoz/törléshez (Authorization header) */
  const token = localStorage.getItem("token");

  /** Általános modal (információ/hiba) */
  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [errorModal, setErrorModal] = useState(false);

  /** Nem bejelentkezett felhasználónál foglalás trigger esetén login modal */
  const [reservationModal, setReservationModal] = useState(false); // (state létezik, de UI-ban most nem renderelsz külön modalt, csak overlayt)

  const navigate = useNavigate();

  let cellName = ""; // (változó jelenleg nincs használva)

  // -------------------------
  // Hét kezdete (Hétfő) és vége (Vasárnap)
  // -------------------------

  /**
   * monday:
   * A weekOffset alapján kiszámolt hétfő (00:00:00.000).
   * - JS Date getDay(): 0 = vasárnap ... 6 = szombat.
   * - diff számítás: adott hét hétfője.
   * - weekOffset * 7 nappal eltolva.
   */
  const monday = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const mon = new Date(now.setDate(diff));
    mon.setHours(0, 0, 0, 0);
    mon.setDate(mon.getDate() + weekOffset * 7);
    return mon;
  }, [weekOffset]);

  /** sunday: monday + 6 nap */
  const sunday = useMemo(() => {
    const s = new Date(monday);
    s.setDate(monday.getDate() + 6);
    return s;
  }, [monday]);

  // -------------------------
  // Segédfüggvények
  // -------------------------

  /** Date -> "YYYY.MM.DD" HU formázás */
  const formatDate = (date) =>
    date.toLocaleDateString("hu-HU", { year: "numeric", month: "2-digit", day: "2-digit" });

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

  // -------------------------
  // Backend kommunikáció
  // -------------------------

  /**
   * fetchCourts:
   * - Lekéri a pályák listáját
   * - Beállítja a dropdownot (courts)
   * - Default bookedCourt = első pálya id (data[0].id)
   */
  const fetchCourts = async () => {
    try {
      const url = `${API_BASE_URL}/api/courts`;
      console.log("?? Fetch URL:", url);

      const response = await fetch(`${API_BASE_URL}/api/courts`);
      if (!response.ok) throw new Error("Hiba a pályák lekérésekor");

      const data = await response.json();
      setCourts(data);
      setBookedCourt(data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  /** Pályák betöltése egyszer (mount) */
  useEffect(() => {
    fetchCourts();
  }, []);

  

  /**
   * syncReservations:
   * Saját foglalások felküldése (POST) /api/reservations/sync endpointon.
   *
   * Speciális ág: ha reservations üres, akkor beleraksz egy { monday } objektumot.
   * Valószínű: backendnek kell tudnia melyik hétre vonatkozik a sync.
   *
   * Siker:
   * - modal: "Változtatások sikeresen mentve!"
   * - fetchReservations újratölti a hetet
   *
   * Hiba:
   * - modal: backend result.message vagy fallback üzenet
   */
  const syncReservations = async (reservations) => {
    console.log("ezeket kuldi a backendre: ", reservations);

    if (reservations.length === 0) {
      reservations.push({ monday: monday });
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
        setErrorModal(false)
        setModalMessage("Változtatások sikeresen mentve!");
        await fetchReservations();
      } else {
        console.error("Hiba a szinkronizáláskor:", result);
        setModal(true);
        setErrorModal(true)
        setModalMessage(result.message || "Hiba történt a szinkronizálás során.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setModal(true);
      setErrorModal(true)
      setModalMessage("Hálózati hiba vagy szerverhiba.");
    }

    // Dupla fetch: a fenti ágakban már hívsz fetchReservations()-t,
    // itt a végén még egyszer meghívod.
    fetchReservations();
  };

  /**
   * pasteOwnReservations:
   * A backend által visszaadott saját foglalások (Date) -> sync formátum (string)
   * - Court_id: bookedCourt
   * - startTime: 'YYYY-MM-DDTHH:mm:ss'
   */
  const pasteOwnReservations = (reservations) => {
    const converted = reservations.map((res) => ({
      Court_id: bookedCourt,
      startTime: dayjs(res.startTime).format("YYYY-MM-DDTHH:mm:ss"),
    }));

    setOwnReservations(converted);
  };

  /**
   * fetchReservations:
   * Lekéri a kiválasztott pálya (bookedCourt) foglalásait az adott hétfő (weekStart) alapján.
   * A backend r.booked_time mezőből Date-et csinál.
   * A userName fallback: "Ismeretlen".
   *
   * Ezután:
   * - reservedDates = minden foglalás (minden user)
   * - own = szűrés userId alapján -> pasteOwnReservations(own)
   */
  const fetchReservations = async () => {
    const weekStart = dayjs(monday).format("YYYY-MM-DD");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/reservations/by-court-week?courtId=${bookedCourt}&weekStart=${weekStart}`
      );
      if (!res.ok) throw new Error("Foglalások lekérése sikertelen");

      const data = await res.json();
      console.log("data: " + JSON.stringify(data));

      const formatted = data.map((r) => ({
        startTime: new Date(r.booked_time),
        userId: r.user_id,
        userName: r.username || "Ismeretlen",
      }));

      console.log("fetchelt: ", formatted);

      setReservedDates(formatted);

      const own = formatted.filter((r) => Number(r.userId) === Number(userId));
      pasteOwnReservations(own);
    } catch (err) {
      console.error(err);
      setModal(true);
      setErrorModal(true)
      setModalMessage("Hiba történt a foglalások lekérésekor.");
    }
  };

  /**
   * fetchAllReservationsForPrint:
   * Nyomtatáskor minden pályára lekéri az adott heti foglalásokat (Promise.all).
   * A reservedDates-et "flattenelt" listára állítja, és selectedCourts = courts.
   */
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

    console.log(results.flat());
    setReservedDates(results.flat());
    setSelectedCourts(courts);
  };

  /**
   * Foglalások újratöltése, ha:
   * - bookedCourt változik
   * - weekOffset (=> monday) változik
   * - userId változik
   */
  useEffect(() => {
    if (!bookedCourt || !userId) return;
    fetchReservations();
  }, [bookedCourt, weekOffset, userId]);

  /** Debug log */
  useEffect(() => {
    console.log("Ownreservations: ", ownReservations);
    console.log("reservedDates: ", reservedDates);
  }, [ownReservations, reservedDates]);

  // -------------------------
  // UI eseménykezelők
  // -------------------------

  /** Pálya váltás dropdown */
  const handleChangeCourt = (e) => {
    e.preventDefault();
    setBookedCourt(e.target.value);
  };

  /**
   * Nyomtatás:
   * - Lekéri az összes pályára a heti foglalásokat
   * - showPrint=true => PrintableSchedule renderelődik
   * - rövid timeout után window.print()
   * - print után visszatölti az aktuális pálya foglalásait (fetchReservations)
   */
  const handlePrint = async () => {
    await fetchAllReservationsForPrint();
    setShowPrint(true);

    setTimeout(() => {
      window.print();
      fetchReservations();
    }, 100);
  };

  const handleGuestBooking = () => {
    console.log("bejelentkezett"); // (jelenleg nem használt)
  };

  /**
   * Mentés (Save):
   * - ha loggedIn:
   *    - ha nincs ownReservations: modal "Erre a pályára és hétre nincs foglalása"
   *    - sendEmail(userId, ownReservations)
   *    - syncReservations(ownReservations)
   * - ha nincs login: reservationModal = true (de UI-ban most overlayvel takarsz)
   */
  const handleSubmit = async () => {
    if (loggedIn) {
      if (ownReservations.lengt===0) {
        setModal(true);
        setModalMessage("Erre a pályára és hétre nincs foglalása");
        await syncReservations(ownReservations);
      }
      sendEmail(userId, ownReservations);
      await syncReservations(ownReservations);
    } else setReservationModal(true);
  };

  /** Login gomb callback (ha lenne login modal) */
  const handleLoginButton = () => {
    setReservationModal(false);
    navigate("/bejelentkezes");
  };

  /**
   * Cellakattintás:
   * - cellDate létrehozása monday + dayIndex + hour alapján
   * - validációk:
   *    - múltbeli időpont tiltás
   *    - mai nap tiltás
   *    - holnapra 18 óra után tiltás
   *    - max/nap = 2 óra; max/hét = 10 óra (saját foglalások alapján)
   * - admin eset:
   *    - ha a cellDate ütközik meglévő reservedDates-szel => adminModalVisible + conflict adatok
   * - user eset:
   *    - ha saját foglalásra kattint => törli ownReservations-ből és reservedDates-ből az adott slotot
   *    - különben hozzáadja/eltávolítja toggle módon ownReservations-ből
   */
  const handleClick = (dayIndex, hour) => {
    // Cellához tartozó dátum
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + dayIndex);
    cellDate.setHours(hour, 0, 0, 0);

    // A cellDate stringgé alakítása (backend szinkronhoz)
    const utcISOString = dayjs(cellDate).format("YYYY-MM-DDTHH:mm:ss");

    const today = new Date();

    const isSameDay = (day1, day2) => {
      return (
        day1.getFullYear() === day2.getFullYear() &&
        day1.getMonth() === day2.getMonth() &&
        day1.getDate() === day2.getDate()
      );
    };

    /**Szabad a hely? */
    let freeToBook = true;
    reservedDates.forEach(date => {
     
      const resDate = new Date(date.startTime)
       console.log(resDate + " es a masik " + cellDate)
      if(resDate.getTime() == cellDate.getTime()){
        freeToBook = false;
        console.log("mar nem szabad")
      }
    });

    /** ha szabad */
    if(freeToBook){
      // 1) múlt tiltás
      if (cellDate < today) {
        setModal(true);
        setErrorModal(true)
        setModalMessage("Múltbeli időpontokra nem lehet foglalni");
        return;
      }

      // 2) mai nap tiltás
      if (isSameDay(today, cellDate)) {
        setModal(true);
        setErrorModal(true)
        setModalMessage("A mai napra már nem lehet foglalani");
        return;
      }

       // 3) holnap 18 után tiltás
        let tomorrow = today;
        tomorrow = new Date(tomorrow.setDate(tomorrow.getDate() + 1));
        if (isSameDay(tomorrow, cellDate) && today.getHours() > 18) {
          setModal(true);
          setErrorModal(true)
          setModalMessage("18 óra után már nem lehet a következő napra foglalni");
          return;
        }
        // 4) napi/heti limit számolás (saját foglalások alapján)
      let maxReservationInaWeek = 0;
      let maxReservationInaDay = 0;

      for (let i = 0; i < ownReservations.length; i++) {
        const resDate = new Date(ownReservations[i].startTime);

        if (
          isSameDay(cellDate, new Date(ownReservations[i].startTime)) &&
          cellDate.getTime() !== resDate.getTime()
        )
          maxReservationInaDay++;

        if (monday < cellDate && cellDate < sunday && cellDate.getTime() !== resDate.getTime())
          maxReservationInaWeek++;

        if (maxReservationInaDay >= 2) {
          setModal(true);
        setErrorModal(true)
          setModalMessage("Egy nap maximum két óra foglalható");
          maxReservationInaDay--;
          return;
        }
        if (maxReservationInaWeek >= 10) {
          setModal(true);
          setErrorModal(true)
          setModalMessage("Egy héten maximum 10 óra foglalható");
          maxReservationInaDay--;
          return;
        }
      }
    }
    else{ /**Ha nem szabad -> Valakié */

       // ADMIN: ütközés esetén törlési modal
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

      // Normál user: saját foglalás-e?
      const isOwnReserved = ownReservations.some((r) => {
        const rDate = new Date(r.startTime);
        return rDate.getTime() === cellDate.getTime();
      });

      console.log("own? : " + isOwnReserved)
      // Ha saját foglalásra kattint -> törlés ownReservations + reservedDates listából
      if (isOwnReserved) {
        console.log("sajat reservatiionre nyomtál");

        setOwnReservations((prev) =>
          prev.filter((r) => new Date(r.startTime).getTime() !== cellDate.getTime())
        );

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
      else{
        setModal(true);
        setErrorModal(true)
        setModalMessage("Ezt már valaki lefoglalta");
        return;
      }
    }

    

   

    // Egyébként toggle: hozzáadás / eltávolítás ownReservations-ben
    setOwnReservations((prev) => {
      const exists = prev.some((r) => r.startTime === utcISOString);
      if (exists) {
        return prev.filter((r) => r.startTime !== utcISOString);
      } else {
        return [...prev, { Court_id: bookedCourt, startTime: utcISOString }];
      }
    });
  };

  // -------------------------
  // Render
  // -------------------------

  return (
  <div className="relative">

    <AuthFrostLock loggedIn={loggedIn}>


      {/* ADMIN MODAL – más foglalás törlése */}
      {adminModalVisible && adminSelectedSlot && adminConflict && (
        <Modal>
          <h2 className="mb-4 text-xl font-bold">Foglalás törlése</h2>

          <p className="mb-2">
            <strong>{adminConflict.userName}</strong> foglalt erre az időpontra:
          </p>

          <p className="mb-4">
            {new Date(adminConflict.startTime).toLocaleString("hu-HU")}
          </p>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 font-semibold rounded-lg bg-yellow"
              onClick={async () => {
                // időzóna miatti korrekció
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
                });

                setModal(true);
                setModalMessage("Foglalás törölve.");
                setAdminModalVisible(false);

                // frissítjük a heti foglalásokat
                fetchReservations();
              }}
            >
              Foglalás törlése
            </button>

            <button
              className="px-4 py-2 bg-gray-200 rounded-lg"
              onClick={() => setAdminModalVisible(false)}
            >
              Mégse
            </button>
          </div>
        </Modal>
      )}

      {/* Általános információs / hiba modal */}
      {modal && (
        <Modal closeModal={() => setModal(false)}>
          { errorModal&&<h4 className="title-base">Hiba</h4>}
          <p className={errorModal?'desc-base':'title-base'}>{modalMessage}</p>
          <button
            className="btn-primary"
            onClick={() => setModal(false)}
          >
            Rendben
          </button>
        </Modal>
      )}

      {/* NAVIGÁCIÓ – hétváltás, pályaválasztás, mentés */}
      <div
        className="
          flex flex-col md:flex-row justify-between items-center gap-3
          p-4 max-w-[960px] mx-auto my-5
          bg-white border border-border rounded-card shadow-soft
        "
      >
        <div className="flex flex-wrap items-center gap-2">
          <strong>Heti nézet:</strong>
          <span>
            {formatDate(monday)} – {formatDate(sunday)}
          </span>

          {/* Előző / következő hét */}
          <button
            className="px-3 py-1 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
            onClick={() => setWeekOffset(w => w - 1)}
          >
            Előző hét
          </button>

          <button
            className="px-3 py-1 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
            onClick={() => setWeekOffset(w => w + 1)}
          >
            Következő hét
          </button>
        </div>

        {/* Pályaválasztó */}
        <select
          className="px-3 py-2 font-medium border rounded-lg border-border"
          onChange={handleChangeCourt}
          value={bookedCourt || ""}
        >
          {courts.map(court => (
            <option key={court.id} value={court.id}>
              {court.name}
            </option>
          ))}
        </select>

        {/* Nyomtatás + mentés */}
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
            onClick={handlePrint}
          >
            Nyomtatás
          </button>

          <button
            className="px-4 py-2 font-semibold rounded-lg bg-yellow"
            onClick={handleSubmit}
          >
            Mentés
          </button>
        </div>
      </div>

      {/* NAPTÁR KONTAINER */}
      <div
        className="
          w-full max-w-[960px] mx-auto
          bg-white border border-border
          rounded-card overflow-hidden shadow-soft
        "
      >
        {/* FEJLÉC – napok */}
        <div
          className="
            grid grid-cols-[80px_repeat(7,1fr)]
            bg-primaryLight font-semibold text-center text-sm
            border-b border-border
          "
        >
          <div></div>
          {days.map(day => (
            <div key={day} className="py-3">
              {day}
            </div>
          ))}
        </div>

        {/* IDŐSOROK */}
        {hours.map(hour => (
          <div
            key={hour}
            className="grid grid-cols-[80px_repeat(7,1fr)] text-sm"
          >
            {/* Óra címke */}
            <div className="py-2 text-center border-r bg-primaryLight border-border">
              {hour}:00
            </div>

            {/* Nap cellák */}
            {days.map((_, dayIndex) => {
              // cella dátum kiszámítása
              const cellDate = new Date(monday);
              cellDate.setDate(monday.getDate() + dayIndex);
              cellDate.setHours(hour, 0, 0, 0);

              // saját foglalás?
              const isOwn = ownReservations.some(r =>
                isSameHour(new Date(r.startTime), cellDate)
              );

              // más foglalása?
              const isOther = reservedDates.some(
                r =>
                  isSameHour(new Date(r.startTime), cellDate) &&
                  r.userId !== userId
              );

              // alap cella stílus
              let cellClass =
                "h-12 m-0.5 rounded-md border border-gray-200 cursor-pointer transition";

              // állapotok
              if (isOwn) {
                cellClass += " bg-yellow";
              } else if (isOther && role) {
                // admin látja, kattinthat
                cellClass += " bg-lightBlue";
              } else if (isOther) {
                // user nem kattinthat
                cellClass += " bg-lightBlue pointer-events-none cursor-not-allowed";
              } else {
                cellClass += " hover:bg-yellow";
              }

              return (
                <div
                  key={`${dayIndex}-${hour}`}
                  className={cellClass}
                  onClick={() => handleClick(dayIndex, hour)}
                />
              );
            })}
          </div>
        ))}
      </div>
            
    </AuthFrostLock>
  </div>
);

}

export default WeeklyCalendar;
