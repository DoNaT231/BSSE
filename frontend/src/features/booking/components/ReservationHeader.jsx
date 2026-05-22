import { DAYS } from "../constants/reservation.constants.js";

export default function ReservationHeader({
  monday,
  sunday,
  setWeekOffset,
  courts,
  bookedCourt,
  handleChangeCourt,
  printDayOffset,
  setPrintDayOffset,
  handlePrintWeekly,
  handlePrintDaily,
  handleSubmit,
}) {
  const courtList = Array.isArray(courts) ? courts : [];

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return {
      offset: i,
      label: DAYS[i],
      dateLabel: d.toLocaleDateString("hu-HU", {
        month: "2-digit",
        day: "2-digit",
      }),
    };
  });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* bal oldal */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Hét kiválasztása
          </label>

        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brandDark shadow-sm transition hover:-translate-y-0.5 hover:border-lightBlue/35 hover:text-lightBlueStrong"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            ← Előző hét
          </button>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-brandDark shadow-sm transition hover:-translate-y-0.5 hover:border-lightBlue/35 hover:text-lightBlueStrong"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            Következő hét →
          </button>
        </div>
        </div>
        <div className="min-w-[220px]">
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Pálya kiválasztása
          </label>

          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-brandDark shadow-sm outline-none transition focus:border-lightBlue focus:ring-4 focus:ring-lightBlue/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            onChange={handleChangeCourt}
            value={bookedCourt != null ? String(bookedCourt) : ""}
            disabled={courtList.length === 0}
          >
            {courtList.length === 0 ? (
              <option value="">
                Nincs betölthető pálya (szerver nem elérhető?)
              </option>
            ) : (
              courtList.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* jobb oldal */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
        <div className="flex flex-col gap-2 sm:self-end">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[160px]">
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Napi nyomtatás napja
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-brandDark shadow-sm outline-none transition focus:border-lightBlue focus:ring-4 focus:ring-lightBlue/20"
                value={printDayOffset}
                onChange={(e) => setPrintDayOffset(Number(e.target.value))}
              >
                {weekDays.map((day) => (
                  <option key={day.offset} value={day.offset}>
                    {day.label} ({day.dateLabel})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brandDark shadow-sm transition hover:-translate-y-0.5 hover:border-lightBlue/35 hover:text-lightBlueStrong"
              onClick={handlePrintDaily}
            >
              Napi nyomtatás
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-brandDark shadow-sm transition hover:-translate-y-0.5 hover:border-lightBlue/35 hover:text-lightBlueStrong"
              onClick={handlePrintWeekly}
            >
              Heti nyomtatás
            </button>
          </div>

          <button
            className="rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition bg-lightBlue hover:-translate-y-0.5 hover:bg-lightBlueStrong"
            onClick={handleSubmit}
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
}