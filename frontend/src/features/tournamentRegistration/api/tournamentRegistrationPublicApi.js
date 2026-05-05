// +------------------------------------------------------------------+
// |            tournamentRegistrationPublicApi.js                     |
// |                   Copyright (c) 2026, Komoroczy Donat            |
// |                    donatkomoroczy@gmail.com                     |
// +------------------------------------------------------------------+
/*
 * =====================================================================
 * tournamentRegistrationPublicApi.js - API kommunikációs réteg
 * =====================================================================
 *
 * Funkcio:
 * - Versenyregisztrációs API hívások kezelése
 * - Adatok küldése és fogadása a backend felé
 *
 * Felelosseg:
 * - API kérések formázása és küldése
 * - Válaszok feldolgozása és hibakezelés
 */

import { API_BASE_URL } from "../../../config";

function getAuthHeaders(token, extra = {}) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function request(path, token, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(token, options.headers || {}),
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new Error(data?.message || `HTTP ${response.status}`);
  }

  return data;
}

function mapRegistrationPayload(payload) {
  return {
    tournament_id: payload.tournamentId,
    tel_number: payload.telNumber,
    players: payload.players,
    team_name: payload.teamName,
    contact_email: payload.contactEmail,
    billing_name: payload.billingName,
    company_name: payload.companyName,
    tax_number: payload.taxNumber,
    address: payload.address,
  };
}

export async function fetchPublicTournaments(token) {
  return request("/api/tournaments", token, { method: "GET" });
}

export async function fetchMyTournamentRegistrations(token) {
  return request("/api/tournament-registrations/my", token, { method: "GET" });
}

export async function submitTournamentRegistration(payload, token, registrationId = null) {
  const isEdit = Boolean(registrationId);
  const path = isEdit
    ? `/api/tournament-registrations/${registrationId}`
    : "/api/tournament-registrations";

  return request(path, token, {
    method: isEdit ? "PUT" : "POST",
    body: JSON.stringify(mapRegistrationPayload(payload)),
  });
}

export async function deleteTournamentRegistration(registrationId, token) {
  return request(`/api/tournament-registrations/${registrationId}`, token, {
    method: "DELETE",
  });
}
