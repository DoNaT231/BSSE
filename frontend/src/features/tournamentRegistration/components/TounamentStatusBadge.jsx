import React from "react";
import {
  isRegistrationDeadlinePassed,
  hasTournamentStarted,
  isTournamentFull,
} from "../utils/tournamentDates.js";
import { TOURNAMENT_STATUS_LABELS } from "../constants/tournamentLabels.js";

export default function TournamentStatusBadge({ tournament, alreadyRegistered }) {
  if (alreadyRegistered) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 text-xs font-extrabold border rounded-full bg-emerald-50 border-emerald-200 text-emerald-700">
        ✅ {TOURNAMENT_STATUS_LABELS.REGISTERED}
      </div>
    );
  }

  if (isRegistrationDeadlinePassed(tournament)) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 text-xs font-extrabold border rounded-full bg-red-50 border-red-200 text-red-700">
        ⛔ {TOURNAMENT_STATUS_LABELS.DEADLINE_PASSED}
      </div>
    );
  }

  if (hasTournamentStarted(tournament)) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 text-xs font-extrabold border rounded-full bg-slate-100 border-slate-200 text-slate-700">
        🕒 {TOURNAMENT_STATUS_LABELS.STARTED}
      </div>
    );
  }

  if (isTournamentFull(tournament)) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 mt-3 text-xs font-extrabold border rounded-full bg-amber-50 border-amber-200 text-amber-700">
        👥 {TOURNAMENT_STATUS_LABELS.FULL}
      </div>
    );
  }

  return null;
}