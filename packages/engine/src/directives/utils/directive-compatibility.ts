/**
 * 指令兼容性工具
 * 处理 Vue 指令和引擎指令之间的类型转换和兼容性检查
 */

import type { ObjectDirective } from 'vue'
import type {
  DirectiveAdapterFactory,
  DirectiveCompatibilityChecker,
  DirectiveType,
  EngineDirective,
  VueDirectiveBinding,
} from '../../types/directive'
// import { getLogger } from '../../logger/logger' // 已移除日志

// const logger = getLogger('directive-compatibility') // 已移除日志

/**
 * 检查指令类型
 */
export function checkDirectiveType(directive: unknown): DirectiveType {
  if (!directive) return 'engine'

  // 检查是否是 Vue 指令
  const obj = (typeof directive === 'object' && directive !== null) ? (directive as Record<string, unknown>) : undefined
  const hasVueHooks = ['created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeUnmount', 'unmounted']
    .some(hook => !!obj && typeof obj[hook] === 'function' && (obj[hook] as (...args: unknown[]) => void).length >= 2)

  // 检查是否是引擎指令
  const hasEngineHooks = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeUnmount', 'unmounted']
    .some(hook => !!obj && typeof obj[hook] === 'function' && (obj[hook] as (...args: unknown[]) => void).length === 0)

  if (hasVueHooks && hasEngineHooks) return 'hybrid'
  if (hasVueHooks) return 'vue'
  return 'engine'
}

/**
 * 检查是否是 Vue 指令
 */
export function isVueDirective(directive: unknown): boolean {
  return checkDirectiveType(directive) === 'vue'
}

/**
 * 检查是否是引擎指令
 */
export function isEngineDirective(directive: unknown): boolean {
  return checkDirectiveType(directive) === 'engine'
}

/**
 * 检查是否是混合指令
 */
export function isHybridDirective(directive: unknown): boolean {
  return checkDirectiveType(directive) === 'hybrid'
}

/**
 * 将 Vue 指令转换为引擎指令
 */
export function convertVueToEngineDirective(vueDirective: unknown): EngineDirective {
  const engineDirective: EngineDirective = {
    name: 'converted-vue-directive',
    description: 'Converted from Vue directive',
    version: '1.0.0',
  }

  // 转换生命周期方法 - 检查是否是对象指令
  if (typeof vueDirective === 'object' && vueDirective !== null) {
    const d = vueDirective as Record<string, unknown>
    if (typeof d.created === 'function') {
      engineDirective.created = d.created as unknown as EngineDirective['created']
    }
    if (typeof d.beforeMount === 'function') {
      engineDirective.beforeMount = d.beforeMount as unknown as EngineDirective['beforeMount']
    }
    if (typeof d.mounted === 'function') {
      engineDirective.mounted = d.mounted as unknown as EngineDirective['mounted']
    }
    if (typeof d.beforeUpdate === 'function') {
      engineDirective.beforeUpdate = d.beforeUpdate as unknown as EngineDirective['beforeUpdate']
    }
    if (typeof d.updated === 'function') {
      engineDirective.updated = d.updated as unknown as EngineDirective['updated']
    }
    if (typeof d.beforeUnmount === 'function') {
      engineDirective.beforeUnmount = d.beforeUnmount as unknown as EngineDirective['beforeUnmount']
    }
    if (typeof d.unmounted === 'function') {
      engineDirective.unmounted = d.unmounted as unknown as EngineDirective['unmounted']
    }
  } else if (typeof vueDirective === 'function') {
    // 如果是函数指令，转换为 mounted 钩子（保持 Vue 风格签名）
    engineDirective.mounted = (el: HTMLElement, binding: VueDirectiveBinding) => {
      ; (vueDirective as (el: HTMLElement, binding: VueDirectiveBinding) => void)(el, binding)
    }
  }

  return engineDirective
}

/**
 * 将引擎指令转换为 Vue 指令
 */
export function convertEngineToVueDirective(engineDirective: EngineDirective): ObjectDirective {
  const vueDirective: ObjectDirective = {} as ObjectDirective

  // 转换生命周期方法
  if (engineDirective.created) {
    if (typeof engineDirective.created === 'function') {
      // 如果是引擎风格的方法（无参数），包装为 Vue 风格
      if (engineDirective.created.length === 0) {
        vueDirective.created = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.created as () => void)()
        }
      } else {
        // 如果已经是 Vue 风格的方法，直接使用
        vueDirective.created = engineDirective.created as unknown as ObjectDirective['created']
      }
    }
  }

  if (engineDirective.beforeMount) {
    if (typeof engineDirective.beforeMount === 'function') {
      if (engineDirective.beforeMount.length === 0) {
        vueDirective.beforeMount = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.beforeMount as () => void)()
        }
      } else {
        vueDirective.beforeMount = engineDirective.beforeMount as unknown as ObjectDirective['beforeMount']
      }
    }
  }

  if (engineDirective.mounted) {
    if (typeof engineDirective.mounted === 'function') {
      if (engineDirective.mounted.length === 0) {
        vueDirective.mounted = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.mounted as () => void)()
        }
      } else {
        vueDirective.mounted = engineDirective.mounted as unknown as ObjectDirective['mounted']
      }
    }
  }

  if (engineDirective.beforeUpdate) {
    if (typeof engineDirective.beforeUpdate === 'function') {
      if (engineDirective.beforeUpdate.length === 0) {
        vueDirective.beforeUpdate = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.beforeUpdate as () => void)()
        }
      } else {
        vueDirective.beforeUpdate = engineDirective.beforeUpdate as unknown as ObjectDirective['beforeUpdate']
      }
    }
  }

  if (engineDirective.updated) {
    if (typeof engineDirective.updated === 'function') {
      if (engineDirective.updated.length === 0) {
        vueDirective.updated = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.updated as () => void)()
        }
      } else {
        vueDirective.updated = engineDirective.updated as unknown as ObjectDirective['updated']
      }
    }
  }

  if (engineDirective.beforeUnmount) {
    if (typeof engineDirective.beforeUnmount === 'function') {
      if (engineDirective.beforeUnmount.length === 0) {
        vueDirective.beforeUnmount = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.beforeUnmount as () => void)()
        }
      } else {
        vueDirective.beforeUnmount = engineDirective.beforeUnmount as unknown as ObjectDirective['beforeUnmount']
      }
    }
  }

  if (engineDirective.unmounted) {
    if (typeof engineDirective.unmounted === 'function') {
      if (engineDirective.unmounted.length === 0) {
        vueDirective.unmounted = (_el: HTMLElement, _binding: unknown) => {
          ; (engineDirective.unmounted as () => void)()
        }
      } else {
        vueDirective.unmounted = engineDirective.unmounted as unknown as ObjectDirective['unmounted']
      }
    }
  }

  return vueDirective
}

/**
 * 创建混合指令适配器
 */
export function createHybridDirectiveAdapter(directive: unknown): EngineDirective {
  const type = checkDirectiveType(directive)

  switch (type) {
    case 'vue':
      return convertVueToEngineDirective(directive)
    case 'engine':
      return directive as EngineDirective
    case 'hybrid':
      return directive as EngineDirective
    default:
      return directive as EngineDirective
  }
}

/**
 * 指令兼容性检查器实现
 */
export const directiveCompatibilityChecker: DirectiveCompatibilityChecker = {
  checkType: checkDirectiveType,
  isVueDirective,
  isEngineDirective,
  isHybridDirective,
  convertToEngineDirective: convertVueToEngineDirective,
  convertToVueDirective: convertEngineToVueDirective,
}

/**
 * 指令适配器工厂实现
 */
export const directiveAdapterFactory: DirectiveAdapterFactory = {
  createVueAdapter: convertEngineToVueDirective,
  createEngineAdapter: convertVueToEngineDirective,
  createHybridAdapter: createHybridDirectiveAdapter,
}

/**
 * 安全的指令调用包装器
 */
export function safeDirectiveCall<T extends unknown[]>(
  fn: ((...args: T) => void) | undefined,
  args: T,
  context?: string
): void {
  if (typeof fn === 'function') {
    try {
      fn(...args)
    } catch (error) {
      console.error(`Error in directive ${context || 'unknown'}:`, error)
    }
  }
}

/**
 * 指令方法签名检查器
 */
export function getMethodSignature(fn: unknown): 'vue' | 'engine' | 'unknown' {
  if (typeof fn !== 'function') return 'unknown'

  // Vue 指令方法通常有 2 个参数 (el, binding)
  if (fn.length >= 2) return 'vue'

  // 引擎指令方法通常没有参数
  if (fn.length === 0) return 'engine'

  return 'unknown'
}
