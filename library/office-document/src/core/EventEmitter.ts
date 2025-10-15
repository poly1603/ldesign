/**
 * Event Emitter implementation
 */

import type { IEventEmitter, ViewerEventType, EventHandler } from '../types';

export class EventEmitter implements IEventEmitter {
 private events: Map<ViewerEventType, Set<EventHandler>> = new Map();
 private onceEvents: Map<ViewerEventType, Set<EventHandler>> = new Map();

 /**
  * Add event listener
  */
 on(event: ViewerEventType, handler: EventHandler): void {
  if (!this.events.has(event)) {
   this.events.set(event, new Set());
  }
  this.events.get(event)!.add(handler);
 }

 /**
  * Remove event listener
  */
 off(event: ViewerEventType, handler: EventHandler): void {
  const handlers = this.events.get(event);
  if (handlers) {
   handlers.delete(handler);
  }

  // Also check once events
  const onceHandlers = this.onceEvents.get(event);
  if (onceHandlers) {
   onceHandlers.delete(handler);
  }
 }

 /**
  * Add one-time event listener
  */
 once(event: ViewerEventType, handler: EventHandler): void {
  if (!this.onceEvents.has(event)) {
   this.onceEvents.set(event, new Set());
  }
  this.onceEvents.get(event)!.add(handler);
 }

 /**
  * Emit event
  */
 emit(event: ViewerEventType, data?: any): void {
  // Call regular event handlers
  const handlers = this.events.get(event);
  if (handlers) {
   handlers.forEach(handler => {
    try {
     handler(data);
    } catch (error) {
     console.error(`Error in event handler for '${event}':`, error);
    }
   });
  }

  // Call and remove once event handlers
  const onceHandlers = this.onceEvents.get(event);
  if (onceHandlers) {
   onceHandlers.forEach(handler => {
    try {
     handler(data);
    } catch (error) {
     console.error(`Error in once event handler for '${event}':`, error);
    }
   });
   this.onceEvents.delete(event);
  }
 }

 /**
  * Remove all listeners for an event or all events
  */
 removeAllListeners(event?: ViewerEventType): void {
  if (event) {
   this.events.delete(event);
   this.onceEvents.delete(event);
  } else {
   this.events.clear();
   this.onceEvents.clear();
  }
 }

 /**
  * Get listener count for an event
  */
 listenerCount(event: ViewerEventType): number {
  const regularCount = this.events.get(event)?.size || 0;
  const onceCount = this.onceEvents.get(event)?.size || 0;
  return regularCount + onceCount;
 }

 /**
  * Check if has listeners for an event
  */
 hasListeners(event: ViewerEventType): boolean {
  return this.listenerCount(event) > 0;
 }
}
