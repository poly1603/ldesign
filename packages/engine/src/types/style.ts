/**
 * 样式管理类型定义
 * 包含样式管理器、主题等相关类型
 */

// 样式管理器接口
export interface StyleManager {
  add: (styles: string | CSSStyleSheet, options?: StyleOptions) => void
  remove: (id: string) => void
  update: (id: string, styles: string) => void
  get: (id: string) => CSSStyleSheet | undefined
  getAll: () => CSSStyleSheet[]
  clear: () => void
  inject: (styles: string, target?: HTMLElement) => void
  extract: (selector: string) => string
  compile: (template: string, variables: Record<string, unknown>) => string
}

// 样式选项
export interface StyleOptions {
  id?: string
  priority?: number
  scoped?: boolean
  media?: string
  disabled?: boolean
  source?: string
  metadata?: Record<string, unknown>
}

// 主题管理器接口
export interface ThemeManager {
  set: (theme: Theme) => void
  get: () => Theme
  getAll: () => Theme[]
  create: (name: string, colors: ColorPalette, options?: ThemeOptions) => Theme
  update: (name: string, updates: Partial<Theme>) => void
  delete: (name: string) => void
  export: (name: string) => string
  import: (themeData: string) => Theme
  preview: (theme: Theme) => void
  reset: () => void
}

// 主题接口
export interface Theme {
  name: string
  description?: string
  author?: string
  version: string
  colors: ColorPalette
  typography: Typography
  spacing: Spacing
  shadows: Shadows
  borders: Borders
  animations: Animations
  breakpoints: Breakpoints
  metadata?: Record<string, unknown>
}

// 颜色调色板
export interface ColorPalette {
  primary: ColorVariants
  secondary: ColorVariants
  success: ColorVariants
  warning: ColorVariants
  error: ColorVariants
  info: ColorVariants
  neutral: ColorVariants
  background: ColorVariants
  surface: ColorVariants
  text: ColorVariants
  border: ColorVariants
  overlay: ColorVariants
}

// 颜色变体
export interface ColorVariants {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  light?: string
  main: string
  dark?: string
  contrast?: string
}

// 颜色
export interface Color {
  hex: string
  rgb: RGB
  hsl: HSL
  alpha: number
  name?: string
  isLight: boolean
  isDark: boolean
  contrast: string
}

// RGB颜色
export interface RGB {
  r: number
  g: number
  b: number
}

// HSL颜色
export interface HSL {
  h: number
  s: number
  l: number
}

// 排版
export interface Typography {
  fontFamily: FontFamily
  fontSize: FontSize
  fontWeight: FontWeight
  lineHeight: LineHeight
  letterSpacing: LetterSpacing
  textAlign: TextAlign
  textTransform: TextTransform
  textDecoration: TextDecoration
}

// 字体族
export interface FontFamily {
  primary: string[]
  secondary: string[]
  monospace: string[]
  display: string[]
  body: string[]
}

// 字体大小
export interface FontSize {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
  '5xl': string
  '6xl': string
  '7xl': string
  '8xl': string
  '9xl': string
}

// 字体粗细
export interface FontWeight {
  thin: number
  extralight: number
  light: number
  normal: number
  medium: number
  semibold: number
  bold: number
  extrabold: number
  black: number
}

// 行高
export interface LineHeight {
  none: number
  tight: number
  snug: number
  normal: number
  relaxed: number
  loose: number
}

// 字母间距
export interface LetterSpacing {
  tighter: string
  tight: string
  normal: string
  wide: string
  wider: string
  widest: string
}

// 文本对齐
export type TextAlign =
  | 'left'
  | 'center'
  | 'right'
  | 'justify'
  | 'start'
  | 'end'

// 文本转换
export type TextTransform = 'none' | 'uppercase' | 'lowercase' | 'capitalize'

// 文本装饰
export type TextDecoration = 'none' | 'underline' | 'overline' | 'line-through'

// 间距
export interface Spacing {
  px: string
  0: string
  0.5: string
  1: string
  1.5: string
  2: string
  2.5: string
  3: string
  3.5: string
  4: string
  5: string
  6: string
  7: string
  8: string
  9: string
  10: string
  11: string
  12: string
  14: string
  16: string
  20: string
  24: string
  28: string
  32: string
  36: string
  40: string
  44: string
  48: string
  52: string
  56: string
  60: string
  64: string
  72: string
  80: string
  96: string
}

// 阴影
export interface Shadows {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
  '2xl': string
  inner: string
}

// 边框
export interface Borders {
  none: string
  sm: string
  base: string
  md: string
  lg: string
  xl: string
}

// 动画
export interface Animations {
  duration: Duration
  easing: Easing
  delay: Delay
  iteration: Iteration
  direction: Direction
  fillMode: FillMode
  playState: PlayState
}

// 持续时间
export interface Duration {
  fast: string
  base: string
  slow: string
  slower: string
}

// 缓动函数
export interface Easing {
  linear: string
  in: string
  out: string
  inOut: string
  bounce: string
  elastic: string
}

// 延迟
export interface Delay {
  none: string
  fast: string
  base: string
  slow: string
}

// 迭代次数
export interface Iteration {
  once: number
  twice: number
  infinite: number
}

// 方向
export type Direction = 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'

// 填充模式
export type FillMode = 'none' | 'forwards' | 'backwards' | 'both'

// 播放状态
export type PlayState = 'running' | 'paused'

// 断点
export interface Breakpoints {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// 主题选项
export interface ThemeOptions {
  description?: string
  author?: string
  version?: string
  metadata?: Record<string, unknown>
}

// CSS变量管理器
export interface CSSVariableManager {
  set: (name: string, value: string, scope?: string) => void
  get: (name: string, scope?: string) => string | undefined
  delete: (name: string, scope?: string) => boolean
  getAll: (scope?: string) => Record<string, string>
  clear: (scope?: string) => void
  export: (scope?: string) => string
  import: (variables: Record<string, string>, scope?: string) => void
}

// 样式编译器
export interface StyleCompiler {
  compile: (template: string, variables: Record<string, unknown>) => string
  minify: (css: string) => string
  autoprefix: (css: string) => string
  validate: (css: string) => StyleValidationResult
  transform: (css: string, transforms: StyleTransform[]) => string
}

// 样式转换
export interface StyleTransform {
  name: string
  apply: (css: string) => string
  options?: Record<string, unknown>
}

// 样式验证结果
export interface StyleValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}
