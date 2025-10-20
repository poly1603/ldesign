/**
 * Advanced gesture recognition
 * Supports double-tap, long-press, pinch-rotate, and more
 */
export type GestureType = 'tap' | 'doubletap' | 'longpress' | 'swipe' | 'pinchrotate';

export interface GestureEvent {
  type: GestureType;
  x: number;
  y: number;
  deltaX?: number;
  deltaY?: number;
  rotation?: number;
  scale?: number;
}

export class AdvancedGestureControls {
  private element: HTMLElement;
  private enabled: boolean = true;
  
  // Callbacks
  private onGesture?: (event: GestureEvent) => void;
  
  // Touch tracking
  private touches: Map<number, { x: number; y: number; time: number }> = new Map();
  private lastTapTime: number = 0;
  private longPressTimer: number | null = null;
  private longPressDelay: number = 500; // ms
  
  // Pinch-rotate tracking
  private lastPinchAngle: number = 0;
  private lastPinchDistance: number = 0;

  constructor(element: HTMLElement, onGesture?: (event: GestureEvent) => void) {
    this.element = element;
    this.onGesture = onGesture;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });
  }

  private onTouchStart(event: TouchEvent): void {
    if (!this.enabled) return;
    event.preventDefault();

    const now = Date.now();

    // Store touch points
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      });
    }

    // Single touch
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      
      // Check for double-tap
      if (now - this.lastTapTime < 300) {
        this.onGesture?.({
          type: 'doubletap',
          x: touch.clientX,
          y: touch.clientY,
        });
        this.lastTapTime = 0; // Reset to prevent triple-tap
      } else {
        this.lastTapTime = now;
      }

      // Start long-press detection
      this.longPressTimer = window.setTimeout(() => {
        this.onGesture?.({
          type: 'longpress',
          x: touch.clientX,
          y: touch.clientY,
        });
      }, this.longPressDelay);
    }

    // Two touches - initialize pinch-rotate
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      // Calculate initial distance and angle
      this.lastPinchDistance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      
      this.lastPinchAngle = this.getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.enabled) return;
    event.preventDefault();

    // Cancel long-press if finger moves
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Two-finger pinch-rotate
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = this.getDistance(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );
      
      const angle = this.getAngle(
        touch1.clientX, touch1.clientY,
        touch2.clientX, touch2.clientY
      );

      if (this.lastPinchDistance > 0) {
        const scale = distance / this.lastPinchDistance;
        const rotation = angle - this.lastPinchAngle;

        // Detect significant rotation (> 5 degrees)
        if (Math.abs(rotation) > 5) {
          this.onGesture?.({
            type: 'pinchrotate',
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2,
            rotation,
            scale,
          });
        }
      }

      this.lastPinchDistance = distance;
      this.lastPinchAngle = angle;
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    if (!this.enabled) return;

    // Cancel long-press
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }

    // Remove ended touches
    const changedTouches = Array.from(event.changedTouches);
    changedTouches.forEach(touch => {
      const startTouch = this.touches.get(touch.identifier);
      
      if (startTouch) {
        const deltaX = touch.clientX - startTouch.x;
        const deltaY = touch.clientY - startTouch.y;
        const deltaTime = Date.now() - startTouch.time;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Detect swipe (fast movement > 50px)
        if (distance > 50 && deltaTime < 300) {
          this.onGesture?.({
            type: 'swipe',
            x: touch.clientX,
            y: touch.clientY,
            deltaX,
            deltaY,
          });
        }
        // Detect tap (short touch, small movement)
        else if (distance < 10 && deltaTime < 300) {
          this.onGesture?.({
            type: 'tap',
            x: touch.clientX,
            y: touch.clientY,
          });
        }

        this.touches.delete(touch.identifier);
      }
    });

    // Reset pinch-rotate state
    if (event.touches.length < 2) {
      this.lastPinchDistance = 0;
      this.lastPinchAngle = 0;
    }
  }

  private getDistance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(x1: number, y1: number, x2: number, y2: number): number {
    return Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public dispose(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
    this.touches.clear();
  }
}

