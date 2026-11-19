export type GameState =
  | 'ATTRACT'
  | 'CONNECTING'
  | 'READY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'FINISH'
  | 'FLIGHT'
  | 'RESULT'
  | 'RESET';

export interface ShakeEvent {
  type: 'SHAKE';
  id: number;
  timestamp: number;
  intensity: number;
  battery?: number;
}

export interface ControllerStatus {
  connected: boolean;
  name: string;
  batteryLevel?: number;
  rssi?: number;
  lastEventTime?: number;
  totalEvents: number;
  isSimulated?: boolean;
}

export interface GameResult {
  id?: number;
  sessionId: string;
  playerName?: string;
  totalShakes: number;
  totalScore: number;
  flightDistance: number;
  ranking?: string; // e.g. "20/52"
  totalPlayers?: number;
  duration: number;
  createdAt?: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: number;
  sessionId: string;
  playerName: string;
  totalScore: number;
  totalShakes: number;
  flightDistance: number;
  createdAt: string;
}

export interface SystemConfig {
  gameplayDurationSeconds: number;
  baseScorePerShake: number;
  intensityBonusFactor: number;
  maxEnergy: number;
  minFlightDistance: number;
  maxFlightDistance: number;
  flightSpeed: number;
  audioEnabled: boolean;
  masterVolume: number;
  bleDeviceName: string;
  wsPort: number;
  simulatedInputEnabled: boolean;
}

