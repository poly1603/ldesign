/**
 * 主题插件
 * 
 * 提供主题切换功能,支持多主题动态切换和CSS变量注入
 * 
 * @module plugins/theme
 */

import type { Plugin, PluginContext } from '../../types'

/**
 * 主题定义
 */
export interface ThemeDefinition {
  /** 主题变量 (CSS变量名 -> 值) */
  variables: Record<string, string>
  /** 主题类名 (可选) */
  className?: string
  /** 主题描述 */
  description?: string
}

/**
 * 主题插件配置
 */
export interface ThemePluginConfig {
  /** 主题定义 */
  themes: Record<string, ThemeDefinition>
  /** 默认主题 */
  defaultTheme: string
  /** CSS变量前缀 */
  prefix?: string
  /** 是否持久化主题选择 */
  persist?: boolean
  /** 持久化存储键 */
  storageKey?: string
  /** 是否自动应用到 document.documentElement */
  autoApply?: boolean
}

/**
 * 主题插件扩展的引擎方法
 */
export interface ThemeEngineExtensions {
  /**
   * 切换主题
   * @param themeName - 主题名称
   */
  setTheme(themeName: string): void

  /**
   * 获取当前主题
   */
  getTheme(): string

  /**
   * 获取主题定义
   * @param themeName - 主题名称
   */
  getThemeDefinition(themeName: string): ThemeDefinition | undefined

  /**
   * 获取所有可用主题
   */
  getAvailableThemes(): string[]

  /**
   * 注册新主题
   * @param themeName - 主题名称
   * @param theme - 主题定义
   */
  registerTheme(themeName: string, theme: ThemeDefinition): void

  /**
   * 获取主题变量值
   * @param variableName - 变量名
   */
  getThemeVariable(variableName: string): string | undefined
}

/**
 * 应用主题到 DOM
 * @param theme - 主题定义
 * @param prefix - 变量前缀
 * @param oldClassName - 旧的类名
 */
function applyThemeToDOM(theme: ThemeDefinition, prefix: string, oldClassName?: string): void {
  const root = document.documentElement

  // 应用 CSS 变量
  Object.entries(theme.variables).forEach(([key, value]) => {
    const variableName = key.startsWith('--') ? key : `--${prefix}${key}`
    root.style.setProperty(variableName, value)
  })

  // 应用主题类名
  if (oldClassName) {
    root.classList.remove(oldClassName)
  }
  if (theme.className) {
    root.classList.add(theme.className)
  }
}

/**
 * 从存储中加载主题
 * @param storageKey - 存储键
 * @returns 主题名称
 */
function loadThemeFromStorage(storageKey: string): string | null {
  try {
    return localStorage.getItem(storageKey)
  } catch (error) {
    console.warn('[theme] Failed to load theme from storage:', error)
    return null
  }
}

/**
 * 保存主题到存储
 * @param storageKey - 存储键
 * @param themeName - 主题名称
 */
function saveThemeToStorage(storageKey: string, themeName: string): void {
  try {
    localStorage.setItem(storageKey, themeName)
  } catch (error) {
    console.warn('[theme] Failed to save theme to storage:', error)
  }
}

/**
 * 创建主题插件
 * 
 * @param config - 插件配置
 * @returns 插件对象
 * 
 * @example
 * ```typescript
 * const themePlugin = createThemePlugin({
 *   defaultTheme: 'light',
 *   prefix: 'app-',
 *   persist: true,
 *   themes: {
 *     light: {
 *       variables: {
 *         'primary-color': '#007bff',
 *         'background-color': '#ffffff',
 *         'text-color': '#333333'
 *       },
 *       className: 'theme-light',
 *       description: 'Light theme'
 *     },
 *     dark: {
 *       variables: {
 *         'primary-color': '#0056b3',
 *         'background-color': '#1a1a1a',
 *         'text-color': '#e0e0e0'
 *       },
 *       className: 'theme-dark',
 *       description: 'Dark theme'
 *     }
 *   }
 * })
 * 
 * // 在引擎中使用
 * await engine.use(themePlugin)
 * engine.setTheme('dark')
 * console.log(engine.getTheme()) // 'dark'
 * ```
 */
export function createThemePlugin(config: ThemePluginConfig): Plugin {
  const {
    themes,
    defaultTheme,
    prefix = '',
    persist = true,
    storageKey = 'app-theme',
    autoApply = true,
  } = config

  // 验证默认主题是否存在
  if (!themes[defaultTheme]) {
    throw new Error(`Default theme "${defaultTheme}" not found in themes`)
  }

  return {
    name: 'theme',
    version: '1.0.0',

    install(context: PluginContext) {
      const { state, events, logger } = context
      const engine = context.engine as any

      // 尝试从存储加载主题
      let initialTheme = defaultTheme
      if (persist && typeof window !== 'undefined') {
        const savedTheme = loadThemeFromStorage(storageKey)
        if (savedTheme && themes[savedTheme]) {
          initialTheme = savedTheme
          logger.debug(`[theme] Loaded theme from storage: ${savedTheme}`)
        }
      }

      // 初始化主题状态
      state.setState('theme', {
        current: initialTheme,
        themes: { ...themes },
        prefix,
      })

      logger.debug(`[theme] Plugin installed with theme: ${initialTheme}`)

      /**
       * 切换主题
       */
      engine.setTheme = (themeName: string) => {
        const allThemes = state.getState('theme.themes') || {}

        if (!allThemes[themeName]) {
          const availableThemes = Object.keys(allThemes)
          logger.warn(`[theme] Theme "${themeName}" not found, available themes:`, availableThemes)
          throw new Error(
            `Theme "${themeName}" not found. Available themes: ${availableThemes.join(', ')}`
          )
        }

        const oldTheme = state.getState('theme.current')
        const oldThemeDefinition = allThemes[oldTheme]
        const newThemeDefinition = allThemes[themeName]

        // 应用主题到 DOM
        if (autoApply && typeof document !== 'undefined') {
          applyThemeToDOM(
            newThemeDefinition,
            prefix,
            oldThemeDefinition?.className
          )
        }

        // 更新状态
        state.setState('theme.current', themeName)

        // 持久化
        if (persist && typeof window !== 'undefined') {
          saveThemeToStorage(storageKey, themeName)
        }

        // 发射事件
        events.emit('theme:changed', {
          from: oldTheme,
          to: themeName,
          theme: newThemeDefinition,
        })

        logger.debug(`[theme] Theme changed: ${oldTheme} -> ${themeName}`)
      }

      /**
       * 获取当前主题
       */
      engine.getTheme = (): string => {
        return state.getState('theme.current') || initialTheme
      }

      /**
       * 获取主题定义
       */
      engine.getThemeDefinition = (themeName: string): ThemeDefinition | undefined => {
        const allThemes = state.getState('theme.themes') || {}
        return allThemes[themeName]
      }

      /**
       * 获取所有可用主题
       */
      engine.getAvailableThemes = (): string[] => {
        const allThemes = state.getState('theme.themes') || {}
        return Object.keys(allThemes)
      }

      /**
       * 注册新主题
       */
      engine.registerTheme = (themeName: string, theme: ThemeDefinition) => {
        const allThemes = state.getState('theme.themes') || {}

        if (allThemes[themeName]) {
          logger.warn(`[theme] Theme "${themeName}" already exists, will be overwritten`)
        }

        state.setState(`theme.themes.${themeName}`, theme)

        events.emit('theme:registered', {
          name: themeName,
          theme,
        })

        logger.debug(`[theme] Theme registered: ${themeName}`)
      }

      /**
       * 获取主题变量值
       */
      engine.getThemeVariable = (variableName: string): string | undefined => {
        const currentTheme = state.getState('theme.current')
        const allThemes = state.getState('theme.themes') || {}
        const theme = allThemes[currentTheme]

        if (!theme) return undefined

        // 支持有无 -- 前缀的变量名
        const normalizedName = variableName.startsWith('--')
          ? variableName.slice(2)
          : variableName

        return theme.variables[normalizedName] || theme.variables[`--${normalizedName}`]
      }

      // 应用初始主题
      if (autoApply && typeof document !== 'undefined') {
        applyThemeToDOM(themes[initialTheme], prefix)
      }

      // 发射初始化事件
      events.emit('theme:initialized', {
        theme: initialTheme,
        availableThemes: Object.keys(themes),
      })
    },

    uninstall(context: PluginContext) {
      const { state, logger } = context
      const engine = context.engine as any

      // 清理状态
      state.setState('theme', undefined)

      // 移除扩展方法
      delete engine.setTheme
      delete engine.getTheme
      delete engine.getThemeDefinition
      delete engine.getAvailableThemes
      delete engine.registerTheme
      delete engine.getThemeVariable

      logger.debug('[theme] Plugin uninstalled')
    },
  }
}

/**
 * 预设主题
 */
export const PRESET_THEMES = {
  /**
   * 亮色主题
   */
  light: {
    variables: {
      'primary-color': '#1890ff',
      'success-color': '#52c41a',
      'warning-color': '#faad14',
      'error-color': '#f5222d',
      'info-color': '#1890ff',
      'background-color': '#ffffff',
      'background-color-secondary': '#fafafa',
      'text-color': '#000000d9',
      'text-color-secondary': '#00000073',
      'border-color': '#d9d9d9',
      'shadow-color': 'rgba(0, 0, 0, 0.1)',
    },
    className: 'theme-light',
    description: 'Light theme',
  } as ThemeDefinition,

  /**
   * 暗色主题
   */
  dark: {
    variables: {
      'primary-color': '#177ddc',
      'success-color': '#49aa19',
      'warning-color': '#d89614',
      'error-color': '#d32029',
      'info-color': '#177ddc',
      'background-color': '#141414',
      'background-color-secondary': '#1f1f1f',
      'text-color': '#ffffffd9',
      'text-color-secondary': '#ffffff73',
      'border-color': '#434343',
      'shadow-color': 'rgba(0, 0, 0, 0.45)',
    },
    className: 'theme-dark',
    description: 'Dark theme',
  } as ThemeDefinition,
}
