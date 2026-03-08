import { createContext, useContext, useState, useEffect } from "react";

/**
 * AuthContext
 * ----------------------------------------------------
 * Globális autentikációs állapot kezelése React Context
 * segítségével.
 *
 * A context a következő adatokat és függvényeket teszi
 * elérhetővé az alkalmazás bármely komponenséből:
 *
 * - user   → a bejelentkezett felhasználó adatai
 * - login  → bejelentkeztetés (token + user mentése)
 * - logout → kijelentkeztetés
 *
 * Használat:
 *
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * majd komponensben:
 *
 * const { user, login, logout } = useAuth();
 */

const AuthContext = createContext();

/**
 * AuthProvider
 * ----------------------------------------------------
 * A teljes alkalmazást körülölelő provider komponens.
 *
 * Feladata:
 * - user állapot tárolása
 * - token kezelés
 * - automatikus bejelentkezés refresh után
 */
export function AuthProvider({ children }) {

  /**
   * user state
   * ------------------------------------------------
   * null → nincs bejelentkezve
   * object → bejelentkezett felhasználó
   */
  const [user, setUser] = useState(null);

  /**
   * Auto-login ellenőrzés
   * ------------------------------------------------
   * Amikor az alkalmazás betöltődik:
   * - megnézi van-e token a localStorage-ben
   * - ha van → lekéri a user adatokat az API-tól
   * - ha hiba történik → logout
   */
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch("/api/auth/me", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
      .then(r => r.json())
      .then(data => setUser(data.user))
      .catch(() => logout());
  }, []);

  /**
   * login()
   * ------------------------------------------------
   * Sikeres login után hívódik.
   *
   * Feladata:
   * - token mentése localStorage-be
   * - user state frissítése
   *
   * Ez automatikusan frissíti az egész alkalmazást
   * (React re-render).
   */
  function login(token, userData) {
    localStorage.setItem("token", token);
    setUser(userData);
  }

  /**
   * logout()
   * ------------------------------------------------
   * Kijelentkezteti a felhasználót.
   *
   * Feladata:
   * - token törlése
   * - user state null-ra állítása
   */
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  /**
   * Context provider
   * ------------------------------------------------
   * A value objektum lesz elérhető az alkalmazás
   * összes komponensében a useAuth hook segítségével.
   */
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth()
 * ----------------------------------------------------
 * Custom hook az AuthContext egyszerű használatához.
 *
 * Használat:
 *
 * const { user, login, logout } = useAuth();
 *
 * Előny:
 * - nem kell mindenhol useContext(AuthContext)-et írni
 */
export function useAuth() {
  return useContext(AuthContext);
}