/**
 * 统一的错误处理工具
 * 提供一致的错误处理和验证机制
 */

/**
 * 颜色相关错误类型
 */
export class ColorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message)
    this.name = 'ColorError'
  }
}

/**
 * 验证错误类型
 */
export class ValidationError extends ColorError {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * 转换错误类型
 */
export class ConversionError extends ColorError {
  constructor(
    message: string,
    public readonly from: string,
    public readonly to: string,
  ) {
    super(message, 'CONVERSION_ERROR')
    this.name = 'ConversionError'
  }
}

/**
 * 错误代码常量
 */
export const ERROR_CODES = {
  INVALID_HEX: 'INVALID_HEX',
  INVALID_RGB: 'INVALID_RGB',
  INVALID_HSL: 'INVALID_HSL',
  INVALID_HSV: 'INVALID_HSV',
  INVALID_RANGE: 'INVALID_RANGE',
  CONVERSION_FAILED: 'CONVERSION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
} as const

/**
 * 验证 hex 颜色值并抛出详细错误
 */
export function validateHexColor(hex: string): void {
  if (!hex || typeof hex !== 'string') {
    throw new ValidationError(`Invalid hex color: expected string, got ${typeof hex}`, 'hex')
  }

  const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`
  const hexPattern = /^#[0-9a-f]{6}$/i

  if (!hexPattern.test(normalizedHex)) {
    throw new ValidationError(`Invalid hex color format: "${hex}". Expected format: #RRGGBB`, 'hex')
  }
}

/**
 * 验证 RGB 颜色值并抛出详细错误
 */
export function validateRgbColor(r: number, g: number, b: number): void {
  const values = [
    { value: r, name: 'red' },
    { value: g, name: 'green' },
    { value: b, name: 'blue' },
  ]

  for (const { value, name } of values) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new ValidationError(`Invalid ${name} value: expected number, got ${typeof value}`, name)
    }

    if (value < 0 || value > 255) {
      throw new ValidationError(`Invalid ${name} value: ${value}. Must be between 0 and 255`, name)
    }
  }
}

/**
 * 验证 HSL 颜色值并抛出详细错误
 */
export function validateHslColor(h: number, s: number, l: number): void {
  if (typeof h !== 'number' || Number.isNaN(h)) {
    throw new ValidationError(`Invalid hue value: expected number, got ${typeof h}`, 'hue')
  }

  if (typeof s !== 'number' || Number.isNaN(s) || s < 0 || s > 100) {
    throw new ValidationError(
      `Invalid saturation value: ${s}. Must be between 0 and 100`,
      'saturation',
    )
  }

  if (typeof l !== 'number' || Number.isNaN(l) || l < 0 || l > 100) {
    throw new ValidationError(
      `Invalid lightness value: ${l}. Must be between 0 and 100`,
      'lightness',
    )
  }
}

/**
 * 验证数值范围
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): void {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new ValidationError(
      `Invalid ${fieldName}: expected number, got ${typeof value}`,
      fieldName,
    )
  }

  if (value < min || value > max) {
    throw new ValidationError(
      `Invalid ${fieldName}: ${value}. Must be between ${min} and ${max}`,
      fieldName,
    )
  }
}

/**
 * 安全的颜色转换包装器
 */
export function safeColorConversion<T>(
  operation: () => T,
  from: string,
  to: string,
  fallback?: T,
): T {
  try {
    return operation()
  }
  catch (error) {
    if (error instanceof ColorError) {
      throw error
    }

    const conversionError = new ConversionError(
      `Failed to convert color from ${from} to ${to}: ${error instanceof Error ? error.message : String(error)}`,
      from,
      to,
    )

    if (fallback !== undefined) {
      console.warn(conversionError.message)
      return fallback
    }

    throw conversionError
  }
}

/**
 * 创建带有上下文的错误消息
 */
export function createContextualError(baseMessage: string, context: Record<string, any>): string {
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(', ')

  return `${baseMessage} (Context: ${contextStr})`
}

/**
 * 错误恢复策略
 */
export interface ErrorRecoveryStrategy<T> {
  /** 尝试修复输入值 */
  attemptFix?: (input: any) => T | null
  /** 提供默认值 */
  defaultValue?: T
  /** 是否记录警告 */
  logWarning?: boolean
}

/**
 * 带错误恢复的操作执行器
 */
export function executeWithRecovery<T>(
  operation: () => T,
  strategy: ErrorRecoveryStrategy<T> = {},
): T {
  try {
    return operation()
  }
  catch (error) {
    const { attemptFix, defaultValue, logWarning = true } = strategy

    if (logWarning) {
      console.warn('Operation failed, attempting recovery:', error)
    }

    // 尝试修复
    if (attemptFix) {
      try {
        const fixed = attemptFix(error)
        if (fixed !== null) {
          return fixed
        }
      }
      catch (fixError) {
        if (logWarning) {
          console.warn('Fix attempt failed:', fixError)
        }
      }
    }

    // 使用默认值
    if (defaultValue !== undefined) {
      return defaultValue
    }

    // 重新抛出原始错误
    throw error
  }
}
