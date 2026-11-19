type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  public on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off(event: string, callback: EventCallback) {
    if (this.events.has(event)) {
      this.events.get(event)!.delete(callback);
    }
  }

  public emit(event: string, ...args: any[]) {
    if (this.events.has(event)) {
      this.events.get(event)!.forEach((callback) => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`Error in EventBus handler for '${event}':`, e);
        }
      });
    }
  }

  public clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();

