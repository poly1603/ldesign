/**
 * Vue 插件 - 颜色管理系统
 *
 * 提供主题管理和颜色处理功能的 Vue 插件
 */

import type { App, ComputedRef, Plugin, Ref } from 'vue'
// import ThemeSelector from './components/ThemeSelector.vue'
import type { ColorMode, ThemeConfig, ThemeManagerInstance } from '../core/types'
import { computed, inject, ref } from 'vue'
import { ThemeManager } from '../core/theme-manager'
import { presetThemes } from '../themes/presets'

/**
 * 插件配置选项
 */
export interface ColorPluginOptions {
  /** 是否全局注册组件 */
  registerComponents?: boolean
  /** 组件名称前缀 */
  componentPrefix?: string
  /** 默认主题 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: 'light' | 'dark'
  /** 是否启用调试模式 */
  debug?: boolean
  /** CSS 变量前缀，默认为 'ldesign' */
  cssVariablePrefix?: string
  /** 是否启用缓存，默认为 true */
  enableCache?: boolean
  /** 缓存存储类型 */
  cacheStorage?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 自定义主题色配置 */
  customThemes?: Array<{
    name: string
    displayName: string
    description?: string
    light?: Record<string, string>
    dark?: Record<string, string>
    colors?: Record<string, string>
  }>
  /** 禁用的内置主题名称列表 */
  disabledBuiltinThemes?: string[]
  /** 背景色生成策略 */
  backgroundStrategy?: 'neutral' | 'primary-based' | 'custom'
  /** 是否根据主色调生成背景色 */
  generateBackgroundFromPrimary?: boolean
  /** 初始化完成回调 */
  onReady?: (themeManager: any) => void | Promise<void>
  /** 主题切换回调 */
  onThemeChanged?: (theme: string, mode: 'light' | 'dark') => void | Promise<void>
  /** 错误处理回调 */
  onError?: (error: Error) => void
}

/**
 * 默认配置
 */
const defaultOptions: Required<
  Omit<
    ColorPluginOptions,
    'customThemes' | 'disabledBuiltinThemes' | 'onReady' | 'onThemeChanged' | 'onError'
  >
> & {
  customThemes: ColorPluginOptions['customThemes']
  disabledBuiltinThemes: ColorPluginOptions['disabledBuiltinThemes']
  onReady: ColorPluginOptions['onReady']
  onThemeChanged: ColorPluginOptions['onThemeChanged']
  onError: ColorPluginOptions['onError']
} = {
  registerComponents: true,
  componentPrefix: 'LColor',
  defaultTheme: 'default',
  defaultMode: 'light',
  debug: false,
  cssVariablePrefix: 'ldesign',
  enableCache: true,
  cacheStorage: 'localStorage',
  customThemes: undefined,
  disabledBuiltinThemes: undefined,
  backgroundStrategy: 'neutral',
  generateBackgroundFromPrimary: false,
  onReady: undefined,
  onThemeChanged: undefined,
  onError: undefined,
}

/**
 * 处理主题配置，合并内置主题和自定义主题
 */
function processThemeConfig(config: ColorPluginOptions): ThemeConfig[] {
  // 获取启用的内置主题
  let enabledBuiltinThemes = presetThemes

  if (config.disabledBuiltinThemes && config.disabledBuiltinThemes.length > 0) {
    enabledBuiltinThemes = presetThemes.filter(
      theme => !config.disabledBuiltinThemes!.includes(theme.name),
    )
  }

  // 转换自定义主题格式
  const customThemes: ThemeConfig[] = []
  if (config.customThemes && config.customThemes.length > 0) {
    for (const customTheme of config.customThemes) {
      const themeConfig: ThemeConfig = {
        name: customTheme.name,
        displayName: customTheme.displayName,
        description: customTheme.description,
        builtin: false,
        light: {
          // 确保 primary 存在，避免类型错误
          primary: (customTheme.light as any)?.primary ?? customTheme.colors?.primary ?? '#1890ff',
          ...(customTheme.light || ({} as any)),
        } as any,
        dark: customTheme.dark
          ? ({
              primary:
                (customTheme.dark as any)?.primary ?? customTheme.colors?.primary ?? '#177ddc',
              ...(customTheme.dark || ({} as any)),
            } as any)
          : undefined,
        colors: customTheme.colors,
      }
      customThemes.push(themeConfig)
    }
  }

  return [...enabledBuiltinThemes, ...customThemes]
}

/**
 * 创建增强的主题管理器配置
 */
function createThemeManagerConfig(config: ColorPluginOptions) {
  const themes = processThemeConfig(config)

  return {
    defaultTheme: config.defaultTheme,
    autoDetect: true,
    themes,
    cache: config.enableCache,
    storage: config.cacheStorage,
    cssVariables: {
      prefix: config.cssVariablePrefix,
      includeComments: true,
      includeThemeInfo: true,
    },
    backgroundGeneration: {
      strategy: config.backgroundStrategy,
      basedOnPrimary: config.generateBackgroundFromPrimary,
    },
    debug: config.debug,
    onThemeChanged: config.onThemeChanged,
    onError: config.onError,
  }
}

/**
 * 创建颜色管理 Engine 插件
 *
 * 用于集成到 LDesign Engine 系统中
 *
 * @param options 插件配置选项
 * @returns Engine 插件实例
 */
/**
 * 创建颜色管理 Engine 插件
 *
 * 用于将 @ldesign/color 集成到第三方引擎或框架中。
 * 该插件会：
 * - 创建并初始化 ThemeManager
 * - 将 ThemeManager 注入到全局（provide / globalProperties / window）
 * - 应用默认主题与模式
 * - 在需要时触发回调（onReady / onThemeChanged / onError）
 *
 * @param options 插件配置选项
 * @returns Engine 插件对象（具备 install/uninstall 生命周期）
 */
export function createColorEnginePlugin(options: ColorPluginOptions = {}) {
  const config = { ...defaultOptions, ...options }

  return {
    name: 'color',
    version: '1.0.0',

    async install(engine: any) {
      try {
        // 获取 Vue 应用实例
        const app = engine.getApp ? engine.getApp() : engine.app || engine

        if (!app) {
          throw new Error('无法获取 Vue 应用实例')
        }

        if (config.debug) {
          console.log(`🎨 [ColorEngine] 开始安装插件，配置: ${JSON.stringify(config)}`)
        }

        // 创建增强的主题管理器实例
        const themeManagerConfig = createThemeManagerConfig(config)
        const themeManager = new ThemeManager(themeManagerConfig)

        // 初始化主题管理器
        await themeManager.init()

        // 将主题管理器添加到全局属性和依赖注入
        if (app.config && app.config.globalProperties) {
          app.config.globalProperties.$themeManager = themeManager
        }

        // 兼容不同的应用实例类型
        if (typeof app.provide === 'function') {
          app.provide('themeManager', themeManager)
          app.provide('$themeManager', themeManager) // 额外的注入键
        }
        else {
          const appAny = app as any
          if (appAny.app && typeof appAny.app.provide === 'function') {
            appAny.app.provide('themeManager', themeManager)
            appAny.app.provide('$themeManager', themeManager)
          }
        }

        // 同时添加到 window 对象作为备用方案
        if (typeof window !== 'undefined') {
          ;(window as any).themeManager = themeManager
        }

        // 注册组件 (暂时注释掉，等待 Vue 构建支持)
        // if (config.registerComponents) {
        //   app.component(`${config.componentPrefix}ThemeSelector`, ThemeSelector)
        // }

        // 应用初始主题（通过主题管理器）
        await themeManager.setTheme(config.defaultTheme, config.defaultMode)

        // 注意：主题切换回调和错误处理回调已在ThemeManager构造时设置
        // 不需要在这里重复设置

        if (config.debug) {
          console.log('🎨 Color Engine 插件安装成功')
          console.log('🎯 主题管理器:', themeManager)
          console.log('⚙️ 配置:', config)
          console.log(
            '🎨 可用主题:',
            themeManagerConfig.themes.map(t => t.name),
          )
        }

        // 将配置存储到引擎中
        if (engine.config) {
          engine.config.color = config
        }

        // 调用初始化完成回调
        if (config.onReady) {
          try {
            await config.onReady(themeManager)
          }
          catch (error) {
            console.warn('🚨 [ColorEngine] onReady 回调执行失败:', error)
            if (config.onError) {
              config.onError(error as Error)
            }
          }
        }
      }
      catch (error) {
        console.error('❌ Color Engine 插件安装失败:', error)

        // 调用错误处理回调
        if (config.onError) {
          try {
            config.onError(error as Error)
          }
          catch (callbackError) {
            console.error('❌ onError 回调执行失败:', callbackError)
          }
        }

        throw error
      }
    },

    async uninstall(engine: any) {
      try {
        // 获取主题管理器
        const themeManager = engine.app?.config?.globalProperties?.$themeManager

        if (themeManager && typeof themeManager.destroy === 'function') {
          themeManager.destroy()
        }

        if (defaultOptions.debug) {
          console.log('🎨 Color Engine 插件卸载成功')
        }
      }
      catch (error) {
        console.error('❌ Color Engine 插件卸载失败:', error)
        throw error
      }
    },
  }
}

/**
 * 创建 Vue 插件
 *
 * 用于直接在 Vue 应用中使用
 *
 * @param options 插件配置选项
 * @returns Vue 插件实例
 */
/**
 * 创建 Vue 插件（直接在 Vue 应用中使用）
 *
 * 功能：
 * - 初始化并注入 ThemeManager
 * - 在应用启动时应用默认主题与模式
 * - 在全局（provide/globalProperties）暴露 $themeManager
 *
 * 示例：
 * ```ts
 * import { createApp } from 'vue'
 * import { createColorPlugin } from '@ldesign/color/vue'
 * const app = createApp(App)
 * app.use(createColorPlugin({ defaultTheme: 'default', defaultMode: 'light' }))
 * ```
 */
export function createColorPlugin(options: ColorPluginOptions = {}): Plugin {
  const config = { ...defaultOptions, ...options }

  return {
    async install(app: App) {
      try {
        // 创建主题管理器实例
        const themeManager = new ThemeManager({
          defaultTheme: config.defaultTheme,
          autoDetect: true,
          themes: [
            {
              name: 'blue',
              displayName: '蓝色主题',
              light: {
                primary: '#1890ff',
                secondary: '#722ed1',
                success: '#52c41a',
                warning: '#faad14',
                danger: '#ff4d4f',
                gray: '#8c8c8c',
              },
              dark: {
                primary: '#177ddc',
                secondary: '#531dab',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959',
              },
            },
            {
              name: 'green',
              displayName: '绿色主题',
              light: {
                primary: '#52c41a',
                secondary: '#1890ff',
                success: '#52c41a',
                warning: '#faad14',
                danger: '#ff4d4f',
                gray: '#8c8c8c',
              },
              dark: {
                primary: '#389e0d',
                secondary: '#177ddc',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959',
              },
            },
          ],
        })

        // 初始化主题管理器
        await themeManager.init()

        // 将主题管理器添加到全局属性和依赖注入
        if (app.config && app.config.globalProperties) {
          app.config.globalProperties.$themeManager = themeManager
        }

        // 兼容不同的应用实例类型
        if (typeof app.provide === 'function') {
          app.provide('themeManager', themeManager)
          app.provide('$themeManager', themeManager) // 额外的注入键
        }
        else {
          const appAny = app as any
          if (appAny.app && typeof appAny.app.provide === 'function') {
            appAny.app.provide('themeManager', themeManager)
            appAny.app.provide('$themeManager', themeManager)
          }
        }

        // 同时添加到 window 对象作为备用方案
        if (typeof window !== 'undefined') {
          ;(window as any).themeManager = themeManager
        }

        // 注册组件 (暂时注释掉，等待 Vue 构建支持)
        // if (config.registerComponents) {
        //   app.component(`${config.componentPrefix}ThemeSelector`, ThemeSelector)
        // }

        // 应用初始主题（通过主题管理器）
        await themeManager.setTheme(config.defaultTheme, config.defaultMode)

        if (config.debug) {
          console.log('🎨 Color Vue 插件安装成功')
          console.log('🎯 主题管理器:', themeManager)
          console.log('⚙️ 配置:', config)
        }
      }
      catch (error) {
        console.error('❌ Color Vue 插件安装失败:', error)
        throw error
      }
    },
  }
}

/**
 * 组合式函数：使用主题
 */
/**
 * useTheme 返回类型
 */
export interface UseThemeReturn {
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 当前模式 */
  currentMode: Ref<ColorMode>
  /** 是否为暗色模式 */
  isDark: ComputedRef<boolean>
  /** 是否为亮色模式 */
  isLight: ComputedRef<boolean>
  /** 可用主题名称列表 */
  availableThemes: ComputedRef<string[]>
  /** 主题管理器实例 */
  themeManager: any
  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>
  /** 设置模式 */
  setMode: (mode: ColorMode) => Promise<void>
  /** 切换模式 */
  toggleMode: () => Promise<void>
  /** 获取当前主题 */
  getCurrentTheme: () => string
  /** 获取当前模式 */
  getCurrentMode: () => ColorMode
}

/**
 * 组合式函数：使用主题
 *
 * 提供以下响应式能力：
 * - currentTheme/currentMode 当前主题与模式
 * - availableThemes 可用主题名称列表
 * - setTheme/setMode/toggleMode 修改主题与模式
 * - themeManager 主题管理器实例
 *
 * @returns 主题管理API
 *
 * @example
 * ```vue
 * <script setup>
 * import { useTheme } from '@ldesign/color/vue'
 *
 * const {
 *   currentTheme,
 *   currentMode,
 *   isDark,
 *   availableThemes,
 *   setTheme,
 *   toggleMode
 * } = useTheme()
 * </script>
 * ```
 */
export function useTheme(): UseThemeReturn {
  const themeManager = inject('themeManager') as any

  if (!themeManager) {
    if (import.meta.env.DEV) {
      console.warn('[useTheme] themeManager not found. Make sure to install the color plugin.')
    }
    return {
      currentTheme: ref('blue'),
      currentMode: ref('light' as const),
      isDark: computed(() => false),
      isLight: computed(() => true),
      availableThemes: computed(() => [] as string[]),
      themeManager: null,
      setTheme: async () => {
        /* no-op */
      },
      setMode: async () => {
        /* no-op */
      },
      toggleMode: async () => {
        /* no-op */
      },
      getCurrentTheme: () => 'blue',
      getCurrentMode: () => 'light' as const,
    }
  }

  // 响应式状态（通过公开方法而非私有字段获取）
  const initialTheme
    = typeof themeManager.getCurrentTheme === 'function' ? themeManager.getCurrentTheme() : 'blue'
  const initialMode
    = typeof themeManager.getCurrentMode === 'function' ? themeManager.getCurrentMode() : 'light'

  const currentTheme = ref<string>(initialTheme)
  const currentMode = ref<'light' | 'dark'>(initialMode)

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')
  const availableThemes = computed<string[]>(() => {
    if (typeof themeManager.getThemeNames === 'function') {
      return themeManager.getThemeNames()
    }
    if (typeof themeManager.getAvailableThemes === 'function') {
      // 回退：某些实现可能返回 ThemeConfig[]
      const list = themeManager.getAvailableThemes()
      if (Array.isArray(list)) {
        return list.map((t: any) => (typeof t === 'string' ? t : t?.name)).filter(Boolean)
      }
    }
    return []
  })

  // 方法
  const setTheme = async (theme: string, mode?: 'light' | 'dark') => {
    try {
      await themeManager.setTheme(theme, mode)
      currentTheme.value = theme
      if (mode) {
        currentMode.value = mode
      }
      else if (typeof themeManager.getCurrentMode === 'function') {
        currentMode.value = themeManager.getCurrentMode()
      }
    }
    catch (error) {
      if (import.meta.env.DEV) {
        console.error('[useTheme] 设置主题失败:', error)
      }
    }
  }

  const setMode = async (mode: 'light' | 'dark') => {
    try {
      ;(await themeManager.setMode)
        ? themeManager.setMode(mode)
        : themeManager.setTheme(currentTheme.value, mode)
      currentMode.value = mode
    }
    catch (error) {
      if (import.meta.env.DEV) {
        console.error('[useTheme] 设置模式失败:', error)
      }
    }
  }

  const toggleMode = async () => {
    const newMode = currentMode.value === 'light' ? 'dark' : 'light'
    await setMode(newMode)
  }

  return {
    currentTheme,
    currentMode,
    isDark,
    isLight,
    availableThemes,
    themeManager,
    setTheme,
    setMode,
    toggleMode,
    getCurrentTheme: () =>
      typeof themeManager.getCurrentTheme === 'function'
        ? themeManager.getCurrentTheme()
        : currentTheme.value,
    getCurrentMode: () =>
      typeof themeManager.getCurrentMode === 'function'
        ? themeManager.getCurrentMode()
        : currentMode.value,
  }
}

// 默认导出
const ColorVuePlugin = {
  createColorEnginePlugin,
  createColorPlugin,
  useTheme,
}

export default ColorVuePlugin

// 类型声明扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $themeManager: ThemeManagerInstance
  }
}
