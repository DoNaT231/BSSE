import { API_BASE_URL } from "../../../../config";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse(response, defaultErrorMessage) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || defaultErrorMessage);
  }
  return data;
}

function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchLogsSummary() {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs/summary`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Nem sikerült lekérni az összefoglalót.");
}

export async function fetchActivityLogs(params = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/logs/activity${buildQuery(params)}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response, "Nem sikerült lekérni az eseménynaplót.");
}

export async function fetchActivityLogById(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs/activity/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Nem sikerült lekérni a naplóbejegyzést.");
}

export async function fetchErrorLogs(params = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/logs/errors${buildQuery(params)}`,
    { headers: getAuthHeaders() }
  );
  return handleResponse(response, "Nem sikerült lekérni a hibanaplót.");
}

export async function fetchErrorLogById(id) {
  const response = await fetch(`${API_BASE_URL}/api/admin/logs/errors/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response, "Nem sikerült lekérni a hibanaplót.");
}

export async function resolveErrorLog(id, resolvedNote) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/logs/errors/${id}/resolve`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ resolvedNote }),
    }
  );
  return handleResponse(response, "Nem sikerült megjelölni megoldottként.");
}
