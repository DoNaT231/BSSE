export default function ContactStatusModal({ isOpen, type, message, onClose }) {
    if (!isOpen) return null;
  
    const isSuccess = type === "success";
  
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-7 text-center shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
          <div
            className={`mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full ${
              isSuccess ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}
          >
            {isSuccess ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-9 w-9"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-9 w-9"
                stroke="currentColor"
                strokeWidth="2.4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
  
          <h3 className="text-2xl font-black text-[#101820]">
            {isSuccess ? "Sikeres üzenetküldés!" : "Sikertelen üzenetküldés"}
          </h3>
  
          <p className="mt-3 text-sm font-semibold leading-6 text-[#101820]/65">
            {message}
          </p>
  
          <button
            type="button"
            onClick={onClose}
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#101820] px-6 py-3.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(16,24,32,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0B1218]"
          >
            Rendben
          </button>
        </div>
      </div>
    );
  }