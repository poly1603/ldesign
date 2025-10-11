/**
 * 品牌类型系统
 * 
 * 提供更强的类型安全，防止不同类型的字符串混淆
 * 
 * @example
 * ```ts
 * const hex: HexColor = createHexColor('#ff0000')
 * const rgb: RgbString = createRgbString('rgb(255, 0, 0)')
 * 
 * // TypeScript 会阻止这种混淆
 * const invalid: HexColor = rgb // ❌ 类型错误
 * ```
 */

/**
 * 品牌类型辅助工具
 */
type Brand<K, T> = K & { readonly __brand: T }

/**
 * Hex 颜色字符串（带品牌）
 * 
 * 格式: #RRGGBB (小写)
 */
export type HexColor = Brand<string, 'HexColor'>

/**
 * RGB 颜色字符串（带品牌）
 * 
 * 格式: rgb(r, g, b)
 */
export type RgbString = Brand<string, 'RgbString'>

/**
 * HSL 颜色字符串（带品牌）
 * 
 * 格式: hsl(h, s%, l%)
 */
export type HslString = Brand<string, 'HslString'>

/**
 * 主题名称（带品牌）
 */
export type ThemeName = Brand<string, 'ThemeName'>

/**
 * 缓存键（带品牌）
 */
export type CacheKey = Brand<string, 'CacheKey'>

/**
 * 创建类型安全的 Hex 颜色值
 * 
 * @param value 十六进制颜色字符串
 * @returns 品牌化的 HexColor 或 null
 * 
 * @example
 * ```ts
 * const color = createHexColor('#ff0000')
 * if (color) {
 *   // TypeScript 知道这里 color 是 HexColor 类型
 *   useColor(color)
 * }
 * ```
 */
export function createHexColor(value: string): HexColor | null {
  // 移除空格和#前缀
  let hex = value.trim().replace(/^#/, '')
  
  // 支持3位格式
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }
  
  // 验证格式
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    return null
  }
  
  return `#${hex.toLowerCase()}` as HexColor
}

/**
 * 检查是否为有效的 HexColor
 */
export function isHexColor(value: unknown): value is HexColor {
  if (typeof value !== 'string') return false
  return createHexColor(value) !== null
}

/**
 * 创建类型安全的 RGB 字符串
 */
export function createRgbString(r: number, g: number, b: number): RgbString | null {
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})` as RgbString
}

/**
 * 检查是否为有效的 RgbString
 */
export function isRgbString(value: unknown): value is RgbString {
  if (typeof value !== 'string') return false
  return /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/.test(value)
}

/**
 * 创建类型安全的 HSL 字符串
 */
export function createHslString(h: number, s: number, l: number): HslString | null {
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    return null
  }
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)` as HslString
}

/**
 * 检查是否为有效的 HslString
 */
export function isHslString(value: unknown): value is HslString {
  if (typeof value !== 'string') return false
  return /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/.test(value)
}

/**
 * 创建类型安全的主题名称
 */
export function createThemeName(value: string): ThemeName | null {
  const trimmed = value.trim()
  if (!trimmed || !/^[a-z0-9-_]+$/i.test(trimmed)) {
    return null
  }
  return trimmed as ThemeName
}

/**
 * 检查是否为有效的 ThemeName
 */
export function isThemeName(value: unknown): value is ThemeName {
  if (typeof value !== 'string') return false
  return createThemeName(value) !== null
}

/**
 * 创建类型安全的缓存键
 */
export function createCacheKey(...parts: (string | number)[]): CacheKey {
  return parts.join(':') as CacheKey
}

/**
 * 类型安全的缓存
 * 
 * 使用品牌类型确保键值类型匹配
 * 
 * @example
 * ```ts
 * interface ColorCache {
 *   [key: string]: HexColor | RgbString
 * }
 * 
 * const cache = new TypedCache<ColorCache>()
 * cache.set(createCacheKey('primary'), createHexColor('#ff0000')!)
 * const color = cache.get(createCacheKey('primary'))
 * ```
 */
export class TypedCache<T extends Record<string, any>> {
  private cache = new Map<CacheKey, T[keyof T]>()
  
  /**
   * 获取缓存值
   */
  get(key: CacheKey): T[keyof T] | undefined {
    return this.cache.get(key)
  }
  
  /**
   * 设置缓存值
   */
  set(key: CacheKey, value: T[keyof T]): void {
    this.cache.set(key, value)
  }
  
  /**
   * 删除缓存值
   */
  delete(key: CacheKey): boolean {
    return this.cache.delete(key)
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }
  
  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }
  
  /**
   * 检查键是否存在
   */
  has(key: CacheKey): boolean {
    return this.cache.has(key)
  }
}

/**
 * 颜色值联合类型
 */
export type ColorValue = HexColor | RgbString | HslString

/**
 * 类型守卫：检查是否为颜色值
 */
export function isColorValue(value: unknown): value is ColorValue {
  return isHexColor(value) || isRgbString(value) || isHslString(value)
}

/**
 * 安全的颜色转换结果
 */
export type SafeConversionResult<T> = 
  | { success: true, value: T }
  | { success: false, error: string }

/**
 * 创建成功的转换结果
 */
export function success<T>(value: T): SafeConversionResult<T> {
  return { success: true, value }
}

/**
 * 创建失败的转换结果
 */
export function failure<T>(error: string): SafeConversionResult<T> {
  return { success: false, error }
}
