import React from "react";
import TournamentFormFields from "./TournamentFormFields.jsx";
import TournamentPlayersFields from "./TournamentPlayersFields.jsx";
import {
  formatDateTime,
  getTournamentStart,
  isTournamentFull,
} from "../utils/tournamentDates.js";

export default function TournamentModal({
  selectedTournament,
  closeForm,
  onSubmit,
  activeRegistration,
  submitLoading,
  submitErr,
  submitMsg,
  onDeleteRegistration,
  teamName,
  setTeamName,
  email,
  setEmail,
  telNumber,
  setTelNumber,
  players,
  updatePlayer,
}) {
  if (!selectedTournament) return null;

  const startIso = getTournamentStart(selectedTournament);
  const willBeWaitlisted = !activeRegistration?.id && isTournamentFull(selectedTournament);

  return (
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
        <div className="bg-lightBlue px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold text-white truncate">
                Jelentkezés: {selectedTournament.title}
              </h3>

              <p className="mt-1 text-sm text-white/90">
                {startIso ? formatDateTime(startIso) : "Kezdés nincs megadva"} •{" "}
                {selectedTournament.team_size} fő/csapat
              </p>
            </div>

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
            <TournamentFormFields
              teamName={teamName}
              setTeamName={setTeamName}
              email={email}
              setEmail={setEmail}
              telNumber={telNumber}
              setTelNumber={setTelNumber}
            />

            <TournamentPlayersFields
              teamSize={selectedTournament.team_size}
              players={players}
              updatePlayer={updatePlayer}
            />

            {willBeWaitlisted && (
              <div className="p-3 text-sm font-extrabold border border-amber-200 rounded-2xl bg-amber-50 text-amber-800">
                A verseny elérte a maximum csapatszámot, ezért a jelentkezésed
                várólistára fog kerülni.
              </div>
            )}

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
                className="w-full rounded-2xl bg-yellow px-4 py-3 text-sm font-extrabold text-blackSoft shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-lightBlue/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLoading
                  ? "Mentés..."
                  : activeRegistration?.id
                  ? "Módosítás mentése"
                  : willBeWaitlisted
                  ? "Várólistára jelentkezem"
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
              Ha 401/403 hibát kapsz, a nevezéshez be kell jelentkezni.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}