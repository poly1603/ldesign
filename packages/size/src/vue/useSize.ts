import type { SizeScheme } from '../core/SizeManager'
import { computed, inject, onBeforeUnmount, readonly, ref, shallowRef } from 'vue'
import { SIZE_MANAGER_KEY } from './plugin'

// 缓存默认预设，避免重复创建
const DEFAULT_PRESETS = Object.freeze([
  Object.freeze({ name: 'small', baseSize: 12, label: 'Small' }),
  Object.freeze({ name: 'medium', baseSize: 14, label: 'Medium' }),
  Object.freeze({ name: 'large', baseSize: 16, label: 'Large' })
])

// 使用 WeakMap 缓存 manager 实例
const managerCache = new WeakMap<any, ReturnType<typeof createSizeApi>>();

function createSizeApi(actualManager: any) {
  // 使用 shallowRef 减少响应式开销
  const config = shallowRef<SizeScheme>(actualManager?.getConfig?.() || { baseSize: 14 } as SizeScheme)
  const currentPreset = ref<string>(actualManager?.getCurrentPreset?.() || 'medium')

  let unsubscribe: () => void = () => { }

  try {
    const subscribe = actualManager?.subscribe
    if (subscribe && typeof subscribe === 'function') {
      unsubscribe = subscribe((newConfig: SizeScheme) => {
        config.value = newConfig
        currentPreset.value = actualManager?.getCurrentPreset?.() || 'medium'
      })
    }
  } catch {
    // 静默处理，不影响组件功能
  }

  // 使用 computed 优化性能
  const presets = computed(() => {
    try {
      if (actualManager?.getPresets) return actualManager.getPresets()
    } catch (error) {
      console.warn('getPresets failed:', error)
    }
    return DEFAULT_PRESETS
  })

  return {
    config: readonly(config),
    currentPreset: readonly(currentPreset),
    presets,
    setBaseSize: (baseSize: number) => {
      try {
        if (actualManager?.setBaseSize) actualManager.setBaseSize(baseSize)
      } catch (error) {
        console.warn('setBaseSize failed:', error)
      }
    },
    applyPreset: (presetName: string) => {
      try {
        if (actualManager?.applyPreset) {
          actualManager.applyPreset(presetName)
          // 立即更新 currentPreset，不等待异步通知
          currentPreset.value = presetName
        } else {
          console.warn('[useSize] applyPreset 方法不存在')
        }
      } catch (error) {
        console.warn('[useSize] applyPreset failed:', error)
      }
    },
    cleanup: unsubscribe
  }
}

export function useSize() {
  let manager = inject(SIZE_MANAGER_KEY) as any

  if (!manager) {
    // 尝试从全局获取 manager（开发环境调试用）
    // Development mode check disabled
    if (false) {
      const app = (window as any).__APP__
      const globalManager = app?.config?.globalProperties?.$sizeManager

      if (globalManager) {
        console.info('[useSize] 使用全局 $sizeManager（inject 失败，回退到全局）')
        // 包装成与 inject 相同的结构
        manager = { manager: globalManager }
      } else {
        console.warn('[useSize] Manager 未注入，且全局 $sizeManager 也不存在，使用默认值')
      }
    }

    if (!manager) {
      // 返回默认值（带有警告函数）
      const defaultConfig = shallowRef<SizeScheme>({ baseSize: 14 } as SizeScheme)
      const defaultPreset = ref<string>('medium')

      return {
        config: readonly(defaultConfig),
        currentPreset: readonly(defaultPreset),
        presets: computed(() => DEFAULT_PRESETS),
        setBaseSize: () => {
          console.warn('[useSize] setBaseSize called but manager not available')
        },
        applyPreset: (name: string) => {
          console.warn('[useSize] applyPreset called but manager not available:', name)
          // 即使没有 manager，也更新本地状态以保持 UI 一致
          defaultPreset.value = name
        },
        cleanup: () => { }
      }
    }
  }

  const actualManager = manager.manager || manager

  // 检查缓存
  let api = managerCache.get(actualManager)
  if (!api) {
    api = createSizeApi(actualManager)
    managerCache.set(actualManager, api)
  }

  // 清理函数
  onBeforeUnmount(() => {
    api!.cleanup()
  })

  return api
}

