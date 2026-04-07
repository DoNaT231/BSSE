import { API_BASE_URL } from "../../config";

/**
 * Auth API függvények
 * ---------------------------------------
 * Ez a fájl kezeli az authentikációhoz
 * kapcsolódó frontend API hívásokat.
 *
 * Fő feladatai:
 * - auth folyamat indítása email alapján
 * - jelszavas bejelentkezés
 * - új felhasználó regisztrációja
 */

/**
 * handleResponse(res)
 * ---------------------------------------
 * Egységesen feldolgozza a fetch válaszokat.
 *
 * Működés:
 * - megpróbálja JSON-ként kiolvasni a választ
 * - ha a kérés sikertelen volt, hibát dob
 * - ha sikeres volt, visszaadja a parsed adatot
 */
async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Hiba történt.");
  }

  return data;
}

/**
 * startAuth(email)
 * ---------------------------------------
 * Elindítja az auth folyamatot az email cím alapján.
 *
 * A backend dönti el, hogy:
 * - új user → regisztráció kell
 * - meglévő user → jelszó kell
 * - automatikus login is lehetséges
 */
export async function startAuth(email) {
  const res = await fetch(`${API_BASE_URL}/api/auth/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return handleResponse(res);
}

/**
 * loginWithPassword(email, password)
 * ---------------------------------------
 * Jelszavas bejelentkezést végez.
 *
 * Siker esetén a backend tipikusan
 * tokent és user adatokat ad vissza.
 */
export async function loginWithPassword(email, password) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return handleResponse(res);
}

/**
 * registerUser(...)
 * ---------------------------------------
 * Új felhasználó regisztrációját végzi.
 *
 * Beküldött adatok:
 * - email
 * - username
 * - isLocal
 * - phone
 */
export async function registerUser({
  email,
  username,
  isLocal,
  phone,
}) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      username,
      isLocal,
      phone,
    }),
  });
  console.log("register result:", res);
  return handleResponse(res);
}