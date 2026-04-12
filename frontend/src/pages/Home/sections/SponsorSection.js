import React from "react";
import PartnerPdfLogo from "../../../components/PartnerPdfLogo";

const PARTNER_LOGOS = [
  { file: "maw_logo.pdf", label: "Man at Work" },
  { file: "MD_logo_4C.pdf", label: "Meló-Diák" },
  { file: "szomszedok-age-logo.pdf", label: "Szomszédok" },
];

export default function SponsorSection() {
  return (
    <section
      className="
        bg-[#fdfdfd] px-4 sm:px-6 lg:px-8 py-16 md:py-20
        font-[Montserrat] text-[var(--Black)]
        mx-auto w-full max-w-6xl
      "
    >
      {/* Cím */}
      <h2 className="text-[2.3rem] text-[#005fa3] text-center mb-3">
        Szponzoraink
      </h2>

      {/* Leírás */}
      <p className="text-[1.15rem] text-center max-w-2xl mx-auto mb-10 text-[#555]">
        Büszkék vagyunk partnereinkre, akik támogatásukkal hozzájárulnak a Smash
        strandröplabda bajnokságok és közösségi események sikeres
        megvalósításához. Együtt építjük a balatoni strandsport közösséget.
      </p>

      {/* Logók */}
      <div className="grid grid-cols-3 gap-5 max-[600px]:grid-cols-1">
        {PARTNER_LOGOS.map(({ file, label }) => {
          const href = `/logos/${file}`;

          return (
            <a
              key={file}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                bg-white
                rounded-[15px]
                shadow-[0_2px_6px_rgba(0,0,0,0.1)]
                p-5
                flex flex-col items-center justify-center
                transition duration-200
                hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]
              "
            >
              <div className="h-[60px] flex items-center justify-center mb-3">
                <PartnerPdfLogo
                  pdfUrl={href}
                  label={label}
                  maxHeightPx={50}
                  maxWidthPx={120}
                />
              </div>

              <span className="text-[0.95rem] text-[#333] font-medium">
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}