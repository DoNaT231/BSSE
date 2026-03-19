import React from "react";
import TournamentField from "./TournamentField.jsx";

export default function TournamentPlayersFields({
  teamSize,
  players,
  updatePlayer,
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-extrabold text-slate-900">
        Játékosok ({teamSize} fő) *
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {players.map((player, i) => (
          <TournamentField
            key={i}
            label={`Játékos ${i + 1}`}
            value={player}
            onChange={(value) => updatePlayer(i, value)}
            placeholder="Teljes név"
            required
          />
        ))}
      </div>
    </div>
  );
}