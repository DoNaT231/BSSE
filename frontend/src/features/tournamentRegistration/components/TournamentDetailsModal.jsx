import React from "react";
import {
  formatDateTime,
  getTournamentStart,
  canRegisterToTournament,
  isTournamentFull,
} from "../utils/tournamentDates.js";

export default function TournamentDetailsModal({
  tournament,
  registration,
  isOpen,
  onClose,
  onRegister,
}) {
  if (!isOpen || !tournament) return null;

  const alreadyRegistered = Boolean(registration?.id);
  const startIso = getTournamentStart(tournament);
  const canRegister = canRegisterToTournament(tournament);
  const isFull = isTournamentFull(tournament);

  const registrationDeadline =
    tournament?.registration_deadline ??
    tournament?.registrationDeadline ??
    null;

  const maxTeams = Number(tournament?.max_teams ?? tournament?.maxTeams);
  const registeredTeams = Number(
    tournament?.registered_teams ??
      tournament?.registeredTeams ??
      tournament?.registration_count ??
      tournament?.registrationCount ??
      0
  );

  const entryFee =
    tournament?.entry_fee !== null && tournament?.entry_fee !== undefined
      ? Number(tournament.entry_fee) === 0
        ? "Ingyenes"
        : `${tournament.entry_fee} Ft`
      : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-brandDark/55 p-4 pt-[100px] overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-[0_40px_100px_-30px_rgba(35,31,32,0.45)] max-h-[calc(100vh-110px)] flex flex-col">
        <div className="bg-gradient-to-r from-lightBlueStrong via-lightBlue to-lightBlue px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                Verseny részletei
              </p>
              <h3 className="mt-2 text-2xl font-extrabold tracking-tight">
                {tournament.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/15 px-3 py-2 text-sm font-bold text-white transition hover:bg-white/25"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Kezdés
              </p>
              <p className="mt-2 text-base font-bold text-brandDark">
                {startIso ? formatDateTime(startIso) : "Nincs megadva"}
              </p>
            </div>

            {registrationDeadline && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nevezési határidő
                </p>
                <p className="mt-2 text-base font-bold text-brandDark">
                  {formatDateTime(registrationDeadline)}
                </p>
              </div>
            )}

            {tournament.team_size != null && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Csapatlétszám
                </p>
                <p className="mt-2 text-base font-bold text-brandDark">
                  {tournament.team_size} fő/csapat
                </p>
              </div>
            )}

            {entryFee && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Nevezési díj
                </p>
                <p className="mt-2 text-base font-bold text-brandDark">
                  {entryFee}
                </p>
              </div>
            )}

            {Number.isFinite(maxTeams) && maxTeams > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Jelentkezések
                </p>
                <p className="mt-2 text-base font-bold text-brandDark">
                  {registeredTeams}/{maxTeams} csapat
                </p>
              </div>
            )}
          </div>

          {tournament.description && (
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-slate-500">
                Leírás
              </h4>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">
                {tournament.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            Bezárás
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onRegister?.(tournament.id);
            }}
            disabled={!alreadyRegistered && !canRegister}
            className="rounded-xl px-5 py-3 text-sm font-extrabold text-white transition bg-lightBlue hover:bg-lightBlueStrong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alreadyRegistered
              ? "Nevezés módosítása"
              : isFull
              ? "Betelt a maximum csapatszám"
              : "Jelentkezés"}
          </button>
        </div>
      </div>
    </div>
  );
}