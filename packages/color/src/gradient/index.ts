/**
 * 渐变色生成器
 * 支持线性、径向、锥形和网格渐变
 */

import type { ColorInput } from '../types'
import { Color } from '../core/Color'

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
    
    // 优化：使用临时颜色对象并立即处理，避免大量Color实例占用内存
    const stops = customStops || this.generateEvenStopsOptimized(colors)
    
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
    
    // 优化：避免创建不必要的Color对象
    const stops = customStops || this.generateEvenStopsOptimized(colors)
    
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
    
    // 优化：避免创建不必要的Color对象
    const stops = customStops || this.generateEvenStopsOptimized(colors, true)
    
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
   * 生成平均分布的停止点 - 保留原方法以兼容
   */
  // @ts-expect-error - Preserved for compatibility but not used
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
   * 优化的生成平均分布停止点 - 延迟创建Color对象
   */
  private static generateEvenStopsOptimized(colors: ColorInput[], isDegrees = false): GradientStop[] {
    if (colors.length === 0) return []
    
    const maxValue = isDegrees ? 360 : 100
    const stops: GradientStop[] = []
    
    for (let index = 0; index < colors.length; index++) {
      const color = new Color(colors[index])
      stops.push({
        color,
        position: colors.length === 1 ? 0 : (index / (colors.length - 1)) * maxValue
      })
      
      // 如果Color实例有dispose方法，使用完立即释放
      if (typeof color.dispose === 'function') {
        // 标记为待释放，在使用完后释放
        (color as any)._pendingDispose = true
      }
    }
    
    return stops
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
   * 贝塞尔曲线颜色插值 - 优化递归内存使用
   */
  private static bezierInterpolation(colors: Color[], t: number): Color {
    if (colors.length === 1) return colors[0]
    
    // 使用迭代代替递归，避免栈溢出和内存占用
    let workingColors = colors
    
    while (workingColors.length > 1) {
      const newColors: Color[] = []
      for (let i = 0; i < workingColors.length - 1; i++) {
        const mixed = workingColors[i].mix(workingColors[i + 1], t * 100)
        newColors.push(mixed)
      }
      
      // 清理中间Color对象
      if (workingColors !== colors) {
        for (const color of workingColors) {
          if (typeof color.dispose === 'function' && (color as any)._intermediate) {
            color.dispose()
          }
        }
      }
      
      // 标记中间对象
      newColors.forEach(c => (c as any)._intermediate = true)
      workingColors = newColors
    }
    
    return workingColors[0]
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
    // 优化：使用唯一但更短的动画名称
    const animationName = `ga${Math.random().toString(36).substr(2, 9)}`
    
    // 生成关键帧 - 优化内存使用
    const keyframeSteps: string[] = []
    
    for (let index = 0; index < colors.length; index++) {
      const color = new Color(colors[index])
      const percent = (index / (colors.length - 1)) * 100
      const nextColor = new Color(colors[(index + 1) % colors.length])
          
      let gradient = ''
      const hex1 = color.toHex()
      const hex2 = nextColor.toHex()
      
      switch (type) {
        case 'linear':
          gradient = `linear-gradient(90deg, ${hex1}, ${hex2})`
          break
        case 'radial':
          gradient = `radial-gradient(circle farthest-corner at center center, ${hex1}, ${hex2})`
          break
        case 'conic':
          gradient = `conic-gradient(at center center, ${hex1}, ${hex2})`
          break
      }
      
      keyframeSteps.push(`${percent}% { background: ${gradient}; }`)
      
      // 立即释放Color对象
      if (typeof color.dispose === 'function') color.dispose()
      if (typeof nextColor.dispose === 'function') nextColor.dispose()
    }
    
    const keyframes = `
      @keyframes ${animationName} {
        ${keyframeSteps.join('\n')}
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
    const variables: Record<string, string> = {}
    const hexColors: string[] = []
    
    // 优化：逐个处理颜色，避免同时持有所有Color对象
    for (let index = 0; index < colors.length; index++) {
      const color = new Color(colors[index])
      const hex = color.toHex()
      hexColors.push(hex)
      variables[`--${prefix}-${gradientName}-color-${index + 1}`] = hex
      
      // 立即释放Color对象
      if (typeof color.dispose === 'function') {
        color.dispose()
      }
    }
    
    // 渐变变量 - 直接使用优化后的方法
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
