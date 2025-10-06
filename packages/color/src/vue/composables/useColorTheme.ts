/**
 * 统一的颜色主题管理组合式API
 *
 * 这是一个高级的组合式API，整合了主题选择、模式切换、系统同步等功能
 * 提供最简单易用的API接口
 */

import type { ComputedRef, Ref } from 'vue'
import type { ColorMode, ThemeConfig } from '../../core/types'
import { computed, inject, onMounted, ref, watch } from 'vue'

/**
 * useColorTheme 配置选项
 */
export interface UseColorThemeOptions {
  /** 默认主题 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: ColorMode
  /** 是否自动保存到本地存储 */
  autoSave?: boolean
  /** 存储键名 */
  storageKey?: string
  /** 是否启用系统主题同步 */
  enableSystemSync?: boolean
  /** 自定义主题配置 */
  customThemes?: ThemeConfig[]
  /** 禁用的内置主题 */
  disabledBuiltinThemes?: string[]
  /** 主题变更回调 */
  onThemeChange?: (theme: string, mode: ColorMode) => void
  /** 错误处理回调 */
  onError?: (error: Error) => void
}

/**
 * useColorTheme 返回类型
 */
export interface UseColorThemeReturn {
  // 状态
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 当前模式 */
  currentMode: Ref<ColorMode>
  /** 是否为暗色模式 */
  isDark: ComputedRef<boolean>
  /** 是否为亮色模式 */
  isLight: ComputedRef<boolean>
  /** 可用主题列表 */
  availableThemes: ComputedRef<ThemeConfig[]>
  /** 系统主题模式（如果启用系统同步） */
  systemTheme: Ref<ColorMode | null>
  /** 是否正在同步系统主题 */
  isSyncingSystem: Ref<boolean>

  // 方法
  /** 设置主题 */
  setTheme: (theme: string) => Promise<void>
  /** 设置模式 */
  setMode: (mode: ColorMode) => Promise<void>
  /** 切换模式 */
  toggleMode: () => Promise<void>
  /** 与系统主题同步 */
  syncWithSystem: () => Promise<void>
  /** 开始系统主题同步 */
  startSystemSync: () => void
  /** 停止系统主题同步 */
  stopSystemSync: () => void
  /** 获取主题配置 */
  getThemeConfig: (themeName: string) => ThemeConfig | undefined
  /** 获取主题显示名称 */
  getThemeDisplayName: (themeName: string) => string
  /** 重置到默认设置 */
  reset: () => Promise<void>
}

/**
 * 统一的颜色主题管理组合式API
 *
 * 整合了主题选择、模式切换、系统同步等功能，提供最简单易用的API
 *
 * @param options 配置选项
 * @returns 主题管理API
 *
 * @example
 * ```vue
 * <script setup>
 * import { useColorTheme } from '@ldesign/color/vue'
 *
 * const {
 *   currentTheme,
 *   currentMode,
 *   isDark,
 *   availableThemes,
 *   setTheme,
 *   toggleMode,
 *   syncWithSystem
 * } = useColorTheme({
 *   enableSystemSync: true,
 *   autoSave: true
 * })
 * </script>
 * ```
 */
export function useColorTheme(options: UseColorThemeOptions = {}): UseColorThemeReturn {
  const {
    defaultTheme = 'default',
    defaultMode = 'light',
    autoSave = true,
    storageKey = 'ldesign-color-theme',
    enableSystemSync = false,
    customThemes = [],
    disabledBuiltinThemes = [],
    onThemeChange,
    onError,
  } = options

  // 获取主题管理器
  // 优先从 Vue 的 provide/inject 获取，如果失败则尝试从 window 对象获取
  let themeManager = inject<any>('themeManager', null)

  // 如果 inject 失败，尝试从 window 对象获取（备用方案）
  if (!themeManager && typeof window !== 'undefined') {
    themeManager = (window as any).themeManager || null
    if (import.meta.env.DEV && themeManager) {
      console.warn('[useColorTheme] themeManager 从 window 对象获取（inject 失败）')
    }
  }

  // 响应式状态
  const currentTheme = ref<string>(defaultTheme)
  const currentMode = ref<ColorMode>(defaultMode)
  const systemTheme = ref<ColorMode | null>(null)
  const isSyncingSystem = ref(false)

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')

  const availableThemes = computed<ThemeConfig[]>(() => {
    let themes: ThemeConfig[] = []

    // 获取内置主题
    if (themeManager && typeof themeManager.getAvailableThemes === 'function') {
      try {
        const builtinThemes = themeManager.getAvailableThemes()
        if (Array.isArray(builtinThemes)) {
          themes = builtinThemes.filter(
            (theme: ThemeConfig) => !disabledBuiltinThemes.includes(theme.name),
          )
        }
      }
      catch (error) {
        if (import.meta.env.DEV) {
          console.warn('[useColorTheme] 获取内置主题失败:', error)
        }
      }
    }

    // 添加自定义主题
    themes.push(...customThemes)

    return themes
  })

  // 系统主题检测
  let systemThemeWatcher: (() => void) | null = null

  const detectSystemTheme = (): ColorMode => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  // 存储管理
  const saveToStorage = () => {
    if (!autoSave || typeof localStorage === 'undefined')
      return

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          theme: currentTheme.value,
          mode: currentMode.value,
        }),
      )
    }
    catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[useColorTheme] 保存到存储失败:', error)
      }
    }
  }

  const loadFromStorage = (): { theme: string, mode: ColorMode } => {
    if (!autoSave || typeof localStorage === 'undefined') {
      return { theme: defaultTheme, mode: defaultMode }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        return {
          theme: data.theme || defaultTheme,
          mode: data.mode || defaultMode,
        }
      }
    }
    catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[useColorTheme] 从存储加载失败:', error)
      }
    }

    return { theme: defaultTheme, mode: defaultMode }
  }

  // 方法实现
  const setTheme = async (theme: string): Promise<void> => {
    try {
      // 🔥 关键修复: 从 themeManager 获取最新模式，避免使用过时的状态
      let latestMode = currentMode.value
      if (themeManager && typeof themeManager.getCurrentMode === 'function') {
        try {
          const mode = themeManager.getCurrentMode()
          if (mode) {
            latestMode = mode
            // 同步本地状态
            currentMode.value = mode
          }
        }
        catch (error) {
          if (import.meta.env.DEV) {
            console.warn('[useColorTheme] 获取当前模式失败:', error)
          }
        }
      }

      if (themeManager && typeof themeManager.setTheme === 'function') {
        await themeManager.setTheme(theme, latestMode)
      }

      currentTheme.value = theme
      onThemeChange?.(theme, latestMode)

      if (autoSave) {
        saveToStorage()
      }
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      if (import.meta.env.DEV) {
        console.error('[useColorTheme] 设置主题失败:', err)
      }
      onError?.(err)
    }
  }

  const setMode = async (mode: ColorMode): Promise<void> => {
    try {
      if (themeManager && typeof themeManager.setMode === 'function') {
        await themeManager.setMode(mode)
      }
      else if (themeManager && typeof themeManager.setTheme === 'function') {
        await themeManager.setTheme(currentTheme.value, mode)
      }

      currentMode.value = mode
      onThemeChange?.(currentTheme.value, mode)

      if (autoSave) {
        saveToStorage()
      }
    }
    catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      if (import.meta.env.DEV) {
        console.error('[useColorTheme] 设置模式失败:', err)
      }
      onError?.(err)
    }
  }

  const toggleMode = async (): Promise<void> => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const syncWithSystem = async (): Promise<void> => {
    const detectedTheme = detectSystemTheme()
    systemTheme.value = detectedTheme
    await setMode(detectedTheme)
  }

  const startSystemSync = (): void => {
    if (!enableSystemSync || typeof window === 'undefined' || !window.matchMedia) {
      return
    }

    isSyncingSystem.value = true

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      syncWithSystem()
    }

    mediaQuery.addEventListener('change', handleChange)
    systemThemeWatcher = () => {
      mediaQuery.removeEventListener('change', handleChange)
      isSyncingSystem.value = false
    }

    // 立即同步一次
    syncWithSystem()
  }

  const stopSystemSync = (): void => {
    if (systemThemeWatcher) {
      systemThemeWatcher()
      systemThemeWatcher = null
    }
  }

  const getThemeConfig = (themeName: string): ThemeConfig | undefined => {
    return availableThemes.value.find(theme => theme.name === themeName)
  }

  const getThemeDisplayName = (themeName: string): string => {
    const theme = getThemeConfig(themeName)
    return theme?.displayName || theme?.name || themeName
  }

  const reset = async (): Promise<void> => {
    await setTheme(defaultTheme)
    await setMode(defaultMode)
  }

  // 初始化
  onMounted(() => {
    // 从存储加载设置
    const { theme, mode } = loadFromStorage()
    currentTheme.value = theme
    currentMode.value = mode

    // 应用初始主题
    if (themeManager) {
      setTheme(theme).then(() => setMode(mode))

      // 🔥 新增: 监听主题管理器的模式变化事件
      if (typeof themeManager.on === 'function') {
        const handleThemeChanged = (event: any) => {
          if (event.mode && event.mode !== currentMode.value) {
            currentMode.value = event.mode
            if (import.meta.env.DEV) {
              console.log(`🔄 [useColorTheme] 模式已同步: ${event.mode}`)
            }
          }
          if (event.theme && event.theme !== currentTheme.value) {
            currentTheme.value = event.theme
            if (import.meta.env.DEV) {
              console.log(`🔄 [useColorTheme] 主题已同步: ${event.theme}`)
            }
          }
        }

        themeManager.on('theme-changed', handleThemeChanged)

        // 清理监听器
        onUnmounted(() => {
          if (typeof themeManager.off === 'function') {
            themeManager.off('theme-changed', handleThemeChanged)
          }
        })
      }
    }

    // 启用系统同步
    if (enableSystemSync) {
      startSystemSync()
    }
  })

  // 监听变化并自动保存
  if (autoSave) {
    watch([currentTheme, currentMode], () => {
      saveToStorage()
    })
  }

  return {
    // 状态
    currentTheme,
    currentMode,
    isDark,
    isLight,
    availableThemes,
    systemTheme,
    isSyncingSystem,

    // 方法
    setTheme,
    setMode,
    toggleMode,
    syncWithSystem,
    startSystemSync,
    stopSystemSync,
    getThemeConfig,
    getThemeDisplayName,
    reset,
  }
}
