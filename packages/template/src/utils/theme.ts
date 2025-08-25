/**
 * 主题工具函数
 * 提供主题相关的工具函数
 */

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    error: string
    warning: string
    success: string
    info: string
  }
  typography: {
    fontFamily: string
    fontSize: {
      'xs': string
      'sm': string
      'base': string
      'lg': string
      'xl': string
      '2xl': string
      '3xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  spacing: {
    'xs': string
    'sm': string
    'md': string
    'lg': string
    'xl': string
    '2xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

/**
 * 默认浅色主题
 */
export const lightTheme: ThemeConfig = {
  name: 'light',
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    'xs': '0.25rem',
    'sm': '0.5rem',
    'md': '1rem',
    'lg': '1.5rem',
    'xl': '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
}

/**
 * 默认深色主题
 */
export const darkTheme: ThemeConfig = {
  ...lightTheme,
  name: 'dark',
  colors: {
    primary: '#60a5fa',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    error: '#f87171',
    warning: '#fbbf24',
    success: '#34d399',
    info: '#60a5fa',
  },
}

/**
 * 当前主题
 */
let currentTheme: ThemeConfig = lightTheme

/**
 * 获取当前主题
 */
export function getTheme(): ThemeConfig {
  return currentTheme
}

/**
 * 应用主题
 */
export function applyTheme(theme: ThemeConfig): void {
  currentTheme = theme

  if (typeof document !== 'undefined') {
    const root = document.documentElement

    // 应用CSS变量
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }

    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value)
      })
    }

    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--radius-${key}`, value)
      })
    }

    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value)
      })
    }

    // 设置字体
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily)
      }

      if (theme.typography.fontSize) {
        Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
          root.style.setProperty(`--text-${key}`, value)
        })
      }

      if (theme.typography.fontWeight) {
        Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
          root.style.setProperty(`--font-${key}`, value.toString())
        })
      }
    }

    // 设置主题类名
    root.className = root.className.replace(/theme-\w+/g, '')
    root.classList.add(`theme-${theme.name}`)
  }
}

/**
 * 切换主题
 */
export function toggleTheme(): void {
  const newTheme = currentTheme.name === 'light' ? darkTheme : lightTheme
  applyTheme(newTheme)
}

/**
 * 检测系统主题偏好
 */
export function detectSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

/**
 * 自动应用系统主题
 */
export function applySystemTheme(): void {
  const systemTheme = detectSystemTheme()
  const theme = systemTheme === 'dark' ? darkTheme : lightTheme
  applyTheme(theme)
}

/**
 * 创建自定义主题
 */
export function createTheme(overrides: Partial<ThemeConfig>): ThemeConfig {
  return {
    ...lightTheme,
    ...overrides,
    colors: {
      ...lightTheme.colors,
      ...overrides.colors,
    },
    typography: {
      ...lightTheme.typography,
      ...overrides.typography,
      fontSize: {
        ...lightTheme.typography.fontSize,
        ...overrides.typography?.fontSize,
      },
      fontWeight: {
        ...lightTheme.typography.fontWeight,
        ...overrides.typography?.fontWeight,
      },
    },
    spacing: {
      ...lightTheme.spacing,
      ...overrides.spacing,
    },
    borderRadius: {
      ...lightTheme.borderRadius,
      ...overrides.borderRadius,
    },
    shadows: {
      ...lightTheme.shadows,
      ...overrides.shadows,
    },
  }
}

/**
 * 获取主题颜色
 */
export function getThemeColor(colorName: keyof ThemeConfig['colors']): string {
  return currentTheme.colors[colorName]
}

/**
 * 生成主题CSS
 */
export function generateThemeCSS(theme: ThemeConfig): string {
  const cssVars = [
    ...Object.entries(theme.colors).map(([key, value]) => `  --color-${key}: ${value};`),
    ...Object.entries(theme.spacing).map(([key, value]) => `  --spacing-${key}: ${value};`),
    ...Object.entries(theme.borderRadius).map(([key, value]) => `  --radius-${key}: ${value};`),
    ...Object.entries(theme.shadows).map(([key, value]) => `  --shadow-${key}: ${value};`),
    `  --font-family: ${theme.typography.fontFamily};`,
    ...Object.entries(theme.typography.fontSize).map(([key, value]) => `  --text-${key}: ${value};`),
    ...Object.entries(theme.typography.fontWeight).map(([key, value]) => `  --font-${key}: ${value};`),
  ]

  return `.theme-${theme.name} {\n${cssVars.join('\n')}\n}`
}
