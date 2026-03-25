import { useState } from "react";
import { API_BASE_URL } from "../../../config";
import Modal from "../../../components/Modal";

export default function SetPasswordModal({ isOpen, onClose, onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const nextPassword = password ?? "";
    const nextConfirm = confirmPassword ?? "";

    if (!nextPassword.trim()) {
      setError("A jelszó megadása kötelező.");
      return;
    }

    if (nextPassword.trim().length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    if (!nextConfirm.trim()) {
      setError("A jelszó megerősítése kötelező.");
      return;
    }

    if (nextPassword !== nextConfirm) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/auth/set-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: nextPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Jelszó beállítás sikertelen.");
      }

      // Reset the local form
      setPassword("");
      setConfirmPassword("");
      onSuccess?.("Jelszó sikeresen beállítva.");
      onClose?.();
    } catch (e) {
      setError(e.message || "Jelszó beállítás sikertelen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal closeModal={onClose}>
      <h2 className="text-2xl font-extrabold">Jelszó beállítása</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700">Új jelszó</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Jelszó"
            className="w-full px-3 py-2 mt-1 border rounded-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Jelszó megerősítése
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Jelszó mégegyszer"
            className="w-full px-3 py-2 mt-1 border rounded-lg"
            disabled={loading}
          />
        </div>

        {error ? <p className="text-sm text-red-600 font-semibold">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-extrabold text-white bg-black rounded-xl hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Mentés..." : "Jelszó mentése"}
        </button>
      </form>
    </Modal>
  );
}

