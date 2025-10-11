/**
import { getLogger } from '../logger/unified-logger';

const logger = getLogger('config-validators');
 * 配置验证器模块
 *
 * 提供配置验证相关的类型定义和工具函数
 */

import {
  isBoolean,
  isNumber,
  isString,
  isValidObject,
} from './type-safety'

// 重新导出配置加载器相关类型和类
export type {
  ConfigLoader,
  ConfigObject,
  ConfigValue,
} from '../config/loaders'
export {
  CompositeConfigLoader,
  EnvironmentConfigLoader,
  JsonConfigLoader,
  LocalStorageConfigLoader,
  MemoryConfigLoader,
} from '../config/loaders'

// 配置验证器类型
export interface ConfigValidator<T = unknown> {
  validate: (value: unknown) => value is T
  message?: string
  transform?: (value: unknown) => T
}

// 配置模式定义
export interface ConfigSchema {
  [key: string]: {
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any'
    required?: boolean
    default?: unknown
    validator?: ConfigValidator
    description?: string
    deprecated?: boolean
    deprecationMessage?: string
    children?: ConfigSchema // 用于嵌套对象验证
  }
}

// 配置变更事件
export interface ConfigChangeEvent {
  key: string
  oldValue: unknown
  newValue: unknown
  timestamp: number
}

/**
 * 验证配置类型
 *
 * @param value 要验证的值
 * @param type 期望的类型
 * @returns 是否匹配类型
 */
export function validateConfigType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return isString(value)
    case 'number':
      return isNumber(value)
    case 'boolean':
      return isBoolean(value)
    case 'object':
      return isValidObject(value)
    case 'array':
      return Array.isArray(value)
    case 'any':
      return true
    default:
      return false
  }
}

/**
 * 验证配置对象
 *
 * @param config 配置对象
 * @param schema 配置模式
 * @returns 验证错误列表
 */
export function validateConfig(
  config: Record<string, unknown>,
  schema: ConfigSchema,
): string[] {
  const errors: string[] = []

  function validateObject(
    obj: Record<string, unknown>,
    schemaObj: ConfigSchema,
    path: string,
  ): void {
    Object.keys(schemaObj).forEach((key) => {
      const fullPath = path ? `${path}.${key}` : key
      const schemaItem = schemaObj[key]
      const value = obj[key]

      // 检查必填项
      if (schemaItem.required && (value === undefined || value === null)) {
        errors.push(`Required config missing: ${fullPath}`)
        return
      }

      // 检查弃用配置
      if (schemaItem.deprecated && value !== undefined) {
        const message
          = schemaItem.deprecationMessage || `Config ${fullPath} is deprecated`
        logger.warn(message)
      }

      if (value === undefined || value === null)
        return

      // 类型验证
      if (schemaItem.type && !validateConfigType(value, schemaItem.type)) {
        errors.push(
          `Invalid type for ${fullPath}: expected ${schemaItem.type}, got ${typeof value}`,
        )
      }

      // 自定义验证器
      if (schemaItem.validator && !schemaItem.validator.validate(value)) {
        const message
          = schemaItem.validator.message || `Validation failed for ${fullPath}`
        errors.push(message)
      }

      // 嵌套对象验证
      if (schemaItem.children && isValidObject(value)) {
        validateObject(
          value as Record<string, unknown>,
          schemaItem.children,
          fullPath,
        )
      }
    })
  }

  validateObject(config, schema, '')
  return errors
}

/**
 * 应用配置默认值
 *
 * @param config 配置对象
 * @param schema 配置模式
 */
export function applyConfigDefaults(
  config: Record<string, unknown>,
  schema: ConfigSchema,
): void {
  function applyDefaults(
    obj: Record<string, unknown>,
    schemaObj: ConfigSchema,
  ): void {
    Object.keys(schemaObj).forEach((key) => {
      const schemaItem = schemaObj[key]

      if (obj[key] === undefined && schemaItem.default !== undefined) {
        obj[key] = schemaItem.default
      }

      // 应用转换器
      if (obj[key] !== undefined && schemaItem.validator?.transform) {
        try {
          obj[key] = schemaItem.validator.transform(obj[key])
        }
        catch (error) {
          logger.warn(`Failed to transform config ${key}:`, error)
        }
      }

      // 处理嵌套对象
      if (schemaItem.children && isValidObject(obj[key])) {
        applyDefaults(obj[key] as Record<string, unknown>, schemaItem.children)
      }
    })
  }

  applyDefaults(config, schema)
}

/**
 * 预定义的常用验证器
 */
export const ConfigValidators = {
  /** URL 验证器 */
  url: {
    validate: (value: unknown): value is string => {
      if (!isString(value))
        return false
      try {
        const url = new URL(value)
        return Boolean(url)
      }
      catch {
        return false
      }
    },
    message: 'Must be a valid URL',
  },

  /** 端口号验证器 */
  port: {
    validate: (value: unknown): value is number => {
      return isNumber(value) && value >= 1 && value <= 65535 && Number.isInteger(value)
    },
    message: 'Must be a valid port number (1-65535)',
  },

  /** 邮箱验证器 */
  email: {
    validate: (value: unknown): value is string => {
      if (!isString(value))
        return false
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message: 'Must be a valid email address',
  },

  /** 正数验证器 */
  positiveNumber: {
    validate: (value: unknown): value is number => {
      return isNumber(value) && value > 0
    },
    message: 'Must be a positive number',
  },

  /** 非空字符串验证器 */
  nonEmptyString: {
    validate: (value: unknown): value is string => {
      return isString(value) && value.trim().length > 0
    },
    message: 'Must be a non-empty string',
  },

  /** 枚举值验证器 */
  oneOf: <T>(...options: T[]) => ({
    validate: (value: unknown): value is T => {
      return options.includes(value as T)
    },
    message: `Must be one of: ${options.join(', ')}`,
  }),

  /** 数组元素验证器 */
  arrayOf: <T>(itemValidator: ConfigValidator<T>) => ({
    validate: (value: unknown): value is T[] => {
      if (!Array.isArray(value))
        return false
      return value.every(item => itemValidator.validate(item))
    },
    message: 'Must be an array of valid items',
  }),
}
