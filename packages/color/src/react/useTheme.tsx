/**
 * React Hook for theme management
 */

/**
 * Create a theme provider context
 */
import type { ReactNode } from 'react';
import type { PresetTheme } from '../themes/presets';
import type { ThemeOptions, ThemeState } from '../themes/themeManager';
import { createContext, useCallback, useContext, useEffect, useMemo, useState  } from 'react'


import { presetThemes } from '../themes/presets'
import { ThemeManager } from '../themes/themeManager'

export interface UseThemeOptions extends ThemeOptions {
  immediate?: boolean
}

export function useTheme(options: UseThemeOptions = {}) {
  // 使用 useMemo 创建稳定的 ThemeManager 实例
  const themeManager = useMemo(() => new ThemeManager(options), [])
  const [currentTheme, setCurrentTheme] = useState<ThemeState | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Memoized values
  const primaryColor = useMemo(() => currentTheme?.primaryColor || '', [currentTheme])
  const themeName = useMemo(() => currentTheme?.themeName || '', [currentTheme])
  const isDark = useMemo(() => currentTheme?.isDark || false, [currentTheme])

  // Apply theme
  const applyTheme = useCallback(async (colorOrName: string, themeOptions?: ThemeOptions) => {
    setIsLoading(true)
    try {
      const theme = themeManager.applyTheme(colorOrName, themeOptions)
      setCurrentTheme(theme)
      return theme
    } finally {
      setIsLoading(false)
    }
  }, [themeManager])

  // Apply preset theme
  const applyPresetTheme = useCallback(async (name: string, themeOptions?: ThemeOptions) => {
    setIsLoading(true)
    try {
      const theme = themeManager.applyPresetTheme(name, themeOptions)
      setCurrentTheme(theme)
      return theme
    } finally {
      setIsLoading(false)
    }
  }, [themeManager])

  // Restore theme
  const restoreTheme = useCallback(() => {
    const theme = themeManager.restore()
    if (theme) {
      setCurrentTheme(theme)
    }
    return theme
  }, [themeManager])

  // Clear theme
  const clearTheme = useCallback(() => {
    themeManager.clear()
    setCurrentTheme(null)
  }, [themeManager])

  // Get current theme
  const getCurrentTheme = useCallback(() => {
    const theme = themeManager.getCurrentTheme()
    setCurrentTheme(theme)
    return theme
  }, [themeManager])

  // Initialize and subscribe to theme changes
  useEffect(() => {
    // Restore or get current theme on mount
    if (options.immediate !== false) {
      const theme = themeManager.getCurrentTheme() || themeManager.restore()
      if (theme) {
        setCurrentTheme(theme)
      }
    }

    // Subscribe to theme changes
    const unsubscribe = themeManager.onChange((theme) => {
      setCurrentTheme(theme)
    })

    // Cleanup - 销毁 themeManager 以防止内存泄漏
    return () => {
      unsubscribe()
      // 组件卸载时销毁 themeManager
      if (themeManager && typeof themeManager.destroy === 'function') {
        themeManager.destroy()
      }
    }
  }, []) // 移除依赖项，只在挂载时执行一次

  return {
    // State
    currentTheme,
    presets: presetThemes,
    isLoading,
    // Computed values
    primaryColor,
    themeName,
    isDark,
    // Methods
    applyTheme,
    applyPresetTheme,
    restoreTheme,
    clearTheme,
    getCurrentTheme
  }
}

interface ThemeContextValue {
  currentTheme: ThemeState | null
  presets: PresetTheme[]
  isLoading: boolean
  primaryColor: string
  themeName: string
  isDark: boolean
  applyTheme: (colorOrName: string, options?: ThemeOptions) => Promise<ThemeState>
  applyPresetTheme: (name: string, options?: ThemeOptions) => Promise<ThemeState>
  restoreTheme: () => ThemeState | null
  clearTheme: () => void
  getCurrentTheme: () => ThemeState | null
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: ReactNode
  options?: UseThemeOptions
}

export function ThemeProvider({ children, options = {} }: ThemeProviderProps) {
  const theme = useTheme(options)
  
  // 使用 memo 优化，防止不必要的重新渲染
  const contextValue = useMemo(() => theme, [
    theme.currentTheme,
    theme.isLoading,
    theme.primaryColor,
    theme.themeName,
    theme.isDark,
    theme.applyTheme,
    theme.applyPresetTheme,
    theme.restoreTheme,
    theme.clearTheme,
    theme.getCurrentTheme
  ])
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}