/**
 * 控制台主题管理器
 * 提供控制台 UI 组件的主题和样式配置
 */

import chalk from 'chalk'

/**
 * 颜色配置
 */
export interface ColorConfig {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
  info: string
  muted: string
  background: string
  text: string
}

/**
 * 符号配置
 */
export interface SymbolConfig {
  success: string
  error: string
  warning: string
  info: string
  loading: string
  progress: string
  progressEmpty: string
  bullet: string
  arrow: string
  check: string
  cross: string
  star: string
  heart: string
  diamond: string
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  name: string
  colors: ColorConfig
  symbols: SymbolConfig
  progressBar: {
    width: number
    showPercentage: boolean
    showEta: boolean
    format: string
  }
  spinner: {
    interval: number
    frames: string[]
  }
}

/**
 * 预定义主题
 */
export const THEMES: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    colors: {
      primary: '#3498db',
      secondary: '#95a5a6',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db',
      muted: '#7f8c8d',
      background: '#000000',
      text: '#ffffff',
    },
    symbols: {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
      loading: '⠋',
      progress: '█',
      progressEmpty: '░',
      bullet: '•',
      arrow: '→',
      check: '✓',
      cross: '✗',
      star: '★',
      heart: '♥',
      diamond: '♦',
    },
    progressBar: {
      width: 40,
      showPercentage: true,
      showEta: true,
      format: '{bar} {percentage}% | ETA: {eta}s | {value}/{total}',
    },
    spinner: {
      interval: 80,
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
    },
  },

  minimal: {
    name: 'minimal',
    colors: {
      primary: '#ffffff',
      secondary: '#cccccc',
      success: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      info: '#00ffff',
      muted: '#888888',
      background: '#000000',
      text: '#ffffff',
    },
    symbols: {
      success: '+',
      error: '-',
      warning: '!',
      info: 'i',
      loading: '.',
      progress: '#',
      progressEmpty: '-',
      bullet: '*',
      arrow: '>',
      check: '+',
      cross: 'x',
      star: '*',
      heart: '<3',
      diamond: '<>',
    },
    progressBar: {
      width: 30,
      showPercentage: true,
      showEta: false,
      format: '{bar} {percentage}%',
    },
    spinner: {
      interval: 200,
      frames: ['.', '..', '...', '....'],
    },
  },

  colorful: {
    name: 'colorful',
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      success: '#51cf66',
      warning: '#ffd43b',
      error: '#ff6b6b',
      info: '#74c0fc',
      muted: '#adb5bd',
      background: '#212529',
      text: '#f8f9fa',
    },
    symbols: {
      success: '🎉',
      error: '💥',
      warning: '⚡',
      info: '💡',
      loading: '🌀',
      progress: '🟩',
      progressEmpty: '⬜',
      bullet: '🔸',
      arrow: '➡️',
      check: '✅',
      cross: '❌',
      star: '⭐',
      heart: '❤️',
      diamond: '💎',
    },
    progressBar: {
      width: 50,
      showPercentage: true,
      showEta: true,
      format: '{bar} {percentage}% | {value}/{total} | ETA: {eta}s',
    },
    spinner: {
      interval: 100,
      frames: ['🌍', '🌎', '🌏'],
    },
  },
}

/**
 * 控制台主题管理器类
 */
export class ConsoleTheme {
  private currentTheme: ThemeConfig
  private customThemes = new Map<string, ThemeConfig>()

  constructor(themeName = 'default') {
    const selectedTheme = THEMES[themeName as keyof typeof THEMES]
    this.currentTheme = (selectedTheme || THEMES.default) as ThemeConfig
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return this.currentTheme
  }

  /**
   * 设置主题
   */
  setTheme(themeName: string): void {
    const theme = THEMES[themeName] || this.customThemes.get(themeName)
    if (!theme) {
      throw new Error(`主题不存在: ${themeName}`)
    }
    this.currentTheme = theme
  }

  /**
   * 添加自定义主题
   */
  addTheme(name: string, theme: ThemeConfig): void {
    this.customThemes.set(name, theme)
  }

  /**
   * 获取可用主题列表
   */
  getAvailableThemes(): string[] {
    return [...Object.keys(THEMES), ...Array.from(this.customThemes.keys())]
  }

  /**
   * 获取颜色函数
   */
  color(colorName: keyof ColorConfig): any {
    const color = this.currentTheme.colors[colorName]
    return chalk.hex(color)
  }

  /**
   * 获取符号
   */
  symbol(symbolName: keyof SymbolConfig): string {
    return this.currentTheme.symbols[symbolName]
  }

  /**
   * 格式化成功消息
   */
  success(message: string): string {
    return this.color('success')(`${this.symbol('success')} ${message}`)
  }

  /**
   * 格式化错误消息
   */
  error(message: string): string {
    return this.color('error')(`${this.symbol('error')} ${message}`)
  }

  /**
   * 格式化警告消息
   */
  warning(message: string): string {
    return this.color('warning')(`${this.symbol('warning')} ${message}`)
  }

  /**
   * 格式化信息消息
   */
  info(message: string): string {
    return this.color('info')(`${this.symbol('info')} ${message}`)
  }

  /**
   * 格式化静默消息
   */
  muted(message: string): string {
    return this.color('muted')(message)
  }

  /**
   * 格式化主要消息
   */
  primary(message: string): string {
    return this.color('primary')(message)
  }

  /**
   * 格式化次要消息
   */
  secondary(message: string): string {
    return this.color('secondary')(message)
  }

  /**
   * 创建进度条字符
   */
  createProgressBar(progress: number, total: number, width?: number): string {
    const barWidth = width || this.currentTheme.progressBar.width
    const percentage = Math.min(progress / total, 1)
    const filledWidth = Math.round(percentage * barWidth)
    const emptyWidth = barWidth - filledWidth

    const filled = this.color('primary')(this.symbol('progress').repeat(filledWidth))
    const empty = this.color('muted')(this.symbol('progressEmpty').repeat(emptyWidth))

    return `[${filled}${empty}]`
  }

  /**
   * 格式化进度信息
   */
  formatProgress(
    progress: number,
    total: number,
    options: {
      width?: number
      showPercentage?: boolean
      showEta?: boolean
      eta?: number
      customFormat?: string
    } = {},
  ): string {
    const config = this.currentTheme.progressBar
    const width = options.width || config.width
    const showPercentage = options.showPercentage ?? config.showPercentage
    const showEta = options.showEta ?? config.showEta
    const format = options.customFormat || config.format

    const bar = this.createProgressBar(progress, total, width)
    const percentage = Math.round((progress / total) * 100)
    const eta = options.eta || 0

    return format
      .replace('{bar}', bar)
      .replace('{percentage}', showPercentage ? percentage.toString() : '')
      .replace('{value}', progress.toString())
      .replace('{total}', total.toString())
      .replace('{eta}', showEta ? eta.toString() : '')
  }

  /**
   * 获取加载动画帧
   */
  getSpinnerFrames(): string[] {
    return this.currentTheme.spinner.frames.map(frame => this.color('primary')(frame))
  }

  /**
   * 获取加载动画间隔
   */
  getSpinnerInterval(): number {
    return this.currentTheme.spinner.interval
  }

  /**
   * 创建分隔线
   */
  createSeparator(length = 50, char = '-'): string {
    return this.color('muted')(char.repeat(length))
  }

  /**
   * 创建标题
   */
  createTitle(title: string, level = 1): string {
    const prefix = '#'.repeat(level)
    return this.color('primary')(`${prefix} ${title}`)
  }

  /**
   * 创建列表项
   */
  createListItem(text: string, level = 0): string {
    const indent = '  '.repeat(level)
    return `${indent}${this.color('secondary')(this.symbol('bullet'))} ${text}`
  }

  /**
   * 创建表格行
   */
  createTableRow(columns: string[], widths: number[]): string {
    return columns
      .map((col, index) => {
        const width = widths[index] || 10
        return col.padEnd(width).substring(0, width)
      })
      .join(' | ')
  }

  /**
   * 创建状态徽章
   */
  createBadge(text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): string {
    const bgColor = this.currentTheme.colors[type]
    const textColor = this.currentTheme.colors.text

    return chalk.bgHex(bgColor).hex(textColor)(` ${text} `)
  }

  /**
   * 创建主题管理器实例
   */
  static create(themeName?: string): ConsoleTheme {
    return new ConsoleTheme(themeName)
  }

  /**
   * 创建自定义主题
   */
  static createCustomTheme(
    name: string,
    baseTheme: string = 'default',
    overrides: Partial<ThemeConfig> = {},
  ): ThemeConfig {
    const base = THEMES[baseTheme as keyof typeof THEMES] || THEMES.default

    return {
      ...(base as ThemeConfig),
      ...(overrides as ThemeConfig),
      name,
      colors: { ...base!.colors, ...overrides.colors },
      symbols: { ...base!.symbols, ...overrides.symbols },
      progressBar: { ...base!.progressBar, ...overrides.progressBar },
      spinner: { ...base!.spinner, ...overrides.spinner },
    }
  }
}
