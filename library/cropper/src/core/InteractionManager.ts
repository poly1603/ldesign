/**
 * InteractionManager - Handles user interactions (mouse, touch, gestures)
 */

import type { Point, Action } from '../types'
import { on, off, getPointer, getCenter, getTouchDistance, preventDefault } from '../utils/events'
import { supportsTouchEvents, getEventListenerOptions } from '../utils/compatibility'
import { getData } from '../utils/dom'

export interface InteractionCallbacks {
  onStart?: (action: Action, point: Point, event: MouseEvent | TouchEvent) => void
  onMove?: (action: Action, point: Point, deltaX: number, deltaY: number, event: MouseEvent | TouchEvent) => void
  onEnd?: (action: Action, point: Point, event: MouseEvent | TouchEvent) => void
  onZoom?: (delta: number, point: Point, event: WheelEvent | TouchEvent) => void
}

export class InteractionManager {
  private element: HTMLElement
  private callbacks: InteractionCallbacks
  private isActive = false
  private startPoint: Point = { x: 0, y: 0 }
  private currentPoint: Point = { x: 0, y: 0 }
  private currentAction: Action = 'crop'
  private initialTouchDistance = 0
  private isDragging = false

  // Options
  private movable: boolean
  private zoomable: boolean
  private zoomOnTouch: boolean
  private zoomOnWheel: boolean
  private wheelZoomRatio: number

  constructor(
    element: HTMLElement,
    callbacks: InteractionCallbacks,
    options: {
      movable?: boolean
      zoomable?: boolean
      zoomOnTouch?: boolean
      zoomOnWheel?: boolean
      wheelZoomRatio?: number
    } = {}
  ) {
    this.element = element
    this.callbacks = callbacks

    this.movable = options.movable ?? true
    this.zoomable = options.zoomable ?? true
    this.zoomOnTouch = options.zoomOnTouch ?? true
    this.zoomOnWheel = options.zoomOnWheel ?? true
    this.wheelZoomRatio = options.wheelZoomRatio ?? 0.1

    this.bindEvents()
  }

  /**
   * Bind events
   */
  private bindEvents(): void {
    const eventOptions = getEventListenerOptions(false) as any

    // Mouse events
    on(this.element, 'mousedown', this.handleStart.bind(this) as any, eventOptions)
    on(document, 'mousemove', this.handleMove.bind(this) as any, eventOptions)
    on(document, 'mouseup', this.handleEnd.bind(this) as any, eventOptions)

    // Touch events
    if (supportsTouchEvents()) {
      on(this.element, 'touchstart', this.handleStart.bind(this) as any, eventOptions)
      on(document, 'touchmove', this.handleMove.bind(this) as any, eventOptions)
      on(document, 'touchend', this.handleEnd.bind(this) as any, eventOptions)
      on(document, 'touchcancel', this.handleEnd.bind(this) as any, eventOptions)
    }

    // Wheel event for zoom
    if (this.zoomOnWheel) {
      on(this.element, 'wheel', this.handleWheel.bind(this) as any, eventOptions)
    }

    // Prevent default drag behavior
    on(this.element, 'dragstart', ((e: Event) => preventDefault(e)) as any)
  }

  /**
   * Unbind events
   */
  private unbindEvents(): void {
    off(this.element, 'mousedown', this.handleStart.bind(this))
    off(document, 'mousemove', this.handleMove.bind(this))
    off(document, 'mouseup', this.handleEnd.bind(this))

    if (supportsTouchEvents()) {
      off(this.element, 'touchstart', this.handleStart.bind(this))
      off(document, 'touchmove', this.handleMove.bind(this))
      off(document, 'touchend', this.handleEnd.bind(this))
      off(document, 'touchcancel', this.handleEnd.bind(this))
    }

    if (this.zoomOnWheel) {
      off(this.element, 'wheel', this.handleWheel.bind(this))
    }
  }

  /**
   * Handle interaction start
   */
  private handleStart(event: MouseEvent | TouchEvent): void {
    // Prevent default to avoid text selection
    preventDefault(event)

    // Get action from target element
    const target = event.target as HTMLElement
    this.currentAction = this.getAction(target)

    // Get start point
    if ((event as TouchEvent).touches) {
      const touchEvent = event as TouchEvent
      this.startPoint = getPointer(touchEvent)

      // Handle pinch zoom
      if (this.zoomOnTouch && touchEvent.touches.length === 2) {
        this.initialTouchDistance = getTouchDistance(touchEvent)
        return
      }
    } else {
      this.startPoint = getPointer(event)
    }

    this.currentPoint = { ...this.startPoint }
    this.isActive = true
    this.isDragging = false

    // Callback
    if (this.callbacks.onStart) {
      this.callbacks.onStart(this.currentAction, this.startPoint, event)
    }
  }

  /**
   * Handle interaction move
   */
  private handleMove(event: MouseEvent | TouchEvent): void {
    if (!this.isActive) return

    preventDefault(event)

    // Handle pinch zoom on touch
    if ((event as TouchEvent).touches) {
      const touchEvent = event as TouchEvent

      if (this.zoomOnTouch && touchEvent.touches.length === 2) {
        this.handlePinchZoom(touchEvent)
        return
      }

      this.currentPoint = getPointer(touchEvent)
    } else {
      this.currentPoint = getPointer(event)
    }

    const deltaX = this.currentPoint.x - this.startPoint.x
    const deltaY = this.currentPoint.y - this.startPoint.y

    // Mark as dragging if moved more than 1px
    if (!this.isDragging && (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1)) {
      this.isDragging = true
    }

    // Callback
    if (this.callbacks.onMove && this.isDragging) {
      this.callbacks.onMove(this.currentAction, this.currentPoint, deltaX, deltaY, event)
    }

    // Update start point for next move
    this.startPoint = { ...this.currentPoint }
  }

  /**
   * Handle interaction end
   */
  private handleEnd(event: MouseEvent | TouchEvent): void {
    if (!this.isActive) return

    const endPoint = getPointer(event, true)

    // Callback
    if (this.callbacks.onEnd) {
      this.callbacks.onEnd(this.currentAction, endPoint, event)
    }

    this.isActive = false
    this.isDragging = false
    this.initialTouchDistance = 0
  }

  /**
   * Handle wheel zoom
   */
  private handleWheel(event: WheelEvent): void {
    if (!this.zoomable) return

    preventDefault(event)

    // Normalize deltaY and apply zoom ratio
    // deltaY is typically around 100 per wheel tick
    // We want a small zoom step, so divide by 1000 to get 0.1 zoom step per tick
    const delta = -event.deltaY * 0.001
    const point = getPointer(event)

    // Callback
    if (this.callbacks.onZoom) {
      this.callbacks.onZoom(delta, point, event)
    }
  }

  /**
   * Handle pinch zoom
   */
  private handlePinchZoom(event: TouchEvent): void {
    if (!this.zoomable) return

    const currentDistance = getTouchDistance(event)
    const delta = (currentDistance - this.initialTouchDistance) * 0.01
    const point = getCenter(event)

    // Callback
    if (this.callbacks.onZoom) {
      this.callbacks.onZoom(delta, point, event)
    }

    this.initialTouchDistance = currentDistance
  }

  /**
   * Get action from target element
   */
  private getAction(target: HTMLElement): Action {
    const action = getData(target, 'action')

    if (action) {
      return action as Action
    }

    // Check class names for action - check target and parent elements
    let element: HTMLElement | null = target
    
    // Search up the DOM tree up to 3 levels
    for (let i = 0; i < 3 && element; i++) {
      // Check class names for action
      if (element.classList.contains('cropper-face')) {
        return 'move'
      }

      if (element.classList.contains('point-n')) return 'n'
      if (element.classList.contains('point-e')) return 'e'
      if (element.classList.contains('point-s')) return 's'
      if (element.classList.contains('point-w')) return 'w'
      if (element.classList.contains('point-ne')) return 'ne'
      if (element.classList.contains('point-nw')) return 'nw'
      if (element.classList.contains('point-se')) return 'se'
      if (element.classList.contains('point-sw')) return 'sw'

      if (element.classList.contains('line-n')) return 'n'
      if (element.classList.contains('line-e')) return 'e'
      if (element.classList.contains('line-s')) return 's'
      if (element.classList.contains('line-w')) return 'w'
      
      // Move to parent
      element = element.parentElement
    }

    // Default action is 'crop' (drag the image)
    return 'crop'
  }

  /**
   * Enable interactions
   */
  enable(): void {
    this.bindEvents()
  }

  /**
   * Disable interactions
   */
  disable(): void {
    this.unbindEvents()
    this.isActive = false
  }

  /**
   * Destroy
   */
  destroy(): void {
    this.unbindEvents()
  }
}
