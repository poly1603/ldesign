/**
 * React 适配器类型定义
 *
 * 定义了 React 适配器中使用的所有类型接口
 *
 * @version 0.1.0
 * @author ldesign
 */

import type { ReactNode } from 'react'
import type {
  ColorConfig,
  ColorMode,
  ThemeConfig,
  ThemeManagerInstance,
  ThemeManagerOptions,
} from '../../core/types'

// ==================== Context 相关类型 ====================

/**
 * 主题 Context 值
 */
export interface ThemeContextValue {
  /** 主题管理器实例 */
  themeManager: ThemeManagerInstance
  /** 当前主题名称 */
  currentTheme: string
  /** 当前颜色模式 */
  currentMode: ColorMode
  /** 是否为深色模式 */
  isDark: boolean
  /** 是否为浅色模式 */
  isLight: boolean
  /** 可用主题列表 */
  availableThemes: string[]
  /** 当前主题配置 */
  currentThemeConfig?: ThemeConfig
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
 * ThemeProvider 组件属性
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
  /** 子组件 */
  children: ReactNode
  /** 主题管理器配置选项 */
  options?: ThemeManagerOptions
}

// ==================== Hooks 返回类型 ====================

/**
 * useTheme Hook 返回值
 */
export interface UseThemeReturn {
  /** 主题管理器实例 */
  themeManager: ThemeManagerInstance
  /** 当前主题名称 */
  currentTheme: string
  /** 当前颜色模式 */
  currentMode: ColorMode
  /** 是否为深色模式 */
  isDark: boolean
  /** 是否为浅色模式 */
  isLight: boolean
  /** 可用主题列表 */
  availableThemes: string[]
  /** 当前主题配置 */
  currentThemeConfig?: ThemeConfig
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
 * useThemeToggle Hook 返回值
 */
export interface UseThemeToggleReturn {
  /** 当前颜色模式 */
  currentMode: ColorMode
  /** 切换模式 */
  toggle: () => Promise<void>
  /** 是否为浅色模式 */
  isLight: boolean
  /** 是否为深色模式 */
  isDark: boolean
}

/**
 * useThemeSelector Hook 返回值
 */
export interface UseThemeSelectorReturn {
  /** 当前主题名称 */
  currentTheme: string
  /** 可用主题列表 */
  availableThemes: string[]
  /** 主题配置列表 */
  themeConfigs: ThemeConfig[]
  /** 选择主题 */
  selectTheme: (theme: string) => Promise<void>
  /** 设置主题 */
  setTheme: (theme: string, mode?: ColorMode) => Promise<void>
}

/**
 * useSystemThemeSync Hook 返回值
 */
export interface UseSystemThemeSyncReturn {
  /** 系统主题 */
  systemTheme: ColorMode
  /** 同步系统主题 */
  syncWithSystem: () => Promise<void>
  /** 是否为系统深色模式 */
  isSystemDark: boolean
  /** 是否为系统浅色模式 */
  isSystemLight: boolean
  /** 是否支持系统主题检测 */
  isSupported: boolean
}

/**
 * useColorGenerator Hook 返回值
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
  isGenerating: boolean
  /** 生成错误 */
  error: string | null
}

/**
 * usePerformance Hook 返回值
 */
export interface UsePerformanceReturn {
  /** 主题切换耗时 */
  themeChangeTime: number
  /** 颜色生成耗时 */
  colorGenerationTime: number
  /** CSS注入耗时 */
  cssInjectionTime: number
  /** 内存使用情况 */
  memoryUsage: number
  /** 性能统计 */
  performanceStats: {
    averageThemeChangeTime: number
    averageColorGenerationTime: number
    averageCssInjectionTime: number
    totalOperations: number
  }
  /** 重置统计 */
  resetStats: () => void
}

// ==================== 组件属性类型 ====================

/**
 * ThemeToggle 组件属性
 */
export interface ThemeToggleProps {
  /** 显示文本 */
  showText?: boolean
  /** 自定义图标 */
  lightIcon?: ReactNode
  /** 深色模式图标 */
  darkIcon?: ReactNode
  /** 按钮大小 */
  size?: 'small' | 'medium' | 'large'
  /** 按钮变体 */
  variant?: 'button' | 'switch' | 'icon'
  /** 自定义样式类名 */
  className?: string
  /** 点击事件回调 */
  onClick?: () => void
}

/**
 * ThemeSelector 组件属性
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
  /** 自定义样式类名 */
  className?: string
  /** 选择主题回调 */
  onThemeSelect?: (theme: string) => void
}

/**
 * ColorPicker 组件属性
 */
export interface ColorPickerProps {
  /** 当前颜色值 */
  value?: string
  /** 默认颜色值 */
  defaultValue?: string
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
  /** 自定义样式类名 */
  className?: string
  /** 颜色变化回调 */
  onChange?: (color: string) => void
  /** 颜色确认回调 */
  onConfirm?: (color: string) => void
  /** 取消回调 */
  onCancel?: () => void
}
