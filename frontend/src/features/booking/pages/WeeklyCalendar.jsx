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
import { apiGetPrintableReservationsAll } from "../api/reservations.api.js";

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

    setPendingPrint(false);
    requestAnimationFrame(() => window.print());
  }, [pendingPrint, printData]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <AuthFrostLock>
        <div className="page-main overflow-visible">
          <section className="relative overflow-x-clip">
          {/* háttér glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-lightBlue/25 blur-3xl" />
            <div className="absolute top-[220px] right-[-80px] h-[280px] w-[280px] rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-[-120px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-lightBlue/20 blur-3xl" />
          </div>

          <div className="page-container">
            {/* HERO */}
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center rounded-full border border-lightBlue/30 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-lightBlueStrong shadow-sm">
                  Pályafoglalás
                </div>

                <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-brandDark sm:text-5xl">
                  Foglald le egyszerűen a
                  <span className="block text-lightBlue">számodra megfelelő pályát</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  Válassz pályát, nézd meg a heti szabad időpontokat, majd néhány
                  kattintással rögzítsd vagy módosítsd a foglalásaidat.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Elérhető pályák
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-brandDark">
                      {Array.isArray(courts) ? courts.length : 0}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Kiválasztott hét
                    </p>
                    <p className="mt-1 text-lg font-extrabold text-brandDark">
                      {new Date(monday).toLocaleDateString("hu-HU")} – {new Date(sunday).toLocaleDateString("hu-HU")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-lightBlue/25 via-primaryLight/80 to-lightBlue/15 blur-2xl" />
                <div className="hidden md:block relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_80px_-25px_rgba(35,31,32,0.28)]">
                  <img
                    src="/images/ropipalya1.jpg"
                    alt="Strandröplabda pálya"
                    className="h-[260px] w-full rounded-[1.4rem] object-cover sm:h-[320px]"
                  />
                </div>
              </div>
            </div>

            {/* felső vezérlő panel */}
            <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_-30px_rgba(35,31,32,0.25)] backdrop-blur sm:p-6">
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
            </div>

            {/* naptár */}
            <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white/95 p-3 shadow-[0_20px_60px_-30px_rgba(35,31,32,0.22)] sm:p-5 lg:p-6">

              <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50/70">
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
              </div>
            </div>
          </div>

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
          </section>
        </div>
      </AuthFrostLock>
    </div>
  );
}

export default WeeklyCalendar;