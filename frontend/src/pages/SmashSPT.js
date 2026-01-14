import Header from "../components/Header";
import { Link } from "react-router-dom";

/**
 * SMASH Strandröplabda – Pályahasználati tájékoztató
 * - Statikus információs oldal
 * - Tailwind alapú, olvasható „házirend / dokumentum” layout
 */
export default function SmashSPT() {
  return (
    <div className="min-h-screen mt-32 bg-slate-50">
      {/* Globális fejléc */}
      <Header />

      {/* Oldaltér */}
      <div className="px-4 py-10 sm:py-12">
        <div className="w-full max-w-3xl mx-auto">
          {/* Dokumentum kártya */}
          <div className="bg-white shadow-sm rounded-2xl ring-1 ring-slate-200">
            <div className="p-6 sm:p-10">
              {/* Felső sáv */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-slate-500">
                  SMASH • Pályahasználat
                </span>

                <Link
                  to="/"
                  className="text-sm font-medium underline text-slate-700 hover:text-slate-900 underline-offset-4"
                >
                  Vissza a kezdőlapra
                </Link>
              </div>

              {/* ===== CÍM ===== */}
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900">
                SMASH STRANDRÖPLABDA – PÁLYAHASZNÁLATI TÁJÉKOZTATÓ
              </h1>

              <h2 className="mt-2 text-lg font-semibold sm:text-xl text-slate-700">
                Wesselényi Strand – Strandröplabda pályák
              </h2>

              <p className="mt-4 text-sm leading-7 sm:text-base text-slate-600">
                Üdvözlünk a Wesselényi strand röplabda pályáin! Örülünk, hogy nálunk
                sportolsz! Kérjük, olvasd el az alábbi házirendet, hogy mindenki
                biztonságban és jól érezze magát.
              </p>

              {/* ===== HÁZIREND ===== */}
              <h3 className="mt-8 text-xl font-semibold sm:text-2xl text-slate-900">
                🏐 Házirend
              </h3>

              {/* Szabadon használható */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Szabadon használható
              </h4>
              <ul className="pl-5 mt-2 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>A pálya előzetes engedély nélkül is igénybe vehető.</li>
                <li>
                  Kérünk, légy tekintettel másokra, és oszd meg a játékidőt, ha
                  többen érkeztek.
                </li>
              </ul>

              {/* Foglalás */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Elsőbbség a foglalásnak
              </h4>
              <ul className="pl-5 mt-2 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>
                  Amennyiben valamelyik idősávra ingyenes pályabérlés van
                  bejegyezve, a pályát az adott időszakra át kell adni a foglaló
                  félnek.
                </li>
                <li>
                  Foglalni két pályára van lehetőség:{" "}
                  <strong>Meló-Diák</strong> és <strong>Szomszédok</strong>. A{" "}
                  <strong>Man at Work</strong> pálya mindig szabadon használható.
                </li>
                <li>
                  Foglalás elérhető: 👉{" "}
                  <a
                    href="https://balatonsse.hu/palyafoglalas"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-blue-600 hover:underline"
                  >
                    https://balatonsse.hu/palyafoglalas
                  </a>
                </li>
                <li>
                  A foglalások a strand jegypénztáránál is megtekinthetők.
                </li>
                <li>
                  A foglalásra mindig előző nap 18:00-ig van lehetőség.
                </li>
              </ul>

              {/* Felszerelés */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                A felszerelés védelme
              </h4>
              <ul className="pl-5 mt-2 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>
                  A háló rángatása, az oszlopok döntögetése és a homokágy
                  rongálása tilos.
                </li>
                <li>
                  Ha hibát észlelsz, jelezd a strand személyzetének!
                </li>
              </ul>

              {/* Dohányzás */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Dohányzásmentes övezet
              </h4>
              <ul className="pl-5 mt-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>A pályák területén dohányozni tilos!</li>
              </ul>

              {/* Tisztaság */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Tisztaság és biztonság
              </h4>
              <ul className="pl-5 mt-2 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>
                  Kérjük, a szemetet a kijelölt kukákba dobd!
                </li>
                <li>
                  Üvegtárgyak és éles eszközök használata a homokon tilos,
                  balesetveszély miatt.
                </li>
              </ul>

              {/* Karbantartás */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Pályakarbantartás
              </h4>
              <ul className="pl-5 mt-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>
                  Ha a nap végén lehúzod a pályát (gereblyével elegyengeted a
                  homokot), vendégünk vagy egy következő játékra! 😊
                </li>
              </ul>

              {/* Vészhelyzet */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Elsősegély és vészhelyzet
              </h4>
              <ul className="pl-5 mt-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>19:00-ig fordulj a strand elsősegélyszobájához.</li>
                <li>
                  19:00 után vagy súlyosabb esetben hívd a <strong>112</strong>-t.
                </li>
              </ul>

              {/* Felelősség */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Felelősség
              </h4>
              <ul className="pl-5 mt-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                <li>A pálya használata saját felelősségre történik.</li>
                <li>
                  A szervezőket és üzemeltetőt nem terheli felelősség sem személyi
                  sérülésért, sem elveszett tárgyakért.
                </li>
              </ul>

              {/* Üzemeltetés */}
              <h4 className="mt-6 text-lg font-semibold text-slate-800">
                Üzemeltetés
              </h4>
              <p className="mt-2 text-sm leading-7 sm:text-base text-slate-600">
                A pályák működtetésére és bárminemű változtatásra kizárólag a{" "}
                <strong>Balatonalmádi strandüzemeltetés</strong> jogosult.
              </p>

              {/* Footer */}
              <p className="mt-10 text-sm font-medium text-center text-slate-600">
                Kellemes sportolást kívánunk!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
