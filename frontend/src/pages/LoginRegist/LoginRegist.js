import { useState } from "react";
import { useAuth } from "../../AuthContext";
import { API_BASE_URL } from "../../config";
import "../../styleComponents.css";

/**
 * LoginRegist komponens
 * ---------------------
 * 3 lépcsős beléptetési flow:
 * 1) askEmail: email bekérése → backend eldönti, mi a következő lépés
 *    - ok: token vissza → login azonnal (password nélkül)
 *    - password_required: kérjünk jelszót
 *    - name_required: kérjünk nevet (regisztráció)
 *
 * 2) askPassword: jelszavas belépés
 * 3) askName: regisztráció név + email alapján
 *
 * UI cél:
 * - egységes, “card-szerű” form kinézet
 * - fókusz-állapot (ring), hibák középre rendezve
 * - gombok egységes stílusban
 */
export default function LoginRegist() {
  // Form mezők
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // Stage: melyik formot mutatjuk
  const [stage, setStage] = useState("askEmail");

  // Hibajelzés / visszajelzés a usernek
  const [alertMessage, setAlertMessage] = useState("");

  const { login } = useAuth();

  /**
   * Email ellenőrzés backenddel:
   * - megmondja, hogy van-e user és kell-e jelszó / név / vagy azonnali token
   */
  async function checkEmail(email) {
    const res = await fetch(`${API_BASE_URL}/api/auth/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    // Backend hibák kezelése (pl. invalid email, server error)
    if (!res.ok) {
      console.log(data.error);
      setAlertMessage(data.error);
      return;
    }

    // Kezelés a status szerint
    switch (data.status) {
      case "ok":
        // Jelszó nélkül beléphető → token alapján login
        login(data.token);
        break;

      case "password_required":
        // Jelszót kérünk
        setAlertMessage("");
        setStage("askPassword");
        break;

      case "name_required":
        // Regisztrációhoz név kell
        setAlertMessage("");
        setStage("askName");
        break;

      default:
        console.error("Ismeretlen válasz:", data);
    }
  }

  /**
   * Regisztráció (name + email)
   */
  async function register(name, email) {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      login(data.token);
    } else if (data.status === "user_exists") {
      setAlertMessage("Ez az email már létezik.");
    } else {
      console.error("Regisztrációs hiba:", data);
    }
  }

  /**
   * Belépés jelszóval
   */
  async function loginWithPassword(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      login(data.token);
    } else if (data.status === "invalid_password") {
      setAlertMessage("Hibás jelszó!");
    } else if (data.status === "no_password_set") {
      setAlertMessage("Ehhez a fiókhoz nem tartozik jelszó.");
    } else if (data.status === "not_found") {
      setAlertMessage("Nincs ilyen felhasználó.");
    } else {
      console.error("Bejelentkezési hiba:", data);
    }
  }

  // Submit handlerek – form submit események kezelése
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    checkEmail(email);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    register(name, email);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    loginWithPassword(email, password);
  };

  /**
   * UI helper className-ek
   * - egységes form layout / input / button
   */
  const formBase =
    "flex flex-col w-full max-w-sm mx-auto gap-5";

  const titleBase =
    "mt-8 mb-2 text-3xl font-bold text-center text-gray-800";

  const descBase =
    "text-sm text-center text-gray-600";

  const errorBase =
    "text-sm text-center text-red-500";

  const inputBase =
    "w-full h-11 px-4 rounded-lg border border-border text-gray-800 " +
    "focus:outline-none focus:ring-2 focus:ring-lightBlue focus:border-lightBlue transition";

  const primaryBtn =
    "w-40 mx-auto mt-2 py-2 rounded-lg font-semibold text-white " +
    "bg-slate-700 hover:bg-slate-800 transition";

  const secondaryBtn =
    "w-40 mx-auto py-2 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 transition";

  const helperRow =
    "flex flex-col gap-2 mt-2";

  return (
    <div className="w-full h-full">
      {/* ===================== 1) EMAIL STAGE ===================== */}
      {stage === "askEmail" && (
        <form onSubmit={handleEmailSubmit} className="form-base">
          {/* Cím */}
          <h1 className="title-base">BEJELENTKEZÉS</h1>

          {/* Leírás */}
          <p className="desc-base">
            Adja meg az email címét, hogy tudjon foglalni
          </p>

          {/* Hibajelzés */}
          {alertMessage !== "" && <p className="error-base">{alertMessage}</p>}

          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email cím"
            required
            className="input-base"
          />

          {/* Submit */}
          <button type="submit" className={primaryBtn}>
            Tovább
          </button>
        </form>
      )}

      {/* ===================== 2) PASSWORD STAGE ===================== */}
      {stage === "askPassword" && (
        <form onSubmit={handlePasswordSubmit} className={formBase}>
          <h1 className={titleBase}>JELSZÓ</h1>

          <p className={descBase}>
            Adja meg a jelszót a bejelentkezéshez
          </p>

          {alertMessage !== "" && <p className={errorBase}>{alertMessage}</p>}

          {/* Password input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
            required
            className="input-base"
          />

          <button type="submit" className="btn-primary">
            Bejelentkezés
          </button>

          {/* Extra: vissza email lépésre */}
          <div className="helper-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAlertMessage("");
                setPassword("");
                setStage("askEmail");
              }}
            >
              Vissza
            </button>
          </div>
        </form>
      )}

      {/* ===================== 3) NAME STAGE (REGISTER) ===================== */}
      {stage === "askName" && (
        <form onSubmit={handleNameSubmit} className="form-base">
          <h1 className="title-base">REGISZTRÁCIÓ</h1>

          <p className="desc-base">
            Adja meg a nevét, hogy regisztráljuk
          </p>

          {alertMessage !== "" && <p className={errorBase}>{alertMessage}</p>}

          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Név"
            required
            className="input-base"
          />

          <button type="submit" className={primaryBtn}>
            Regisztráció
          </button>

          {/* Extra: vissza email lépésre */}
          <div className="helper-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setAlertMessage("");
                setName("");
                setStage("askEmail");
              }}
            >
              Vissza
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
