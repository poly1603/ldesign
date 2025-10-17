/**
 * 通用的插件状态管理组合式函数
 * 提供统一的状态共享机制
 */

import { inject, type InjectionKey, provide, ref, type Ref } from 'vue'

/**
 * 通用的插件状态钩子
 * 尝试注入共享状态，如果不存在则创建新的
 * 
 * @param key - 注入键，建议使用字符串以便跨应用共享
 * @param defaultValue - 默认值
 * @returns 响应式状态引用
 */
export function usePluginState<T>(
  key: string | InjectionKey<Ref<T>>,
  defaultValue: T
): Ref<T> {
  // 尝试注入已存在的共享状态
  const injected = inject<Ref<T> | undefined>(key)
  
  if (injected) {
    // 使用已存在的共享状态
    return injected
  }
  
  // 创建新的状态并提供给子组件
  const state = ref(defaultValue) as Ref<T>
  provide(key, state)
  
  return state
}

/**
 * 常用状态的便捷钩子
 */

/**
 * 使用共享的 locale 状态
 */
export function useLocale(defaultValue = 'zh-CN'): Ref<string> {
  return usePluginState('locale', defaultValue)
}

/**
 * 使用共享的主题状态
 */
export function useTheme(defaultValue = 'blue'): Ref<string> {
  return usePluginState('theme', defaultValue)
}

/**
 * 使用共享的尺寸状态
 */
export function useSize(defaultValue = 'medium'): Ref<string> {
  return usePluginState('size', defaultValue)
}

/**
 * 使用共享的暗黑模式状态
 */
export function useDark(defaultValue = false): Ref<boolean> {
  return usePluginState('dark', defaultValue)
}

/**
 * 创建自定义的共享状态钩子
 * 
 * @example
 * ```ts
 * // 创建自定义状态钩子
 * const useUserPreference = createSharedState('user-preference', {
 *   language: 'zh-CN',
 *   timezone: 'Asia/Shanghai'
 * })
 * 
 * // 在组件中使用
 * const preference = useUserPreference()
 * ```
 */
export function createSharedState<T>(key: string, defaultValue: T) {
  return () => usePluginState(key, defaultValue)
}

/**
 * 批量获取多个共享状态
 * 
 * @example
 * ```ts
 * const { locale, theme, size } = usePluginStates({
 *   locale: 'zh-CN',
 *   theme: 'blue',
 *   size: 'medium'
 * })
 * ```
 */
export function usePluginStates<T extends Record<string, any>>(
  states: T
): { [K in keyof T]: Ref<T[K]> } {
  const result = {} as { [K in keyof T]: Ref<T[K]> }
  
  for (const key in states) {
    result[key] = usePluginState(key, states[key])
  }
  
  return result
}