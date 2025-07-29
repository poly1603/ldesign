import { Color } from './color'
import type { PaletteType, PaletteConfig, ColorTheme } from '../types'

/**
 * 调色板生成器
 */
export class Palette {
  private readonly baseColor: Color
  private readonly config: PaletteConfig

  constructor(baseColor: string | Color, config: PaletteConfig = {}) {
    this.baseColor = typeof baseColor === 'string' ? new Color(baseColor) : baseColor
    this.config = {
      type: 'monochromatic',
      count: 5,
      ...config
    }
  }

  /**
   * 生成调色板
   */
  generate(): Color[] {
    switch (this.config.type) {
      case 'monochromatic':
        return this.generateMonochromatic()
      case 'analogous':
        return this.generateAnalogous()
      case 'complementary':
        return this.generateComplementary()
      case 'triadic':
        return this.generateTriadic()
      case 'tetradic':
        return this.generateTetradic()
      case 'split-complementary':
        return this.generateSplitComplementary()
      default:
        return this.generateMonochromatic()
    }
  }

  /**
   * 生成单色调色板
   */
  private generateMonochromatic(): Color[] {
    const colors: Color[] = []
    const count = this.config.count || 5
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)
      const lightness = 0.2 + (0.6 * factor) // 从20%到80%的亮度
      colors.push(this.baseColor.clone().lighten(lightness - 0.5))
    }
    
    return colors
  }

  /**
   * 生成类似色调色板
   */
  private generateAnalogous(): Color[] {
    const colors: Color[] = [this.baseColor.clone()]
    const count = this.config.count || 5
    const step = 30 // 每次旋转30度
    
    for (let i = 1; i < count; i++) {
      const hueShift = (i % 2 === 1 ? 1 : -1) * Math.ceil(i / 2) * step
      colors.push(this.baseColor.clone().hueRotate(hueShift))
    }
    
    return colors
  }

  /**
   * 生成互补色调色板
   */
  private generateComplementary(): Color[] {
    return [
      this.baseColor.clone(),
      this.baseColor.clone().hueRotate(180)
    ]
  }

  /**
   * 生成三角色调色板
   */
  private generateTriadic(): Color[] {
    return [
      this.baseColor.clone(),
      this.baseColor.clone().hueRotate(120),
      this.baseColor.clone().hueRotate(240)
    ]
  }

  /**
   * 生成四角色调色板
   */
  private generateTetradic(): Color[] {
    return [
      this.baseColor.clone(),
      this.baseColor.clone().hueRotate(90),
      this.baseColor.clone().hueRotate(180),
      this.baseColor.clone().hueRotate(270)
    ]
  }

  /**
   * 生成分裂互补色调色板
   */
  private generateSplitComplementary(): Color[] {
    return [
      this.baseColor.clone(),
      this.baseColor.clone().hueRotate(150),
      this.baseColor.clone().hueRotate(210)
    ]
  }

  /**
   * 生成渐变色
   */
  generateGradient(endColor: string | Color, steps: number = 10): Color[] {
    const end = typeof endColor === 'string' ? new Color(endColor) : endColor
    const colors: Color[] = []
    
    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1)
      colors.push(this.baseColor.clone().mix(end, factor))
    }
    
    return colors
  }

  /**
   * 生成色调变化
   */
  generateTints(count: number = 5): Color[] {
    const colors: Color[] = []
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)
      colors.push(this.baseColor.clone().mix(new Color('#ffffff'), factor))
    }
    
    return colors
  }

  /**
   * 生成阴影变化
   */
  generateShades(count: number = 5): Color[] {
    const colors: Color[] = []
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)
      colors.push(this.baseColor.clone().mix(new Color('#000000'), factor))
    }
    
    return colors
  }

  /**
   * 生成色调变化（HSL中的色调）
   */
  generateTones(count: number = 5): Color[] {
    const colors: Color[] = []
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1)
      colors.push(this.baseColor.clone().mix(new Color('#808080'), factor))
    }
    
    return colors
  }
}

/**
 * 创建调色板
 */
export function createPalette(baseColor: string | Color, config?: PaletteConfig): Palette {
  return new Palette(baseColor, config)
}

/**
 * 预设主题
 */
export const themes: Record<string, ColorTheme> = {
  material: {
    name: 'Material Design',
    primary: '#2196F3',
    secondary: '#FF4081',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#00BCD4'
  },
  antd: {
    name: 'Ant Design',
    primary: '#1890ff',
    secondary: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
    info: '#13c2c2'
  },
  bootstrap: {
    name: 'Bootstrap',
    primary: '#007bff',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8'
  },
  tailwind: {
    name: 'Tailwind CSS',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4'
  }
}