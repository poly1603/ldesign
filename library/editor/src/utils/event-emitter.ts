/**
 * Event Emitter
 * 
 * A lightweight event emitter implementation for the editor.
 */

import type { EventEmitter as IEventEmitter, EventHandler } from '@/types';

/**
 * Event emitter class
 */
export class EventEmitter<T = Record<string, any>> implements IEventEmitter<T> {
  private listeners: Map<keyof T, Set<EventHandler<any>>> = new Map();

  /**
   * Add event listener
   */
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  /**
   * Add one-time event listener
   */
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const onceHandler = (data: T[K]) => {
      handler(data);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof T>(event: K, handler?: EventHandler<T[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    if (handler) {
      eventListeners.delete(handler);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit event
   */
  emit<K extends keyof T>(event: K, data: T[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    // Create a copy of listeners to avoid issues if listeners are modified during emission
    const listenersArray = Array.from(eventListeners);
    
    for (const handler of listenersArray) {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for "${String(event)}":`, error);
      }
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof T): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.size : 0;
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): (keyof T)[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners(event: keyof T): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Get all listeners for an event
   */
  getListeners<K extends keyof T>(event: K): EventHandler<T[K]>[] {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? Array.from(eventListeners) : [];
  }

  /**
   * Dispose of all listeners
   */
  dispose(): void {
    this.listeners.clear();
  }
}
