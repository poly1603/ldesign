/**
 * @file 基础UI组件
 * @description 所有UI组件的基类，提供通用功能
 */

import { EventEmitter } from '@/core/event-emitter'
import type { CropperEventType, CropperEventListener } from '@/types'

/**
 * 组件状态
 */
export enum ComponentState {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
  DISABLED = 'disabled',
}

/**
 * 基础组件配置
 */
export interface BaseComponentOptions {
  /** 组件类名前缀 */
  classPrefix?: string
  /** 是否可见 */
  visible?: boolean
  /** 是否启用 */
  enabled?: boolean
  /** 自定义样式类 */
  className?: string
  /** 自定义样式 */
  style?: Partial<CSSStyleDeclaration>
  /** 是否自动销毁 */
  autoDestroy?: boolean
}

/**
 * 基础UI组件类
 * 提供所有UI组件的通用功能
 */
export abstract class BaseComponent extends EventEmitter {
  /** 组件根元素 */
  protected element: HTMLElement

  /** 组件配置 */
  protected options: Required<BaseComponentOptions>

  /** 组件状态 */
  protected state = ComponentState.IDLE

  /** 是否已销毁 */
  protected destroyed = false

  /** 默认配置 */
  protected static readonly DEFAULT_OPTIONS: Required<BaseComponentOptions> = {
    classPrefix: 'ldesign-cropper',
    visible: true,
    enabled: true,
    className: '',
    style: {},
    autoDestroy: true,
  }

  /**
   * 构造函数
   * @param tagName HTML标签名
   * @param options 组件配置
   */
  constructor(tagName = 'div', options: Partial<BaseComponentOptions> = {}) {
    super()

    this.options = { ...BaseComponent.DEFAULT_OPTIONS, ...options }
    this.element = this.createElement(tagName)
    // 不在这里调用initialize，让子类决定何时初始化
  }

  /**
   * 获取组件根元素
   */
  getElement(): HTMLElement {
    return this.element
  }

  /**
   * 获取组件状态
   */
  getState(): ComponentState {
    return this.state
  }

  /**
   * 设置组件状态
   * @param state 新状态
   */
  setState(state: ComponentState): void {
    if (this.state !== state) {
      const oldState = this.state
      this.state = state
      this.onStateChange(oldState, state)
      this.updateStateClass()
    }
  }

  /**
   * 显示组件
   */
  show(): void {
    this.options.visible = true
    this.element.style.display = ''
    this.element.classList.remove(`${this.options.classPrefix}--hidden`)
  }

  /**
   * 隐藏组件
   */
  hide(): void {
    this.options.visible = false
    this.element.style.display = 'none'
    this.element.classList.add(`${this.options.classPrefix}--hidden`)
  }

  /**
   * 切换显示状态
   */
  toggle(): void {
    if (this.options.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 启用组件
   */
  enable(): void {
    this.options.enabled = true
    this.element.classList.remove(`${this.options.classPrefix}--disabled`)
    this.updateEnabledState()
  }

  /**
   * 禁用组件
   */
  disable(): void {
    this.options.enabled = false
    this.element.classList.add(`${this.options.classPrefix}--disabled`)
    this.updateEnabledState()
  }

  /**
   * 是否可见
   */
  isVisible(): boolean {
    return this.options.visible
  }

  /**
   * 是否启用
   */
  isEnabled(): boolean {
    return this.options.enabled
  }

  /**
   * 是否已销毁
   */
  isDestroyed(): boolean {
    return this.destroyed
  }

  /**
   * 添加CSS类
   * @param className 类名
   */
  addClass(className: string): void {
    this.element.classList.add(className)
  }

  /**
   * 移除CSS类
   * @param className 类名
   */
  removeClass(className: string): void {
    this.element.classList.remove(className)
  }

  /**
   * 切换CSS类
   * @param className 类名
   * @param force 强制添加或移除
   */
  toggleClass(className: string, force?: boolean): void {
    this.element.classList.toggle(className, force)
  }

  /**
   * 设置样式
   * @param styles 样式对象
   */
  setStyle(styles: Partial<CSSStyleDeclaration>): void {
    Object.assign(this.element.style, styles)
  }

  /**
   * 设置属性
   * @param name 属性名
   * @param value 属性值
   */
  setAttribute(name: string, value: string): void {
    this.element.setAttribute(name, value)
  }

  /**
   * 获取属性
   * @param name 属性名
   */
  getAttribute(name: string): string | null {
    return this.element.getAttribute(name)
  }

  /**
   * 移除属性
   * @param name 属性名
   */
  removeAttribute(name: string): void {
    this.element.removeAttribute(name)
  }

  /**
   * 添加事件监听器
   * @param type 事件类型
   * @param listener 监听器
   * @param options 选项
   */
  addEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.element.addEventListener(type, listener, options)
  }

  /**
   * 移除事件监听器
   * @param type 事件类型
   * @param listener 监听器
   * @param options 选项
   */
  removeEventListener(
    type: string,
    listener: EventListener,
    options?: boolean | EventListenerOptions,
  ): void {
    this.element.removeEventListener(type, listener, options)
  }

  /**
   * 更新配置
   * @param options 新配置
   */
  updateOptions(options: Partial<BaseComponentOptions>): void {
    this.options = { ...this.options, ...options }
    this.applyOptions()
  }

  /**
   * 销毁组件
   */
  destroy(): void {
    if (this.destroyed) return

    this.beforeDestroy()

    // 移除DOM元素
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }

    // 清理事件监听器
    super.destroy()

    this.destroyed = true
    this.afterDestroy()
  }

  /**
   * 创建元素
   * @param tagName 标签名
   */
  protected createElement(tagName: string): HTMLElement {
    const element = document.createElement(tagName)
    element.className = this.getBaseClassName()
    return element
  }

  /**
   * 获取基础类名
   */
  protected getBaseClassName(): string {
    const baseClass = `${this.options.classPrefix}__${this.getComponentName()}`
    return this.options.className ? `${baseClass} ${this.options.className}` : baseClass
  }

  /**
   * 获取组件名称（子类需要实现）
   */
  protected abstract getComponentName(): string

  /**
   * 初始化组件
   */
  protected initialize(): void {
    this.applyOptions()
    this.setupEventListeners()
    this.render()
  }

  /**
   * 应用配置
   */
  protected applyOptions(): void {
    // 应用可见性
    if (!this.options.visible) {
      this.hide()
    }

    // 应用启用状态
    if (!this.options.enabled) {
      this.disable()
    }

    // 应用自定义样式
    if (this.options.style) {
      this.setStyle(this.options.style)
    }
  }

  /**
   * 设置事件监听器
   */
  protected setupEventListeners(): void {
    // 子类可以重写此方法
  }

  /**
   * 渲染组件
   */
  protected abstract render(): void

  /**
   * 状态变化回调
   * @param oldState 旧状态
   * @param newState 新状态
   */
  protected onStateChange(oldState: ComponentState, newState: ComponentState): void {
    // 子类可以重写此方法
  }

  /**
   * 更新状态类
   */
  protected updateStateClass(): void {
    // 移除所有状态类
    Object.values(ComponentState).forEach(state => {
      this.removeClass(`${this.options.classPrefix}--${state}`)
    })

    // 添加当前状态类
    this.addClass(`${this.options.classPrefix}--${this.state}`)
  }

  /**
   * 更新启用状态
   */
  protected updateEnabledState(): void {
    const inputs = this.element.querySelectorAll('input, button, select, textarea')
    inputs.forEach(input => {
      if (this.options.enabled) {
        input.removeAttribute('disabled')
      } else {
        input.setAttribute('disabled', 'disabled')
      }
    })
  }

  /**
   * 销毁前回调
   */
  protected beforeDestroy(): void {
    // 子类可以重写此方法
  }

  /**
   * 销毁后回调
   */
  protected afterDestroy(): void {
    // 子类可以重写此方法
  }
}
