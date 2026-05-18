// +------------------------------------------------------------------+
// |                useTournamentSignupForm.js                        |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * useTournamentSignupForm.js - React Hook versenyregisztrációhoz
 * =====================================================================
 *
 * Funkcio:
 * - Versenyregisztrációs űrlap állapotkezelése
 * - Adatok validálása és küldése
 * - Deadline mező normalizálása a kiválasztott versenyhez
 *
 * Felelosseg:
 * - Form állapotok kezelése
 * - API hívások indítása
 * - Hibaüzenetek kezelése
 */

import { useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export default function useTournamentSignupForm({
  tournaments,
  regByTournamentId,
  myRegistrations,
  reloadTournamentData,
  refreshMyRegistrations,
}) {
  const { user } = useAuth();
  const userEmail = user?.email;

  const [openTournamentId, setOpenTournamentId] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [email, setEmail] = useState("");
  const [telNumber, setTelNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [address, setAddress] = useState("");
  const [billingName, setBillingName] = useState("");
  const [players, setPlayers] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [activeRegistration, setActiveRegistration] = useState(null);

  const selectedTournament = useMemo(() => {
    const tournament =
      tournaments.find((t) => Number(t.id) === Number(openTournamentId)) || null;

    if (!tournament) return null;

    return tournament;
  }, [tournaments, openTournamentId]);

  function openForm(tournamentId) {
    setOpenTournamentId(tournamentId);

    const existingFromMap =
      regByTournamentId[tournamentId] ??
      regByTournamentId[String(tournamentId)] ??
      null;

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
      const contact =
        existing.contact_email ?? existing.contactEmail ?? userEmail ?? "";
      const company = existing.company_name ?? existing.companyName ?? "";
      const tax = existing.tax_number ?? existing.taxNumber ?? "";
      const addr = existing.address ?? "";
      const billing = existing.billing_name ?? existing.billingName ?? "";

      setTeamName(team);
      setTelNumber(tel);
      setEmail(contact);
      setCompanyName(company);
      setTaxNumber(tax);
      setAddress(addr);
      setBillingName(billing);

      const required = Number(
        tournaments.find((t) => Number(t.id) === Number(tournamentId))
          ?.team_size ?? 0
      );

      const existingPlayers = Array.isArray(existing.players)
        ? existing.players
        : [];

      const normalizedPlayers = Array.from(
        { length: required > 0 ? required : existingPlayers.length },
        (_, i) => existingPlayers[i] ?? ""
      );

      setPlayers(normalizedPlayers);
    } else {
      const tournament = tournaments.find(
        (t) => Number(t.id) === Number(tournamentId)
      );

      const required = Number(tournament?.team_size ?? 0);

      setTeamName("");
      setTelNumber("");
      setEmail(userEmail || "");
      setCompanyName("");
      setTaxNumber("");
      setAddress("");
      setBillingName("");
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
    setCompanyName("");
    setTaxNumber("");
    setAddress("");
    setBillingName("");
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
    companyName,
    setCompanyName,
    taxNumber,
    setTaxNumber,
    address,
    setAddress,
    billingName,
    setBillingName,
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