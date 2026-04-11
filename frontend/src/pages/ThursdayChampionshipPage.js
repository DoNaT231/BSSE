import { useEffect, useState } from "react";
import Header from "../components/Header";
import { fetchThursdayLeaderboardTop } from "../features/thursdayChampionship/api/thursdayLeaderboardApi";

const PODIUM = [
  {
    rank: 2,
    order: "order-1",
    bar: "h-36 md:h-44",
    barTone:
      "bg-gradient-to-b from-slate-100 to-slate-300 border-slate-300",
    label: "2. helyezés",
    labelClass: "text-slate-500",
    usernameClass: "text-brandDark",
    pointsClass: "text-slate-700",
  },
  {
    rank: 1,
    order: "order-2",
    bar: "h-44 md:h-56",
    barTone:
      "bg-gradient-to-b from-amber-100 to-amber-300 border-amber-300 ring-2 ring-amber-200/70",
    label: "1. helyezés",
    labelClass: "text-amber-700",
    usernameClass: "text-amber-900",
    pointsClass: "text-amber-700",
  },
  {
    rank: 3,
    order: "order-3",
    bar: "h-28 md:h-36",
    barTone:
      "bg-gradient-to-b from-orange-100 to-orange-300 border-orange-300",
    label: "3. helyezés",
    labelClass: "text-orange-700",
    usernameClass: "text-orange-900",
    pointsClass: "text-orange-700",
  },
];

function PodiumBlock({
  entry,
  rank,
  barClass,
  barToneClass,
  label,
  labelClass,
  usernameClass,
  pointsClass,
}) {
  if (!entry) {
    return (
      <div className="flex flex-col items-center flex-1 max-w-[10rem] justify-end">
        <div
          className={`w-full rounded-t-2xl border border-dashed border-slate-200 bg-slate-50/80 ${barClass}`}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center flex-1 max-w-[10rem] ${rank === 1 ? "md:-mt-2" : ""}`}
    >
      <div className="mb-2 text-center">
        <div
          className={`text-xs font-bold uppercase tracking-wide ${labelClass}`}
        >
          {label}
        </div>
        <div
          className={`mt-1 font-semibold truncate max-w-[10rem] px-1 ${usernameClass}`}
        >
          {entry.username}
        </div>
        <div className={`text-lg font-extrabold tabular-nums ${pointsClass}`}>
          {entry.points} pt
        </div>
      </div>
      <div
        className={`w-full rounded-t-2xl border shadow-sm ${barToneClass} ${barClass}`}
      />
    </div>
  );
}

export default function ThursdayChampionshipPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchThursdayLeaderboardTop();
        if (!cancelled) setEntries(data);
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Nem sikerült betölteni a ranglistát.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="page-root">
      <Header />

      <section className="page-main">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-lightBlue/25 blur-3xl" />
          <div className="absolute top-[180px] right-[-60px] h-[260px] w-[260px] rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="absolute bottom-[-100px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-lightBlue/20 blur-3xl" />
        </div>

        <div className="page-container relative">
          <div className="max-w-2xl">
            <div className="type-kicker">BSSE · heti verseny</div>

            <h1 className="mt-5 type-page-title">
              Csütörtöki
              <span className="type-page-title-accent">bajnokság</span>
            </h1>

            <p className="type-lead">
              Gyere le <span className="font-semibold text-brandDark">csütörtökönként</span> a
              csütörtöki bajnokságunkra, hogy pontokat szerezz — a szezon végén pedig{" "}
              <span className="font-semibold text-lightBlueStrong">nyeremény</span> vár a legjobbakra!
            </p>
          </div>

          <div className="mt-10">
            {loading && (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
                Betöltés...
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {!loading && !error && entries.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 text-slate-700 shadow-sm">
                Még nincs adat a ranglistán.
              </div>
            )}
          </div>

          {!loading && !error && entries.length > 0 && (
            <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_-30px_rgba(35,31,32,0.25)] backdrop-blur sm:p-6 lg:p-8">
              <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="type-section-title">Ranglista</h2>
                  <p className="type-section-desc">
                    Top 10 játékos csütörtöki pontok alapján.
                  </p>
                </div>
                <div className="rounded-full bg-primaryLight px-4 py-2 text-sm font-bold text-lightBlueStrong">
                  Élő sorrend
                </div>
              </div>

              <div className="flex items-end justify-center gap-2 md:gap-6 mb-10 px-2">
                <div className={PODIUM[0].order}>
                  <PodiumBlock
                    entry={top3[1]}
                    rank={2}
                    barClass={PODIUM[0].bar}
                    barToneClass={PODIUM[0].barTone}
                    label={PODIUM[0].label}
                    labelClass={PODIUM[0].labelClass}
                    usernameClass={PODIUM[0].usernameClass}
                    pointsClass={PODIUM[0].pointsClass}
                  />
                </div>
                <div className={PODIUM[1].order}>
                  <PodiumBlock
                    entry={top3[0]}
                    rank={1}
                    barClass={PODIUM[1].bar}
                    barToneClass={PODIUM[1].barTone}
                    label={PODIUM[1].label}
                    labelClass={PODIUM[1].labelClass}
                    usernameClass={PODIUM[1].usernameClass}
                    pointsClass={PODIUM[1].pointsClass}
                  />
                </div>
                <div className={PODIUM[2].order}>
                  <PodiumBlock
                    entry={top3[2]}
                    rank={3}
                    barClass={PODIUM[2].bar}
                    barToneClass={PODIUM[2].barTone}
                    label={PODIUM[2].label}
                    labelClass={PODIUM[2].labelClass}
                    usernameClass={PODIUM[2].usernameClass}
                    pointsClass={PODIUM[2].pointsClass}
                  />
                </div>
              </div>

              {rest.length > 0 ? (
                <ul className="space-y-2">
                  {rest.map((row, i) => (
                    <li
                      key={`${row.username}-${i + 4}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-sm font-extrabold tabular-nums text-slate-700 shrink-0">
                          {i + 4}
                        </span>
                        <span className="font-semibold text-brandDark truncate">
                          {row.username}
                        </span>
                      </div>
                      <span className="font-extrabold tabular-nums text-lightBlueStrong shrink-0">
                        {row.points} pt
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
