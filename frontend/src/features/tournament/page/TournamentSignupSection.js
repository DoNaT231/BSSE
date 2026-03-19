import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../../config.js";
import { useAuth } from "../../../contexts/AuthContext.js";
import Header from "../../../components/Header.js";
import AuthFrostLock from "../../../components/AuthLock.js";
/**
 * TournamentSignupSection (Tailwind)
 * ------------------------------------------------------------
 * - GET /api/tournaments  -> aktív versenyek listája
 * - POST /api/tournament-registrations -> nevezés (authMiddleware!)
 *
 * Dinamikus játékos mezők:
 * - players[] hossza = tournament.number_of_players
 *
 * Auth:
 * - cookie alap: credentials: "include"
 * - ha bearer token kell nálad, szólj és átírom.
 */


function formatDateTime(iso) {
  if (!iso) return "Nincs megadva";
  const d = new Date(iso);
  return d.toLocaleString("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/60"
      />
    </label>
  );
}

export default function TournamentSignupSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { userId, userEmail, loggedIn, token } = useAuth()

  const [openTournamentId, setOpenTournamentId] = useState(null);

  // form state
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState(userEmail);
  const [telNumber, setTelNumber] = useState("");
  const [players, setPlayers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [myRegistrations, setMyRegistrations] = useState([]); // lista
  const [regByTournamentId, setRegByTournamentId] = useState({}); // gyors lookup: { [tournamentId]: registration }
  const [activeRegistration, setActiveRegistration] = useState(null); // épp szerkesztett nevezés (ha van)

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.id === openTournamentId) || null,
    [tournaments, openTournamentId]
  );

  function getTournamentStart(t) {
    if (!t?.slots || !Array.isArray(t.slots) || t.slots.length === 0) return null;
    const dates = t.slots
      .map((s) => new Date(s.startTime))
      .filter((d) => !Number.isNaN(d.getTime()));
    if (dates.length === 0) return null;
    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    return min.toISOString();
  }


  useEffect(() => {
    console.log("us" + userEmail)
  if (loggedIn && userEmail) setEmail(userEmail);
  }, [loggedIn, userEmail]);
  // players mezők beállítása number_of_players alapján
  useEffect(() => {
    if (!selectedTournament) return;

    const n = Number(selectedTournament.team_size ?? 0);
    const safeN = Number.isFinite(n) && n > 0 ? n : 0;

    setPlayers((prev) => Array.from({ length: safeN }, (_, i) => prev[i] ?? ""));
    setSubmitMsg("");
    setSubmitErr("");
  }, [selectedTournament]);

  // tournaments betöltés
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError("");

        const res = await fetch(`${API_BASE_URL}/api/tournaments`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) {
          const data = await safeJson(res);
          throw new Error(data?.message || `Hiba a versenyek lekérésekor (${res.status})`);
        }

        const data = await res.json();
        if (mounted) setTournaments(Array.isArray(data) ? data : []);

        if (mounted) await fetchMyRegistrations();
      } catch (e) {
        if (mounted) setLoadError(e.message || "Ismeretlen hiba.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loggedIn]);

  async function onDeleteRegistration() {
    if (!activeRegistration?.id) return;

    try {
      setSubmitLoading(true);
      setSubmitErr("");
      setSubmitMsg("");

      const res = await fetch(
        `${API_BASE_URL}/api/tournament-registrations/${activeRegistration.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || `Törlés sikertelen (${res.status})`);

      setSubmitMsg("Nevezés törölve 🗑️");
      setActiveRegistration(null);

      await fetchMyRegistrations();

      // UI reset
      setTeamName("");
      setTelNumber("");
      setPlayers([]);
    } catch (e) {
      setSubmitErr(e.message || "Szerver hiba törlés közben.");
    } finally {
      setSubmitLoading(false);
    }
    closeForm()
  }

  async function fetchMyRegistrations() {
  const res = await fetch(`${API_BASE_URL}/api/tournament-registrations/my`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || `Nevezések lekérése sikertelen (${res.status})`);

  const list = Array.isArray(data) ? data : [];
  setMyRegistrations(list);

  const map = {};
  for (const r of list) {
    // várjuk: r.tournament_id
    map[r.tournament_id] = r;
  }
  setRegByTournamentId(map);
}

  function openForm(tournamentId) {
    setOpenTournamentId(tournamentId);

    const existing = regByTournamentId[tournamentId] || null;
    setActiveRegistration(existing);

    if (existing) {
      setTeamName(existing.team_name || "");
      setTelNumber(existing.tel_number || "");
      setPlayers(Array.isArray(existing.players) ? existing.players : []);
    } else {
      setTeamName("");
      setTelNumber("");
      setPlayers([]);
    }

    setSubmitMsg("");
    setSubmitErr("");
  }

  function closeForm() {
    setOpenTournamentId(null);
    setTeamName("");
    setTelNumber("");
    setEmail(userEmail || "")
    setPlayers([]);
    setSubmitLoading(false);
    setSubmitMsg("");
    setSubmitErr("");
  }

  function updatePlayer(i, value) {
    setPlayers((prev) => {
      const next = [...prev];
      next[i] = value;
      return next;
    });
  }

  function validate() {
    if (!selectedTournament) return "Nincs kiválasztott verseny.";
    if (!telNumber.trim()) return "A telefonszám kötelező.";

    const required = Number(selectedTournament.team_size ?? 0);
    if (Number.isFinite(required) && required > 0) {
      if (!Array.isArray(players) || players.length !== required) {
        return `Pontosan ${required} játékos nevet kell megadni.`;
      }
      if (players.some((p) => !String(p || "").trim())) {
        return "Minden játékos mezőt tölts ki (név).";
      }
    }
    return "";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitMsg("");
    setSubmitErr("");

    const v = validate();
    if (v) {
      setSubmitErr(v);
      return;
    }

    try {
      setSubmitLoading(true);

      const payload = {
        tournament_id: selectedTournament.id,
        team_name: teamName.trim() || null,
        user_id: userId,
        tel_number: telNumber.trim(),
        contact_email: email.trim(),
        players: players.map((p) => p.trim()),
      };
      console.log("payload: ",payload)

      const isEdit = Boolean(activeRegistration?.id);

      const url = isEdit
        ? `${API_BASE_URL}/api/tournament-registrations/${activeRegistration.id}`
        : `${API_BASE_URL}/api/tournament-registrations`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data?.message || `Sikertelen mentés (${res.status})`);

      setSubmitMsg(isEdit ? "Nevezés módosítva ✅" : "Sikeres nevezés! ✅");

      // ✅ frissítsük a saját nevezéseket, hogy a kártyákon is látszódjon
      await fetchMyRegistrations();

      // opcionális: maradjon nyitva a modal, de most már edit módban legyen
      const updated = isEdit ? { ...activeRegistration, ...payload } : null;
      setActiveRegistration(updated || regByTournamentId[selectedTournament.id] || null);
    } catch (err) {
      setSubmitErr(err.message || "Szerver hiba nevezés közben.");
    } finally {
      setSubmitLoading(false);
    }
    closeForm()
  }


  return (
  <div className="min-h-screen bg-[#e9f6ff]">
    <Header />
    <AuthFrostLock
          loggedIn={loggedIn}
    >
    {/* Top spacing under fixed header if needed */}
    <section className="w-full max-w-6xl px-4 pt-32 pb-12 mx-auto">
      {/* Section header (centered like the screenshot) */}
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900">
          Versenyek
        </h2>
        <p className="mt-2 text-sm md:text-base text-slate-700/80">
          Válassz versenyt, majd töltsd ki a jelentkezést.
        </p>
      </div>

      {/* Blue block background with wave separator */}
      <div className="mt-8 rounded-3xl overflow-hidden shadow-[0_12px_30px_-18px_rgba(2,65,99,0.35)] border border-white/60">
        <div className="bg-[#5fc3ee] px-6 pt-8 pb-6">
          {/* Small “section pill” like in screenshot */}
          <div className="px-4 py-2 mx-auto text-xs font-extrabold tracking-wide text-white rounded-full w-fit bg-white/25">
            NEVEZÉSEK
          </div>

          {/* Loading / errors */}
          <div className="mt-5">
            {loading && (
              <p className="font-semibold text-white/90">Betöltés...</p>
            )}
            {loadError && (
              <p className="inline-block px-4 py-3 font-extrabold text-white bg-red-500/90 rounded-2xl">
                {loadError}
              </p>
            )}

            {!loading && !loadError && tournaments.length === 0 && (
              <div className="p-5 shadow-sm bg-white/95 rounded-2xl text-slate-800">
                Jelenleg nincs aktív verseny.
              </div>
            )}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 mt-6 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((t) => {
              const alreadyRegistered = Boolean(regByTournamentId?.[t.id]?.id);
              const startIso = getTournamentStart(t);

              return (
                <div
                  key={t.id}
                  className="group relative rounded-3xl bg-white/95 border border-white/60 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(15,23,42,0.55)]"
                >

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold truncate text-slate-900">
                          {t.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {startIso ? `Kezdés: ${formatDateTime(startIso)}` : "Kezdés: nincs megadva"}
                        </p>
                      </div>

                      {t.team_size != null && (
                        <div className="px-3 py-1 text-xs font-extrabold border shrink-0 rounded-2xl bg-slate-50 border-slate-200 text-slate-700">
                          {t.team_size} fő/csapat
                        </div>
                      )}
                    </div>

                    {t.description && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-700 line-clamp-4">
                        {t.description}
                      </p>
                    )}

                    {t.entry_fee !== null && t.entry_fee !== undefined && (
                      <p className="mt-3 text-sm leading-relaxed text-slate-700 line-clamp-4">
                        Nevezési díj:{" "}
                        {Number(t.entry_fee) === 0
                          ? "ingyenes"
                          : `${t.entry_fee} Ft`}
                      </p>
                    )}

                    {/* Status badge */}
                    {alreadyRegistered && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 text-xs font-extrabold border rounded-full bg-emerald-50 border-emerald-200 text-emerald-700">
                        ✅ Már nevezve
                      </div>
                    )}

                    <button
                      onClick={() => openForm(t.id)}
                      className="mt-4 w-full rounded-2xl bg-[#f7b23b] px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-orange-200/70"
                    >
                      {alreadyRegistered ? "Nevezés módosítása" : "Jelentkezés"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wave separator (SVG) */}
        <div className="bg-[#e9f6ff]">
          <svg
            viewBox="0 0 1440 120"
            className="block w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,64L60,69.3C120,75,240,85,360,80C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,120L1380,120C1320,120,1200,120,1080,120C960,120,840,120,720,120C600,120,480,120,360,120C240,120,120,120,60,120L0,120Z"
              fill="#5fc3ee"
              fillOpacity="0.35"
            />
          </svg>
        </div>
      </div>

      {/* Modal */}
      {selectedTournament && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeForm}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_-40px_rgba(0,0,0,0.55)] border border-white/60"
          >
            {/* Modal top bar */}
            <div className="bg-[#5fc3ee] px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-white truncate">
                    Jelentkezés: {selectedTournament.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/90">
                    {selectedTournament.category} • {formatDateTime(selectedTournament.start_at)} •{" "}
                    {selectedTournament.number_of_players} fő/csapat
                  </p>
                </div>
do 
                <button
                  onClick={closeForm}
                  className="px-3 py-2 text-sm font-extrabold text-white transition shrink-0 rounded-2xl bg-white/20 hover:bg-white/25 focus:outline-none focus:ring-4 focus:ring-white/30"
                  aria-label="Bezárás"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field
                    label="Csapatnév"
                    value={teamName}
                    onChange={setTeamName}
                    placeholder="pl. SMASH Duo"
                  />
                  <Field
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    placeholder="pl. valaki@gmail.com"
                  />
                  <Field
                    label="Telefonszám *"
                    value={telNumber}
                    onChange={setTelNumber}
                    placeholder="pl. +36 30 123 4567"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-extrabold text-slate-900">
                    Játékosok ({selectedTournament.team_size} fő) *
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {players.map((p, i) => (
                      <Field
                        key={i}
                        label={`Játékos ${i + 1}`}
                        value={p}
                        onChange={(v) => updatePlayer(i, v)}
                        placeholder="Teljes név"
                        required
                      />
                    ))}
                  </div>
                </div>

                {submitErr && (
                  <div className="p-3 text-sm font-extrabold text-red-700 border border-red-200 rounded-2xl bg-red-50">
                    {submitErr}
                  </div>
                )}
                {submitMsg && (
                  <div className="p-3 text-sm font-extrabold border rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-700">
                    {submitMsg}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full rounded-2xl bg-[#f7b23b] px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-orange-200/70 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading
                    ? "Mentés..."
                    : activeRegistration?.id
                      ? "Módosítás mentése"
                      : "Jelentkezés elküldése"}
                </button>

                {activeRegistration?.id && (
                  <button
                    type="button"
                    onClick={onDeleteRegistration}
                    disabled={submitLoading}
                    className="w-full px-4 py-3 text-sm font-extrabold text-red-700 transition border border-red-200 shadow-sm rounded-2xl bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitLoading ? "Törlés..." : "Nevezés törlése"}
                  </button>
                )}

                </div>
                <p className="text-xs text-slate-500">
                  Ha 401/403 hibát kapsz, a nevezéshez be kell jelentkezni (authMiddleware).
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
    </AuthFrostLock>
  </div>
);

}
