import React from "react";
import {
  TrophyIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

/**
 * AboutSection — Smash bemutatkozó: folyó szöveg + ikonos „Mit kínálunk?” kártyák.
 */
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
      aria-labelledby="about-heading"
      className="
        box-border bg-lightBlue px-4 pt-4 pb-20 font-[Montserrat] text-brandDark
        max-[940px]:mt-[-30px] max-[700px]:mt-[-10px]
        sm:py-20
      "
    >
      <div className="mx-auto max-w-6xl text-center">
        <h1
          id="about-heading"
          className="
            mt-0 font-[Anton] text-[2.65rem] font-normal leading-[1.08] tracking-[0.02em]
            text-brandDark max-[700px]:text-[2.05rem]
          "
        >
          Smash Strandröplabda Bajnokság
        </h1>

        <p
          className="
            mx-auto mt-5 max-w-2xl px-2 text-[1.2rem] font-semibold leading-snug text-white
            [text-shadow:0_1px_2px_rgba(35,31,32,0.18)] max-[700px]:mt-4 max-[700px]:text-[1.08rem]
          "
        >
          Üdvözlünk a Smash strandröplabda bajnokság hívatalos weboldalán!
        </p>
      </div>

      {/* Folyó bemutatkozó szöveg */}
      <div
        className="
          mx-auto mt-10 max-w-6xl px-[5%]
          grid gap-6 text-left
          text-[1.05rem] leading-[1.8] text-white/95
          md:grid-cols-2 md:gap-10
        "
      >
        <p className="text-pretty text-justify text-brandDark">
          A Smash Magyarország egyik legrégebbi és legmeghatározóbb amatőr strandröplabda
          bajnokságsorozata, amely évek óta biztosít versenyzési lehetőséget mindazok számára, akik
          szenvedélyesen szeretik a sportot és a közösségi élményeket. Célunk, hogy hidat képezzünk a
          hobbi játékosok és a versenysport világa között, miközben egy inspiráló és támogató
          közösséget építünk, ahol mindenki megtalálhatja a helyét.
        </p>
        <p className="text-pretty text-justify text-brandDark">
          Bajnokságaink évről évre fejlődnek: egyre magasabb színvonalú szervezéssel,
          professzionálisabb körülményekkel és bővülő lehetőségekkel várjuk a játékosokat. A Smash nem
          csupán verseny, hanem egy életérzés, ahol a nyári hangulat, a sport iránti szenvedély és a
          versenyszellem találkozik, valódi közösségi élményt teremtve minden résztvevő számára.
        </p>
      </div>

      {/* Mit kínálunk */}
      <div className="mx-auto mt-16 max-w-6xl px-[5%] max-[700px]:mt-12">
        <div className="mb-9 text-center max-[700px]:mb-7">
          <h2
            className="
              font-[Anton] text-[1.65rem] font-normal tracking-[0.04em] text-brandDark
              [text-shadow:0_1px_2px_rgba(35,31,32,0.15)] max-[700px]:text-xl
            "
          >
            Mit kínálunk?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[0.9rem] font-medium leading-snug text-white/85">
            Amit a pályán és a bajnokságban egyaránt megkapsz.
          </p>
        </div>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {OFFER_ITEMS.map(({ icon: Icon, text }) => (
            <li key={text} className="h-full">
              <article
                className="
                  group flex h-full flex-col items-center gap-3.5 rounded-2xl border border-white/55
                  bg-white/92 p-5 text-center shadow-[0_12px_36px_-18px_rgba(35,31,32,0.2)]
                  backdrop-blur-[2px] transition duration-300 ease-out
                  hover:-translate-y-1 hover:border-white/85 hover:bg-white/98
                  hover:shadow-[0_20px_44px_-16px_rgba(35,31,32,0.28)]
                  sm:gap-4 sm:p-6
                "
              >
                <span
                  className="
                    flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-xl
                    bg-primaryLight text-lightBlueStrong ring-1 ring-lightBlue/25
                    transition duration-300 group-hover:ring-lightBlue/40
                  "
                  aria-hidden
                >
                  <Icon className="h-7 w-7" strokeWidth={1.85} />
                </span>
                <p className="text-[0.97rem] font-semibold leading-snug text-brandDark max-[700px]:text-[0.91rem]">
                  {text}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>

      <p
        className="
          mx-auto mt-10 max-w-3xl px-[5%] text-center text-[1.08rem] font-semibold leading-relaxed text-white
          drop-shadow-sm max-[700px]:mt-8 max-[700px]:text-[1rem]
        "
      >
        Csatlakozz hozzánk, és tapasztald meg a Smash életérzést – ahol a sport,
        a verseny és a közösség találkozik!
      </p>
    </section>
  );
}
