import { useState } from "react";

/**
 * RegisterStep
 * ---------------------------------------
 * A login flow regisztrációs lépése.
 * Új felhasználó alapadatait kéri be.
 *
 * Props:
 * - email (string) → aktuális email cím
 * - onSubmit (function) → regisztráció beküldése
 * - onBack (function) → visszalépés email stepre
 * - loading (boolean) → loading állapot
 * - error (string) → hibaüzenet
 */

export default function RegisterStep({
  email,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  const [username, setUsername] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  const [phone, setPhone] = useState("");

  console.log("Anyad")

  /**
   * handleSubmit()
   * ---------------------------------------
   * Összegyűjti a regisztrációs adatokat
   * és továbbadja a parent komponensnek.
   */
  function handleSubmit(e) {
    e.preventDefault();

    onSubmit({
      email,
      username,
      isLocal,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">Új fiók létrehozása ehhez az emailhez:</p>
        <p className="font-medium">{email}</p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Név</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Teljes név"
          className="w-full px-3 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isLocal}
          onChange={(e) => setIsLocal(e.target.checked)}
          disabled={loading}
        />
        <span>Balatonalmádi lakos vagyok</span>
      </label>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full px-4 py-2 border rounded-lg"
        >
          Vissza
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 text-white bg-black rounded-lg disabled:opacity-50"
        >
          {loading ? "Betöltés..." : "Regisztráció"}
        </button>
      </div>
    </form>
  );
}