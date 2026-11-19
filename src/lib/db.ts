import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { GameResult, LeaderboardEntry } from '@/types/game';

// Store SQLite database in local data directory
const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'coke_shake.db');

export const db = createClient({
  url: `file:${dbPath.replace(/\\/g, '/')}`,
});

// Initialize database tables if not existing
let isInitialized = false;

export async function initDatabase(): Promise<void> {
  if (isInitialized) return;

  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE NOT NULL,
      player_name TEXT DEFAULT 'CHAMPION',
      total_shakes INTEGER NOT NULL,
      total_score INTEGER NOT NULL,
      flight_distance REAL NOT NULL,
      duration REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_total_score ON game_results(total_score DESC);
  `);

  isInitialized = true;
}

/**
 * Save completed game session to SQLite and calculate local ranking
 */
export async function saveGameResult(result: {
  sessionId: string;
  playerName?: string;
  totalShakes: number;
  totalScore: number;
  flightDistance: number;
  duration: number;
}): Promise<GameResult> {
  await initDatabase();

  // Insert or ignore if duplicate sessionId
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO game_results (session_id, player_name, total_shakes, total_score, flight_distance, duration)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      result.sessionId,
      result.playerName || 'CHAMPION',
      result.totalShakes,
      result.totalScore,
      result.flightDistance,
      result.duration,
    ],
  });

  // Calculate ranking locally: count how many players have a higher score
  const rankQuery = await db.execute({
    sql: `
      SELECT COUNT(*) AS higher_count 
      FROM game_results 
      WHERE total_score > ?
    `,
    args: [result.totalScore],
  });

  const totalPlayersQuery = await db.execute(`
    SELECT COUNT(*) AS total_count FROM game_results
  `);

  const higherCount = Number(rankQuery.rows[0]?.higher_count ?? 0);
  const totalCount = Number(totalPlayersQuery.rows[0]?.total_count ?? 1);
  const rank = higherCount + 1;

  const rankingString = `${rank}/${totalCount}`;

  return {
    sessionId: result.sessionId,
    playerName: result.playerName || 'CHAMPION',
    totalShakes: result.totalShakes,
    totalScore: result.totalScore,
    flightDistance: result.flightDistance,
    ranking: rankingString,
    totalPlayers: totalCount,
    duration: result.duration,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Retrieve top high scores for the leaderboard
 */
export async function getTopLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  await initDatabase();

  const query = await db.execute({
    sql: `
      SELECT id, session_id, player_name, total_score, total_shakes, flight_distance, created_at
      FROM game_results
      ORDER BY total_score DESC, flight_distance DESC, id ASC
      LIMIT ?
    `,
    args: [limit],
  });

  return query.rows.map((row, index) => ({
    rank: index + 1,
    id: Number(row.id),
    sessionId: String(row.session_id),
    playerName: String(row.player_name),
    totalScore: Number(row.total_score),
    totalShakes: Number(row.total_shakes),
    flightDistance: Number(row.flight_distance),
    createdAt: String(row.created_at),
  }));
}

/**
 * Reset leaderboard (operator function)
 */
export async function resetLeaderboard(): Promise<void> {
  await initDatabase();
  await db.execute(`DELETE FROM game_results;`);
}

