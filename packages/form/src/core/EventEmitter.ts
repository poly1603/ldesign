/**
 * @fileoverview Core event emitter implementation for the form system
 * @author LDesign Team
 */

import type { EventCallback, EventListenerConfig, EventUnsubscriber } from '../types/events'

/**
 * Generic event emitter implementation
 * Provides a foundation for event-driven communication in the form system
 */
export class EventEmitter<T extends Record<string, any> = Record<string, any>> {
  private listeners: Map<keyof T, Set<{
    callback: EventCallback<any>
    config: EventListenerConfig
  }>> = new Map()

  private maxListeners = 10
  private enabled = true

  /**
   * Add event listener
   */
  on<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>,
    config: EventListenerConfig = {}
  ): EventUnsubscriber {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }

    const listeners = this.listeners.get(event)!
    const listener = { callback, config }

    // Check max listeners limit
    if (listeners.size >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${String(event)}`)
    }

    listeners.add(listener)

    // Return unsubscriber function
    return () => {
      listeners.delete(listener)
      if (listeners.size === 0) {
        this.listeners.delete(event)
      }
    }
  }

  /**
   * Add one-time event listener
   */
  once<K extends keyof T>(
    event: K,
    callback: EventCallback<T[K]>,
    config: Omit<EventListenerConfig, 'once'> = {}
  ): EventUnsubscriber {
    return this.on(event, callback, { ...config, once: true })
  }

  /**
   * Remove event listener(s)
   */
  off<K extends keyof T>(event: K, callback?: EventCallback<T[K]>): void {
    const listeners = this.listeners.get(event)
    if (!listeners) return

    if (callback) {
      // Remove specific callback
      for (const listener of listeners) {
        if (listener.callback === callback) {
          listeners.delete(listener)
        }
      }
    } else {
      // Remove all listeners for this event
      listeners.clear()
      this.listeners.delete(event)
    }
  }

  /**
   * Emit event to all listeners
   */
  async emit<K extends keyof T>(event: K, data: T[K]): Promise<void> {
    if (!this.enabled) return

    const listeners = this.listeners.get(event)
    if (!listeners || listeners.size === 0) return

    // Sort listeners by priority (higher priority first)
    const sortedListeners = Array.from(listeners).sort((a, b) => {
      const priorityA = a.config.priority ?? 0
      const priorityB = b.config.priority ?? 0
      return priorityB - priorityA
    })

    const promises: Promise<void>[] = []

    for (const listener of sortedListeners) {
      try {
        // Check condition if specified
        if (listener.config.condition && !listener.config.condition(data)) {
          continue
        }

        // Execute callback
        const result = listener.callback(data)
        if (result instanceof Promise) {
          promises.push(result)
        }

        // Remove listener if it's a one-time listener
        if (listener.config.once) {
          listeners.delete(listener)
        }
      } catch (error) {
        // Handle error using error handler if provided
        if (listener.config.errorHandler) {
          listener.config.errorHandler(error as Error)
        } else {
          console.error(`Error in event listener for event ${String(event)}:`, error)
        }
      }
    }

    // Wait for all async listeners to complete
    if (promises.length > 0) {
      await Promise.all(promises)
    }

    // Clean up empty listener sets
    if (listeners.size === 0) {
      this.listeners.delete(event)
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: keyof T): number {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.size : 0
  }

  /**
   * Get all event names
   */
  eventNames(): (keyof T)[] {
    return Array.from(this.listeners.keys())
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
  }

  /**
   * Set maximum listeners per event
   */
  setMaxListeners(n: number): void {
    this.maxListeners = Math.max(0, n)
  }

  /**
   * Get maximum listeners per event
   */
  getMaxListeners(): number {
    return this.maxListeners
  }

  /**
   * Enable/disable event emission
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if event emission is enabled
   */
  isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Check if event has listeners
   */
  hasListeners(event: keyof T): boolean {
    const listeners = this.listeners.get(event)
    return listeners ? listeners.size > 0 : false
  }

  /**
   * Destroy the event emitter
   */
  destroy(): void {
    this.removeAllListeners()
    this.enabled = false
  }
}