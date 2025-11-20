/**
 * Vue Composables 实现示例
 * 
 * 这个文件展示如何实现 useEngineState 来替代 useGlobalState
 * 
 * 位置: packages/engine/packages/vue3/src/composables/useEngineState.ts
 */

import { ref, shallowRef, onUnmounted, computed, inject } from 'vue'
import type { Ref, ComputedRef, InjectionKey } from 'vue'
import type { CoreEngine } from '@ldesign/engine-core'

/**
 * Engine 注入键
 */
export const ENGINE_KEY: InjectionKey<CoreEngine> = Symbol('engine')

/**
 * 获取 Engine 实例
 * 
 * @throws 如果未找到 engine 实例
 */
export function useEngine(): CoreEngine {
  const engine = inject(ENGINE_KEY)
  
  if (!engine) {
    throw new Error(
      '[useEngine] Engine instance not found. ' +
      'Make sure you have called app.provide(ENGINE_KEY, engine) in your app setup.'
    )
  }
  
  return engine
}

/**
 * 使用 Engine 状态
 * 
 * 自动订阅状态变化，组件卸载时自动取消订阅
 * 
 * @param key - 状态键
 * @param shallow - 是否使用浅层响应式（默认 true，性能更好）
 * @returns 响应式状态引用
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useEngineState } from '@ldesign/engine-vue3'
 * import type { I18nLocaleState } from '@ldesign/engine-plugins/i18n-bridge'
 * 
 * const locale = useEngineState<I18nLocaleState>('i18n.locale')
 * 
 * // locale.value 会自动更新
 * </script>
 * 
 * <template>
 *   <div>当前语言: {{ locale?.locale }}</div>
 * </template>
 * ```
 */
export function useEngineState<T = any>(
  key: string,
  shallow = true
): Ref<T | undefined> {
  const engine = useEngine()
  
  // 使用 shallowRef 或 ref
  const state = shallow
    ? shallowRef<T | undefined>(engine.state.get(key))
    : ref<T | undefined>(engine.state.get(key))
  
  // 监听状态变化
  const unwatch = engine.state.watch(key, (newValue) => {
    state.value = newValue
  })
  
  // 组件卸载时取消监听
  onUnmounted(() => {
    unwatch()
  })
  
  return state
}

/**
 * 使用 Engine 状态（带发布功能）
 * 
 * 返回状态引用和发布函数
 * 
 * @param key - 状态键
 * @param shallow - 是否使用浅层响应式（默认 true）
 * @returns [state, publish] 元组
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useEngineStateWithPublish } from '@ldesign/engine-vue3'
 * 
 * const [locale, setLocale] = useEngineStateWithPublish<I18nLocaleState>('i18n.locale')
 * 
 * function changeLocale(newLocale: string) {
 *   setLocale({
 *     locale: newLocale,
 *     oldLocale: locale.value?.locale || null,
 *     timestamp: Date.now()
 *   })
 * }
 * </script>
 * 
 * <template>
 *   <div>
 *     <div>当前语言: {{ locale?.locale }}</div>
 *     <button @click="changeLocale('en-US')">切换到英文</button>
 *   </div>
 * </template>
 * ```
 */
export function useEngineStateWithPublish<T = any>(
  key: string,
  shallow = true
): [Ref<T | undefined>, (value: T) => void] {
  const engine = useEngine()
  const state = useEngineState<T>(key, shallow)
  
  const publish = (value: T) => {
    engine.state.set(key, value)
  }
  
  return [state, publish]
}

/**
 * 使用 Engine 状态（计算属性版本）
 * 
 * 返回计算属性，可以直接在模板中使用
 * 
 * @param key - 状态键
 * @returns 计算属性
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useEngineStateComputed } from '@ldesign/engine-vue3'
 * 
 * const locale = useEngineStateComputed<I18nLocaleState>('i18n.locale')
 * </script>
 * 
 * <template>
 *   <div>当前语言: {{ locale?.locale }}</div>
 * </template>
 * ```
 */
export function useEngineStateComputed<T = any>(
  key: string
): ComputedRef<T | undefined> {
  const state = useEngineState<T>(key, true)
  return computed(() => state.value)
}

/**
 * 使用 Engine 事件
 * 
 * 自动订阅事件，组件卸载时自动取消订阅
 * 
 * @param event - 事件名称
 * @param handler - 事件处理器
 * 
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useEngineEvent } from '@ldesign/engine-vue3'
 * import type { I18nLocaleState } from '@ldesign/engine-plugins/i18n-bridge'
 * 
 * useEngineEvent<I18nLocaleState>('i18n:localeChanged', (state) => {
 *   console.log('语言已切换:', state.locale)
 * })
 * </script>
 * ```
 */
export function useEngineEvent<T = any>(
  event: string,
  handler: (payload: T) => void
): void {
  const engine = useEngine()
  
  const unsubscribe = engine.events.on(event, handler)
  
  onUnmounted(() => {
    unsubscribe()
  })
}

/**
 * 使用 Engine 事件（一次性）
 * 
 * 事件触发一次后自动取消订阅
 * 
 * @param event - 事件名称
 * @param handler - 事件处理器
 */
export function useEngineEventOnce<T = any>(
  event: string,
  handler: (payload: T) => void
): void {
  const engine = useEngine()
  
  const unsubscribe = engine.events.once(event, handler)
  
  onUnmounted(() => {
    unsubscribe()
  })
}

