'use client';

import React from 'react';
import { GameState } from '@/types/game';
import { calculateFlightDistance, getFlightTier } from '@/config/gameConfig';

interface GameplayHUDProps {
  gameState: GameState;
  score: number;
  shakes: number;
  energy: number;
  timeRemaining: number;
  flightDistance: number;
  targetFlightDistance: number;
  onTriggerShake?: () => void;
}

export const GameplayHUD: React.FC<GameplayHUDProps> = ({
  gameState,
  score,
  shakes,
  energy,
  timeRemaining,
  flightDistance,
  targetFlightDistance,
  onTriggerShake,
}) => {
  if (gameState !== 'PLAYING' && gameState !== 'FLIGHT') {
    return null;
  }

  const liveProjectedDistance = calculateFlightDistance(score, shakes);
  const currentTier = getFlightTier(gameState === 'FLIGHT' ? flightDistance : liveProjectedDistance);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 pt-10 pb-8 px-6 flex flex-col justify-between select-none">
      {/* Top Header: Score & Timer / Flight Stats */}
      <div className="flex justify-between items-start gap-3 w-full">
        {/* Left: Total Score */}
        <div className="bg-black/70 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-xl flex flex-col min-w-[120px]">
          <span className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">SCORE</span>
          <span className="text-3xl md:text-4xl font-display font-black text-white tracking-wider">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Center: Stage Specific Info */}
        {gameState === 'PLAYING' && (
          <div className="flex flex-col items-center gap-1.5 flex-1">
            {/* 10-second Countdown Timer */}
            <div className="bg-coke-red px-6 py-2 rounded-full border-2 border-white shadow-[0_0_20px_rgba(244,0,0,0.5)] flex items-center gap-2">
              <span className="text-xs font-bold tracking-widest text-white uppercase">SISA WAKTU</span>
              <span className="text-3xl font-display font-black text-white tracking-wider">
                {timeRemaining}s
              </span>
            </div>

            {/* Live Projected Distance based on points earned so far */}
            <div className="bg-black/75 backdrop-blur-md px-4 py-1 rounded-full border border-amber-400/60 shadow flex items-center gap-2 text-center">
              <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                PROYEKSI:
              </span>
              <span className="text-lg font-display font-black text-amber-400">
                {liveProjectedDistance.toLocaleString()} M
              </span>
              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase text-black"
                style={{ backgroundColor: currentTier.color }}
              >
                {currentTier.badge}
              </span>
            </div>
          </div>
        )}

        {gameState === 'FLIGHT' && (
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className="bg-black/80 border-2 border-amber-400 px-6 py-2 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.4)] flex flex-col items-center">
              <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">ALTITUDE</span>
              <span className="text-3xl font-display font-black text-white tracking-wider">
                {flightDistance.toLocaleString()} <span className="text-lg text-amber-300">M</span>
              </span>
            </div>
            <div
              className="text-[10px] px-3 py-0.5 rounded-full font-bold tracking-wider text-black shadow-md uppercase"
              style={{ backgroundColor: currentTier.color }}
            >
              {currentTier.title}
            </div>
          </div>
        )}

        {/* Right: Shakes Count or Flight Peak */}
        <div className="bg-black/70 backdrop-blur-md border border-white/20 px-4 py-3 rounded-2xl shadow-xl flex flex-col items-end min-w-[120px]">
          {gameState === 'PLAYING' ? (
            <>
              <span className="text-[11px] font-semibold tracking-widest text-slate-300 uppercase">SHAKES</span>
              <span className="text-3xl md:text-4xl font-display font-black text-coke-red tracking-wider">
                {shakes}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold tracking-widest text-slate-300 uppercase">TARGET</span>
              <span className="text-2xl font-display font-bold text-slate-200 tracking-wider">
                {targetFlightDistance.toLocaleString()} M
              </span>
            </>
          )}
        </div>
      </div>

      {/* Bottom Bar: Energy Charge Bar & Button A Shake Trigger */}
      {gameState === 'PLAYING' && (
        <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 pb-4">
          {/* Interactive Button A for direct shake detection in portrait */}
          <button
            onClick={onTriggerShake}
            className="w-full pointer-events-auto group py-4 px-6 bg-gradient-to-r from-coke-red to-red-600 hover:from-red-500 hover:to-coke-red active:scale-95 text-white font-display font-black text-2xl tracking-wider rounded-2xl border-2 border-white shadow-[0_0_25px_rgba(244,0,0,0.6)] flex items-center justify-center gap-3 cursor-pointer transition-all duration-150 animate-bounce-slight"
            title="Klik atau Tekan Tombol [A] di Keyboard"
          >
            <span className="w-9 h-9 bg-white text-coke-red rounded-xl flex items-center justify-center font-black text-2xl shadow">
              A
            </span>
            <span>SHAKE BOTOL (TEKAN A)</span>
          </button>

          <div className="flex justify-between w-full px-2 text-xs font-bold tracking-widest text-slate-700 uppercase drop-shadow-sm">
            <span>BOTTLE CHARGE</span>
            <span>{Math.round(energy)}%</span>
          </div>
          <div className="w-full h-5 bg-black/20 rounded-full p-1 border border-black/30 backdrop-blur-sm overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-coke-red to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(244,0,0,0.6)]"
              style={{ width: `${Math.min(100, Math.max(2, energy))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

