'use client';

import React, { useMemo } from 'react';
import qrConfig from '@/config/qrMatrix.json';

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
  isAudioMuted?: boolean;
  onToggleAudio?: () => void;
}

export const ResultScreenTotem: React.FC<ResultScreenTotemProps> = ({
  active,
  rstCanvasRef,
  resData,
  resTimer,
}) => {
  // Extract 100% crisp pixel matrix from the user's uploaded QR image
  const qrRects = useMemo(() => {
    const rects: { x: number; y: number }[] = [];
    const matrix = qrConfig.matrix;
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          rects.push({ x: c, y: r });
        }
      }
    }
    return rects;
  }, []);

  const progressPercent = Math.max(0, Math.min(100, (resTimer / 60) * 100));

  return (
    <section
      className={`scr ${active ? 'on' : ''} ${resData.key === 'unstop' ? 'unst' : ''}`}
      id="res"
    >
      <canvas ref={rstCanvasRef} className="stars" id="rst" width="1080" height="1920" />

      {/* Top Heading */}
      <div className="rTop">
        <small>YOU FLEW TO</small>
        <h2 id="rName">{resData.name}</h2>
      </div>

      {/* Planet / Cap Graphic and Hero */}
      <div className="pl rPl" id="rPl" data-k={resData.key} />
      <img className="rHero" src="/totem-assets/asset_19_8aeeb229.webp" alt="" />

      {/* Stats Cards: DISTANCE, FUEL, POINTS */}
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

      {/* Rank Card */}
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

      {/* Claim Points QR Box matching coke-it-up-totem (3).html */}
      <div className="rBot">
        <div className="qr" title={`Voucher Code: ${qrConfig.data}`}>
          <svg
            id="qrsvg"
            viewBox="0 0 21 21"
            shapeRendering="crispEdges"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <rect width="21" height="21" fill="#fff" />
            {qrRects.map((r, i) => (
              <rect key={i} x={r.x} y={r.y} width={1} height={1} fill="#1D0E0F" />
            ))}
          </svg>
        </div>
        <div className="qt">
          <small>CLAIM YOUR POINTS</small>
          <b>
            Scan to get <span id="qPts">{resData.pts}</span> pts
          </b>
          <p>
            Open the <strong>Sales Rally microsite</strong> and scan this QR before the timer ends. Put the bottle back to finish early.
          </p>
          <div
            className="tmr"
            id="tmr"
            style={{ ['--tw' as string]: `${progressPercent}%` } as React.CSSProperties}
          >
            <i />
            <span>
              Closes in <span id="rt">{resTimer}</span>s
            </span>
          </div>
        </div>
      </div>
      <div className="again" id="again">
        Put the bottle back anytime to finish
      </div>
    </section>
  );
};
