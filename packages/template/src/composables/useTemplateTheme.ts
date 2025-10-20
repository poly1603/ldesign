/**
 * 模板主题系统
 * 
 * 支持多主题切换、自定义主题、主题继承等功能
 */

import type { InjectionKey, Ref } from 'vue'
import { computed, inject, provide, readonly, ref } from 'vue'

/**
 * 主题配置
 */
export interface TemplateTheme {
  name: string
  displayName?: string
  colors: {
    primary: string
    secondary?: string
    success?: string
    warning?: string
    error?: string
    info?: string
    background?: string
    surface?: string
    text?: string
    textSecondary?: string
    border?: string
    [key: string]: string | undefined
  }
  fonts?: {
    primary?: string
    secondary?: string
    mono?: string
    [key: string]: string | undefined
  }
  spacing?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    [key: string]: string | undefined
  }
  borderRadius?: {
    none?: string
    sm?: string
    md?: string
    lg?: string
    full?: string
    [key: string]: string | undefined
  }
  shadows?: {
    none?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    [key: string]: string | undefined
  }
  breakpoints?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    [key: string]: string | undefined
  }
  transitions?: {
    fast?: string
    normal?: string
    slow?: string
    [key: string]: string | undefined
  }
  extends?: string // 继承自哪个主题
  cssVars?: Record<string, string> // 自定义CSS变量
}

/**
 * 预设主题
 */
export const PRESET_THEMES: Record<string, TemplateTheme> = {
  light: {
    name: 'light',
    displayName: 'Light',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#48bb78',
      warning: '#f6ad55',
      error: '#f56565',
      info: '#4299e1',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#1a202c',
      textSecondary: '#718096',
      border: '#e2e8f0'
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      none: 'none',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    },
    transitions: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out'
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    extends: 'light',
    colors: {
      primary: '#9f7aea',
      secondary: '#975ba5',
      success: '#68d391',
      warning: '#fbb040',
      error: '#fc8181',
      info: '#63b3ed',
      background: '#1a202c',
      surface: '#2d3748',
      text: '#f7fafc',
      textSecondary: '#cbd5e0',
      border: '#4a5568'
    }
  },
  blue: {
    name: 'blue',
    displayName: 'Blue Ocean',
    extends: 'light',
    colors: {
      primary: '#3182ce',
      secondary: '#2c5282',
      success: '#38a169',
      warning: '#d69e2e',
      error: '#e53e3e',
      info: '#3182ce',
      background: '#f0f4f8',
      surface: '#ffffff',
      text: '#2d3748',
      textSecondary: '#4a5568',
      border: '#cbd5e0'
    }
  },
  green: {
    name: 'green',
    displayName: 'Forest Green',
    extends: 'light',
    colors: {
      primary: '#48bb78',
      secondary: '#38a169',
      success: '#48bb78',
      warning: '#ed8936',
      error: '#f56565',
      info: '#4299e1',
      background: '#f0fff4',
      surface: '#ffffff',
      text: '#1a202c',
      textSecondary: '#2d3748',
      border: '#9ae6b4'
    }
  }
}

/**
 * 主题上下文
 */
export interface ThemeContext {
  currentTheme: Ref<string>
  themes: Map<string, TemplateTheme>
  setTheme: (themeName: string) => void
  registerTheme: (theme: TemplateTheme) => void
  createCustomTheme: (name: string, overrides: Partial<TemplateTheme>) => TemplateTheme
  applyTheme: (theme: TemplateTheme) => void
  getTheme: (name: string) => TemplateTheme | undefined
  removeTheme: (name: string) => boolean
}

const ThemeContextKey: InjectionKey<ThemeContext> = Symbol('TemplateThemeContext')

/**
 * 创建主题管理器
 */
export function createThemeManager(defaultTheme: string = 'light') {
  const themes = new Map<string, TemplateTheme>()
  const currentTheme = ref(defaultTheme)
  const appliedTheme = ref<TemplateTheme | null>(null)
  
  // 注册预设主题
  Object.values(PRESET_THEMES).forEach(theme => {
    themes.set(theme.name, theme)
  })
  
  /**
   * 解析主题（处理继承）
   */
  const resolveTheme = (theme: TemplateTheme): TemplateTheme => {
    if (!theme.extends) return theme
    
    const parentTheme = themes.get(theme.extends)
    if (!parentTheme) return theme
    
    const resolvedParent = resolveTheme(parentTheme)
    
    return {
      ...resolvedParent,
      ...theme,
      colors: { ...resolvedParent.colors, ...theme.colors },
      fonts: { ...resolvedParent.fonts, ...theme.fonts },
      spacing: { ...resolvedParent.spacing, ...theme.spacing },
      borderRadius: { ...resolvedParent.borderRadius, ...theme.borderRadius },
      shadows: { ...resolvedParent.shadows, ...theme.shadows },
      breakpoints: { ...resolvedParent.breakpoints, ...theme.breakpoints },
      transitions: { ...resolvedParent.transitions, ...theme.transitions },
      cssVars: { ...resolvedParent.cssVars, ...theme.cssVars }
    }
  }
  
  /**
   * 应用主题到DOM
   */
  const applyTheme = (theme: TemplateTheme) => {
    const resolved = resolveTheme(theme)
    appliedTheme.value = resolved
    
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    // 应用颜色
    Object.entries(resolved.colors).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-color-${key}`, value)
    })
    
    // 应用字体
    Object.entries(resolved.fonts || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-font-${key}`, value)
    })
    
    // 应用间距
    Object.entries(resolved.spacing || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-spacing-${key}`, value)
    })
    
    // 应用圆角
    Object.entries(resolved.borderRadius || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-radius-${key}`, value)
    })
    
    // 应用阴影
    Object.entries(resolved.shadows || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-shadow-${key}`, value)
    })
    
    // 应用过渡
    Object.entries(resolved.transitions || {}).forEach(([key, value]) => {
      if (value) root.style.setProperty(`--template-transition-${key}`, value)
    })
    
    // 应用自定义CSS变量
    Object.entries(resolved.cssVars || {}).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    
    // 设置主题属性
    root.setAttribute('data-template-theme', resolved.name)
  }
  
  /**
   * 设置当前主题
   */
  const setTheme = (themeName: string) => {
    const theme = themes.get(themeName)
    if (!theme) {
      console.warn(`Theme "${themeName}" not found`)
      return
    }
    
    currentTheme.value = themeName
    applyTheme(theme)
    
    // 保存到localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('template-theme', themeName)
    }
  }
  
  /**
   * 注册新主题
   */
  const registerTheme = (theme: TemplateTheme) => {
    themes.set(theme.name, theme)
  }
  
  /**
   * 创建自定义主题
   */
  const createCustomTheme = (
    name: string,
    overrides: Partial<TemplateTheme>
  ): TemplateTheme => {
    const baseTheme = themes.get(overrides.extends || 'light') || PRESET_THEMES.light
    
    const customTheme: TemplateTheme = {
      ...baseTheme,
      ...overrides,
      name,
      colors: { ...baseTheme.colors, ...overrides.colors },
      fonts: { ...baseTheme.fonts, ...overrides.fonts },
      spacing: { ...baseTheme.spacing, ...overrides.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
      shadows: { ...baseTheme.shadows, ...overrides.shadows },
      breakpoints: { ...baseTheme.breakpoints, ...overrides.breakpoints },
      transitions: { ...baseTheme.transitions, ...overrides.transitions },
      cssVars: { ...baseTheme.cssVars, ...overrides.cssVars }
    }
    
    registerTheme(customTheme)
    return customTheme
  }
  
  /**
   * 获取主题
   */
  const getTheme = (name: string): TemplateTheme | undefined => {
    return themes.get(name)
  }
  
  /**
   * 移除主题
   */
  const removeTheme = (name: string): boolean => {
    if (PRESET_THEMES[name]) {
      console.warn(`Cannot remove preset theme "${name}"`)
      return false
    }
    return themes.delete(name)
  }
  
  // 初始化：从localStorage恢复主题
  if (typeof localStorage !== 'undefined') {
    const savedTheme = localStorage.getItem('template-theme')
    if (savedTheme && themes.has(savedTheme)) {
      setTheme(savedTheme)
    } else {
      setTheme(defaultTheme)
    }
  } else {
    setTheme(defaultTheme)
  }
  
  // 监听系统主题变化
  let darkModeQuery: MediaQueryList | null = null
  let handleSystemThemeChange: ((e: MediaQueryListEvent) => void) | null = null
  
  if (typeof window !== 'undefined' && window.matchMedia) {
    darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (currentTheme.value === 'auto') {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    darkModeQuery.addEventListener('change', handleSystemThemeChange)
  }
  
  // 清理函数
  const cleanup = () => {
    if (darkModeQuery && handleSystemThemeChange) {
      darkModeQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }
  
  return {
    currentTheme: readonly(currentTheme),
    themes,
    setTheme,
    registerTheme,
    createCustomTheme,
    applyTheme,
    getTheme,
    removeTheme,
    appliedTheme: readonly(appliedTheme),
    cleanup
  }
}

/**
 * 使用模板主题
 */
export function useTemplateTheme() {
  let context = inject<ThemeContext | undefined>(ThemeContextKey, undefined)
  
  if (!context) {
    // 创建默认主题管理器
    const manager = createThemeManager()
    context = {
      currentTheme: manager.currentTheme as Ref<string>,
      themes: manager.themes,
      setTheme: manager.setTheme,
      registerTheme: manager.registerTheme,
      createCustomTheme: manager.createCustomTheme,
      applyTheme: manager.applyTheme,
      getTheme: manager.getTheme,
      removeTheme: manager.removeTheme
    }
  }
  
  const isDark = computed(() => context!.currentTheme.value === 'dark')
  const isLight = computed(() => context!.currentTheme.value === 'light')
  
  const toggleTheme = () => {
    context!.setTheme(isDark.value ? 'light' : 'dark')
  }
  
  const currentThemeConfig = computed(() => {
    return context!.getTheme(context!.currentTheme.value)
  })
  
  return {
    ...context,
    isDark,
    isLight,
    toggleTheme,
    currentThemeConfig
  }
}

/**
 * 提供主题上下文
 */
export function provideTemplateTheme(defaultTheme?: string) {
  const manager = createThemeManager(defaultTheme)
  
  const context: ThemeContext = {
    currentTheme: manager.currentTheme as Ref<string>,
    themes: manager.themes,
    setTheme: manager.setTheme,
    registerTheme: manager.registerTheme,
    createCustomTheme: manager.createCustomTheme,
    applyTheme: manager.applyTheme,
    getTheme: manager.getTheme,
    removeTheme: manager.removeTheme
  }
  
  provide(ThemeContextKey, context)
  
  return context
}