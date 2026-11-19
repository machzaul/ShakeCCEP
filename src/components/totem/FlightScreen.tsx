'use client';

import React from 'react';

interface FlightScreenProps {
  active: boolean;
  skyCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fcvCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fgCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fcv2CanvasRef: React.RefObject<HTMLCanvasElement | null>;
  jetRef: React.RefObject<HTMLImageElement | null>;
  flyHeroRef: React.RefObject<HTMLImageElement | null>;
  altvRef: React.RefObject<HTMLElement | null>;
  banRef: React.RefObject<HTMLDivElement | null>;
}

export const FlightScreen: React.FC<FlightScreenProps> = ({
  active,
  skyCanvasRef,
  fcvCanvasRef,
  fgCanvasRef,
  fcv2CanvasRef,
  jetRef,
  flyHeroRef,
  altvRef,
  banRef,
}) => {
  return (
    <section className={`scr ${active ? 'on' : ''}`} id="fly">
      <canvas ref={skyCanvasRef} id="sky" width="1080" height="1920" />
      <canvas ref={fcvCanvasRef} id="fcv" width="1080" height="1920" />
      <img ref={jetRef} className="jet" id="jet" src="/totem-assets/asset_24_2f27e99e.webp" alt="" />
      <img ref={flyHeroRef} className="flyHero" id="flyHero" src="/totem-assets/asset_25_7bfd0827.webp" alt="" />
      <canvas
        ref={fgCanvasRef}
        id="fg"
        width="1080"
        height="1920"
        style={{ position: 'absolute', inset: 0, zIndex: 7, pointerEvents: 'none' }}
      />
      <canvas
        ref={fcv2CanvasRef}
        id="fcv2"
        width="1080"
        height="1920"
        style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none' }}
      />
      <div className="alt">
        <small>DISTANCE</small>
        <b ref={altvRef} id="altv">
          0<span>km</span>
        </b>
      </div>
      <div ref={banRef} className="banner" id="ban" />
    </section>
  );
};
