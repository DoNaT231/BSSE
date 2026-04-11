import { API_BASE_URL } from "../../../config";

/** Szerver / hálózati hiba esetén üres tömb — a UI (courts.length, .map) ne omoljon össze. */
export default async function fetchCourts() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/courts`);
    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}