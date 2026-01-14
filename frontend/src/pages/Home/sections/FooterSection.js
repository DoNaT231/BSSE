import React from "react";
import { Link } from "react-router-dom";
import LocationMap from "../../../components/Map";

/**
 * FooterSection
 * -------------
 * Információk + dokumentum linkek + térkép blokk.
 */
export default function FooterSection() {
  return (
    <footer className="bg-lightBlue text-white font-['Segoe_UI'] relative">
      <div className="max-w-[1200px] mx-auto p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:gap-10 md:text-left md:items-start">
          {/* Üzemeltető */}
          <div className="flex-1 min-w-[250px]">
            <h2 className="mb-4 text-2xl">A weboldal üzemeltetője:</h2>
            <ul className="pl-0 list-none list-disc md:list-disc md:pl-6">
              <li className="mb-2">Szolgáltató neve: Bognár Balázs</li>
              <li className="mb-2">Székhely: 8220, Balatonalmádi, Szilva köz 3 1/1</li>
              <li className="mb-2">E-mail: almadistrandroplabda@gmail.com</li>
              <li className="mb-2">Telefonszám: +36 70 280 3145</li>
            </ul>
          </div>

          {/* Dokumentumok */}
          <div className="flex-1 min-w-[250px]">
            <h2 className="mb-4 text-2xl">Dokumentumok</h2>
            <Link className="block text-[#002244] font-medium mb-2 hover:underline" to="/adatkezelesitajekoztatoesaszf">
              Adatkezelési Tájékoztató és ASZF
            </Link>
            <Link className="block text-[#002244] font-medium mb-2 hover:underline" to="/smashspt">
              Smash pályahasználati tájékoztató
            </Link>
          </div>
        </div>

        {/* Alsó szöveg */}
        <div className="text-center md:text-left">
          <p className="mb-3">
            A weboldalon keresztül elérhető pályafoglalási szolgáltatás magánszemélyként ingyenesen
            használható, kereskedelmi tevékenységet nem szolgál, ha cég szeretne foglalni, kérjük
            érdeklődjön az{" "}
            <a className="underline text-[#002244]" href="https://balatonalmadi.hu/kapcsolat/elerhetoseg">
              önkormányzatnál
            </a>
            !
          </p>
          <p>
            A weboldal jelenleg magánszemély által működtetett, a Balatoni Strandsport Egyesület
            megalakulását követően az üzemeltetési jogokat átadjuk az egyesületnek, amelyről az
            impresszum frissítésével tájékoztatjuk a felhasználókat.
          </p>
        </div>
      </div>

      {/* Térkép blokk */}
      <div className="w-full bg-[#1D1D1B] p-8 pb-16 overflow-hidden">
        <LocationMap />
      </div>
    </footer>
  );
}
