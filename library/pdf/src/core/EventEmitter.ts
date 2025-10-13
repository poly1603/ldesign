/**
 * Event Emitter for handling custom events
 */
export class EventEmitter {
  private events: Map<string, Set<Function>>;

  constructor() {
    this.events = new Map();
  }

  /**
   * Register an event listener
   */
  on(event: string, handler: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, handler: Function): void {
    const onceWrapper = (...args: any[]) => {
      handler.apply(this, args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Unregister an event listener
   */
  off(event: string, handler?: Function): void {
    if (!this.events.has(event)) {
      return;
    }

    if (handler) {
      this.events.get(event)!.delete(handler);
      if (this.events.get(event)!.size === 0) {
        this.events.delete(event);
      }
    } else {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   */
  emit(event: string, ...args: any[]): void {
    if (!this.events.has(event)) {
      return;
    }

    const handlers = this.events.get(event)!;
    handlers.forEach(handler => {
      try {
        handler.apply(this, args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get all listeners for an event
   */
  listeners(event: string): Function[] {
    return this.events.has(event) ? Array.from(this.events.get(event)!) : [];
  }

  /**
   * Get the count of listeners for an event
   */
  listenerCount(event: string): number {
    return this.events.has(event) ? this.events.get(event)!.size : 0;
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}