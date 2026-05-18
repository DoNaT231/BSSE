import { useState, useCallback } from "react";
import { fetchMyTournamentRegistrations } from "../api/tournamentRegistrationPublicApi.js";

export default function useTournamentRegistrations(token) {
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [regByTournamentId, setRegByTournamentId] = useState({});

  const refreshMyRegistrations = useCallback(async () => {
    const list = await fetchMyTournamentRegistrations(token);

    const normalizedList = Array.isArray(list) ? list : [];

    setMyRegistrations(normalizedList);

    const map = {};

    for (const registration of normalizedList) {
      const tournamentId =
        registration.tournament_id ?? registration.tournamentId;

      if (tournamentId != null) {
        map[tournamentId] = registration;
      }
    }

    setRegByTournamentId(map);

    return normalizedList;
  }, [token]);

  return {
    myRegistrations,
    regByTournamentId,
    refreshMyRegistrations,
  };
}