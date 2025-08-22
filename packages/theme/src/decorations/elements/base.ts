/**
 * @ldesign/theme - 装饰元素基础类
 *
 * 提供装饰元素的基础功能和通用方法
 */

import type { DecorationConfig, Position } from '../../core/types'

/**
 * 装饰元素基础类
 */
export abstract class BaseDecoration {
  protected config: DecorationConfig
  protected element: HTMLElement
  protected container: HTMLElement
  protected isVisible = false
  protected isInteractive = false

  constructor(config: DecorationConfig, container: HTMLElement) {
    this.config = config
    this.container = container
    this.element = this.createElement()
    this.setupElement()
  }

  /**
   * 创建DOM元素
   */
  protected createElement(): HTMLElement {
    const element = document.createElement('div')
    element.className = `theme-decoration decoration-${this.config.type} decoration-${this.config.id}`
    element.setAttribute('data-decoration-id', this.config.id)
    element.setAttribute('data-decoration-type', this.config.type)

    return element
  }

  /**
   * 设置元素
   */
  protected setupElement(): void {
    this.updatePosition()
    this.updateStyle()
    this.updateContent()

    if (this.config.interactive) {
      this.setupInteractivity()
    }
  }

  /**
   * 更新位置
   */
  protected updatePosition(): void {
    const { position } = this.config

    this.element.style.position = position.type
    this.setPositionValue('left', position.position.x)
    this.setPositionValue('top', position.position.y)

    if (position.position.z !== undefined) {
      this.element.style.zIndex = position.position.z.toString()
    }

    if (position.anchor) {
      this.applyAnchor(position.anchor)
    }

    if (position.offset) {
      this.applyOffset(position.offset)
    }
  }

  /**
   * 设置位置值
   */
  protected setPositionValue(property: string, value: number | string): void {
    if (typeof value === 'number') {
      this.element.style.setProperty(property, `${value}px`)
    }
    else {
      this.element.style.setProperty(property, value)
    }
  }

  /**
   * 应用锚点
   */
  protected applyAnchor(anchor: string): void {
    const transforms: string[] = []

    switch (anchor) {
      case 'top-left':
        // 默认行为，无需变换
        break
      case 'top-right':
        transforms.push('translateX(-100%)')
        break
      case 'bottom-left':
        transforms.push('translateY(-100%)')
        break
      case 'bottom-right':
        transforms.push('translateX(-100%) translateY(-100%)')
        break
      case 'center':
        transforms.push('translateX(-50%) translateY(-50%)')
        break
      case 'top-center':
        transforms.push('translateX(-50%)')
        break
      case 'bottom-center':
        transforms.push('translateX(-50%) translateY(-100%)')
        break
    }

    if (transforms.length > 0) {
      const currentTransform = this.element.style.transform || ''
      this.element.style.transform = `${transforms.join(
        ' ',
      )} ${currentTransform}`.trim()
    }
  }

  /**
   * 应用偏移
   */
  protected applyOffset(offset: Position): void {
    const currentTransform = this.element.style.transform || ''
    const offsetX = typeof offset.x === 'number' ? `${offset.x}px` : offset.x
    const offsetY = typeof offset.y === 'number' ? `${offset.y}px` : offset.y

    this.element.style.transform
      = `${currentTransform} translate(${offsetX}, ${offsetY})`.trim()
  }

  /**
   * 更新样式
   */
  protected updateStyle(): void {
    const { style } = this.config

    // 设置尺寸
    this.setSizeValue('width', style.size.width)
    this.setSizeValue('height', style.size.height)

    // 设置其他样式属性
    if (style.opacity !== undefined) {
      this.element.style.opacity = style.opacity.toString()
    }

    if (style.rotation !== undefined) {
      const currentTransform = this.element.style.transform || ''
      this.element.style.transform
        = `${currentTransform} rotate(${style.rotation}deg)`.trim()
    }

    if (style.scale !== undefined) {
      const currentTransform = this.element.style.transform || ''
      this.element.style.transform
        = `${currentTransform} scale(${style.scale})`.trim()
    }

    if (style.zIndex !== undefined) {
      this.element.style.zIndex = style.zIndex.toString()
    }

    if (style.filter) {
      this.element.style.filter = style.filter
    }

    if (style.transition) {
      this.element.style.transition = style.transition
    }

    // 设置指针事件
    this.element.style.pointerEvents = this.config.interactive ? 'auto' : 'none'

    // 设置用户选择
    this.element.style.userSelect = 'none'

    // 设置拖拽
    this.element.setAttribute('draggable', 'false')
  }

  /**
   * 设置尺寸值
   */
  protected setSizeValue(property: string, value: number | string): void {
    if (typeof value === 'number') {
      this.element.style.setProperty(property, `${value}px`)
    }
    else {
      this.element.style.setProperty(property, value)
    }
  }

  /**
   * 更新内容 - 抽象方法，由子类实现
   */
  protected abstract updateContent(): Promise<void> | void

  /**
   * 设置交互性
   */
  protected setupInteractivity(): void {
    if (!this.config.interactive) {
      return
    }

    this.isInteractive = true
    this.element.style.cursor = 'pointer'

    // 添加基础交互事件
    this.element.addEventListener('click', this.handleClick.bind(this))
    this.element.addEventListener(
      'mouseenter',
      this.handleMouseEnter.bind(this),
    )
    this.element.addEventListener(
      'mouseleave',
      this.handleMouseLeave.bind(this),
    )

    // 添加触摸事件支持
    this.element.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this),
    )
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  /**
   * 处理点击事件
   */
  protected handleClick(event: MouseEvent): void {
    event.preventDefault()
    this.onInteract('click', event)
  }

  /**
   * 处理鼠标进入事件
   */
  protected handleMouseEnter(event: MouseEvent): void {
    this.onInteract('hover', event)
    this.element.style.transform += ' scale(1.1)'
  }

  /**
   * 处理鼠标离开事件
   */
  protected handleMouseLeave(event: MouseEvent): void {
    this.onInteract('leave', event)
    this.element.style.transform = this.element.style.transform.replace(
      ' scale(1.1)',
      '',
    )
  }

  /**
   * 处理触摸开始事件
   */
  protected handleTouchStart(event: TouchEvent): void {
    event.preventDefault()
    this.onInteract('touch', event)
  }

  /**
   * 处理触摸结束事件
   */
  protected handleTouchEnd(event: TouchEvent): void {
    event.preventDefault()
    this.onInteract('touchend', event)
  }

  /**
   * 交互回调 - 可由子类重写
   */
  protected onInteract(type: string, event: Event): void {
    // 发射自定义事件
    const customEvent = new CustomEvent('decoration-interact', {
      detail: {
        decorationId: this.config.id,
        decorationType: this.config.type,
        interactionType: type,
        originalEvent: event,
      },
    })

    this.element.dispatchEvent(customEvent)
  }

  /**
   * 显示装饰元素
   */
  show(): void {
    if (this.isVisible) {
      return
    }

    this.container.appendChild(this.element)
    this.isVisible = true

    // 添加动画类
    if (this.config.animation) {
      this.element.classList.add(`animation-${this.config.animation}`)
    }

    // 触发显示事件
    this.onShow()
  }

  /**
   * 隐藏装饰元素
   */
  hide(): void {
    if (!this.isVisible) {
      return
    }

    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }

    this.isVisible = false

    // 移除动画类
    if (this.config.animation) {
      this.element.classList.remove(`animation-${this.config.animation}`)
    }

    // 触发隐藏事件
    this.onHide()
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<DecorationConfig>): void {
    this.config = { ...this.config, ...updates }
    this.setupElement()
  }

  /**
   * 获取元素
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * 获取配置
   */
  getConfig(): DecorationConfig {
    return this.config
  }

  /**
   * 检查是否可见
   */
  isShown(): boolean {
    return this.isVisible
  }

  /**
   * 显示回调 - 可由子类重写
   */
  protected onShow(): void {
    // 子类可以重写此方法
  }

  /**
   * 隐藏回调 - 可由子类重写
   */
  protected onHide(): void {
    // 子类可以重写此方法
  }

  /**
   * 销毁装饰元素
   */
  destroy(): void {
    this.hide()

    // 移除事件监听器
    if (this.isInteractive) {
      this.element.removeEventListener('click', this.handleClick.bind(this))
      this.element.removeEventListener(
        'mouseenter',
        this.handleMouseEnter.bind(this),
      )
      this.element.removeEventListener(
        'mouseleave',
        this.handleMouseLeave.bind(this),
      )
      this.element.removeEventListener(
        'touchstart',
        this.handleTouchStart.bind(this),
      )
      this.element.removeEventListener(
        'touchend',
        this.handleTouchEnd.bind(this),
      )
    }

    // 清理引用
    this.element = null as any
    this.container = null as any
    this.config = null as any
  }
}
