/**
 * 拖拽指令
 * 使元素可拖拽移动
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective } from '../base/vue-directive-adapter'

export interface DragOptions {
  disabled?: boolean
  handle?: string | HTMLElement
  container?: string | HTMLElement
  axis?: 'x' | 'y' | 'both'
  grid?: [number, number]
  bounds?:
  | {
    left?: number
    top?: number
    right?: number
    bottom?: number
  }
  | 'parent'
  | string
  onStart?: (event: MouseEvent, position: { x: number; y: number }) => void
  onDrag?: (event: MouseEvent, position: { x: number; y: number }) => void
  onEnd?: (event: MouseEvent, position: { x: number; y: number }) => void
  cursor?: string
  zIndex?: number
  opacity?: number
  clone?: boolean
  revert?: boolean | 'invalid'
  helper?: 'original' | 'clone' | ((event: MouseEvent) => HTMLElement)
}

export interface DragPosition {
  x: number
  y: number
  startX: number
  startY: number
  deltaX: number
  deltaY: number
}

export class DragDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'drag',
      description: '拖拽指令，使元素可拖拽移动',
      version: '1.0.0',
      category: 'interaction',
      tags: ['drag', 'draggable', 'interaction', 'move'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    // 存储配置
    el._dragConfig = config

    // 如果未禁用，初始化拖拽
    if (!config.disabled) {
      this.initDrag(el, config)
    }

    this.log('Drag directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    const oldConfig = el._dragConfig

    // 更新配置
    el._dragConfig = config

    // 如果禁用状态改变，重新初始化
    if (oldConfig?.disabled !== config.disabled) {
      this.destroyDrag(el)
      if (!config.disabled) {
        this.initDrag(el, config)
      }
    }
  }

  public unmounted(el: HTMLElement): void {
    this.destroyDrag(el)
    delete el._dragConfig

    this.log('Drag directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): DragOptions {
    const value = binding.value

    if (typeof value === 'boolean') {
      return { disabled: !value }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<DragOptions>
      return {
        disabled: obj.disabled || false,
        handle: obj.handle,
        container: obj.container,
        axis: obj.axis || 'both',
        grid: obj.grid,
        bounds: obj.bounds,
        onStart: obj.onStart,
        onDrag: obj.onDrag,
        onEnd: obj.onEnd,
        cursor: obj.cursor || 'move',
        zIndex: obj.zIndex,
        opacity: obj.opacity,
        clone: obj.clone || false,
        revert: obj.revert || false,
        helper: obj.helper || 'original',
      }
    }

    return {
      disabled: false,
      axis: 'both',
      cursor: 'move',
    }
  }

  private initDrag(el: HTMLElement, config: DragOptions): void {
    const handle = this.getHandle(el, config)

    // 设置样式
    if (el.style.position === '' || el.style.position === 'static') {
      el.style.position = 'relative'
    }

    handle.style.cursor = config.cursor || 'move'
    handle.style.userSelect = 'none'

    // 绑定事件
    const mouseDownHandler = this.createMouseDownHandler(el, config)
    handle.addEventListener('mousedown', mouseDownHandler)

    // 存储处理器
    el._dragMouseDownHandler = mouseDownHandler
    el._dragHandle = handle
  }

  private destroyDrag(el: HTMLElement): void {
    const handle = el._dragHandle
    const mouseDownHandler = el._dragMouseDownHandler

    if (handle && mouseDownHandler) {
      handle.removeEventListener('mousedown', mouseDownHandler)
      handle.style.cursor = ''
      handle.style.userSelect = ''
    }

    // 清理拖拽状态
    this.cleanupDragState(el)

    delete el._dragMouseDownHandler
    delete el._dragHandle
  }

  private getHandle(el: HTMLElement, config: DragOptions): HTMLElement {
    if (!config.handle) {
      return el
    }

    if (typeof config.handle === 'string') {
      const handleEl = el.querySelector(config.handle) as HTMLElement
      return handleEl || el
    }

    return config.handle
  }

  private createMouseDownHandler(
    el: HTMLElement,
    config: DragOptions
  ): EventListener {
    return (event: Event) => {
      const mouseEvent = event as MouseEvent
      mouseEvent.preventDefault()

      // 检查是否应该开始拖拽
      if (mouseEvent.button !== 0) return // 只响应左键

      const startPosition = this.getStartPosition(el, mouseEvent)

      // 创建拖拽状态
      const dragState: DragState = {
        isDragging: false,
        startX: mouseEvent.clientX,
        startY: mouseEvent.clientY,
        currentX: startPosition.x,
        currentY: startPosition.y,
        originalX: startPosition.x,
        originalY: startPosition.y,
      }

      el._dragState = dragState

      // 创建事件处理器
      const mouseMoveHandler = this.createMouseMoveHandler(
        el,
        config,
        dragState
      )
      const mouseUpHandler = this.createMouseUpHandler(
        el,
        config,
        dragState,
        mouseMoveHandler
      )

      // 绑定全局事件
      document.addEventListener('mousemove', mouseMoveHandler)
      document.addEventListener('mouseup', mouseUpHandler)

      // 存储处理器以便清理
      el._dragMouseMoveHandler = mouseMoveHandler
      el._dragMouseUpHandler = mouseUpHandler

      // 触发开始回调
      config.onStart?.(mouseEvent, { x: startPosition.x, y: startPosition.y })
    }
  }

  private createMouseMoveHandler(
    el: HTMLElement,
    config: DragOptions,
    dragState: DragState
  ): EventListener {
    return (event: Event) => {
      const mouseEvent = event as MouseEvent
      if (!dragState.isDragging) {
        dragState.isDragging = true
        this.onDragStart(el, config)
      }

      const deltaX = mouseEvent.clientX - dragState.startX
      const deltaY = mouseEvent.clientY - dragState.startY

      let newX = dragState.originalX + deltaX
      let newY = dragState.originalY + deltaY

      // 应用轴限制
      if (config.axis === 'x') {
        newY = dragState.originalY
      } else if (config.axis === 'y') {
        newX = dragState.originalX
      }

      // 应用网格对齐
      if (config.grid) {
        newX = Math.round(newX / config.grid[0]) * config.grid[0]
        newY = Math.round(newY / config.grid[1]) * config.grid[1]
      }

      // 应用边界限制
      const bounds = this.getBounds(el, config)
      if (bounds && typeof bounds === 'object') {
        if (bounds.left !== undefined) newX = Math.max(newX, bounds.left)
        if (bounds.right !== undefined) newX = Math.min(newX, bounds.right)
        if (bounds.top !== undefined) newY = Math.max(newY, bounds.top)
        if (bounds.bottom !== undefined) newY = Math.min(newY, bounds.bottom)
      }

      // 更新位置
      dragState.currentX = newX
      dragState.currentY = newY

      this.updatePosition(el, newX, newY)

      // 触发拖拽回调
      config.onDrag?.(mouseEvent, { x: newX, y: newY })
    }
  }

  private createMouseUpHandler(
    el: HTMLElement,
    config: DragOptions,
    dragState: DragState,
    mouseMoveHandler: EventListener
  ): EventListener {
    return (event: Event) => {
      const mouseEvent = event as MouseEvent
      // 移除全局事件监听器
      document.removeEventListener('mousemove', mouseMoveHandler)
      document.removeEventListener('mouseup', el._dragMouseUpHandler!)

      if (dragState.isDragging) {
        this.onDragEnd(el, config, dragState)

        // 触发结束回调
        config.onEnd?.(mouseEvent, {
          x: dragState.currentX,
          y: dragState.currentY,
        })
      }

      // 清理状态
      this.cleanupDragState(el)
    }
  }

  private getStartPosition(
    el: HTMLElement,
    _event: MouseEvent
  ): { x: number; y: number } {
    const computedStyle = getComputedStyle(el)

    const left = Number.parseInt(computedStyle.left) || 0
    const top = Number.parseInt(computedStyle.top) || 0

    return { x: left, y: top }
  }

  private getBounds(
    el: HTMLElement,
    config: DragOptions
  ): DragOptions['bounds'] | null {
    if (!config.bounds) return null

    if (typeof config.bounds === 'object' && config.bounds !== null) {
      return config.bounds
    }

    if (config.bounds === 'parent') {
      const parent = el.parentElement
      if (parent) {
        const parentRect = parent.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()

        return {
          left: 0,
          top: 0,
          right: parentRect.width - elRect.width,
          bottom: parentRect.height - elRect.height,
        }
      }
    }

    if (typeof config.bounds === 'string') {
      const container = document.querySelector(config.bounds) as HTMLElement
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()

        return {
          left: containerRect.left,
          top: containerRect.top,
          right: containerRect.right - elRect.width,
          bottom: containerRect.bottom - elRect.height,
        }
      }
    }

    return null
  }

  private updatePosition(el: HTMLElement, x: number, y: number): void {
    el.style.left = `${x}px`
    el.style.top = `${y}px`
  }

  private onDragStart(el: HTMLElement, config: DragOptions): void {
    // 添加拖拽样式
    this.addClass(el, 'dragging')

    // 设置z-index
    if (config.zIndex) {
      el.style.zIndex = config.zIndex.toString()
    }

    // 设置透明度
    if (config.opacity !== undefined) {
      el.style.opacity = config.opacity.toString()
    }
  }

  private onDragEnd(
    el: HTMLElement,
    config: DragOptions,
    dragState: DragState
  ): void {
    // 移除拖拽样式
    this.removeClass(el, 'dragging')

    // 恢复样式
    if (config.zIndex) {
      el.style.zIndex = ''
    }

    if (config.opacity !== undefined) {
      el.style.opacity = ''
    }

    // 处理回退
    if (config.revert) {
      this.revertPosition(el, dragState)
    }
  }

  private revertPosition(el: HTMLElement, dragState: DragState): void {
    // 动画回到原位置
    el.style.transition = 'all 0.3s ease'
    this.updatePosition(el, dragState.originalX, dragState.originalY)

    setTimeout(() => {
      el.style.transition = ''
    }, 300)
  }

  private cleanupDragState(el: HTMLElement): void {
    delete el._dragState
    delete el._dragMouseMoveHandler
    delete el._dragMouseUpHandler
  }
}

// 创建Vue指令
export const vDrag = defineDirective('drag', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new DragDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('drag', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'drag'
    ) as unknown as DragDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'drag'
    ) as unknown as DragDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('drag')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _dragState?: DragState
    _dragConfig?: DragOptions
    _dragMouseDownHandler?: EventListener
    _dragMouseMoveHandler?: EventListener
    _dragMouseUpHandler?: EventListener
    _dragHandle?: HTMLElement
  }
}

// 导出指令实例
type DragState = {
  isDragging: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  originalX: number
  originalY: number
}

export const dragDirective = new DragDirective()

// 使用示例
/*
<template>
  <!-- 基础拖拽 -->
  <div v-drag class="draggable-box">
    可拖拽的盒子
  </div>

  <!-- 指定拖拽手柄 -->
  <div v-drag="{ handle: '.drag-handle' }" class="window">
    <div class="drag-handle">拖拽手柄</div>
    <div class="content">窗口内容</div>
  </div>

  <!-- 限制拖拽轴 -->
  <div v-drag="{ axis: 'x' }" class="horizontal-slider">
    只能水平拖拽
  </div>

  <!-- 完整配置 -->
  <div v-drag="{
    handle: '.title-bar',
    bounds: 'parent',
    axis: 'both',
    grid: [10, 10],
    cursor: 'grabbing',
    opacity: 0.8,
    zIndex: 1000,
    onStart: handleDragStart,
    onDrag: handleDrag,
    onEnd: handleDragEnd
  }" class="modal">
    <div class="title-bar">标题栏</div>
    <div class="modal-content">模态框内容</div>
  </div>

  <!-- 边界限制 -->
  <div class="container">
    <div v-drag="{
      bounds: {
        left: 0,
        top: 0,
        right: 300,
        bottom: 200
      }
    }" class="bounded-element">
      边界限制拖拽
    </div>
  </div>
</template>

<script setup>
const handleDragStart = (event, position) => {
  console.log('开始拖拽:', position)
}

const handleDrag = (event, position) => {
  console.log('拖拽中:', position)
}

const handleDragEnd = (event, position) => {
  console.log('拖拽结束:', position)
}
</script>

<style>
.draggable-box {
  width: 100px;
  height: 100px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.dragging {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transform: scale(1.05);
}

.drag-handle {
  background: #333;
  color: white;
  padding: 8px;
  cursor: move;
}

.container {
  position: relative;
  width: 400px;
  height: 300px;
  border: 2px dashed #ccc;
}
</style>
*/
