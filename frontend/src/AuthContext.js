import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * AuthContext / AuthProvider
 * ------------------------------------------------------------
 * Cél:
 * - A teljes appban elérhetővé tenni az auth állapotot (login/logout),
 *   valamint a JWT-ből kiolvasott felhasználói adatokat.
 *
 * Tárolás:
 * - A JWT token a localStorage-ben van ("token" kulcs).
 *
 * JWT elvárás (payload mezők):
 * - exp: number (UNIX timestamp másodpercben) -> lejárat
 * - id: user azonosító
 * - username: felhasználónév / display név
 * - role: jogosultsági szerep (pl. "admin", "user")
 * - email: felhasználó e-mail címe  ✅ (új)
 *
 * Provider által adott value:
 * - loggedIn: boolean
 * - role: string
 * - username: string
 * - userId: string|number|null
 * - userEmail: string (✅ új)
 * - login(token): JWT mentés + state frissítés
 * - logout(): JWT törlés + state reset
 * - setUsername/setRole/setLoggedIn: (ha kell kézi állítás)
 *
 * Megjegyzés:
 * - A state-ek frissítése aszinkron, ezért a console.log azonnal a setState után
 *   régi értéket is mutathat. Debughoz használd a külön useEffect logot.
 */

// 1) Kontextus
const AuthContext = createContext(null);

/** JWT payload biztonságos dekódolása (base64url kompatibilis) */
function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    // base64url -> base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (err) {
    console.error("JWT decode error:", err);
    return null;
  }
}

/** Ellenőrzés: formátum + exp */
function isJwtValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || typeof payload.exp !== "number") return false;

  return payload.exp > now;
}

// 2) Provider
export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // ✅ új

  /** Közös “state kitöltés” a payload alapján */
  const applyPayload = (payload) => {
    setUserId(payload?.id ?? null);
    setUsername(payload?.username ?? "");
    setRole(payload?.role ?? "");
    setUserEmail(payload?.email ?? ""); // ✅ új
    setLoggedIn(true);
  };

  /** Reset minden state */
  const clearAuthState = () => {
    setLoggedIn(false);
    setRole("");
    setUsername("");
    setUserId(null);
    setUserEmail("");
  };

  // 3) App induláskor token ellenőrzés
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && isJwtValid(token)) {
      const payload = decodeJwtPayload(token);
      if (payload) {
        applyPayload(payload);
      } else {
        logout();
      }
    } else {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 4) Debug: állapotváltozás log (opcionális)
  useEffect(() => {
    // Ha nem kell, nyugodtan töröld
    // console.log("Auth state:", { loggedIn, userId, username, userEmail, role });
  }, [loggedIn, userId, username, userEmail, role]);

  // 5) Login / Logout
  const login = (token) => {
    localStorage.setItem("token", token);

    const payload = decodeJwtPayload(token);
    if (!payload || !isJwtValid(token)) {
      logout();
      return;
    }

    applyPayload(payload);
  };

  const logout = () => {
    localStorage.removeItem("token");
    clearAuthState();
  };

  // 6) Value memo (kevesebb re-render)
  const value = useMemo(
    () => ({
      loggedIn,
      role,
      username,
      userId,
      userEmail, // ✅ új
      setLoggedIn,
      setRole,
      setUsername,
      login,
      logout,
    }),
    [loggedIn, role, username, userId, userEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 7) Hook
export const useAuth = () => useContext(AuthContext);
