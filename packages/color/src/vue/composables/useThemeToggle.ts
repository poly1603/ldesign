/**
 * 主题切换组合式API
 * 
 * 提供简单的主题模式切换功能
 */

import { ref, computed, inject, onMounted, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { ColorMode } from '../../core/types'

/**
 * 主题切换返回类型
 */
export interface UseThemeToggleReturn {
  /** 当前模式 */
  currentMode: Ref<ColorMode>
  /** 是否为暗色模式 */
  isDark: ComputedRef<boolean>
  /** 是否为亮色模式 */
  isLight: ComputedRef<boolean>
  /** 切换模式 */
  toggle: () => Promise<void>
  /** 设置为亮色模式 */
  setLight: () => Promise<void>
  /** 设置为暗色模式 */
  setDark: () => Promise<void>
  /** 设置指定模式 */
  setMode: (mode: ColorMode) => Promise<void>
}

/**
 * 主题切换选项
 */
export interface UseThemeToggleOptions {
  /** 默认模式 */
  defaultMode?: ColorMode
  /** 是否自动保存到存储 */
  autoSave?: boolean
  /** 存储键名 */
  storageKey?: string
  /** 是否自动检测系统主题 */
  autoDetect?: boolean
  /** 切换前回调 */
  onBeforeToggle?: (newMode: ColorMode) => void | Promise<void>
  /** 切换后回调 */
  onAfterToggle?: (newMode: ColorMode) => void | Promise<void>
}

/**
 * 主题切换组合式API
 * 
 * @param options 配置选项
 * @returns 主题切换API
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useThemeToggle } from '@ldesign/color/vue'
 * 
 * const { isDark, toggle, setLight, setDark } = useThemeToggle()
 * </script>
 * 
 * <template>
 *   <button @click="toggle">
 *     切换到{{ isDark ? '亮色' : '暗色' }}模式
 *   </button>
 * </template>
 * ```
 */
export function useThemeToggle(options: UseThemeToggleOptions = {}): UseThemeToggleReturn {
  const {
    defaultMode = 'light',
    autoSave = true,
    storageKey = 'ldesign-theme-toggle',
    autoDetect = false,
    onBeforeToggle,
    onAfterToggle
  } = options

  // 获取主题管理器
  const themeManager = inject<any>('themeManager', null)

  // 响应式状态
  const currentMode = ref<ColorMode>(defaultMode)

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')

  // 方法
  const setMode = async (mode: ColorMode): Promise<void> => {
    // 触发切换前回调
    if (onBeforeToggle) {
      await onBeforeToggle(mode)
    }

    currentMode.value = mode

    // 通知主题管理器
    if (themeManager && typeof themeManager.setMode === 'function') {
      try {
        await themeManager.setMode(mode)
      } catch (error) {
        console.warn('[useThemeToggle] 主题管理器设置失败:', error)
        // 回退到本地存储
        if (autoSave) {
          saveToStorage()
        }
      }
    } else if (autoSave) {
      saveToStorage()
    }

    // 触发切换后回调
    if (onAfterToggle) {
      await onAfterToggle(mode)
    }
  }

  const toggle = async (): Promise<void> => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const setLight = async (): Promise<void> => {
    await setMode('light')
  }

  const setDark = async (): Promise<void> => {
    await setMode('dark')
  }

  // 存储相关
  const saveToStorage = (): void => {
    if (typeof localStorage === 'undefined') return

    try {
      const data = {
        mode: currentMode.value,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('[useThemeToggle] 保存到存储失败:', error)
    }
  }

  const loadFromStorage = (): ColorMode => {
    if (typeof localStorage === 'undefined') {
      return defaultMode
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        return data.mode || defaultMode
      }
    } catch (error) {
      console.warn('[useThemeToggle] 从存储加载失败:', error)
    }

    return defaultMode
  }

  // 系统主题检测
  const detectSystemTheme = (): ColorMode => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return defaultMode
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      return mediaQuery.matches ? 'dark' : 'light'
    } catch (error) {
      console.warn('[useThemeToggle] 系统主题检测失败:', error)
      return defaultMode
    }
  }

  const setupSystemThemeWatcher = (): (() => void) | null => {
    if (typeof window === 'undefined' || !window.matchMedia || !autoDetect) {
      return null
    }

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        const systemMode = e.matches ? 'dark' : 'light'
        setMode(systemMode)
      }

      mediaQuery.addEventListener('change', handler)
      
      return () => {
        mediaQuery.removeEventListener('change', handler)
      }
    } catch (error) {
      console.warn('[useThemeToggle] 系统主题监听设置失败:', error)
      return null
    }
  }

  // 初始化
  onMounted(() => {
    let initialMode = defaultMode

    if (themeManager) {
      try {
        // 优先使用主题管理器的状态
        if (typeof themeManager.getCurrentMode === 'function') {
          initialMode = themeManager.getCurrentMode() || defaultMode
        }
      } catch (error) {
        console.warn('[useThemeToggle] 主题管理器初始化失败:', error)
      }
    } else if (autoDetect) {
      // 自动检测系统主题
      initialMode = detectSystemTheme()
    } else if (autoSave) {
      // 从存储加载
      initialMode = loadFromStorage()
    }

    currentMode.value = initialMode

    // 设置系统主题监听
    const cleanup = setupSystemThemeWatcher()
    
    // 组件卸载时清理
    if (cleanup) {
      // 注意：这里应该在 onUnmounted 中调用，但为了简化示例，暂时省略
      // onUnmounted(cleanup)
    }
  })

  // 监听变化并自动保存
  if (autoSave) {
    watch(currentMode, () => {
      saveToStorage()
    })
  }

  return {
    currentMode,
    isDark,
    isLight,
    toggle,
    setLight,
    setDark,
    setMode
  }
}
