/**
 * Vue 插件 - 颜色管理系统
 * 
 * 提供主题管理和颜色处理功能的 Vue 插件
 */

import type { App, Plugin } from 'vue'
import { inject, ref, computed } from 'vue'
import { ThemeManager } from '../core/theme-manager'
// import ThemeSelector from './components/ThemeSelector.vue'
import type { ThemeManagerInstance } from '../core/types'

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
}

/**
 * 默认配置
 */
const defaultOptions: Required<ColorPluginOptions> = {
  registerComponents: true,
  componentPrefix: 'LColor',
  defaultTheme: 'blue',
  defaultMode: 'light',
  debug: false
}

/**
 * 创建颜色管理 Engine 插件
 * 
 * 用于集成到 LDesign Engine 系统中
 * 
 * @param options 插件配置选项
 * @returns Engine 插件实例
 */
export function createColorEnginePlugin(options: ColorPluginOptions = {}) {
  const config = { ...defaultOptions, ...options }

  return {
    name: 'color',
    version: '1.0.0',

    async install(engine: any) {
      try {
        // 获取 Vue 应用实例
        const app = engine.getApp ? engine.getApp() : (engine.app || engine)

        if (!app) {
          throw new Error('无法获取 Vue 应用实例')
        }

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
                gray: '#8c8c8c'
              },
              dark: {
                primary: '#177ddc',
                secondary: '#531dab',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959'
              }
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
                gray: '#8c8c8c'
              },
              dark: {
                primary: '#389e0d',
                secondary: '#177ddc',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959'
              }
            }
          ]
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
        } else if ((app as any).app && typeof (app as any).app.provide === 'function') {
          (app as any).app.provide('themeManager', themeManager)
        }

        // 注册组件 (暂时注释掉，等待 Vue 构建支持)
        // if (config.registerComponents) {
        //   app.component(`${config.componentPrefix}ThemeSelector`, ThemeSelector)
        // }

        // 应用初始主题（通过主题管理器）
        await themeManager.setTheme(config.defaultTheme, config.defaultMode)

        if (config.debug) {
          console.log('🎨 Color Engine 插件安装成功')
          console.log('🎯 主题管理器:', themeManager)
          console.log('⚙️ 配置:', config)
        }

        // 将配置存储到引擎中
        if (engine.config) {
          engine.config.color = config
        }

      } catch (error) {
        console.error('❌ Color Engine 插件安装失败:', error)
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

      } catch (error) {
        console.error('❌ Color Engine 插件卸载失败:', error)
        throw error
      }
    }
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
                gray: '#8c8c8c'
              },
              dark: {
                primary: '#177ddc',
                secondary: '#531dab',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959'
              }
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
                gray: '#8c8c8c'
              },
              dark: {
                primary: '#389e0d',
                secondary: '#177ddc',
                success: '#389e0d',
                warning: '#d48806',
                danger: '#cf1322',
                gray: '#595959'
              }
            }
          ]
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
        } else if ((app as any).app && typeof (app as any).app.provide === 'function') {
          (app as any).app.provide('themeManager', themeManager)
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

      } catch (error) {
        console.error('❌ Color Vue 插件安装失败:', error)
        throw error
      }
    }
  }
}



/**
 * 组合式函数：使用主题
 */
export function useTheme() {
  const themeManager = inject('themeManager') as any

  if (!themeManager) {
    console.warn('themeManager not found. Make sure to install the color plugin.')
    return {
      currentTheme: ref('blue'),
      currentMode: ref('light' as const),
      isDark: computed(() => false),
      isLight: computed(() => true),
      availableThemes: computed(() => []),
      setTheme: () => { },
      setMode: () => { },
      toggleMode: () => { },
      getCurrentTheme: () => 'blue',
      getCurrentMode: () => 'light' as const
    }
  }

  // 响应式状态
  const currentTheme = ref(themeManager.currentTheme || 'blue')
  const currentMode = ref(themeManager.currentMode || 'light')

  // 计算属性
  const isDark = computed(() => currentMode.value === 'dark')
  const isLight = computed(() => currentMode.value === 'light')
  const availableThemes = computed(() => {
    if (typeof themeManager.getAvailableThemes === 'function') {
      return themeManager.getAvailableThemes()
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
    } catch (error) {
      console.error('[useTheme] 设置主题失败:', error)
    }
  }

  const setMode = async (mode: 'light' | 'dark') => {
    try {
      await themeManager.setTheme(currentTheme.value, mode)
      currentMode.value = mode
    } catch (error) {
      console.error('[useTheme] 设置模式失败:', error)
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
    setTheme,
    setMode,
    toggleMode,
    getCurrentTheme: () => themeManager.currentTheme,
    getCurrentMode: () => themeManager.currentMode
  }
}

// 默认导出
const ColorVuePlugin = {
  createColorEnginePlugin,
  createColorPlugin,
  useTheme
}

export default ColorVuePlugin

// 类型声明扩展
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $themeManager: ThemeManagerInstance
  }
}
