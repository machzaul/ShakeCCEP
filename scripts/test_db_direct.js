const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

async function test() {
  const dbDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'coke_shake.db');
  console.log('Testing SQLite database at:', dbPath);

  const client = createClient({
    url: `file:${dbPath.replace(/\\/g, '/')}`,
  });

  await client.execute(`
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

  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_total_score ON game_results(total_score DESC);
  `);

  const sessionId = 'TEST_SES_' + Date.now();
  await client.execute({
    sql: `INSERT OR IGNORE INTO game_results (session_id, player_name, total_shakes, total_score, flight_distance, duration) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [sessionId, 'ARCADE_HERO', 45, 5200, 7100, 10],
  });

  const query = await client.execute(`
    SELECT id, session_id, player_name, total_score, total_shakes, flight_distance, created_at FROM game_results ORDER BY total_score DESC LIMIT 5
  `);

  console.log('Database rows:', JSON.stringify(query.rows, null, 2));
  console.log('SQLITE DIRECT TEST PASSED SUCCESSFULLY!');
}

test().catch((e) => {
  console.error('Database test error:', e);
  process.exit(1);
});

