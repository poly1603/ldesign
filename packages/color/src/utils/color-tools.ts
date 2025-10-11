/**
 * 高级颜色工具函数
 * 
 * 提供颜色混合、插值、相似度计算等高级功能
 */

import type { RGB } from './color-converter'
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl } from './color-converter'

/**
 * 颜色插值算法
 */
export type InterpolationMode = 'linear' | 'cubic' | 'bezier'

/**
 * 颜色混合
 * 
 * 在两个颜色之间进行插值，生成中间色
 * 
 * @param color1 起始颜色 (hex)
 * @param color2 结束颜色 (hex)
 * @param ratio 插值比例 (0-1)，0表示完全是color1，1表示完全是color2
 * @param mode 插值模式
 * @returns 混合后的颜色 (hex)
 * 
 * @example
 * ```ts
 * // 获取红色和蓝色的中间色（紫色）
 * const purple = mixColors('#ff0000', '#0000ff', 0.5)
 * 
 * // 获取更接近蓝色的混合色
 * const bluish = mixColors('#ff0000', '#0000ff', 0.75)
 * ```
 */
export function mixColors(
  color1: string,
  color2: string,
  ratio: number,
  mode: InterpolationMode = 'linear',
): string {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided')
  }

  // 限制ratio在0-1之间
  ratio = Math.max(0, Math.min(1, ratio))

  let result: RGB

  switch (mode) {
    case 'linear':
      result = linearInterpolation(rgb1, rgb2, ratio)
      break
    case 'cubic':
      result = cubicInterpolation(rgb1, rgb2, ratio)
      break
    case 'bezier':
      result = bezierInterpolation(rgb1, rgb2, ratio)
      break
    default:
      result = linearInterpolation(rgb1, rgb2, ratio)
  }

  return rgbToHex(result.r, result.g, result.b)
}

/**
 * 线性插值
 */
function linearInterpolation(rgb1: RGB, rgb2: RGB, t: number): RGB {
  return {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * t),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * t),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * t),
  }
}

/**
 * 三次插值（平滑过渡）
 */
function cubicInterpolation(rgb1: RGB, rgb2: RGB, t: number): RGB {
  // 使用 smoothstep 函数使过渡更平滑
  const smoothT = t * t * (3 - 2 * t)
  return linearInterpolation(rgb1, rgb2, smoothT)
}

/**
 * 贝塞尔曲线插值
 */
function bezierInterpolation(rgb1: RGB, rgb2: RGB, t: number): RGB {
  // 使用三次贝塞尔曲线
  const bezierT = t * t * t * (t * (t * 6 - 15) + 10)
  return linearInterpolation(rgb1, rgb2, bezierT)
}

/**
 * 生成颜色渐变序列
 * 
 * @param startColor 起始颜色 (hex)
 * @param endColor 结束颜色 (hex)
 * @param steps 步数（包含起始和结束）
 * @param mode 插值模式
 * @returns 颜色数组
 * 
 * @example
 * ```ts
 * // 生成从红色到蓝色的5个渐变色
 * const gradient = generateGradient('#ff0000', '#0000ff', 5)
 * // ['#ff0000', '#bf0040', '#7f007f', '#3f00bf', '#0000ff']
 * ```
 */
export function generateGradient(
  startColor: string,
  endColor: string,
  steps: number,
  mode: InterpolationMode = 'linear',
): string[] {
  if (steps < 2) {
    throw new Error('Steps must be at least 2')
  }

  const colors: string[] = []
  
  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    colors.push(mixColors(startColor, endColor, ratio, mode))
  }

  return colors
}

/**
 * 计算颜色相似度
 * 
 * 使用欧几里得距离计算两个颜色在RGB空间中的相似度
 * 
 * @param color1 第一个颜色 (hex)
 * @param color2 第二个颜色 (hex)
 * @returns 相似度分数 (0-100)，100表示完全相同
 * 
 * @example
 * ```ts
 * const similarity = getColorSimilarity('#ff0000', '#fe0001')
 * console.log(similarity) // ~99.9
 * ```
 */
export function getColorSimilarity(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)

  if (!rgb1 || !rgb2) {
    throw new Error('Invalid hex color provided')
  }

  // 计算欧几里得距离
  const distance = Math.sqrt(
    (rgb1.r - rgb2.r) ** 2
    + (rgb1.g - rgb2.g) ** 2
    + (rgb1.b - rgb2.b) ** 2,
  )

  // 最大可能距离是 sqrt(255^2 * 3) ≈ 441.67
  const maxDistance = Math.sqrt(255 ** 2 * 3)
  
  // 转换为相似度分数 (0-100)
  return (1 - distance / maxDistance) * 100
}

/**
 * 获取颜色的补色
 * 
 * @param color 颜色 (hex)
 * @returns 补色 (hex)
 * 
 * @example
 * ```ts
 * const complement = getComplementaryColor('#ff0000')
 * console.log(complement) // '#00ffff' (青色)
 * ```
 */
export function getComplementaryColor(color: string): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  return rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b)
}

/**
 * 生成类似色
 * 
 * 生成与给定颜色相近的一组颜色
 * 
 * @param color 基础颜色 (hex)
 * @param count 生成的颜色数量
 * @param angle 色相偏移角度（默认30度）
 * @returns 类似色数组
 * 
 * @example
 * ```ts
 * // 生成3个与红色相近的颜色
 * const analogous = getAnalogousColors('#ff0000', 3)
 * ```
 */
export function getAnalogousColors(
  color: string,
  count: number = 3,
  angle: number = 30,
): string[] {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    const offset = (i - Math.floor(count / 2)) * angle
    const newHue = (hsl.h + offset + 360) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

/**
 * 生成三角配色
 * 
 * 生成与给定颜色形成三角关系的配色方案（120度间隔）
 * 
 * @param color 基础颜色 (hex)
 * @returns 三色数组
 * 
 * @example
 * ```ts
 * const triadic = getTriadicColors('#ff0000')
 * // 返回红色、绿色、蓝色
 * ```
 */
export function getTriadicColors(color: string): string[] {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = [color]

  // 添加120度和240度的颜色
  for (const offset of [120, 240]) {
    const newHue = (hsl.h + offset) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

/**
 * 生成分裂补色配色
 * 
 * @param color 基础颜色 (hex)
 * @param angle 分裂角度（默认30度）
 * @returns 三色数组
 * 
 * @example
 * ```ts
 * const splitComp = getSplitComplementaryColors('#ff0000')
 * ```
 */
export function getSplitComplementaryColors(
  color: string,
  angle: number = 30,
): string[] {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = [color]

  // 补色的两侧颜色
  const complementHue = (hsl.h + 180) % 360
  
  for (const offset of [-angle, angle]) {
    const newHue = (complementHue + offset + 360) % 360
    const newRgb = hslToRgb(newHue, hsl.s, hsl.l)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

/**
 * 使颜色变亮
 * 
 * @param color 颜色 (hex)
 * @param amount 变亮程度 (0-100)
 * @returns 变亮后的颜色 (hex)
 * 
 * @example
 * ```ts
 * const lighter = lightenColor('#ff0000', 20)
 * ```
 */
export function lightenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const newLightness = Math.min(100, hsl.l + amount)
  const newRgb = hslToRgb(hsl.h, hsl.s, newLightness)

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 使颜色变暗
 * 
 * @param color 颜色 (hex)
 * @param amount 变暗程度 (0-100)
 * @returns 变暗后的颜色 (hex)
 * 
 * @example
 * ```ts
 * const darker = darkenColor('#ff0000', 20)
 * ```
 */
export function darkenColor(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const newLightness = Math.max(0, hsl.l - amount)
  const newRgb = hslToRgb(hsl.h, hsl.s, newLightness)

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 调整颜色饱和度
 * 
 * @param color 颜色 (hex)
 * @param amount 调整量 (-100 到 100)，负值降低饱和度，正值增加饱和度
 * @returns 调整后的颜色 (hex)
 * 
 * @example
 * ```ts
 * const moreSaturated = saturateColor('#ff0000', 20)
 * const desaturated = saturateColor('#ff0000', -50)
 * ```
 */
export function saturateColor(color: string, amount: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const newSaturation = Math.max(0, Math.min(100, hsl.s + amount))
  const newRgb = hslToRgb(hsl.h, newSaturation, hsl.l)

  return rgbToHex(newRgb.r, newRgb.g, newRgb.b)
}

/**
 * 调整颜色透明度（生成rgba字符串）
 * 
 * @param color 颜色 (hex)
 * @param alpha 透明度 (0-1)
 * @returns rgba字符串
 * 
 * @example
 * ```ts
 * const transparent = setAlpha('#ff0000', 0.5)
 * // 'rgba(255, 0, 0, 0.5)'
 * ```
 */
export function setAlpha(color: string, alpha: number): string {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  alpha = Math.max(0, Math.min(1, alpha))
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}

/**
 * 判断颜色是暗色还是亮色
 * 
 * @param color 颜色 (hex)
 * @returns true表示暗色，false表示亮色
 * 
 * @example
 * ```ts
 * const isDark = isColorDark('#000000') // true
 * const isLight = isColorDark('#ffffff') // false
 * ```
 */
export function isColorDark(color: string): boolean {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  // 使用 YIQ 公式
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return yiq < 128
}

/**
 * 获取适合文本的前景色（黑色或白色）
 * 
 * @param backgroundColor 背景色 (hex)
 * @returns 适合的前景色 (hex)
 * 
 * @example
 * ```ts
 * const textColor = getContrastingTextColor('#ff0000')
 * // 返回 '#ffffff' (白色)
 * ```
 */
export function getContrastingTextColor(backgroundColor: string): string {
  return isColorDark(backgroundColor) ? '#ffffff' : '#000000'
}

/**
 * 生成单色配色方案
 * 
 * 基于同一色相，生成不同亮度和饱和度的颜色
 * 
 * @param color 基础颜色 (hex)
 * @param count 生成的颜色数量
 * @returns 单色配色数组
 * 
 * @example
 * ```ts
 * const monochrome = getMonochromaticColors('#ff0000', 5)
 * ```
 */
export function getMonochromaticColors(
  color: string,
  count: number = 5,
): string[] {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const colors: string[] = []

  for (let i = 0; i < count; i++) {
    const lightness = 20 + (i / (count - 1)) * 60 // 从20%到80%
    const newRgb = hslToRgb(hsl.h, hsl.s, lightness)
    colors.push(rgbToHex(newRgb.r, newRgb.g, newRgb.b))
  }

  return colors
}

/**
 * 颜色温度类型
 */
export type ColorTemperature = 'warm' | 'cool' | 'neutral'

/**
 * 判断颜色温度
 * 
 * @param color 颜色 (hex)
 * @returns 颜色温度
 * 
 * @example
 * ```ts
 * const temp = getColorTemperature('#ff0000') // 'warm'
 * ```
 */
export function getColorTemperature(color: string): ColorTemperature {
  const rgb = hexToRgb(color)
  if (!rgb) {
    throw new Error('Invalid hex color provided')
  }

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

  // 暖色：红、橙、黄 (0-60度，300-360度)
  if ((hsl.h >= 0 && hsl.h <= 60) || hsl.h >= 300) {
    return 'warm'
  }
  
  // 冷色：蓝、青 (180-270度)
  if (hsl.h >= 180 && hsl.h <= 270) {
    return 'cool'
  }

  // 中性：绿、紫
  return 'neutral'
}
