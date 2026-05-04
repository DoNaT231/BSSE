import React from "react";
import Header from "../../components/Header";
import WaveDivider from "../../components/WaveDevider"; // nálad így van elnevezve
import HeroSection from "./sections/HeroSection";
import AboutSection from "./sections/AboutSection";
import GallerySection from "./sections/GallerySection";
import SponsorSection from "./sections/SponsorSection";
import SiteFooter from "../../components/SiteFooter";
import ContactSection from "../../features/contact/components/ContactSection";

/**
 * HomePage (Landing)
 * -----------------
 * A landing oldal “összerakó” komponense.
 * Itt csak a szekciók sorrendje van, minden UI külön komponensben él.
 */
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex min-w-0 flex-1 flex-col">
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

        {/* SZPONZORÁCIÓ */}
        <SponsorSection />

        {/* KONTAKT */}
        <ContactSection/>
      </div>

      <SiteFooter />
    </div>
  );
}
