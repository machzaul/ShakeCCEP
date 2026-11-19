'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { hardwareBridge } from '@/lib/hardwareBridge';
import { audioManager } from '@/lib/audioManager';
import { OperatorOverlay } from '@/components/OperatorOverlay';
import { IdleScreen } from '@/components/totem/IdleScreen';
import { ShakeScreen } from '@/components/totem/ShakeScreen';
import { FlightScreen } from '@/components/totem/FlightScreen';
import { ResultScreenTotem, TotemResultData } from '@/components/totem/ResultScreenTotem';
import {
  DEST,
  Dest,
  HERO_FRAMES,
  JETF_FRAMES,
  CLOUD_SRCS,
  PLANET_SRCS,
  SHOUTS,
  reachIdx,
  fmtKm,
  distAt,
  ease,
  skyAt,
  loadPlays,
  savePlays,
} from '@/config/totemData';
import { GameState, ShakeEvent } from '@/types/game';
import '@/app/totem.css';

export const TotemGame: React.FC = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const skyCanvasRef = useRef<HTMLCanvasElement>(null);
  const fcvCanvasRef = useRef<HTMLCanvasElement>(null);
  const fcv2CanvasRef = useRef<HTMLCanvasElement>(null);
  const fgCanvasRef = useRef<HTMLCanvasElement>(null);
  const rstCanvasRef = useRef<HTMLCanvasElement>(null);

  const ctaRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const btFRef = useRef<HTMLImageElement>(null);
  const btZRef = useRef<HTMLImageElement>(null);
  const chImgRef = useRef<HTMLImageElement>(null);
  const shoutRef = useRef<HTMLDivElement>(null);
  const cnRef = useRef<HTMLElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPRef = useRef<SVGCircleElement>(null);
  const tmRef = useRef<HTMLElement>(null);
  const secLRef = useRef<HTMLSpanElement>(null);
  const pcRef = useRef<HTMLElement>(null);
  const hudBarRef = useRef<HTMLElement>(null);
  const flyHeroRef = useRef<HTMLImageElement>(null);
  const jetRef = useRef<HTMLImageElement>(null);
  const altvRef = useRef<HTMLElement>(null);
  const banRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const [activeScreen, setActiveScreen] = useState<'idle' | 'shake' | 'fly' | 'res'>('idle');
  const [isOperatorOpen, setIsOperatorOpen] = useState(false);
  const [opState, setOpState] = useState<GameState>('ATTRACT');
  const [opScore, setOpScore] = useState(0);
  const [opEnergy, setOpEnergy] = useState(0);

  const [resData, setResData] = useState<TotemResultData>({
    name: 'Jupiter',
    key: 'jupiter',
    dist: '628M km',
    fuel: '54%',
    pts: '+120',
    rkN: 12,
    rkT: 248,
    rkTxt: 'You flew farther than 95% of players today.',
  });
  const [resTimer, setResTimer] = useState(20);

  // Mutable engine state for 60fps loop without React re-renders
  const engineRef = useRef({
    state: 'idle' as 'idle' | 'count' | 'shake' | 'launching' | 'fly' | 'landed' | 'res',
    pct: 0,
    energy: 0,
    shakesCount: 0,
    t0: 0,
    lastShake: 0,
    idleShakes: [] as number[],
    fi: 0,
    shi: 0,
    jfi: 0,
    jft: 0,
    bottleUp: false,
    fly: {
      f: 0,
      ri: 0,
      t0: 0,
      dur: 7000,
      shown: {} as Record<number, number>,
    },
    stars: [] as Array<{ x: number; y: number; r: number; z: number }>,
    drops: [] as Array<{ x: number; y: number; vx: number; vy: number; r: number; l: number; foam: boolean }>,
    conf: [] as Array<{ x: number; y: number; vx: number; vy: number; r: number; vr: number; c: string; t: string; s: number; l: number }>,
    cloudsCL: [] as Array<{ fg: boolean; p: number; x: number; w: number; k: number; a: number; im: number; dx: number }>,
    cloudsFCL: [] as Array<{ p: number; x: number; w: number; im: number; a: number; f: boolean }>,
    cloudsBCL: [] as Array<{ p: number; x: number; w: number; im: number; a: number; f: boolean }>,
    images: {
      cim: [] as HTMLImageElement[],
      pim: {} as Record<string, HTMLImageElement>,
      track: null as HTMLImageElement | null,
      cap: null as HTMLImageElement | null,
    },
    timers: [] as number[],
    resInterval: 0 as unknown as ReturnType<typeof setInterval>,
  });

  const clearTimers = useCallback(() => {
    const eng = engineRef.current;
    eng.timers.forEach((id) => clearTimeout(id));
    eng.timers = [];
    clearInterval(eng.resInterval);
  }, []);

  const place = useCallback(() => {
    const eng = engineRef.current;
    clearTimers();
    eng.bottleUp = false;
    eng.state = 'idle';
    eng.pct = 0;
    eng.energy = 0;
    eng.shakesCount = 0;
    audioManager.stopFlightLoop();
    setActiveScreen('idle');
    setOpState('ATTRACT');
    setOpScore(0);
    setOpEnergy(0);
  }, [clearTimers]);

  const cpHit = useCallback((j: number) => {
    const D = DEST[j];
    const last = j === DEST.length - 1;
    const bn = banRef.current;
    if (!bn) return;
    bn.innerHTML = `<div class="bR"><img src="/totem-assets/asset_42_78160ffd.webp" alt=""><div class="tx"><small>${
      last ? 'YOU MADE IT!' : 'CHECKPOINT REACHED'
    }</small><b>${D.n}${last ? ' 100' : ''}!</b></div></div>`;
    const bb = bn.querySelector('.bR b') as HTMLElement | null;
    if (bb) {
      const L = bb.textContent?.length || 0;
      bb.style.fontSize = (L > 12 ? 58 : L > 9 ? 68 : 78) + 'px';
    }
    bn.className = 'banner sR';
    void bn.offsetWidth;
    bn.classList.add('go');
  }, []);

  const showResult = useCallback(() => {
    const eng = engineRef.current;
    const f = Math.floor(eng.fly.f);
    const ri = eng.fly.ri;
    const D = DEST[ri];
    const distKm = distAt(eng.fly.f);
    const distFormatted = fmtKm(distKm) + ' km';

    audioManager.playResultFanfare();

    const P = loadPlays();
    const mf = eng.fly.f;
    const better = P.filter((v) => v > mf).length;
    P.push(mf);
    savePlays(P);
    const rk = better + 1;
    const tot = P.length;
    const beat = Math.round(((tot - rk) / Math.max(1, tot - 1)) * 100);
    const rkTxt =
      rk === 1
        ? "Farthest flight today. You're unstoppable!"
        : `You flew farther than ${beat}% of players today.`;

    setResData({
      name: D.n,
      key: D.k,
      dist: distFormatted,
      fuel: `${f}%`,
      pts: `+${D.p}`,
      rkN: rk,
      rkT: tot,
      rkTxt,
    });

    setActiveScreen('res');
    eng.state = 'res';
    setOpState('RESULT');

    fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: `TOTEM_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        playerName: D.n,
        totalShakes: eng.shakesCount,
        totalScore: D.p + f * 10,
        flightDistance: Math.round(distKm),
        duration: 10,
      }),
    }).catch(() => {});

    const rst = rstCanvasRef.current;
    if (rst) {
      const rs = rst.getContext('2d');
      if (rs) {
        rs.clearRect(0, 0, 1080, 1920);
        eng.stars.forEach((s) => {
          rs.globalAlpha = s.z;
          rs.fillStyle = '#fff';
          rs.fillRect(s.x, s.y, s.r, s.r);
        });
        rs.globalAlpha = 1;
      }
    }

    let rt = 60;
    setResTimer(rt);
    clearInterval(eng.resInterval);
    eng.resInterval = setInterval(() => {
      rt--;
      setResTimer(rt);
      if (rt <= 0) {
        clearInterval(eng.resInterval);
        place();
      }
    }, 1000);
  }, [place]);

  const liftoff = useCallback(() => {
    const eng = engineRef.current;
    eng.state = 'launching';
    setOpState('FINISH');

    if (shoutRef.current) {
      shoutRef.current.textContent = 'LIFT OFF!';
      shoutRef.current.classList.remove('k');
      void shoutRef.current.offsetWidth;
      shoutRef.current.classList.add('k');
    }

    audioManager.playJetpackLaunch();

    if (flashRef.current) {
      flashRef.current.classList.remove('go');
      void flashRef.current.offsetWidth;
      flashRef.current.classList.add('go');
    }

    const tId = window.setTimeout(() => {
      setActiveScreen('fly');
      const f = eng.pct;
      const ri = reachIdx(f);
      eng.fly = {
        f,
        ri,
        t0: performance.now(),
        dur: 6500 + ri * 1200,
        shown: {},
      };
      eng.drops = [];
      eng.conf = [];

      const fh = flyHeroRef.current;
      if (fh) {
        fh.style.transition = 'none';
        fh.style.top = '1060px';
        void fh.offsetWidth;
        fh.style.transition = 'top 2.4s cubic-bezier(.4,0,.2,1)';
        window.setTimeout(() => {
          if (flyHeroRef.current) flyHeroRef.current.style.top = '760px';
        }, 60);
        fh.classList.add('wob');
      }

      audioManager.startFlightLoop();
      eng.state = 'fly';
      setOpState('FLIGHT');
    }, 450);
    eng.timers.push(tId);
  }, []);

  const startCountdown = useCallback(() => {
    const eng = engineRef.current;
    clearTimers();
    eng.state = 'count';
    setOpState('COUNTDOWN');
    setActiveScreen('shake');

    eng.pct = 0;
    eng.energy = 0;
    eng.shakesCount = 0;
    eng.fi = 0;

    if (pcRef.current) pcRef.current.innerHTML = '0<span>%</span>';
    if (tmRef.current) tmRef.current.textContent = '10';
    if (ringPRef.current) ringPRef.current.style.strokeDashoffset = '0';
    if (hudBarRef.current) hudBarRef.current.style.width = '0';
    if (secLRef.current) secLRef.current.textContent = '10';
    if (ringRef.current) ringRef.current.classList.remove('hot');
    if (chImgRef.current) chImgRef.current.src = HERO_FRAMES[0];
    if (btZRef.current) btZRef.current.style.opacity = '0';
    if (btFRef.current) btFRef.current.style.clipPath = 'polygon(0% 96%, 100% 96%, 100% 100%, 0% 100%)';
    if (shoutRef.current) shoutRef.current.textContent = 'GET READY';

    let n = 3;
    const tick = () => {
      const cn = cnRef.current;
      if (cn) {
        cn.textContent = n > 0 ? String(n) : 'SHAKE!';
        cn.style.fontSize = n > 0 ? '300px' : '180px';
        cn.classList.remove('go');
        void cn.offsetWidth;
        cn.classList.add('go');
      }
      if (n > 0) {
        audioManager.playCountdownBeep(n);
        n--;
        eng.timers.push(window.setTimeout(tick, 850));
      } else {
        audioManager.playCountdownGo();
        eng.timers.push(
          window.setTimeout(() => {
            eng.state = 'shake';
            eng.t0 = performance.now();
            setOpState('PLAYING');
            if (shoutRef.current) shoutRef.current.textContent = 'SHAKE!';
          }, 350)
        );
      }
    };
    tick();
  }, [clearTimers]);

  const handleShake = useCallback(
    (intensity?: number) => {
      const eng = engineRef.current;
      const now = performance.now();

      if (eng.state === 'idle') {
        eng.idleShakes = eng.idleShakes.filter((x) => now - x < 1400);
        eng.idleShakes.push(now);
        eng.lastShake = now;
        audioManager.playButtonClick();

        if (ctaRef.current) {
          ctaRef.current.classList.remove('nudge');
          void ctaRef.current.offsetWidth;
          ctaRef.current.classList.add('nudge');
        }

        if (eng.idleShakes.length >= 3) {
          eng.idleShakes = [];
          eng.bottleUp = true;
          startCountdown();
        }
        return;
      }

      if (eng.state !== 'shake') return;

      eng.lastShake = now;
      eng.shakesCount++;

      const intFactor = intensity ? Math.min(1.4, Math.max(0.7, intensity / 75)) : 1.0;
      eng.energy = Math.min(1, eng.energy + 0.3);
      eng.pct = Math.min(100, eng.pct + (2.6 + Math.random() * 1.1) * intFactor);

      setOpScore(Math.round(eng.pct * 100));
      setOpEnergy(Math.round(eng.pct));

      audioManager.playShakeFeedback(eng.pct);

      if (botRef.current) {
        botRef.current.classList.remove('shk');
        void botRef.current.offsetWidth;
        botRef.current.classList.add('shk');
      }

      if (Math.random() < 0.18 && shoutRef.current) {
        shoutRef.current.textContent = SHOUTS[eng.shi++ % SHOUTS.length];
        shoutRef.current.classList.remove('k');
        void shoutRef.current.offsetWidth;
        shoutRef.current.classList.add('k');
      }
    },
    [startCountdown]
  );

  useEffect(() => {
    const eng = engineRef.current;

    eng.images.cim = CLOUD_SRCS.map((u) => {
      const im = new Image();
      im.src = u;
      return im;
    });
    Object.keys(PLANET_SRCS).forEach((k) => {
      const im = new Image();
      im.src = PLANET_SRCS[k];
      eng.images.pim[k] = im;
    });
    const track = new Image();
    track.src = '/totem-assets/asset_40_924149e8.jpg';
    eng.images.track = track;
    const cap = new Image();
    cap.src = '/totem-assets/asset_09_d0e4057f.png';
    eng.images.cap = cap;

    eng.stars = [];
    for (let i = 0; i < 220; i++) {
      eng.stars.push({
        x: Math.random() * 1080,
        y: Math.random() * 1920,
        r: Math.random() * 2.4 + 0.4,
        z: Math.random() * 0.8 + 0.2,
      });
    }

    eng.cloudsCL = [];
    {
      let sd = 9;
      const r = () => {
        sd = (sd * 9301 + 49297) % 233280;
        return sd / 233280;
      };
      for (let i = 0; i < 16; i++) {
        const fg = i % 4 === 0;
        const sd2 = r();
        const x = fg ? (i % 8 === 0 ? 260 : 820) + (r() - 0.5) * 200 : sd2 < 0.5 ? r() * 360 : 720 + r() * 360;
        eng.cloudsCL.push({
          fg,
          p: 0.22 + (i / 16) * 0.6 + r() * 0.03,
          x,
          w: fg ? 700 + r() * 350 : 380 + r() * 320,
          k: fg ? 5600 + r() * 1200 : 2600 + r() * 1000,
          a: fg ? 0.82 : 0.6 + r() * 0.2,
          im: (r() * 8) | 0,
          dx: (x < 540 ? -1 : 1) * (0.25 + r() * 0.3),
        });
      }
    }

    eng.cloudsFCL = [];
    eng.cloudsBCL = [];
    {
      let sd = 9;
      const r = () => {
        sd = (sd * 9301 + 49297) % 233280;
        return sd / 233280;
      };
      for (let i = 0; i < 8; i++) {
        eng.cloudsFCL.push({
          p: 0.4 + (i / 8) * 0.42 + r() * 0.02,
          x: (i === 3 || i === 6 ? 540 : i % 2 ? 120 : 960) + (r() - 0.5) * 120,
          w: 560 + r() * 300,
          im: (r() * 8) | 0,
          a: i === 3 || i === 6 ? 0.7 : 0.88,
          f: r() < 0.5,
        });
      }
      for (let i = 0; i < 10; i++) {
        eng.cloudsBCL.push({
          p: 0.35 + r() * 0.5,
          x: i % 2 ? 140 + r() * 200 : 740 + r() * 200,
          w: 300 + r() * 260,
          im: (r() * 8) | 0,
          a: 0.55 + r() * 0.3,
          f: r() < 0.5,
        });
      }
    }

    const fitStage = () => {
      const st = stageRef.current;
      if (!st) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      const s = Math.min(W / 1080, H / 1920);
      st.style.transform = `translate(${(W - 1080 * s) / 2}px,${(H - 1920 * s) / 2}px) scale(${s})`;
    };
    fitStage();
    window.addEventListener('resize', fitStage);

    hardwareBridge.connect();
    const unsubShake = hardwareBridge.onShake((event: ShakeEvent) => {
      handleShake(event.intensity);
    });

    let rafId = 0;
    const drawCl = (c: CanvasRenderingContext2D, L: typeof eng.cloudsBCL, sp: number, pos: number) => {
      L.forEach((k) => {
        const im = eng.images.cim[k.im];
        if (!im || !im.complete || !im.naturalWidth) return;
        const y = 960 - (k.p - pos) * sp;
        const h = (k.w * im.naturalHeight) / im.naturalWidth;
        if (y < -h || y > 1920 + h) return;
        c.save();
        c.globalAlpha = k.a;
        c.translate(k.x, y);
        if (k.f) c.scale(-1, 1);
        c.drawImage(im, -k.w / 2, -h / 2, k.w, h);
        c.restore();
      });
    };

    const drawClouds = (c: CanvasRenderingContext2D, pos: number, fg: boolean) => {
      eng.cloudsCL.forEach((q) => {
        if (q.fg !== fg) return;
        const im = eng.images.cim[q.im];
        if (!im || !im.complete || !im.naturalWidth) return;
        const y = 960 - (q.p - pos) * q.k;
        const h = (q.w * im.naturalHeight) / im.naturalWidth;
        if (y < -h || y > 1920 + h) return;
        c.globalAlpha = q.a;
        c.drawImage(im, q.x + pos * q.dx * 400 - q.w / 2, y - h / 2, q.w, h);
      });
      c.globalAlpha = 1;
    };

    const drawPlanet = (sky: CanvasRenderingContext2D, D: Dest, x: number, y: number, R: number) => {
      const pi = eng.images.pim[D.k];
      if (pi && pi.complete && pi.naturalWidth) {
        const sc = ((D.k === 'saturn' ? 2.9 : 2.15) * R) / Math.max(pi.naturalWidth, pi.naturalHeight);
        const w = pi.naturalWidth * sc;
        const h = pi.naturalHeight * sc;
        sky.drawImage(pi, x - w / 2, y - h / 2, w, h);
        return;
      }
      if (D.k === 'unstop' && eng.images.cap && eng.images.cap.complete) {
        sky.save();
        sky.globalAlpha = 1;
        sky.drawImage(eng.images.cap, x - R, y - R * 0.68, R * 2, R * 1.36);
        sky.restore();
      }
    };

    const drawConf = (fx: CanvasRenderingContext2D) => {
      fx.save();
      eng.conf = eng.conf.filter((p) => {
        p.vy += 0.35;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;
        p.l -= 0.006;
        if (p.l <= 0 || p.y > 2000) return false;
        fx.globalAlpha = Math.min(1, p.l * 2);
        fx.translate(p.x, p.y);
        fx.rotate(p.r);
        fx.fillStyle = p.c;
        if (p.t === 's') {
          fx.fillRect(-p.s / 2, -p.s / 4, p.s, (p.s / 2) * Math.abs(Math.cos(p.r * 3)));
        } else if (p.t === 'c') {
          fx.beginPath();
          fx.arc(0, 0, p.s / 3, 0, 6.28);
          fx.fill();
        } else if (p.t === 'cap') {
          const R = p.s * 0.8;
          fx.fillStyle = '#E8001C';
          fx.beginPath();
          for (let i = 0; i < 42; i++) {
            const a = (i / 42) * 6.28;
            const rr = i % 2 ? R * 0.86 : R;
            fx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          fx.fill();
          fx.fillStyle = '#fff';
          fx.beginPath();
          fx.arc(0, 0, R * 0.62, 0, 6.28);
          fx.fill();
          fx.fillStyle = '#E8001C';
          fx.beginPath();
          fx.arc(0, 0, R * 0.5, 0, 6.28);
          fx.fill();
        } else {
          fx.strokeStyle = '#fff';
          fx.lineWidth = 5;
          fx.beginPath();
          fx.moveTo(-p.s * 1.4, 0);
          fx.bezierCurveTo(-p.s * 0.5, -p.s, p.s * 0.5, p.s, p.s * 1.4, 0);
          fx.stroke();
        }
        fx.setTransform(1, 0, 0, 1, 0, 0);
        return true;
      });
      fx.restore();
    };

    const flyStep = () => {
      const sky = skyCanvasRef.current?.getContext('2d');
      const fx = fcvCanvasRef.current?.getContext('2d');
      const fx2 = fcv2CanvasRef.current?.getContext('2d');
      const fgc = fgCanvasRef.current?.getContext('2d');
      if (!sky || !fx || !fx2 || !fgc) return;

      const now = performance.now();
      const t = Math.min(1, (now - eng.fly.t0) / eng.fly.dur);
      const e = ease(t);

      const target =
        eng.fly.ri +
        (eng.fly.ri < DEST.length - 1
          ? ((eng.fly.f - DEST[eng.fly.ri].f) / (DEST[eng.fly.ri + 1].f - DEST[eng.fly.ri].f)) * 0.6
          : 0);
      const pos = target * e;
      const speed = 1 - t;

      const SC = skyAt(pos);
      const gr = sky.createLinearGradient(0, 0, 0, 1920);
      gr.addColorStop(0, `rgb(${SC[0]})`);
      gr.addColorStop(1, `rgb(${SC[1]})`);
      sky.fillStyle = gr;
      sky.fillRect(0, 0, 1080, 1920);

      const TRACK = eng.images.track;
      const TRH = 8315;
      const TOP_AT = 1.15;
      if (TRACK && TRACK.complete && TRACK.naturalWidth) {
        const q = Math.min(1, pos / TOP_AT);
        const sy = (TRH - 1920) * (1 - Math.pow(1 - q, 1.15));
        sky.drawImage(TRACK, 0, TRH - 1920 - sy, 1080, 1920, 0, 0, 1080, 1920);
      }

      drawCl(sky, eng.cloudsBCL, 2600, pos);
      const lo = Math.max(0, Math.min(1, (pos - 1) / 0.3));
      drawClouds(sky, pos, false);
      fgc.clearRect(0, 0, 1080, 1920);
      drawClouds(fgc, pos, true);

      eng.stars.forEach((s) => {
        s.y += (4 + speed * 60) * s.z;
        if (s.y > 1920) {
          s.y = -10;
          s.x = Math.random() * 1080;
        }
        sky.globalAlpha = Math.min(1, lo * 1.2) * s.z;
        sky.fillStyle = '#fff';
        sky.fillRect(s.x, s.y, s.r, s.r + speed * 40 * s.z);
      });
      sky.globalAlpha = 1;

      for (let i = 2; i < DEST.length; i++) {
        const dy = (pos - i) * 1500;
        const y = 760 + dy;
        if (y < -700 || y > 2600) continue;
        const D = DEST[i];
        const R =
          i === DEST.length - 1
            ? 330
            : D.k === 'moon'
            ? 210
            : D.k === 'jupiter' || D.k === 'saturn'
            ? 300
            : 250;
        let x = i % 2 ? 250 : 830;
        if (i === eng.fly.ri && t > 0.6) {
          x = x + (540 - x) * Math.min(1, (t - 0.6) / 0.4) * 0.55;
        }
        drawPlanet(sky, D, x, y + 200, R);
      }

      const extras: Array<[number, string, number, number]> = [
        [1.55, 'comet', -1, 260],
        [3.5, 'aster', 1, 240],
        [5.5, 'comet', 1, 220],
        [6.6, 'aster', -1, 200],
      ];
      extras.forEach((d) => {
        const dy = (pos - d[0]) * 1500;
        const y = 760 + dy + 200;
        if (y < -400 || y > 2300) return;
        const im = eng.images.pim[d[1]];
        if (!im || !im.complete || !im.naturalWidth) return;
        const x = d[2] > 0 ? 120 + (y / 1920) * 160 : 960 - (y / 1920) * 160;
        const sc = d[3] / Math.max(im.naturalWidth, im.naturalHeight);
        sky.drawImage(im, x - (im.naturalWidth * sc) / 2, y - (im.naturalHeight * sc) / 2, im.naturalWidth * sc, im.naturalHeight * sc);
      });

      const fh = flyHeroRef.current;
      const J = jetRef.current;
      const ht = fh ? parseFloat(getComputedStyle(fh).top) || 760 : 760;
      const hx = 540;
      const hy = (fh ? parseFloat(fh.style.top) || 760 : 760) + 560;
      if (J) {
        J.style.top = ht + 575 - 39 + 'px';
        const jp = Math.min(1, speed * 1.6 + 0.15);
        J.style.opacity = (t >= 1 ? 0 : Math.min(1, jp + 0.1)).toFixed(2);
        J.style.transform = `scale(${(0.8 + jp * 0.25 + Math.sin(now / 60) * 0.03).toFixed(3)},${(
          0.55 +
          jp * 0.6
        ).toFixed(3)})`;
        if (now - eng.jft > 70) {
          eng.jft = now;
          eng.jfi = (eng.jfi + 1) % 4;
          J.src = JETF_FRAMES[eng.jfi];
        }
      }

      if (speed > 0.03 && Math.random() < 0.5) {
        eng.drops.push({
          x: hx + (Math.random() - 0.5) * 120,
          y: hy + 80 + Math.random() * 200,
          vx: (Math.random() - 0.5) * 5,
          vy: 6 + Math.random() * 10,
          r: 3 + Math.random() * 6,
          l: 1,
          foam: Math.random() < 0.6,
        });
      }

      fx2.clearRect(0, 0, 1080, 1920);
      if (pos < 1.2) drawCl(fx2, eng.cloudsFCL, 6200, pos);
      fx.clearRect(0, 0, 1080, 1920);
      drawConf(fx);

      eng.drops = eng.drops.filter((p) => {
        p.x += p.vx;
        p.y += p.vy + speed * 14;
        p.l -= 0.022;
        p.r *= 0.995;
        if (p.l <= 0 || p.y > 2000) return false;
        fx.globalAlpha = Math.max(0, p.l);
        fx.fillStyle = p.foam ? '#FFF4EC' : '#7A1E0C';
        fx.beginPath();
        fx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        fx.fill();
        return true;
      });
      fx.globalAlpha = 1;

      const di = Math.min(eng.fly.ri, Math.floor(pos));
      const frac = pos - di;
      const a = DEST[di];
      const b = DEST[Math.min(DEST.length - 1, di + 1)];
      let d =
        di >= DEST.length - 1
          ? a.d
          : Math.exp(
              Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * Math.min(1, (frac / 0.6) * (eng.fly.ri > di ? 1 : 0.6))
            );
      if (t >= 1) d = distAt(eng.fly.f);
      if (altvRef.current) altvRef.current.innerHTML = `${fmtKm(d)}<span>km</span>`;

      for (let j = 1; j <= Math.floor(pos + 0.02) && j <= eng.fly.ri; j++) {
        if (!eng.fly.shown[j]) {
          eng.fly.shown[j] = 1;
          cpHit(j);
        }
      }

      if (t > 0.7 && fh) fh.classList.remove('wob');
      if (t >= 1 && eng.state === 'fly') {
        eng.state = 'landed';
        eng.timers.push(window.setTimeout(showResult, 1100));
      }
    };

    const loop = (time: number) => {
      eng.energy *= 0.92;
      if (eng.state === 'shake') {
        const el = (performance.now() - eng.t0) / 1000;
        const t = Math.max(0, 10 - el);
        const ceilT = Math.ceil(t);
        if (tmRef.current) tmRef.current.textContent = String(ceilT);
        if (ringPRef.current) ringPRef.current.style.strokeDashoffset = (282.7 * (1 - t / 10)).toFixed(1);
        if (secLRef.current) secLRef.current.textContent = String(ceilT);
        if (ringRef.current) ringRef.current.classList.toggle('hot', t <= 3);
        if (pcRef.current) pcRef.current.innerHTML = `${Math.floor(eng.pct)}<span>%</span>`;
        if (hudBarRef.current) hudBarRef.current.style.width = `${eng.pct.toFixed(1)}%`;

        const p = eng.pct / 100;
        const yb = 96;
        const yt = 24.8;
        const y = yb - (yb - yt) * p;
        const amp = 0.4 + eng.energy * 1.6;
        const pts: string[] = [];
        for (let x = 0; x <= 100; x += 5) {
          pts.push(`${x}% ${(y + Math.sin(x / 9 + time / 140) * amp).toFixed(2)}%`);
        }
        pts.push('100% 100%', '0% 100%');
        if (btFRef.current) btFRef.current.style.clipPath = `polygon(${pts.join(',')})`;
        if (btZRef.current) btZRef.current.style.opacity = p > 0.8 ? Math.min(1, (p - 0.8) / 0.2).toFixed(2) : '0';

        const k = Math.min(HERO_FRAMES.length - 1, Math.floor(p * HERO_FRAMES.length + eng.energy * 0.6));
        if (k !== eng.fi && time % 3 < 2 && chImgRef.current) {
          eng.fi = k;
          chImgRef.current.src = HERO_FRAMES[k];
        }
        if (t <= 0) {
          liftoff();
        }
      }
      if (eng.state === 'fly') {
        flyStep();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'o' || e.key === 'O' || (e.ctrlKey && e.shiftKey && (e.key === 'd' || e.key === 'D'))) {
        setIsOperatorOpen((prev) => !prev);
        return;
      }
      if (e.code === 'Space' || e.code === 'KeyA' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleShake(80);
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'b' || e.key === 'B') {
        place();
      } else if (e.key === 'f' || e.key === 'F') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimers();
      unsubShake();
      window.removeEventListener('resize', fitStage);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [clearTimers, cpHit, handleShake, liftoff, place, showResult]);

  // Remote Operator Synchronization (Syncs live state & executes commands from mobile phone)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    let isDisposed = false;

    const syncRemoteOperator = async () => {
      if (isDisposed) return;
      try {
        const hw = hardwareBridge.getStatus();
        // 1. Report live state to API
        await fetch('/api/operator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'SYNC',
            state: {
              connected: hw.connected,
              deviceName: hw.name,
              batteryLevel: hw.batteryLevel ?? 100,
              gameState: opState,
              score: opScore,
              energy: opEnergy,
              totalShakes: hw.totalEvents,
              lastEventTime: hw.lastEventTime || 0,
              audioMuted: !audioManager.isEnabled(),
            },
          }),
        });

        // 2. Consume actions sent by mobile phone
        const res = await fetch('/api/operator?consume=1');
        if (res.ok) {
          const data = await res.json();
          if (data.actions && Array.isArray(data.actions)) {
            for (const act of data.actions) {
              if (act.type === 'SHAKE') {
                handleShake(act.payload?.intensity || 80);
              } else if (act.type === 'START') {
                if (engineRef.current.state === 'idle') {
                  startCountdown();
                } else {
                  handleShake(80);
                }
              } else if (act.type === 'RESET') {
                place();
              } else if (act.type === 'MUTE') {
                audioManager.setEnabled(!audioManager.isEnabled());
              }
            }
          }
        }
      } catch {
        // ignore network error
      } finally {
        if (!isDisposed) {
          timer = setTimeout(syncRemoteOperator, 400);
        }
      }
    };

    syncRemoteOperator();
    return () => {
      isDisposed = true;
      clearTimeout(timer);
    };
  }, [handleShake, opEnergy, opScore, opState, place, startCountdown]);

  return (
    <div className="totem-root">
      <div
        id="stage"
        ref={stageRef}
        onPointerDown={() => {
          if (engineRef.current.state === 'res') {
            place();
          } else {
            handleShake(80);
          }
        }}
      >
        <div className="logos">
          <i className="c" />
          <i className="s" />
        </div>

        <IdleScreen active={activeScreen === 'idle'} ctaRef={ctaRef} />

        <ShakeScreen
          active={activeScreen === 'shake'}
          ringRef={ringRef}
          ringPRef={ringPRef}
          tmRef={tmRef}
          hudBarRef={hudBarRef}
          secLRef={secLRef}
          pcRef={pcRef}
          chImgRef={chImgRef}
          botRef={botRef}
          btFRef={btFRef}
          btZRef={btZRef}
          shoutRef={shoutRef}
          cnRef={cnRef}
        />

        <FlightScreen
          active={activeScreen === 'fly'}
          skyCanvasRef={skyCanvasRef}
          fcvCanvasRef={fcvCanvasRef}
          fgCanvasRef={fgCanvasRef}
          fcv2CanvasRef={fcv2CanvasRef}
          jetRef={jetRef}
          flyHeroRef={flyHeroRef}
          altvRef={altvRef}
          banRef={banRef}
        />

        <ResultScreenTotem
          active={activeScreen === 'res'}
          rstCanvasRef={rstCanvasRef}
          resData={resData}
          resTimer={resTimer}
        />

        <div ref={flashRef} className="flash" id="flash" />
      </div>

      <OperatorOverlay
        isOpen={isOperatorOpen}
        onClose={() => setIsOperatorOpen(false)}
        gameState={opState}
        score={opScore}
        energy={opEnergy}
        onResetSession={place}
      />
    </div>
  );
};
