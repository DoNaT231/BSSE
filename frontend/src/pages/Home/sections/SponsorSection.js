import React from "react";
import PartnerPdfLogo from "../../../components/PartnerPdfLogo";

const PARTNER_LOGOS = [
  { file: "maw_logo.pdf", label: "Man at Work", link: "https://manatwork.hu" },
  { file: "MD_logo_4C.pdf", label: "Meló-Diák", link: "https://melodiak.hu" },
  { file: "szomszedok-age-logo.pdf", label: "Szomszédok", link: "https://szomszedok.eu" },
];

export default function SponsorSection() {
  return (
    <section
      id="szponzorok"
      className="relative overflow-hidden bg-gradient-to-b from-white via-[#EAF8FD] to-[#25AEE4] px-5 py-24 font-[Montserrat] text-[#101820]"
    >
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#25AEE4]/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-28 bottom-8 h-80 w-80 rounded-full bg-white/25 blur-xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.28em] text-[#25AEE4]">
            Partnereink
          </span>

          <h2 className="text-4xl font-black leading-tight text-[#101820] md:text-5xl">
            Szponzoraink
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-[#101820]/70 md:text-lg">
            Büszkék vagyunk partnereinkre, akik támogatásukkal hozzájárulnak a
            Smash strandröplabda bajnokságok és közösségi események sikeres
            megvalósításához.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PARTNER_LOGOS.map(({ file, label, link }) => {
            const href = `/logos/${file}`;

            return (
              <a
                key={file}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} weboldal megnyitása`}
                className="group relative flex min-h-[190px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/60 bg-white/75 p-7 text-center shadow-[0_18px_45px_rgba(13,80,110,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(13,80,110,0.2)]"
              >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

                <div className="mb-5 flex h-24 w-full items-center justify-center rounded-3xl border border-[#25AEE4]/10 bg-white px-6 shadow-inner">
                  <PartnerPdfLogo
                    pdfUrl={href}
                    label={label}
                    maxHeightPx={64}
                    maxWidthPx={170}
                  />
                </div>

                <span className="text-base font-black text-[#101820]">
                  {label}
                </span>

                <span className="mt-2 text-sm font-semibold text-[#101820]/55 transition group-hover:text-[#25AEE4]">
                  Partner weboldal megnyitása
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}