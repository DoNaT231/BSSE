import dayjs from "dayjs";

function formatDateTime(value) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY.MM.DD. HH:mm") : "-";
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

function getEventTypeLabel(type) {
  switch (type) {
    case "reservation":
      return "Foglalás";
    case "tournament":
      return "Verseny";
    case "maintenance":
      return "Karbantartás";
    case "training":
      return "Edzés";
    default:
      return type || "-";
  }
}

function ReservationAdminModal({
  isOpen,
  selectedSlot,
  onClose,
  onDelete,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  const isReservation = selectedSlot?.eventType === "reservation";
  const canDelete = Boolean(isReservation && selectedSlot?.slotId && onDelete);

  const startLabel = formatDateTime(selectedSlot?.startTime);
  const endLabel = formatDateTime(selectedSlot?.endTime);
  const eventTypeLabel = getEventTypeLabel(selectedSlot?.eventType);
  const durationMinutes =
    selectedSlot?.startTime && selectedSlot?.endTime
      ? dayjs(selectedSlot.endTime).diff(dayjs(selectedSlot.startTime), "minute")
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-[#2c3e50]">Foglalás kezelése</h2>
          <span className="rounded-full bg-[#eaf4ff] px-3 py-1 text-xs font-semibold text-[#2c3e50]">
            {eventTypeLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#d9e2ec] bg-[#f8fbff] p-3">
            <p className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
              Kezdés
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2c3e50]">{startLabel}</p>
          </div>

          <div className="rounded-xl border border-[#d9e2ec] bg-[#f8fbff] p-3">
            <p className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
              Vége
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2c3e50]">{endLabel}</p>
          </div>

          <div className="rounded-xl border border-[#d9e2ec] bg-white p-3">
            <p className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
              Slot ID
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2c3e50]">
              {selectedSlot?.slotId || "-"}
            </p>
          </div>

          <div className="rounded-xl border border-[#d9e2ec] bg-white p-3">
            <p className="text-xs font-semibold tracking-wide text-[#6b7c93] uppercase">
              Létrehozó user ID
            </p>
            <p className="mt-1 text-sm font-semibold text-[#2c3e50]">
              {formatValue(selectedSlot?.createdByUserId)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#d9e2ec] bg-white p-4">
          <h3 className="text-sm font-semibold text-[#2c3e50]">
            További részletek
          </h3>

          <div className="grid grid-cols-1 gap-x-4 gap-y-2 mt-3 text-sm sm:grid-cols-2">
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Esemény ID:</span>{" "}
              {formatValue(selectedSlot?.eventId)}
            </p>
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Pálya ID:</span>{" "}
              {formatValue(selectedSlot?.courtId)}
            </p>
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Státusz:</span>{" "}
              {formatValue(selectedSlot?.slotStatus)}
            </p>
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Időtartam:</span>{" "}
              {durationMinutes != null && durationMinutes >= 0
                ? `${durationMinutes} perc`
                : "-"}
            </p>
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Cím:</span>{" "}
              {formatValue(selectedSlot?.title)}
            </p>
            <p className="text-[#5c6b7a]">
              <span className="font-semibold text-[#2c3e50]">Verseny ID:</span>{" "}
              {formatValue(selectedSlot?.tournamentId)}
            </p>
          </div>

          <details className="mt-3">
            <summary className="text-xs font-semibold tracking-wide uppercase cursor-pointer text-[#6b7c93]">
              Nyers adatok megjelenítése
            </summary>
            <pre className="p-3 mt-2 overflow-auto text-xs rounded-lg bg-slate-100 text-slate-700">
              {JSON.stringify(selectedSlot, null, 2)}
            </pre>
          </details>
        </div>

        {!canDelete && (
          <p className="p-3 mt-4 text-sm text-[#5c6b7a] rounded-lg bg-slate-100">
            Ehhez a kiválasztott eseményhez nem érhető el közvetlen törlés.
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          {canDelete && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={onDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Törlés folyamatban..." : "Foglalás törlése"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-lightBlue hover:bg-lightBlueStrong disabled:cursor-not-allowed disabled:opacity-60"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationAdminModal;