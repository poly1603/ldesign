import type { ColorTheme } from '../types'

/**
 * 颜色常量
 */
export const COLOR_CONSTANTS = {
  // RGB范围
  RGB_MIN: 0,
  RGB_MAX: 255,
  
  // HSL范围
  HUE_MIN: 0,
  HUE_MAX: 360,
  SATURATION_MIN: 0,
  SATURATION_MAX: 100,
  LIGHTNESS_MIN: 0,
  LIGHTNESS_MAX: 100,
  
  // HSV范围
  VALUE_MIN: 0,
  VALUE_MAX: 100,
  
  // CMYK范围
  CMYK_MIN: 0,
  CMYK_MAX: 100,
  
  // LAB范围
  LAB_L_MIN: 0,
  LAB_L_MAX: 100,
  LAB_A_MIN: -128,
  LAB_A_MAX: 127,
  LAB_B_MIN: -128,
  LAB_B_MAX: 127,
  
  // 对比度标准
  CONTRAST_AA: 4.5,
  CONTRAST_AAA: 7,
  CONTRAST_AA_LARGE: 3,
  CONTRAST_AAA_LARGE: 4.5,
  
  // 亮度阈值
  DARK_THRESHOLD: 0.5,
  LIGHT_THRESHOLD: 0.5
} as const

/**
 * 预设颜色主题
 */
export const PRESET_THEMES: Record<string, ColorTheme> = {
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
  },
  vuetify: {
    name: 'Vuetify',
    primary: '#1976D2',
    secondary: '#424242',
    success: '#4CAF50',
    warning: '#FB8C00',
    error: '#FF5252',
    info: '#2196F3'
  },
  element: {
    name: 'Element UI',
    primary: '#409EFF',
    secondary: '#909399',
    success: '#67C23A',
    warning: '#E6A23C',
    error: '#F56C6C',
    info: '#909399'
  }
}

/**
 * 常用颜色名称映射
 */
export const NAMED_COLORS: Record<string, string> = {
  // 基础颜色
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  silver: '#c0c0c0',
  gray: '#808080',
  grey: '#808080',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  teal: '#008080',
  navy: '#000080',
  fuchsia: '#ff00ff',
  purple: '#800080',
  
  // 扩展颜色
  orange: '#ffa500',
  pink: '#ffc0cb',
  brown: '#a52a2a',
  gold: '#ffd700',
  violet: '#ee82ee',
  indigo: '#4b0082',
  turquoise: '#40e0d0',
  coral: '#ff7f50',
  salmon: '#fa8072',
  khaki: '#f0e68c',
  lavender: '#e6e6fa',
  plum: '#dda0dd',
  orchid: '#da70d6',
  tan: '#d2b48c',
  beige: '#f5f5dc',
  mint: '#98fb98',
  azure: '#f0ffff',
  snow: '#fffafa',
  ivory: '#fffff0',
  linen: '#faf0e6',
  
  // 深色变体
  darkred: '#8b0000',
  darkgreen: '#006400',
  darkblue: '#00008b',
  darkorange: '#ff8c00',
  darkviolet: '#9400d3',
  darkgray: '#a9a9a9',
  darkgrey: '#a9a9a9',
  
  // 浅色变体
  lightred: '#ffcccb',
  lightgreen: '#90ee90',
  lightblue: '#add8e6',
  lightyellow: '#ffffe0',
  lightpink: '#ffb6c1',
  lightgray: '#d3d3d3',
  lightgrey: '#d3d3d3',
  
  // 透明色
  transparent: '#00000000'
}

/**
 * 颜色格式正则表达式
 */
export const COLOR_REGEX = {
  HEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  HEX_SHORT: /^#[A-Fa-f0-9]{3}$/,
  HEX_LONG: /^#[A-Fa-f0-9]{6}$/,
  RGB: /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/,
  RGBA: /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/,
  HSL: /^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/,
  HSLA: /^hsla\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)$/
} as const

/**
 * 混合模式常量
 */
export const BLEND_MODES = {
  NORMAL: 'normal',
  MULTIPLY: 'multiply',
  SCREEN: 'screen',
  OVERLAY: 'overlay',
  SOFT_LIGHT: 'soft-light',
  HARD_LIGHT: 'hard-light',
  COLOR_DODGE: 'color-dodge',
  COLOR_BURN: 'color-burn',
  DARKEN: 'darken',
  LIGHTEN: 'lighten',
  DIFFERENCE: 'difference',
  EXCLUSION: 'exclusion'
} as const

/**
 * 颜色空间常量
 */
export const COLOR_SPACES = {
  RGB: 'rgb',
  HSL: 'hsl',
  HSV: 'hsv',
  CMYK: 'cmyk',
  LAB: 'lab',
  XYZ: 'xyz'
} as const

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  format: 'hex' as const,
  precision: 2,
  alpha: 1,
  validation: true,
  theme: 'material' as const
}