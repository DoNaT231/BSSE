import React, { useEffect, useState } from "react";
import Header from "../../../components/Header.js";
import AuthFrostLock from "../../../components/AuthLock.js";
import { useAuth } from "../../../contexts/AuthContext.js";

import {
  fetchPublicTournaments,
  submitTournamentRegistration,
  deleteTournamentRegistration,
} from "../api/tournamentRegistrationPublicApi.js";

import TournamentCard from "../components/TournamentCard.jsx";
import TournamentModal from "../components/TournamentModal.jsx";
import useTournamentRegistrations from "../hooks/useTournamenRegistrations.js";
import useTournamentSignupForm from "../hooks/useTournamentSignupForm.js";
import { validateTournamentRegistrationForm } from "../utils/tournamentValidation.js";

export default function TournamentSignupSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const { user, isLoggedIn } = useAuth();
  const userEmail = user?.email || "";
  const token = localStorage.getItem("token");

  const {
    regByTournamentId,
    refreshMyRegistrations,
  } = useTournamentRegistrations(token);

  const {
    selectedTournament,
    teamName,
    setTeamName,
    email,
    setEmail,
    telNumber,
    setTelNumber,
    players,
    updatePlayer,
    submitLoading,
    setSubmitLoading,
    submitMsg,
    setSubmitMsg,
    submitErr,
    setSubmitErr,
    activeRegistration,
    setActiveRegistration,
    openForm,
    closeForm,
  } = useTournamentSignupForm({
    tournaments,
    regByTournamentId,
    userEmail,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError("");

        const data = await fetchPublicTournaments(token);
        if (mounted) {
          setTournaments(Array.isArray(data) ? data : []);
        }

        if (mounted && isLoggedIn) {
          await refreshMyRegistrations();
        }
      } catch (e) {
        if (mounted) {
          setLoadError(e.message || "Ismeretlen hiba.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, token, refreshMyRegistrations]);

  async function onSubmit(e) {
    e.preventDefault();

    setSubmitMsg("");
    setSubmitErr("");

    const validationError = validateTournamentRegistrationForm({
      tournament: selectedTournament,
      telNumber,
      email,
      players,
    });

    if (validationError) {
      setSubmitErr(validationError);
      return;
    }

    try {
      setSubmitLoading(true);

      const isEdit = Boolean(activeRegistration?.id);

      await submitTournamentRegistration(
        {
          tournamentId: selectedTournament.id,
          teamName: teamName.trim() || null,
          telNumber: telNumber.trim(),
          contactEmail: email.trim(),
          players: players.map((p) => p.trim()),
        },
        token,
        isEdit ? activeRegistration.id : null
      );

      await refreshMyRegistrations();

      setSubmitMsg(isEdit ? "Nevezés módosítva ✅" : "Sikeres nevezés! ✅");
      closeForm();
    } catch (err) {
      setSubmitErr(err.message || "Szerver hiba nevezés közben.");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function onDeleteRegistration() {
    if (!activeRegistration?.id) return;

    try {
      setSubmitLoading(true);
      setSubmitErr("");
      setSubmitMsg("");

      await deleteTournamentRegistration(activeRegistration.id, token);
      await refreshMyRegistrations();

      setSubmitMsg("Nevezés törölve 🗑️");
      closeForm();
    } catch (e) {
      setSubmitErr(e.message || "Szerver hiba törlés közben.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#e9f6ff]">
      <Header />

      <AuthFrostLock loggedIn={isLoggedIn}>
        <section className="w-full max-w-6xl px-4 pt-32 pb-12 mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900">
              Versenyek
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-700/80">
              Válassz versenyt, majd töltsd ki a jelentkezést.
            </p>
          </div>

          <div className="mt-8 rounded-3xl overflow-hidden shadow-[0_12px_30px_-18px_rgba(2,65,99,0.35)] border border-white/60">
            <div className="bg-[#5fc3ee] px-6 pt-8 pb-6">
              <div className="px-4 py-2 mx-auto text-xs font-extrabold tracking-wide text-white rounded-full w-fit bg-white/25">
                NEVEZÉSEK
              </div>

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

              <div className="grid grid-cols-1 gap-5 mt-6 md:grid-cols-2 xl:grid-cols-3">
                {tournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    registration={regByTournamentId[tournament.id]}
                    onOpen={openForm}
                  />
                ))}
              </div>
            </div>

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

          <TournamentModal
            selectedTournament={selectedTournament}
            closeForm={closeForm}
            onSubmit={onSubmit}
            activeRegistration={activeRegistration}
            submitLoading={submitLoading}
            submitErr={submitErr}
            submitMsg={submitMsg}
            onDeleteRegistration={onDeleteRegistration}
            teamName={teamName}
            setTeamName={setTeamName}
            email={email}
            setEmail={setEmail}
            telNumber={telNumber}
            setTelNumber={setTelNumber}
            players={players}
            updatePlayer={updatePlayer}
          />
        </section>
      </AuthFrostLock>
    </div>
  );
}