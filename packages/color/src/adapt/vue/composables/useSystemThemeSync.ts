/**
 * 系统主题同步组合式 API
 */

import type { ColorMode, ThemeManagerInstance } from '../../../core/types'
import type { UseSystemThemeSyncReturn } from '../types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from './useTheme'

/**
 * 系统主题同步组合式 API
 * @param manager 可选的主题管理器实例
 * @returns 系统主题同步相关的响应式状态和方法
 */
export function useSystemThemeSync(
  manager?: ThemeManagerInstance
): UseSystemThemeSyncReturn {
  const { setMode } = useTheme(manager)
  const systemTheme = ref<ColorMode>('light')

  // 检查是否支持系统主题检测
  const isSupported = computed(() => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      typeof window.matchMedia === 'function'
    )
  })

  const isSystemDark = computed(() => systemTheme.value === 'dark')
  const isSystemLight = computed(() => systemTheme.value === 'light')

  let mediaQuery: MediaQueryList | null = null
  let cleanup: (() => void) | null = null

  onMounted(() => {
    if (!isSupported.value) return

    try {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const updateSystemTheme = (e?: MediaQueryListEvent) => {
        const matches = e ? e.matches : mediaQuery!.matches
        systemTheme.value = matches ? 'dark' : 'light'
      }

      // 初始化系统主题
      updateSystemTheme()

      // 监听系统主题变化
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateSystemTheme)
        cleanup = () =>
          mediaQuery!.removeEventListener('change', updateSystemTheme)
      } else {
        // 兼容旧版本浏览器
        mediaQuery.addListener(updateSystemTheme)
        cleanup = () => mediaQuery!.removeListener(updateSystemTheme)
      }
    } catch (error) {
      console.warn('Failed to setup system theme detection:', error)
    }
  })

  onUnmounted(() => {
    if (cleanup) {
      cleanup()
    }
  })

  const syncWithSystem = async () => {
    if (isSupported.value) {
      await setMode(systemTheme.value)
    }
  }

  return {
    systemTheme,
    syncWithSystem,
    isSystemDark,
    isSystemLight,
    isSupported,
  }
}
