import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import {
  registerAuthSessionInvalidationHandler,
  DEFAULT_SESSION_INVALID_MESSAGE,
} from "./authSessionInvalidation";

/**
 * AuthContext
 * ----------------------------------------------------
 * Globális autentikációs állapot kezelése React Context
 * segítségével.
 *
 * Elérhető értékek:
 * - user
 * - isLoggedIn
 * - isAdmin
 * - login()
 * - logout()
 */
const AuthContext = createContext();

/**
 * AuthProvider
 * ----------------------------------------------------
 * A teljes alkalmazás auth állapotát biztosítja.
 */
export function AuthProvider({ children }) {
  /**
   * Bejelentkezett user adatai.
   * null esetén nincs aktív bejelentkezés.
   */
  const [user, setUser] = useState(null);

  /**
   * Első betöltéskor megpróbáljuk visszaállítani
   * a bejelentkezett állapotot a localStorage-ben tárolt tokenből.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    function handleInvalidSession(message) {
      localStorage.removeItem("token");
      setUser(null);
      window.dispatchEvent(
        new CustomEvent("bsse:open-login-modal", {
          detail: {
            reason: "invalid-session",
            message: message || DEFAULT_SESSION_INVALID_MESSAGE,
          },
        })
      );
    }
    registerAuthSessionInvalidationHandler(handleInvalidSession);
    return () => registerAuthSessionInvalidationHandler(null);
  }, []);

  /**
   * Sikeres login után:
   * - token mentése
   * - user state frissítése
   *
   * @param {string} token
   * @param {Object} userData
   */
  function login(token, userData) {
    localStorage.setItem("token", token);
    setUser(userData);
  }

  /**
   * Kijelentkeztetés:
   * - token törlése
   * - user törlése state-ből
   */
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  /**
   * Származtatott auth állapotok
   */
  const isLoggedIn = !!user;

  /**
   * Itt igazítsd ahhoz, amit a backend ténylegesen küld.
   * Lehet pl.:
   * - user?.role === "admin"
   * - user?.user_type === "ADMIN"
   */
  const isAdmin = user?.user_type === "admin" || user?.user_type === "ADMIN";

  /**
   * A provider value objektuma.
   * useMemo nem kötelező, de tisztább.
   */
  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      isAdmin,
      login,
      logout,
    }),
    [user, isLoggedIn, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth()
 * ----------------------------------------------------
 * Kényelmes hook az AuthContext használatához.
 */
export function useAuth() {
  return useContext(AuthContext);
}