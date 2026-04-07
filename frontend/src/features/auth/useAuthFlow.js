import { useState } from "react";
import { startAuth, loginWithPassword, registerUser } from "./authApi";
import { getErrorMessage, isValidEmail, normalizeEmail } from "./authHelpers";
import { useAuth } from "../../contexts/AuthContext";

/**
 * useAuthFlow
 * ---------------------------------------
 * Custom hook, amely a teljes login /
 * register folyamat állapotkezelését végzi.
 *
 * Flow:
 * 1. Email bekérése
 * 2. Backend eldönti a következő lépést
 *    - REGISTER → regisztráció
 *    - ASK_PASSWORD → jelszó bekérés
 *    - LOGIN_SUCCESS → azonnali login
 *
 * A hook kezeli:
 * - auth lépések (step)
 * - loading state
 * - hibakezelés
 * - user login triggerelése
 *
 * Paraméterek:
 * - onClose (function) → modal bezárása sikeres login után
 *
 * Returns:
 * - step
 * - email
 * - loading
 * - error
 * - submitEmail()
 * - submitPassword()
 * - submitRegister()
 * - goBackToEmail()
 */

export default function useAuthFlow(onClose) {

  /** AuthContext login függvény */
  const { login } = useAuth();

  /** aktuális auth lépés (email / password / register) */
  const [step, setStep] = useState("email");

  /** aktuális email */
  const [email, setEmail] = useState("");

  /** loading állapot API hívásokhoz */
  const [loading, setLoading] = useState(false);

  /** hibaüzenet */
  const [error, setError] = useState("");

  /**
   * submitEmail()
   * ---------------------------------------
   * Elindítja az auth folyamatot email alapján.
   * A backend válasza határozza meg a következő lépést.
   */
  async function submitEmail(rawEmail) {
    try {
      setError("");

      const normalizedEmail = normalizeEmail(rawEmail);

      if (!isValidEmail(normalizedEmail)) {
        throw new Error("Adj meg egy érvényes email címet.");
      }

      setLoading(true);

      const result = await startAuth(normalizedEmail);
      setEmail(normalizedEmail);

      if (result.action === "REGISTER") {
        setStep("register");
        return;
      }

      if (result.action === "ASK_PASSWORD") {
        setStep("password");
        return;
      }

      if (
        result.action === "LOGIN_SUCCESS" ||
        result.action === "LOGIN_WITHOUT_PASSWORD"
      ) {
        login(result.token, result.user);
        onClose?.();
        return;
      }

      throw new Error("Ismeretlen auth válasz érkezett.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  /**
   * submitPassword()
   * ---------------------------------------
   * Jelszavas bejelentkezés meglévő felhasználóhoz.
   */
  async function submitPassword(password) {
    try {
      setError("");

      if (!password?.trim()) {
        throw new Error("A jelszó megadása kötelező.");
      }

      setLoading(true);

      const result = await loginWithPassword(email, password);

      login(result.token, result.user);
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  /**
   * submitRegister()
   * ---------------------------------------
   * Új felhasználó regisztrációját végzi.
   */
  async function submitRegister({
    username,
    isLocal,
    phone,
  }) {
    try {
      setError("");

      if (!username?.trim()) {
        throw new Error("A név megadása kötelező.");
      }

      setLoading(true);

      const result = await registerUser({
        email,
        username: username.trim(),
        isLocal,
        phone: phone?.trim() || null,
      });

      login(result.token, result.user);
      onClose?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  /**
   * goBackToEmail()
   * ---------------------------------------
   * Visszalép az email megadás lépéshez.
   */
  function goBackToEmail() {
    setError("");
    setStep("email");
  }

  return {
    step,
    email,
    loading,
    error,
    submitEmail,
    submitPassword,
    submitRegister,
    goBackToEmail,
  };
}