import { NextResponse } from 'next/server';
import os from 'os';

// In-memory runtime state for kiosk & mobile operator sync
interface OperatorSharedState {
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

interface OperatorAction {
  id: string;
  type: 'SHAKE' | 'START' | 'RESET' | 'MUTE' | 'RESET_LEADERBOARD';
  payload?: any;
  createdAt: number;
}

let sharedState: OperatorSharedState = {
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
};

let pendingActions: OperatorAction[] = [];

function getLocalIp(): string {
  const ifaces = os.networkInterfaces();
  for (const dev in ifaces) {
    const list = ifaces[dev];
    if (list) {
      for (const details of list) {
        if (details.family === 'IPv4' && !details.internal && !details.address.startsWith('169.254')) {
          return details.address;
        }
      }
    }
  }
  return '127.0.0.1';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const consume = searchParams.get('consume') === '1';

  let actionsToReturn: OperatorAction[] = [];
  if (consume) {
    actionsToReturn = [...pendingActions];
    pendingActions = [];
  } else {
    actionsToReturn = [...pendingActions];
  }

  return NextResponse.json({
    status: sharedState,
    actions: actionsToReturn,
    localIp: getLocalIp(),
    serverTime: Date.now(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Kiosk syncing its live state to the server
    if (body.type === 'SYNC') {
      sharedState = {
        ...sharedState,
        ...body.state,
        updatedAt: Date.now(),
      };
      return NextResponse.json({ ok: true, status: sharedState });
    }

    // 2. Mobile operator dispatching an action to the kiosk
    if (body.type === 'ACTION') {
      const action: OperatorAction = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: body.action,
        payload: body.payload,
        createdAt: Date.now(),
      };
      // Keep max 10 pending actions
      if (pendingActions.length > 10) {
        pendingActions = pendingActions.slice(-10);
      }
      pendingActions.push(action);
      return NextResponse.json({ ok: true, queuedAction: action });
    }

    return NextResponse.json({ error: 'Unknown payload type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
