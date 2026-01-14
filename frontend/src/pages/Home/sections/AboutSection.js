import React from "react";

/**
 * AboutSection (about-us)
 * - lightBlue háttér
 * - -mt: negatív felső margó (desktop: -10%, tablet: -30px, mobile: -10px)
 * - 2 oszlopos szöveg, mobilon 1 oszlop
 */
export default function AboutSection() {
  return (
    <section
      className="
        min-h-[480px]
        bg-lightBlue
        text-center
        text-[var(--Black)]
        box-border
        max-[940px]:mt-[-30px]
        max-[700px]:mt-[-10px]
        font-[Montserrat]
      "
    >
      <h1
        className="
          font-[Anton]
          text-[2.5rem]
          mt-0 mb-4
          max-[700px]:text-[2rem]
        "
      >
        Üdvözlünk a Balatoni Strandsport Egyesület (BSSE) hivatalos oldalán!
      </h1>

      <h2
        className="
          text-[1.5rem] font-semibold
          mt-0 mb-10
          px-[5%]
          text-[#315ea2]
          max-[700px]:text-[1.25rem]
        "
      >
        Egyesületünk célja, hogy a strandsportok szerelmeseinek minőségi, közösségi és élménydús
        sportolási lehetőséget biztosítsunk a Balaton partján.
      </h2>

      <div className="grid grid-cols-2 max-[940px]:grid-cols-1">
        <div className="px-[5%] text-justify">
          <p className="text-[1.25rem] max-[700px]:text-[1rem]">
            A BSSE 2025-ben alakult lelkes sportkedvelők kezdeményezésére, azzal a vízióval, hogy a
            nyári szezonban rendszeres sportprogramokat, bajnokságokat és barátságos mérkőzéseket
            szervezzünk Balatonalmádiban. Pályáink közvetlenül a strand mellett helyezkednek el, így
            a játék élménye összefonódik a balatoni nyár hangulatával.
          </p>
        </div>

        <div className="px-[5%] text-justify">
          <p className="text-[1.25rem] max-[700px]:text-[1rem]">
            Legyen szó hobbi-, vagy versenysportról, nálunk mindenki megtalálhatja a helyét – a
            pályáink online ingyenesen foglalhatók, így könnyedén biztosíthatod a helyed barátaiddal
            vagy csapatoddal. Gyere, és sportolj velünk – élvezd a nyarat, a homokot és a csapatjáték
            örömét!
          </p>
        </div>
      </div>
    </section>
  );
}