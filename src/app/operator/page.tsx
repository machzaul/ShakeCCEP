'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface OperatorStatus {
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
  gameState: string;
  score: number;
  energy: number;
  totalShakes: number;
  lastEventTime: number;
  audioMuted: boolean;
  fps: number;
  updatedAt: number;
}

export default function OperatorPage() {
  const [status, setStatus] = useState<OperatorStatus>({
    connected: false,
    deviceName: 'COCA-COLA-BOTTLE',
    batteryLevel: 100,
    gameState: 'ATTRACT',
    score: 0,
    energy: 0,
    totalShakes: 0,
    lastEventTime: 0,
    audioMuted: false,
    fps: 60,
    updatedAt: Date.now(),
  });

  const [localIp, setLocalIp] = useState<string>('localhost');
  const [copied, setCopied] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isResettingDb, setIsResettingDb] = useState(false);

  // Poll server state every 500ms
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/operator');
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
        }
        if (data.localIp) {
          setLocalIp(data.localIp);
        }
      }
    } catch {
      // offline
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const sendAction = async (action: string, payload?: any, label?: string) => {
    try {
      setActionFeedback(label || action);
      setTimeout(() => setActionFeedback(null), 1800);

      await fetch('/api/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ACTION',
          action,
          payload,
        }),
      });
      fetchStatus();
    } catch (err) {
      console.error('Error sending action:', err);
    }
  };

  const handleResetLeaderboard = async () => {
    if (!confirm('Yakin ingin menghapus seluruh data skor & leaderboard offline?')) {
      return;
    }
    setIsResettingDb(true);
    try {
      const res = await fetch('/api/leaderboard', { method: 'DELETE' });
      if (res.ok) {
        setActionFeedback('LEADERBOARD DIHAPUS!');
        setTimeout(() => setActionFeedback(null), 2500);
      }
    } catch {
      setActionFeedback('GAGAL RESET DB');
    } finally {
      setIsResettingDb(false);
    }
  };

  const copyUrl = () => {
    const url = `http://${localIp}:3000/operator`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const batteryColor =
    status.batteryLevel <= 20
      ? 'text-red-500 bg-red-950/50 border-red-800'
      : status.batteryLevel <= 50
      ? 'text-amber-400 bg-amber-950/50 border-amber-800'
      : 'text-emerald-400 bg-emerald-950/50 border-emerald-800';

  const stateLabelMap: Record<string, { label: string; color: string }> = {
    ATTRACT: { label: 'STANDBY (IDLE)', color: 'bg-slate-700 text-slate-200' },
    IDLE: { label: 'STANDBY (IDLE)', color: 'bg-slate-700 text-slate-200' },
    COUNTDOWN: { label: 'COUNTDOWN 3-2-1', color: 'bg-amber-600 text-white animate-pulse' },
    PLAYING: { label: 'SEDANG KOCOK (10s)', color: 'bg-red-600 text-white animate-pulse' },
    FINISH: { label: 'WAKTU HABIS (LIFT OFF)', color: 'bg-purple-600 text-white' },
    FLIGHT: { label: 'ROKET TERBANG', color: 'bg-blue-600 text-white animate-pulse' },
    RESULT: { label: 'LAYAR HASIL & QR', color: 'bg-emerald-600 text-white' },
  };

  const curStateInfo = stateLabelMap[status.gameState] || {
    label: status.gameState,
    color: 'bg-slate-700 text-white',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none pb-12">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3.5 sticky top-0 z-30 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
            <h1 className="font-extrabold text-base tracking-wider uppercase text-red-500">
              COCA-COLA SHAKE
            </h1>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
            Mobile Staff
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Local Network Info Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-sm">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Akses dari HP (WiFi Sama)
            </span>
            <p className="font-mono text-xs text-amber-300 truncate font-semibold">
              http://{localIp}:3000/operator
            </p>
          </div>
          <button
            onClick={copyUrl}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-xs font-bold rounded-xl border border-slate-700 text-slate-200 transition-colors cursor-pointer shrink-0"
          >
            {copied ? 'Tersalin! ✓' : 'Salin URL'}
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Battery Status */}
          <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${batteryColor}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Baterai Controller
            </span>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-black">
                {status.batteryLevel != null ? `${status.batteryLevel}%` : 'N/A'}
              </span>
            </div>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full transition-all duration-500 ${
                  status.batteryLevel <= 20
                    ? 'bg-red-500'
                    : status.batteryLevel <= 50
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, status.batteryLevel))}%` }}
              />
            </div>
          </div>

          {/* BLE Connection */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Koneksi Bluetooth
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                  status.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              <span className="font-bold text-sm tracking-wide">
                {status.connected ? 'TERHUBUNG' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 truncate">
              {status.deviceName}
            </p>
          </div>
        </div>

        {/* Game State & Live Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Layar Game
            </span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${curStateInfo.color}`}
            >
              {curStateInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Energi Busa</span>
              <p className="text-xl font-bold font-mono text-red-500 mt-0.5">
                {Math.round(status.energy)}%
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Skor Poin</span>
              <p className="text-xl font-bold font-mono text-amber-400 mt-0.5">
                {status.score.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Kocokan</span>
              <p className="text-xl font-bold font-mono text-slate-200 mt-0.5">
                {status.totalShakes}
              </p>
            </div>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-600 text-white font-bold text-center text-sm py-2.5 px-4 rounded-xl shadow-lg animate-bounce">
            ✓ Perintah Terkirim: {actionFeedback}
          </div>
        )}

        {/* Remote Action Controls */}
        <div className="flex flex-col gap-2.5 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Tombol Kontrol Jarak Jauh (Remote)
          </span>

          {/* Quick Start / Shake */}
          <button
            onClick={() => sendAction('START', null, 'MULAI GAME (COUNTDOWN)')}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 active:scale-[0.98] transition-all rounded-2xl font-black text-base uppercase tracking-wider shadow-lg shadow-red-950/40 border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer text-white"
          >
            <span>🚀</span>
            <span>Mulai Permainan (Countdown)</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => sendAction('SHAKE', { intensity: 80 }, 'KOCOK NORMAL (80%)')}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all rounded-xl font-bold text-sm text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🥤</span>
              <span>Kocok (80%)</span>
            </button>

            <button
              onClick={() => sendAction('SHAKE', { intensity: 100 }, 'KOCOK MAX (100%)')}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all rounded-xl font-bold text-sm text-amber-400 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔥</span>
              <span>Kocok Max (100%)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => sendAction('RESET', null, 'RESET KE STANDBY')}
              className="py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition-all rounded-xl font-bold text-sm text-slate-300 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🔄</span>
              <span>Reset Standby</span>
            </button>

            <button
              onClick={() => sendAction('MUTE', null, status.audioMuted ? 'UNMUTE SUARA' : 'MUTE SUARA')}
              className={`py-3.5 rounded-xl font-bold text-sm transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                status.audioMuted
                  ? 'bg-amber-950/60 border-amber-800 text-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
            >
              <span>{status.audioMuted ? '🔇' : '🔊'}</span>
              <span>{status.audioMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
            </button>
          </div>
        </div>

        {/* Database Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Database Leaderboard
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-bold">SQLITE OFFLINE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Hapus riwayat skor dan leaderboard pemain jika ingin memulai hari/event baru dari nol.
          </p>
          <button
            onClick={handleResetLeaderboard}
            disabled={isResettingDb}
            className="w-full py-3 bg-red-950/40 hover:bg-red-900/60 active:scale-[0.98] text-red-300 border border-red-800/60 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            {isResettingDb ? 'MENGHAPUS...' : '⚠️ RESET SEMUA SKOR LEADERBOARD'}
          </button>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 pt-2">
          Halaman ini berjalan di jaringan lokal dan tidak mengganggu layar permainan.
        </div>
      </main>
    </div>
  );
}
