/**
 * 拖拽指令
 * 使元素可拖拽移动
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface DragOptions {
  disabled?: boolean
  axis?: 'x' | 'y' | 'both'
  handle?: string | HTMLElement
  constraint?: DragConstraint
  onStart?: (event: DragEvent) => void
  onMove?: (event: DragEvent) => void
  onEnd?: (event: DragEvent) => void
  cursor?: string
  preventDefault?: boolean
  stopPropagation?: boolean
}

export interface DragConstraint {
  minX?: number
  maxX?: number
  minY?: number
  maxY?: number
  parent?: boolean
  selector?: string
}

export interface DragState {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  offsetX: number
  offsetY: number
}

export interface DragEvent {
  el: HTMLElement
  state: DragState
  originalEvent: MouseEvent | TouchEvent
}

export class DragDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'drag',
      description: '使元素可拖拽移动',
      version: '1.0.0',
      category: 'interaction',
      tags: ['drag', 'draggable', 'move', 'interaction'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (config.disabled) {
      return
    }

    // Initialize drag state
    const state: DragState = {
      isDragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
    }

    // Get handle element
    const handle = this.getHandle(el, config.handle)

    // Set initial position
    if (!el.style.position || el.style.position === 'static') {
      el.style.position = 'relative'
    }

    // Mouse/Touch event handlers
    const handleStart = (e: MouseEvent | TouchEvent) => {
      if (config.disabled) return

      state.isDragging = true

      const point = this.getEventPoint(e)
      state.startX = point.x - state.offsetX
      state.startY = point.y - state.offsetY

      // Set cursor
      document.body.style.cursor = config.cursor ?? 'move'
      el.style.cursor = config.cursor ?? 'move'

      // Prevent text selection
      document.body.style.userSelect = 'none'

      // Call onStart callback
      if (config.onStart) {
        config.onStart({ el, state, originalEvent: e })
      }

      if (config.preventDefault) e.preventDefault()
      if (config.stopPropagation) e.stopPropagation()

      this.log('Drag started', state)
    }

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!state.isDragging) return

      const point = this.getEventPoint(e)
      let newX = point.x - state.startX
      let newY = point.y - state.startY

      // Apply axis constraints
      if (config.axis === 'x') {
        newY = state.offsetY
      } else if (config.axis === 'y') {
        newX = state.offsetX
      }

      // Apply boundary constraints
      if (config.constraint) {
        const bounds = this.getConstraintBounds(el, config.constraint)
        newX = Math.max(bounds.minX, Math.min(newX, bounds.maxX))
        newY = Math.max(bounds.minY, Math.min(newY, bounds.maxY))
      }

      state.currentX = newX
      state.currentY = newY
      state.offsetX = newX
      state.offsetY = newY

      // Apply transform
      el.style.transform = `translate(${newX}px, ${newY}px)`

      // Call onMove callback
      if (config.onMove) {
        config.onMove({ el, state, originalEvent: e })
      }

      if (config.preventDefault) e.preventDefault()
      if (config.stopPropagation) e.stopPropagation()
    }

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      if (!state.isDragging) return

      state.isDragging = false

      // Reset cursor
      document.body.style.cursor = ''
      el.style.cursor = ''
      document.body.style.userSelect = ''

      // Call onEnd callback
      if (config.onEnd) {
        config.onEnd({ el, state, originalEvent: e })
      }

      this.log('Drag ended', state)
    }

    // Store handlers for cleanup
    const handlers = { handleStart, handleMove, handleEnd }
    directiveUtils.storeData(el, 'drag-handlers', handlers)
    directiveUtils.storeData(el, 'drag-state', state)
    directiveUtils.storeData(el, 'drag-handle', handle)

    // Add event listeners
    handle.addEventListener('mousedown', handleStart)
    handle.addEventListener('touchstart', handleStart, { passive: !config.preventDefault })

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchmove', handleMove, { passive: !config.preventDefault })

    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchend', handleEnd)

    // Set handle cursor
    handle.style.cursor = config.cursor ?? 'move'

    this.log(`Drag directive mounted on element`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Clean up old handlers
    this.cleanup(el)

    // Re-mount with new config
    this.mounted(el, binding)

    this.log(`Drag directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    this.cleanup(el)
    this.log(`Drag directive unmounted from element`, el)
  }

  private cleanup(el: HTMLElement): void {
    const handlers = directiveUtils.getData(el, 'drag-handlers') as {
      handleStart: EventListener
      handleMove: EventListener
      handleEnd: EventListener
    } | undefined
    const handle = directiveUtils.getData(el, 'drag-handle') as HTMLElement
    const state = directiveUtils.getData(el, 'drag-state') as DragState | undefined

    // 如果正在拖拽，重置状态
    if (state && state.isDragging) {
      state.isDragging = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      if (el) {
        el.style.cursor = ''
      }
    }

    // 移除所有事件监听器
    if (handlers && handle) {
      handle.removeEventListener('mousedown', handlers.handleStart)
      handle.removeEventListener('touchstart', handlers.handleStart)

      document.removeEventListener('mousemove', handlers.handleMove)
      document.removeEventListener('touchmove', handlers.handleMove)

      document.removeEventListener('mouseup', handlers.handleEnd)
      document.removeEventListener('touchend', handlers.handleEnd)
    }

    // 清理存储的数据
    directiveUtils.removeData(el, 'drag-handlers')
    directiveUtils.removeData(el, 'drag-state')
    directiveUtils.removeData(el, 'drag-handle')
    
    // 清理元素引用
    if (el && typeof el === 'object') {
      ;(el as any).__dragState = null
      ;(el as any).__dragHandlers = null
    }
  }

  private getHandle(el: HTMLElement, handle?: string | HTMLElement): HTMLElement {
    if (!handle) {
      return el
    }

    if (typeof handle === 'string') {
      const handleEl = el.querySelector(handle) as HTMLElement
      return handleEl || el
    }

    return handle
  }

  private getEventPoint(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if ('touches' in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  private getConstraintBounds(el: HTMLElement, constraint: DragConstraint) {
    let minX = constraint.minX ?? -Infinity
    let maxX = constraint.maxX ?? Infinity
    let minY = constraint.minY ?? -Infinity
    let maxY = constraint.maxY ?? Infinity

    if (constraint.parent && el.parentElement) {
      const parent = el.parentElement
      const parentRect = parent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()

      minX = 0
      maxX = parentRect.width - elRect.width
      minY = 0
      maxY = parentRect.height - elRect.height
    }

    if (constraint.selector) {
      const container = document.querySelector(constraint.selector) as HTMLElement
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()

        minX = containerRect.left - elRect.left
        maxX = containerRect.right - elRect.right
        minY = containerRect.top - elRect.top
        maxY = containerRect.bottom - elRect.bottom
      }
    }

    return { minX, maxX, minY, maxY }
  }

  private parseConfig(binding: VueDirectiveBinding): DragOptions {
    const value = binding.value

    if (typeof value === 'boolean') {
      return { disabled: !value }
    }

    if (typeof value === 'object' && value !== null) {
      return value as DragOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic draggable element -->
<div v-drag class="draggable-box">
  Drag me!
</div>

<!-- Axis constraint -->
<div v-drag="{ axis: 'x' }" class="slider">
  Horizontal only
</div>

<div v-drag="{ axis: 'y' }" class="slider">
  Vertical only
</div>

<!-- With handle -->
<div v-drag="{ handle: '.handle' }" class="panel">
  <div class="handle">⋮⋮ Drag Handle</div>
  <div class="content">Panel content</div>
</div>

<!-- Boundary constraints -->
<div v-drag="{
  constraint: {
    parent: true
  }
}" class="bounded-box">
  Constrained to parent
</div>

<!-- With callbacks -->
<div v-drag="{
  onStart: (e) => ,
  onMove: (e) => updatePosition(e),
  onEnd: (e) => savePosition(e)
}" class="tracked-box">
  Tracked dragging
</div>

<!-- Custom constraints -->
<div v-drag="{
  constraint: {
    minX: 0,
    maxX: 500,
    minY: 0,
    maxY: 300
  }
}" class="limited-box">
  Limited range
</div>

<style>
.draggable-box {
  width: 100px;
  height: 100px;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.handle {
  background: #2c3e50;
  color: white;
  padding: 8px;
  cursor: move;
}
</style>
    `
  }
}

// Export the directive definition
export const vDrag = defineDirective(new DragDirective())

// Export default for convenience
export default vDrag
