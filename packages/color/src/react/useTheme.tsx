/**
 * React Hook for theme management
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ThemeManager, ThemeState, ThemeOptions } from '../themes/themeManager'
import { presetThemes, PresetTheme } from '../themes/presets'

export interface UseThemeOptions extends ThemeOptions {
  immediate?: boolean
}

export function useTheme(options: UseThemeOptions = {}) {
  const [themeManager] = useState(() => new ThemeManager(options))
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

    // Cleanup
    return () => {
      unsubscribe()
    }
  }, [themeManager, options.immediate])

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

/**
 * Create a theme provider context
 */
import { createContext, useContext, ReactNode } from 'react'

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
  
  return (
    <ThemeContext.Provider value={theme}>
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