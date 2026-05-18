import React from "react";

export default function TournamentEditModal({
  editing,
  editForm,
  setEditForm,
  saving,
  onClose,
  onSubmit,
}) {
  if (!editing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-6 overflow-y-auto bg-black/40 md:pt-10">
      <div className="mb-6 flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-white shadow-xl md:mb-10 md:max-h-[calc(100vh-5rem)]">
        <div className="flex items-start justify-between gap-4 p-4 border-b shrink-0 md:p-5">
          <div>
            <div className="text-lg font-semibold">Verseny szerkesztése</div>
            <div className="mt-1 text-xs text-gray-500">ID: {editing.id}</div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-sm border rounded-xl hover:bg-gray-50"
            disabled={saving}
          >
            Bezárás
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="grid flex-1 grid-cols-1 gap-4 p-4 overflow-y-auto md:grid-cols-2 md:p-5">
            <div>
              <label className="text-sm text-gray-700">Cím (title)</label>
              <input
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Státusz (event)</label>
              <select
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, status: e.target.value }))
                }
              >
                <option value="published">published</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">
                Leírás (description)
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[90px]"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Szervező neve</label>
              <input
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.organizerName}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    organizerName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Szervező e-mail</label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.organizerEmail}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    organizerEmail: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Nevezési határidő
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.registrationDeadline}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    registrationDeadline: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Publikus megjelenés / nevezés kezdete
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.availableFrom}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    availableFrom: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Max csapatok</label>
              <input
                type="number"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.maxTeams}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, maxTeams: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Csapatlétszám</label>
              <input
                type="number"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.team_size}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, team_size: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">
                Nevezési díj (Ft)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={editForm.entry_fee}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, entry_fee: e.target.value }))
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">
                Megjegyzés (notes)
              </label>
              <textarea
                className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px]"
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-4 bg-white border-t shrink-0 md:p-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
              disabled={saving}
            >
              Mégse
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}