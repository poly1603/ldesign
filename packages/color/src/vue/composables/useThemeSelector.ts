/**
 * 主题选择器组合式API
 * 
 * 提供主题选择和管理功能的组合式API
 */

import { ref, computed, inject, onMounted, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import { presetThemes } from '../../themes/presets'
import type { ThemeConfig, ColorMode } from '../../core/types'

/**
 * 主题选择器返回类型
 */
export interface UseThemeSelectorReturn {
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 当前模式 */
  currentMode: Ref<ColorMode>
  /** 可用主题列表 */
  availableThemes: ComputedRef<ThemeConfig[]>
  /** 主题配置映射 */
  themeConfigs: ComputedRef<Record<string, ThemeConfig>>
  /** 是否为暗色模式 */
  isDark: ComputedRef<boolean>
  /** 选择主题 */
  selectTheme: (themeName: string) => Promise<void>
  /** 设置模式 */
  setMode: (mode: ColorMode) => Promise<void>
  /** 切换模式 */
  toggleMode: () => Promise<void>
  /** 获取主题配置 */
  getThemeConfig: (themeName: string) => ThemeConfig | undefined
  /** 获取主题显示名称 */
  getThemeDisplayName: (themeName: string) => string
  /** 获取主题描述 */
  getThemeDescription: (themeName: string) => string
}

/**
 * 主题选择器选项
 */
export interface UseThemeSelectorOptions {
  /** 自定义主题列表 */
  customThemes?: ThemeConfig[]
  /** 禁用的内置主题 */
  disabledBuiltinThemes?: string[]
  /** 默认主题 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: ColorMode
  /** 是否自动保存到存储 */
  autoSave?: boolean
  /** 存储键名 */
  storageKey?: string
}

/**
 * 主题选择器组合式API
 * 
 * @param options 配置选项
 * @returns 主题选择器API
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useThemeSelector } from '@ldesign/color/vue'
 * 
 * const {
 *   currentTheme,
 *   currentMode,
 *   availableThemes,
 *   selectTheme,
 *   toggleMode
 * } = useThemeSelector()
 * </script>
 * ```
 */
export function useThemeSelector(options: UseThemeSelectorOptions = {}): UseThemeSelectorReturn {
  const {
    customThemes = [],
    disabledBuiltinThemes = [],
    defaultTheme = 'default',
    defaultMode = 'light',
    autoSave = true,
    storageKey = 'ldesign-theme-selector'
  } = options

  // 获取主题管理器
  const themeManager = inject<any>('themeManager', null)

  // 响应式状态
  const currentTheme = ref<string>(defaultTheme)
  const currentMode = ref<ColorMode>(defaultMode)

  // 计算属性
  const availableThemes = computed(() => {
    // 过滤掉被禁用的内置主题
    const enabledBuiltinThemes = presetThemes.filter(
      theme => !disabledBuiltinThemes.includes(theme.name)
    )
    
    // 合并内置主题和用户自定义主题
    return [...enabledBuiltinThemes, ...customThemes]
  })

  const themeConfigs = computed(() => {
    const configs: Record<string, ThemeConfig> = {}
    availableThemes.value.forEach(theme => {
      configs[theme.name] = theme
    })
    return configs
  })

  const isDark = computed(() => currentMode.value === 'dark')

  // 方法
  const selectTheme = async (themeName: string): Promise<void> => {
    if (!availableThemes.value.find(t => t.name === themeName)) {
      console.warn(`[useThemeSelector] 主题 "${themeName}" 不存在`)
      return
    }

    currentTheme.value = themeName

    // 通知主题管理器
    if (themeManager && typeof themeManager.setTheme === 'function') {
      try {
        await themeManager.setTheme(themeName, currentMode.value)
      } catch (error) {
        console.warn('[useThemeSelector] 主题管理器设置失败:', error)
        // 回退到本地存储
        if (autoSave) {
          saveToStorage()
        }
      }
    } else if (autoSave) {
      saveToStorage()
    }
  }

  const setMode = async (mode: ColorMode): Promise<void> => {
    currentMode.value = mode

    // 通知主题管理器
    if (themeManager && typeof themeManager.setTheme === 'function') {
      try {
        await themeManager.setTheme(currentTheme.value, mode)
      } catch (error) {
        console.warn('[useThemeSelector] 主题管理器设置失败:', error)
        // 回退到本地存储
        if (autoSave) {
          saveToStorage()
        }
      }
    } else if (autoSave) {
      saveToStorage()
    }
  }

  const toggleMode = async (): Promise<void> => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const getThemeConfig = (themeName: string): ThemeConfig | undefined => {
    return themeConfigs.value[themeName]
  }

  const getThemeDisplayName = (themeName: string): string => {
    const config = getThemeConfig(themeName)
    return config?.displayName || themeName
  }

  const getThemeDescription = (themeName: string): string => {
    const config = getThemeConfig(themeName)
    return config?.description || ''
  }

  // 存储相关
  const saveToStorage = (): void => {
    if (typeof localStorage === 'undefined') return

    try {
      const data = {
        theme: currentTheme.value,
        mode: currentMode.value,
        timestamp: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('[useThemeSelector] 保存到存储失败:', error)
    }
  }

  const loadFromStorage = (): { theme: string; mode: ColorMode } => {
    if (typeof localStorage === 'undefined') {
      return { theme: defaultTheme, mode: defaultMode }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        return {
          theme: data.theme || defaultTheme,
          mode: data.mode || defaultMode
        }
      }
    } catch (error) {
      console.warn('[useThemeSelector] 从存储加载失败:', error)
    }

    return { theme: defaultTheme, mode: defaultMode }
  }

  // 初始化
  onMounted(() => {
    if (themeManager) {
      try {
        // 优先使用主题管理器的状态
        if (typeof themeManager.getCurrentTheme === 'function') {
          currentTheme.value = themeManager.getCurrentTheme() || defaultTheme
        }
        if (typeof themeManager.getCurrentMode === 'function') {
          currentMode.value = themeManager.getCurrentMode() || defaultMode
        }
      } catch (error) {
        console.warn('[useThemeSelector] 主题管理器初始化失败，使用存储:', error)
        // 回退到存储
        const { theme, mode } = loadFromStorage()
        currentTheme.value = theme
        currentMode.value = mode
      }
    } else if (autoSave) {
      // 如果没有主题管理器，从存储加载
      const { theme, mode } = loadFromStorage()
      currentTheme.value = theme
      currentMode.value = mode
    }
  })

  // 监听变化并自动保存
  if (autoSave) {
    watch([currentTheme, currentMode], () => {
      saveToStorage()
    })
  }

  return {
    currentTheme,
    currentMode,
    availableThemes,
    themeConfigs,
    isDark,
    selectTheme,
    setMode,
    toggleMode,
    getThemeConfig,
    getThemeDisplayName,
    getThemeDescription
  }
}
