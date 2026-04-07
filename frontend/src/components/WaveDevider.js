import React from "react";
import "./WaveDivider.css";

/**
 * WaveDivider
 * -----------
 * Hullámos elválasztó komponens.
 *
 * FONTOS:
 * - A `.wave-svg` és `.wave-path` class-ek miatt
 *   az animáció CSAK erre az SVG-re vonatkozik
 * - Nem rontja el a Heroicons / modal X ikonokat
 */
const WaveDivider = () => {
  return (
    <svg
      className="absolute bottom-0 w-full h-auto pointer-events-none wave-svg"
      viewBox="0 0 1320 500"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        className="wave-path wave-1"
        fill="#60a5fa"
        opacity="1"
        d="M0,200 C220,100 440,100 660,200 C880,300 1100,300 1320,200 L1320 500 L0 500"
      />

      <path
        className="wave-path wave-2"
        fill="#60a5fa"
        opacity="0.7"
        d="M0,200 C220,100 440,100 660,200 C880,300 1100,300 1320,200 L1320 500 L0 500"
      />

      <path
        className="wave-path wave-3"
        fill="#60a5fa"
        opacity="0.4"
        d="M0,200 C220,100 440,100 660,200 C880,300 1100,300 1320,200 L1320 500 L0 500"
      />

    </svg>
  );
};

export default WaveDivider;
