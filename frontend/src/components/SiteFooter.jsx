import React from "react";
import { Link } from "react-router-dom";
import LocationMap from "./Map";

/**
 * Közös lábléc minden nyilvános oldalhoz — háttér: márka sötét (design token).
 */
export default function SiteFooter() {
  return (
    <footer className="relative bg-brandDark font-['Segoe_UI'] text-white">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-8 p-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:gap-10 md:text-left">
          <div className="min-w-[250px] flex-1">
            <h2 className="mb-4 text-2xl font-semibold">A weboldal üzemeltetője:</h2>
            <ul className="list-none pl-0 md:list-disc md:pl-6">
              <li className="mb-2">Szolgáltató neve: Bognár Balázs</li>
              <li className="mb-2">Székhely: 8220, Balatonalmádi, Szilva köz 3 1/1</li>
              <li className="mb-2">E-mail: almadistrandroplabda@gmail.com</li>
              <li className="mb-2">Telefonszám: +36 70 280 3145</li>
            </ul>
          </div>

          <div className="min-w-[250px] flex-1">
            <h2 className="mb-4 text-2xl font-semibold">Dokumentumok</h2>
            <Link
              className="mb-2 block font-medium text-lightBlue transition hover:text-white hover:underline"
              to="/adatkezelesitajekoztatoesaszf"
            >
              Adatkezelési Tájékoztató és ASZF
            </Link>
            <Link
              className="mb-2 block font-medium text-lightBlue transition hover:text-white hover:underline"
              to="/smashspt"
            >
              Smash pályahasználati tájékoztató
            </Link>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="mb-3 text-white/90">
            A weboldalon keresztül elérhető pályafoglalási szolgáltatás magánszemélyként ingyenesen
            használható, kereskedelmi tevékenységet nem szolgál, ha cég szeretne foglalni, kérjük
            érdeklődjön az{" "}
            <a
              className="font-medium text-lightBlue underline-offset-2 transition hover:text-white hover:underline"
              href="https://balatonalmadi.hu/kapcsolat/elerhetoseg"
            >
              önkormányzatnál
            </a>
            !
          </p>
          <p className="text-white/85">
            A weboldal jelenleg magánszemély által működtetett, a Balatoni Strandsport Egyesület
            megalakulását követően az üzemeltetési jogokat átadjuk az egyesületnek, amelyről az
            impresszum frissítésével tájékoztatjuk a felhasználókat.
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full overflow-hidden bg-brandInk">
        <LocationMap />
      </div>
    </footer>
  );
}
