import { useState } from "react";

/**
 * PasswordStep
 * ---------------------------------------
 * A login flow jelszóbekérő lépése.
 *
 * Props:
 * - email (string) → aktuális email cím
 * - onSubmit (function) → jelszó beküldése
 * - onBack (function) → visszalépés email stepre
 * - loading (boolean) → loading állapot
 * - error (string) → hibaüzenet
 */

export default function PasswordStep({
  email,
  onSubmit,
  onBack,
  loading,
  error,
}) {
  const [password, setPassword] = useState("");

  /**
   * handleSubmit()
   * ---------------------------------------
   * Beküldi a megadott jelszót.
   */
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(password);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">Bejelentkezés ehhez az emailhez:</p>
        <p className="font-medium">{email}</p>
      </div>

      <div>
        <label className="block mb-1 font-medium">Jelszó</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Jelszó"
          className="w-full px-3 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>

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
          {loading ? "Betöltés..." : "Belépés"}
        </button>
      </div>
    </form>
  );
}