import React from "react";
import dayjs from "dayjs";

/**
 * Egy időintervallum szép formázása
 */
function formatSlotRange(startTime, endTime) {
  return `${dayjs(startTime).format("YYYY.MM.DD. HH:mm")} - ${dayjs(endTime).format("HH:mm")}`;
}

/**
 * Foglalásmódosítás megerősítő modal
 *
 * Feladata:
 * - megmutatja, milyen reservationök kerülnek hozzáadásra
 * - megmutatja, melyek lesznek törölve
 * - megerősítést kér mentés előtt
 *
 * Props:
 * @param {boolean} isOpen
 * @param {{ added: Array, removed: Array }} changes
 * @param {boolean} isSaving
 * @param {Function} onClose
 * @param {Function} onConfirm
 */
function ReservationChangeConfirmModal({
  isOpen,
  changes,
  isSaving = false,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null;

  const added = changes?.added ?? [];
  const removed = changes?.removed ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-4 text-xl font-bold">Foglalások mentése</h2>

        <p className="mb-4 text-sm text-gray-600">
          Biztosan szeretné módosítani a foglalásait?
        </p>

        <div className="max-h-[400px] overflow-y-auto">
          {added.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 font-semibold text-green-700">
                Hozzáadás ({added.length})
              </h3>

              <ul className="space-y-1 text-sm">
                {added.map((item, index) => (
                  <li
                    key={`add-${index}`}
                    className="px-3 py-2 rounded bg-green-50"
                  >
                    + {formatSlotRange(item.startTime, item.endTime)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {removed.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 font-semibold text-red-700">
                Törlés ({removed.length})
              </h3>

              <ul className="space-y-1 text-sm">
                {removed.map((item, index) => (
                  <li
                    key={`remove-${index}`}
                    className="px-3 py-2 rounded bg-red-50"
                  >
                    - {formatSlotRange(item.startTime, item.endTime)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {added.length === 0 && removed.length === 0 && (
            <p className="text-sm text-gray-500">Nincs megjeleníthető változás.</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Mégse
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-lightBlue hover:bg-lightBlueStrong disabled:opacity-50"
          >
            {isSaving ? "Mentés..." : "Mentés"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationChangeConfirmModal;