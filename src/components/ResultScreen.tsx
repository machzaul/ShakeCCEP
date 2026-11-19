'use client';

import React, { useEffect, useState } from 'react';
import { GameResult, LeaderboardEntry } from '@/types/game';
import { audioManager } from '@/lib/audioManager';
import { getFlightTier } from '@/config/gameConfig';

interface ResultScreenProps {
  result: GameResult | null;
  onPlayAgain: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ result, onPlayAgain }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Play celebratory result sound
    audioManager.playResultFanfare();

    // Fetch top 5 high scores from local SQLite
    async function loadLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard?limit=5');
        const data = await res.json();
        if (data.success && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadLeaderboard();
  }, []);

  const handlePlayAgainClick = () => {
    audioManager.playButtonClick();
    onPlayAgain();
  };

  const tier = result ? getFlightTier(result.flightDistance) : null;

  return (
    <div className="absolute inset-0 bg-black text-white flex flex-col items-center justify-between pt-8 pb-6 px-6 select-none z-30 overflow-y-auto">
      {/* 1. Header Branding */}
      <div className="flex flex-col items-center z-10">
        <h1 className="text-3xl font-serif italic font-black text-coke-red tracking-wide drop-shadow-md">
          Coca-Cola
        </h1>
        <div className="h-0.5 w-16 bg-coke-red mt-1 rounded-full" />
      </div>

      {/* 2. Moon Visual & Title Section in Portrait */}
      <div className="relative flex flex-col items-center z-10 my-auto w-full max-w-md">
        {/* Glowing Circular Element */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-300 shadow-[0_0_60px_rgba(255,255,255,0.4)] flex items-center justify-center">
          <div className="w-8 h-24 bg-black/80 rounded-full blur-[1px] transform -rotate-6" />
        </div>

        {/* Title: "TAKE IT UP!" */}
        <h2 className="mt-3 text-5xl md:text-6xl font-display font-black tracking-wider text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] uppercase text-center">
          TAKE IT UP!
        </h2>

        {/* Ranking & Tier Badges */}
        <div className="mt-2 flex flex-col items-center gap-2">
          <div className="px-6 py-1.5 rounded-full bg-coke-red/90 border-2 border-white shadow-[0_0_20px_rgba(244,0,0,0.5)]">
            <span className="text-2xl font-display font-black tracking-widest uppercase text-white">
              RANKING {result?.ranking || '1/1'}
            </span>
          </div>
          {tier && (
            <div
              className="px-4 py-1 rounded-full text-black font-display font-black text-sm tracking-wider uppercase shadow-md"
              style={{ backgroundColor: tier.color }}
            >
              {tier.title}
            </div>
          )}
        </div>

        {/* Total Score & Flight Altitude Cards */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 w-full">
          {/* Total Score */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex flex-col items-center shadow-lg text-center">
            <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase">SCORE</span>
            <span className="text-2xl md:text-3xl font-display font-black text-white mt-1">
              {(result?.totalScore || 0).toLocaleString()}
            </span>
          </div>

          {/* Flight Distance */}
          <div className="bg-white/10 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 flex flex-col items-center shadow-[0_0_20px_rgba(255,215,0,0.15)] text-center">
            <span className="text-[10px] font-semibold tracking-wider text-amber-300 uppercase">ALTITUDE</span>
            <span className="text-2xl md:text-3xl font-display font-black text-amber-400 mt-1">
              {(result?.flightDistance || 0).toLocaleString()} <span className="text-xs">M</span>
            </span>
          </div>

          {/* Shakes */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 flex flex-col items-center shadow-lg text-center">
            <span className="text-[10px] font-semibold tracking-wider text-slate-300 uppercase">SHAKES</span>
            <span className="text-2xl md:text-3xl font-display font-black text-coke-red mt-1">
              {result?.totalShakes || 0}
            </span>
          </div>
        </div>

        {/* Local Leaderboard Preview Table */}
        <div className="mt-4 w-full bg-white/5 border border-white/15 rounded-2xl p-3 backdrop-blur-sm">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2 text-center">
            LOCAL HALL OF FAME
          </h3>
          {isLoading ? (
            <div className="text-center py-3 text-slate-400 text-xs">Loading local scores...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-3 text-slate-400 text-xs">First champion session recorded!</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {leaderboard.map((item) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center px-3 py-1.5 rounded-xl text-xs font-medium ${
                    item.sessionId === result?.sessionId
                      ? 'bg-coke-red/30 border border-coke-red font-bold text-white'
                      : 'bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 font-display font-black text-sm text-amber-400">#{item.rank}</span>
                    <span className="truncate max-w-[120px]">{item.playerName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-300 font-mono">{item.flightDistance.toLocaleString()} M</span>
                    <span className="font-display font-bold text-sm text-white">
                      {item.totalScore.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Lower Action: Red "PLAY AGAIN" Button */}
      <div className="flex flex-col items-center z-10 w-full max-w-sm pb-2 mt-3">
        <button
          onClick={handlePlayAgainClick}
          className="w-full py-4 px-8 bg-coke-red hover:bg-coke-darkred text-white text-2xl md:text-3xl font-display font-black tracking-widest uppercase rounded-2xl shadow-[0_8px_30px_rgba(244,0,0,0.6)] hover:shadow-[0_12px_40px_rgba(244,0,0,0.85)] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/40 cursor-pointer"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
};

