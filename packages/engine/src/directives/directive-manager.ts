import type { DirectiveManager, DirectiveValidationResult, EngineDirective, Logger, VueDirectiveBinding } from '../types'
import { createHybridDirectiveAdapter } from './utils/directive-compatibility'

export class DirectiveManagerImpl implements DirectiveManager {
  private directives = new Map<string, EngineDirective>()
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
    // logger参数保留用于未来扩展
  }

  register(name: string, directive: unknown): void {
    if (this.directives.has(name)) {
      this.logger?.warn(
        `Directive "${name}" is already registered. It will be replaced.`
      )
    }

    // 使用兼容性工具转换指令
    const engineDirective = createHybridDirectiveAdapter(directive)
    this.directives.set(name, engineDirective)
    this.logger?.debug(`Directive "${name}" registered`)
  }

  unregister(name: string): void {
    this.directives.delete(name)
  }

  get(name: string): EngineDirective | undefined {
    return this.directives.get(name)
  }

  getAll(): EngineDirective[] {
    return Array.from(this.directives.values())
  }

  // 检查指令是否存在
  has(name: string): boolean {
    return this.directives.has(name)
  }

  // 获取所有指令名称
  getNames(): string[] {
    return Array.from(this.directives.keys())
  }

  // 获取指令数量
  size(): number {
    return this.directives.size
  }

  // 清空所有指令
  clear(): void {
    this.directives.clear()
  }

  // 销毁指令管理器，清理资源
  destroy(): void {
    this.clear()
    this.logger = undefined
  }

  // 批量注册指令
  registerBatch(directives: Record<string, unknown>): void {
    for (const [name, directive] of Object.entries(directives)) {
      this.register(name, directive)
    }
  }

  // 批量卸载指令
  unregisterBatch(names: string[]): void {
    for (const name of names) {
      this.unregister(name)
    }
  }

  // 按分类获取指令
  getByCategory(category: string): EngineDirective[] {
    return Array.from(this.directives.values()).filter(
      directive => directive.category === category
    )
  }

  // 按标签获取指令
  getByTag(tag: string): EngineDirective[] {
    return Array.from(this.directives.values()).filter(directive =>
      directive.tags?.includes(tag)
    )
  }

  // 启用指令
  enable(name: string): void {
    const directive = this.directives.get(name)
    if (directive) {
      // 指令启用逻辑
      this.logger?.debug(`Directive "${name}" enabled`)
    }
  }

  // 禁用指令
  disable(name: string): void {
    const directive = this.directives.get(name)
    if (directive) {
      // 指令禁用逻辑
      this.logger?.debug(`Directive "${name}" disabled`)
    }
  }

  // 重新加载指令
  reload(name: string): void {
    const directive = this.directives.get(name)
    if (directive) {
      // 指令重新加载逻辑
      this.logger?.debug(`Directive "${name}" reloaded`)
    }
  }

  // 验证指令
  validate(_directive: EngineDirective | unknown): DirectiveValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    }
  }
}

export function createDirectiveManager(logger?: Logger): DirectiveManager {
  return new DirectiveManagerImpl(logger)
}

// 预定义的常用指令
export const commonDirectives = {
  // 点击外部区域指令
  clickOutside: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      type ClickEl = HTMLElement & { _clickOutsideHandler?: (event: Event) => void }
      const elWith = el as ClickEl
      elWith._clickOutsideHandler = (event: Event) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          const handler = binding.value as ((e: Event) => void) | undefined
          if (typeof handler === 'function') handler(event)
        }
      }
      document.addEventListener('click', elWith._clickOutsideHandler as (e: Event) => void)
    },
    unmounted(el: HTMLElement) {
      type ClickEl = HTMLElement & { _clickOutsideHandler?: (event: Event) => void }
      const elWith = el as ClickEl
      if (elWith._clickOutsideHandler) {
        document.removeEventListener('click', elWith._clickOutsideHandler)
        delete elWith._clickOutsideHandler
      }
    },
  } as unknown,

  // 复制到剪贴板指令
  copy: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      interface CopyBindingValue { text?: string; target?: string; callback?: (payload: unknown) => void }
      type CopyEl = HTMLElement & { _copyHandler?: () => void }
      const elWith = el as CopyEl
      elWith._copyHandler = async () => {
        try {
          const val = binding.value as CopyBindingValue | string | undefined
          const text = typeof val === 'string' ? val : val?.text ?? el.textContent ?? ''
          await navigator.clipboard.writeText(text)

          const cb = (typeof val === 'object' && val && typeof val.callback === 'function') ? val.callback : undefined
          if (binding.arg === 'success' && cb) {
            cb(text)
          }

          // 添加成功样式
          el.classList.add('copy-success')
          setTimeout(() => {
            el.classList.remove('copy-success')
          }, 1000)
        } catch (error) {
          console.error('Failed to copy text:', error)

          const val = binding.value as { callback?: (e: unknown) => void } | undefined
          const cb = val && typeof val.callback === 'function' ? val.callback : undefined
          if (binding.arg === 'error' && cb) {
            cb(error)
          }
        }
      }

      el.addEventListener('click', elWith._copyHandler as () => void)
      el.style.cursor = 'pointer'
    },
    unmounted(el: HTMLElement) {
      type CopyEl = HTMLElement & { _copyHandler?: () => void }
      const elWith = el as CopyEl
      if (elWith._copyHandler) {
        el.removeEventListener('click', elWith._copyHandler)
        delete elWith._copyHandler
      }
    },
  } as unknown,

  // 懒加载指令
  lazy: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      interface LazyBindingValue { options?: Record<string, unknown>; callback?: (el: HTMLElement) => void }
      const val = binding.value as LazyBindingValue | ((el: HTMLElement) => void) | undefined
      const options = {
        threshold: 0.1,
        rootMargin: '50px',
        ...(typeof val === 'object' && val ? (val.options ?? {}) : {}),
      }

      type LazyEl = HTMLElement & { _lazyObserver?: IntersectionObserver }
      const elWith = el as LazyEl
      elWith._lazyObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 执行懒加载回调
            if (typeof val === 'function') {
              val(el)
            } else if (typeof val?.callback === 'function') {
              val.callback(el)
            }

            // 停止观察
            el._lazyObserver?.unobserve(el)
          }
        })
      }, options)

      elWith._lazyObserver.observe(el)
    },
    unmounted(el: HTMLElement) {
      if (el._lazyObserver) {
        el._lazyObserver.disconnect()
        delete el._lazyObserver
      }
    },
  } as unknown,

  // 防抖指令
  debounce: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      interface DebounceValue { delay?: number; callback?: (...args: unknown[]) => void; event?: string }
      const val = binding.value as DebounceValue | ((...args: unknown[]) => void) | undefined
      const delay = (typeof val === 'object' && val ? val.delay : undefined) ?? 300
      const event = binding.arg || (typeof val === 'object' && val ? val.event : undefined) || 'click'

      el._debounceHandler = (...args: unknown[]) => {
        clearTimeout(el._debounceTimer)
        el._debounceTimer = window.setTimeout(() => {
          if (typeof val === 'function') {
            val(...args)
          } else if (typeof val?.callback === 'function') {
            val.callback(...args)
          }
        }, delay)
      }

      el.addEventListener(event, el._debounceHandler)
    },
    updated(el: HTMLElement, binding: VueDirectiveBinding) {
      interface DebounceValue { delay?: number }
      const val = binding.value as DebounceValue | undefined
      const delay = (val?.delay ?? 300)
      el._debounceDelay = delay
    },
    unmounted(el: HTMLElement) {
      if (el._debounceTimer) {
        clearTimeout(el._debounceTimer)
      }
      if (el._debounceHandler) {
        const event = 'click' // 默认事件，实际应该从绑定中获取
        el.removeEventListener(event, el._debounceHandler)
        delete el._debounceHandler
      }
    },
  } as unknown,

  // 节流指令
  throttle: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      interface ThrottleValue { delay?: number; callback?: (...args: unknown[]) => void; event?: string }
      const val = binding.value as ThrottleValue | ((...args: unknown[]) => void) | undefined
      const delay = (typeof val === 'object' && val ? val.delay : undefined) ?? 300
      const event = binding.arg || (typeof val === 'object' && val ? val.event : undefined) || 'click'
      let lastTime = 0

      el._throttleHandler = (...args: unknown[]) => {
        const now = Date.now()
        if (now - lastTime >= delay) {
          lastTime = now
          if (typeof val === 'function') {
            val(...args)
          } else if (typeof val?.callback === 'function') {
            val.callback(...args)
          }
        }
      }

      el.addEventListener(event, el._throttleHandler)
    },
    unmounted(el: HTMLElement) {
      if (el._throttleHandler) {
        const event = 'click' // 默认事件，实际应该从绑定中获取
        el.removeEventListener(event, el._throttleHandler)
        delete el._throttleHandler
      }
    },
  } as unknown,

  // 权限控制指令
  permission: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      const val = binding.value as string | string[] | undefined
      const permissions = Array.isArray(val) ? val : [val].filter((v): v is string => typeof v === 'string')
      const hasPermission = permissions.some((permission: string) => {
        // 这里应该调用实际的权限检查逻辑
        return checkPermission(permission)
      })

      if (!hasPermission) {
        if (binding.modifiers.hide) {
          el.style.display = 'none'
        } else if (binding.modifiers.disable) {
          el.setAttribute('disabled', 'true')
          el.style.opacity = '0.5'
          el.style.pointerEvents = 'none'
        } else {
          el.remove()
        }
      }
    },
  } as unknown,

  // 焦点指令
  focus: {
    mounted(el: HTMLElement, binding: VueDirectiveBinding) {
      if (binding.value !== false) {
        el.focus()
      }
    },
    updated(el: HTMLElement, binding: VueDirectiveBinding) {
      if (binding.value && !binding.oldValue) {
        el.focus()
      }
    },
  } as unknown,
}

// 权限检查函数（示例实现）
function checkPermission(_permission: string): boolean {
  // 这里应该实现实际的权限检查逻辑
  // 例如从用户状态或权限服务中检查
  return true // 示例：总是返回true
}

// 扩展HTMLElement类型以支持自定义属性
declare global {
  interface HTMLElement {
    _clickOutsideHandler?: (event: Event) => void
    _copyHandler?: () => void
    _lazyObserver?: IntersectionObserver
    _debounceHandler?: EventListener
    _debounceTimer?: number
    _debounceDelay?: number
    _throttleHandler?: EventListener
  }
}
