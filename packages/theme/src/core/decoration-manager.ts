/**
 * @ldesign/theme - 装饰管理器
 *
 * 负责主题装饰元素的管理和渲染
 */

import type { EventEmitter } from '../utils/event-emitter'
import type {
  DecorationCondition,
  DecorationConfig,
  DecorationManagerInstance,
  ResourceManagerInstance,
} from './types'

/**
 * 装饰元素实例
 */
interface DecorationInstance {
  config: DecorationConfig
  element: HTMLElement
  visible: boolean
  rendered: boolean
}

/**
 * 装饰管理器实现
 */
export class DecorationManager implements DecorationManagerInstance {
  private decorations = new Map<string, DecorationInstance>()
  private container: HTMLElement
  private eventEmitter: EventEmitter
  private resourceManager: ResourceManagerInstance
  private observer?: IntersectionObserver
  private resizeObserver?: ResizeObserver

  constructor(
    container: HTMLElement,
    eventEmitter: EventEmitter,
    resourceManager: ResourceManagerInstance
  ) {
    this.container = container
    this.eventEmitter = eventEmitter
    this.resourceManager = resourceManager
    this.setupObservers()
  }

  /**
   * 添加装饰元素
   */
  add(decoration: DecorationConfig): void {
    if (this.decorations.has(decoration.id)) {
      console.warn(`Decoration with id "${decoration.id}" already exists`)
      return
    }

    const instance: DecorationInstance = {
      config: decoration,
      element: this.createElement(decoration),
      visible: this.checkConditions(decoration),
      rendered: false,
    }

    this.decorations.set(decoration.id, instance)

    if (instance.visible) {
      this.renderDecoration(instance)
    }

    this.eventEmitter.emit('decoration-added', { decoration: decoration.id })
  }

  /**
   * 移除装饰元素
   */
  remove(id: string): void {
    const instance = this.decorations.get(id)
    if (!instance) {
      return
    }

    if (instance.rendered) {
      this.unrenderDecoration(instance)
    }

    this.decorations.delete(id)
    this.eventEmitter.emit('decoration-removed', { decoration: id })
  }

  /**
   * 更新装饰元素
   */
  update(id: string, updates: Partial<DecorationConfig>): void {
    const instance = this.decorations.get(id)
    if (!instance) {
      return
    }

    const oldConfig = instance.config
    instance.config = { ...oldConfig, ...updates }

    // 重新创建元素如果必要
    if (this.needsRecreate(oldConfig, instance.config)) {
      if (instance.rendered) {
        this.unrenderDecoration(instance)
      }
      instance.element = this.createElement(instance.config)
      instance.rendered = false
    } else {
      // 只更新样式
      this.updateElementStyle(instance.element, instance.config)
    }

    // 检查可见性
    const newVisible = this.checkConditions(instance.config)
    if (newVisible !== instance.visible) {
      instance.visible = newVisible
      if (newVisible && !instance.rendered) {
        this.renderDecoration(instance)
      } else if (!newVisible && instance.rendered) {
        this.unrenderDecoration(instance)
      }
    }
  }

  /**
   * 获取装饰元素
   */
  get(id: string): DecorationConfig | undefined {
    return this.decorations.get(id)?.config
  }

  /**
   * 获取所有装饰元素
   */
  getAll(): DecorationConfig[] {
    return Array.from(this.decorations.values()).map(
      instance => instance.config
    )
  }

  /**
   * 清空所有装饰元素
   */
  clear(): void {
    for (const instance of this.decorations.values()) {
      if (instance.rendered) {
        this.unrenderDecoration(instance)
      }
    }
    this.decorations.clear()
  }

  /**
   * 渲染所有装饰元素
   */
  render(): void {
    for (const instance of this.decorations.values()) {
      if (instance.visible && !instance.rendered) {
        this.renderDecoration(instance)
      }
    }
  }

  /**
   * 销毁装饰管理器
   */
  destroy(): void {
    this.clear()
    this.observer?.disconnect()
    this.resizeObserver?.disconnect()
  }

  /**
   * 创建装饰元素
   */
  private createElement(config: DecorationConfig): HTMLElement {
    const element = document.createElement('div')
    element.className = `theme-decoration theme-decoration-${config.type}`
    element.setAttribute('data-decoration-id', config.id)

    this.updateElementStyle(element, config)
    this.updateElementContent(element, config)

    return element
  }

  /**
   * 更新元素样式
   */
  private updateElementStyle(
    element: HTMLElement,
    config: DecorationConfig
  ): void {
    const { position, style } = config

    // 设置定位
    element.style.position = position.type
    element.style.left =
      typeof position.position.x === 'number'
        ? `${position.position.x}px`
        : position.position.x
    element.style.top =
      typeof position.position.y === 'number'
        ? `${position.position.y}px`
        : position.position.y

    if (position.position.z !== undefined) {
      element.style.zIndex = position.position.z.toString()
    }

    // 设置尺寸
    element.style.width =
      typeof style.size.width === 'number'
        ? `${style.size.width}px`
        : style.size.width
    element.style.height =
      typeof style.size.height === 'number'
        ? `${style.size.height}px`
        : style.size.height

    // 设置其他样式
    if (style.opacity !== undefined) {
      element.style.opacity = style.opacity.toString()
    }
    if (style.rotation !== undefined) {
      element.style.transform = `rotate(${style.rotation}deg)`
    }
    if (style.scale !== undefined) {
      const currentTransform = element.style.transform || ''
      element.style.transform = `${currentTransform} scale(${style.scale})`
    }
    if (style.zIndex !== undefined) {
      element.style.zIndex = style.zIndex.toString()
    }
    if (style.filter) {
      element.style.filter = style.filter
    }
    if (style.transform) {
      element.style.transform = style.transform
    }
    if (style.transition) {
      element.style.transition = style.transition
    }

    // 设置交互性
    if (config.interactive) {
      element.style.pointerEvents = 'auto'
      element.style.cursor = 'pointer'
    } else {
      element.style.pointerEvents = 'none'
    }
  }

  /**
   * 更新元素内容
   */
  private async updateElementContent(
    element: HTMLElement,
    config: DecorationConfig
  ): Promise<void> {
    try {
      switch (config.type) {
        case 'image':
          const img = (await this.resourceManager.load(
            config.src,
            'image'
          )) as HTMLImageElement
          element.appendChild(img.cloneNode() as HTMLImageElement)
          break

        case 'icon':
        case 'svg':
          const svgContent = (await this.resourceManager.load(
            config.src,
            'icon'
          )) as string
          element.innerHTML = svgContent
          break

        case 'pattern':
          element.style.backgroundImage = `url(${config.src})`
          element.style.backgroundRepeat = 'repeat'
          break

        default:
          element.style.backgroundImage = `url(${config.src})`
          element.style.backgroundSize = 'contain'
          element.style.backgroundRepeat = 'no-repeat'
          element.style.backgroundPosition = 'center'
      }
    } catch (error) {
      console.error(`Failed to load decoration content: ${config.src}`, error)
      element.textContent = '❌' // 显示错误标识
    }
  }

  /**
   * 渲染装饰元素
   */
  private renderDecoration(instance: DecorationInstance): void {
    if (instance.rendered) {
      return
    }

    this.container.appendChild(instance.element)
    instance.rendered = true

    // 添加动画
    if (instance.config.animation) {
      this.applyAnimation(instance.element, instance.config.animation)
    }

    // 添加交互事件
    if (instance.config.interactive) {
      this.addInteractiveEvents(instance.element, instance.config)
    }
  }

  /**
   * 取消渲染装饰元素
   */
  private unrenderDecoration(instance: DecorationInstance): void {
    if (!instance.rendered) {
      return
    }

    if (instance.element.parentNode) {
      instance.element.parentNode.removeChild(instance.element)
    }
    instance.rendered = false
  }

  /**
   * 检查装饰条件
   */
  private checkConditions(config: DecorationConfig): boolean {
    if (!config.conditions || config.conditions.length === 0) {
      return true
    }

    return config.conditions.every(condition => this.checkCondition(condition))
  }

  /**
   * 检查单个条件
   */
  private checkCondition(condition: DecorationCondition): boolean {
    switch (condition.type) {
      case 'screen-size':
        return this.checkScreenSize(condition)
      case 'time':
        return this.checkTime(condition)
      case 'user-preference':
        return this.checkUserPreference(condition)
      case 'performance':
        return this.checkPerformance(condition)
      default:
        return true
    }
  }

  /**
   * 检查屏幕尺寸条件
   */
  private checkScreenSize(condition: DecorationCondition): boolean {
    const screenWidth = window.innerWidth
    const value = condition.value as number

    switch (condition.operator) {
      case 'gt':
        return screenWidth > value
      case 'lt':
        return screenWidth < value
      case 'gte':
        return screenWidth >= value
      case 'lte':
        return screenWidth <= value
      case 'eq':
        return screenWidth === value
      default:
        return true
    }
  }

  /**
   * 检查时间条件
   */
  private checkTime(condition: DecorationCondition): boolean {
    const now = new Date()
    const value = condition.value as { start: string; end: string }

    // 这里可以实现更复杂的时间检查逻辑
    return true
  }

  /**
   * 检查用户偏好条件
   */
  private checkUserPreference(condition: DecorationCondition): boolean {
    // 检查用户偏好设置，如减少动画等
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * 检查性能条件
   */
  private checkPerformance(condition: DecorationCondition): boolean {
    // 检查设备性能，如 GPU 支持等
    return true
  }

  /**
   * 判断是否需要重新创建元素
   */
  private needsRecreate(
    oldConfig: DecorationConfig,
    newConfig: DecorationConfig
  ): boolean {
    return oldConfig.type !== newConfig.type || oldConfig.src !== newConfig.src
  }

  /**
   * 应用动画
   */
  private applyAnimation(element: HTMLElement, animationName: string): void {
    element.classList.add(`animation-${animationName}`)
  }

  /**
   * 添加交互事件
   */
  private addInteractiveEvents(
    element: HTMLElement,
    config: DecorationConfig
  ): void {
    element.addEventListener('click', () => {
      this.eventEmitter.emit('decoration-clicked', { decoration: config.id })
    })

    element.addEventListener('mouseenter', () => {
      this.eventEmitter.emit('decoration-hover', { decoration: config.id })
    })
  }

  /**
   * 设置观察器
   */
  private setupObservers(): void {
    // 交集观察器用于优化渲染
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const decorationId = entry.target.getAttribute('data-decoration-id')
        if (decorationId) {
          const instance = this.decorations.get(decorationId)
          if (instance) {
            // 根据可见性优化渲染
          }
        }
      })
    })

    // 尺寸观察器用于响应式更新
    this.resizeObserver = new ResizeObserver(() => {
      // 重新检查所有装饰的条件
      for (const instance of this.decorations.values()) {
        const newVisible = this.checkConditions(instance.config)
        if (newVisible !== instance.visible) {
          instance.visible = newVisible
          if (newVisible && !instance.rendered) {
            this.renderDecoration(instance)
          } else if (!newVisible && instance.rendered) {
            this.unrenderDecoration(instance)
          }
        }
      }
    })

    this.resizeObserver.observe(this.container)
  }
}

/**
 * 创建装饰管理器实例
 */
export function createDecorationManager(
  container: HTMLElement,
  eventEmitter: EventEmitter,
  resourceManager: ResourceManagerInstance
): DecorationManagerInstance {
  return new DecorationManager(container, eventEmitter, resourceManager)
}
