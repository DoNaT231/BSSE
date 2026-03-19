import React from "react";
import TournamentStatusBadge from "./TounamentStatusBadge.jsx";
import {
  formatDateTime,
  getTournamentStart,
  canRegisterToTournament,
} from "../utils/tournamentDates.js";

export default function TournamentCard({
  tournament,
  registration,
  onOpen,
}) {
  const alreadyRegistered = Boolean(registration?.id);
  const startIso = getTournamentStart(tournament);
  const canRegister = canRegisterToTournament(tournament);

  return (
    <div className="group relative rounded-3xl bg-white/95 border border-white/60 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-18px_rgba(15,23,42,0.55)]">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold truncate text-slate-900">
              {tournament.title}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              {startIso
                ? `Kezdés: ${formatDateTime(startIso)}`
                : "Kezdés: nincs megadva"}
            </p>

            {tournament.registration_deadline && (
              <p className="mt-1 text-sm text-slate-600">
                Nevezési határidő: {formatDateTime(tournament.registration_deadline)}
              </p>
            )}
          </div>

          {tournament.team_size != null && (
            <div className="px-3 py-1 text-xs font-extrabold border shrink-0 rounded-2xl bg-slate-50 border-slate-200 text-slate-700">
              {tournament.team_size} fő/csapat
            </div>
          )}
        </div>

        {tournament.description && (
          <p className="mt-3 text-sm leading-relaxed text-slate-700 line-clamp-4">
            {tournament.description}
          </p>
        )}

        {tournament.entry_fee !== null && tournament.entry_fee !== undefined && (
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Nevezési díj:{" "}
            {Number(tournament.entry_fee) === 0
              ? "ingyenes"
              : `${tournament.entry_fee} Ft`}
          </p>
        )}

        <TournamentStatusBadge
          tournament={tournament}
          alreadyRegistered={alreadyRegistered}
        />

        <button
          onClick={() => onOpen(tournament.id)}
          disabled={!alreadyRegistered && !canRegister}
          className="mt-4 w-full rounded-2xl bg-[#f7b23b] px-4 py-3 text-sm font-extrabold text-slate-900 shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-4 focus:ring-orange-200/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {alreadyRegistered ? "Nevezés módosítása" : "Jelentkezés"}
        </button>
      </div>
    </div>
  );
}