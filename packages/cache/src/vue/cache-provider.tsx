import type { CacheOptions } from '../types'
import {
  defineComponent,
  inject,
  type InjectionKey,
  onUnmounted,
  type PropType,
  provide,
} from 'vue'
import { CacheManager } from '../core/cache-manager'

// 注入键
export const CACHE_MANAGER_KEY: InjectionKey<CacheManager>
  = Symbol('cache-manager')

/**
 * 缓存提供者组件属性
 */
export interface CacheProviderProps {
  options?: CacheOptions
}

/**
 * 缓存提供者组件
 */
export const CacheProvider = defineComponent({
  name: 'CacheProvider',
  props: {
    options: {
      type: Object as PropType<CacheOptions>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    // 创建缓存管理器实例
    const cacheManager = new CacheManager(props.options)

    // 提供缓存管理器
    provide(CACHE_MANAGER_KEY, cacheManager)

    // 组件卸载时销毁缓存管理器，防止资源泄漏
    onUnmounted(() => {
      cacheManager.destroy().catch(err => console.error('Failed to destroy CacheManager on unmount:', err))
    })

    return () => slots.default?.()
  },
})

/**
 * 注入缓存管理器
 */
export function useCacheManager(): CacheManager {
  const cacheManager = inject(CACHE_MANAGER_KEY)

  if (!cacheManager) {
    throw new Error(
      'CacheManager not found. Make sure to wrap your component with CacheProvider.',
    )
  }

  return cacheManager
}

/**
 * 缓存管理器提供者 Hook
 */
export function provideCacheManager(options?: CacheOptions): CacheManager {
  const cacheManager = new CacheManager(options)
  provide(CACHE_MANAGER_KEY, cacheManager)
  return cacheManager
}
