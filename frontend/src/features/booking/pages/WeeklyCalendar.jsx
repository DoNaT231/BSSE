import React, { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import AuthFrostLock from "../../../components/AuthLock.js";

import { DAYS, HOURS } from "../constants/reservation.constants.js";
import useWeeklyCalendar from "../hooks/useWeeklyCalendar.js";

import ReservationHeader from "../components/ReservationHeader.jsx";
import ReservationCalendarGrid from "../components/ReservationCalendarGrid.jsx";
import ReservationChangeConfirmModal from "../components/ReservationChangeConfirmModal.jsx";
import ReservationInfoModal from "../components/ReservationInfoModal.jsx";
import ReservationAdminModal from "../components/ReservationAdminModal.jsx";
import PrintableSchedule from "../components/PrintableSchedule.js";
import {
  apiGetPrintableReservationsAll,
} from "../api/reservations.api.js";

function WeeklyCalendar() {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [printData, setPrintData] = useState(null);
  const [pendingPrint, setPendingPrint] = useState(false);

  const {
    courts,
    selectedCourtId,
    weekOffset,
    setWeekOffset,
    monday,
    sunday,
    calendarSlots,
    draftReservations,
    initialReservations,

    isModalOpen,
    modalMessage,
    isErrorModal,
    modalTournamentId,
    closeBaseModal,

    isAdminModalVisible,
    selectedBlockedSlot,
    closeAdminModal,

    isConfirmModalOpen,
    pendingChanges,
    isSaving,
    closeConfirmModal,
    confirmSubmit,

    handleChangeCourt,
    handleSubmit,
    handleClick,
  } = useWeeklyCalendar({
    user,
    role,
    token,
  });

  function handleTournamentRegistration(tournamentId) {
    if (tournamentId == null) return;

    closeBaseModal();
    navigate("/versenyek");
  }

  async function handlePrint() {
    try {
      if (!token) throw new Error("Hiányzó token.");

      const courtList = Array.isArray(courts) ? courts : [];
      if (courtList.length === 0) throw new Error("Nincs pálya betöltve.");

      const userTypeParam = user?.user_type
        ? String(user.user_type).toUpperCase()
        : "USER";

      const rows = await apiGetPrintableReservationsAll({
        monday,
        token,
        userType: userTypeParam,
      });

      const reservations = Array.isArray(rows)
        ? rows.map((r) => ({
            courtId: Number(r.court_id),
            booked_time: r.start_time,
            username: r.username,
            eventType: r.event_type,
          }))
        : [];

      setPrintData({
        reservations,
        courts: courtList,
        weekStart: monday,
      });

      setPendingPrint(true);
    } catch (e) {
      alert(e.message || "Nyomtatás sikertelen.");
      console.error(e);
    }
  }

  useEffect(() => {
    if (!pendingPrint) return;
    if (!printData) return;

    // Ensure portal has mounted before opening print dialog.
    setPendingPrint(false);
    requestAnimationFrame(() => window.print());
  }, [pendingPrint, printData]);

  return (
    <AuthFrostLock>
      <ReservationHeader
        monday={monday}
        sunday={sunday}
        weekOffset={weekOffset}
        setWeekOffset={setWeekOffset}
        courts={courts}
        bookedCourt={selectedCourtId}
        handleChangeCourt={handleChangeCourt}
        handlePrint={handlePrint}
        handleSubmit={handleSubmit}
      />

      <ReservationCalendarGrid
        days={DAYS}
        hours={HOURS}
        monday={monday}
        draftReservations={draftReservations}
        calendarSlots={calendarSlots}
        initialReservations={initialReservations}
        role={role}
        handleClick={handleClick}
      />

      <ReservationChangeConfirmModal
        isOpen={isConfirmModalOpen}
        changes={pendingChanges}
        isSaving={isSaving}
        onClose={closeConfirmModal}
        onConfirm={confirmSubmit}
      />

      <ReservationInfoModal
        isOpen={isModalOpen}
        isError={isErrorModal}
        message={modalMessage}
        tournamentId={modalTournamentId}
        onTournamentRegistration={handleTournamentRegistration}
        onClose={closeBaseModal}
      />

      <ReservationAdminModal
        isOpen={isAdminModalVisible}
        selectedSlot={selectedBlockedSlot}
        onClose={closeAdminModal}
      />

      {printData && (
        <PrintableSchedule
          reservations={printData.reservations}
          courts={printData.courts}
          weekStart={printData.weekStart}
        />
      )}
    </AuthFrostLock>
  );
}

export default WeeklyCalendar;