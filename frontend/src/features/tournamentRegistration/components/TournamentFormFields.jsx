import React from "react";
import TournamentField from "./TournamentField.jsx";

export default function TournamentFormFields({
  teamName,
  setTeamName,
  email,
  setEmail,
  telNumber,
  setTelNumber,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <TournamentField
        label="Csapatnév"
        value={teamName}
        onChange={setTeamName}
        placeholder="pl. SMASH Duo"
      />

      <TournamentField
        label="Email *"
        value={email}
        onChange={setEmail}
        placeholder="pl. valaki@gmail.com"
        required
      />

      <TournamentField
        label="Telefonszám *"
        value={telNumber}
        onChange={setTelNumber}
        placeholder="pl. +36 30 123 4567"
        required
      />
    </div>
  );
}