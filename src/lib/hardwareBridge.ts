import { GAME_CONFIG } from '@/config/gameConfig';
import { ControllerStatus, ShakeEvent } from '@/types/game';

type ShakeListener = (event: ShakeEvent) => void;
type StatusListener = (status: ControllerStatus) => void;

class HardwareBridge {
  private ws: WebSocket | null = null;
  private shakeListeners: Set<ShakeListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private lastProcessedEventId: number = -1;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private totalShakesReceived: number = 0;
  private simulationIdCounter: number = 1000;

  private status: ControllerStatus = {
    connected: false,
    name: 'DISCONNECTED',
    totalEvents: 0,
    isSimulated: true,
  };

  constructor() {
    // Will connect when called in browser
  }

  private hasLoggedOffline = false;

  public connect(port: number = GAME_CONFIG.wsPort) {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const url = `ws://127.0.0.1:${port}`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[HardwareBridge] Connected to Python BLE WebSocket server');
        this.status.connected = true;
        this.status.name = GAME_CONFIG.bleDeviceName;
        this.status.isSimulated = false;
        this.hasLoggedOffline = false;
        this.lastProcessedEventId = -1; // Reset tracker for new connection
        this.notifyStatus();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onclose = () => {
        if (this.status.connected) {
          this.status.connected = false;
          this.notifyStatus();
        }
        this.lastProcessedEventId = -1; // Reset tracker so controller rebooting from 0/1 is immediately accepted
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        if (!this.hasLoggedOffline) {
          console.info('[HardwareBridge] Python BLE server offline. Virtual simulation mode active.');
          this.hasLoggedOffline = true;
        }
        if (this.status.connected) {
          this.status.connected = false;
          this.notifyStatus();
        }
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  private handleMessage(data: string) {
    try {
      const text = data.trim();
      // Handle status JSON messages if sent
      if (text.startsWith('{')) {
        const payload = JSON.parse(text);
        if (payload.type === 'STATUS') {
          this.status = {
            ...this.status,
            connected: payload.connected ?? this.status.connected,
            name: payload.name || this.status.name,
            batteryLevel: payload.batteryLevel,
            rssi: payload.rssi,
          };
          this.notifyStatus();
          return;
        }
      }

      // Handle raw protocol:
      // Format 1 (Standard with battery): SHAKE,<id>,<intensity>,<battery> -> e.g. "SHAKE,1,65,47"
      // Format 2 (3 parts): SHAKE,<id>,<intensity> -> e.g. "SHAKE,1,65"
      // Format 3 (5 parts with timestamp & battery): SHAKE,<id>,<timestamp>,<intensity>,<battery>
      // Format 4 (Direct CSV without SHAKE prefix): 1,65,47
      const isShake = text.startsWith('SHAKE');
      const isRawCsv = /^\d+,\d+(,\d+)*$/.test(text);

      if (isShake || isRawCsv) {
        const rawParts = text.split(',');
        const parts = isShake ? rawParts.slice(1) : rawParts;
        // Now parts is [<id>, ...]
        if (parts.length >= 2) {
          const id = parseInt(parts[0], 10);
          let timestamp = Date.now();
          let intensity = 75;
          let battery: number | undefined;

          if (parts.length === 2) {
            // [id, intensity] -> e.g. "SHAKE,1,65"
            intensity = Math.min(100, Math.max(1, parseInt(parts[1], 10)));
          } else if (parts.length === 3) {
            const p1 = parseInt(parts[1], 10);
            const p2 = parseInt(parts[2], 10);
            if (p1 > 100) {
              // [id, timestamp, intensity] -> e.g. "SHAKE,1,1840,65"
              timestamp = p1;
              intensity = Math.min(100, Math.max(1, p2));
            } else {
              // [id, intensity, battery] -> e.g. "SHAKE,1,65,47"
              intensity = Math.min(100, Math.max(1, p1));
              battery = Math.min(100, Math.max(0, p2));
            }
          } else if (parts.length >= 4) {
            // [id, timestamp, intensity, battery]
            timestamp = parseInt(parts[1], 10) || Date.now();
            intensity = Math.min(100, Math.max(1, parseInt(parts[2], 10)));
            battery = Math.min(100, Math.max(0, parseInt(parts[3], 10)));
          }

          // Duplicate event protection: ignore already processed ID
          if (id === this.lastProcessedEventId) {
            return;
          }
          this.lastProcessedEventId = id;

          this.totalShakesReceived++;
          this.status.totalEvents = this.totalShakesReceived;
          this.status.lastEventTime = Date.now();
          if (battery !== undefined && !isNaN(battery)) {
            this.status.batteryLevel = battery;
          }
          this.notifyStatus();

          const shakeEvent: ShakeEvent = {
            type: 'SHAKE',
            id,
            timestamp,
            intensity,
            battery,
          };

          this.shakeListeners.forEach((listener) => listener(shakeEvent));
        }
      }
    } catch (err) {
      console.error('[HardwareBridge] Error parsing incoming hardware message:', err);
    }
  }

  /**
   * Simulate a shake event (for development, testing or operator manual trigger)
   */
  public simulateShake(intensity: number = 75) {
    this.simulationIdCounter++;
    const shakeEvent: ShakeEvent = {
      type: 'SHAKE',
      id: this.simulationIdCounter,
      timestamp: Date.now(),
      intensity: Math.min(100, Math.max(10, intensity)),
    };

    this.totalShakesReceived++;
    this.status.totalEvents = this.totalShakesReceived;
    this.status.lastEventTime = Date.now();
    this.notifyStatus();

    this.shakeListeners.forEach((listener) => listener(shakeEvent));
  }

  public onShake(listener: ShakeListener): () => void {
    this.shakeListeners.add(listener);
    return () => this.shakeListeners.delete(listener);
  }

  public onStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  public getStatus(): ControllerStatus {
    return { ...this.status };
  }

  private notifyStatus() {
    const copy = { ...this.status };
    this.statusListeners.forEach((listener) => listener(copy));
  }
}

export const hardwareBridge = new HardwareBridge();

