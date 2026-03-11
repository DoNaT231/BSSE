function ReservationInfoModal({
  isOpen,
  isError,
  message,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-3 text-lg font-bold">
          {isError ? "Hiba" : "Információ"}
        </h2>

        <p className="text-sm text-gray-700 whitespace-pre-line">
          {message}
        </p>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Rendben
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationInfoModal;