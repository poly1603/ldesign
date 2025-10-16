/**
 * 指令基础类
 * 提供指令的基础功能和通用方法
 */

import type {
  DirectiveConfig,
  DirectiveLifecycle,
  EngineDirective,
} from '../../types'

export interface DirectiveOptions {
  name: string
  description?: string
  version?: string
  author?: string
  category?: string
  tags?: string[]
  dependencies?: string[]
  config?: Partial<DirectiveConfig>
}

export abstract class DirectiveBase implements EngineDirective {
  public readonly name: string
  public readonly description?: string
  public readonly version: string
  public readonly author?: string
  public readonly category?: string
  public readonly tags?: string[]
  public readonly dependencies?: string[]
  public readonly config: DirectiveConfig
  public readonly lifecycle: DirectiveLifecycle
  public readonly metadata: Record<string, unknown>

  constructor(options: DirectiveOptions) {
    this.name = options.name
    this.description = options.description
    this.version = options.version || '1.0.0'
    this.author = options.author
    this.category = options.category || 'utility'
    this.tags = options.tags || []
    this.dependencies = options.dependencies || []
    this.metadata = {}

    // 默认配置
    this.config = {
      enabled: true,
      priority: 0,
      scope: 'global',
      autoRegister: true,
      hotReload: false,
      validation: true,
      logging: false,
      ...options.config,
    }

    // 生命周期钩子
    this.lifecycle = {
      beforeCreate: this.beforeCreate.bind(this),
      created: this.created.bind(this),
      beforeMount: this.beforeMount.bind(this),
      mounted: this.mounted.bind(this),
      beforeUpdate: this.beforeUpdate.bind(this),
      updated: this.updated.bind(this),
      beforeUnmount: this.beforeUnmount.bind(this),
      unmounted: this.unmounted.bind(this),
      error: this.error.bind(this),
    }
  }

  // 生命周期钩子方法（子类可重写）
  beforeCreate(): void {
    // 指令创建前
  }

  created(_el?: HTMLElement, _binding?: unknown): void {
    // 指令创建后
  }

  beforeMount(_el?: HTMLElement, _binding?: unknown): void {
    // 指令挂载前
  }

  mounted(_el?: HTMLElement, _binding?: unknown): void {
    // 指令挂载后
  }

  beforeUpdate(_el?: HTMLElement, _binding?: unknown): void {
    // 指令更新前
  }

  updated(_el?: HTMLElement, _binding?: unknown): void {
    // 指令更新后
  }

  beforeUnmount(_el?: HTMLElement, _binding?: unknown): void {
    // 指令卸载前
  }

  unmounted(_el?: HTMLElement): void {
    // 指令卸载后
  }

  error(error: Error): void {
    // 错误处理
    console.error(`Directive ${this.name} error:`, error)
  }

  // 工具方法
  protected log(_message: string, ..._args: unknown[]): void {
    // 移除日志功能以减少包体积
  }

  protected warn(_message: string, ..._args: unknown[]): void {
    // 移除日志功能以减少包体积
  }

  protected error_log(_message: string, ..._args: unknown[]): void {
    // 移除日志功能以减少包体积
  }

  // 验证方法
  protected validateElement(el: HTMLElement): boolean {
    return el instanceof HTMLElement
  }

  protected validateBinding(binding: unknown): boolean {
    return binding !== null && binding !== undefined
  }

  // 事件处理工具
  protected addEventListener(
    el: HTMLElement,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    el.addEventListener(event, handler, options)

    // 存储事件处理器以便清理
    if (!el._directiveHandlers) {
      el._directiveHandlers = new Map()
    }

    const key = `${this.name}_${event}`
    if (el._directiveHandlers.has(key)) {
      const handler = el._directiveHandlers.get(key)
      if (handler) {
        el.removeEventListener(event, handler)
      }
    }

    el._directiveHandlers.set(key, handler)
  }

  protected removeEventListener(el: HTMLElement, event: string): void {
    if (el._directiveHandlers) {
      const key = `${this.name}_${event}`
      const handler = el._directiveHandlers.get(key)
      if (handler) {
        el.removeEventListener(event, handler)
        el._directiveHandlers.delete(key)
      }
    }
  }

  protected removeAllEventListeners(el: HTMLElement): void {
    if (el._directiveHandlers) {
      for (const [key, handler] of el._directiveHandlers.entries()) {
        if (key.startsWith(`${this.name}_`)) {
          const event = key.replace(`${this.name}_`, '')
          el.removeEventListener(event, handler)
          el._directiveHandlers.delete(key)
        }
      }
    }
  }

  // 样式工具
  protected addClass(el: HTMLElement, className: string): void {
    el.classList.add(className)
  }

  protected removeClass(el: HTMLElement, className: string): void {
    el.classList.remove(className)
  }

  protected toggleClass(el: HTMLElement, className: string): void {
    el.classList.toggle(className)
  }

  protected hasClass(el: HTMLElement, className: string): boolean {
    return el.classList.contains(className)
  }

  // 属性工具
  protected setAttribute(el: HTMLElement, name: string, value: string): void {
    el.setAttribute(name, value)
  }

  protected removeAttribute(el: HTMLElement, name: string): void {
    el.removeAttribute(name)
  }

  protected getAttribute(el: HTMLElement, name: string): string | null {
    return el.getAttribute(name)
  }

  protected hasAttribute(el: HTMLElement, name: string): boolean {
    return el.hasAttribute(name)
  }
}

// 扩展HTMLElement类型以支持指令处理器存储
declare global {
  interface HTMLElement {
    _directiveHandlers?: Map<string, EventListener>
  }
}
