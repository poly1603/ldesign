/**
 * 渐变色生成器
 * 支持线性、径向、锥形和网格渐变
 */

import { Color } from '../core/Color'
import type { ColorInput } from '../types'

/**
 * 渐变色停止点
 */
export interface GradientStop {
  color: Color
  position?: number // 0-100
}

/**
 * 渐变选项
 */
export interface GradientOptions {
  stops?: GradientStop[]
  smoothing?: boolean // 平滑过渡
  colorSpace?: 'rgb' | 'hsl' | 'lab' // 插值色彩空�?
}

/**
 * 线性渐变选项
 */
export interface LinearGradientOptions extends GradientOptions {
  angle?: number // 角度（度�?
  repeating?: boolean // 是否重复
}

/**
 * 径向渐变选项
 */
export interface RadialGradientOptions extends GradientOptions {
  shape?: 'circle' | 'ellipse'
  size?: 'closest-side' | 'farthest-side' | 'closest-corner' | 'farthest-corner'
  position?: { x: string | number; y: string | number }
}

/**
 * 锥形渐变选项
 */
export interface ConicGradientOptions extends GradientOptions {
  startAngle?: number // 起始角度
  position?: { x: string | number; y: string | number }
}

/**
 * 网格渐变选项
 */
export interface MeshGradientOptions {
  colors: Color[][]
  smoothness?: number // 0-1
  resolution?: number // 网格分辨�?
}

/**
 * 渐变生成器类
 */
export class GradientGenerator {
  
  /**
   * 生成线性渐�?
   */
  static linear(colors: ColorInput[], options: LinearGradientOptions = {}): string {
    const {
      angle = 90,
      repeating = false,
      stops: customStops
    } = options
    
    const colorObjs = colors.map(c => new Color(c))
    const stops = customStops || this.generateEvenStops(colorObjs)
    
    const prefix = repeating ? 'repeating-linear-gradient' : 'linear-gradient'
    const gradientStops = stops.map(stop => {
      const position = stop.position !== undefined ? ` ${stop.position}%` : ''
      return `${stop.color.toRGBString()}${position}`
    }).join(', ')
    
    return `${prefix}(${angle}deg, ${gradientStops})`
  }
  
  /**
   * 生成径向渐变
   */
  static radial(colors: ColorInput[], options: RadialGradientOptions = {}): string {
    const {
      shape = 'circle',
      size = 'farthest-corner',
      position = { x: 'center', y: 'center' },
      stops: customStops
    } = options
    
    const colorObjs = colors.map(c => new Color(c))
    const stops = customStops || this.generateEvenStops(colorObjs)
    
    const posStr = `${position.x} ${position.y}`
    const gradientStops = stops.map(stop => {
      const pos = stop.position !== undefined ? ` ${stop.position}%` : ''
      return `${stop.color.toRGBString()}${pos}`
    }).join(', ')
    
    return `radial-gradient(${shape} ${size} at ${posStr}, ${gradientStops})`
  }
  
  /**
   * 生成锥形渐变
   */
  static conic(colors: ColorInput[], options: ConicGradientOptions = {}): string {
    const {
      startAngle = 0,
      position = { x: 'center', y: 'center' },
      stops: customStops
    } = options
    
    const colorObjs = colors.map(c => new Color(c))
    const stops = customStops || this.generateEvenStops(colorObjs, true)
    
    const posStr = `${position.x} ${position.y}`
    const gradientStops = stops.map(stop => {
      const pos = stop.position !== undefined ? ` ${stop.position}deg` : ''
      return `${stop.color.toRGBString()}${pos}`
    }).join(', ')
    
    const fromAngle = startAngle ? `from ${startAngle}deg ` : ''
    return `conic-gradient(${fromAngle}at ${posStr}, ${gradientStops})`
  }
  
  /**
   * 生成网格渐变（CSS Paint API�?
   */
  static mesh(colors: Color[][], options: Partial<MeshGradientOptions> = {}): {
    css: string
    canvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  } {
    const {
      smoothness = 0.5
    } = options
    
    // CSS fallback - 使用多个线性渐变模�?
    const cssGradients: string[] = []
    for (let i = 0; i < colors.length - 1; i++) {
      const row = colors[i]
      const nextRow = colors[i + 1]
      for (let j = 0; j < row.length - 1; j++) {
        const tl = row[j]
        // const _tr = row[j + 1] // unused but preserved for mesh structure
        // const _bl = nextRow[j] // unused but preserved for mesh structure
        const br = nextRow[j + 1]
        
        // 创建对角渐变
        const gradient = `linear-gradient(135deg, ${tl.toRGBString()} 0%, ${br.toRGBString()} 100%)`
        cssGradients.push(gradient)
      }
    }
    
    // Canvas 渲染函数
    const canvasRender = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const cellWidth = width / (colors[0].length - 1)
      const cellHeight = height / (colors.length - 1)
      
      for (let i = 0; i < colors.length - 1; i++) {
        for (let j = 0; j < colors[i].length - 1; j++) {
          const x = j * cellWidth
          const y = i * cellHeight
          
        // 使用双线性插�?
        GradientGenerator.drawBilinearGradient(
          ctx,
          x, y, cellWidth, cellHeight,
          colors[i][j],
          colors[i][j + 1],
          colors[i + 1][j],
          colors[i + 1][j + 1],
          smoothness
        )
        }
      }
    }
    
    return {
      css: cssGradients.join(', '),
      canvas: canvasRender
    }
  }
  
  /**
   * 生成平均分布的停止点
   */
  private static generateEvenStops(colors: Color[], isDegrees = false): GradientStop[] {
    if (colors.length === 0) return []
    if (colors.length === 1) {
      return [{ color: colors[0], position: 0 }]
    }
    
    const maxValue = isDegrees ? 360 : 100
    return colors.map((color, index) => ({
      color,
      position: (index / (colors.length - 1)) * maxValue
    }))
  }
  
  /**
   * 绘制双线性渐变（用于网格渐变�?
   */
  private static drawBilinearGradient(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    tl: Color, // top-left
    tr: Color, // top-right
    bl: Color, // bottom-left
    br: Color, // bottom-right
    smoothness: number
  ) {
    const steps = Math.max(2, Math.floor(smoothness * 20))
    const stepWidth = width / steps
    const stepHeight = height / steps
    
    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const u = i / steps
        const v = j / steps
        
        // 双线性插�?
        const top = tl.mix(tr, u * 100)
        const bottom = bl.mix(br, u * 100)
        const color = top.mix(bottom, v * 100)
        
        ctx.fillStyle = color.toRGBString()
        ctx.fillRect(
          x + i * stepWidth,
          y + j * stepHeight,
          stepWidth + 1, // +1 避免间隙
          stepHeight + 1
        )
      }
    }
  }
  
  /**
   * 生成平滑渐变（使用贝塞尔曲线插值）
   */
  static smooth(colors: ColorInput[], steps = 10): Color[] {
    if (colors.length < 2) {
      return colors.map(c => new Color(c))
    }
    
    const colorObjs = colors.map(c => new Color(c))
    const result: Color[] = []
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const color = this.bezierInterpolation(colorObjs, t)
      result.push(color)
    }
    
    return result
  }
  
  /**
   * 贝塞尔曲线颜色插�?
   */
  private static bezierInterpolation(colors: Color[], t: number): Color {
    if (colors.length === 1) return colors[0]
    
    const newColors: Color[] = []
    for (let i = 0; i < colors.length - 1; i++) {
      newColors.push(colors[i].mix(colors[i + 1], t * 100))
    }
    
    return this.bezierInterpolation(newColors, t)
  }
  
  /**
   * 生成动画渐变配置
   */
  static animated(
    colors: ColorInput[],
    duration = 3000,
    type: 'linear' | 'radial' | 'conic' = 'linear'
  ): {
    css: string
    keyframes: string
  } {
    const colorObjs = colors.map(c => new Color(c))
    const animationName = `gradient-animation-${Date.now()}`
    
    // 生成关键�?
    const keyframes = `
      @keyframes ${animationName} {
        ${colorObjs.map((color, index) => {
          const percent = (index / (colorObjs.length - 1)) * 100
          const nextColor = colorObjs[(index + 1) % colorObjs.length]
          
          let gradient = ''
          switch (type) {
            case 'linear':
              gradient = GradientGenerator.linear([color.toHex(), nextColor.toHex()])
              break
            case 'radial':
              gradient = GradientGenerator.radial([color.toHex(), nextColor.toHex()])
              break
            case 'conic':
              gradient = GradientGenerator.conic([color.toHex(), nextColor.toHex()])
              break
          }
          
          return `${percent}% { background: ${gradient}; }`
        }).join('\n')}
      }
    `
    
    // 生成CSS
    const css = `
      animation: ${animationName} ${duration}ms ease-in-out infinite;
      background-size: 200% 200%;
    `
    
    return { css, keyframes }
  }
  
  /**
   * 生成渐变的CSS变量
   */
  static toCSSVariables(
    gradientName: string,
    colors: ColorInput[],
    prefix = 'gradient'
  ): Record<string, string> {
    const colorObjs = colors.map(c => new Color(c))
    const variables: Record<string, string> = {}
    
    // 颜色变量
    colorObjs.forEach((color, index) => {
      variables[`--${prefix}-${gradientName}-color-${index + 1}`] = color.toHex()
    })
    
    // 渐变变量
    const hexColors = colorObjs.map(c => c.toHex())
    variables[`--${prefix}-${gradientName}-linear`] = GradientGenerator.linear(hexColors)
    variables[`--${prefix}-${gradientName}-radial`] = GradientGenerator.radial(hexColors)
    variables[`--${prefix}-${gradientName}-conic`] = GradientGenerator.conic(hexColors)
    
    return variables
  }
}

// 导出便捷函数
export const linearGradient = GradientGenerator.linear
export const radialGradient = GradientGenerator.radial
export const conicGradient = GradientGenerator.conic
export const meshGradient = GradientGenerator.mesh
export const smoothGradient = GradientGenerator.smooth
export const animatedGradient = GradientGenerator.animated
