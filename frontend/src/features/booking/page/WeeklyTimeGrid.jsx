import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { useAuth } from "../../../contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import AuthFrostLock from "../../../components/AuthLock.js";

import fetchCourts from "../api/CourtsApi.js";
import {
  apiGetWeeklyCalendarSlots,
  apiGetOwnWeeklyReservations,
  apiSyncWeekReservations,
} from "../api/reservations.api.js";

import { diffReservations } from "../utils/reservationDiff.js";

import ReservationHeader from "../components/ReservationHeader.jsx";
import ReservationCalendarGrid from "../components/ReservationCalendarGrid.jsx";
import ReservationChangeConfirmModal from "../components/ReservationChangeConfirmModal.jsx";

dayjs.extend(utc);

const days = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const hours = Array.from({ length: 12 }, (_, i) => i + 9);

function WeeklyCalendar() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0);

  /**
   * Az adott hét adott pályájának összes slotja:
   * - reservation
   * - tournament
   * - maintenance
   * - training
   */
  const [calendarSlots, setCalendarSlots] = useState([]);

  /**
   * A user saját reservationjei szerkeszthető formában:
   * [
   *   { startTime, endTime }
   * ]
   */
  const [draftReservations, setDraftReservations] = useState([]);

  /**
   * Betöltéskori snapshot a diffhez
   */
  const [initialReservations, setInitialReservations] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isErrorModal, setIsErrorModal] = useState(false);

  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState(null);
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);

  /**
   * Mentés megerősítő modal state
   */
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    added: [],
    removed: [],
  });
  const [isSaving, setIsSaving] = useState(false);

  const monday = useMemo(() => {
    const now = new Date();
    const clone = new Date(now);
    const day = clone.getDay();
    const diff = clone.getDate() - day + (day === 0 ? -6 : 1);

    clone.setDate(diff);
    clone.setHours(0, 0, 0, 0);
    clone.setDate(clone.getDate() + weekOffset * 7);

    return clone;
  }, [weekOffset]);

  const sunday = useMemo(() => {
    const end = new Date(monday);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }, [monday]);

  const weekEndExclusive = useMemo(() => {
    const end = new Date(monday);
    end.setDate(end.getDate() + 7);
    end.setHours(0, 0, 0, 0);
    return end;
  }, [monday]);

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  function openErrorModal(message) {
    setIsModalOpen(true);
    setIsErrorModal(true);
    setModalMessage(message);
  }

  function openInfoModal(message) {
    setIsModalOpen(true);
    setIsErrorModal(false);
    setModalMessage(message);
  }

  function closeBaseModal() {
    setIsModalOpen(false);
    setModalMessage("");
    setIsErrorModal(false);
  }

  function toDraftReservation(slot) {
    return {
      startTime: dayjs(slot.startTime).toISOString(),
      endTime: dayjs(slot.endTime).toISOString(),
    };
  }

  async function loadCourts() {
    try {
      const data = await fetchCourts();
      setCourts(data);

      if (data?.length && !selectedCourtId) {
        setSelectedCourtId(Number(data[0].id));
      }
    } catch (err) {
      openErrorModal("Hiba történt a pályák lekérésekor.");
    }
  }

  async function loadCalendarData() {
    if (!selectedCourtId) return;

    try {
      const [slots, ownReservations] = await Promise.all([
        apiGetWeeklyCalendarSlots({
          monday,
          courtId: Number(selectedCourtId),
          token,
        }),
        user
          ? apiGetOwnWeeklyReservations({
              monday,
              courtId: Number(selectedCourtId),
              token,
            })
          : Promise.resolve([]),
      ]);

      setCalendarSlots(slots);

      const ownDraft = ownReservations.map(toDraftReservation);
      setDraftReservations(ownDraft);
      setInitialReservations(ownDraft);
    } catch (err) {
      openErrorModal(err.message || "Hiba történt a foglalások lekérésekor.");
    }
  }

  useEffect(() => {
    loadCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourtId, weekOffset, user]);

  const handleChangeCourt = (e) => {
    e.preventDefault();
    setSelectedCourtId(Number(e.target.value));
  };

  const getCellDate = (dayIndex, hour) => {
    const cellDate = new Date(monday);
    cellDate.setDate(monday.getDate() + dayIndex);
    cellDate.setHours(hour, 0, 0, 0);
    return cellDate;
  };

  const getCellEndDate = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    return endDate;
  };

  const findCalendarSlotAtCell = (cellDate) => {
    const cellTime = cellDate.getTime();

    return calendarSlots.find((slot) => {
      const slotStart = new Date(slot.startTime).getTime();
      return slotStart === cellTime;
    });
  };

  const isDraftSelected = (cellDate) => {
    const cellKey = dayjs(cellDate).toISOString();

    return draftReservations.some(
      (reservation) => reservation.startTime === cellKey
    );
  };

  /**
   * Mentés gomb -> csak modal nyitás
   */
  const handleSubmit = async () => {
    if (!user) {
      navigate("/bejelentkezes");
      return;
    }

    const { added, removed, changed } = diffReservations(
      initialReservations,
      draftReservations
    );

    if (!changed) {
      openInfoModal("Nem változtatott semmit.");
      return;
    }

    setPendingChanges({
      added,
      removed,
    });

    setIsConfirmModalOpen(true);
  };

  /**
   * Modal megerősítés -> tényleges mentés
   */
  const confirmSubmit = async () => {
    try {
      setIsSaving(true);

      await apiSyncWeekReservations({
        courtId: Number(selectedCourtId),
        monday,
        token,
        reservations: draftReservations,
      });

      setInitialReservations(draftReservations);
      setIsConfirmModalOpen(false);
      setPendingChanges({
        added: [],
        removed: [],
      });

      await loadCalendarData();

      openInfoModal("A foglalások sikeresen mentve lettek.");
    } catch (err) {
      openErrorModal(err.message || "Hiba történt a szinkronizálás során.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeConfirmModal = () => {
    if (isSaving) return;

    setIsConfirmModalOpen(false);
    setPendingChanges({
      added: [],
      removed: [],
    });
  };

  const handleClick = (dayIndex, hour) => {
    if (!selectedCourtId) return;

    const cellDate = getCellDate(dayIndex, hour);
    const cellEndDate = getCellEndDate(cellDate);

    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const existingSlot = findCalendarSlotAtCell(cellDate);
    const alreadySelected = isDraftSelected(cellDate);

    /**
     * Ha van ott event slot, nézzük meg mi az
     */
    if (existingSlot) {
      const isOwnReservation =
        existingSlot.eventType === "reservation" &&
        Number(existingSlot.createdByUserId) === Number(user?.id);

      if (!isOwnReservation) {
        if (role === "admin") {
          setSelectedBlockedSlot(existingSlot);
          setIsAdminModalVisible(true);
          return;
        }

        if (existingSlot.eventType === "tournament") {
          openInfoModal("Ez az időpont tournament miatt foglalt.");
          return;
        }

        if (existingSlot.eventType === "maintenance") {
          openInfoModal("Ez az időpont karbantartás miatt nem foglalható.");
          return;
        }

        if (existingSlot.eventType === "training") {
          openInfoModal("Ez az időpont edzés miatt foglalt.");
          return;
        }

        openErrorModal("Ez az időpont már foglalt.");
        return;
      }
    }

    /**
     * Ha új foglalás jön, szabályellenőrzés
     */
    if (!alreadySelected) {
      if (cellDate < now) {
        openErrorModal("Múltbeli időpontokra nem lehet foglalni.");
        return;
      }

      if (isSameDay(today, cellDate)) {
        openErrorModal("A mai napra már nem lehet foglalni.");
        return;
      }

      if (isSameDay(tomorrow, cellDate) && now.getHours() >= 18) {
        openErrorModal("18 óra után már nem lehet a következő napra foglalni.");
        return;
      }

      const ownDates = draftReservations.map(
        (reservation) => new Date(reservation.startTime)
      );

      const dayCount = ownDates.filter((date) => isSameDay(date, cellDate)).length;
      if (dayCount >= 2) {
        openErrorModal("Egy nap maximum két óra foglalható.");
        return;
      }

      const weekCount = ownDates.filter(
        (date) => date >= monday && date < weekEndExclusive
      ).length;

      if (weekCount >= 10) {
        openErrorModal("Egy héten maximum 10 óra foglalható.");
        return;
      }
    }

    /**
     * Toggle a draft state-ben
     */
    setDraftReservations((prev) => {
      const startIso = dayjs(cellDate).toISOString();
      const endIso = dayjs(cellEndDate).toISOString();

      const exists = prev.some(
        (reservation) => reservation.startTime === startIso
      );

      if (exists) {
        return prev.filter((reservation) => reservation.startTime !== startIso);
      }

      return [
        ...prev,
        {
          startTime: startIso,
          endTime: endIso,
        },
      ];
    });
  };

  return (
    <>
      <AuthFrostLock >
        <ReservationHeader
          monday={monday}
          sunday={sunday}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          courts={courts}
          bookedCourt={selectedCourtId}
          handleChangeCourt={handleChangeCourt}
          handlePrint={() => {
            openErrorModal("A nyomtatás részt külön szedjük majd.");
          }}
          handleSubmit={handleSubmit}
        />

        <ReservationCalendarGrid
          days={days}
          hours={hours}
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

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
              <h2 className="mb-3 text-lg font-bold">
                {isErrorModal ? "Hiba" : "Információ"}
              </h2>

              <p className="text-sm text-gray-700 whitespace-pre-line">
                {modalMessage}
              </p>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={closeBaseModal}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Rendben
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdminModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
              <h2 className="mb-3 text-lg font-bold">Admin művelet</h2>

              <p className="text-sm text-gray-700">
                Itt később jöhet az admin kezelőmodal a kiválasztott slotra.
              </p>

              <pre className="p-3 mt-4 overflow-auto text-xs bg-gray-100 rounded">
                {JSON.stringify(selectedBlockedSlot, null, 2)}
              </pre>

              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalVisible(false);
                    setSelectedBlockedSlot(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Bezárás
                </button>
              </div>
            </div>
          </div>
        )}
      </AuthFrostLock>
    </>
  );
}

export default WeeklyCalendar;