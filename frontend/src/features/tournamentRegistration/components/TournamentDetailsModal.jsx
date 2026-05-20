import React from "react";
import {
  formatDateTime,
  formatAvailableFrom,
  getTournamentStart,
  getAvailableFrom,
  getRegistrationOpensAt,
  isTournamentNotYetAvailable,
  canRegisterToTournament,
  isTournamentFull,
} from "../utils/tournamentDates.js";
import { LOCAL_EARLY_ACCESS_NOTICE } from "../constants/tournamentLabels.js";

export default function TournamentDetailsModal({
  tournament,
  registration,
  isOpen,
  onClose,
  onRegister,
  isLocal = false,
}) {
  if (!isOpen || !tournament) return null;

  const alreadyRegistered = Boolean(registration?.id);
  const startIso = getTournamentStart(tournament);
  const canRegister = canRegisterToTournament(tournament, isLocal);
  const isFull = isTournamentFull(tournament);
  const notYetOpen = isTournamentNotYetAvailable(tournament, isLocal);

  const registrationDeadline =
    tournament?.registration_deadline ??
    tournament?.registrationDeadline ??
    null;

  const availableFrom = getAvailableFrom(tournament);
  const registrationOpensAt = getRegistrationOpensAt(tournament, isLocal);

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
        <div className="px-6 py-5 text-white bg-gradient-to-r from-lightBlueStrong via-lightBlue to-lightBlue">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/75">
                Verseny részletei
              </p>

              <h3 className="mt-2 min-w-0 max-w-full break-words text-2xl font-extrabold tracking-tight">
                {tournament.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-bold text-white transition rounded-full bg-white/15 hover:bg-white/25"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50">
              <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
                Kezdés
              </p>

              <p className="mt-2 text-base font-bold text-brandDark">
                {startIso ? formatDateTime(startIso) : "Nincs megadva"}
              </p>
            </div>

            {registrationDeadline && (
              <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50">
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
                  Nevezési határidő
                </p>

                <p className="mt-2 text-base font-bold text-brandDark">
                  {formatDateTime(registrationDeadline)}
                </p>
              </div>
            )}

            <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50 sm:col-span-2">
              <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
                Nevezés megnyitása
              </p>

              {availableFrom ? (
                <>
                  <p className="mt-2 text-base font-bold text-brandDark">
                    Publikus nyitás: {formatAvailableFrom(availableFrom)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {LOCAL_EARLY_ACCESS_NOTICE}
                  </p>
                  {isLocal && registrationOpensAt && (
                    <p className="mt-2 text-sm font-bold text-lightBlueStrong">
                      Neked nyílik:{" "}
                      {formatAvailableFrom(registrationOpensAt)}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-2 text-base font-bold text-brandDark">Azonnal</p>
              )}
            </div>

            {tournament.team_size != null && (
              <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50">
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
                  Csapatlétszám
                </p>

                <p className="mt-2 text-base font-bold text-brandDark">
                  {tournament.team_size} fő/csapat
                </p>
              </div>
            )}

            {entryFee && (
              <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50">
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
                  Nevezési díj
                </p>

                <p className="mt-2 text-base font-bold text-brandDark">
                  {entryFee}
                </p>
              </div>
            )}

            {Number.isFinite(maxTeams) && maxTeams > 0 && (
              <div className="p-4 border rounded-2xl border-slate-200 bg-slate-50 sm:col-span-2">
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">
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
              <h4 className="text-sm font-extrabold tracking-wide uppercase text-slate-500">
                Leírás
              </h4>

              <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-slate-700">
                {tournament.description}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 p-6 border-t border-slate-200 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-sm font-semibold transition bg-white border rounded-xl border-slate-200 text-slate-700 hover:border-slate-300"
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
            className="px-5 py-3 text-sm font-extrabold text-white transition rounded-xl bg-lightBlue hover:bg-lightBlueStrong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alreadyRegistered
              ? "Nevezés módosítása"
              : notYetOpen
              ? "Nevezés még nem nyílt"
              : isFull
              ? "Betelt a maximum csapatszám"
              : "Jelentkezés"}
          </button>
        </div>
      </div>
    </div>
  );
}