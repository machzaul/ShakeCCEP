import { NextResponse } from 'next/server';
import { saveGameResult } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, playerName, totalShakes, totalScore, flightDistance, duration } = body;

    if (!sessionId || totalScore === undefined) {
      return NextResponse.json({ error: 'Missing required session data' }, { status: 400 });
    }

    const savedResult = await saveGameResult({
      sessionId,
      playerName,
      totalShakes: Number(totalShakes) || 0,
      totalScore: Number(totalScore) || 0,
      flightDistance: Number(flightDistance) || 0,
      duration: Number(duration) || 0,
    });

    return NextResponse.json({ success: true, result: savedResult });
  } catch (error) {
    console.error('Failed to save game result:', error);
    return NextResponse.json({ error: 'Database save failed' }, { status: 500 });
  }
}

