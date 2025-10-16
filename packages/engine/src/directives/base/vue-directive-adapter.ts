/**
 * Vue指令适配器
 * 将引擎指令转换为Vue指令格式
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { DirectiveBase } from './directive-base'
import { getLogger } from '../../logger/logger'

const logger = getLogger('vue-directive-adapter')
export interface VueDirectiveBinding {
  value: unknown
  oldValue: unknown
  arg?: string
  modifiers: Record<string, boolean>
  instance: unknown
  dir: Directive
}

// 创建兼容的绑定对象
function createCompatibleBinding(
  binding: DirectiveBinding<unknown, string, string>
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
  method: unknown,
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
      logger.error(`Error in directive method ${methodName}:`, error)
    }
  }
}

/**
 * 安全调用生命周期方法
 */
function safeCallLifecycleMethod(
  method: unknown,
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
    created(el: HTMLElement, binding: DirectiveBinding<unknown, string, string>) {
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
        safeCallLifecycleMethod(directive.created, el, compatibleBinding, 'created')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeMount(
      el: HTMLElement,
      binding: DirectiveBinding<unknown, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeMount, el, compatibleBinding, 'lifecycle.beforeMount')
        safeCallLifecycleMethod(directive.beforeMount, el, compatibleBinding, 'beforeMount')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    mounted(el: HTMLElement, binding: DirectiveBinding<unknown, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.mounted, el, compatibleBinding, 'lifecycle.mounted')
        safeCallLifecycleMethod(directive.mounted, el, compatibleBinding, 'mounted')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeUpdate(
      el: HTMLElement,
      binding: DirectiveBinding<unknown, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeUpdate, el, compatibleBinding, 'lifecycle.beforeUpdate')
        safeCallLifecycleMethod(directive.beforeUpdate, el, compatibleBinding, 'beforeUpdate')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    updated(el: HTMLElement, binding: DirectiveBinding<unknown, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.updated, el, compatibleBinding, 'lifecycle.updated')
        safeCallLifecycleMethod(directive.updated, el, compatibleBinding, 'updated')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    beforeUnmount(
      el: HTMLElement,
      binding: DirectiveBinding<unknown, string, string>
    ) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.lifecycle.beforeUnmount, el, compatibleBinding, 'lifecycle.beforeUnmount')
        safeCallLifecycleMethod(directive.beforeUnmount, el, compatibleBinding, 'beforeUnmount')
      } catch (error) {
        directive.lifecycle.error?.(error as Error)
      }
    },

    unmounted(el: HTMLElement, binding: DirectiveBinding<unknown, string, string>) {
      try {
        const compatibleBinding = createCompatibleBinding(binding)
        safeCallLifecycleMethod(directive.unmounted, el, compatibleBinding, 'unmounted')

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
 * 指令工厂函数 - 支持两种使用方式
 * 1. defineDirective(directiveBase) - 传入 DirectiveBase 实例
 * 2. defineDirective(name, hooks) - 传入名称和钩子对象
 */
export function defineDirective(
  directiveOrName: DirectiveBase | string,
  hooks?: VueDirectiveHooks & {
    created?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeMount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    mounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeUpdate?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    updated?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    beforeUnmount?: (el: HTMLElement, binding: VueDirectiveBinding) => void
    unmounted?: (el: HTMLElement, binding: VueDirectiveBinding) => void
  }
): Directive {
  // 如果传入的是 DirectiveBase 实例，使用 createVueDirective
  if (typeof directiveOrName !== 'string') {
    return createVueDirective(directiveOrName)
  }

  // 否则使用钩子对象
  if (!hooks) {
    throw new Error('Hooks are required when name is provided')
  }

  return {
    created(el, binding) { hooks.created?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    beforeMount(el, binding) { hooks.beforeMount?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    mounted(el, binding) { hooks.mounted?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    beforeUpdate(el, binding) { hooks.beforeUpdate?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    updated(el, binding) { hooks.updated?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    beforeUnmount(el, binding) { hooks.beforeUnmount?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
    unmounted(el, binding) { hooks.unmounted?.(el as HTMLElement, createCompatibleBinding(binding as DirectiveBinding<unknown, string, string>)) },
  }
}

/**
 * 指令工具函数
 */
export const directiveUtils = {
  /**
   * 获取绑定值
   */
  getValue(binding: VueDirectiveBinding, defaultValue?: unknown): unknown {
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
  getOldValue(binding: VueDirectiveBinding): unknown {
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
  parseConfig(binding: VueDirectiveBinding): Record<string, unknown> {
    const value = binding.value

    if (typeof value === 'object' && value !== null) {
      return { ...(value as Record<string, unknown>) }
    }

    return { value }
  },

  /**
   * 创建事件处理器
   */
  createHandler(
    callback: EventListener,
    options?: {
      debounce?: number
      throttle?: number
      once?: boolean
    }
  ): EventListener {
    let handler: EventListener = callback

    if (options?.debounce) {
      handler = debounce(handler, options.debounce)
    } else if (options?.throttle) {
      handler = throttle(handler, options.throttle)
    }

    if (options?.once) {
      const originalHandler = handler
      handler = function (this: unknown, evt: Event) {
        originalHandler.call(this, evt)
        // 移除事件监听器的逻辑需要在调用处处理
      }
    }

    return handler
  },

  /**
   * 存储数据到元素
   */
  storeData(el: HTMLElement, key: string, value: unknown): void {
    if (!el._directiveData) {
      el._directiveData = new Map()
    }
    el._directiveData.set(key, value)
  },

  /**
   * 从元素获取数据
   */
  getData(el: HTMLElement, key: string): unknown {
    return el._directiveData?.get(key)
  },

  /**
   * 从元素删除数据
   */
  removeData(el: HTMLElement, key: string): void {
    el._directiveData?.delete(key)
  },

  /**
   * 清空元素数据
   */
  clearData(el: HTMLElement): void {
    el._directiveData?.clear()
  },
}

// 防抖函数
function debounce(func: EventListener, wait: number): EventListener {
  let timeout: number | undefined

  return function (this: unknown, evt: Event) {
    const later = () => {
      timeout = undefined
      func.call(this, evt)
    }

    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  } as EventListener
}

// 节流函数
function throttle(func: EventListener, wait: number): EventListener {
  let lastTime = 0

  return function (this: unknown, evt: Event) {
    const now = Date.now()

    if (now - lastTime >= wait) {
      lastTime = now
      func.call(this, evt)
    }
  } as EventListener
}

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _engineDirectives?: Map<string, DirectiveBase>
    _directiveData?: Map<string, unknown>
  }
}
