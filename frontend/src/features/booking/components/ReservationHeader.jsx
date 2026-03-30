export default function ReservationHeader({
  monday,
  sunday,
  setWeekOffset,
  courts,
  bookedCourt,
  handleChangeCourt,
  handlePrint,
  handleSubmit,
}) {
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

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
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            ← Előző hét
          </button>

          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
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
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            onChange={handleChangeCourt}
            value={bookedCourt || ""}
          >
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* jobb oldal */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
        <div className="flex gap-2 sm:self-end">
          <button
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
            onClick={handlePrint}
          >
            Nyomtatás
          </button>

          <button
            className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-700"
            onClick={handleSubmit}
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
}