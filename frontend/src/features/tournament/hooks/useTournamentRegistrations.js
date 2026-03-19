import { useState } from "react";
import { fetchTournamentRegistrations } from "../api/tournamentsAdminApi";

export default function useTournamentRegistrations(token) {
  const [openRegsId, setOpenRegsId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [regsError, setRegsError] = useState("");

  async function loadRegistrations(tournamentId) {
    try {
      setRegsLoading(true);
      setRegsError("");

      const data = await fetchTournamentRegistrations(tournamentId, token);

      setRegistrations(data?.registrations || []);
      setOpenRegsId(tournamentId);
    } catch (e) {
      setRegsError(e.message || "Hiba történt a jelentkezések lekérésekor.");
    } finally {
      setRegsLoading(false);
    }
  }

  function toggleRegistrations(tournamentId) {
    if (openRegsId === tournamentId) {
      setOpenRegsId(null);
      setRegistrations([]);
      setRegsError("");
      return;
    }

    loadRegistrations(tournamentId);
  }

  return {
    openRegsId,
    registrations,
    regsLoading,
    regsError,
    toggleRegistrations,
    loadRegistrations,
  };
}