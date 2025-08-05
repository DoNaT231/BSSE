import React from 'react';
import './WaveDivider.css';

const WaveDivider = () => {
  return (
<svg viewBox="0 0 1320 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
  {/* Legalsó hullám */}
  <path
    d="
      M0, 200 
      C220, 100, 440, 100, 660, 200
      C880, 300, 1100, 300, 1320, 200
      L1320 500
      L0 500
    "
    fill="var(--lightBlue)"
    style={{ transform: 'translateY(0px)' }}
    opacity="1"
  />

  {/* Középső hullám - kicsit feljebb */}
  <path
    d="
      M0, 200 
      C220, 100, 440, 100, 660, 200
      C880, 300, 1100, 300, 1320, 200
      L1320 500
      L0 500
    "
    fill="var(--lightBlue)"
    style={{ transform: 'translateY(-10px)' }}
    opacity="0.7"
  />

  {/* Legfelső hullám - még feljebb */}
  <path
    d="
      M0, 200 
      C220, 100, 440, 100, 660, 200
      C880, 300, 1100, 300, 1320, 200
      L1320 500
      L0 500
    "
    fill="var(--lightBlue)"
    style={{ transform: 'translateY(-20px)' }}
    opacity="0.4"
  />
</svg>
  );
};

export default WaveDivider;