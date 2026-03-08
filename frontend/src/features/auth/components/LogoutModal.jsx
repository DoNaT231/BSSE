import Modal from "../../../components/Modal";
import { useAuth } from "../../../contexts/AuthContext";

/**
 * LogoutModal
 * ---------------------------------------
 * Kijelentkezést megerősítő modal.
 *
 * Props:
 * - isOpen (boolean) → modal láthatósága
 * - onClose (function) → modal bezárása
 */

export default function LogoutModal({ isOpen, onClose }) {
  const { logout } = useAuth();

  /**
   * handleLogout()
   * ---------------------------------------
   * Kijelentkezteti a felhasználót,
   * majd bezárja a modalt.
   */
  function handleLogout() {
    logout();
    onClose?.();
  }

  if (!isOpen) return null;

  return (
    <Modal closeModal={onClose}>
      <h2 className="mb-4 text-xl font-bold text-center">
        Biztosan kijelentkezel?
      </h2>

      <div className="flex justify-center gap-4">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-500 rounded-lg"
        >
          Kijelentkezés
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Mégse
        </button>
      </div>
    </Modal>
  );
}