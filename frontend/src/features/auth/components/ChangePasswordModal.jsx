import { useState } from "react";
import Modal from "../../../components/Modal";
import { API_BASE_URL } from "../../../config";

export default function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const cp = currentPassword ?? "";
    const np = newPassword ?? "";
    const cnp = confirmNewPassword ?? "";

    if (!cp.trim()) {
      setError("Add meg a jelenlegi jelszavadat.");
      return;
    }

    if (!np.trim()) {
      setError("Az új jelszó megadása kötelező.");
      return;
    }

    if (np.trim().length < 6) {
      setError("Az új jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    if (!cnp.trim()) {
      setError("Az új jelszó megerősítése kötelező.");
      return;
    }

    if (np !== cnp) {
      setError("A két új jelszó nem egyezik.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: cp,
          newPassword: np,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Jelszó módosítás sikertelen.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      onSuccess?.("Jelszó sikeresen módosítva.");
      onClose?.();
    } catch (e) {
      setError(e.message || "Jelszó módosítás sikertelen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal closeModal={onClose}>
      <h2 className="text-2xl font-extrabold">Jelszó csere</h2>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Jelenlegi jelszó
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Jelenlegi jelszó"
            className="w-full px-3 py-2 mt-1 border rounded-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">Új jelszó</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Új jelszó"
            className="w-full px-3 py-2 mt-1 border rounded-lg"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Új jelszó megerősítése
          </label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            placeholder="Új jelszó mégegyszer"
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
          {loading ? "Mentés..." : "Jelszó módosítása"}
        </button>
      </form>
    </Modal>
  );
}

