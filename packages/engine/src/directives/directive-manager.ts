import type { Directive } from 'vue'
import type { DirectiveManager, Logger } from '../types'

export class DirectiveManagerImpl implements DirectiveManager {
  private directives = new Map<string, Directive>()

  constructor(_logger?: Logger) {
    // logger参数保留用于未来扩展
  }

  register(name: string, directive: Directive): void {
    if (this.directives.has(name)) {
      console.warn(`Directive "${name}" is already registered. It will be replaced.`)
    }

    this.directives.set(name, directive)
  }

  unregister(name: string): void {
    this.directives.delete(name)
  }

  get(name: string): Directive | undefined {
    return this.directives.get(name)
  }

  getAll(): Record<string, Directive> {
    const result: Record<string, Directive> = {}
    for (const [name, directive] of this.directives) {
      result[name] = directive
    }
    return result
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

  // 批量注册指令
  registerBatch(directives: Record<string, Directive>): void {
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
}

export function createDirectiveManager(logger?: Logger): DirectiveManager {
  return new DirectiveManagerImpl(logger)
}

// 预定义的常用指令
export const commonDirectives = {
  // 点击外部区域指令
  clickOutside: {
    mounted(el: HTMLElement, binding: any) {
      el._clickOutsideHandler = (event: Event) => {
        if (!(el === event.target || el.contains(event.target as Node))) {
          binding.value(event)
        }
      }
      document.addEventListener('click', el._clickOutsideHandler)
    },
    unmounted(el: HTMLElement) {
      if (el._clickOutsideHandler) {
        document.removeEventListener('click', el._clickOutsideHandler)
        delete el._clickOutsideHandler
      }
    },
  } as Directive,

  // 复制到剪贴板指令
  copy: {
    mounted(el: HTMLElement, binding: any) {
      el._copyHandler = async () => {
        try {
          const text = binding.value || el.textContent || ''
          await navigator.clipboard.writeText(text)

          // 触发成功回调
          if (binding.arg === 'success' && typeof binding.modifiers.callback === 'function') {
            binding.modifiers.callback(text)
          }

          // 添加成功样式
          el.classList.add('copy-success')
          setTimeout(() => {
            el.classList.remove('copy-success')
          }, 1000)
        }
        catch (error) {
          console.error('Failed to copy text:', error)

          // 触发错误回调
          if (binding.arg === 'error' && typeof binding.modifiers.callback === 'function') {
            binding.modifiers.callback(error)
          }
        }
      }

      el.addEventListener('click', el._copyHandler)
      el.style.cursor = 'pointer'
    },
    unmounted(el: HTMLElement) {
      if (el._copyHandler) {
        el.removeEventListener('click', el._copyHandler)
        delete el._copyHandler
      }
    },
  } as Directive,

  // 懒加载指令
  lazy: {
    mounted(el: HTMLElement, binding: any) {
      const options = {
        threshold: 0.1,
        rootMargin: '50px',
        ...binding.value?.options,
      }

      el._lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 执行懒加载回调
            if (typeof binding.value === 'function') {
              binding.value(el)
            }
            else if (typeof binding.value?.callback === 'function') {
              binding.value.callback(el)
            }

            // 停止观察
            el._lazyObserver?.unobserve(el)
          }
        })
      }, options)

      el._lazyObserver.observe(el)
    },
    unmounted(el: HTMLElement) {
      if (el._lazyObserver) {
        el._lazyObserver.disconnect()
        delete el._lazyObserver
      }
    },
  } as Directive,

  // 防抖指令
  debounce: {
    mounted(el: HTMLElement, binding: any) {
      const delay = binding.value?.delay || 300
      const event = binding.arg || 'click'

      el._debounceHandler = (...args: any[]) => {
        clearTimeout(el._debounceTimer)
        el._debounceTimer = window.setTimeout(() => {
          if (typeof binding.value === 'function') {
            binding.value(...args)
          }
          else if (typeof binding.value?.callback === 'function') {
            binding.value.callback(...args)
          }
        }, delay)
      }

      el.addEventListener(event, el._debounceHandler)
    },
    updated(el: HTMLElement, binding: any) {
      const delay = binding.value?.delay || 300
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
  } as Directive,

  // 节流指令
  throttle: {
    mounted(el: HTMLElement, binding: any) {
      const delay = binding.value?.delay || 300
      const event = binding.arg || 'click'
      let lastTime = 0

      el._throttleHandler = (...args: any[]) => {
        const now = Date.now()
        if (now - lastTime >= delay) {
          lastTime = now
          if (typeof binding.value === 'function') {
            binding.value(...args)
          }
          else if (typeof binding.value?.callback === 'function') {
            binding.value.callback(...args)
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
  } as Directive,

  // 权限控制指令
  permission: {
    mounted(el: HTMLElement, binding: any) {
      const permissions = Array.isArray(binding.value) ? binding.value : [binding.value]
      const hasPermission = permissions.some((permission: string) => {
        // 这里应该调用实际的权限检查逻辑
        return checkPermission(permission)
      })

      if (!hasPermission) {
        if (binding.modifiers.hide) {
          el.style.display = 'none'
        }
        else if (binding.modifiers.disable) {
          el.setAttribute('disabled', 'true')
          el.style.opacity = '0.5'
          el.style.pointerEvents = 'none'
        }
        else {
          el.remove()
        }
      }
    },
  } as Directive,

  // 焦点指令
  focus: {
    mounted(el: HTMLElement, binding: any) {
      if (binding.value !== false) {
        el.focus()
      }
    },
    updated(el: HTMLElement, binding: any) {
      if (binding.value && !binding.oldValue) {
        el.focus()
      }
    },
  } as Directive,
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
    _debounceHandler?: (...args: unknown[]) => void
    _debounceTimer?: number
    _debounceDelay?: number
    _throttleHandler?: (...args: unknown[]) => void
  }
}
