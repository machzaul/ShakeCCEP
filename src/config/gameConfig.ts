import { SystemConfig } from '@/types/game';

export const GAME_CONFIG: SystemConfig = {
  // Gameplay duration in seconds (per screen 06-09 shake phase)
  gameplayDurationSeconds: 10,

  // Scoring
  baseScorePerShake: 100,
  intensityBonusFactor: 1.5, // bonus points scaled by intensity (0-100)
  maxEnergy: 100,            // maximum bottle energy capacity

  // Superhero Jetpack Flight parameters
  minFlightDistance: 500,     // meters at zero/low score
  maxFlightDistance: 8500,    // meters at maximum charge (into the stratosphere)
  flightSpeed: 1.0,           // flight camera speed scale

  // Audio settings
  audioEnabled: true,
  masterVolume: 0.8,

  // Hardware BLE configuration
  bleDeviceName: 'COCA-COLA-BOTTLE',
  wsPort: 8765,

  // Debug / Simulation toggle
  simulatedInputEnabled: true,
};

export const COLOR_PALETTE = {
  cokeRed: '#F40000',
  cokeDarkRed: '#B30000',
  black: '#0D0D0F',
  pureBlack: '#000000',
  white: '#FFFFFF',
  paleBlueGrey: '#EAF0F4',
  silver: '#CAD5DE',
  gold: '#FFD700',
};

// Target Resolution: 1080x1920 (9:16 Portrait)
export const DISPLAY_CONFIG = {
  width: 1080,
  height: 1920,
  aspectRatio: 9 / 16,
};

/**
 * Calculates superhero flight altitude/distance (in meters) directly proportional
 * to the score and shakes accumulated during the 10-second shake window.
 * The more shakes and score achieved, the further and higher the hero launches!
 */
export function calculateFlightDistance(score: number, totalShakes: number = 0): number {
  if (score <= 0 && totalShakes <= 0) return 0;
  const baseAltitude = 400; // Base altitude
  const scoreDistance = Math.round(score * 1.25); // 1.25m per point earned
  const shakeBonus = Math.round(totalShakes * 30); // Bonus for fast shakes
  return baseAltitude + scoreDistance + shakeBonus;
}

export function getFlightTier(distance: number): { title: string; color: string; badge: string } {
  if (distance >= 20000) {
    return { title: 'COSMIC LEGEND (MOON REACHED!)', color: '#FFD700', badge: 'COSMIC' };
  } else if (distance >= 12000) {
    return { title: 'ORBITAL SUPERHERO', color: '#00E5FF', badge: 'ORBITAL' };
  } else if (distance >= 6000) {
    return { title: 'STRATOSPHERE FLYER', color: '#76FF03', badge: 'STRATO' };
  } else if (distance >= 2500) {
    return { title: 'SKYLINE GLIDER', color: '#FF9100', badge: 'SKYLINE' };
  } else {
    return { title: 'ROOKIE JUMPER', color: '#FFFFFF', badge: 'ROOKIE' };
  }
}


