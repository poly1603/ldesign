/**
 * 类型守卫和验证函数
 * 提供运行时类型检查和验证功能
 */

import type {
  ColorConfig,
  ColorFormat,
  ColorValue,
  HexColor,
  HslColor,
  HsvColor,
  RgbColor,
  ThemeConfig,
} from '../core/types'

import type { LABColor, LCHColor, PreciseHSL, PreciseHSV, PreciseRGB } from '../types/advanced'

import type { AssertFunction, TypeGuard } from '../types/utility'

/**
 * 检查是否为有效的十六进制颜色
 */
export const isHexColor: TypeGuard<string, HexColor> = (value: string): value is HexColor => {
  return typeof value === 'string' && /^#(?:[A-F0-9]{3}|[A-F0-9]{6})$/i.test(value)
}

/**
 * 检查是否为有效的RGB颜色字符串
 */
export const isRgbColor: TypeGuard<string, RgbColor> = (value: string): value is RgbColor => {
  return (
    typeof value === 'string'
    && /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/.test(value)
  )
}

/**
 * 检查是否为有效的HSL颜色字符串
 */
export const isHslColor: TypeGuard<string, HslColor> = (value: string): value is HslColor => {
  return (
    typeof value === 'string'
    && /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*[\d.]+\s*)?\)$/.test(value)
  )
}

/**
 * 检查是否为有效的HSV颜色字符串
 */
export const isHsvColor: TypeGuard<string, HsvColor> = (value: string): value is HsvColor => {
  return typeof value === 'string' && /^hsv\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(value)
}

/**
 * 检查是否为有效的颜色值
 */
export const isColorValue: TypeGuard<unknown, ColorValue> = (
  value: unknown,
): value is ColorValue => {
  if (typeof value !== 'string')
    return false

  return (
    isHexColor(value)
    || isRgbColor(value)
    || isHslColor(value)
    || isHsvColor(value)
    || isNamedColor(value)
  )
}

/**
 * 检查是否为CSS命名颜色
 */
export function isNamedColor(value: string): boolean {
  const namedColors = [
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgreen',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'green',
    'greenyellow',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgreen',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen',
    'transparent',
    'currentColor',
  ]

  return namedColors.includes(value.toLowerCase())
}

/**
 * 检查是否为精确的RGB对象
 */
export const isPreciseRGB: TypeGuard<unknown, PreciseRGB> = (
  value: unknown,
): value is PreciseRGB => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.r === 'number'
    && obj.r >= 0
    && obj.r <= 255
    && typeof obj.g === 'number'
    && obj.g >= 0
    && obj.g <= 255
    && typeof obj.b === 'number'
    && obj.b >= 0
    && obj.b <= 255
    && (obj.a === undefined || (typeof obj.a === 'number' && obj.a >= 0 && obj.a <= 1))
  )
}

/**
 * 检查是否为精确的HSL对象
 */
export const isPreciseHSL: TypeGuard<unknown, PreciseHSL> = (
  value: unknown,
): value is PreciseHSL => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.h === 'number'
    && obj.h >= 0
    && obj.h <= 360
    && typeof obj.s === 'number'
    && obj.s >= 0
    && obj.s <= 100
    && typeof obj.l === 'number'
    && obj.l >= 0
    && obj.l <= 100
    && (obj.a === undefined || (typeof obj.a === 'number' && obj.a >= 0 && obj.a <= 1))
  )
}

/**
 * 检查是否为精确的HSV对象
 */
export const isPreciseHSV: TypeGuard<unknown, PreciseHSV> = (
  value: unknown,
): value is PreciseHSV => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.h === 'number'
    && obj.h >= 0
    && obj.h <= 360
    && typeof obj.s === 'number'
    && obj.s >= 0
    && obj.s <= 100
    && typeof obj.v === 'number'
    && obj.v >= 0
    && obj.v <= 100
    && (obj.a === undefined || (typeof obj.a === 'number' && obj.a >= 0 && obj.a <= 1))
  )
}

/**
 * 检查是否为LAB颜色对象
 */
export const isLABColor: TypeGuard<unknown, LABColor> = (value: unknown): value is LABColor => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.l === 'number'
    && obj.l >= 0
    && obj.l <= 100
    && typeof obj.a === 'number'
    && obj.a >= -128
    && obj.a <= 127
    && typeof obj.b === 'number'
    && obj.b >= -128
    && obj.b <= 127
    && (obj.alpha === undefined || (typeof obj.alpha === 'number' && obj.alpha >= 0 && obj.alpha <= 1))
  )
}

/**
 * 检查是否为LCH颜色对象
 */
export const isLCHColor: TypeGuard<unknown, LCHColor> = (value: unknown): value is LCHColor => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.l === 'number'
    && obj.l >= 0
    && obj.l <= 100
    && typeof obj.c === 'number'
    && obj.c >= 0
    && typeof obj.h === 'number'
    && obj.h >= 0
    && obj.h <= 360
    && (obj.alpha === undefined || (typeof obj.alpha === 'number' && obj.alpha >= 0 && obj.alpha <= 1))
  )
}

/**
 * 检查是否为有效的颜色配置
 */
export const isColorConfig: TypeGuard<unknown, ColorConfig> = (
  value: unknown,
): value is ColorConfig => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    isColorValue(obj.primary)
    && (obj.secondary === undefined || isColorValue(obj.secondary))
    && (obj.accent === undefined || isColorValue(obj.accent))
    && (obj.info === undefined || isColorValue(obj.info))
    && (obj.success === undefined || isColorValue(obj.success))
    && (obj.warning === undefined || isColorValue(obj.warning))
    && (obj.danger === undefined || isColorValue(obj.danger))
    && (obj.gray === undefined || isColorValue(obj.gray))
    && (obj.neutral === undefined || isColorValue(obj.neutral))
  )
}

/**
 * 检查是否为有效的主题配置
 */
export const isThemeConfig: TypeGuard<unknown, ThemeConfig> = (
  value: unknown,
): value is ThemeConfig => {
  if (typeof value !== 'object' || value === null)
    return false

  const obj = value as Record<string, unknown>

  return (
    typeof obj.name === 'string'
    && obj.name.length > 0
    && isColorConfig(obj.light)
    && (obj.dark === undefined || isColorConfig(obj.dark))
    && (obj.displayName === undefined || typeof obj.displayName === 'string')
    && (obj.description === undefined || typeof obj.description === 'string')
    && (obj.builtin === undefined || typeof obj.builtin === 'boolean')
  )
}

/**
 * 检查是否为有效的颜色格式
 */
export const isColorFormat: TypeGuard<unknown, ColorFormat> = (
  value: unknown,
): value is ColorFormat => {
  const validFormats: ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'lab', 'named']
  return typeof value === 'string' && validFormats.includes(value as ColorFormat)
}

/**
 * 断言函数：确保值为有效颜色值
 */
export const assertColorValue: AssertFunction<ColorValue> = (
  value: unknown,
): asserts value is ColorValue => {
  if (!isColorValue(value)) {
    throw new TypeError(`Expected a valid color value, got: ${typeof value}`)
  }
}

/**
 * 断言函数：确保值为有效颜色配置
 */
export const assertColorConfig: AssertFunction<ColorConfig> = (
  value: unknown,
): asserts value is ColorConfig => {
  if (!isColorConfig(value)) {
    throw new TypeError(`Expected a valid color config, got: ${typeof value}`)
  }
}

/**
 * 断言函数：确保值为有效主题配置
 */
export const assertThemeConfig: AssertFunction<ThemeConfig> = (
  value: unknown,
): asserts value is ThemeConfig => {
  if (!isThemeConfig(value)) {
    throw new TypeError(`Expected a valid theme config, got: ${typeof value}`)
  }
}

/**
 * 获取颜色值的格式
 */
export function getColorFormat(color: ColorValue): ColorFormat {
  if (isHexColor(color))
    return 'hex'
  if (isRgbColor(color))
    return 'rgb'
  if (isHslColor(color))
    return 'hsl'
  if (isHsvColor(color))
    return 'hsv'
  if (isNamedColor(color))
    return 'named'

  throw new Error(`Unknown color format: ${color}`)
}

/**
 * 验证颜色值并返回详细结果
 */
export function validateColorValue(value: unknown): {
  isValid: boolean
  format?: ColorFormat
  error?: string
} {
  if (!isColorValue(value)) {
    return {
      isValid: false,
      error: `Invalid color value: ${value}`,
    }
  }

  try {
    const format = getColorFormat(value)
    return {
      isValid: true,
      format,
    }
  }
  catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
