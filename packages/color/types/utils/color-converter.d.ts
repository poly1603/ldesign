/**
 * 颜色转换工具函数
 */
/**
 * HSL 颜色接口
 */
interface HSL {
  h: number
  s: number
  l: number
}
/**
 * RGB 颜色接口
 */
interface RGB {
  r: number
  g: number
  b: number
}
/**
 * 将 hex 颜色转换为 RGB
 */
declare function hexToRgb(hex: string): RGB | null
/**
 * 将 RGB 颜色转换为 hex
 */
declare function rgbToHex(r: number, g: number, b: number): string
/**
 * 将 RGB 颜色转换为 HSL
 */
declare function rgbToHsl(r: number, g: number, b: number): HSL
/**
 * 将 HSL 颜色转换为 RGB
 */
declare function hslToRgb(h: number, s: number, l: number): RGB
/**
 * 将 hex 颜色转换为 HSL
 */
declare function hexToHsl(hex: string): HSL | null
/**
 * 将 HSL 颜色转换为 hex
 */
declare function hslToHex(h: number, s: number, l: number): string
/**
 * 标准化色相值到 0-360 范围
 */
declare function normalizeHue(hue: number): number
/**
 * 限制值到指定范围
 */
declare function clamp(value: number, min: number, max: number): number
/**
 * 检查颜色字符串是否为有效的 hex 格式
 */
declare function isValidHex(hex: string): boolean
/**
 * 标准化 hex 颜色字符串
 */
declare function normalizeHex(hex: string): string

export {
  clamp,
  hexToHsl,
  hexToRgb,
  hslToHex,
  hslToRgb,
  isValidHex,
  normalizeHex,
  normalizeHue,
  rgbToHex,
  rgbToHsl,
}
export type { HSL, RGB }
