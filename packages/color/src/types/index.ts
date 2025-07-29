/**
 * RGB颜色值
 */
export interface RGBColor {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
  a?: number // 0-1
}

/**
 * HSL颜色值
 */
export interface HSLColor {
  h: number // 0-360
  s: number // 0-100
  l: number // 0-100
  a?: number // 0-1
}

/**
 * HSV颜色值
 */
export interface HSVColor {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
  a?: number // 0-1
}

/**
 * CMYK颜色值
 */
export interface CMYKColor {
  c: number // 0-100
  m: number // 0-100
  y: number // 0-100
  k: number // 0-100
}

/**
 * LAB颜色值
 */
export interface LABColor {
  l: number // 0-100
  a: number // -128-127
  b: number // -128-127
}

/**
 * 颜色格式类型
 */
export type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva' | 'cmyk' | 'lab'

/**
 * 颜色输入类型
 */
export type ColorInput = string | RGBColor | HSLColor | HSVColor | CMYKColor | LABColor

/**
 * 调色板类型
 */
export enum PaletteType {
  MONOCHROMATIC = 'monochromatic',
  ANALOGOUS = 'analogous',
  COMPLEMENTARY = 'complementary',
  TRIADIC = 'triadic',
  TETRADIC = 'tetradic',
  SPLIT_COMPLEMENTARY = 'split-complementary'
}

/**
 * 调色板配置
 */
export interface PaletteConfig {
  type: PaletteType
  count?: number
  saturation?: number
  lightness?: number
  angle?: number
}

/**
 * 颜色主题
 */
export interface ColorTheme {
  name: string
  primary: string
  secondary?: string
  accent?: string
  background?: string
  surface?: string
  error?: string
  warning?: string
  info?: string
  success?: string
  onPrimary?: string
  onSecondary?: string
  onBackground?: string
  onSurface?: string
  onError?: string
}

/**
 * 颜色对比度信息
 */
export interface ContrastInfo {
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  normal: boolean
  large: boolean
}

/**
 * 颜色分析结果
 */
export interface ColorAnalysis {
  brightness: number
  luminance: number
  isDark: boolean
  isLight: boolean
  temperature: 'warm' | 'cool' | 'neutral'
  dominantChannel: 'red' | 'green' | 'blue'
}

/**
 * 渐变配置
 */
export interface GradientConfig {
  type: 'linear' | 'radial' | 'conic'
  direction?: number | string
  stops: GradientStop[]
}

/**
 * 渐变停止点
 */
export interface GradientStop {
  color: string
  position: number // 0-100
}

/**
 * 颜色混合模式
 */
export enum BlendMode {
  NORMAL = 'normal',
  MULTIPLY = 'multiply',
  SCREEN = 'screen',
  OVERLAY = 'overlay',
  SOFT_LIGHT = 'soft-light',
  HARD_LIGHT = 'hard-light',
  COLOR_DODGE = 'color-dodge',
  COLOR_BURN = 'color-burn',
  DARKEN = 'darken',
  LIGHTEN = 'lighten',
  DIFFERENCE = 'difference',
  EXCLUSION = 'exclusion'
}

/**
 * 颜色空间
 */
export enum ColorSpace {
  RGB = 'rgb',
  HSL = 'hsl',
  HSV = 'hsv',
  CMYK = 'cmyk',
  LAB = 'lab',
  XYZ = 'xyz'
}

/**
 * 颜色插件配置
 */
export interface ColorPluginConfig {
  /** 默认颜色格式 */
  defaultFormat?: ColorFormat
  /** 是否启用颜色验证 */
  validation?: boolean
  /** 预设主题 */
  themes?: ColorTheme[]
  /** 自定义颜色常量 */
  constants?: Record<string, string>
}