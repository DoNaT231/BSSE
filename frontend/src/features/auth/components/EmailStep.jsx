import { useState } from "react";

/**
 * EmailStep
 * ---------------------------------------
 * A login flow első lépése.
 * A felhasználó email címét kéri be.
 *
 * Props:
 * - onSubmit (function) → email beküldése
 * - loading (boolean) → loading állapot
 * - error (string) → hibaüzenet
 */

export default function EmailStep({
  onSubmit,
  loading,
  error,
}) {
  const [email, setEmail] = useState("");

  /**
   * handleSubmit()
   * ---------------------------------------
   * Elkéri az email címet és továbbadja
   * a parent komponensnek.
   */
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(email);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Email cím</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="pelda@email.com"
          className="w-full px-3 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 text-white bg-black rounded-lg disabled:opacity-50"
      >
        {loading ? "Betöltés..." : "Tovább"}
      </button>
    </form>
  );
}