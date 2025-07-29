import type { RGB, HSL, HSV, CMYK, LAB, ColorFormat } from '../types'
import { COLOR_CONSTANTS, COLOR_REGEX, NAMED_COLORS } from './constants'

/**
 * 验证RGB颜色值
 */
export function isValidRgb(rgb: RGB): boolean {
  const { r, g, b } = rgb
  return (
    Number.isInteger(r) && r >= COLOR_CONSTANTS.RGB_MIN && r <= COLOR_CONSTANTS.RGB_MAX &&
    Number.isInteger(g) && g >= COLOR_CONSTANTS.RGB_MIN && g <= COLOR_CONSTANTS.RGB_MAX &&
    Number.isInteger(b) && b >= COLOR_CONSTANTS.RGB_MIN && b <= COLOR_CONSTANTS.RGB_MAX
  )
}

/**
 * 验证HSL颜色值
 */
export function isValidHsl(hsl: HSL): boolean {
  const { h, s, l } = hsl
  return (
    Number.isInteger(h) && h >= COLOR_CONSTANTS.HUE_MIN && h <= COLOR_CONSTANTS.HUE_MAX &&
    Number.isInteger(s) && s >= COLOR_CONSTANTS.SATURATION_MIN && s <= COLOR_CONSTANTS.SATURATION_MAX &&
    Number.isInteger(l) && l >= COLOR_CONSTANTS.LIGHTNESS_MIN && l <= COLOR_CONSTANTS.LIGHTNESS_MAX
  )
}

/**
 * 验证HSV颜色值
 */
export function isValidHsv(hsv: HSV): boolean {
  const { h, s, v } = hsv
  return (
    Number.isInteger(h) && h >= COLOR_CONSTANTS.HUE_MIN && h <= COLOR_CONSTANTS.HUE_MAX &&
    Number.isInteger(s) && s >= COLOR_CONSTANTS.SATURATION_MIN && s <= COLOR_CONSTANTS.SATURATION_MAX &&
    Number.isInteger(v) && v >= COLOR_CONSTANTS.VALUE_MIN && v <= COLOR_CONSTANTS.VALUE_MAX
  )
}

/**
 * 验证CMYK颜色值
 */
export function isValidCmyk(cmyk: CMYK): boolean {
  const { c, m, y, k } = cmyk
  return (
    Number.isInteger(c) && c >= COLOR_CONSTANTS.CMYK_MIN && c <= COLOR_CONSTANTS.CMYK_MAX &&
    Number.isInteger(m) && m >= COLOR_CONSTANTS.CMYK_MIN && m <= COLOR_CONSTANTS.CMYK_MAX &&
    Number.isInteger(y) && y >= COLOR_CONSTANTS.CMYK_MIN && y <= COLOR_CONSTANTS.CMYK_MAX &&
    Number.isInteger(k) && k >= COLOR_CONSTANTS.CMYK_MIN && k <= COLOR_CONSTANTS.CMYK_MAX
  )
}

/**
 * 验证LAB颜色值
 */
export function isValidLab(lab: LAB): boolean {
  const { l, a, b } = lab
  return (
    typeof l === 'number' && l >= COLOR_CONSTANTS.LAB_L_MIN && l <= COLOR_CONSTANTS.LAB_L_MAX &&
    typeof a === 'number' && a >= COLOR_CONSTANTS.LAB_A_MIN && a <= COLOR_CONSTANTS.LAB_A_MAX &&
    typeof b === 'number' && b >= COLOR_CONSTANTS.LAB_B_MIN && b <= COLOR_CONSTANTS.LAB_B_MAX
  )
}

/**
 * 验证HEX颜色字符串
 */
export function isValidHex(hex: string): boolean {
  return COLOR_REGEX.HEX.test(hex)
}

/**
 * 验证RGB颜色字符串
 */
export function isValidRgbString(rgb: string): boolean {
  return COLOR_REGEX.RGB.test(rgb)
}

/**
 * 验证RGBA颜色字符串
 */
export function isValidRgbaString(rgba: string): boolean {
  return COLOR_REGEX.RGBA.test(rgba)
}

/**
 * 验证HSL颜色字符串
 */
export function isValidHslString(hsl: string): boolean {
  return COLOR_REGEX.HSL.test(hsl)
}

/**
 * 验证HSLA颜色字符串
 */
export function isValidHslaString(hsla: string): boolean {
  return COLOR_REGEX.HSLA.test(hsla)
}

/**
 * 验证命名颜色
 */
export function isValidNamedColor(name: string): boolean {
  return name.toLowerCase() in NAMED_COLORS
}

/**
 * 验证颜色字符串
 */
export function isValidColorString(color: string): boolean {
  const trimmed = color.trim().toLowerCase()
  
  return (
    isValidHex(trimmed) ||
    isValidRgbString(trimmed) ||
    isValidRgbaString(trimmed) ||
    isValidHslString(trimmed) ||
    isValidHslaString(trimmed) ||
    isValidNamedColor(trimmed)
  )
}

/**
 * 验证颜色格式
 */
export function isValidColorFormat(format: string): format is ColorFormat {
  const validFormats: ColorFormat[] = ['hex', 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'cmyk', 'lab']
  return validFormats.includes(format as ColorFormat)
}

/**
 * 验证透明度值
 */
export function isValidAlpha(alpha: number): boolean {
  return typeof alpha === 'number' && alpha >= 0 && alpha <= 1
}

/**
 * 验证对比度值
 */
export function isValidContrast(contrast: number): boolean {
  return typeof contrast === 'number' && contrast >= 1 && contrast <= 21
}

/**
 * 验证亮度值
 */
export function isValidLuminance(luminance: number): boolean {
  return typeof luminance === 'number' && luminance >= 0 && luminance <= 1
}

/**
 * 验证色相值
 */
export function isValidHue(hue: number): boolean {
  return (
    typeof hue === 'number' && 
    hue >= COLOR_CONSTANTS.HUE_MIN && 
    hue <= COLOR_CONSTANTS.HUE_MAX
  )
}

/**
 * 验证饱和度值
 */
export function isValidSaturation(saturation: number): boolean {
  return (
    typeof saturation === 'number' && 
    saturation >= COLOR_CONSTANTS.SATURATION_MIN && 
    saturation <= COLOR_CONSTANTS.SATURATION_MAX
  )
}

/**
 * 验证亮度值（HSL中的L）
 */
export function isValidLightness(lightness: number): boolean {
  return (
    typeof lightness === 'number' && 
    lightness >= COLOR_CONSTANTS.LIGHTNESS_MIN && 
    lightness <= COLOR_CONSTANTS.LIGHTNESS_MAX
  )
}

/**
 * 验证明度值（HSV中的V）
 */
export function isValidValue(value: number): boolean {
  return (
    typeof value === 'number' && 
    value >= COLOR_CONSTANTS.VALUE_MIN && 
    value <= COLOR_CONSTANTS.VALUE_MAX
  )
}

/**
 * 验证数值范围
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max
}

/**
 * 验证整数
 */
export function isInteger(value: number): boolean {
  return Number.isInteger(value)
}

/**
 * 验证正数
 */
export function isPositive(value: number): boolean {
  return typeof value === 'number' && value > 0
}

/**
 * 验证非负数
 */
export function isNonNegative(value: number): boolean {
  return typeof value === 'number' && value >= 0
}

/**
 * 验证百分比值
 */
export function isValidPercentage(value: number): boolean {
  return isInRange(value, 0, 100)
}

/**
 * 验证角度值
 */
export function isValidAngle(angle: number): boolean {
  return isInRange(angle, 0, 360)
}

/**
 * 验证颜色对象类型
 */
export function getColorType(color: any): string | null {
  if (typeof color === 'string') {
    return 'string'
  }
  
  if (typeof color === 'object' && color !== null) {
    if ('r' in color && 'g' in color && 'b' in color) {
      return 'rgb'
    }
    if ('h' in color && 's' in color && 'l' in color) {
      return 'hsl'
    }
    if ('h' in color && 's' in color && 'v' in color) {
      return 'hsv'
    }
    if ('c' in color && 'm' in color && 'y' in color && 'k' in color) {
      return 'cmyk'
    }
    if ('l' in color && 'a' in color && 'b' in color) {
      return 'lab'
    }
  }
  
  return null
}

/**
 * 验证颜色输入
 */
export function isValidColorInput(input: any): boolean {
  const type = getColorType(input)
  
  switch (type) {
    case 'string':
      return isValidColorString(input)
    case 'rgb':
      return isValidRgb(input)
    case 'hsl':
      return isValidHsl(input)
    case 'hsv':
      return isValidHsv(input)
    case 'cmyk':
      return isValidCmyk(input)
    case 'lab':
      return isValidLab(input)
    default:
      return false
  }
}