'use client';

import React from 'react';
import { audioManager } from '@/lib/audioManager';

interface AttractScreenProps {
  onStartGame: () => void;
  controllerConnected: boolean;
}

export const AttractScreen: React.FC<AttractScreenProps> = ({ onStartGame, controllerConnected }) => {
  const handlePlayClick = () => {
    audioManager.playButtonClick();
    onStartGame();
  };

  return (
    <div className="absolute inset-0 bg-black text-white flex flex-col items-center justify-between py-12 px-8 overflow-hidden select-none z-20">
      {/* 1. Header Branding */}
      <div className="flex flex-col items-center z-10">
        <h1 className="text-4xl md:text-5xl font-serif italic font-black text-coke-red tracking-wide drop-shadow-md">
          Coca-Cola
        </h1>
        <div className="h-1 w-24 bg-coke-red mt-1 rounded-full" />
      </div>

      {/* 2. Central Celestial / Moon Visual and Title */}
      <div className="relative flex flex-col items-center justify-center my-auto z-10">
        {/* Large Glowing Moon circular element */}
        <div className="relative w-72 h-72 md:w-88 md:h-88 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_0_90px_rgba(255,255,255,0.45)] flex items-center justify-center">
          {/* Subtle moon surface textures */}
          <div className="absolute top-12 left-14 w-12 h-12 rounded-full bg-slate-300/40" />
          <div className="absolute top-24 right-16 w-16 h-16 rounded-full bg-slate-300/35" />
          <div className="absolute bottom-16 left-28 w-20 h-20 rounded-full bg-slate-300/30" />
          <div className="absolute top-1/2 left-8 w-8 h-8 rounded-full bg-slate-300/35" />

          {/* Central Contour Bottle Silhouette Shadow on Moon */}
          <div className="w-16 h-48 bg-black/85 rounded-full blur-[1px] transform -rotate-6 shadow-lg" />
        </div>

        {/* Main Title: "COKE IT UP!" */}
        <h2 className="mt-8 text-7xl md:text-9xl font-display font-black tracking-wider text-white drop-shadow-[0_6px_12px_rgba(0,0,0,0.9)] uppercase">
          COKE IT UP!
        </h2>

        {/* Supporting Tagline */}
        <p className="mt-2 text-xl md:text-2xl font-body font-semibold tracking-widest text-slate-300 uppercase">
          SHAKE TO CHARGE • LAUNCH TO THE STARS
        </p>
      </div>

      {/* 3. Lower Action Area: Prominent Red "PLAY GAME" Button */}
      <div className="flex flex-col items-center z-10 w-full max-w-md pb-4">
        <button
          onClick={handlePlayClick}
          className="w-full py-6 px-10 bg-coke-red hover:bg-coke-darkred text-white text-3xl md:text-4xl font-display font-black tracking-widest uppercase rounded-2xl shadow-[0_8px_30px_rgba(244,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(244,0,0,0.85)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40 cursor-pointer"
        >
          PLAY GAME
        </button>

        {/* Hardware Status Indicator Pill */}
        <div className="mt-4 flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs tracking-wider uppercase text-slate-300">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              controllerConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>{controllerConnected ? 'BOTTLE CONTROLLER READY' : 'CONTROLLER READY (SIMULATOR ENABLED)'}</span>
        </div>
      </div>
    </div>
  );
};

