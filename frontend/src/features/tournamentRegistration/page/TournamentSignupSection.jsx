import React, { useEffect, useState } from "react";
import Header from "../../../components/Header.js";
import TournamentDetailsModal from "../components/TournamentDetailsModal.jsx";
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
import { isRegistrationDeadlinePassed } from "../utils/tournamentDates.js";


export default function TournamentSignupSection() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [detailsTournament, setDetailsTournament] = useState(null);

  const { user, isLoggedIn, isLocal } = useAuth();
  const userEmail = user?.email || "";
  const token = localStorage.getItem("token");

  const { myRegistrations, regByTournamentId, refreshMyRegistrations } =
    useTournamentRegistrations(token);

  const {
    selectedTournament,
    teamName,
    setTeamName,
    email,
    setEmail,
    telNumber,
    setTelNumber,
    companyName,
    setCompanyName,
    taxNumber,
    setTaxNumber,
    address,
    setAddress,
    billingName,
    setBillingName,
    players,
    updatePlayer,
    submitLoading,
    setSubmitLoading,
    submitMsg,
    setSubmitMsg,
    submitErr,
    setSubmitErr,
    activeRegistration,
    openForm,
    closeForm,
  } = useTournamentSignupForm({
    tournaments,
    regByTournamentId,
    myRegistrations,
    reloadTournamentData,
    refreshMyRegistrations,
    userEmail,
  });

  async function reloadTournamentData() {
    const data = await fetchPublicTournaments(token);
    setTournaments(Array.isArray(data) ? data : []);
  }

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
  }, [isLoggedIn, isLocal, token, refreshMyRegistrations]);

  async function onSubmit(e) {
    e.preventDefault();

    setSubmitMsg("");
    setSubmitErr("");

    const validationError = validateTournamentRegistrationForm({
      tournament: selectedTournament,
      telNumber,
      email,
      players,
      isLocal,
    });

    if (validationError) {
      setSubmitErr(validationError);
      return;
    }

    try {
      setSubmitLoading(true);

      const isEdit = Boolean(activeRegistration?.id);

      const response = await submitTournamentRegistration(
        {
          tournamentId: selectedTournament.id,
          teamName: teamName.trim() || null,
          telNumber: telNumber.trim(),
          contactEmail: email.trim(),
          billingName: billingName.trim(),
          companyName: companyName.trim() || null,
          taxNumber: taxNumber.trim() || null,
          address: address.trim(),
          players: players.map((p) => p.trim()),
        },
        token,
        isEdit ? activeRegistration.id : null
      );

      await reloadTournamentData();
      await refreshMyRegistrations();

      const status = String(
        response?.status ?? response?.registration_status ?? "CONFIRMED"
      ).toUpperCase();

      if (isEdit) {
        setSubmitMsg("Nevezés módosítva ✅");
      } else if (status === "WAITLISTED") {
        setSubmitMsg("Sikeres jelentkezés! Várólistára kerültél. ⏳");
      } else {
        setSubmitMsg("Sikeres nevezés! ✅");
      }

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
      await reloadTournamentData();
      await refreshMyRegistrations();

      const afterDeadline = isRegistrationDeadlinePassed(selectedTournament);

      const message = afterDeadline
        ? "Nevezés törölve. A nevezési határidő lejárt, ezért erre a versenyre már nem tudsz újra jelentkezni."
        : "Nevezés törölve 🗑️";

      setSubmitMsg(message);
      window.alert(message);
      closeForm();
    } catch (e) {
      setSubmitErr(e.message || "Szerver hiba törlés közben.");
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div className="page-root">
      <Header />

      <AuthFrostLock loggedIn={isLoggedIn}>
        <section className="page-main">
          {/* háttér díszítések */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-lightBlue/25 blur-3xl" />
            <div className="absolute top-[180px] right-[-60px] h-[260px] w-[260px] rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="absolute bottom-[-100px] left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-lightBlue/20 blur-3xl" />
          </div>

          <div className="page-container">
            {/* HERO */}
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="type-kicker">Versenynevezések</div>

                <h1 className="mt-5 type-page-title">
                  Jelentkezz a következő
                  <span className="type-page-title-accent">
                    strandröplabda versenyre
                  </span>
                </h1>

                <p className="type-lead">
                  Válaszd ki a számodra megfelelő versenyt, ellenőrizd a
                  nevezési adatokat, és pár kattintással add le a jelentkezést.
                </p>

                <div className="flex flex-wrap gap-3 mt-8">
                  <div className="px-4 py-3 bg-white border shadow-sm rounded-2xl border-slate-200">
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                      Elérhető versenyek
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-brandDark">
                      {tournaments.length}
                    </p>
                  </div>

                  <div className="px-4 py-3 bg-white border shadow-sm rounded-2xl border-slate-200">
                    <p className="text-xs font-semibold tracking-wide uppercase text-slate-500">
                      Saját nevezéseid
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-brandDark">
                      {myRegistrations?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-lightBlue/25 via-primaryLight/80 to-lightBlue/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-[0_30px_80px_-25px_rgba(35,31,32,0.28)]">
                  <img
                    src="/images/tournament_SMASH.jpg"
                    alt="SMASH tournament"
                    className="h-auto w-full rounded-[1.4rem] object-cover"
                  />
                </div>
              </div>
            </div>

            {/* STATE MESSAGES */}
            <div className="mt-10">
              {loading && (
                <div className="px-5 py-4 text-sm font-semibold bg-white border shadow-sm rounded-2xl border-slate-200 text-slate-700">
                  Betöltés...
                </div>
              )}

              {loadError && (
                <div className="px-5 py-4 text-sm font-bold text-red-700 border border-red-200 shadow-sm rounded-2xl bg-red-50">
                  {loadError}
                </div>
              )}

              {!loading && !loadError && tournaments.length === 0 && (
                <div className="px-5 py-5 bg-white border shadow-sm rounded-2xl border-slate-200 text-slate-700">
                  Jelenleg nincs aktív verseny.
                </div>
              )}
            </div>

            {/* TOURNAMENT LIST */}
            {!loading && !loadError && tournaments.length > 0 && (
              <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-[0_20px_60px_-30px_rgba(35,31,32,0.25)] backdrop-blur sm:p-6 lg:p-8">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="type-section-title">Aktív versenyek</h2>
                    <p className="type-section-desc">
                      Kattints a kiválasztott versenyre a nevezéshez vagy
                      módosításhoz.
                    </p>
                  </div>

                  <div className="hidden px-4 py-2 text-sm font-bold rounded-full bg-primaryLight text-lightBlueStrong md:block">
                    {tournaments.length} elérhető verseny
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {tournaments.map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      registration={regByTournamentId[tournament.id]}
                      isLocal={isLocal}
                      onOpen={openForm}
                      onOpenDetails={(item) =>
                        setDetailsTournament(item)
                      }
                    />
                  ))}
                </div>
              </div>
            )}
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
            companyName={companyName}
            setCompanyName={setCompanyName}
            taxNumber={taxNumber}
            setTaxNumber={setTaxNumber}
            address={address}
            setAddress={setAddress}
            billingName={billingName}
            setBillingName={setBillingName}
            players={players}
            updatePlayer={updatePlayer}
          />

          <TournamentDetailsModal
            tournament={detailsTournament}
            registration={
              detailsTournament ? regByTournamentId[detailsTournament.id] : null
            }
            isLocal={isLocal}
            isOpen={Boolean(detailsTournament)}
            onClose={() => setDetailsTournament(null)}
            onRegister={openForm}
          />
        </section>
      </AuthFrostLock>
    </div>
  );
}