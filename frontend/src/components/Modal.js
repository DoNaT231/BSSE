import { XMarkIcon } from "@heroicons/react/24/outline";
export default function Modal({ children, closeModal}) {
  return (
    <div
      className="
        fixed inset-0 z-[1000]
        flex items-center justify-center
        bg-black/50 backdrop-blur-sm
        animate-fadeIn
      "
    >
      <div
        className="
          bg-white text-gray-900
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
      >
        <button
          onClick={closeModal}
          className="absolute z-50 top-4 right-4"
        >
          <XMarkIcon className="w-10 h-10 text-gray-700 size-6" />
        </button>
        {children}
      </div>
    </div>
  );
}
