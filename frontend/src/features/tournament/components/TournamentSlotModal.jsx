import React, { useEffect, useState } from "react";
import { datetimeLocalToString } from "../utils/tournamentDateUtils";
import { toDatetimeLocalValue } from "../utils/tournamentDateUtils";    
export default function TournamentSlotModal({
  open,
  mode,
  slot,
  tournament,
  courts = [],
  onSave,
  onClose,
  saving,
  externalError = "",
}) {
  const [courtId, setCourtId] = useState("");
  const [day, setDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [formError, setFormError] = useState("");

  function toDateInputValue(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function toTimeInputValue(d) {
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  useEffect(() => {
    if (!open) return;
    setFormError("");
    if (mode === "edit" && slot) {
      setCourtId(String(slot.courtId ?? ""));
      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);
      setDay(toDateInputValue(start));
      setStartTime(toTimeInputValue(start));
      setEndTime(toTimeInputValue(end));
      setAllDay(!!slot.allDay);
    } else {
      setCourtId("");
      setDay("");
      setStartTime("");
      setEndTime("");
      setAllDay(false);
    }
  }, [open, mode, slot]);

  function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!courtId || !day) {
      setFormError("A pálya és a nap megadása kötelező.");
      return;
    }

    let localStart, localEnd;

    if (allDay) {
      const startPart = startTime && startTime.trim() ? startTime.trim() : "00:00";
      localStart = `${day}T${startPart}`;
      localEnd = `${day}T23:59`;
    } else {
      if (!startTime || !endTime) {
        setFormError(
          "Ha nem egész napos a slot, a kezdés és a befejezés megadása kötelező."
        );
        return;
      }
      localStart = `${day}T${startTime}`;
      localEnd = `${day}T${endTime}`;
    }

    const normStart = datetimeLocalToString(localStart);
    const normEnd = datetimeLocalToString(localEnd);

    if (!normStart || !normEnd) {
      setFormError("Érvénytelen kezdés/befejezés formátum.");
      return;
    }
    if (new Date(normStart) >= new Date(normEnd)) {
      setFormError("A kezdés időpontja korábban kell legyen, mint a befejezés.");
      return;
    }

    const allCourtsSelected = mode === "add" && courtId === "__ALL__";
    const courtIds = allCourtsSelected
      ? (courts || []).map((court) => Number(court.id)).filter(Boolean)
      : [Number(courtId)];

    if (!courtIds.length) return;

    onSave({
      courtId: allCourtsSelected ? null : Number(courtId),
      courtIds,
      day,
      startTime: normStart,
      endTime: normEnd,
      allDay,
    });
  }

  if (!open) return null;

  const title = mode === "edit" ? "Slot szerkesztése" : "Új slot";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white border shadow-xl rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50 disabled:opacity-60"
          >
            Bezárás
          </button>
        </div>

        {tournament && (
          <p className="text-sm text-gray-500 mb-3">
            Verseny: {tournament.title || `#${tournament.id}`}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Pálya</label>
            <select
              className="w-full px-3 py-2 border rounded-xl"
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              required
              disabled={saving}
            >
              <option value="">Válassz pályát</option>
              {mode === "add" && (
                <option value="__ALL__">Összes pálya (mindhárom)</option>
              )}
              {courts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || `Pálya #${c.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Nap</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-xl"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              required
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Kezdés</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-xl"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Vég</label>
            <input
              type="time"
              className="w-full px-3 py-2 border rounded-xl"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={saving}
            />
          </div>

          <div>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                disabled={saving}
              />
              Egész nap
            </label>
          </div>

          {(formError || externalError) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {formError || externalError}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 disabled:opacity-60"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
