import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useAuth } from "../../../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import AuthFrostLock from "../../../components/AuthLock.js";

import fetchCourts from "../api/CourtsApi.js";
import { getWeekReservationsSafe, syncReservationsSafe } from "../services/reservations.service.js";
import { diffReservations } from "../utils/reservationDiff.js";

import ReservationHeader from "../components/ReservationHeader.jsx";
import ReservationCalendarGrid from "../components/ReservationCalendarGrid.jsx";

dayjs.extend(utc);

const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const hours = Array.from({ length: 12 }, (_, i) => i + 9);

function WeeklyCalendar() {
  const { loggedIn, role } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [courts, setCourts] = useState([]);
  const [bookedCourt, setBookedCourt] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // reservedDates: CSAK MÁSOK foglalásai (UI-hoz)
  // [{ startTime: Date, isMine:false, courtId }]
  const [reservedDates, setReservedDates] = useState([]);

  // ownReservations: sync payload (aktuális szerkesztett)
  // [{ Court_id, startTime: 'YYYY-MM-DDTHH:mm:ss' }]
  const [ownReservations, setOwnReservations] = useState([]);

  // snapshot: betöltéskori saját foglalások (sync payload formátum)
  const [originalOwnReservations, setOriginalOwnReservations] = useState([]);

  // modal
  const [modal, setModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [errorModal, setErrorModal] = useState(false);

  // admin conflict modal (itt csak minimál)
  const [adminSelectedSlot, setAdminSelectedSlot] = useState(null);
  const [adminModalVisible, setAdminModalVisible] = useState(false);

  const monday = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
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

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const toSyncPayloadFromDates = (dateReservations) =>
    (dateReservations || []).map((r) => ({
      Court_id: Number(bookedCourt),
      startTime: dayjs(r.startTime).format("YYYY-MM-DDTHH:mm:ss"),
    }));

  async function loadCourts() {
    try {
      const data = await fetchCourts();
      setCourts(data);
      if (data?.length) setBookedCourt(Number(data[0].id));
    } catch (err) {
      setModal(true);
      setErrorModal(true);
      setModalMessage("Hiba történt a pályák lekérésekor.");
    }
  }

  async function loadReservations() {
    if (!bookedCourt) return;

    const res = await getWeekReservationsSafe({
      monday,
      courtId: Number(bookedCourt),
      token,
    });

    if (!res.ok) {
      setModal(true);
      setErrorModal(true);
      setModalMessage(res.message);
      return;
    }

    // data: [{startTime: Date, isMine, courtId}]
    const others = res.data.filter((r) => !r.isMine);
    const ownDates = res.data.filter((r) => r.isMine);

    setReservedDates(others);

    const ownSync = toSyncPayloadFromDates(ownDates);
    setOwnReservations(ownSync);
    setOriginalOwnReservations(ownSync);
  }

  useEffect(() => {
    loadCourts();
  }, []);

  useEffect(() => {
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookedCourt, weekOffset]); // userId nem kell többé az isMine miatt

  const handleChangeCourt = (e) => {
    e.preventDefault();
    setBookedCourt(Number(e.target.value));
  };

  const prettySlot = (t) => dayjs(t).format("YYYY.MM.DD. HH:mm");

  const handleSubmit = async () => {
    if (!loggedIn) {
      navigate("/bejelentkezes");
      return;
    }

    const { added, removed, changed } = diffReservations(originalOwnReservations, ownReservations);

    if (!changed) {
      setModal(true);
      setErrorModal(false);
      setModalMessage("Nem változtatott semmit.");
      return;
    }

    // Összefoglaló modal (szöveges)
    const lines = [];
    lines.push(`Változások ezen a héten:`);
    if (added.length) {
      lines.push(`\nHozzáadva (${added.length}):`);
      added.forEach((t) => lines.push(`- ${prettySlot(t)}`));
    }
    if (removed.length) {
      lines.push(`\nTörölve (${removed.length}):`);
      removed.forEach((t) => lines.push(`- ${prettySlot(t)}`));
    }

    setModal(true);
    setErrorModal(false);
    setModalMessage(lines.join("\n"));

    // Mentés
    const saveRes = await syncReservationsSafe({
      monday,
      courtId: Number(bookedCourt),
      token,
      reservations: ownReservations,
    });

    if (!saveRes.ok) {
      setModal(true);
      setErrorModal(true);
      setModalMessage(saveRes.message);
      return;
    }

    // siker: snapshot frissít + újratölt
    setOriginalOwnReservations(ownReservations);
    await loadReservations();
  };

  const handleClick = (dayIndex, hour) => {
    if (!bookedCourt) return;

    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + dayIndex);
    cellDate.setHours(hour, 0, 0, 0);

    const today = new Date();
    const tomorrow = new Date(new Date().setDate(today.getDate() + 1));

    const cellKey = dayjs(cellDate).format("YYYY-MM-DDTHH:mm:ss");

    // 1) foglalt-e más által?
    const occupiedByOthers = reservedDates.some(
      (r) => new Date(r.startTime).getTime() === cellDate.getTime()
    );

    if (occupiedByOthers) {
      if (role === "admin") {
        setAdminSelectedSlot(cellDate);
        setAdminModalVisible(true);
        return;
      }
      setModal(true);
      setErrorModal(true);
      setModalMessage("Ezt már valaki lefoglalta.");
      return;
    }

    // 2) idő szabályok (csak ha “foglalni” akarunk)
    // ha már benne van a saját listában, akkor ez egy törlés toggle -> engedjük
    const alreadySelected = ownReservations.some((r) => r.startTime === cellKey);

    if (!alreadySelected) {
      if (cellDate < today) {
        setModal(true);
        setErrorModal(true);
        setModalMessage("Múltbeli időpontokra nem lehet foglalni.");
        return;
      }

      if (isSameDay(today, cellDate)) {
        setModal(true);
        setErrorModal(true);
        setModalMessage("A mai napra már nem lehet foglalni.");
        return;
      }

      if (isSameDay(tomorrow, cellDate) && today.getHours() >= 18) {
        setModal(true);
        setErrorModal(true);
        setModalMessage("18 óra után már nem lehet a következő napra foglalni.");
        return;
      }

      // 3) napi/heti limit (a saját listából)
      const ownDates = ownReservations.map((r) => new Date(r.startTime));

      const dayCount = ownDates.filter((d) => isSameDay(d, cellDate)).length;
      if (dayCount >= 2) {
        setModal(true);
        setErrorModal(true);
        setModalMessage("Egy nap maximum két óra foglalható.");
        return;
      }

      const weekCount = ownDates.filter((d) => d >= monday && d <= sunday).length;
      if (weekCount >= 10) {
        setModal(true);
        setErrorModal(true);
        setModalMessage("Egy héten maximum 10 óra foglalható.");
        return;
      }
    }

    // 4) toggle
    setOwnReservations((prev) => {
      const exists = prev.some((r) => r.startTime === cellKey);
      if (exists) return prev.filter((r) => r.startTime !== cellKey);
      return [...prev, { Court_id: Number(bookedCourt), startTime: cellKey }];
    });
  };

  return (
    <>
    <AuthFrostLock
              loggedIn={loggedIn}
        >
      <ReservationHeader
        monday={monday}
        sunday={sunday}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        courts={courts}
        bookedCourt={bookedCourt}
        handleChangeCourt={handleChangeCourt}
        handlePrint={() => {
          setModal(true);
          setErrorModal(true);
          setModalMessage("A nyomtatás részt külön szedjük (print service + endpoint).");
        }}
        handleSubmit={handleSubmit}
        // ha akarsz: pass isDirty is, és disable a save gomb
      />

      <ReservationCalendarGrid
        days={days}
        hours={hours}
        monday={monday}
        ownReservations={ownReservations}
        reservedDates={reservedDates}
        role={role}
        handleClick={handleClick}
      />

      {/* Modal komponensedet nem látom, ezért csak jelzem:
          - modalMessage-ben \n van, ha a Modal nem tördel, akkor <pre>-t vagy replace-et használj. */}
      {modal && (
        <div>
          {/* ha van saját Modal komponensed, ide tedd vissza */}
          {/* <Modal .../> */}
        </div>
      )}

      {adminModalVisible && (
        <div>
          {/* ide jön az admin delete / manage modal */}
          {/* adminSelectedSlot: Date */}
        </div>
      )}
      </AuthFrostLock>
    </>
  );
}

export default WeeklyCalendar;