import { NextResponse } from 'next/server';
import { getTopLeaderboard, resetLeaderboard } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const entries = await getTopLeaderboard(limit);
    return NextResponse.json({ success: true, leaderboard: entries });
  } catch (error) {
    console.error('Failed to get leaderboard:', error);
    return NextResponse.json({ error: 'Failed to retrieve leaderboard' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await resetLeaderboard();
    return NextResponse.json({ success: true, message: 'Leaderboard reset successfully' });
  } catch (error) {
    console.error('Failed to reset leaderboard:', error);
    return NextResponse.json({ error: 'Failed to reset leaderboard' }, { status: 500 });
  }
}

