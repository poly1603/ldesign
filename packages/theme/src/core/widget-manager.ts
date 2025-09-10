/**
 * @file 挂件管理器
 * @description 负责管理节日主题挂件的添加、移除、更新和渲染
 */

import type {
  WidgetConfig,
  WidgetManagerConfig,
  IWidgetManager,
  WidgetType,
  WidgetPosition,
  WidgetStyle
} from './types'

/**
 * 挂件管理器
 * 
 * 负责管理页面上的装饰挂件，包括添加、移除、更新、显示隐藏等操作
 * 支持多种挂件类型和响应式布局
 * 
 * @example
 * ```typescript
 * const widgetManager = new WidgetManager({
 *   container: document.body,
 *   maxWidgets: 50
 * })
 * 
 * await widgetManager.init()
 * 
 * await widgetManager.addWidget({
 *   id: 'snowflake-1',
 *   name: '雪花',
 *   type: WidgetType.ANIMATION,
 *   content: '<svg>...</svg>',
 *   position: { type: 'fixed', position: { x: '50%', y: '10%' }, anchor: 'top-center' },
 *   animation: { name: 'snowfall', duration: 3000, iterations: 'infinite' }
 * })
 * ```
 */
export class WidgetManager implements IWidgetManager {
  private _config: WidgetManagerConfig
  private _widgets: Map<string, WidgetConfig> = new Map()
  private _widgetElements: Map<string, HTMLElement> = new Map()
  private _container: HTMLElement | null = null
  private _isInitialized = false
  private _resizeObserver: ResizeObserver | null = null
  private _mutationObserver: MutationObserver | null = null

  /**
   * 创建挂件管理器实例
   * @param config 挂件管理器配置
   */
  constructor(config: WidgetManagerConfig = {}) {
    this._config = {
      container: document.body,
      enablePerformanceMonitoring: false,
      maxWidgets: 100,
      enableCollisionDetection: false,
      ...config
    }
  }

  /**
   * 当前挂件列表
   */
  get widgets(): WidgetConfig[] {
    return Array.from(this._widgets.values())
  }

  /**
   * 是否已初始化
   */
  get isInitialized(): boolean {
    return this._isInitialized
  }

  /**
   * 初始化挂件管理器
   */
  async init(): Promise<void> {
    if (this._isInitialized) {
      console.warn('WidgetManager is already initialized')
      return
    }

    try {
      // 获取容器元素
      this._container = this._getContainer()
      if (!this._container) {
        throw new Error('Container element not found')
      }

      // 确保容器有相对定位
      this._ensureContainerPositioning()

      // 设置响应式监听
      this._setupResponsiveListeners()

      // 设置性能监控
      if (this._config.enablePerformanceMonitoring) {
        this._setupPerformanceMonitoring()
      }

      this._isInitialized = true

    } catch (error) {
      console.error('Failed to initialize WidgetManager:', error)
      throw error
    }
  }

  /**
   * 添加挂件
   * @param widget 挂件配置
   */
  async addWidget(widget: WidgetConfig): Promise<void> {
    if (!this._isInitialized) {
      throw new Error('WidgetManager is not initialized. Call init() first.')
    }

    if (this._widgets.has(widget.id)) {
      console.warn(`Widget with id "${widget.id}" already exists`)
      return
    }

    if (this._widgets.size >= this._config.maxWidgets!) {
      console.warn(`Maximum widget limit (${this._config.maxWidgets}) reached`)
      return
    }

    try {
      // 创建挂件元素
      const element = await this._createWidgetElement(widget)
      
      // 添加到容器
      this._container!.appendChild(element)

      // 保存引用
      this._widgets.set(widget.id, widget)
      this._widgetElements.set(widget.id, element)

      // 应用样式和动画
      this._applyWidgetStyles(element, widget)
      
      if (widget.animation) {
        this._applyWidgetAnimation(element, widget)
      }

      // 设置交互事件
      if (widget.interactive) {
        this._setupWidgetInteraction(element, widget)
      }

    } catch (error) {
      console.error(`Failed to add widget "${widget.id}":`, error)
      throw error
    }
  }

  /**
   * 移除挂件
   * @param id 挂件ID
   */
  async removeWidget(id: string): Promise<void> {
    if (!this._widgets.has(id)) {
      console.warn(`Widget with id "${id}" not found`)
      return
    }

    try {
      const element = this._widgetElements.get(id)
      if (element) {
        // 移除动画
        element.getAnimations().forEach(animation => animation.cancel())
        
        // 移除元素
        element.remove()
        this._widgetElements.delete(id)
      }

      this._widgets.delete(id)

    } catch (error) {
      console.error(`Failed to remove widget "${id}":`, error)
      throw error
    }
  }

  /**
   * 更新挂件
   * @param id 挂件ID
   * @param updates 更新内容
   */
  async updateWidget(id: string, updates: Partial<WidgetConfig>): Promise<void> {
    const widget = this._widgets.get(id)
    if (!widget) {
      throw new Error(`Widget with id "${id}" not found`)
    }

    const element = this._widgetElements.get(id)
    if (!element) {
      throw new Error(`Widget element for id "${id}" not found`)
    }

    try {
      // 更新配置
      const updatedWidget = { ...widget, ...updates }
      this._widgets.set(id, updatedWidget)

      // 更新内容
      if (updates.content !== undefined) {
        element.innerHTML = updates.content
      }

      // 更新样式
      if (updates.style || updates.position) {
        this._applyWidgetStyles(element, updatedWidget)
      }

      // 更新动画
      if (updates.animation !== undefined) {
        // 停止现有动画
        element.getAnimations().forEach(animation => animation.cancel())
        
        if (updates.animation) {
          this._applyWidgetAnimation(element, updatedWidget)
        }
      }

      // 更新可见性
      if (updates.visible !== undefined) {
        element.style.display = updates.visible ? '' : 'none'
      }

    } catch (error) {
      console.error(`Failed to update widget "${id}":`, error)
      throw error
    }
  }

  /**
   * 获取挂件
   * @param id 挂件ID
   */
  getWidget(id: string): WidgetConfig | null {
    return this._widgets.get(id) || null
  }

  /**
   * 清空所有挂件
   */
  async clearWidgets(): Promise<void> {
    const widgetIds = Array.from(this._widgets.keys())
    
    for (const id of widgetIds) {
      await this.removeWidget(id)
    }
  }

  /**
   * 显示挂件
   * @param id 挂件ID
   */
  async showWidget(id: string): Promise<void> {
    await this.updateWidget(id, { visible: true })
  }

  /**
   * 隐藏挂件
   * @param id 挂件ID
   */
  async hideWidget(id: string): Promise<void> {
    await this.updateWidget(id, { visible: false })
  }

  /**
   * 销毁挂件管理器
   */
  destroy(): void {
    // 清空所有挂件
    this.clearWidgets()

    // 清理监听器
    this._resizeObserver?.disconnect()
    this._mutationObserver?.disconnect()

    // 重置状态
    this._widgets.clear()
    this._widgetElements.clear()
    this._container = null
    this._isInitialized = false
  }

  /**
   * 获取容器元素
   */
  private _getContainer(): HTMLElement | null {
    if (typeof this._config.container === 'string') {
      return document.querySelector(this._config.container)
    }
    return this._config.container || document.body
  }

  /**
   * 确保容器有正确的定位
   */
  private _ensureContainerPositioning(): void {
    if (!this._container) return

    const computedStyle = getComputedStyle(this._container)
    if (computedStyle.position === 'static') {
      this._container.style.position = 'relative'
    }
  }

  /**
   * 创建挂件元素
   * @param widget 挂件配置
   */
  private async _createWidgetElement(widget: WidgetConfig): Promise<HTMLElement> {
    const element = document.createElement('div')
    
    // 设置基础属性
    element.id = `widget-${widget.id}`
    element.className = `ldesign-widget ldesign-widget-${widget.type}`
    element.setAttribute('data-widget-id', widget.id)
    element.setAttribute('data-widget-type', widget.type)
    
    // 设置内容
    element.innerHTML = widget.content

    // 设置可见性
    if (widget.visible === false) {
      element.style.display = 'none'
    }

    return element
  }

  /**
   * 应用挂件样式
   * @param element 挂件元素
   * @param widget 挂件配置
   */
  private _applyWidgetStyles(element: HTMLElement, widget: WidgetConfig): void {
    // 应用位置
    if (widget.position) {
      this._applyPosition(element, widget.position)
    }

    // 应用样式
    if (widget.style) {
      this._applyStyle(element, widget.style)
    }

    // 应用响应式
    if (widget.responsive) {
      element.classList.add('ldesign-widget-responsive')
    }
  }

  /**
   * 应用位置样式
   * @param element 元素
   * @param position 位置配置
   */
  private _applyPosition(element: HTMLElement, position: WidgetPosition): void {
    element.style.position = position.type

    // 根据锚点设置位置
    const { x, y } = position.position
    const anchor = position.anchor

    if (anchor.includes('top')) {
      element.style.top = typeof y === 'number' ? `${y}px` : y
    } else if (anchor.includes('bottom')) {
      element.style.bottom = typeof y === 'number' ? `${y}px` : y
    } else {
      element.style.top = '50%'
      element.style.transform = 'translateY(-50%)'
    }

    if (anchor.includes('left')) {
      element.style.left = typeof x === 'number' ? `${x}px` : x
    } else if (anchor.includes('right')) {
      element.style.right = typeof x === 'number' ? `${x}px` : x
    } else {
      element.style.left = '50%'
      element.style.transform = element.style.transform 
        ? `${element.style.transform} translateX(-50%)`
        : 'translateX(-50%)'
    }
  }

  /**
   * 应用样式
   * @param element 元素
   * @param style 样式配置
   */
  private _applyStyle(element: HTMLElement, style: WidgetStyle): void {
    if (style.size) {
      if (style.size.width) {
        element.style.width = typeof style.size.width === 'number' 
          ? `${style.size.width}px` 
          : style.size.width
      }
      if (style.size.height) {
        element.style.height = typeof style.size.height === 'number' 
          ? `${style.size.height}px` 
          : style.size.height
      }
    }

    if (style.opacity !== undefined) {
      element.style.opacity = style.opacity.toString()
    }

    if (style.zIndex !== undefined) {
      element.style.zIndex = style.zIndex.toString()
    }

    if (style.transform) {
      element.style.transform = style.transform
    }

    if (style.filter) {
      element.style.filter = style.filter
    }

    if (style.customCSS) {
      Object.entries(style.customCSS).forEach(([property, value]) => {
        element.style.setProperty(property, value)
      })
    }
  }

  /**
   * 应用挂件动画
   * @param element 挂件元素
   * @param widget 挂件配置
   */
  private _applyWidgetAnimation(element: HTMLElement, widget: WidgetConfig): void {
    // 这里会在动画引擎实现后完善
    if (widget.animation) {
      element.classList.add(`ldesign-animation-${widget.animation.name}`)
    }
  }

  /**
   * 设置挂件交互
   * @param element 挂件元素
   * @param widget 挂件配置
   */
  private _setupWidgetInteraction(element: HTMLElement, widget: WidgetConfig): void {
    element.style.cursor = 'pointer'
    element.addEventListener('click', () => {
      // 触发点击事件
      element.dispatchEvent(new CustomEvent('widget-click', {
        detail: { widget }
      }))
    })
  }

  /**
   * 设置响应式监听器
   */
  private _setupResponsiveListeners(): void {
    if (!this._container) return

    this._resizeObserver = new ResizeObserver(() => {
      this._handleResize()
    })
    this._resizeObserver.observe(this._container)
  }

  /**
   * 处理容器大小变化
   */
  private _handleResize(): void {
    // 重新计算响应式挂件的位置和大小
    this._widgets.forEach((widget, id) => {
      if (widget.responsive) {
        const element = this._widgetElements.get(id)
        if (element) {
          this._applyWidgetStyles(element, widget)
        }
      }
    })
  }

  /**
   * 设置性能监控
   */
  private _setupPerformanceMonitoring(): void {
    // 监控挂件数量和性能
    setInterval(() => {
      if (this._widgets.size > this._config.maxWidgets! * 0.8) {
        console.warn(`Widget count approaching limit: ${this._widgets.size}/${this._config.maxWidgets}`)
      }
    }, 5000)
  }
}
