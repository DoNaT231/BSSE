import React from "react";
import Header from "../../components/Header";
import WaveDivider from "../../components/WaveDevider"; // nálad így van elnevezve
import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import GallerySection from "./sections/GallerySection";
import CalendarSection from "./sections/CalendarSection";
import SponsorSection from "./sections/SponsorSection";
import FooterSection from "./sections/FooterSection";

/**
 * HomePage (Landing)
 * -----------------
 * A landing oldal “összerakó” komponense.
 * Itt csak a szekciók sorrendje van, minden UI külön komponensben él.
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <div className="relative">
        <HeroSection />
        {/* HULLÁM ELVÁLASZTÓ */}
        <WaveDivider />
      </div>




      {/* ABOUT */}
      <AboutSection />

      {/* GALÉRIA */}
      <GallerySection />

      {/* PÁLYAFOGLALÁS (beágyazott heti naptár) */}
      <CalendarSection />

      {/* SZPONZORÁCIÓ */}
      <SponsorSection />

      {/* FOOTER + TÉRKÉP */}
      <FooterSection />
    </div>
  );
}
