/**
 * 主题管理器
 * 负责主题的切换、应用和管理
 */

import type { ThemeConfig } from '../types'

export type ThemeName = 'default' | 'dark' | 'minimal' | 'colorful' | 'high-contrast'

export interface ThemeOption {
  /** 主题名称 */
  name: ThemeName
  /** 显示标签 */
  label: string
  /** 主题描述 */
  description?: string
  /** 主题配置 */
  config: ThemeConfig
}

export class ThemeManager {
  /** 当前主题 */
  private currentTheme: ThemeName = 'default'
  
  /** 主题配置映射 */
  private themes: Map<ThemeName, ThemeOption> = new Map()
  
  /** 主题变化监听器 */
  private listeners: Set<(theme: ThemeName) => void> = new Set()

  constructor() {
    this.initializeDefaultThemes()
    this.detectSystemTheme()
  }

  /**
   * 初始化默认主题
   */
  private initializeDefaultThemes(): void {
    // 默认主题
    this.themes.set('default', {
      name: 'default',
      label: '默认',
      description: '默认浅色主题',
      config: {
        primaryColor: 'var(--ldesign-brand-color)',
        borderColor: 'var(--ldesign-border-color)',
        backgroundColor: 'var(--ldesign-bg-color-container)',
        textColor: 'var(--ldesign-text-color-primary)',
        borderRadius: 'var(--ls-border-radius-base)',
        boxShadow: 'var(--ldesign-shadow-1)',
        successColor: 'var(--ldesign-success-color)',
        errorColor: 'var(--ldesign-error-color)',
        warningColor: 'var(--ldesign-warning-color)'
      }
    })

    // 暗色主题
    this.themes.set('dark', {
      name: 'dark',
      label: '暗色',
      description: '暗色主题',
      config: {
        primaryColor: '#4096ff',
        borderColor: '#424242',
        backgroundColor: '#1f1f1f',
        textColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 'var(--ls-border-radius-base)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        successColor: '#52c41a',
        errorColor: '#ff4d4f',
        warningColor: '#faad14'
      }
    })

    // 简约主题
    this.themes.set('minimal', {
      name: 'minimal',
      label: '简约',
      description: '简约风格主题',
      config: {
        primaryColor: '#000000',
        borderColor: '#e0e0e0',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        borderRadius: '2px',
        boxShadow: 'none',
        successColor: '#4caf50',
        errorColor: '#f44336',
        warningColor: '#ff9800'
      }
    })

    // 彩色主题
    this.themes.set('colorful', {
      name: 'colorful',
      label: '彩色',
      description: '彩色渐变主题',
      config: {
        primaryColor: '#ff6b6b',
        borderColor: '#ffeaa7',
        backgroundColor: '#ffffff',
        textColor: '#2d3436',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(255, 107, 107, 0.15)',
        successColor: '#00b894',
        errorColor: '#e17055',
        warningColor: '#fdcb6e'
      }
    })

    // 高对比度主题
    this.themes.set('high-contrast', {
      name: 'high-contrast',
      label: '高对比度',
      description: '高对比度主题（无障碍）',
      config: {
        primaryColor: '#0000ff',
        borderColor: '#000000',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        borderRadius: '0',
        boxShadow: 'none',
        successColor: '#008000',
        errorColor: '#ff0000',
        warningColor: '#ff8000'
      }
    })
  }

  /**
   * 检测系统主题
   */
  private detectSystemTheme(): void {
    if (typeof window === 'undefined') return

    // 检测暗色模式
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (darkModeQuery.matches) {
      this.currentTheme = 'dark'
    }

    // 检测高对比度模式
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    if (highContrastQuery.matches) {
      this.currentTheme = 'high-contrast'
    }

    // 监听系统主题变化
    darkModeQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.setTheme('dark')
      } else {
        this.setTheme('default')
      }
    })

    highContrastQuery.addEventListener('change', (e) => {
      if (e.matches) {
        this.setTheme('high-contrast')
      }
    })
  }

  /**
   * 设置主题
   * @param theme 主题名称
   */
  setTheme(theme: ThemeName): void {
    if (!this.themes.has(theme)) {
      console.warn(`[ThemeManager] 未知主题: ${theme}`)
      return
    }

    this.currentTheme = theme
    this.applyTheme(theme)
    this.notifyListeners(theme)

    // 保存到本地存储
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ldesign-captcha-theme', theme)
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeName {
    return this.currentTheme
  }

  /**
   * 获取主题配置
   * @param theme 主题名称
   */
  getThemeConfig(theme?: ThemeName): ThemeConfig | null {
    const themeName = theme || this.currentTheme
    const themeOption = this.themes.get(themeName)
    return themeOption ? themeOption.config : null
  }

  /**
   * 获取所有主题选项
   */
  getAllThemes(): ThemeOption[] {
    return Array.from(this.themes.values())
  }

  /**
   * 注册自定义主题
   * @param theme 主题选项
   */
  registerTheme(theme: ThemeOption): void {
    this.themes.set(theme.name, theme)
  }

  /**
   * 应用主题到元素
   * @param theme 主题名称
   * @param element 目标元素（可选，默认为document.documentElement）
   */
  applyTheme(theme: ThemeName, element?: HTMLElement): void {
    const target = element || document.documentElement
    const themeConfig = this.getThemeConfig(theme)

    if (!themeConfig) {
      return
    }

    // 移除所有主题类
    this.themes.forEach((_, themeName) => {
      target.classList.remove(`ldesign-captcha-theme-${themeName}`)
    })

    // 添加当前主题类
    target.classList.add(`ldesign-captcha-theme-${theme}`)

    // 应用CSS变量
    Object.entries(themeConfig).forEach(([key, value]) => {
      if (value) {
        target.style.setProperty(`--captcha-${key}`, value)
      }
    })
  }

  /**
   * 应用主题到验证码元素
   * @param element 验证码元素
   * @param theme 主题名称（可选）
   */
  applyToElement(element: HTMLElement, theme?: ThemeName): void {
    const themeName = theme || this.currentTheme
    this.applyTheme(themeName, element)
  }

  /**
   * 从本地存储加载主题
   */
  loadThemeFromStorage(): void {
    if (typeof localStorage === 'undefined') return

    const savedTheme = localStorage.getItem('ldesign-captcha-theme') as ThemeName
    if (savedTheme && this.themes.has(savedTheme)) {
      this.setTheme(savedTheme)
    }
  }

  /**
   * 添加主题变化监听器
   * @param listener 监听器函数
   */
  onThemeChange(listener: (theme: ThemeName) => void): void {
    this.listeners.add(listener)
  }

  /**
   * 移除主题变化监听器
   * @param listener 监听器函数
   */
  offThemeChange(listener: (theme: ThemeName) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 通知所有监听器
   * @param theme 当前主题
   */
  private notifyListeners(theme: ThemeName): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme)
      } catch (error) {
        console.error('[ThemeManager] 监听器执行错误:', error)
      }
    })
  }

  /**
   * 创建主题切换器元素
   * @param container 容器元素
   */
  createThemeSwitcher(container: HTMLElement): HTMLElement {
    const switcher = document.createElement('div')
    switcher.className = 'ldesign-captcha-theme-switcher'

    this.themes.forEach(theme => {
      const option = document.createElement('button')
      option.className = 'theme-option'
      option.textContent = theme.label
      option.title = theme.description || theme.label

      if (theme.name === this.currentTheme) {
        option.classList.add('active')
      }

      option.addEventListener('click', () => {
        this.setTheme(theme.name)
        
        // 更新按钮状态
        switcher.querySelectorAll('.theme-option').forEach(btn => {
          btn.classList.remove('active')
        })
        option.classList.add('active')
      })

      switcher.appendChild(option)
    })

    container.appendChild(switcher)
    return switcher
  }

  /**
   * 销毁主题管理器
   */
  destroy(): void {
    this.listeners.clear()
  }
}

// 创建默认主题管理器实例
export const defaultThemeManager = new ThemeManager()
