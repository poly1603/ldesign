/**
 * LDesign QRCode - 主题系统
 * 提供预设主题和自定义主题功能
 */

import type { QRCodeOptions, StyleOptions } from '../types'
import type { ThemeConfig, PresetThemes } from '../types/advanced'

// 预设主题定义
export const presetThemes: PresetThemes = {
  light: {
    name: 'Light',
    colors: {
      foreground: '#000000',
      background: '#FFFFFF',
      accent: '#f0f0f0'
    },
    style: {
      dotStyle: 'square',
      cornerStyle: 'square',
      borderRadius: 0
    }
  },

  dark: {
    name: 'Dark',
    colors: {
      foreground: '#FFFFFF',
      background: '#1a1a1a',
      accent: '#333333'
    },
    style: {
      dotStyle: 'square',
      cornerStyle: 'rounded',
      borderRadius: 8
    }
  },

  blue: {
    name: 'Blue Ocean',
    colors: {
      foreground: '#1e40af',
      background: '#dbeafe',
      accent: '#3b82f6'
    },
    style: {
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      borderRadius: 12,
      foregroundColor: {
        type: 'linear',
        colors: [
          { offset: 0, color: '#1e40af' },
          { offset: 1, color: '#3b82f6' }
        ],
        direction: 45
      }
    }
  },

  green: {
    name: 'Forest Green',
    colors: {
      foreground: '#166534',
      background: '#dcfce7',
      accent: '#22c55e'
    },
    style: {
      dotStyle: 'dots',
      cornerStyle: 'rounded',
      borderRadius: 16,
      foregroundColor: {
        type: 'radial',
        colors: [
          { offset: 0, color: '#22c55e' },
          { offset: 1, color: '#166534' }
        ]
      }
    }
  },

  purple: {
    name: 'Royal Purple',
    colors: {
      foreground: '#7c3aed',
      background: '#f3e8ff',
      accent: '#a855f7'
    },
    style: {
      dotStyle: 'classy',
      cornerStyle: 'extra-rounded',
      borderRadius: 20,
      foregroundColor: {
        type: 'linear',
        colors: [
          { offset: 0, color: '#7c3aed' },
          { offset: 0.5, color: '#a855f7' },
          { offset: 1, color: '#c084fc' }
        ],
        direction: 135
      }
    }
  },

  minimal: {
    name: 'Minimal',
    colors: {
      foreground: '#374151',
      background: '#f9fafb',
      accent: '#6b7280'
    },
    style: {
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      borderRadius: 4,
      margin: 8
    }
  },

  neon: {
    name: 'Neon Glow',
    colors: {
      foreground: '#00ff88',
      background: '#0a0a0a',
      accent: '#ff0088'
    },
    style: {
      dotStyle: 'dots',
      cornerStyle: 'rounded',
      borderRadius: 8,
      foregroundColor: {
        type: 'radial',
        colors: [
          { offset: 0, color: '#00ff88' },
          { offset: 0.7, color: '#00cc66' },
          { offset: 1, color: '#009944' }
        ]
      }
    }
  },

  sunset: {
    name: 'Sunset',
    colors: {
      foreground: '#dc2626',
      background: '#fef3c7',
      accent: '#f59e0b'
    },
    style: {
      dotStyle: 'classy',
      cornerStyle: 'rounded',
      borderRadius: 12,
      foregroundColor: {
        type: 'linear',
        colors: [
          { offset: 0, color: '#dc2626' },
          { offset: 0.3, color: '#ea580c' },
          { offset: 0.7, color: '#f59e0b' },
          { offset: 1, color: '#eab308' }
        ],
        direction: 90
      }
    }
  }
}

export class ThemeManager {
  private themes: Map<string, ThemeConfig> = new Map()
  private currentTheme: string | null = null

  constructor() {
    // 加载预设主题
    this.loadPresetThemes()
  }

  /**
   * 加载预设主题
   */
  private loadPresetThemes(): void {
    Object.entries(presetThemes).forEach(([name, theme]) => {
      this.themes.set(name, theme)
    })
  }

  /**
   * 注册自定义主题
   */
  registerTheme(name: string, theme: ThemeConfig): void {
    this.themes.set(name, { ...theme, name })
  }

  /**
   * 获取主题
   */
  getTheme(name: string): ThemeConfig | null {
    return this.themes.get(name) || null
  }

  /**
   * 获取所有主题名称
   */
  getThemeNames(): string[] {
    return Array.from(this.themes.keys())
  }

  /**
   * 获取所有主题
   */
  getAllThemes(): Record<string, ThemeConfig> {
    const result: Record<string, ThemeConfig> = {}
    this.themes.forEach((theme, name) => {
      result[name] = theme
    })
    return result
  }

  /**
   * 应用主题到QR码选项
   */
  applyTheme(name: string, baseOptions: QRCodeOptions = { data: '' }): QRCodeOptions {
    const theme = this.getTheme(name)
    if (!theme) {
      throw new Error(`Theme '${name}' not found`)
    }

    const options: QRCodeOptions = {
      ...baseOptions,
      color: {
        foreground: theme.colors.foreground,
        background: theme.colors.background,
        ...baseOptions.color
      }
    }

    // 合并样式
    if (theme.style) {
      options.style = {
        backgroundColor: theme.colors.background,
        foregroundColor: theme.colors.foreground,
        ...theme.style,
        ...baseOptions.style
      }
    }

    // 合并Logo配置
    if (theme.logo && baseOptions.logo) {
      options.logo = {
        ...theme.logo,
        ...baseOptions.logo
      }
    } else if (theme.logo && theme.logo.src) {
      options.logo = { src: theme.logo.src, ...theme.logo }
    }

    this.currentTheme = name
    return options
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string | null {
    return this.currentTheme
  }

  /**
   * 创建主题变体
   */
  createVariant(baseName: string, variantName: string, modifications: Partial<ThemeConfig>): ThemeConfig {
    const baseTheme = this.getTheme(baseName)
    if (!baseTheme) {
      throw new Error(`Base theme '${baseName}' not found`)
    }

    const variant: ThemeConfig = {
      name: variantName,
      colors: {
        ...baseTheme.colors,
        ...modifications.colors
      },
      style: {
        ...baseTheme.style,
        ...modifications.style
      },
      logo: {
        ...baseTheme.logo,
        ...modifications.logo
      }
    }

    this.registerTheme(variantName, variant)
    return variant
  }

  /**
   * 生成随机主题
   */
  generateRandomTheme(name: string = `random-${Date.now()}`): ThemeConfig {
    const colors = this.generateRandomColors()
    const style = this.generateRandomStyle()

    const theme: ThemeConfig = {
      name,
      colors,
      style
    }

    this.registerTheme(name, theme)
    return theme
  }

  /**
   * 生成随机颜色配置
   */
  private generateRandomColors(): ThemeConfig['colors'] {
    const hue1 = Math.floor(Math.random() * 360)
    const hue2 = (hue1 + 180) % 360 // 互补色

    return {
      foreground: `hsl(${hue1}, 70%, 30%)`,
      background: `hsl(${hue2}, 20%, 95%)`,
      accent: `hsl(${hue1}, 50%, 60%)`
    }
  }

  /**
   * 生成随机样式配置
   */
  private generateRandomStyle(): StyleOptions {
    const dotStyles = ['square', 'rounded', 'dots', 'classy'] as const
    const cornerStyles = ['square', 'rounded', 'extra-rounded'] as const

    return {
      dotStyle: dotStyles[Math.floor(Math.random() * dotStyles.length)],
      cornerStyle: cornerStyles[Math.floor(Math.random() * cornerStyles.length)],
      borderRadius: Math.floor(Math.random() * 20),
      margin: Math.floor(Math.random() * 12) + 4
    }
  }

  /**
   * 主题预览数据
   */
  getPreviewData(themeName: string): { 
    theme: ThemeConfig
    previewOptions: QRCodeOptions 
  } | null {
    const theme = this.getTheme(themeName)
    if (!theme) return null

    const previewOptions = this.applyTheme(themeName, {
      data: 'https://example.com',
      size: 200
    })

    return { theme, previewOptions }
  }

  /**
   * 导出主题为JSON
   */
  exportTheme(name: string): string {
    const theme = this.getTheme(name)
    if (!theme) {
      throw new Error(`Theme '${name}' not found`)
    }
    return JSON.stringify(theme, null, 2)
  }

  /**
   * 从JSON导入主题
   */
  importTheme(jsonString: string): void {
    try {
      const theme = JSON.parse(jsonString) as ThemeConfig
      if (!theme.name || !theme.colors) {
        throw new Error('Invalid theme format')
      }
      this.registerTheme(theme.name, theme)
    } catch (error) {
      throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 删除主题
   */
  removeTheme(name: string): boolean {
    if (presetThemes[name]) {
      throw new Error(`Cannot remove preset theme '${name}'`)
    }
    return this.themes.delete(name)
  }

  /**
   * 重置到默认主题
   */
  reset(): void {
    this.themes.clear()
    this.loadPresetThemes()
    this.currentTheme = null
  }

  /**
   * 获取主题统计
   */
  getStats(): {
    totalThemes: number
    presetThemes: number
    customThemes: number
    currentTheme: string | null
  } {
    const totalThemes = this.themes.size
    const presetCount = Object.keys(presetThemes).length
    const customCount = totalThemes - presetCount

    return {
      totalThemes,
      presetThemes: presetCount,
      customThemes: customCount,
      currentTheme: this.currentTheme
    }
  }
}

// 全局主题管理器实例
export const themeManager = new ThemeManager()

// 便利函数
export function applyTheme(themeName: string, options: QRCodeOptions = { data: '' }): QRCodeOptions {
  return themeManager.applyTheme(themeName, options)
}

export function getTheme(name: string): ThemeConfig | null {
  return themeManager.getTheme(name)
}

export function registerTheme(name: string, theme: ThemeConfig): void {
  themeManager.registerTheme(name, theme)
}

export function getAllThemes(): Record<string, ThemeConfig> {
  return themeManager.getAllThemes()
}
