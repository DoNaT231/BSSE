import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";
import { useAuth } from "../AuthContext";
import Header from "../components/Header";

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

  const token = localStorage.getItem('token');
  const { userId, userEmail } = useAuth()

  const [openTournamentId, setOpenTournamentId] = useState(null);

  // form state
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
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

  // players mezők beállítása number_of_players alapján
  useEffect(() => {
    if (!selectedTournament) return;

    const n = Number(selectedTournament.number_of_players ?? 0);
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
  }, []);

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

    const required = Number(selectedTournament.number_of_players ?? 0);
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
        players: players.map((p) => p.trim()),
      };

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
  }


  return (
    <div>
      <Header />
      <section className="w-full max-w-6xl px-4 py-10 mx-auto mt-24">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            Versenyek
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Válassz versenyt, majd töltsd ki a jelentkezést.
          </p>
        </div>

        {loading && <p className="text-slate-600">Betöltés...</p>}
        {loadError && <p className="font-semibold text-red-600">{loadError}</p>}

        {!loading && !loadError && tournaments.length === 0 && (
          <div className="p-5 bg-white border shadow-sm rounded-2xl border-slate-200 text-slate-700">
            Jelenleg nincs aktív verseny.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tournaments.map((t) => {
               const alreadyRegistered = Boolean(regByTournamentId[t.id]?.id);
               return(<div
              key={t.id}
              className="p-5 transition bg-white border shadow-sm rounded-2xl border-slate-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold truncate text-slate-900">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {t.category} • {formatDateTime(t.start_at)}
                  </p>
                </div>

                <div className="px-3 py-1 text-xs font-bold border shrink-0 rounded-xl border-slate-200 bg-slate-50 text-slate-700">
                  {t.number_of_players} fő/csapat
                </div>
              </div>

              {t.description && (
                <p className="mt-3 text-sm leading-relaxed line-clamp-4 text-slate-700">
                  {t.description}
                </p>
              )}
            
              <button
                onClick={() => openForm(t.id)}
                className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60"
              >
                {alreadyRegistered ? "Nevezés módosítása" : "Jelentkezés"}
              </button>
              
            </div>)
        })}
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
              className="w-full max-w-2xl p-5 bg-white border shadow-xl rounded-2xl border-slate-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold truncate text-slate-900">
                    Jelentkezés: {selectedTournament.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedTournament.category} • {formatDateTime(selectedTournament.start_at)} •{" "}
                    {selectedTournament.number_of_players} fő/csapat
                  </p>
                </div>

                <button
                  onClick={closeForm}
                  className="px-3 py-2 text-sm font-extrabold transition bg-white border shadow-sm shrink-0 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200/60"
                  aria-label="Bezárás"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSubmit} className="mt-5 space-y-4">
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
                    Játékosok ({selectedTournament.number_of_players} fő) *
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
                  <div className="p-3 text-sm font-bold text-red-700 border border-red-200 rounded-xl bg-red-50">
                    {submitErr}
                  </div>
                )}
                {submitMsg && (
                  <div className="p-3 text-sm font-bold border rounded-xl border-emerald-200 bg-emerald-50 text-emerald-700">
                    {submitMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full px-4 py-3 text-sm font-extrabold text-white transition border shadow-sm rounded-xl border-slate-200 bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLoading ? "Mentés..." : activeRegistration?.id ? "Módosítás mentése" : "Jelentkezés elküldése"}
                </button>

                {activeRegistration?.id && (
                  <button
                    type="button"
                    onClick={onDeleteRegistration}
                    disabled={submitLoading}
                    className="w-full px-4 py-3 text-sm font-extrabold text-red-700 transition border border-red-200 shadow-sm rounded-xl bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-200/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitLoading ? "Törlés..." : "Nevezés törlése"}
                  </button>
                )}

                <p className="text-xs text-slate-500">
                  Ha 401/403 hibát kapsz, a nevezéshez be kell jelentkezni (authMiddleware).
                </p>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
