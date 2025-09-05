/**
 * 系统主题同步组合式API
 *
 * 提供与系统主题同步的功能
 */

import type { ComputedRef, Ref } from 'vue'
import type { ColorMode } from '../../core/types'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'

/**
 * 系统主题同步返回类型
 */
export interface UseSystemThemeSyncReturn {
  /** 系统主题模式 */
  systemTheme: Ref<ColorMode>
  /** 是否为系统暗色模式 */
  isSystemDark: ComputedRef<boolean>
  /** 是否为系统亮色模式 */
  isSystemLight: ComputedRef<boolean>
  /** 是否支持系统主题检测 */
  isSupported: ComputedRef<boolean>
  /** 是否正在同步 */
  isSyncing: Ref<boolean>
  /** 开始同步系统主题 */
  startSync: () => void
  /** 停止同步系统主题 */
  stopSync: () => void
  /** 切换同步状态 */
  toggleSync: () => void
  /** 手动同步一次 */
  syncOnce: () => Promise<void>
  /** 与系统主题同步 */
  syncWithSystem: () => Promise<void>
}

/**
 * 系统主题同步选项
 */
export interface UseSystemThemeSyncOptions {
  /** 是否自动开始同步 */
  autoStart?: boolean
  /** 同步时的回调 */
  onSync?: (systemTheme: ColorMode) => void | Promise<void>
  /** 同步错误回调 */
  onError?: (error: Error) => void
  /** 是否在页面可见性变化时重新检测 */
  syncOnVisibilityChange?: boolean
}

/**
 * 系统主题同步组合式API
 *
 * @param options 配置选项
 * @returns 系统主题同步API
 *
 * @example
 * ```vue
 * <script setup>
 * import { useSystemThemeSync } from '@ldesign/color/vue'
 *
 * const {
 *   systemTheme,
 *   isSystemDark,
 *   isSyncing,
 *   startSync,
 *   stopSync,
 *   syncWithSystem
 * } = useSystemThemeSync({
 *   autoStart: true,
 *   onSync: (theme) => console.log('系统主题变化:', theme)
 * })
 * </script>
 *
 * <template>
 *   <div>
 *     <p>系统主题: {{ systemTheme }}</p>
 *     <p>正在同步: {{ isSyncing }}</p>
 *     <button @click="syncWithSystem">立即同步</button>
 *   </div>
 * </template>
 * ```
 */
export function useSystemThemeSync(options: UseSystemThemeSyncOptions = {}): UseSystemThemeSyncReturn {
  const {
    autoStart = false,
    onSync,
    onError,
    syncOnVisibilityChange = true,
  } = options

  // 获取主题管理器
  const themeManager = inject<any>('themeManager', null)

  // 响应式状态
  const systemTheme = ref<ColorMode>('light')
  const isSyncing = ref<boolean>(false)

  // 媒体查询和监听器
  let mediaQuery: MediaQueryList | null = null
  let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null
  let visibilityChangeListener: (() => void) | null = null

  // 计算属性
  const isSystemDark = computed(() => systemTheme.value === 'dark')
  const isSystemLight = computed(() => systemTheme.value === 'light')
  const isSupported = computed(() => {
    return typeof window !== 'undefined'
      && window.matchMedia
      && typeof window.matchMedia === 'function'
  })

  // 方法
  const detectSystemTheme = (): ColorMode => {
    if (!isSupported.value) {
      return 'light'
    }

    try {
      const query = window.matchMedia('(prefers-color-scheme: dark)')
      return query.matches ? 'dark' : 'light'
    }
    catch (error) {
      if (onError) {
        onError(error as Error)
      }
      return 'light'
    }
  }

  const updateSystemTheme = async (): Promise<void> => {
    const newTheme = detectSystemTheme()
    const oldTheme = systemTheme.value

    if (newTheme !== oldTheme) {
      systemTheme.value = newTheme

      // 触发同步回调
      if (onSync) {
        try {
          await onSync(newTheme)
        }
        catch (error) {
          if (onError) {
            onError(error as Error)
          }
        }
      }
    }
  }

  const syncWithSystem = async (): Promise<void> => {
    if (!isSupported.value) {
      console.warn('[useSystemThemeSync] 当前环境不支持系统主题检测')
      return
    }

    try {
      const systemMode = detectSystemTheme()
      systemTheme.value = systemMode

      // 通知主题管理器
      if (themeManager && typeof themeManager.setMode === 'function') {
        await themeManager.setMode(systemMode)
      }

      // 触发同步回调
      if (onSync) {
        await onSync(systemMode)
      }
    }
    catch (error) {
      if (onError) {
        onError(error as Error)
      }
    }
  }

  const syncOnce = async (): Promise<void> => {
    await updateSystemTheme()
  }

  const startSync = (): void => {
    if (!isSupported.value || isSyncing.value) {
      return
    }

    try {
      // 设置媒体查询监听
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryListener = (e: MediaQueryListEvent) => {
        systemTheme.value = e.matches ? 'dark' : 'light'

        // 触发同步回调
        if (onSync) {
          const result = onSync(systemTheme.value)
          if (result && typeof result.catch === 'function') {
            result.catch((error: Error) => {
              if (onError) {
                onError(error)
              }
            })
          }
        }
      }

      mediaQuery.addEventListener('change', mediaQueryListener)

      // 设置页面可见性变化监听
      if (syncOnVisibilityChange && typeof document !== 'undefined') {
        visibilityChangeListener = () => {
          if (!document.hidden) {
            updateSystemTheme()
          }
        }
        document.addEventListener('visibilitychange', visibilityChangeListener)
      }

      // 初始检测
      updateSystemTheme()

      isSyncing.value = true
    }
    catch (error) {
      if (onError) {
        onError(error as Error)
      }
    }
  }

  const stopSync = (): void => {
    if (!isSyncing.value) {
      return
    }

    try {
      // 移除媒体查询监听
      if (mediaQuery && mediaQueryListener) {
        mediaQuery.removeEventListener('change', mediaQueryListener)
        mediaQuery = null
        mediaQueryListener = null
      }

      // 移除页面可见性变化监听
      if (visibilityChangeListener && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', visibilityChangeListener)
        visibilityChangeListener = null
      }

      isSyncing.value = false
    }
    catch (error) {
      if (onError) {
        onError(error as Error)
      }
    }
  }

  const toggleSync = (): void => {
    if (isSyncing.value) {
      stopSync()
    }
    else {
      startSync()
    }
  }

  // 生命周期
  onMounted(() => {
    // 初始检测系统主题
    systemTheme.value = detectSystemTheme()

    // 自动开始同步
    if (autoStart) {
      startSync()
    }
  })

  onUnmounted(() => {
    // 清理监听器
    stopSync()
  })

  return {
    systemTheme,
    isSystemDark,
    isSystemLight,
    isSupported,
    isSyncing,
    startSync,
    stopSync,
    toggleSync,
    syncOnce,
    syncWithSystem,
  }
}
