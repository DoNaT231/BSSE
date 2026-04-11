import { XMarkIcon } from "@heroicons/react/24/outline";

/**
 * Általános modal keret.
 *
 * @param {function} closeModal | onClose — bezárás (legalább egy legyen dismissible módban)
 * @param {boolean} dismissible — ha true: X gomb + opcionálisan háttérre kattintás zár
 * @param {boolean} closeOnBackdropClick — csak ha dismissible (alap: true)
 */
export default function Modal({
  children,
  closeModal,
  onClose,
  dismissible = true,
  closeOnBackdropClick = true,
}) {
  const handleClose = closeModal ?? onClose;

  function onBackdropMouseDown(e) {
    if (!dismissible || !closeOnBackdropClick || !handleClose) return;
    if (e.target === e.currentTarget) handleClose();
  }

  return (
    <div
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        h-screen
        animate-fadeIn
      "
      onMouseDown={onBackdropMouseDown}
      role="presentation"
    >
      <div
        className="
          bg-white text-brandDark
          rounded-xl p-8
          w-[90%] max-w-md
          shadow-2xl
          text-center
          animate-scaleIn
          flex
          flex-col
          gap-8
          relative
        "
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {dismissible && handleClose ? (
          <button
            type="button"
            onClick={handleClose}
            aria-label="Bezárás"
            className="absolute z-50 top-4 right-4 rounded-lg p-1 hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-700" />
          </button>
        ) : null}
        {children}
      </div>
    </div>
  );
}
