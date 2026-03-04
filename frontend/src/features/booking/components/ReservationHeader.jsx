export default function ReservationHeader({
  monday,
  sunday,
  setWeekOffset,
  courts,
  bookedCourt,
  handleChangeCourt,
  handlePrint,
  handleSubmit
}) {

  /** Date -> "YYYY.MM.DD" HU formázás */
  const formatDate = (date) =>
    date.toLocaleDateString("hu-HU", { year: "numeric", month: "2-digit", day: "2-digit" });

  

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-4 max-w-[960px] mx-auto my-5 bg-white border border-border rounded-card shadow-soft">

      <div className="flex flex-wrap items-center gap-2">
        <strong>Heti nézet:</strong>
        <span>{formatDate(monday)} – {formatDate(sunday)}</span>

        <button
          className="px-3 py-1 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
          onClick={() => setWeekOffset(w => w - 1)}
        >
          Előző hét
        </button>

        <button
          className="px-3 py-1 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
          onClick={() => setWeekOffset(w => w + 1)}
        >
          Következő hét
        </button>
      </div>

      <select
        className="px-3 py-2 font-medium border rounded-lg border-border"
        onChange={handleChangeCourt}
        value={bookedCourt || ""}
      >
        {courts.map(court => (
          <option key={court.id} value={court.id}>
            {court.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 text-white transition rounded-lg bg-lightBlue hover:bg-yellow"
          onClick={handlePrint}
        >
          Nyomtatás
        </button>

        <button
          className="px-4 py-2 font-semibold rounded-lg bg-yellow"
          onClick={handleSubmit}
        >
          Mentés
        </button>
      </div>

    </div>
  );
}