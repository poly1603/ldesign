/**
 * Vue 3 集成
 */

import type { App, Plugin, Ref } from 'vue'
import { computed, inject, onMounted, onUnmounted, provide, ref } from 'vue'
import type {
  ColorMode,
  ThemeConfig,
  ThemeManagerInstance,
  ThemeManagerOptions,
} from '../core/types'
import { ThemeManager } from '../core/theme-manager'
import { presetThemes } from '../themes/presets'

/**
 * Vue 插件选项
 */
export interface VueThemePluginOptions extends ThemeManagerOptions {
  /** 注入键名 */
  injectKey?: string | symbol
}

/**
 * 主题管理器注入键
 */
export const THEME_MANAGER_KEY = Symbol('themeManager')

/**
 * Vue 主题管理器组合式 API
 */
export interface UseThemeReturn {
  /** 主题管理器实例 */
  themeManager: ThemeManagerInstance
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 当前颜色模式 */
  currentMode: Ref<ColorMode>
  /** 是否为深色模式 */
  isDark: Ref<boolean>
  /** 可用主题列表 */
  availableThemes: Ref<string[]>
  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>
  /** 设置颜色模式 */
  setMode: (mode: ColorMode) => Promise<void>
  /** 切换颜色模式 */
  toggleMode: () => Promise<void>
  /** 注册主题 */
  registerTheme: (config: ThemeConfig) => void
  /** 获取主题配置 */
  getThemeConfig: (name: string) => ThemeConfig | undefined
}

/**
 * 使用主题管理器的组合式 API
 */
export function useTheme(manager?: ThemeManagerInstance): UseThemeReturn {
  // 尝试从注入中获取主题管理器
  const injectedManager = inject<ThemeManagerInstance>(THEME_MANAGER_KEY)
  const themeManager = manager || injectedManager

  if (!themeManager) {
    throw new Error('Theme manager not found. Please provide a manager or install the Vue plugin.')
  }

  // 响应式状态
  const currentTheme = ref(themeManager.getCurrentTheme())
  const currentMode = ref(themeManager.getCurrentMode())
  const availableThemes = ref(themeManager.getThemeNames())

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')

  // 事件监听器
  let unsubscribeThemeChanged: (() => void) | null = null

  onMounted(() => {
    // 监听主题变化 - 使用简单的轮询方式更新状态
    const updateState = () => {
      currentTheme.value = themeManager.getCurrentTheme()
      currentMode.value = themeManager.getCurrentMode()
      availableThemes.value = themeManager.getThemeNames()
    }

    // 初始更新
    updateState()

    // 定期检查状态变化（简化实现）
    const interval = setInterval(updateState, 1000)

    unsubscribeThemeChanged = () => clearInterval(interval)
  })

  onUnmounted(() => {
    // 清理事件监听器
    if (unsubscribeThemeChanged) {
      unsubscribeThemeChanged()
    }
  })

  // 方法
  const setTheme = async (theme: string, mode?: ColorMode) => {
    await themeManager.setTheme(theme, mode)
  }

  const setMode = async (mode: ColorMode) => {
    await themeManager.setMode(mode)
  }

  const toggleMode = async () => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  const registerTheme = (config: ThemeConfig) => {
    themeManager.registerTheme(config)
  }

  const getThemeConfig = (name: string) => {
    return themeManager.getThemeConfig(name)
  }

  return {
    themeManager,
    currentTheme,
    currentMode,
    isDark,
    availableThemes,
    setTheme,
    setMode,
    toggleMode,
    registerTheme,
    getThemeConfig,
  }
}

/**
 * Vue 主题管理器插件
 */
export const ThemePlugin: Plugin = {
  install(app: App, options: VueThemePluginOptions = {}) {
    const {
      injectKey = THEME_MANAGER_KEY,
      themes = presetThemes,
      ...managerOptions
    } = options

    // 创建主题管理器实例
    const themeManager = new ThemeManager({
      themes,
      ...managerOptions,
    })

    // 初始化主题管理器
    themeManager.init().catch((error) => {
      console.error('Failed to initialize theme manager:', error)
    })

    // 提供主题管理器实例
    app.provide(injectKey, themeManager)

    // 全局属性
    app.config.globalProperties.$themeManager = themeManager
    app.config.globalProperties.$theme = {
      current: themeManager.getCurrentTheme(),
      mode: themeManager.getCurrentMode(),
      setTheme: themeManager.setTheme.bind(themeManager),
      setMode: themeManager.setMode.bind(themeManager),
    }
  },
}

/**
 * 创建主题管理器提供者组合式 API
 */
export function provideThemeManager(
  manager: ThemeManagerInstance,
  key: string | symbol = THEME_MANAGER_KEY,
): void {
  provide(key, manager)
}

/**
 * 注入主题管理器组合式 API
 */
export function injectThemeManager(
  key: string | symbol = THEME_MANAGER_KEY,
): ThemeManagerInstance | undefined {
  return inject<ThemeManagerInstance>(key)
}

/**
 * 创建主题切换器组合式 API
 */
export function useThemeToggle(manager?: ThemeManagerInstance) {
  const { currentMode, setMode } = useTheme(manager)

  const toggle = async () => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  return {
    currentMode,
    toggle,
    isLight: computed(() => currentMode.value === 'light'),
    isDark: computed(() => currentMode.value === 'dark'),
  }
}

/**
 * 创建主题选择器组合式 API
 */
export function useThemeSelector(manager?: ThemeManagerInstance) {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    getThemeConfig,
  } = useTheme(manager)

  const themeConfigs = computed(() => {
    return availableThemes.value.map(name => getThemeConfig(name)).filter(Boolean)
  })

  const selectTheme = async (theme: string) => {
    await setTheme(theme)
  }

  return {
    currentTheme,
    availableThemes,
    themeConfigs,
    selectTheme,
    setTheme,
  }
}

/**
 * 创建系统主题同步组合式 API
 */
export function useSystemThemeSync(manager?: ThemeManagerInstance) {
  const { setMode } = useTheme(manager)
  const systemTheme = ref<ColorMode>('light')

  onMounted(() => {
    // 检查系统主题
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      const updateSystemTheme = () => {
        systemTheme.value = mediaQuery.matches ? 'dark' : 'light'
      }

      // 初始化
      updateSystemTheme()

      // 监听变化
      mediaQuery.addEventListener('change', updateSystemTheme)

      // 清理
      onUnmounted(() => {
        mediaQuery.removeEventListener('change', updateSystemTheme)
      })
    }
  })

  const syncWithSystem = async () => {
    await setMode(systemTheme.value)
  }

  return {
    systemTheme,
    syncWithSystem,
    isSystemDark: computed(() => systemTheme.value === 'dark'),
  }
}

/**
 * 便捷的安装函数
 */
export function installThemePlugin(app: App, options?: VueThemePluginOptions): void {
  app.use(ThemePlugin, options)
}

// 类型声明扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $themeManager: ThemeManagerInstance
    $theme: {
      current: string
      mode: ColorMode
      setTheme: (theme: string, mode?: ColorMode) => Promise<void>
      setMode: (mode: ColorMode) => Promise<void>
    }
  }
}
