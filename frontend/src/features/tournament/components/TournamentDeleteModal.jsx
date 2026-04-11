import React from "react";

export default function TournamentDeleteModal({
  tournament,
  onClose,
  onConfirm,
  deleting,
}) {
  if (!tournament) return null;

  const title = tournament.title || `Verseny #${tournament.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white border shadow-xl rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-brandDark">
          Verseny törlése
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Biztos törlöd a <strong>"{title}"</strong> versenyt? A versenyhez
          tartozó esemény és jelentkezések is törlődhetnek. Ez a művelet nem
          vonható vissza.
        </p>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-60"
          >
            Mégse
          </button>
          <button
            type="button"
            onClick={() => onConfirm(tournament.id)}
            disabled={deleting}
            className="px-4 py-2 text-sm text-white bg-red-600 border border-red-700 rounded-xl hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Törlés..." : "Igen, törlöm"}
          </button>
        </div>
      </div>
    </div>
  );
}
