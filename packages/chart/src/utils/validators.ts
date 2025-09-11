/**
 * 数据验证器
 * 
 * 提供各种数据验证功能，确保数据的有效性和安全性
 */

import type { ChartData, DataPoint, DataSeries, ChartConfig, ThemeConfig } from '../core/types'
import { CHART_TYPES, MAX_DATA_POINTS, ERROR_MESSAGES } from '../core/constants'

// ============================================================================
// 验证结果类型
// ============================================================================

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误消息列表 */
  errors: string[]
  /** 警告消息列表 */
  warnings: string[]
}

/**
 * 数据验证选项
 */
export interface ValidationOptions {
  /** 是否严格模式 */
  strict?: boolean
  /** 最大数据点数量 */
  maxDataPoints?: number
  /** 是否检查性能 */
  checkPerformance?: boolean
}

// ============================================================================
// 主要验证函数
// ============================================================================

/**
 * 验证图表配置
 * @param config - 图表配置
 * @param options - 验证选项
 * @returns 验证结果
 */
export function validateChartConfig(
  config: any,
  options: ValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  // 基础类型检查
  if (!config || typeof config !== 'object') {
    result.valid = false
    result.errors.push('配置必须是一个对象')
    return result
  }

  // 检查必需字段
  if (!config.type) {
    result.valid = false
    result.errors.push('缺少必需的 type 字段')
  } else if (!CHART_TYPES.includes(config.type)) {
    result.valid = false
    result.errors.push(`不支持的图表类型: ${config.type}`)
  }

  if (!config.data) {
    result.valid = false
    result.errors.push('缺少必需的 data 字段')
  } else {
    // 验证数据
    const dataResult = validateChartData(config.data, options)
    result.errors.push(...dataResult.errors)
    result.warnings.push(...dataResult.warnings)
    if (!dataResult.valid) {
      result.valid = false
    }
  }

  // 验证可选字段
  if (config.theme && typeof config.theme === 'object') {
    const themeResult = validateThemeConfig(config.theme)
    result.errors.push(...themeResult.errors)
    result.warnings.push(...themeResult.warnings)
  }

  if (config.size) {
    const sizeResult = validateSizeConfig(config.size)
    result.errors.push(...sizeResult.errors)
    result.warnings.push(...sizeResult.warnings)
  }

  return result
}

/**
 * 验证图表数据
 * @param data - 图表数据
 * @param options - 验证选项
 * @returns 验证结果
 */
export function validateChartData(
  data: any,
  options: ValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!data) {
    result.valid = false
    result.errors.push('数据不能为空')
    return result
  }

  if (Array.isArray(data)) {
    // 简单数据格式
    const simpleResult = validateSimpleData(data, options)
    result.errors.push(...simpleResult.errors)
    result.warnings.push(...simpleResult.warnings)
    if (!simpleResult.valid) {
      result.valid = false
    }
  } else if (typeof data === 'object') {
    // 复杂数据格式
    const complexResult = validateComplexData(data, options)
    result.errors.push(...complexResult.errors)
    result.warnings.push(...complexResult.warnings)
    if (!complexResult.valid) {
      result.valid = false
    }
  } else {
    result.valid = false
    result.errors.push('数据格式不正确，必须是数组或对象')
  }

  return result
}

/**
 * 验证简单数据格式
 * @param data - DataPoint 数组
 * @param options - 验证选项
 * @returns 验证结果
 */
export function validateSimpleData(
  data: DataPoint[],
  options: ValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!Array.isArray(data)) {
    result.valid = false
    result.errors.push('简单数据格式必须是数组')
    return result
  }

  if (data.length === 0) {
    result.valid = false
    result.errors.push('数据数组不能为空')
    return result
  }

  // 检查数据点数量
  const maxPoints = options.maxDataPoints || MAX_DATA_POINTS
  if (data.length > maxPoints) {
    if (options.checkPerformance) {
      result.warnings.push(`数据点数量 (${data.length}) 超过建议值 (${maxPoints})，可能影响性能`)
    }
  }

  // 验证每个数据点
  const nameSet = new Set<string>()
  for (let i = 0; i < data.length; i++) {
    const point = data[i]
    const pointResult = validateDataPoint(point, i)
    result.errors.push(...pointResult.errors)
    result.warnings.push(...pointResult.warnings)
    
    if (!pointResult.valid) {
      result.valid = false
    }

    // 检查重复名称
    if (point && point.name) {
      if (nameSet.has(point.name)) {
        result.warnings.push(`发现重复的数据点名称: ${point.name}`)
      }
      nameSet.add(point.name)
    }
  }

  return result
}

/**
 * 验证复杂数据格式
 * @param data - 复杂数据对象
 * @param options - 验证选项
 * @returns 验证结果
 */
export function validateComplexData(
  data: any,
  options: ValidationOptions = {}
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!data.series) {
    result.valid = false
    result.errors.push('复杂数据格式必须包含 series 字段')
    return result
  }

  if (!Array.isArray(data.series)) {
    result.valid = false
    result.errors.push('series 字段必须是数组')
    return result
  }

  if (data.series.length === 0) {
    result.valid = false
    result.errors.push('series 数组不能为空')
    return result
  }

  // 验证分类数据
  if (data.categories && !Array.isArray(data.categories)) {
    result.valid = false
    result.errors.push('categories 字段必须是数组')
  }

  // 验证每个系列
  const seriesNameSet = new Set<string>()
  for (let i = 0; i < data.series.length; i++) {
    const series = data.series[i]
    const seriesResult = validateDataSeries(series, i, data.categories)
    result.errors.push(...seriesResult.errors)
    result.warnings.push(...seriesResult.warnings)
    
    if (!seriesResult.valid) {
      result.valid = false
    }

    // 检查重复系列名称
    if (series && series.name) {
      if (seriesNameSet.has(series.name)) {
        result.warnings.push(`发现重复的系列名称: ${series.name}`)
      }
      seriesNameSet.add(series.name)
    }
  }

  return result
}

/**
 * 验证数据点
 * @param point - 数据点
 * @param index - 索引
 * @returns 验证结果
 */
export function validateDataPoint(point: any, index?: number): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  const prefix = index !== undefined ? `数据点 [${index}]` : '数据点'

  if (!point || typeof point !== 'object') {
    result.valid = false
    result.errors.push(`${prefix} 必须是对象`)
    return result
  }

  // 检查必需字段
  if (!point.name || typeof point.name !== 'string') {
    result.valid = false
    result.errors.push(`${prefix} 缺少有效的 name 字段`)
  }

  if (point.value === undefined || point.value === null) {
    result.valid = false
    result.errors.push(`${prefix} 缺少 value 字段`)
  } else if (typeof point.value !== 'number' && !Array.isArray(point.value)) {
    result.valid = false
    result.errors.push(`${prefix} 的 value 字段必须是数字或数字数组`)
  } else if (Array.isArray(point.value)) {
    // 验证数组值
    if (point.value.length === 0) {
      result.valid = false
      result.errors.push(`${prefix} 的 value 数组不能为空`)
    } else if (!point.value.every(v => typeof v === 'number' && !isNaN(v))) {
      result.valid = false
      result.errors.push(`${prefix} 的 value 数组必须包含有效数字`)
    }
  } else if (typeof point.value === 'number' && isNaN(point.value)) {
    result.valid = false
    result.errors.push(`${prefix} 的 value 不能是 NaN`)
  }

  return result
}

/**
 * 验证数据系列
 * @param series - 数据系列
 * @param index - 索引
 * @param categories - 分类数据
 * @returns 验证结果
 */
export function validateDataSeries(
  series: any,
  index?: number,
  categories?: string[]
): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  const prefix = index !== undefined ? `系列 [${index}]` : '系列'

  if (!series || typeof series !== 'object') {
    result.valid = false
    result.errors.push(`${prefix} 必须是对象`)
    return result
  }

  // 检查必需字段
  if (!series.name || typeof series.name !== 'string') {
    result.valid = false
    result.errors.push(`${prefix} 缺少有效的 name 字段`)
  }

  if (!Array.isArray(series.data)) {
    result.valid = false
    result.errors.push(`${prefix} 的 data 字段必须是数组`)
  } else {
    if (series.data.length === 0) {
      result.valid = false
      result.errors.push(`${prefix} 的 data 数组不能为空`)
    } else if (!series.data.every((v: any) => typeof v === 'number' && !isNaN(v))) {
      result.valid = false
      result.errors.push(`${prefix} 的 data 数组必须包含有效数字`)
    }

    // 检查数据长度与分类长度是否匹配
    if (categories && series.data.length !== categories.length) {
      result.warnings.push(`${prefix} 的数据长度 (${series.data.length}) 与分类长度 (${categories.length}) 不匹配`)
    }
  }

  // 检查可选的 type 字段
  if (series.type && !CHART_TYPES.includes(series.type)) {
    result.warnings.push(`${prefix} 包含不支持的图表类型: ${series.type}`)
  }

  return result
}

/**
 * 验证主题配置
 * @param theme - 主题配置
 * @returns 验证结果
 */
export function validateThemeConfig(theme: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!theme || typeof theme !== 'object') {
    result.valid = false
    result.errors.push('主题配置必须是对象')
    return result
  }

  if (!theme.name || typeof theme.name !== 'string') {
    result.valid = false
    result.errors.push('主题配置缺少有效的 name 字段')
  }

  if (!theme.colors || typeof theme.colors !== 'object') {
    result.valid = false
    result.errors.push('主题配置缺少有效的 colors 字段')
  }

  return result
}

/**
 * 验证尺寸配置
 * @param size - 尺寸配置
 * @returns 验证结果
 */
export function validateSizeConfig(size: any): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  }

  if (!size || typeof size !== 'object') {
    result.valid = false
    result.errors.push('尺寸配置必须是对象')
    return result
  }

  if (size.width !== undefined) {
    if (typeof size.width !== 'number' && typeof size.width !== 'string') {
      result.valid = false
      result.errors.push('width 必须是数字或字符串')
    } else if (typeof size.width === 'number' && size.width <= 0) {
      result.valid = false
      result.errors.push('width 必须大于 0')
    }
  }

  if (size.height !== undefined) {
    if (typeof size.height !== 'number' && typeof size.height !== 'string') {
      result.valid = false
      result.errors.push('height 必须是数字或字符串')
    } else if (typeof size.height === 'number' && size.height <= 0) {
      result.valid = false
      result.errors.push('height 必须大于 0')
    }
  }

  return result
}

/**
 * 创建验证错误
 * @param message - 错误消息
 * @param field - 字段名
 * @returns 错误对象
 */
export function createValidationError(message: string, field?: string): Error {
  const error = new Error(field ? `${field}: ${message}` : message)
  error.name = 'ValidationError'
  return error
}
