import EmailStep from "./EmailStep";
import PasswordStep from "./PasswordStep";
import RegisterStep from "./RegisterStep";
import useAuthFlow from "../useAuthFlow";
import Modal from "../../../components/Modal";

/**
 * LoginModal
 * ---------------------------------------
 * dismissible (alap: true): Header „Bejelentkezés” — X + háttérre kattintás zárhat.
 * dismissible={false}: AuthFrostLock — nincs X, nem zárható háttérrel; csak sikeres auth után.
 */
export default function LoginModal({
  isOpen,
  onClose,
  dismissible = true,
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
    <Modal
      closeModal={onClose}
      dismissible={dismissible}
      closeOnBackdropClick={dismissible}
    >
      <div className="w-full text-left">
        <h2 className="pr-10 text-xl font-semibold text-center mb-1">
          Bejelentkezés
        </h2>

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
    </Modal>
  );
}
