import { API_BASE_URL } from "../../../config";

/**
 * Top 10: { username, points }[]
 */
export async function fetchThursdayLeaderboardTop() {
  const response = await fetch(
    `${API_BASE_URL}/api/thursday-leaderboard/top`
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Nem sikerült betölteni a ranglistát.");
  }

  if (!Array.isArray(data)) {
    throw new Error("Érvénytelen válasz a szervertől.");
  }

  return data;
}
