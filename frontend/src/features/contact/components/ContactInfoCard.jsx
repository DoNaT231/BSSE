export default function ContactInfoCard({ title, text, Icon }) {
    return (
      <div className="flex gap-4 rounded-3xl border border-white/40 bg-white/25 p-5 shadow-[0_14px_35px_rgba(14,91,120,0.12)] backdrop-blur-md">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-lg">
          {Icon ? <Icon className="h-6 w-6 text-[#25AEE4]" /> : null}
        </div>
  
        <div>
          <h3 className="mb-1 text-base font-black text-[#101820]">
            {title}
          </h3>
  
          <p className="text-sm font-semibold leading-6 text-[#101820]/70">
            {text}
          </p>
        </div>
      </div>
    );
  }