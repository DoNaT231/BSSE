import { useMemo, useState } from "react";

export default function useTournamentSignupForm({
  tournaments,
  regByTournamentId,
  myRegistrations = [],
  userEmail,
}) {
  const [openTournamentId, setOpenTournamentId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState(userEmail || "");
  const [telNumber, setTelNumber] = useState("");
  const [players, setPlayers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [activeRegistration, setActiveRegistration] = useState(null);

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.id === openTournamentId) || null,
    [tournaments, openTournamentId]
  );

  function openForm(tournamentId) {
    setOpenTournamentId(tournamentId);

    const existingFromMap =
      regByTournamentId[tournamentId] ?? regByTournamentId[String(tournamentId)] ?? null;
    const existingFromList =
      Array.isArray(myRegistrations) &&
      myRegistrations.find(
        (registration) =>
          Number(registration?.tournament_id ?? registration?.tournamentId) ===
          Number(tournamentId)
      );
    const existing = existingFromMap || existingFromList || null;
    setActiveRegistration(existing);

    if (existing) {
      const team = existing.team_name ?? existing.teamName ?? "";
      const tel = existing.tel_number ?? existing.telNumber ?? "";
      const contact = existing.contact_email ?? existing.contactEmail ?? userEmail ?? "";

      setTeamName(team);
      setTelNumber(tel);
      setEmail(contact);

      const required = Number(
        tournaments.find((t) => t.id === tournamentId)?.team_size ?? 0
      );

      const existingPlayers = Array.isArray(existing.players) ? existing.players : [];
      const normalizedPlayers = Array.from(
        { length: required > 0 ? required : existingPlayers.length },
        (_, i) => existingPlayers[i] ?? ""
      );

      setPlayers(normalizedPlayers);
    } else {
      const tournament = tournaments.find((t) => t.id === tournamentId);
      const required = Number(tournament?.team_size ?? 0);

      setTeamName("");
      setTelNumber("");
      setEmail(userEmail || "");
      setPlayers(Array.from({ length: required > 0 ? required : 0 }, () => ""));
    }

    setSubmitMsg("");
    setSubmitErr("");
  }

  function closeForm() {
    setOpenTournamentId(null);
    setTeamName("");
    setTelNumber("");
    setEmail(userEmail || "");
    setPlayers([]);
    setSubmitLoading(false);
    setSubmitMsg("");
    setSubmitErr("");
    setActiveRegistration(null);
  }

  function updatePlayer(index, value) {
    setPlayers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return {
    openTournamentId,
    selectedTournament,
    teamName,
    setTeamName,
    email,
    setEmail,
    telNumber,
    setTelNumber,
    players,
    setPlayers,
    updatePlayer,
    submitLoading,
    setSubmitLoading,
    submitMsg,
    setSubmitMsg,
    submitErr,
    setSubmitErr,
    activeRegistration,
    setActiveRegistration,
    openForm,
    closeForm,
  };
}