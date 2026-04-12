import { API_BASE_URL } from "../../../../config";

/**
 * Közös auth header builder.
 * A backend authMiddleware a Bearer tokenből tölti fel a req.user-t.
 */
function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Közös response kezelő.
 */
async function handleResponse(response, defaultErrorMessage) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || defaultErrorMessage);
  }

  return data;
}

/**
 * Összes user lekérése admin nézetre
 */
export async function getAllUsersAdmin() {

  console.log("waaaaaaa ", getAuthHeaders())
  const response = await fetch(
     `${API_BASE_URL}/api/admin/users`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  )

  return handleResponse(response, "Nem sikerült lekérni a usereket.");
}

/**
 * Egy user lekérése id alapján admin nézetre
 */
export async function getUserByIdAdmin(userId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Nem sikerült lekérni a felhasználót.");
}

/**
 * User módosítása admin által
 */
export async function updateUserAdmin(userId, userData) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      userType: userData.userType,
      isLocal: userData.isLocal,
      phone: userData.phone,
      isActive: userData.isActive,
    }),
  });

  return handleResponse(response, "Nem sikerült módosítani a felhasználót.");
}

/**
 * Csütörtöki pontok módosítása admin által (delta: pozitív vagy negatív egész)
 */
export async function adjustThursdayPointsAdmin(userId, delta) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users/${userId}/thursday-points`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ delta }),
    }
  );

  return handleResponse(
    response,
    "Nem sikerült módosítani a csütörtöki pontokat."
  );
}

/**
 * User deaktiválása admin által
 */
export async function deactivateUserAdmin(userId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/deactivate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Nem sikerült deaktiválni a felhasználót.");
}

/**
 * User aktiválása admin által
 */
export async function activateUserAdmin(userId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/activate`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Nem sikerült aktiválni a felhasználót.");
}

/**
 * User végleges törlése admin által
 */
export async function deleteUserAdmin(userId) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  return handleResponse(response, "Nem sikerült törölni a felhasználót.");
}