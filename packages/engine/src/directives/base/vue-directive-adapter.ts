/**
 * Vue指令适配器
 * 将引擎指令转换为Vue指令格式
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { DirectiveBase } from './directive-base'

export interface VueDirectiveBinding {
  value: any
  oldValue: any
  arg?: string
  modifiers: Record<string, boolean>
  instance: any
  dir: Directive
}

// 创建兼容的绑定对象
function createCompatibleBinding(
  binding: DirectiveBinding<any, string, string>
): VueDirectiveBinding {
  return {
    value: binding.value,
    oldValue: binding.oldValue,
    arg: binding.arg,
    modifiers: binding.modifiers as Record<string, boolean>,
    instance: binding.instance,
    dir: binding.dir,
  }
}

/**
 * 安全调用指令方法，支持两种签名
 */
function safeCallDirectiveMethod(
  method: any,
  el: HTMLElement,
  binding: VueDirectiveBinding,
  methodName: string
): void {
  if (typeof method === 'function') {
    try {
      if (method.length === 0) {
        // 引擎风格：无参数
        method()
      } else {
        // Vue 风格：有参数
        method(el, binding)
      }
    } catch (error) {
      console.error(`Error in directive method ${methodName}:`, error)
    }
  }
}

/**
 * 安全调用生命周期方法
 */
function safeCallLifecycleMethod(
  method: any,
  el: HTMLElement,
  binding: VueDirectiveBinding,
  methodName: string
): void {
  if (method) {
    safeCallDirectiveMethod(method, el, binding, methodName)
  }
}

export interface VueDirectiveHooks {
  created?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  beforeMount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  mounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  beforeUpdate?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  updated?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  beforeUnmount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  unmounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
}

/**
 * 将引擎指令转换为Vue指令
 */
export function createVueDirective(directive: DirectiveBase): Directive {
  return {
    created(el: HTMLElement, binding: DirectiveBinding<any, string, string>) {
      try {
        directive.lifecycle.beforeCreate?.()

        // 创建兼容的绑定对象
        const compatibleBinding = createCompatibleBinding(binding)

        // 存储指令实例到元素上
        if (!el._engineDirectives) {
          el._engineDirectives = new Map()
        }
        el._engineDirectives.set(directive.name, directive)

        // 调用生命周期方法
        safeCallLifecycleMethod(directive.lifecycle.created, el, compatibleBinding, 'lifecycle.created')
        safeCallLifecycleMethod((directive as any).created, el, compatibleBinding, 'created')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeMount(
      el: HTMLElement,
      binding: DirectiveBinding<any, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeMount, el, compatibleBinding, 'lifecycle.beforeMount')
        safeCallLifecycleMethod((directive as any).beforeMount, el, compatibleBinding, 'beforeMount')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    mounted(el: HTMLElement, binding: DirectiveBinding<any, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.mounted, el, compatibleBinding, 'lifecycle.mounted')
        safeCallLifecycleMethod((directive as any).mounted, el, compatibleBinding, 'mounted')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeUpdate(
      el: HTMLElement,
      binding: DirectiveBinding<any, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeUpdate, el, compatibleBinding, 'lifecycle.beforeUpdate')
        safeCallLifecycleMethod((directive as any).beforeUpdate, el, compatibleBinding, 'beforeUpdate')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    updated(el: HTMLElement, binding: DirectiveBinding<any, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.updated, el, compatibleBinding, 'lifecycle.updated')
        safeCallLifecycleMethod((directive as any).updated, el, compatibleBinding, 'updated')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeUnmount(
      el: HTMLElement,
      binding: DirectiveBinding<any, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeUnmount, el, compatibleBinding, 'lifecycle.beforeUnmount')
        safeCallLifecycleMethod((directive as any).beforeUnmount, el, compatibleBinding, 'beforeUnmount')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    unmounted(el: HTMLElement, binding: DirectiveBinding<any, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod((directive as any).unmounted, el, compatibleBinding, 'unmounted')

        // 清理指令实例
        if (el._engineDirectives) {
          el._engineDirectives.delete(directive.name)
        }

        safeCallLifecycleMethod(directive.lifecycle.unmounted, el, compatibleBinding, 'lifecycle.unmounted')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },
  }
}

/**
 * 指令工厂函数
 */
export function defineDirective(
  _name: string,
  hooks: VueDirectiveHooks & {
    created?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeMount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    mounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeUpdate?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    updated?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeUnmount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    unmounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  }
): Directive {
  return {
    created: hooks.created as any,
    beforeMount: hooks.beforeMount as any,
    mounted: hooks.mounted as any,
    beforeUpdate: hooks.beforeUpdate as any,
    updated: hooks.updated as any,
    beforeUnmount: hooks.beforeUnmount as any,
    unmounted: hooks.unmounted as any,
  }
}

/**
 * 指令工具函数
 */
export const directiveUtils = {
  /**
   * 获取绑定值
   */
  getValue(binding: VueDirectiveBinding, defaultValue?: any): any {
    return binding.value !== undefined ? binding.value : defaultValue
  },

  /**
   * 获取修饰符
   */
  getModifiers(binding: VueDirectiveBinding): Record<string, boolean> {
    return binding.modifiers || {}
  },

  /**
   * 检查修饰符
   */
  hasModifier(binding: VueDirectiveBinding, modifier: string): boolean {
    return Boolean(binding.modifiers?.[modifier])
  },

  /**
   * 获取参数
   */
  getArg(binding: VueDirectiveBinding): string | undefined {
    return binding.arg
  },

  /**
   * 获取旧值
   */
  getOldValue(binding: VueDirectiveBinding): any {
    return binding.oldValue
  },

  /**
   * 检查值是否改变
   */
  isValueChanged(binding: VueDirectiveBinding): boolean {
    return binding.value !== binding.oldValue
  },

  /**
   * 解析配置对象
   */
  parseConfig(binding: VueDirectiveBinding): Record<string, any> {
    const value = binding.value

    if (typeof value === 'object' && value !== null) {
      return value
    }

    return { value }
  },

  /**
   * 创建事件处理器
   */
  createHandler(
    callback: (...args: any[]) => void,
    options?: {
      debounce?: number
      throttle?: number
      once?: boolean
    }
  ): EventListener {
    let handler = callback as EventListener

    if (options?.debounce) {
      handler = debounce(handler, options.debounce)
    } else if (options?.throttle) {
      handler = throttle(handler, options.throttle)
    }

    if (options?.once) {
      const originalHandler = handler
      handler = function (this: any, ...args: any[]) {
        if (args.length > 0) {
          originalHandler.apply(this, [args[0]] as [Event])
        }
        // 移除事件监听器的逻辑需要在调用处处理
      }
    }

    return handler
  },
}

// 防抖函数
function debounce(func: (...args: any[]) => void, wait: number): EventListener {
  let timeout: number | undefined

  return function (this: any, ...args: any[]) {
    const later = () => {
      timeout = undefined
      func.apply(this, args)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  } as EventListener
}

// 节流函数
function throttle(func: (...args: any[]) => void, wait: number): EventListener {
  let lastTime = 0

  return function (this: any, ...args: any[]) {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  } as EventListener
}

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _engineDirectives?: Map<string, DirectiveBase>
  }
}
