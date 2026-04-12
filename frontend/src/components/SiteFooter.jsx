import React from "react";
import { Link } from "react-router-dom";
import LocationMap from "./Map";
import PartnerPdfLogo from "./PartnerPdfLogo";

const PARTNER_LOGOS = [
  { file: "maw_logo.pdf", label: "Man at Work" },
  { file: "MD_logo_4C.pdf", label: "Meló-Diák" },
  { file: "szomszedok-age-logo.pdf", label: "Szomszédok" },
];

function PartnerLogoLink({ file, label }) {
  const href = `/logos/${file}`;

  return (
      <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex h-10 items-center justify-center rounded-md px-2 bg-white overflow-hidden
        transition duration-200 hover:opacity-100 hover:bg-white/5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-lightBlue/60
        focus-visible:ring-offset-2 focus-visible:ring-offset-brandDark
      "
      aria-label={`${label} — logó (PDF megnyitása új lapon)`}
      title={label}
    >
      <PartnerPdfLogo
        pdfUrl={href}
        label={label}
        maxHeightPx={28}
        maxWidthPx={90}
      />
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="bg-brandDark font-['Segoe_UI'] text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {/* felső rész */}
        <div className="grid gap-8 border-b border-white/10 pb-6 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-semibold text-white/95">
              A weboldal üzemeltetője
            </h2>

            <ul className="space-y-2 text-[0.98rem] leading-relaxed text-white/80">
              <li>
                <span className="font-semibold text-white/95">Szolgáltató neve:</span>{" "}
                Bognár Balázs
              </li>
              <li>
                <span className="font-semibold text-white/95">Székhely:</span>{" "}
                8220, Balatonalmádi, Szilva köz 3 1/1
              </li>
              <li>
                <span className="font-semibold text-white/95">E-mail:</span>{" "}
                <a
                  href="mailto:almadistrandroplabda@gmail.com"
                  className="transition hover:text-lightBlue"
                >
                  almadistrandroplabda@gmail.com
                </a>
              </li>
              <li>
                <span className="font-semibold text-white/95">Telefonszám:</span>{" "}
                <a
                  href="tel:+36702803145"
                  className="transition hover:text-lightBlue"
                >
                  +36 70 280 3145
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-semibold text-white/95">
              Dokumentumok
            </h2>

            <div className="flex flex-col gap-2 text-[0.98rem]">
              <Link
                className="font-medium text-lightBlue transition hover:text-white hover:underline"
                to="/adatkezelesitajekoztatoesaszf"
              >
                Adatkezelési Tájékoztató és ASZF
              </Link>

              <Link
                className="font-medium text-lightBlue transition hover:text-white hover:underline"
                to="/smashspt"
              >
                Smash pályahasználati tájékoztató
              </Link>
            </div>
          </div>
        </div>

        {/* középső szöveg */}
        <div className="py-5 text-[0.95rem] leading-7 text-white/78">
          <p className="mb-3">
            A weboldalon keresztül elérhető pályafoglalási szolgáltatás
            magánszemélyként ingyenesen használható, kereskedelmi tevékenységet
            nem szolgál. Ha cég szeretne foglalni, kérjük érdeklődjön az{" "}
            <a
              className="font-medium text-lightBlue transition hover:text-white hover:underline"
              href="https://balatonalmadi.hu/kapcsolat/elerhetoseg"
              target="_blank"
              rel="noopener noreferrer"
            >
              önkormányzatnál
            </a>
            .
          </p>

          <p>
            A weboldal jelenleg magánszemély által működtetett. A Balatoni
            Strandsport Egyesület megalakulását követően az üzemeltetési jogokat
            átadjuk az egyesületnek, amelyről az impresszum frissítésével
            tájékoztatjuk a felhasználókat.
          </p>
        </div>

        {/* partnerek egy sorban */}
        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold tracking-wide text-white/75">
            Partnereink
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            {PARTNER_LOGOS.map((item) => (
              <PartnerLogoLink key={item.file} {...item} />
            ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden border-t border-white/10 bg-brandInk">
        <LocationMap />
      </div>
    </footer>
  );
}