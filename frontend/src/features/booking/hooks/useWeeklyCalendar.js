import { useEffect, useMemo, useState } from "react";
import fetchCourts from "../api/CourtsApi.js";
import {
  apiGetWeeklyCalendarSlots,
  apiGetOwnWeeklyReservations,
  apiSyncWeekReservations,
} from "../api/reservations.api.js";
import { diffReservations } from "../utils/reservationDiff.js";
import {
  getMondayFromOffset,
  getSundayFromMonday,
  getWeekEndExclusive,
  getCellDate,
  getCellEndDate,
  toIso,
} from "../utils/reservationDate.utils.js";
import {
  toDraftReservation,
  findCalendarSlotAtCell,
  isDraftSelected,
} from "../utils/reservationMapper.utils.js";
import {
  validateReservationSelection,
  getBlockedSlotMessage,
} from "../services/reservationRules.service.js";
import dayjs from "dayjs";

/**
 * useWeeklyCalendar
 * -----------------
 * A heti foglalási naptár teljes kliensoldali logikáját kezeli.
 *
 * Fő feladatai:
 * - pályák betöltése
 * - adott hét és pálya foglalási slotjainak lekérése
 * - a user saját foglalásainak draft állapotban kezelése
 * - foglalási szabályok ellenőrzése kattintáskor
 * - mentés előtti diff előállítása
 * - mentés megerősítő modal és alap információs/hiba modal kezelése
 * - admin kattintás esetén külön admin modal nyitása blokkolt slotokra
 *
 * @param {Object} params
 * @param {Object|null} params.user - aktuálisan bejelentkezett user
 * @param {string|null} params.role - user szerepköre (pl. "admin")
 * @param {string|null} params.token - auth token API hívásokhoz
 *
 * @returns {Object} A WeeklyCalendar oldal számára szükséges state-ek és handlerek
 */
export default function useWeeklyCalendar({ user, role, token }) {
  /**
   * Pályák listája a backendből
   * pl. [{ id, name, ... }]
   */
  const [courts, setCourts] = useState([]);

  /**
   * Kiválasztott pálya azonosítója
   */
  const [selectedCourtId, setSelectedCourtId] = useState(null);

  /**
   * Hételtolás a jelenlegi héthez képest
   * 0 = aktuális hét
   * 1 = következő hét
   * -1 = előző hét
   */
  const [weekOffset, setWeekOffset] = useState(0);

  /**
   * Az adott hét és pálya összes naptár-slotja.
   * Ide kerülhet:
   * - reservation
   * - tournament
   * - maintenance
   * - training
   */
  const [calendarSlots, setCalendarSlots] = useState([]);

  /**
   * A user saját foglalásai szerkeszthető draft formában.
   * Ezek módosulnak kattintáskor az UI-ban.
   */
  const [draftReservations, setDraftReservations] = useState([]);

  /**
   * Betöltéskori eredeti foglalásállapot.
   * Ehhez hasonlítjuk a draftReservations-t mentéskor.
   */
  const [initialReservations, setInitialReservations] = useState([]);

  /**
   * Általános információs / hiba modal state
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isErrorModal, setIsErrorModal] = useState(false);

  /**
   * Admin modalhoz kiválasztott blokkolt slot
   */
  const [selectedBlockedSlot, setSelectedBlockedSlot] = useState(null);

  /**
   * Admin modal láthatósága
   */
  const [isAdminModalVisible, setIsAdminModalVisible] = useState(false);

  /**
   * Mentés megerősítő modal állapota
   */
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  /**
   * A mentés előtt kiszámolt különbségek:
   * - added: újonnan hozzáadott foglalások
   * - removed: törölt foglalások
   */
  const [pendingChanges, setPendingChanges] = useState({
    added: [],
    removed: [],
  });

  /**
   * Mentés folyamatban van-e
   * Ezzel pl. letiltható a modal bezárása / gombok
   */
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Az éppen megjelenített hét hétfője
   */
  const monday = useMemo(() => getMondayFromOffset(weekOffset), [weekOffset]);

  /**
   * Az éppen megjelenített hét vasárnapja
   */
  const sunday = useMemo(() => getSundayFromMonday(monday), [monday]);

  /**
   * A hét záró dátuma exclusive módon.
   * [monday, weekEndExclusive) intervallumként kényelmes heti számolásokhoz.
   */
  const weekEndExclusive = useMemo(
    () => getWeekEndExclusive(monday),
    [monday]
  );

  /**
   * Hibamodal megnyitása megadott üzenettel
   *
   * @param {string} message
   */
  function openErrorModal(message) {
    setIsModalOpen(true);
    setIsErrorModal(true);
    setModalMessage(message);
  }

  /**
   * Információs modal megnyitása megadott üzenettel
   *
   * @param {string} message
   */
  function openInfoModal(message) {
    setIsModalOpen(true);
    setIsErrorModal(false);
    setModalMessage(message);
  }

  /**
   * Alap modal bezárása és state reset
   */
  function closeBaseModal() {
    setIsModalOpen(false);
    setModalMessage("");
    setIsErrorModal(false);
  }

  /**
   * Pályák betöltése a backendből.
   *
   * Működés:
   * - lekéri az összes pályát
   * - beteszi state-be
   * - ha még nincs kiválasztott pálya, automatikusan az elsőt állítja be
   */
  async function loadCourts() {
    try {
      const data = await fetchCourts();
      setCourts(data);

      if (data?.length && !selectedCourtId) {
        setSelectedCourtId(Number(data[0].id));
      }
    } catch {
      openErrorModal("Hiba történt a pályák lekérésekor.");
    }
  }

  /**
   * Az aktuális hét + kiválasztott pálya naptáradatainak betöltése.
   *
   * Betölti:
   * - az összes naptárslotot az adott pályára
   * - a bejelentkezett user saját heti foglalásait
   *
   * A user saját foglalásait draft formára alakítja,
   * majd beállítja őket:
   * - draftReservations
   * - initialReservations
   */
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

  /**
   * Első renderkor pályák betöltése
   */
  useEffect(() => {
    loadCourts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Naptáradatok újratöltése, ha változik:
   * - kiválasztott pálya
   * - hét
   * - user
   */
  useEffect(() => {
    loadCalendarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourtId, weekOffset, user]);

  /**
   * Pályaváltás kezelése a select mezőből
   *
   * @param {React.ChangeEvent<HTMLSelectElement>} e
   */
  function handleChangeCourt(e) {
    e.preventDefault();
    setSelectedCourtId(Number(e.target.value));
  }

  /**
   * Mentés gomb kezelése.
   *
   * Nem ment rögtön backendbe, csak:
   * - kiszámolja a változásokat
   * - ha nincs változás, info modalt nyit
   * - ha van változás, megnyitja a megerősítő modalt
   */
  function handleSubmit() {
    const { added, removed, changed } = diffReservations(
      initialReservations,
      draftReservations
    );

    if (!changed) {
      openInfoModal("Nem változtatott semmit.");
      return;
    }

    setPendingChanges({ added, removed });
    setIsConfirmModalOpen(true);
  }

  /**
   * Mentés megerősítése után tényleges backend szinkron.
   *
   * Lépések:
   * - saving state bekapcsolása
   * - heti foglalások szinkronizálása backenddel
   * - local state frissítése
   * - naptár újratöltése
   * - siker modal megnyitása
   */
  async function confirmSubmit() {
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
      setPendingChanges({ added: [], removed: [] });

      await loadCalendarData();
      openInfoModal("A foglalások sikeresen mentve lettek.");
    } catch (err) {
      openErrorModal(err.message || "Hiba történt a szinkronizálás során.");
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Mentés megerősítő modal bezárása.
   *
   * Ha épp mentés folyik, nem engedjük bezárni.
   */
  function closeConfirmModal() {
    if (isSaving) return;

    setIsConfirmModalOpen(false);
    setPendingChanges({ added: [], removed: [] });
  }

  /**
   * Admin modal bezárása és a kiválasztott slot törlése
   */
  function closeAdminModal() {
    setIsAdminModalVisible(false);
    setSelectedBlockedSlot(null);
  }

  /**
   * Egy naptárcella kattintásának kezelése.
   *
   * Működés:
   * 1. Meghatározza a kattintott cella kezdő és végdátumát
   * 2. Megnézi, van-e ott már foglalás / egyéb blokkoló slot
   * 3. Ha nem saját foglalás:
   *    - adminnak admin modal
   *    - normál usernek tájékoztató modal
   * 4. Ha új kiválasztás történik:
   *    - lefuttatja az üzleti validációkat
   * 5. Ha minden rendben:
   *    - toggle-olja a draftReservations state-et
   *
   * @param {number} dayIndex - 0..6, a hét napja hétfőtől indulva
   * @param {number} hour - a kattintott óra kezdete
   */
  function handleClick(dayIndex, hour) {
    if (!selectedCourtId) return;

    const cellDate = getCellDate(monday, dayIndex, hour);
    const cellEndDate = getCellEndDate(cellDate);
    const now = new Date();

    console.log("celldate: ", cellDate)
    console.log("celldatend ", cellEndDate)

    const existingSlot = findCalendarSlotAtCell(calendarSlots, cellDate);
    const alreadySelected = isDraftSelected(draftReservations, cellDate);

    /**
     * Ha a cellához már tartozik slot,
     * ellenőrizzük, hogy saját reservation-e.
     */
    if (existingSlot) {
      const isOwnReservation =
        existingSlot.eventType === "reservation" &&
        Number(existingSlot.createdByUserId) === Number(user?.id);

      /**
       * Nem saját foglalás / nem módosítható esemény
       */
      if (!isOwnReservation) {
        if (role === "admin") {
          setSelectedBlockedSlot(existingSlot);
          setIsAdminModalVisible(true);
          return;
        }

        openInfoModal(getBlockedSlotMessage(existingSlot));
        return;
      }
    }

    /**
     * Ha új foglalást akarunk felvenni,
     * előtte validálni kell a szabályokat.
     */
    if (!alreadySelected) {
      const validationError = validateReservationSelection({
        cellDate,
        now,
        monday,
        weekEndExclusive,
        draftReservations,
      });

      if (validationError) {
        openErrorModal(validationError);
        return;
      }
    }

    /**
     * Draft foglalás toggle:
     * - ha már létezik, töröljük
     * - ha nem létezik, hozzáadjuk
     */
    setDraftReservations((prev) => {
      const startIso = dayjs(cellDate).format("YYYY-MM-DD HH:mm:ss");
      const endIso = dayjs(cellEndDate).format("YYYY-MM-DD HH:mm:ss");

      console.log("startIso ", startIso)
      console.log("endIso ", endIso)

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
  }

  /**
   * A hook publikus API-ja.
   * Ezt használja a WeeklyCalendar page komponens.
   */
  return {
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
  };
}