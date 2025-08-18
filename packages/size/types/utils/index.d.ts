import { SizeMode } from '../types/index.js'

/**
 * 工具函数
 */

/**
 * 检查是否为有效的尺寸模式
 */
declare function isValidSizeMode(mode: string): mode is SizeMode
/**
 * 获取下一个尺寸模式
 */
declare function getNextSizeMode(currentMode: SizeMode): SizeMode
/**
 * 获取上一个尺寸模式
 */
declare function getPreviousSizeMode(currentMode: SizeMode): SizeMode
/**
 * 比较两个尺寸模式的大小
 */
declare function compareSizeModes(mode1: SizeMode, mode2: SizeMode): number
/**
 * 获取尺寸模式的显示名称
 */
declare function getSizeModeDisplayName(mode: SizeMode): string
/**
 * 从字符串解析尺寸模式
 */
declare function parseSizeMode(value: string): SizeMode | null
/**
 * 计算尺寸缩放比例
 */
declare function calculateSizeScale(
  fromMode: SizeMode,
  toMode: SizeMode
): number
/**
 * 格式化CSS值
 */
declare function formatCSSValue(value: string | number, unit?: string): string
/**
 * 解析CSS值
 */
declare function parseCSSValue(value: string): {
  number: number
  unit: string
}
/**
 * 深度合并配置对象
 */
declare function deepMergeConfig<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T
/**
 * 防抖函数
 */
declare function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
/**
 * 节流函数
 */
declare function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void
declare function isValidInput(input: unknown): boolean

export {
  calculateSizeScale,
  compareSizeModes,
  debounce,
  deepMergeConfig,
  formatCSSValue,
  getNextSizeMode,
  getPreviousSizeMode,
  getSizeModeDisplayName,
  isValidInput,
  isValidSizeMode,
  parseCSSValue,
  parseSizeMode,
  throttle,
}
