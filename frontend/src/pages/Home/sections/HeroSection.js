import React from "react";
import { Link } from "react-router-dom";

/**
 * HeroSection
 * -----------
 * Pixelpontos fordítás az eredeti CSS-ből,
 * Tailwind theme színekkel (yellow, blackSoft, lightBlue).
 */
export default function HeroSection() {
  return (
    <section
      className="
        bg-white
        min-h-[400px]
        pb-12
        sm:pb-24
        md:pb-36
        lg:pb-52
        xl:pb-72
        flex flex-col justify-center
        text-center
        box-border
      "
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* ÓRIÁSI SMASH FELIRAT (mobilon is adaptív, stabil helyfoglalással) */}
        <div className="mt-[6.25rem] mb-8 w-full px-2 sm:mt-[7rem] sm:px-4 lg:mt-[8rem]">
          <div className="mx-auto flex h-[clamp(13rem,42vw,24rem)] w-full max-w-[1600px] items-center justify-center overflow-hidden rounded-2xl">
            <h1
              className="
                font-[Anton] font-black
                leading-[0.95]
                tracking-[0.01em]
                text-transparent
                text-[clamp(7.2rem,31vw,23rem)]
                px-1
              "
              style={{
                backgroundImage: "url(/images/kep8.jpg)",
                backgroundPosition: "center",
                backgroundSize: "115% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SMASH
            </h1>
          </div>
        </div>


        {/* CTA GOMBOK */}
        <div className="z-50 mt-4 flex flex-col items-center justify-center gap-4 sm:mt-8 sm:flex-row">
          <Link to="/palyafoglalas">
            <button
              className="
                h-[48px] w-[188px]
                rounded-[10px]
                bg-yellow
                text-blackSoft
                font-sans font-semibold text-lg
                shadow-[0px_4px_10px_rgba(35,31,32,0.45)]
                transition-transform
                duration-[400ms]
                hover:scale-110
              "
            >
              Pálya foglalás
            </button>
          </Link>

          <Link to="/versenyek">
            <button
              className="
                h-[48px] w-[188px]
                rounded-[10px]
                bg-blackSoft
                text-white
                font-sans font-semibold text-lg
                shadow-[0px_4px_10px_rgba(35,31,32,0.45)]
                transition-transform
                duration-[400ms]
                hover:scale-110
                border border-white/10
              "
            >
              Versenyjelentkezés
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
