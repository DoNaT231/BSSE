import React from "react";
import {
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

const OFFER_ITEMS = [
  {
    icon: TrophyIcon,
    text: "Szervezett amatőr strandröplabda bajnokságok",
  },
  {
    icon: ChartBarIcon,
    text: "Pontgyűjtő versenyrendszer és szezonális ranglisták",
  },
  {
    icon: UserGroupIcon,
    text: "Közösségépítő események és sportélmények",
  },
  {
    icon: BuildingOffice2Icon,
    text: "Folyamatosan fejlődő infrastruktúra és szervezés",
  },
];

export default function AboutSection() {
  return (
    <section
      id="rolunk"
      aria-labelledby="about-heading"
      className="relative overflow-hidden bg-lightBlue px-5 py-24 font-[Montserrat] text-[#101820]"
    >
      <div className="pointer-events-none absolute -left-28 top-20 h-80 w-80 rounded-full bg-white/25 blur-2xl" />
      <div className="pointer-events-none absolute -right-28 bottom-16 h-80 w-80 rounded-full bg-[#25AEE4]/15 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block text-xs font-black uppercase tracking-[0.28em] text-white">
            Rólunk
          </span>

          <h1
            id="about-heading"
            className="text-4xl font-black leading-tight text-[#101820] md:text-6xl"
          >
            Smash Strandröplabda Bajnokság
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold leading-8 text-[#101820]/75 md:text-lg">
            Üdvözlünk a Smash strandröplabda bajnokság hivatalos weboldalán!
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <article className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_18px_45px_rgba(13,80,110,0.12)] backdrop-blur-md md:p-8">
            <p className="text-justify text-base font-semibold leading-8 text-[#101820]/75 md:text-[1.05rem]">
              A Smash Magyarország egyik legrégebbi és legmeghatározóbb amatőr
              strandröplabda bajnokságsorozata, amely évek óta biztosít
              versenyzési lehetőséget mindazok számára, akik szenvedélyesen
              szeretik a sportot és a közösségi élményeket. Célunk, hogy hidat
              képezzünk a hobbi játékosok és a versenysport világa között,
              miközben egy inspiráló és támogató közösséget építünk, ahol
              mindenki megtalálhatja a helyét.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-[0_18px_45px_rgba(13,80,110,0.12)] backdrop-blur-md md:p-8">
            <p className="text-justify text-base font-semibold leading-8 text-[#101820]/75 md:text-[1.05rem]">
              Bajnokságaink évről évre fejlődnek: egyre magasabb színvonalú
              szervezéssel, professzionálisabb körülményekkel és bővülő
              lehetőségekkel várjuk a játékosokat. A Smash nem csupán verseny,
              hanem egy életérzés, ahol a nyári hangulat, a sport iránti
              szenvedély és a versenyszellem találkozik, valódi közösségi
              élményt teremtve minden résztvevő számára.
            </p>
          </article>
        </div>

        <div className="mt-16">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.25em] text-[#25AEE4]">
              Amit adunk
            </span>

            <h2 className="text-3xl font-black leading-tight text-[#101820] md:text-4xl">
              Mit kínálunk?
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm font-semibold leading-6 text-[#101820]/60 md:text-base">
              Amit a pályán és a bajnokságban egyaránt megkapsz.
            </p>
          </div>

          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {OFFER_ITEMS.map(({ icon: Icon, text }) => (
              <li key={text} className="h-full">
                <article className="group flex h-full flex-col items-center justify-center rounded-[2rem] border border-white/70 bg-white/80 p-6 text-center shadow-[0_18px_45px_rgba(13,80,110,0.12)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(13,80,110,0.2)]">
                  <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#25AEE4]/10 text-[#25AEE4] ring-1 ring-[#25AEE4]/20 transition duration-300 group-hover:bg-[#25AEE4] group-hover:text-white">
                    <Icon className="h-8 w-8" strokeWidth={1.8} />
                  </div>

                  <p className="text-sm font-black leading-6 text-[#101820] md:text-[0.97rem]">
                    {text}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-12 max-w-3xl rounded-[2rem] border border-white/70 bg-[#101820] px-6 py-7 text-center shadow-[0_20px_50px_rgba(16,24,32,0.18)] md:px-10">
          <p className="text-base font-bold leading-8 text-white md:text-lg">
            Csatlakozz hozzánk, és tapasztald meg a Smash életérzést – ahol a
            sport, a verseny és a közösség találkozik!
          </p>
        </div>
      </div>
    </section>
  );
}