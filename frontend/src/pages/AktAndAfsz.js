import Header from "../components/Header";
import { Link } from "react-router-dom";

/**
 * Adatkezelési tájékoztató + ÁSZF oldal
 * - Statikus tartalom
 * - Tailwind-del stílusozva (külön CSS fájl nélkül)
 * - Max-width, olvasható "document" layout
 */
export default function AktAndAfsz() {
  return (
    <div className="min-h-screen mt-32 bg-slate-50">
      {/* Globális fejléc */}
      <Header />

      {/* Oldaltér (padding + középre igazítás) */}
      <div className="px-4 py-10 sm:py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Dokumentum kártya */}
          <div className="bg-white shadow-sm rounded-2xl ring-1 ring-slate-200">
            <div className="p-6 sm:p-10">
              {/* Felső információs sor + opcionális visszalépés */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-slate-500">
                  BSSE • Jogi dokumentumok
                </span>

                {/* Ha nem kell, nyugodtan törölhető */}
                <Link
                  to="/"
                  className="text-sm font-medium underline text-slate-700 hover:text-slate-900 underline-offset-4"
                >
                  Vissza a kezdőlapra
                </Link>
              </div>

              {/* ===== ADATKEZELÉSI TÁJÉKOZTATÓ ===== */}

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
                Adatkezelési Tájékoztató – BSSE Weboldal
              </h1>

              <p className="mt-4 text-sm leading-7 sm:text-base text-slate-600">
                A regisztráció során az alábbi adatokat kérjük el Öntől:
              </p>

              <ul className="pl-5 mt-3 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>Felhasználónév</li>
                <li>E-mail cím</li>
                <li>Jelszó (titkosított formában kerül tárolásra)</li>
              </ul>

              <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-slate-900">
                Mire használjuk az adatokat?
              </h2>

              <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>
                  E-mail cím: kizárólag visszaigazolásra és opcionális
                  pályahasználati értesítésre.
                </li>
                <li>
                  Jelszó: biztonságos, hashelt (visszafejthetetlen) formában kerül
                  tárolásra.
                </li>
                <li>
                  Felhasználónév: azonosítás a foglalási rendszerben.
                </li>
              </ul>

              <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-slate-900">
                Mit nem csinálunk?
              </h2>

              <ul className="pl-5 mt-3 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>Nem küldünk hírlevelet vagy reklámot.</li>
                <li>Nem adjuk tovább harmadik félnek az adatokat.</li>
                <li>Csak a működéshez szükséges adatokat kérjük el.</li>
              </ul>

              <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-slate-900">
                Adatmegőrzés
              </h2>

              <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                Az adatokat kizárólag a szolgáltatás működtetéséhez szükséges ideig
                tároljuk. A fiók és az adatok törlése bármikor kérhető.
              </p>

              <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-slate-900">
                Kapcsolat
              </h2>

              <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                Kapcsolatfelvétel:{" "}
                <span className="font-medium">
                  almadistrandroplabda@gmail.com
                </span>
              </p>

              {/* ===== ÁSZF ===== */}

              <hr className="my-10 border-slate-200" />

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
                Általános Felhasználási Szabályzat (ÁSZF) – BSSE Weboldal
              </h1>

              <h2 className="mt-6 text-xl font-semibold sm:text-2xl text-slate-900">
                Szolgáltató adatai
              </h2>

              <ul className="pl-5 mt-3 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>Szolgáltató neve: Bognár Balázs</li>
                <li>Székhely: 8220, Balatonalmádi, Szilva köz 3 1/1</li>
                <li>E-mail: almadistrandroplabda@gmail.com</li>
                <li>Weboldal: https://balatonsse.hu</li>
              </ul>

              {/* (a további szöveges részek ugyanígy folytathatók változtatás nélkül) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
