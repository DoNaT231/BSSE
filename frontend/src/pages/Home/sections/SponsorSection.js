import React from "react";

/**
 * SponsorSection
 * - max 900px container
 * - 2 oszlop (mobilon 1)
 * - “card” stílus eredetihez hasonló
 */
export default function SponsorSection() {
  return (
    <section
      className="
        bg-[#fdfdfd]
        px-5 py-[60px]
        font-[Montserrat]
        text-[var(--Black)]
        max-w-[900px]
        mx-auto
      "
    >
      <h2 className="text-[2.5rem] text-[#005fa3] text-center mb-[10px]">
        Szponzorációs lehetőségek a BSSE-nél
      </h2>

      <p className="text-[1.2rem] text-center max-w-[900px] mx-auto mb-10 text-[#555]">
        A Balatoni Strandsport Egyesület várja azon partnerek jelentkezését, akik szeretnének jelen
        lenni a Balaton északi partjának egyik leglátogatottabb strandján. Legyen szó helyi
        vállalkozásról vagy országos márkáról, nálunk lehetőség van valódi közösségépítő jelenlétre.
      </p>

      <div className="grid grid-cols-2 gap-5 justify-center mb-[50px] max-[500px]:grid-cols-1">
        {[
          {
            t: "🎤 Bemondásos hirdetés",
            d: "A versenyek alatt rendszeres hangosbemondásokkal hívjuk fel a figyelmet partnereinkre, promóciós üzenetekkel és márkamegjelöléssel.",
          },
          {
            t: "🏆 Névadási lehetőség",
            d: "Legyen egy eseményünk, vagy akár maga az egyesület a Te márkád nevét viselő projekt – erősítsd megítélésedet és ismertségedet hosszú távon!",
          },
          {
            t: "📢 Hirdetési felület",
            d: "Roll-up, molinó, beachflag – kiemelt, vizuálisan jól látható helyeken jelenhetsz meg sporteseményeinken és szociális média felületeinken.",
          },
          {
            t: "🌊 Megjelenés a strandon",
            d: "A Balatonalmádi Wesselényi strand az északi part egyik leglátogatottabb pontja. Szponzoraink számára célzott és figyelemfelkeltő helyszíni jelenlétet biztosítunk.",
          },
        ].map((x) => (
          <div
            key={x.t}
            className="
            w-full
            h-full
              self-center
              bg-[#eef6fb]
              p-5
              rounded-[15px]
              shadow-[0_2px_6px_rgba(0,0,0,0.1)]
              max-w-[400px]
            "
          >
            <h3 className="text-[1.3rem] mb-[10px]">{x.t}</h3>
            <p className="text-[1rem] text-[#444]">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#eef6fb] p-[30px] rounded-[15px] text-center">
        <h4 className="text-[1.5rem] text-[var(--darkBlue)] mb-[10px]">Érdekel a lehetőség?</h4>
        <p className="text-[1rem] my-[5px]">
          📧{" "}
          <a
            className="text-[var(--yellow)] underline"
            href="mailto:almadistrandroplabda@gmail.com?subject=Tárgy&body=Szöveg"
          >
            almadistrandroplabda@gmail.com
          </a>
        </p>
        <p className="text-[1rem] my-[5px]">📞 +36 70 280 3145</p>
        <p className="text-[1rem] my-[5px]">
          Szívesen egyeztetünk személyesen vagy e-mailben – kérj ajánlatot még ma!
        </p>
      </div>
    </section>
  );
}
