/**
 * 基础组件类
 * 所有UI组件的基类，提供通用功能
 */

export interface BaseComponentOptions {
  className?: string
  container?: HTMLElement
  zIndex?: number
  visible?: boolean
  destroyOnHide?: boolean
}

export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export abstract class BaseComponent {
  protected element: HTMLElement
  protected options: BaseComponentOptions
  protected visible: boolean = false
  protected eventListeners: Map<string, Set<Function>> = new Map()
  private boundEvents: Array<{ element: Element | Document | Window, type: string, handler: EventListener }> = []

  constructor(options: BaseComponentOptions = {}) {
    this.options = {
      zIndex: 9999,
      visible: false,
      destroyOnHide: false,
      ...options
    }
    this.element = this.createElement()
    this.setupElement()
    this.attachToDOM()
    
    if (this.options.visible) {
      this.show()
    }
  }

  /**
   * 创建组件的DOM元素
   */
  protected abstract createElement(): HTMLElement

  /**
   * 设置元素基本属性
   */
  protected setupElement(): void {
    if (this.options.className) {
      this.element.classList.add(...this.options.className.split(' '))
    }
    
    if (this.options.zIndex) {
      this.element.style.zIndex = this.options.zIndex.toString()
    }
    
    this.element.style.display = 'none'
  }

  /**
   * 将元素附加到DOM
   */
  protected attachToDOM(): void {
    const container = this.options.container || document.body
    container.appendChild(this.element)
  }

  /**
   * 显示组件
   */
  public show(): void {
    if (this.visible) return
    
    this.beforeShow()
    this.element.style.display = ''
    this.visible = true
    this.afterShow()
    
    this.emit('show')
  }

  /**
   * 隐藏组件
   */
  public hide(): void {
    if (!this.visible) return
    
    this.beforeHide()
    this.element.style.display = 'none'
    this.visible = false
    this.afterHide()
    
    this.emit('hide')
    
    if (this.options.destroyOnHide) {
      this.destroy()
    }
  }

  /**
   * 切换显示状态
   */
  public toggle(): void {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 销毁组件
   */
  public destroy(): void {
    this.beforeDestroy()
    
    // 移除所有事件监听
    this.removeAllEvents()
    
    // 从DOM中移除元素
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    
    this.afterDestroy()
    this.emit('destroy')
  }

  /**
   * 设置位置
   */
  public setPosition(x: number, y: number): void {
    this.element.style.position = 'fixed'
    this.element.style.left = `${x}px`
    this.element.style.top = `${y}px`
  }

  /**
   * 获取位置
   */
  public getPosition(): Position {
    const rect = this.element.getBoundingClientRect()
    return {
      x: rect.left,
      y: rect.top
    }
  }

  /**
   * 设置大小
   */
  public setSize(width: number, height: number): void {
    this.element.style.width = `${width}px`
    this.element.style.height = `${height}px`
  }

  /**
   * 获取大小
   */
  public getSize(): Size {
    const rect = this.element.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height
    }
  }

  /**
   * 调整位置以保持在视口内
   */
  public keepInViewport(): void {
    const rect = this.element.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 10
    
    let { x, y } = this.getPosition()
    
    // 水平调整
    if (rect.right > viewportWidth - padding) {
      x = viewportWidth - rect.width - padding
    }
    if (x < padding) {
      x = padding
    }
    
    // 垂直调整
    if (rect.bottom > viewportHeight - padding) {
      y = viewportHeight - rect.height - padding
    }
    if (y < padding) {
      y = padding
    }
    
    this.setPosition(x, y)
  }

  /**
   * 绑定事件
   */
  protected bindEvent(
    element: Element | Document | Window,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    element.addEventListener(type, handler, options)
    this.boundEvents.push({ element, type, handler })
  }

  /**
   * 移除所有绑定的事件
   */
  protected removeAllEvents(): void {
    this.boundEvents.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler)
    })
    this.boundEvents = []
    this.eventListeners.clear()
  }

  /**
   * 事件发射
   */
  protected emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }

  /**
   * 事件监听
   */
  public on(event: string, handler: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(handler)
  }

  /**
   * 移除事件监听
   */
  public off(event: string, handler: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(handler)
    }
  }

  /**
   * 生命周期钩子 - 显示前
   */
  protected beforeShow(): void {
    // 子类可覆盖
  }

  /**
   * 生命周期钩子 - 显示后
   */
  protected afterShow(): void {
    // 子类可覆盖
  }

  /**
   * 生命周期钩子 - 隐藏前
   */
  protected beforeHide(): void {
    // 子类可覆盖
  }

  /**
   * 生命周期钩子 - 隐藏后
   */
  protected afterHide(): void {
    // 子类可覆盖
  }

  /**
   * 生命周期钩子 - 销毁前
   */
  protected beforeDestroy(): void {
    // 子类可覆盖
  }

  /**
   * 生命周期钩子 - 销毁后
   */
  protected afterDestroy(): void {
    // 子类可覆盖
  }

  /**
   * 获取DOM元素
   */
  public getElement(): HTMLElement {
    return this.element
  }

  /**
   * 是否可见
   */
  public isVisible(): boolean {
    return this.visible
  }

  /**
   * 添加CSS类
   */
  public addClass(className: string): void {
    this.element.classList.add(...className.split(' '))
  }

  /**
   * 移除CSS类
   */
  public removeClass(className: string): void {
    this.element.classList.remove(...className.split(' '))
  }

  /**
   * 切换CSS类
   */
  public toggleClass(className: string): void {
    this.element.classList.toggle(className)
  }

  /**
   * 设置样式
   */
  public setStyle(styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(this.element.style, styles)
  }

  /**
   * 设置属性
   */
  public setAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value)
  }

  /**
   * 获取属性
   */
  public getAttribute(name: string): string | null {
    return this.element.getAttribute(name)
  }

  /**
   * 移除属性
   */
  public removeAttribute(name: string): void {
    this.element.removeAttribute(name)
  }

  /**
   * 设置内容
   */
  public setContent(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      this.element.innerHTML = content
    } else {
      this.element.innerHTML = ''
      this.element.appendChild(content)
    }
  }

  /**
   * 追加内容
   */
  public appendContent(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      this.element.insertAdjacentHTML('beforeend', content)
    } else {
      this.element.appendChild(content)
    }
  }

  /**
   * 前置内容
   */
  public prependContent(content: string | HTMLElement): void {
    if (typeof content === 'string') {
      this.element.insertAdjacentHTML('afterbegin', content)
    } else {
      this.element.insertBefore(content, this.element.firstChild)
    }
  }

  /**
   * 聚焦
   */
  public focus(): void {
    this.element.focus()
  }

  /**
   * 失焦
   */
  public blur(): void {
    this.element.blur()
  }
}