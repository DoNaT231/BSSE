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
        {/* ÓRIÁSI BSSE FELIRAT */}
        <h1
        className="
            font-[Anton] font-black
            leading-none
            text-transparent

            text-[8rem]
            sm:text-[12rem]
            md:text-[18rem]
            lg:text-[22rem]
            xl:text-[26rem]
            2xl:text-[32rem]

            h-auto
            mt-[10rem]
            min-[768px]:mt-[7rem]
            min-[1200px]:mt-[8rem]
            mb-[3rem]
        "
        style={{
            backgroundImage: "url(/images/kep8.jpg)",
            backgroundPosition: "center",
            backgroundSize: "cover",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
        }}
        >
        SMASH
        </h1>


        {/* CTA GOMBOK */}
        <div className="z-50 mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
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
