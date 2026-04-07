import React from "react";

export default function TournamentCreateForm({
  createForm,
  setCreateForm,
  slotForm,
  setSlotForm,
  slots,
  courts,
  creating,
  onAddSlot,
  onRemoveSlot,
  onSubmit,
  onReset,
}) {
  return (
    <div className="p-4 mt-6 border rounded-2xl md:p-5">
      <h3 className="font-semibold">Új verseny létrehozása</h3>

      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2"
      >
        <div>
          <label className="text-sm text-gray-700">Cím (title) *</label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-xl"
            value={createForm.title}
            onChange={(e) =>
              setCreateForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Pl. Balatonalmádi Strandsport Kupa"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-700">Leírás (description)</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[90px]"
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Rövid leírás a toborzáshoz..."
          />
        </div>

        <div>
          <label className="text-sm text-gray-700">
            Szervező email (organizerEmail)
          </label>
          <input
            className="w-full px-3 py-2 mt-1 border rounded-xl"
            value={createForm.organizerEmail}
            onChange={(e) =>
              setCreateForm((p) => ({
                ...p,
                organizerEmail: e.target.value,
              }))
            }
            placeholder="info@bsse.hu"
          />
          <p className="mt-1 text-xs text-gray-500">
            Opcionális, ha üres, a backend felé <code>null</code> megy.
          </p>
        </div>

        <div>
            <label className="text-sm text-gray-700">
                Szervező név (organizerName)
            </label>
            <input
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={createForm.organizerName}
                onChange={(e) =>
                    setCreateForm((p) => ({ ...p, organizerName: e.target.value }))
                }
                placeholder="Pl. SMASH"
            />
        </div>

        <div>
          <label className="text-sm text-gray-700">
            Nevezési határidő (registrationDeadline)
          </label>
          <input
            type="datetime-local"
            className="w-full px-3 py-2 mt-1 border rounded-xl"
            value={createForm.registrationDeadline}
            onChange={(e) =>
              setCreateForm((p) => ({
                ...p,
                registrationDeadline: e.target.value,
              }))
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            Opcionális, de hasznos információ a jelentkezőknek.
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-700">Max csapat (maxTeams)</label>
          <input
            type="number"
            className="w-full px-3 py-2 mt-1 border rounded-xl"
            value={createForm.maxTeams}
            onChange={(e) =>
              setCreateForm((p) => ({
                ...p,
                maxTeams: e.target.value,
              }))
            }
            placeholder="Pl. 16"
          />
        </div>

        <div>
          <label className="text-sm text-gray-700">
            Csapatlétszám (team_size)
          </label>
          <input
            type="number"
            className="w-full px-3 py-2 mt-1 border rounded-xl"
            value={createForm.team_size}
            onChange={(e) =>
              setCreateForm((p) => ({ ...p, team_size: e.target.value }))
            }
            placeholder="Pl. 2"
          />
        </div>

        <div>
            <label className="text-sm text-gray-700">Nevezési díj (entry_fee)</label>
            <input
                type="number"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={createForm.entry_fee}
                onChange={(e) =>
                    setCreateForm((p) => ({ ...p, entry_fee: e.target.value }))
                }
                placeholder="Pl. 1000"
            />
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-700">Megjegyzés (notes)</label>
          <textarea
            className="mt-1 w-full rounded-xl border px-3 py-2 min-h-[70px]"
            value={createForm.notes}
            onChange={(e) =>
              setCreateForm((p) => ({ ...p, notes: e.target.value }))
            }
            placeholder="Pl. nevezési díj a helyszínen, külön díjazás, stb."
          />
        </div>

        <div className="md:col-span-2 border-t pt-4 mt-2">
          <h4 className="font-semibold text-sm text-gray-800">
            Időpontok és pályák (slots)
          </h4>

          <p className="mt-1 text-xs text-gray-500">
            Adj meg egy vagy több napot és időintervallumot. Egész napos eseményhez
            pipáld be az <span className="font-semibold">Egész nap</span> opciót.
          </p>

          <div className="grid grid-cols-1 gap-3 mt-3 md:grid-cols-4">
            <div>
              <label className="text-xs text-gray-700">Pálya *</label>
              <select
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={slotForm.courtId}
                onChange={(e) =>
                  setSlotForm((p) => ({ ...p, courtId: e.target.value }))
                }
              >
                <option value="">Válassz pályát</option>
                <option value="__ALL__">Összes pálya (mindhárom)</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>
                    {court.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-700">Nap *</label>
              <input
                type="date"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={slotForm.day}
                onChange={(e) =>
                  setSlotForm((p) => ({ ...p, day: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-700">Kezdés *</label>
              <input
                type="time"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={slotForm.startTime}
                disabled={slotForm.allDay}
                onChange={(e) =>
                  setSlotForm((p) => ({ ...p, startTime: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="text-xs text-gray-700">Befejezés *</label>
              <input
                type="time"
                className="w-full px-3 py-2 mt-1 border rounded-xl"
                value={slotForm.endTime}
                disabled={slotForm.allDay}
                onChange={(e) =>
                  setSlotForm((p) => ({ ...p, endTime: e.target.value }))
                }
              />
            </div>

            <div className="flex flex-col justify-end gap-2 mt-1">
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={slotForm.allDay}
                  onChange={(e) =>
                    setSlotForm((p) => ({ ...p, allDay: e.target.checked }))
                  }
                />
                Egész nap
              </label>
              <button
                type="button"
                onClick={onAddSlot}
                className="px-3 py-2 text-xs text-white bg-black rounded-xl shrink-0 hover:opacity-90"
              >
                Hozzáad
              </button>
            </div>
          </div>

          {slots.length > 0 && (
            <div className="mt-3 space-y-2">
              {slots.map((s, index) => (
                <div
                  key={`${s.courtId}-${s.startTime}-${index}`}
                  className="flex items-center justify-between px-3 py-2 text-xs border rounded-xl bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <span className="font-semibold">
                      {s.courtName} (#{s.courtId})
                    </span>
                    <span className="text-gray-600">
                      {new Date(s.startTime).toLocaleString()} –{" "}
                      {new Date(s.endTime).toLocaleString()}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveSlot(index)}
                    className="px-2 py-1 text-[11px] text-red-700 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100"
                  >
                    Eltávolítás
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 md:col-span-2">
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 text-sm text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-60"
          >
            {creating ? "Létrehozás..." : "Létrehozás"}
          </button>

          <button
            type="button"
            className="px-4 py-2 text-sm border rounded-xl hover:bg-gray-50"
            onClick={onReset}
            disabled={creating}
          >
            Ürítés
          </button>
        </div>
      </form>
    </div>
  );
}