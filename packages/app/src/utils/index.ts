/**
 * 简化的工具函数集合
 */

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}`
}

// 导出缓存相关工具函数
export { createCache, defaultCache } from '@ldesign/cache'

// 导出颜色相关工具函数
export {
  hexToHsl,
  hexToRgb,
  hslToHex,
  isValidHex,
  normalizeHex,
  rgbToHex,
} from '@ldesign/color'

// 导出加密相关工具函数
export { base64, decrypt, encrypt, hash, hex, hmac } from '@ldesign/crypto'

// 导出尺寸相关工具函数
export {
  calculateSizeScale,
  formatCSSValue,
  getNextSizeMode,
  getPreviousSizeMode,
  isValidSizeMode,
} from '@ldesign/size'

// 导出状态管理相关工具函数
export { useAction, useGetter, useState, useStore } from '@ldesign/store'
