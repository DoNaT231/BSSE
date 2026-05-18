import React from "react";
import TournamentStatusBadge from "./TounamentStatusBadge.jsx";
import {
  formatDateTime,
  getTournamentStart,
  getRegistrationOpensAt,
  canRegisterToTournament,
} from "../utils/tournamentDates.js";

export default function TournamentCard({
  tournament,
  registration,
  onOpen,
  onOpenDetails,
  isLocal = false,
}) {
  const alreadyRegistered = Boolean(registration?.id);
  const startIso = getTournamentStart(tournament);
  const canRegister = canRegisterToTournament(tournament, isLocal);

  const registrationDeadlineIso =
    tournament?.registrationDeadline ??
    tournament?.registration_deadline ??
    null;

  const registrationOpensAt = getRegistrationOpensAt(tournament, isLocal);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(35,31,32,0.28)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(35,31,32,0.34)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lightBlueStrong via-lightBlue to-lightBlueStrong" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="max-w-[90%] whitespace-normal break-all text-xl font-extrabold tracking-tight text-brandDark">
            {tournament.title}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-600">
            {startIso
              ? `Kezdés: ${formatDateTime(startIso)}`
              : "Kezdés: nincs megadva"}
          </p>

          {registrationOpensAt ? (
            <p className="mt-1 text-sm font-medium text-slate-500">
              Nevezés megnyitása: {formatDateTime(registrationOpensAt.toISOString())}
              {isLocal && " (helyi lakos)"}
            </p>
          ) : (
            <p className="mt-1 text-sm font-medium text-slate-500">
              Nevezés megnyitása: azonnal
            </p>
          )}

          {registrationDeadlineIso && (
            <p className="mt-1 text-sm font-medium text-slate-500">
              Nevezési határidő: {formatDateTime(registrationDeadlineIso)}
            </p>
          )}
        </div>

        {tournament.team_size != null && (
          <div className="px-3 py-1 text-xs font-extrabold border rounded-full shrink-0 border-lightBlue/25 bg-primaryLight text-lightBlueStrong">
            {tournament.team_size} fő/csapat
          </div>
        )}
      </div>

      <div className="mt-4">
        <TournamentStatusBadge
          tournament={tournament}
          alreadyRegistered={alreadyRegistered}
          isLocal={isLocal}
        />
      </div>

      {tournament.description && (
        <p className="mt-4 text-sm leading-6 line-clamp-2 text-slate-600">
          {tournament.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 mt-5">
        <button
          type="button"
          onClick={() => onOpenDetails?.(tournament)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-lightBlue/35 hover:text-lightBlueStrong"
        >
          Részletek
        </button>

        <button
          type="button"
          onClick={() => onOpen(tournament.id)}
          disabled={!alreadyRegistered && !canRegister}
          className="rounded-xl px-4 py-3 text-sm font-extrabold text-white shadow-sm transition bg-lightBlue hover:-translate-y-0.5 hover:bg-lightBlueStrong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {alreadyRegistered ? "Nevezés módosítása" : "Jelentkezés"}
        </button>
      </div>
    </div>
  );
}