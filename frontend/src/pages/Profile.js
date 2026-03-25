import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../contexts/AuthContext";
import Header from "../components/Header";
import AuthFrostLock from "../components/AuthLock";
import fetchCourts from "../features/booking/api/CourtsApi";
import { apiGetOwnWeeklyReservations } from "../features/booking/api/reservations.api";
import { getMondayFromOffset } from "../features/booking/utils/reservationDate.utils";
import { API_BASE_URL } from "../config";
import { fetchPublicTournaments } from "../features/tournamentRegistration/api/tournamentRegistrationPublicApi";
import useTournamentRegistrations from "../features/tournamentRegistration/hooks/useTournamenRegistrations";
import SetPasswordModal from "../features/auth/components/SetPasswordModal";
import ChangePasswordModal from "../features/auth/components/ChangePasswordModal";

function formatSlot(slot) {
  const start = dayjs(slot.startTime);
  const end = dayjs(slot.endTime);

  if (!start.isValid() || !end.isValid()) return "Ismeretlen időpont";

  return `${start.format("YYYY-MM-DD")} • ${start.format("HH:mm")} - ${end.format("HH:mm")}`;
}

export default function Profile() {
  const { user, isLoggedIn } = useAuth();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [isSetPasswordOpen, setIsSetPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState("");

  // -----------------------------
  // Saját foglalások
  // -----------------------------
  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = ez a hét, 1 = jövő hét
  const monday = useMemo(() => getMondayFromOffset(weekOffset), [weekOffset]);

  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState("");
  const [reservations, setReservations] = useState([]);

  // -----------------------------
  // Saját nevezések
  // -----------------------------
  const [tournaments, setTournaments] = useState([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsError, setTournamentsError] = useState("");

  const { myRegistrations, refreshMyRegistrations } = useTournamentRegistrations(token);

  useEffect(() => {
    if (!isLoggedIn) return;

    // csak megjelenítéshez kell, módosítás nincs ebben a profilban
    refreshMyRegistrations().catch(() => {});
  }, [isLoggedIn, refreshMyRegistrations]);

  // Load profile
  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;

    (async () => {
      try {
        setProfileLoading(true);
        setProfileError("");

        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || "A profil betöltése sikertelen.");
        }

        if (mounted) setProfile(data);
      } catch (e) {
        if (mounted) setProfileError(e.message || "A profil betöltése sikertelen.");
      } finally {
        if (mounted) setProfileLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, token]);

  const hasPassword = Boolean(profile?.passwordHashed);

  useEffect(() => {
    // Ha már van jelszó, ne maradhasson nyitva a "beállítás" modal.
    if (hasPassword) setIsSetPasswordOpen(false);
  }, [hasPassword]);

  // Load courts
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchCourts();
        if (!mounted) return;

        const nextCourts = Array.isArray(data) ? data : [];
        setCourts(nextCourts);

        if (nextCourts.length && selectedCourtId == null) {
          setSelectedCourtId(Number(nextCourts[0].id));
        }
      } catch {
        // Nem állítunk hibát, csak listát.
        if (mounted) setCourts([]);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load own reservations for selected court + week
  useEffect(() => {
    if (!isLoggedIn) return;
    if (!selectedCourtId) return;

    let mounted = true;

    (async () => {
      try {
        setReservationsLoading(true);
        setReservationsError("");

        const data = await apiGetOwnWeeklyReservations({
          monday,
          courtId: Number(selectedCourtId),
          token,
        });

        if (mounted) setReservations(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setReservationsError(e.message || "Hiba történt a foglalások betöltésekor.");
      } finally {
        if (mounted) setReservationsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, selectedCourtId, monday, token]);

  // Load tournaments (for display)
  useEffect(() => {
    if (!isLoggedIn) return;

    let mounted = true;

    (async () => {
      try {
        setTournamentsLoading(true);
        setTournamentsError("");

        const data = await fetchPublicTournaments(token);
        if (!mounted) return;

        setTournaments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setTournamentsError(e.message || "Hiba történt a versenyek betöltésekor.");
      } finally {
        if (mounted) setTournamentsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, token]);

  const selectedCourt = courts.find((c) => Number(c.id) === Number(selectedCourtId));

  return (
    <div className="min-h-screen bg-[#e9f6ff]">
      <Header />

      <AuthFrostLock>
        <div className="max-w-6xl px-4 pt-32 pb-16 mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <section className="md:col-span-1 bg-white shadow rounded-2xl p-6 border border-white/60">
              <h2 className="text-2xl font-extrabold">Profil</h2>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                {profileLoading ? (
                  <p className="text-slate-500">Betöltés...</p>
                ) : profileError ? (
                  <p className="text-red-600 font-semibold">{profileError}</p>
                ) : profile ? (
                  <>
                    <p>
                      <span className="font-semibold">Név:</span> {profile.username ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {profile.email ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Szerepkör:</span> {profile.user_type ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Telefon:</span> {profile.phone ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Lakóhely:</span>{" "}
                      {profile.is_local ? "Balatonalmádi" : "Nem Balatonalmádi"}
                    </p>
                  </>
                ) : (
                  <p className="text-slate-500">Nincs profil adat.</p>
                )}
              </div>

              <div className="mt-6">
                {profileLoading ? null : hasPassword ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      Mivel már van jelszavad, itt tudod megváltoztatni:
                    </p>
                    <button
                      onClick={() => {
                        setPasswordSuccessMsg("");
                        setIsChangePasswordOpen(true);
                      }}
                      className="w-full px-4 py-3 text-sm font-extrabold text-white bg-black rounded-xl hover:opacity-90"
                    >
                      Jelszó csere
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">
                      A fiókodhoz még nincs jelszó beállítva. Állíts be újat:
                    </p>
                    <button
                      onClick={() => {
                        setPasswordSuccessMsg("");
                        setIsSetPasswordOpen(true);
                      }}
                      className="w-full px-4 py-3 text-sm font-extrabold text-white bg-black rounded-xl hover:opacity-90"
                    >
                      Jelszó beállítása
                    </button>
                  </div>
                )}
                {passwordSuccessMsg ? (
                  <p className="mt-3 text-sm text-emerald-700 font-semibold">
                    {passwordSuccessMsg}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="md:col-span-2 bg-white shadow rounded-2xl p-6 border border-white/60">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold">Saját foglalásaim</h3>

                  <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="w-full md:w-64">
                      <label className="block text-sm font-semibold text-slate-700">Pálya</label>
                      <select
                        value={selectedCourtId ?? ""}
                        onChange={(e) => setSelectedCourtId(Number(e.target.value))}
                        className="w-full px-3 py-2 mt-1 border rounded-lg"
                      >
                        {courts.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name ?? `Pálya ${c.id}`}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full md:w-64">
                      <label className="block text-sm font-semibold text-slate-700">Hét</label>
                      <select
                        value={weekOffset}
                        onChange={(e) => setWeekOffset(Number(e.target.value))}
                        className="w-full px-3 py-2 mt-1 border rounded-lg"
                      >
                        <option value={0}>Ez a hét</option>
                        <option value={1}>Jövő hét</option>
                      </select>
                    </div>
                  </div>

                  {reservationsLoading ? (
                    <p className="mt-4 text-slate-500">Foglalások betöltése...</p>
                  ) : reservationsError ? (
                    <p className="mt-4 text-red-600 font-semibold">{reservationsError}</p>
                  ) : (
                    <div className="mt-4">
                      {reservations.length === 0 ? (
                        <p className="text-slate-600">
                          Nincsenek foglalásaid{" "}
                          {selectedCourt?.name ? `a(z) ${selectedCourt.name} pályán` : "a kiválasztott pályán"}{" "}
                          ebben a hétben.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {reservations.map((slot) => (
                            <div
                              key={slot.slotId}
                              className="flex items-start justify-between gap-4 p-4 border rounded-xl bg-slate-50/50"
                            >
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {formatSlot(slot)}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                  Status: {slot.slotStatus ?? "-"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <h3 className="text-xl font-extrabold">Saját nevezéseim</h3>

                  {tournamentsLoading ? (
                    <p className="mt-4 text-slate-500">Versenyek betöltése...</p>
                  ) : tournamentsError ? (
                    <p className="mt-4 text-red-600 font-semibold">{tournamentsError}</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {myRegistrations.length === 0 ? (
                        <p className="text-slate-600">Nincs még nevezésed.</p>
                      ) : (
                        myRegistrations.map((reg) => {
                          const tournament = tournaments.find(
                            (t) => Number(t.id) === Number(reg.tournamentId ?? reg.tournament_id)
                          );

                          return (
                            <div
                              key={reg.id}
                              className="p-4 border rounded-xl bg-slate-50/50"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="font-extrabold text-slate-900 truncate">
                                    {tournament?.title ?? `Verseny #${reg.tournamentId ?? "-"}`}
                                  </p>
                                  <p className="text-sm text-slate-700 mt-1">
                                    Csapat: {reg.teamName ?? "-"}
                                  </p>
                                  <p className="text-sm text-slate-700 mt-1">
                                    Email: {reg.contactEmail ?? "-"}
                                  </p>
                                  <p className="text-sm text-slate-700 mt-1">
                                    Telefonszám: {reg.telNumber ?? "-"}
                                  </p>
                                </div>
                                <div className="text-xs text-slate-500 shrink-0">
                                  {reg.createdAt ? dayjs(reg.createdAt).format("YYYY-MM-DD") : ""}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </AuthFrostLock>

      <SetPasswordModal
        isOpen={isSetPasswordOpen}
        onClose={() => setIsSetPasswordOpen(false)}
        onSuccess={(message) => {
          setPasswordSuccessMsg(message);
          setIsSetPasswordOpen(false);
        }}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={(message) => {
          setPasswordSuccessMsg(message);
          setIsChangePasswordOpen(false);
        }}
      />
    </div>
  );
}

