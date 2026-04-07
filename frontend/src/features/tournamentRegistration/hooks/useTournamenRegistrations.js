import { useState, useCallback } from "react";
import { fetchMyTournamentRegistrations } from "../api/tournamentRegistrationPublicApi.js";

export default function useTournamentRegistrations(token) {
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [regByTournamentId, setRegByTournamentId] = useState({});

  const refreshMyRegistrations = useCallback(async () => {
    const list = await fetchMyTournamentRegistrations(token);
    setMyRegistrations(Array.isArray(list) ? list : []);

    const map = {};
    for (const registration of list || []) {
      const tournamentId = registration.tournament_id ?? registration.tournamentId;
      if (tournamentId != null) {
        map[tournamentId] = registration;
      }
    }

    setRegByTournamentId(map);
    return list;
  }, [token]);

  return {
    myRegistrations,
    regByTournamentId,
    refreshMyRegistrations,
  };
}