import { useContactForm } from "../hooks/useContactForm";
import ContactStatusModal from "./ContactStatusModal";

const inputClassName =
  "w-full rounded-2xl border border-[#174B64]/20 bg-white px-4 py-4 text-sm font-semibold text-[#101820] outline-none transition placeholder:text-[#101820]/40 focus:border-[#25AEE4] focus:ring-4 focus:ring-[#25AEE4]/15";

export default function ContactForm() {
    const {
        formData,
        isSubmitting,
        modalState,
        handleChange,
        handleSubmit,
        closeModal,
      } = useContactForm();

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className="rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(13,80,110,0.22)] backdrop-blur-md md:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-black text-[#101820]">
            Név
          </label>
          <input
            type="text"
            name="name"
            placeholder="Teljes neved"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-black text-[#101820]">
            Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="pelda@email.hu"
            value={formData.email}
            onChange={handleChange}
            required
            className={inputClassName}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-black text-[#101820]">
          Telefonszám
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="+36 ..."
          value={formData.phone}
          onChange={handleChange}
          className={inputClassName}
        />
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-black text-[#101820]">
          Üzenet
        </label>
        <textarea
          name="message"
          placeholder="Például: érdekelne a bajnokság, pályát szeretnék foglalni, vagy kérdésem van a jelentkezéssel kapcsolatban."
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className={`${inputClassName} resize-y`}
        />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-[#25AEE4]/20 bg-[#25AEE4]/10 p-4 text-sm font-semibold leading-6 text-[#101820]/70 transition hover:border-[#25AEE4]/40 hover:bg-[#25AEE4]/15">
        <input
            type="checkbox"
            name="accepted"
            checked={formData.accepted}
            onChange={handleChange}
            required
            className="mt-1 h-4 w-4 shrink-0 accent-[#25AEE4]"
        />

        <span>
            <span className="font-black text-[#101820]">
            Kötelező elfogadás:{" "}
            </span>
            Elfogadom, hogy a Smash az űrlapon megadott adataimat
            kapcsolatfelvétel és tájékoztatás céljából kezelje.
            <span className="ml-1 font-black text-red-500">*</span>
        </span>
        </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#101820] px-7 py-4 text-base font-black text-white shadow-[0_14px_28px_rgba(16,24,32,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0B1218] hover:shadow-[0_18px_34px_rgba(16,24,32,0.28)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
        {isSubmitting ? "Küldés folyamatban..." : "Üzenet küldése"}
        </button>

    </form>
     <ContactStatusModal
     isOpen={modalState.isOpen}
     type={modalState.type}
     message={modalState.message}
     onClose={closeModal}
   />
 </>
  );
}