import React from "react";
import { useAuth } from "../../../contexts/AuthContext.js";
import AuthFrostLock from "../../../components/AuthLock.js";

import { DAYS, HOURS } from "../constants/reservation.constants.js";
import useWeeklyCalendar from "../hooks/useWeeklyCalendar.js";

import ReservationHeader from "../components/ReservationHeader.jsx";
import ReservationCalendarGrid from "../components/ReservationCalendarGrid.jsx";
import ReservationChangeConfirmModal from "../components/ReservationChangeConfirmModal.jsx";
import ReservationInfoModal from "../components/ReservationInfoModal.jsx";
import ReservationAdminModal from "../components/ReservationAdminModal.jsx";

function WeeklyCalendar() {
  const { role, user } = useAuth();
  const token = localStorage.getItem("token");

  const {
    courts,
    selectedCourtId,
    weekOffset,
    setWeekOffset,
    monday,
    sunday,
    calendarSlots,
    draftReservations,

    isModalOpen,
    modalMessage,
    isErrorModal,
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
        handlePrint={() => {}}
        handleSubmit={handleSubmit}
      />

      <ReservationCalendarGrid
        days={DAYS}
        hours={HOURS}
        monday={monday}
        draftReservations={draftReservations}
        calendarSlots={calendarSlots}
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
        onClose={closeBaseModal}
      />

      <ReservationAdminModal
        isOpen={isAdminModalVisible}
        selectedSlot={selectedBlockedSlot}
        onClose={closeAdminModal}
      />
    </AuthFrostLock>
  );
}

export default WeeklyCalendar;