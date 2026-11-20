export interface Dest {
  k: string;
  n: string;
  f: number;
  d: number;
  p: number;
  c: string;
}

export const DEST: Dest[] = [
  { k: 'sky', n: 'Cloud Line', f: 0, d: 1, p: 10, c: '#cfe3ff' },
  { k: 'space', n: 'Outer Space', f: 8, d: 100, p: 10, c: '#5560d8' },
  { k: 'moon', n: 'The Moon', f: 20, d: 384400, p: 10, c: '#d8d2c4' },
  { k: 'mars', n: 'Mars', f: 34, d: 225e6, p: 10, c: '#d8582a' },
  { k: 'jupiter', n: 'Jupiter', f: 48, d: 628e6, p: 10, c: '#d9a874' },
  { k: 'saturn', n: 'Saturn', f: 62, d: 1.27e9, p: 10, c: '#e2bf78' },
  { k: 'uranus', n: 'Uranus', f: 75, d: 2.72e9, p: 10, c: '#7fd8e0' },
  { k: 'neptune', n: 'Neptune', f: 88, d: 4.35e9, p: 10, c: '#3a5fe0' },
  { k: 'unstop', n: 'Unstoppable', f: 100, d: 1e10, p: 10, c: '#E8001C' },
];

export const HERO_FRAMES = [
  '/totem-assets/asset_20_3ba02893.webp',
  '/totem-assets/asset_26_f913e8c5.webp',
  '/totem-assets/asset_27_625ef4bc.webp',
  '/totem-assets/asset_28_d74afd1b.webp',
  '/totem-assets/asset_29_8094f053.webp',
];

export const JETF_FRAMES = [
  '/totem-assets/asset_24_2f27e99e.webp',
  '/totem-assets/asset_37_093c4a02.webp',
  '/totem-assets/asset_38_1527a831.webp',
  '/totem-assets/asset_39_07bec7bd.webp',
];

export const CLOUD_SRCS = [
  '/totem-assets/asset_17_70e48213.webp',
  '/totem-assets/asset_30_68db92d8.webp',
  '/totem-assets/asset_31_081476c7.webp',
  '/totem-assets/asset_32_1ecc8012.webp',
  '/totem-assets/asset_33_35b6f859.webp',
  '/totem-assets/asset_34_5d20f512.webp',
  '/totem-assets/asset_35_7f8d2a71.webp',
  '/totem-assets/asset_36_0a08f60c.webp',
];

export const PLANET_SRCS: Record<string, string> = {
  moon: '/totem-assets/asset_11_4d65414e.webp',
  mars: '/totem-assets/asset_12_5e1210c7.webp',
  jupiter: '/totem-assets/asset_13_2234a12c.webp',
  saturn: '/totem-assets/asset_14_a50912f0.webp',
  uranus: '/totem-assets/asset_15_7c606ed9.webp',
  neptune: '/totem-assets/asset_16_fac39331.webp',
  aster: '/totem-assets/asset_41_995569db.webp',
  comet: '/totem-assets/asset_18_0868b6b0.webp',
};

export const SKYK: Array<[number, [number, number, number], [number, number, number]]> = [
  [0, [120, 14, 22], [232, 60, 44]],
  [0.3, [196, 48, 58], [246, 120, 84]],
  [0.55, [150, 40, 70], [220, 110, 120]],
  [0.78, [42, 10, 48], [106, 26, 58]],
  [1, [7, 2, 20], [14, 4, 30]],
];

export const SHOUTS = ['SHAKE!', 'HARDER!', 'FASTER!', 'MORE FIZZ!', 'KEEP GOING!'];

export function reachIdx(f: number): number {
  let r = 0;
  for (let i = 0; i < DEST.length; i++) {
    if (f >= DEST[i].f) r = i;
  }
  return r;
}

export function fmtKm(d: number): string {
  if (d >= 1e9) {
    return (d >= 1e10 ? (d / 1e9).toFixed(0) : (d / 1e9).toFixed(2).replace(/\.?0+$/, '')) + 'B';
  }
  if (d >= 1e6) return Math.round(d / 1e6) + 'M';
  if (d >= 1e3) return Math.round(d).toLocaleString('en-US');
  return Math.max(0, Math.round(d)).toString();
}

export function distAt(f: number): number {
  const i = reachIdx(f);
  if (i >= DEST.length - 1) return DEST[i].d;
  const a = DEST[i];
  const b = DEST[i + 1];
  const t = (f - a.f) / (b.f - a.f);
  return Math.exp(Math.log(a.d) + (Math.log(b.d) - Math.log(a.d)) * t);
}

export function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function skyAt(p: number): [[number, number, number], [number, number, number]] {
  const clamped = Math.max(0, Math.min(1, p));
  for (let i = 1; i < SKYK.length; i++) {
    if (clamped <= SKYK[i][0]) {
      const a = SKYK[i - 1];
      const b = SKYK[i];
      const t = (clamped - a[0]) / (b[0] - a[0]);
      const mix = (x: [number, number, number], y: [number, number, number]): [number, number, number] => [
        Math.round(x[0] + (y[0] - x[0]) * t),
        Math.round(x[1] + (y[1] - x[1]) * t),
        Math.round(x[2] + (y[2] - x[2]) * t),
      ];
      return [mix(a[1], b[1]), mix(a[2], b[2])];
    }
  }
  return [SKYK[4][1], SKYK[4][2]];
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function loadPlays(): number[] {
  let P: number[] | null = null;
  try {
    const o = JSON.parse(localStorage.getItem('cokeitup_real_plays') || 'null');
    if (o && o.day === todayKey() && Array.isArray(o.P)) P = o.P;
  } catch {
    // ignore
  }
  if (!P) {
    P = [];
  }
  return P;
}

export function savePlays(P: number[]) {
  try {
    localStorage.setItem('cokeitup_real_plays', JSON.stringify({ day: todayKey(), P }));
  } catch {
    // ignore
  }
}
