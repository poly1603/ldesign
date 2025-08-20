import { ref, computed, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import type { ThemeConfig, UseThemeReturn } from '../types'

// 默认主题配置
const defaultLightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#1976d2',
    secondary: '#424242',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',
    border: '#e0e0e0',
    accent: '#2196f3'
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: '4px',
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    medium: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    large: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)'
  }
}

const defaultDarkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '#90caf9',
    secondary: '#b0bec5',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    border: '#333333',
    accent: '#64b5f6'
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: {
      small: '12px',
      medium: '14px',
      large: '16px'
    }
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: '4px',
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
    medium: '0 3px 6px rgba(0,0,0,0.6), 0 3px 6px rgba(0,0,0,0.7)',
    large: '0 10px 20px rgba(0,0,0,0.7), 0 6px 6px rgba(0,0,0,0.8)'
  }
}

// 存储键名
const THEME_STORAGE_KEY = 'pdf-viewer-theme'
const THEME_CONFIG_STORAGE_KEY = 'pdf-viewer-theme-config'

/**
 * 主题管理组合式函数
 * @param initialTheme 初始主题
 * @param customConfig 自定义主题配置
 * @returns 主题状态和方法
 */
export function useTheme(
  initialTheme: 'light' | 'dark' | 'auto' = 'auto',
  customConfig?: Partial<ThemeConfig>
): UseThemeReturn {
  // 响应式状态
  const theme = ref<'light' | 'dark' | 'auto'>(initialTheme)
  const customThemeConfig = ref<Partial<ThemeConfig>>(customConfig || {})
  
  // 系统主题检测
  const systemPrefersDark = ref(false)
  
  // 计算当前实际主题
  const actualTheme = computed(() => {
    if (theme.value === 'auto') {
      return systemPrefersDark.value ? 'dark' : 'light'
    }
    return theme.value
  })
  
  // 是否为深色主题
  const isDark = computed(() => actualTheme.value === 'dark')
  
  // 当前主题配置
  const themeConfig = computed<ThemeConfig>(() => {
    const baseConfig = isDark.value ? defaultDarkTheme : defaultLightTheme
    return mergeThemeConfig(baseConfig, customThemeConfig.value)
  })

  /**
   * 合并主题配置
   */
  const mergeThemeConfig = (base: ThemeConfig, custom: Partial<ThemeConfig>): ThemeConfig => {
    return {
      ...base,
      ...custom,
      colors: {
        ...base.colors,
        ...custom.colors
      },
      fonts: {
        ...base.fonts,
        ...custom.fonts,
        size: {
          ...base.fonts.size,
          ...custom.fonts?.size
        }
      },
      spacing: {
        ...base.spacing,
        ...custom.spacing
      },
      shadows: {
        ...base.shadows,
        ...custom.shadows
      }
    }
  }

  /**
   * 检测系统主题偏好
   */
  const detectSystemTheme = () => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      systemPrefersDark.value = mediaQuery.matches
      
      // 监听系统主题变化
      const handleChange = (e: MediaQueryListEvent) => {
        systemPrefersDark.value = e.matches
      }
      
      mediaQuery.addEventListener('change', handleChange)
      
      // 返回清理函数
      return () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    }
    
    return () => {}
  }

  /**
   * 设置主题
   */
  const setTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    theme.value = newTheme
    saveThemeToStorage(newTheme)
    applyThemeToDocument()
  }

  /**
   * 切换主题
   */
  const toggleTheme = () => {
    if (theme.value === 'auto') {
      setTheme('light')
    } else if (theme.value === 'light') {
      setTheme('dark')
    } else {
      setTheme('auto')
    }
  }

  /**
   * 更新自定义主题配置
   */
  const updateThemeConfig = (config: Partial<ThemeConfig>) => {
    customThemeConfig.value = {
      ...customThemeConfig.value,
      ...config
    }
    saveThemeConfigToStorage(customThemeConfig.value)
    applyThemeToDocument()
  }

  /**
   * 重置主题配置
   */
  const resetThemeConfig = () => {
    customThemeConfig.value = {}
    removeThemeConfigFromStorage()
    applyThemeToDocument()
  }

  /**
   * 应用主题到文档
   */
  const applyThemeToDocument = () => {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    const config = themeConfig.value
    
    // 设置CSS自定义属性
    root.style.setProperty('--pdf-theme-mode', config.mode)
    
    // 颜色变量
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--pdf-color-${key}`, value)
    })
    
    // 字体变量
    root.style.setProperty('--pdf-font-family', config.fonts.family)
    Object.entries(config.fonts.size).forEach(([key, value]) => {
      root.style.setProperty(`--pdf-font-size-${key}`, value)
    })
    
    // 间距变量
    Object.entries(config.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--pdf-spacing-${key}`, value)
    })
    
    // 其他变量
    root.style.setProperty('--pdf-border-radius', config.borderRadius)
    Object.entries(config.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--pdf-shadow-${key}`, value)
    })
    
    // 设置主题类名
    root.classList.remove('pdf-theme-light', 'pdf-theme-dark')
    root.classList.add(`pdf-theme-${actualTheme.value}`)
    
    // 设置颜色方案
    root.style.colorScheme = actualTheme.value
  }

  /**
   * 从存储加载主题
   */
  const loadThemeFromStorage = (): 'light' | 'dark' | 'auto' => {
    if (typeof localStorage === 'undefined') return 'auto'
    
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY)
      if (stored && ['light', 'dark', 'auto'].includes(stored)) {
        return stored as 'light' | 'dark' | 'auto'
      }
    } catch (error) {
      console.warn('加载主题设置失败:', error)
    }
    
    return 'auto'
  }

  /**
   * 保存主题到存储
   */
  const saveThemeToStorage = (themeValue: 'light' | 'dark' | 'auto') => {
    if (typeof localStorage === 'undefined') return
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, themeValue)
    } catch (error) {
      console.warn('保存主题设置失败:', error)
    }
  }

  /**
   * 从存储加载主题配置
   */
  const loadThemeConfigFromStorage = (): Partial<ThemeConfig> => {
    if (typeof localStorage === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(THEME_CONFIG_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.warn('加载主题配置失败:', error)
    }
    
    return {}
  }

  /**
   * 保存主题配置到存储
   */
  const saveThemeConfigToStorage = (config: Partial<ThemeConfig>) => {
    if (typeof localStorage === 'undefined') return
    
    try {
      localStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.warn('保存主题配置失败:', error)
    }
  }

  /**
   * 从存储移除主题配置
   */
  const removeThemeConfigFromStorage = () => {
    if (typeof localStorage === 'undefined') return
    
    try {
      localStorage.removeItem(THEME_CONFIG_STORAGE_KEY)
    } catch (error) {
      console.warn('移除主题配置失败:', error)
    }
  }

  /**
   * 获取主题CSS变量
   */
  const getThemeCssVariables = (): Record<string, string> => {
    const config = themeConfig.value
    const variables: Record<string, string> = {}
    
    // 颜色变量
    Object.entries(config.colors).forEach(([key, value]) => {
      variables[`--pdf-color-${key}`] = value
    })
    
    // 字体变量
    variables['--pdf-font-family'] = config.fonts.family
    Object.entries(config.fonts.size).forEach(([key, value]) => {
      variables[`--pdf-font-size-${key}`] = value
    })
    
    // 间距变量
    Object.entries(config.spacing).forEach(([key, value]) => {
      variables[`--pdf-spacing-${key}`] = value
    })
    
    // 其他变量
    variables['--pdf-border-radius'] = config.borderRadius
    Object.entries(config.shadows).forEach(([key, value]) => {
      variables[`--pdf-shadow-${key}`] = value
    })
    
    return variables
  }

  /**
   * 导出主题配置
   */
  const exportThemeConfig = (): string => {
    return JSON.stringify({
      theme: theme.value,
      customConfig: customThemeConfig.value
    }, null, 2)
  }

  /**
   * 导入主题配置
   */
  const importThemeConfig = (configJson: string): boolean => {
    try {
      const config = JSON.parse(configJson)
      
      if (config.theme && ['light', 'dark', 'auto'].includes(config.theme)) {
        setTheme(config.theme)
      }
      
      if (config.customConfig) {
        updateThemeConfig(config.customConfig)
      }
      
      return true
    } catch (error) {
      console.error('导入主题配置失败:', error)
      return false
    }
  }

  // 初始化
  onMounted(() => {
    // 检测系统主题
    const cleanupSystemTheme = detectSystemTheme()
    
    // 加载保存的主题设置
    const savedTheme = loadThemeFromStorage()
    const savedConfig = loadThemeConfigFromStorage()
    
    theme.value = savedTheme
    customThemeConfig.value = savedConfig
    
    // 应用主题
    applyThemeToDocument()
    
    // 监听主题变化
    watch([actualTheme, themeConfig], () => {
      applyThemeToDocument()
    }, { immediate: false })
    
    // 组件卸载时清理
    return () => {
      cleanupSystemTheme()
    }
  })

  return {
    // 状态
    theme,
    isDark,
    actualTheme,
    themeConfig,
    systemPrefersDark,
    
    // 方法
    setTheme,
    toggleTheme,
    updateThemeConfig,
    resetThemeConfig,
    applyThemeToDocument,
    getThemeCssVariables,
    exportThemeConfig,
    importThemeConfig
  }
}

/**
 * 主题提供者组合式函数
 * 用于在应用根部提供主题上下文
 */
export function useThemeProvider(initialTheme?: 'light' | 'dark' | 'auto') {
  const themeManager = useTheme(initialTheme)
  
  // 提供主题上下文
  const provideTheme = () => {
    // 这里可以使用Vue的provide/inject机制
    // provide('theme', themeManager)
  }
  
  return {
    ...themeManager,
    provideTheme
  }
}

/**
 * 主题消费者组合式函数
 * 用于在子组件中消费主题上下文
 */
export function useThemeConsumer() {
  // 这里可以使用Vue的inject机制
  // const theme = inject('theme')
  // return theme
  
  // 临时返回默认主题管理器
  return useTheme()
}