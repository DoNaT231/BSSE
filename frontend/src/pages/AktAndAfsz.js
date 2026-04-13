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
    <div className="page-root--alt">
      <Header />

      <div className="page-main">
        <div className="page-document-wrap">
          <div className="page-document-inner">
            <div className="bg-white shadow-sm rounded-2xl ring-1 ring-slate-200">
              <div className="p-6 sm:p-10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-slate-500">
                    BSSE • Jogi dokumentumok
                  </span>

                  <Link
                    to="/"
                    className="text-sm font-medium underline text-slate-700 hover:text-brandDark underline-offset-4"
                  >
                    Vissza a kezdőlapra
                  </Link>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-brandDark">
                  Adatkezelési Tájékoztató
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  Hatályos: 2026.04.13.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  1. Adatkezelő adatai
                </h2>
                <ul className="pl-5 mt-3 space-y-1 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>Adatkezelő / üzemeltető: Bognár Balázs</li>
                  <li>Székhely: 8220 Balatonalmádi, Szilva köz 3 1/1</li>
                  <li>E-mail: almadistrandroplabda@gmail.com</li>
                  <li>Telefonszám: +36 70 280 3145</li>
                  <li>Weboldal: https://balatonsse.hu</li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  2. A kezelt adatok köre
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A weboldal működése során az alábbi adatokat kezeljük:
                </p>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    <span className="font-semibold">Fiók és azonosítás:</span>{" "}
                    felhasználónév, e-mail cím, jelszó hash, szerepkör, aktív státusz,
                    Balatonalmádi lakóhelyre utaló jelölés, telefonszám.
                  </li>
                  <li>
                    <span className="font-semibold">Foglalási adatok:</span> pálya,
                    kezdő és záró időpont, foglalás státusza, eseménytípus,
                    létrehozó felhasználó azonosítója.
                  </li>
                  <li>
                    <span className="font-semibold">Versenynevezési adatok:</span>{" "}
                    verseny azonosító, csapatnév, kapcsolattartó e-mail, telefonszám,
                    játékosok listája, nevezési státusz, fizetési jelölés.
                  </li>
                  <li>
                    <span className="font-semibold">Profil adatok:</span> saját
                    profilban megjelenített felhasználói adatok és saját foglalások /
                    nevezések.
                  </li>
                  <li>
                    <span className="font-semibold">Technikai naplóadatok:</span>{" "}
                    kérés időpontja, IP cím, végpont URL, HTTP metódus, státuszkód,
                    feldolgozási idő, query / param / body, valamint az
                    Authorization fejléc megléte és a hitelesített user azonosító adatai.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  3. Adatkezelés célja és jogalapja
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    <span className="font-semibold">Regisztráció és bejelentkezés:</span>{" "}
                    a felhasználói fiók létrehozása, hitelesítés, jogosultságkezelés.
                  </li>
                  <li>
                    <span className="font-semibold">Pályafoglalás:</span> foglalások
                    létrehozása, módosítása, törlése, naptárnézet megjelenítése.
                  </li>
                  <li>
                    <span className="font-semibold">Versenykezelés:</span> nevezések
                    fogadása, adminisztráció, státusz- és fizetési állapot kezelése.
                  </li>
                  <li>
                    <span className="font-semibold">Biztonság és hibakeresés:</span>{" "}
                    naplózás, jogosulatlan hozzáférés felismerése, rendszerhibák
                    kivizsgálása.
                  </li>
                  <li>
                    <span className="font-semibold">Jogalap:</span> szerződés teljesítése,
                    jogos érdek (üzemeltetés és biztonság), valamint egyes esetekben a
                    felhasználó önkéntes adatmegadása.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  4. Token és munkamenet-kezelés
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A bejelentkezett állapotot JWT token biztosítja, amelyet a böngésző
                  helyi tárhelye (localStorage) tárol. Érvénytelen vagy lejárt token
                  esetén a rendszer automatikusan kijelentkezteti a felhasználót, és
                  új bejelentkezést kér.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  5. Adattovábbítás és adatfeldolgozók
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    <span className="font-semibold">Brevo (e-mail szolgáltató):</span>{" "}
                    tranzakciós e-mailek küldéséhez (pl. foglalási visszaigazolás,
                    versenynevezési értesítés) a címzett neve és e-mail címe, valamint az
                    üzenethez szükséges adatok továbbításra kerülhetnek.
                  </li>
                  <li>
                    <span className="font-semibold">OpenStreetMap csempeszolgáltatás:</span>{" "}
                    a térképes megjelenítés során a felhasználó IP címe és technikai
                    kérései a térképszolgáltató felé továbbítódhatnak.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  6. Adatmegőrzés
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A személyes adatokat a szolgáltatás működtetéséhez szükséges ideig,
                  illetve a jogszabályi kötelezettségek teljesítéséhez szükséges
                  időtartamig őrizzük meg. A naplóadatok megőrzési idejét az
                  üzemeltetési és biztonsági szükségletek határozzák meg.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  7. Érintetti jogok
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  Az érintett jogosult tájékoztatást kérni a róla kezelt adatokról,
                  kérheti azok helyesbítését, törlését, kezelésének korlátozását, valamint
                  tiltakozhat az adatkezelés ellen. Kérelmét az üzemeltető elérhetőségein
                  nyújthatja be.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  8. Jogorvoslat
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  Panaszával az adatkezelőhöz fordulhat, illetve jogorvoslatért a
                  Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH) vagy
                  bíróságnál élhet.
                </p>

                <hr className="my-10 border-slate-200" />

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-brandDark">
                  Általános Szerződési Feltételek (ÁSZF)
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  Hatályos: 2026.04.13.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  1. Szolgáltatás tárgya
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A szolgáltatás strandröplabda pályafoglalási és versenynevezési
                  lehetőséget biztosít a weboldalon keresztül, valamint kapcsolódó
                  felhasználói és adminisztrációs funkciókat nyújt.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  2. Regisztráció és felhasználói fiók
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>A felhasználó köteles valós adatokat megadni.</li>
                  <li>
                    A felhasználó felel a fiókjához tartozó hozzáférési adatok
                    bizalmasságáért.
                  </li>
                  <li>
                    A szolgáltató jogosult inaktív vagy szabályszegő fiókot korlátozni,
                    felfüggeszteni vagy törölni.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  3. Pályafoglalás szabályai
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    A foglalás csak a rendszerben elérhető szabad idősávokra adható le.
                  </li>
                  <li>
                    A szolgáltató fenntartja a jogot foglalások módosítására vagy
                    törlésére üzemeltetési, technikai vagy szervezési okból.
                  </li>
                  <li>
                    Admin jogosultsággal a foglalások kezelése (beleértve a törlést)
                    biztosított.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  4. Versenynevezés szabályai
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    A nevezés a megadott határidőig adható le vagy módosítható.
                  </li>
                  <li>
                    A nevezési státusz (pl. megerősített / várólistás) a rendszer
                    kapacitása és admin döntése alapján alakulhat.
                  </li>
                  <li>
                    A felhasználó felel a nevezés során megadott adatok pontosságáért.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  5. Díjazás és felhasználási keret
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A weboldalon elérhető pályafoglalási szolgáltatás magánszemélyként
                  ingyenesen használható, és nem minősül kereskedelmi szolgáltatásnak.
                  Céges foglalási igény esetén külön egyeztetés szükséges.
                </p>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  6. Felelősségkorlátozás
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>
                    A szolgáltató törekszik a folyamatos működésre, de nem vállal
                    teljes rendelkezésre állási garanciát.
                  </li>
                  <li>
                    A szolgáltató nem felel az internetkapcsolatból, külső
                    szolgáltatóból vagy vis maior helyzetből eredő kiesésekért.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  7. Tiltott magatartások
                </h2>
                <ul className="pl-5 mt-3 space-y-2 text-sm leading-7 list-disc sm:text-base text-slate-700">
                  <li>Jogszabályba ütköző vagy visszaélésszerű használat.</li>
                  <li>Más felhasználó fiókjának jogosulatlan használata.</li>
                  <li>
                    A rendszer működésének szándékos zavarása vagy a technikai
                    védelem megkerülésére irányuló tevékenység.
                  </li>
                </ul>

                <h2 className="mt-8 text-xl font-semibold sm:text-2xl text-brandDark">
                  8. Záró rendelkezések
                </h2>
                <p className="mt-3 text-sm leading-7 sm:text-base text-slate-600">
                  A szolgáltató jogosult az ÁSZF és az Adatkezelési Tájékoztató
                  egyoldalú módosítására. A mindenkor hatályos verzió a weboldalon
                  kerül közzétételre. A jelen feltételekre a magyar jog irányadó.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
