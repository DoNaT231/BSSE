import { useState } from "react";
import {
  fetchTournamentRegistrations,
  updateTournamentRegistrationStatus,
  updateTournamentRegistrationPaid,
  updateTournamentRegistrationInvoiceSent,
} from "../api/tournamentsAdminApi";

export default function useTournamentRegistrations(token) {
  const [openRegsId, setOpenRegsId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [regsLoading, setRegsLoading] = useState(false);
  const [regsError, setRegsError] = useState("");
  const [statusUpdateLoadingId, setStatusUpdateLoadingId] = useState(null);
  const [paidUpdateLoadingId, setPaidUpdateLoadingId] = useState(null);
  const [invoiceSentUpdateLoadingId, setInvoiceSentUpdateLoadingId] =
    useState(null);

  async function loadRegistrations(tournamentId) {
    try {
      setRegsLoading(true);
      setRegsError("");

      const data = await fetchTournamentRegistrations(tournamentId, token);

      const rawRegistrations = Array.isArray(data?.registrations)
        ? data.registrations
        : [];


      setRegistrations(rawRegistrations);
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

  async function changeRegistrationStatus(registrationId, status) {
    if (!registrationId) return;

    try {
      setRegsError("");
      setStatusUpdateLoadingId(registrationId);

      await updateTournamentRegistrationStatus(registrationId, status, token);

      setRegistrations((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(registrationId)
            ? {
                ...item,
                status,
              }
            : item
        )
      );
    } catch (e) {
      setRegsError(e.message || "Státusz módosítása sikertelen.");
    } finally {
      setStatusUpdateLoadingId(null);
    }
  }

  async function changeRegistrationPaid(registrationId, paid) {
    if (!registrationId) return;

    try {
      setRegsError("");
      setPaidUpdateLoadingId(registrationId);

      await updateTournamentRegistrationPaid(registrationId, paid, token);

      setRegistrations((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(registrationId)
            ? {
                ...item,
                paid: Boolean(paid),
              }
            : item
        )
      );
    } catch (e) {
      setRegsError(e.message || "Fizetés állapot módosítása sikertelen.");
    } finally {
      setPaidUpdateLoadingId(null);
    }
  }

  async function changeRegistrationInvoiceSent(registrationId, invoiceSent) {
    if (!registrationId) return;

    try {
      setRegsError("");
      setInvoiceSentUpdateLoadingId(registrationId);

      await updateTournamentRegistrationInvoiceSent(
        registrationId,
        invoiceSent,
        token
      );

      setRegistrations((prev) =>
        prev.map((item) =>
          Number(item.id) === Number(registrationId)
            ? {
                ...item,
                invoiceSent: Boolean(invoiceSent),
              }
            : item
        )
      );
    } catch (e) {
      setRegsError(
        e.message || "Díjbekérő állapot módosítása sikertelen."
      );
    } finally {
      setInvoiceSentUpdateLoadingId(null);
    }
  }

  return {
    openRegsId,
    registrations,
    regsLoading,
    regsError,
    statusUpdateLoadingId,
    paidUpdateLoadingId,
    invoiceSentUpdateLoadingId,
    toggleRegistrations,
    loadRegistrations,
    changeRegistrationStatus,
    changeRegistrationPaid,
    changeRegistrationInvoiceSent,
  };
}