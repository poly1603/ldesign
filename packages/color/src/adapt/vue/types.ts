/**
 * Vue 适配器类型定义
 */

import type { ComputedRef, InjectionKey, Ref } from 'vue'
import type {
  ColorConfig,
  ColorMode,
  ThemeConfig,
  ThemeManagerInstance,
  ThemeManagerOptions,
} from '../../core/types'

/**
 * Vue 插件选项
 */
export interface VueThemePluginOptions extends ThemeManagerOptions {
  /** 注入键名 */
  injectKey?: string | symbol
  /** 是否全局注册组件 */
  registerComponents?: boolean
  /** 是否全局注册指令 */
  registerDirectives?: boolean
  /** 组件名前缀 */
  componentPrefix?: string
}

/**
 * 主题管理器注入键
 */
export const THEME_MANAGER_KEY: InjectionKey<ThemeManagerInstance> =
  Symbol('themeManager')

/**
 * Vue 主题管理器组合式 API 返回值
 */
export interface UseThemeReturn {
  /** 主题管理器实例 */
  themeManager: ThemeManagerInstance
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 当前颜色模式 */
  currentMode: Ref<ColorMode>
  /** 是否为深色模式 */
  isDark: ComputedRef<boolean>
  /** 是否为浅色模式 */
  isLight: ComputedRef<boolean>
  /** 可用主题列表 */
  availableThemes: Ref<string[]>
  /** 当前主题配置 */
  currentThemeConfig: ComputedRef<ThemeConfig | undefined>
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
  /** 重置到默认主题 */
  resetToDefault: () => Promise<void>
}

/**
 * 主题切换器组合式 API 返回值
 */
export interface UseThemeToggleReturn {
  /** 当前颜色模式 */
  currentMode: Ref<ColorMode>
  /** 切换模式 */
  toggle: () => Promise<void>
  /** 是否为浅色模式 */
  isLight: ComputedRef<boolean>
  /** 是否为深色模式 */
  isDark: ComputedRef<boolean>
}

/**
 * 主题选择器组合式 API 返回值
 */
export interface UseThemeSelectorReturn {
  /** 当前主题名称 */
  currentTheme: Ref<string>
  /** 可用主题列表 */
  availableThemes: Ref<string[]>
  /** 主题配置列表 */
  themeConfigs: ComputedRef<ThemeConfig[]>
  /** 选择主题 */
  selectTheme: (theme: string) => Promise<void>
  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>
}

/**
 * 系统主题同步组合式 API 返回值
 */
export interface UseSystemThemeSyncReturn {
  /** 系统主题 */
  systemTheme: Ref<ColorMode>
  /** 同步系统主题 */
  syncWithSystem: () => Promise<void>
  /** 是否为系统深色模式 */
  isSystemDark: ComputedRef<boolean>
  /** 是否为系统浅色模式 */
  isSystemLight: ComputedRef<boolean>
  /** 是否支持系统主题检测 */
  isSupported: ComputedRef<boolean>
}

/**
 * 颜色生成器组合式 API 返回值
 */
export interface UseColorGeneratorReturn {
  /** 生成颜色配置 */
  generateColors: (primaryColor: string) => Promise<ColorConfig>
  /** 生成颜色色阶 */
  generateColorScales: (
    colors: ColorConfig
  ) => Promise<Record<string, string[]>>
  /** 预览颜色 */
  previewColors: (primaryColor: string) => Promise<ColorConfig>
  /** 应用生成的颜色 */
  applyGeneratedColors: (
    colors: ColorConfig,
    themeName?: string
  ) => Promise<void>
  /** 是否正在生成 */
  isGenerating: Ref<boolean>
  /** 生成错误 */
  error: Ref<string | null>
}

/**
 * 性能监控组合式 API 返回值
 */
export interface UsePerformanceReturn {
  /** 主题切换耗时 */
  themeChangeTime: Ref<number>
  /** 颜色生成耗时 */
  colorGenerationTime: Ref<number>
  /** CSS注入耗时 */
  cssInjectionTime: Ref<number>
  /** 内存使用情况 */
  memoryUsage: Ref<number>
  /** 性能统计 */
  performanceStats: ComputedRef<{
    averageThemeChangeTime: number
    averageColorGenerationTime: number
    averageCssInjectionTime: number
    totalOperations: number
  }>
  /** 重置统计 */
  resetStats: () => void
}

/**
 * 主题提供者组件属性
 */
export interface ThemeProviderProps {
  /** 主题管理器实例 */
  themeManager?: ThemeManagerInstance
  /** 默认主题 */
  defaultTheme?: string
  /** 默认模式 */
  defaultMode?: ColorMode
  /** 主题配置 */
  themes?: ThemeConfig[]
  /** 是否启用系统主题同步 */
  enableSystemSync?: boolean
}

/**
 * 主题切换器组件属性
 */
export interface ThemeToggleProps {
  /** 显示文本 */
  showText?: boolean
  /** 自定义图标 */
  lightIcon?: string
  /** 深色模式图标 */
  darkIcon?: string
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 按钮变体 */
  variant?: 'button' | 'switch' | 'icon'
}

/**
 * 颜色选择器组件属性
 */
export interface ColorPickerProps {
  /** 当前颜色值 */
  modelValue?: string
  /** 是否显示预设颜色 */
  showPresets?: boolean
  /** 预设颜色列表 */
  presets?: string[]
  /** 是否显示透明度控制 */
  showAlpha?: boolean
  /** 颜色格式 */
  format?: 'hex' | 'rgb' | 'hsl'
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 主题选择器组件属性
 */
export interface ThemeSelectorProps {
  /** 显示模式 */
  mode?: 'dropdown' | 'grid' | 'list'
  /** 是否显示预览 */
  showPreview?: boolean
  /** 每行显示数量（grid模式） */
  columns?: number
  /** 是否显示主题描述 */
  showDescription?: boolean
}

/**
 * Vue 组件类型声明扩展
 */
declare module 'vue' {
  interface ComponentCustomProperties {
    $themeManager: ThemeManagerInstance
    $theme: {
      current: string
      mode: ColorMode
      setTheme: (theme: string, mode?: ColorMode) => Promise<void>
      setMode: (mode: ColorMode) => Promise<void>
      toggleMode: () => Promise<void>
    }
  }
}
