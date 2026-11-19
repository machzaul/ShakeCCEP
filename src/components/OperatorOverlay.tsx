'use client';

import React, { useState, useEffect } from 'react';
import { ControllerStatus, GameState } from '@/types/game';
import { hardwareBridge } from '@/lib/hardwareBridge';
import { audioManager } from '@/lib/audioManager';

interface OperatorOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  score: number;
  energy: number;
  onResetSession: () => void;
}

export const OperatorOverlay: React.FC<OperatorOverlayProps> = ({
  isOpen,
  onClose,
  gameState,
  score,
  energy,
  onResetSession,
}) => {
  const [status, setStatus] = useState<ControllerStatus>(hardwareBridge.getStatus());
  const [audioMuted, setAudioMuted] = useState(!audioManager.isEnabled());
  const [fps, setFps] = useState(60);
  const [dbStatus, setDbStatus] = useState('READY');
  const [isResettingDb, setIsResettingDb] = useState(false);

  useEffect(() => {
    const unsub = hardwareBridge.onStatus((s) => setStatus(s));
    return unsub;
  }, []);

  // Simple FPS calculation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const loop = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  if (!isOpen) return null;

  const handleSimulateShake = (intensity: number) => {
    hardwareBridge.simulateShake(intensity);
  };

  const handleToggleAudio = () => {
    const newMute = !audioMuted;
    setAudioMuted(newMute);
    audioManager.setEnabled(!newMute);
  };

  const handleResetLeaderboard = async () => {
    if (!confirm('Are you sure you want to completely erase the local SQLite leaderboard?')) {
      return;
    }
    setIsResettingDb(true);
    try {
      const res = await fetch('/api/leaderboard', { method: 'DELETE' });
      if (res.ok) {
        setDbStatus('LEADERBOARD ERASED');
        setTimeout(() => setDbStatus('READY'), 3000);
      }
    } catch {
      setDbStatus('ERROR RESETTING DB');
    } finally {
      setIsResettingDb(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white select-none">
      <div className="bg-slate-900 border-2 border-red-600 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-wider text-coke-red uppercase flex items-center gap-3">
              <span>OPERATOR DIAGNOSTIC CONSOLE</span>
              <span className="text-xs bg-red-600/30 text-red-400 px-3 py-1 rounded-full border border-red-500/30">
                HIDDEN
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Windows Mini PC Offline Arcade Runtime Monitor</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-600 cursor-pointer"
          >
            CLOSE (ESC / O)
          </button>
        </div>

        {/* Diagnostic Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* BLE Connection */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-bold">BLE CONTROLLER</span>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  status.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="font-mono font-bold text-sm">
                {status.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">Device: {status.name}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="text-slate-400">Battery:</span>
              <span
                className={`font-mono font-bold ${
                  (status.batteryLevel ?? 100) <= 20
                    ? 'text-red-400'
                    : (status.batteryLevel ?? 100) <= 50
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {status.batteryLevel !== undefined ? `${status.batteryLevel}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* WebSocket Bridge */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-bold">WEBSOCKET BRIDGE</span>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  status.connected ? 'bg-green-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-mono font-bold text-sm">PORT 8765</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Events: {status.totalEvents}</p>
          </div>

          {/* Game State & FPS */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-bold">STATE & FPS</span>
            <div className="font-mono text-base font-bold text-amber-400 mt-1">{gameState}</div>
            <p className="text-xs text-slate-400 mt-1">Performance: {fps} FPS</p>
          </div>

          {/* Local SQLite Status */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-xs text-slate-400 uppercase font-bold">SQLITE DB</span>
            <div className="font-mono text-sm font-bold text-emerald-400 mt-1">{dbStatus}</div>
            <p className="text-xs text-slate-400 mt-1">Location: data/coke_shake.db</p>
          </div>
        </div>

        {/* Runtime Session Metrics */}
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">SESSION SCORE</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{score.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">CURRENT BOTTLE CHARGE</span>
            <p className="text-2xl font-bold font-mono text-coke-red mt-1">{Math.round(energy)}%</p>
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase font-bold">LAST EVENT</span>
            <p className="text-sm font-mono text-slate-300 mt-2">
              {status.lastEventTime
                ? new Date(status.lastEventTime).toLocaleTimeString()
                : 'NO EVENTS'}
            </p>
          </div>
        </div>

        {/* Operator Controls & Actions */}
        <div className="flex flex-col gap-3">
          <span className="text-xs text-slate-400 uppercase font-bold">MANUAL ACTIONS & HARDWARE TESTING</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleSimulateShake(80)}
              className="px-4 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xs uppercase cursor-pointer"
            >
              TEST SHAKE (INTENSITY 80)
            </button>
            <button
              onClick={() => handleSimulateShake(100)}
              className="px-4 py-3 bg-red-700 hover:bg-red-600 rounded-xl font-bold text-xs uppercase cursor-pointer"
            >
              TEST SHAKE (MAX 100)
            </button>
            <button
              onClick={handleToggleAudio}
              className={`px-4 py-3 rounded-xl font-bold text-xs uppercase cursor-pointer ${
                audioMuted ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {audioMuted ? 'UNMUTE AUDIO' : 'MUTE GLOBAL AUDIO'}
            </button>
            <button
              onClick={onResetSession}
              className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs uppercase cursor-pointer"
            >
              RESTART SESSION
            </button>
          </div>
        </div>

        {/* Database Management */}
        <div className="flex justify-between items-center border-t border-slate-800 pt-4 text-xs text-slate-400">
          <span>Keyboard shortcut: Press [O] or [Ctrl + Shift + D] to toggle console anytime</span>
          <button
            onClick={handleResetLeaderboard}
            disabled={isResettingDb}
            className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700 rounded-lg font-semibold uppercase cursor-pointer"
          >
            {isResettingDb ? 'RESETTING...' : 'RESET LOCAL LEADERBOARD'}
          </button>
        </div>
      </div>
    </div>
  );
};

