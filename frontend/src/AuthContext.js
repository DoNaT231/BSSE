import { createContext, useContext, useEffect, useMemo, useState } from "react";

/**
 * AuthContext / AuthProvider
 * ============================================================
 * Cél:
 * - Globális auth állapot biztosítása az egész alkalmazásban
 * - JWT token kezelése
 * - JWT payload dekódolása
 * - Login / Logout kezelése
 *
 * Tárolás:
 * - A JWT token localStorage-ben: "token"
 *
 * Provider által adott értékek:
 * ------------------------------------------------------------
 * token        -> aktuális JWT (string | null)
 * loggedIn     -> boolean
 * role         -> string
 * username     -> string
 * userId       -> number | null
 * userEmail    -> string
 *
 * login(token) -> token mentés + state frissítés
 * logout()     -> token törlés + state reset
 *
 * FONTOS:
 * - A token state-be van téve, nem csak localStorage-ben van
 * - Így token változás -> context re-render -> useEffect([token]) működik
 */

const AuthContext = createContext(null);

/**
 * JWT payload dekódolás (base64url kompatibilis)
 */
function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
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

/**
 * Token validálás (exp ellenőrzés)
 */
function isJwtValid(token) {
  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || typeof payload.exp !== "number") return false;

  return payload.exp > now;
}

/**
 * AuthProvider
 */
export const AuthProvider = ({ children }) => {
  // 🔥 Token state (ez triggereli az újrarendert)
  const [token, setToken] = useState(null);

  // JWT payloadból származtatott state-ek
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  /**
   * Payload alkalmazása state-re
   */
  const applyPayload = (payload) => {
    setUserId(payload?.id ?? null);
    setUsername(payload?.username ?? "");
    setRole(payload?.role ?? "");
    setUserEmail(payload?.email ?? "");
    setLoggedIn(true);
  };

  /**
   * Teljes auth state reset
   */
  const clearAuthState = () => {
    setToken(null);
    setLoggedIn(false);
    setRole("");
    setUsername("");
    setUserId(null);
    setUserEmail("");
  };

  /**
   * App induláskor:
   * - localStorage-ből token beolvasás
   * - validálás
   * - state kitöltés
   */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken && isJwtValid(storedToken)) {
      const payload = decodeJwtPayload(storedToken);
      if (payload) {
        setToken(storedToken);
        applyPayload(payload);
      } else {
        logout();
      }
    } else {
      logout();
    }
  }, []);

  /**
   * Login
   * - token mentés
   * - validálás
   * - state frissítés
   */
  const login = (newToken) => {
    localStorage.setItem("token", newToken);

    const payload = decodeJwtPayload(newToken);
    if (!payload || !isJwtValid(newToken)) {
      logout();
      return;
    }

    setToken(newToken);
    applyPayload(payload);
  };

  /**
   * Logout
   * - token törlés
   * - state reset
   */
  const logout = () => {
    localStorage.removeItem("token");
    clearAuthState();
  };

  /**
   * Memoizált context value
   * - Csak akkor változik, ha ténylegesen változik valamelyik state
   * - Optimalizálja a re-renderelést
   */
  const value = useMemo(
    () => ({
      token,
      loggedIn,
      role,
      username,
      userId,
      userEmail,
      login,
      logout,
    }),
    [token, loggedIn, role, username, userId, userEmail]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 * - Egyszerű hozzáférés a contexthez
 */
export const useAuth = () => useContext(AuthContext);
