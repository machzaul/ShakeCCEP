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
  isAudioMuted = false,
  onToggleAudio,
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

  // Format pts display (e.g. +10 PTS)
  const ptsDisplay = resData.pts.startsWith('+') ? `${resData.pts} PTS` : `+${resData.pts} PTS`;

  return (
    <section className={`scr ${active ? 'on' : ''}`} id="res">
      <canvas ref={rstCanvasRef} className="stars" id="rst" width="1080" height="1920" />

      {/* Top right Audio button as shown in design */}
      <button
        type="button"
        className="res-audio-btn"
        onClick={(e) => {
          e.stopPropagation();
          onToggleAudio?.();
        }}
        aria-label="Toggle Sound"
      >
        {isAudioMuted ? (
          <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
          </svg>
        )}
      </button>

      {/* Direct centered graphic without text heading, exactly as requested */}
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

      {/* Claim Points QR Box */}
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
            SCAN TO GET {ptsDisplay}
          </b>
          <p>
            Open the <strong style={{ color: 'var(--gold)' }}>Sales Rally microsite</strong> and scan this QR before the timer ends. Put the bottle back to finish early.
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
