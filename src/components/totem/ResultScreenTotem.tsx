'use client';

import React, { useMemo } from 'react';

export interface TotemResultData {
  name: string;
  key: string;
  dist: string;
  fuel: string;
  pts: string;
  rkN: number;
  rkT: number;
  rkTxt: string;
}

interface ResultScreenTotemProps {
  active: boolean;
  rstCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  resData: TotemResultData;
  resTimer: number;
}

export const ResultScreenTotem: React.FC<ResultScreenTotemProps> = ({
  active,
  rstCanvasRef,
  resData,
  resTimer,
}) => {
  // Procedural QR SVG matching the original HTML
  const qrRects = useMemo(() => {
    const rects: { x: number; y: number; w: number; h: number; fill: string }[] = [];
    let seed = 7;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const fin = (x: number, y: number) => {
      rects.push({ x, y, w: 7, h: 7, fill: '#1D0E0F' });
      rects.push({ x: x + 1, y: y + 1, w: 5, h: 5, fill: '#fff' });
      rects.push({ x: x + 2, y: y + 2, w: 3, h: 3, fill: '#1D0E0F' });
    };
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < 21; x++) {
        if ((x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)) continue;
        if (rnd() > 0.5) {
          rects.push({ x, y, w: 1, h: 1, fill: '#1D0E0F' });
        }
      }
    }
    fin(0, 0);
    fin(14, 0);
    fin(0, 14);
    return rects;
  }, []);

  const progressPercent = Math.max(0, Math.min(100, (resTimer / 60) * 100));

  return (
    <section className={`scr ${active ? 'on' : ''}`} id="res">
      <canvas ref={rstCanvasRef} className="stars" id="rst" width="1080" height="1920" />
      <div className="rTop">
        <small>YOU FLEW TO</small>
        <h2 id="rName">{resData.name}</h2>
      </div>
      <div className="pl rPl" id="rPl" data-k={resData.key} />
      <img className="rHero" src="/totem-assets/asset_19_8aeeb229.webp" alt="" />
      <div className="rStats">
        <div>
          <small>DISTANCE</small>
          <b id="rDist">{resData.dist}</b>
        </div>
        <div>
          <small>FUEL</small>
          <b id="rFuel">{resData.fuel}</b>
        </div>
        <div className="pt">
          <small>POINTS</small>
          <b id="rPts">{resData.pts}</b>
        </div>
      </div>
      <div className="rank">
        <small>YOUR RANK TODAY</small>
        <b>
          <span id="rkN">{resData.rkN}</span>
          <em>
            / <span id="rkT">{resData.rkT}</span>
          </em>
        </b>
        <p id="rkTxt">{resData.rkTxt}</p>
      </div>

      <div className="rBot">
        <div className="qr">
          <svg id="qrsvg" viewBox="0 0 21 21" shapeRendering="crispEdges">
            {qrRects.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.fill} />
            ))}
          </svg>
        </div>
        <div className="qt">
          <small>CLAIM YOUR POINTS</small>
          <b>
            Scan to get <span id="qPts">{resData.pts}</span> pts
          </b>
          <p>
            Open the <strong>Sales Rally app</strong> and scan this QR before the timer ends. Put the bottle back to finish early.
          </p>
          <div className="tmr" id="tmr" style={{ ['--tw' as string]: `${progressPercent}%` } as React.CSSProperties}>
            <i />
            <span>
              Closes in <span id="rt">{resTimer}</span>s
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
