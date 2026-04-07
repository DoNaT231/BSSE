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
  onOpenDetails,
}) {
  const alreadyRegistered = Boolean(registration?.id);
  const startIso = getTournamentStart(tournament);
  const canRegister = canRegisterToTournament(tournament);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_-28px_rgba(15,23,42,0.34)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-xl font-extrabold tracking-tight text-slate-900">
            {tournament.title}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-600">
            {startIso
              ? `Kezdés: ${formatDateTime(startIso)}`
              : "Kezdés: nincs megadva"}
          </p>
        </div>

        {tournament.team_size != null && (
          <div className="shrink-0 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">
            {tournament.team_size} fő/csapat
          </div>
        )}
      </div>

      <div className="mt-4">
        <TournamentStatusBadge
          tournament={tournament}
          alreadyRegistered={alreadyRegistered}
        />
      </div>

      {tournament.description && (
        <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
          {tournament.description}
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onOpenDetails?.(tournament)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
        >
          Részletek
        </button>

        <button
          type="button"
          onClick={() => onOpen(tournament.id)}
          disabled={!alreadyRegistered && !canRegister}
          className="rounded-xl bg-sky-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {alreadyRegistered ? "Nevezés módosítása" : "Jelentkezés"}
        </button>
      </div>
    </div>
  );
}