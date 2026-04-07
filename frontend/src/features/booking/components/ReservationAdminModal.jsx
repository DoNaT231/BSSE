function ReservationAdminModal({
  isOpen,
  selectedSlot,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
        <h2 className="mb-3 text-lg font-bold">Admin művelet</h2>

        <p className="text-sm text-gray-700">
          Itt később jöhet az admin kezelőmodal a kiválasztott slotra.
        </p>

        <pre className="p-3 mt-4 overflow-auto text-xs bg-gray-100 rounded">
          {JSON.stringify(selectedSlot, null, 2)}
        </pre>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReservationAdminModal;