/**
 * 主题管理器
 */

import type { ThemeType } from '../types'
import { DOMUtils } from '../utils/dom'

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
    hover: string
    selected: string
    today: string
    weekend: string
    holiday: string
    disabled: string
    error: string
    warning: string
    success: string
    info: string
  }
  fonts: {
    family: string
    size: {
      small: string
      medium: string
      large: string
      xlarge: string
    }
    weight: {
      normal: string
      medium: string
      bold: string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    small: string
    medium: string
    large: string
  }
  shadows: {
    small: string
    medium: string
    large: string
  }
  transitions: {
    fast: string
    medium: string
    slow: string
  }
}

/**
 * 默认主题
 */
const defaultTheme: ThemeConfig = {
  name: 'default',
  colors: {
    primary: '#722ED1',
    secondary: '#B37FEB',
    background: '#ffffff',
    surface: '#fafafa',
    text: '#262626',
    textSecondary: '#8c8c8c',
    border: '#d9d9d9',
    hover: '#f5f5f5',
    selected: '#e6f7ff',
    today: '#1890ff',
    weekend: '#ff7875',
    holiday: '#52c41a',
    disabled: '#f5f5f5',
    error: '#ff4d4f',
    warning: '#faad14',
    success: '#52c41a',
    info: '#1890ff'
  },
  fonts: {
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    size: {
      small: '12px',
      medium: '14px',
      large: '16px',
      xlarge: '18px'
    },
    weight: {
      normal: '400',
      medium: '500',
      bold: '600'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px'
  },
  borderRadius: {
    small: '2px',
    medium: '4px',
    large: '8px'
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.12)',
    large: '0 8px 16px rgba(0, 0, 0, 0.12)'
  },
  transitions: {
    fast: '0.15s ease-in-out',
    medium: '0.3s ease-in-out',
    slow: '0.5s ease-in-out'
  }
}

/**
 * 暗色主题
 */
const darkTheme: ThemeConfig = {
  ...defaultTheme,
  name: 'dark',
  colors: {
    ...defaultTheme.colors,
    primary: '#B37FEB',
    secondary: '#D3ADF7',
    background: '#141414',
    surface: '#1f1f1f',
    text: '#ffffff',
    textSecondary: '#a6a6a6',
    border: '#434343',
    hover: '#262626',
    selected: '#111b26',
    disabled: '#262626'
  }
}

/**
 * 蓝色主题
 */
const blueTheme: ThemeConfig = {
  ...defaultTheme,
  name: 'blue',
  colors: {
    ...defaultTheme.colors,
    primary: '#1890ff',
    secondary: '#69c0ff',
    selected: '#e6f7ff'
  }
}

/**
 * 绿色主题
 */
const greenTheme: ThemeConfig = {
  ...defaultTheme,
  name: 'green',
  colors: {
    ...defaultTheme.colors,
    primary: '#52c41a',
    secondary: '#95de64',
    selected: '#f6ffed'
  }
}

/**
 * 主题管理器类
 */
export class ThemeManager {
  /** 当前主题 */
  private currentTheme: ThemeType = 'default'
  /** 主题配置映射 */
  private themes: Map<ThemeType, ThemeConfig> = new Map()
  /** 样式元素 */
  private styleElement: HTMLStyleElement | null = null
  /** 事件监听器 */
  private listeners: Map<string, Function[]> = new Map()
  /** 容器元素 */
  private container: HTMLElement | null = null

  constructor(container?: HTMLElement) {
    this.container = container || null
    this.init()
  }

  /**
   * 初始化主题管理器
   */
  private init(): void {
    // 注册内置主题
    this.themes.set('default', defaultTheme)
    this.themes.set('dark', darkTheme)
    this.themes.set('blue', blueTheme)
    this.themes.set('green', greenTheme)

    // 创建样式元素
    this.createStyleElement()
  }

  /**
   * 创建样式元素
   */
  private createStyleElement(): void {
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'ldesign-calendar-theme'
    document.head.appendChild(this.styleElement)
  }

  /**
   * 应用主题
   */
  public applyTheme(themeName: ThemeType): void {
    const theme = this.themes.get(themeName)
    if (!theme) {
      console.warn(`Theme "${themeName}" not found, using default theme`)
      return
    }

    // 移除旧主题类
    if (this.container && this.currentTheme) {
      this.container.classList.remove(`theme-${this.currentTheme}`)
    }

    this.currentTheme = themeName

    // 添加新主题类
    if (this.container) {
      this.container.classList.add(`theme-${themeName}`)
    }

    this.generateCSS(theme)
    this.emit('themeChanged', themeName, theme)
  }

  /**
   * 设置主题（applyTheme的别名）
   */
  public setTheme(themeName: ThemeType): void {
    this.applyTheme(themeName)
  }

  /**
   * 设置容器元素
   */
  public setContainer(container: HTMLElement): void {
    this.container = container
  }

  /**
   * 获取当前主题
   */
  public getCurrentTheme(): ThemeType {
    return this.currentTheme
  }

  /**
   * 生成CSS样式
   */
  private generateCSS(theme: ThemeConfig): void {
    if (!this.styleElement) return

    const css = `
      :root {
        /* 颜色变量 */
        --ldesign-calendar-primary: ${theme.colors.primary};
        --ldesign-calendar-secondary: ${theme.colors.secondary};
        --ldesign-calendar-background: ${theme.colors.background};
        --ldesign-calendar-surface: ${theme.colors.surface};
        --ldesign-calendar-text: ${theme.colors.text};
        --ldesign-calendar-text-secondary: ${theme.colors.textSecondary};
        --ldesign-calendar-border: ${theme.colors.border};
        --ldesign-calendar-hover: ${theme.colors.hover};
        --ldesign-calendar-selected: ${theme.colors.selected};
        --ldesign-calendar-today: ${theme.colors.today};
        --ldesign-calendar-weekend: ${theme.colors.weekend};
        --ldesign-calendar-holiday: ${theme.colors.holiday};
        --ldesign-calendar-disabled: ${theme.colors.disabled};
        --ldesign-calendar-error: ${theme.colors.error};
        --ldesign-calendar-warning: ${theme.colors.warning};
        --ldesign-calendar-success: ${theme.colors.success};
        --ldesign-calendar-info: ${theme.colors.info};

        /* 字体变量 */
        --ldesign-calendar-font-family: ${theme.fonts.family};
        --ldesign-calendar-font-size-small: ${theme.fonts.size.small};
        --ldesign-calendar-font-size-medium: ${theme.fonts.size.medium};
        --ldesign-calendar-font-size-large: ${theme.fonts.size.large};
        --ldesign-calendar-font-size-xlarge: ${theme.fonts.size.xlarge};
        --ldesign-calendar-font-weight-normal: ${theme.fonts.weight.normal};
        --ldesign-calendar-font-weight-medium: ${theme.fonts.weight.medium};
        --ldesign-calendar-font-weight-bold: ${theme.fonts.weight.bold};

        /* 间距变量 */
        --ldesign-calendar-spacing-xs: ${theme.spacing.xs};
        --ldesign-calendar-spacing-sm: ${theme.spacing.sm};
        --ldesign-calendar-spacing-md: ${theme.spacing.md};
        --ldesign-calendar-spacing-lg: ${theme.spacing.lg};
        --ldesign-calendar-spacing-xl: ${theme.spacing.xl};

        /* 圆角变量 */
        --ldesign-calendar-border-radius-small: ${theme.borderRadius.small};
        --ldesign-calendar-border-radius-medium: ${theme.borderRadius.medium};
        --ldesign-calendar-border-radius-large: ${theme.borderRadius.large};

        /* 阴影变量 */
        --ldesign-calendar-shadow-small: ${theme.shadows.small};
        --ldesign-calendar-shadow-medium: ${theme.shadows.medium};
        --ldesign-calendar-shadow-large: ${theme.shadows.large};

        /* 过渡变量 */
        --ldesign-calendar-transition-fast: ${theme.transitions.fast};
        --ldesign-calendar-transition-medium: ${theme.transitions.medium};
        --ldesign-calendar-transition-slow: ${theme.transitions.slow};
      }

      /* 基础样式 */
      .ldesign-calendar {
        font-family: var(--ldesign-calendar-font-family);
        font-size: var(--ldesign-calendar-font-size-medium);
        color: var(--ldesign-calendar-text);
        background-color: var(--ldesign-calendar-background);
        border: 1px solid var(--ldesign-calendar-border);
        border-radius: var(--ldesign-calendar-border-radius-medium);
        box-shadow: var(--ldesign-calendar-shadow-small);
      }

      /* 工具栏样式 */
      .ldesign-calendar-toolbar {
        background-color: var(--ldesign-calendar-surface);
        border-bottom: 1px solid var(--ldesign-calendar-border);
        padding: var(--ldesign-calendar-spacing-md);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .ldesign-calendar-view-btn {
        background-color: transparent;
        border: 1px solid var(--ldesign-calendar-border);
        color: var(--ldesign-calendar-text);
        padding: var(--ldesign-calendar-spacing-sm) var(--ldesign-calendar-spacing-md);
        border-radius: var(--ldesign-calendar-border-radius-small);
        cursor: pointer;
        transition: all var(--ldesign-calendar-transition-fast);
      }

      .ldesign-calendar-view-btn:hover {
        background-color: var(--ldesign-calendar-hover);
      }

      .ldesign-calendar-view-btn.active {
        background-color: var(--ldesign-calendar-primary);
        color: white;
        border-color: var(--ldesign-calendar-primary);
      }

      /* 导航样式 */
      .ldesign-calendar-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--ldesign-calendar-spacing-md);
        border-bottom: 1px solid var(--ldesign-calendar-border);
      }

      .ldesign-calendar-prev-btn,
      .ldesign-calendar-next-btn {
        background-color: transparent;
        border: none;
        color: var(--ldesign-calendar-text);
        font-size: var(--ldesign-calendar-font-size-large);
        cursor: pointer;
        padding: var(--ldesign-calendar-spacing-sm);
        border-radius: var(--ldesign-calendar-border-radius-small);
        transition: all var(--ldesign-calendar-transition-fast);
      }

      .ldesign-calendar-prev-btn:hover,
      .ldesign-calendar-next-btn:hover {
        background-color: var(--ldesign-calendar-hover);
      }

      .ldesign-calendar-title {
        font-size: var(--ldesign-calendar-font-size-large);
        font-weight: var(--ldesign-calendar-font-weight-medium);
        color: var(--ldesign-calendar-text);
      }

      /* 月视图样式 */
      .ldesign-calendar-month-table {
        width: 100%;
        border-collapse: collapse;
      }

      .ldesign-calendar-weekday-header {
        background-color: var(--ldesign-calendar-surface);
        color: var(--ldesign-calendar-text-secondary);
        font-weight: var(--ldesign-calendar-font-weight-medium);
        padding: var(--ldesign-calendar-spacing-sm);
        text-align: center;
        border-bottom: 1px solid var(--ldesign-calendar-border);
      }

      .ldesign-calendar-date-cell {
        border: 1px solid var(--ldesign-calendar-border);
        vertical-align: top;
        height: 120px;
        position: relative;
      }

      .ldesign-calendar-date {
        padding: var(--ldesign-calendar-spacing-sm);
        cursor: pointer;
        transition: all var(--ldesign-calendar-transition-fast);
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .ldesign-calendar-date:hover {
        background-color: var(--ldesign-calendar-hover);
      }

      .ldesign-calendar-date.today {
        background-color: var(--ldesign-calendar-today);
        color: white;
      }

      .ldesign-calendar-date.selected {
        background-color: var(--ldesign-calendar-selected);
      }

      .ldesign-calendar-date.weekend {
        color: var(--ldesign-calendar-weekend);
      }

      .ldesign-calendar-date.holiday {
        color: var(--ldesign-calendar-holiday);
      }

      .ldesign-calendar-date.disabled {
        background-color: var(--ldesign-calendar-disabled);
        color: var(--ldesign-calendar-text-secondary);
        cursor: not-allowed;
      }

      .ldesign-calendar-date.other-month {
        color: var(--ldesign-calendar-text-secondary);
      }

      /* 日期数字 */
      .ldesign-calendar-day-number {
        font-weight: var(--ldesign-calendar-font-weight-medium);
        margin-bottom: var(--ldesign-calendar-spacing-xs);
      }

      /* 农历信息 */
      .ldesign-calendar-lunar {
        font-size: var(--ldesign-calendar-font-size-small);
        color: var(--ldesign-calendar-text-secondary);
        margin-bottom: var(--ldesign-calendar-spacing-xs);
      }

      /* 事件样式 */
      .ldesign-calendar-event {
        background-color: var(--ldesign-calendar-primary);
        color: white;
        padding: 2px 4px;
        border-radius: var(--ldesign-calendar-border-radius-small);
        font-size: var(--ldesign-calendar-font-size-small);
        margin-bottom: 2px;
        cursor: pointer;
        transition: all var(--ldesign-calendar-transition-fast);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .ldesign-calendar-event:hover {
        opacity: 0.8;
      }

      /* 响应式设计 */
      @media (max-width: 768px) {
        .ldesign-calendar-date-cell {
          height: 80px;
        }
        
        .ldesign-calendar-toolbar {
          flex-direction: column;
          gap: var(--ldesign-calendar-spacing-sm);
        }
        
        .ldesign-calendar-view-btn {
          padding: var(--ldesign-calendar-spacing-xs) var(--ldesign-calendar-spacing-sm);
          font-size: var(--ldesign-calendar-font-size-small);
        }
      }

      /* 动画效果 */
      .ldesign-calendar-view {
        transition: all var(--ldesign-calendar-transition-medium);
      }

      .ldesign-calendar-fade-enter {
        opacity: 0;
      }

      .ldesign-calendar-fade-enter-active {
        transition: opacity var(--ldesign-calendar-transition-medium);
      }

      .ldesign-calendar-fade-enter-to {
        opacity: 1;
      }

      .ldesign-calendar-slide-enter {
        transform: translateX(100%);
      }

      .ldesign-calendar-slide-enter-active {
        transition: transform var(--ldesign-calendar-transition-medium);
      }

      .ldesign-calendar-slide-enter-to {
        transform: translateX(0);
      }
    `

    this.styleElement.textContent = css
  }

  /**
   * 获取主题配置
   */
  public getThemeConfig(themeName?: ThemeType): ThemeConfig | null {
    const name = themeName || this.currentTheme
    return this.themes.get(name) || null
  }

  /**
   * 注册自定义主题
   */
  public registerTheme(name: ThemeType, config: ThemeConfig): void {
    this.themes.set(name, config)
  }

  /**
   * 注销主题
   */
  public unregisterTheme(name: ThemeType): void {
    if (name === 'default') {
      console.warn('Cannot unregister default theme')
      return
    }
    
    this.themes.delete(name)
    
    // 如果当前主题被注销，切换到默认主题
    if (this.currentTheme === name) {
      this.applyTheme('default')
    }
  }

  /**
   * 获取所有可用主题
   */
  public getAvailableThemes(): ThemeType[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 检查主题是否存在
   */
  public hasTheme(name: ThemeType): boolean {
    return this.themes.has(name)
  }

  /**
   * 切换主题
   */
  public toggleTheme(themes: ThemeType[]): void {
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.applyTheme(themes[nextIndex])
  }

  /**
   * 获取CSS变量值
   */
  public getCSSVariable(variableName: string): string {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--ldesign-calendar-${variableName}`)
      .trim()
  }

  /**
   * 设置CSS变量值
   */
  public setCSSVariable(variableName: string, value: string): void {
    document.documentElement.style.setProperty(`--ldesign-calendar-${variableName}`, value)
  }

  /**
   * 事件监听
   */
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  public off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return
    
    if (callback) {
      const callbacks = this.listeners.get(event)!
      const index = callbacks.indexOf(callback)
      if (index >= 0) {
        callbacks.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, ...args: any[]): void {
    if (!this.listeners.has(event)) return
    
    this.listeners.get(event)!.forEach(callback => {
      try {
        callback(...args)
      } catch (error) {
        console.error(`Error in theme manager handler for "${event}":`, error)
      }
    })
  }

  /**
   * 销毁主题管理器
   */
  public destroy(): void {
    if (this.styleElement) {
      document.head.removeChild(this.styleElement)
      this.styleElement = null
    }
    
    this.listeners.clear()
  }
}
