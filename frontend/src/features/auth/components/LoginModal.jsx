import EmailStep from "./EmailStep";
import PasswordStep from "./PasswordStep";
import RegisterStep from "./RegisterStep";
import useAuthFlow from "../useAuthFlow";

/**
 * LoginModal
 * ---------------------------------------
 * A bejelentkezési / regisztrációs folyamat
 * megjelenítéséért felelős modal komponens.
 *
 * Flow:
 * 1. Email megadása
 * 2. A hook eldönti a következő lépést
 * 3. Password vagy Register step jelenik meg
 *
 * Props:
 * - isOpen (boolean) → modal láthatósága
 * - onClose (function) → modal bezárása
 */

export default function LoginModal({
  isOpen,
  onClose,
}) {
  const {
    step,
    email,
    loading,
    error,
    submitEmail,
    submitPassword,
    submitRegister,
    goBackToEmail,
  } = useAuthFlow(onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bejelentkezés</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 text-sm text-gray-500 rounded-md hover:bg-gray-100"
          >
            Bezárás
          </button>
        </div>

        {step === "email" && (
          <EmailStep
            onSubmit={submitEmail}
            loading={loading}
            error={error}
          />
        )}

        {step === "password" && (
          <PasswordStep
            email={email}
            onSubmit={submitPassword}
            onBack={goBackToEmail}
            loading={loading}
            error={error}
          />
        )}

        {step === "register" && (
          <RegisterStep
            email={email}
            onSubmit={submitRegister}
            onBack={goBackToEmail}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}