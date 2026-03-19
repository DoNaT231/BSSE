import { useEffect, useMemo, useState } from "react";
import fetchCourts from "../../booking/api/CourtsApi";
import {
  createTournament,
  createTournamentSlot,
  deleteTournament,
  deleteTournamentSlot,
  fetchAdminTournaments,
  fetchTournamentById,
  updateTournament,
  updateTournamentSlot,
} from "../api/tournamentsAdminApi";
import {
  initialCreateForm,
  initialEditForm,
  initialSlotForm,
} from "../constants/tournamentInitialState";
import {
  datetimeLocalToString,
  toDatetimeLocalValue,
} from "../utils/tournamentDateUtils";

export default function useAdminTournaments(token) {
  const [items, setItems] = useState([]);
  const [courts, setCourts] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [slotForm, setSlotForm] = useState(initialSlotForm);
  const [slots, setSlots] = useState([]);
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [saving, setSaving] = useState(false);

  const [deleteConfirming, setDeleteConfirming] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [slotActionLoading, setSlotActionLoading] = useState(false);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const ad = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bd = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bd - ad;
    });
  }, [items]);

  async function loadAll() {
    try {
      setError("");
      setLoadingList(true);
      const data = await fetchAdminTournaments(token);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Ismeretlen hiba a lista betöltésekor.");
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    async function loadCourts() {
      try {
        const data = await fetchCourts();
        setCourts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Hiba a pályák lekérésekor (tournament admin):", e);
      }
    }

    loadCourts();
  }, []);

  function findCourtNameById(id) {
    const court = courts.find((c) => Number(c.id) === Number(id));
    return court?.name || `Pálya #${id}`;
  }

  function handleAddSlot(e) {
    e.preventDefault();

    const courtIdNum = Number(slotForm.courtId);
    if (!courtIdNum || Number.isNaN(courtIdNum)) {
      setError("Válassz egy érvényes pályát a slothoz.");
      return;
    }

    if (!slotForm.day) {
      setError("Válassz egy napot a slothoz.");
      return;
    }

    let startLocal;
    let endLocal;

    if (slotForm.allDay) {
      startLocal = `${slotForm.day}T${slotForm.startTime}`;
      endLocal = `${slotForm.day}T23:59`;
    } else {
      if (!slotForm.startTime || !slotForm.endTime) {
        setError("A slot kezdete és vége kötelező, ha nem egész napos.");
        return;
      }

      startLocal = `${slotForm.day}T${slotForm.startTime}`;
      endLocal = `${slotForm.day}T${slotForm.endTime}`;
    }

    const startIso = datetimeLocalToString(startLocal);
    const endIso = datetimeLocalToString(endLocal);

    if (!startIso || !endIso) {
      setError("A slot kezdete és vége kötelező.");
      return;
    }

    if (new Date(startIso) >= new Date(endIso)) {
      setError("A slot kezdő időpontjának kisebbnek kell lennie, mint a záró időpont.");
      return;
    }

    setError("");

    const courtName = findCourtNameById(courtIdNum);

    setSlots((prev) => [
      ...prev,
      {
        courtId: courtIdNum,
        courtName,
        day: slotForm.day,
        startTime: startIso,
        endTime: endIso,
        allDay: !!slotForm.allDay,
      },
    ]);

    setSlotForm(initialSlotForm);
  }

  function handleRemoveSlot(index) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreate(e) {
    e.preventDefault();

    try {
      setError("");
      setCreating(true);

      const title = createForm.title.trim();
      const organizerName = "SMASH";
      const organizerEmail = createForm.organizerEmail.trim() || null;

      if (!title) {
        setError("A title kötelező.");
        return;
      }

      if (slots.length === 0) {
        setError("Legalább egy időintervallum (slot) megadása kötelező.");
        return;
      }

      const payload = {
        title,
        description: createForm.description?.trim() || null,
        organizerName,
        organizerEmail,
        registrationDeadline: datetimeLocalToString(
          createForm.registrationDeadline
        ),
        maxTeams: createForm.maxTeams ? Number(createForm.maxTeams) : null,
        team_size: createForm.team_size ? Number(createForm.team_size) : null,
        entry_fee: createForm.entry_fee ? Number(createForm.entry_fee) : null,
        notes: createForm.notes?.trim() || null,
        slots: slots.map((s) => ({
          courtId: s.courtId,
          day: s.day || null,
          startTime: s.startTime,
          endTime: s.endTime,
          allDay: !!s.allDay,
        })),
      };

      await createTournament(payload, token);
      await loadAll();

      resetCreateForm();
    } catch (e) {
      setError(e.message || "Hiba a létrehozáskor.");
    } finally {
      setCreating(false);
    }
  }

  function resetCreateForm() {
    setCreateForm(initialCreateForm);
    setSlotForm(initialSlotForm);
    setSlots([]);
  }

  async function openEdit(tournament) {
    if (!tournament?.id) return;
    try {
      setError("");
      const detailed = await fetchTournamentById(tournament.id, token);
      setEditing(detailed);
      setEditForm({
        title: detailed?.title ?? "",
        description: detailed?.description ?? "",
        organizerName: detailed?.organizerName ?? "",
        organizerEmail: detailed?.organizerEmail ?? "",
        registrationDeadline: detailed?.registrationDeadline
          ? toDatetimeLocalValue(detailed.registrationDeadline)
          : "",
        maxTeams: detailed?.maxTeams != null ? String(detailed.maxTeams) : "",
        team_size: detailed?.team_size != null ? String(detailed.team_size) : "2",
        entry_fee: detailed?.entry_fee != null ? String(detailed.entry_fee) : "0",
        notes: detailed?.notes ?? "",
        status: detailed?.eventStatus ?? "published",
        visibility: detailed?.visibility ?? "public",
      });
    } catch (e) {
      setError(e.message || "A verseny adatok betöltése sikertelen.");
    }
  }

  function closeEdit() {
    setEditing(null);
    setEditForm(initialEditForm);
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    if (!editing?.id) return;

    try {
      setError("");
      setSaving(true);

      const payload = {
        title: editForm.title.trim() || null,
        description: editForm.description?.trim() || null,
        status: editForm.status || null,
        visibility: editForm.visibility || null,
        organizerName: editForm.organizerName?.trim() || null,
        organizerEmail: editForm.organizerEmail?.trim() || null,
        registrationDeadline: editForm.registrationDeadline
          ? datetimeLocalToString(editForm.registrationDeadline)
          : null,
        maxTeams: editForm.maxTeams ? Number(editForm.maxTeams) : null,
        team_size: editForm.team_size ? Number(editForm.team_size) : null,
        entry_fee: editForm.entry_fee ? Number(editForm.entry_fee) : null,
        notes: editForm.notes?.trim() || null,
      };

      await updateTournament(editing.id, payload, token);
      await loadAll();
      closeEdit();
    } catch (e) {
      setError(e.message || "Hiba a mentéskor.");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteConfirm(tournament) {
    if (!tournament?.id) return;
    setDeleteConfirming(tournament);
  }

  function closeDeleteConfirm() {
    if (!deleting) setDeleteConfirming(null);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirming?.id) return;
    const id = deleteConfirming.id;
    try {
      setError("");
      setDeleting(true);
      await deleteTournament(id, token);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setDeleteConfirming(null);
    } catch (e) {
      setError(e.message || "Hiba törlés közben.");
    } finally {
      setDeleting(false);
    }
  }

  async function addSlotToTournament(tournamentId, payload) {
    setError("");
    setSlotActionLoading(true);
    try {
      await createTournamentSlot(tournamentId, payload, token);
      await loadAll();
    } finally {
      setSlotActionLoading(false);
    }
  }

  async function updateSlot(tournamentId, slotId, payload) {
    setError("");
    setSlotActionLoading(true);
    try {
      await updateTournamentSlot(tournamentId, slotId, payload, token);
      await loadAll();
    } finally {
      setSlotActionLoading(false);
    }
  }

  async function deleteSlot(tournamentId, slotId) {
    setError("");
    setSlotActionLoading(true);
    try {
      await deleteTournamentSlot(tournamentId, slotId, token);
      await loadAll();
    } finally {
      setSlotActionLoading(false);
    }
  }

  return {
    items: sortedItems,
    rawItems: items,
    courts,
    loadingList,
    error,
    setError,
    loadAll,

    createForm,
    setCreateForm,
    slotForm,
    setSlotForm,
    slots,
    creating,
    handleAddSlot,
    handleRemoveSlot,
    handleCreate,
    resetCreateForm,

    editing,
    editForm,
    setEditForm,
    saving,
    openEdit,
    closeEdit,
    handleSaveEdit,

    deleteConfirming,
    deleting,
    openDeleteConfirm,
    closeDeleteConfirm,
    handleConfirmDelete,

    slotActionLoading,
    addSlotToTournament,
    updateSlot,
    deleteSlot,
  };
}