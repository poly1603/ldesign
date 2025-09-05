/**
 * 验证工具函数
 * 
 * 提供各种验证功能的工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { REGEX_PATTERNS } from '../constants'
import type { ValidationResult } from '../types'

/**
 * 验证端口号
 * 
 * @param port - 端口号
 * @returns 是否有效
 */
export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

/**
 * 验证主机地址
 * 
 * @param host - 主机地址
 * @returns 是否有效
 */
export function isValidHost(host: string): boolean {
  if (typeof host !== 'string' || host.length === 0) {
    return false
  }
  
  // 特殊主机地址
  if (['localhost', '0.0.0.0', '::'].includes(host)) {
    return true
  }
  
  // IPv4 地址
  if (REGEX_PATTERNS.IP.test(host)) {
    return true
  }
  
  // 域名
  if (REGEX_PATTERNS.DOMAIN.test(host)) {
    return true
  }
  
  return false
}

/**
 * 验证 URL
 * 
 * @param url - URL 字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length === 0) {
    return false
  }
  
  try {
    new URL(url)
    return true
  } catch {
    return REGEX_PATTERNS.URL.test(url)
  }
}

/**
 * 验证文件路径
 * 
 * @param path - 文件路径
 * @returns 是否有效
 */
export function isValidFilePath(path: string): boolean {
  if (typeof path !== 'string' || path.length === 0) {
    return false
  }
  
  return REGEX_PATTERNS.FILE_PATH.test(path)
}

/**
 * 验证版本号
 * 
 * @param version - 版本号
 * @returns 是否有效
 */
export function isValidVersion(version: string): boolean {
  if (typeof version !== 'string' || version.length === 0) {
    return false
  }
  
  return REGEX_PATTERNS.VERSION.test(version)
}

/**
 * 验证环境变量名
 * 
 * @param name - 环境变量名
 * @returns 是否有效
 */
export function isValidEnvVarName(name: string): boolean {
  if (typeof name !== 'string' || name.length === 0) {
    return false
  }
  
  return REGEX_PATTERNS.ENV_VAR.test(name)
}

/**
 * 验证日志级别
 * 
 * @param level - 日志级别
 * @returns 是否有效
 */
export function isValidLogLevel(level: string): boolean {
  return ['silent', 'error', 'warn', 'info', 'debug'].includes(level)
}

/**
 * 验证运行模式
 * 
 * @param mode - 运行模式
 * @returns 是否有效
 */
export function isValidMode(mode: string): boolean {
  return ['development', 'production', 'test'].includes(mode)
}

/**
 * 验证构建目标
 * 
 * @param target - 构建目标
 * @returns 是否有效
 */
export function isValidBuildTarget(target: string | string[]): boolean {
  if (typeof target === 'string') {
    return target.length > 0
  }
  
  if (Array.isArray(target)) {
    return target.length > 0 && target.every(t => typeof t === 'string' && t.length > 0)
  }
  
  return false
}

/**
 * 验证压缩选项
 * 
 * @param minify - 压缩选项
 * @returns 是否有效
 */
export function isValidMinifyOption(minify: boolean | string): boolean {
  if (typeof minify === 'boolean') {
    return true
  }
  
  if (typeof minify === 'string') {
    return ['terser', 'esbuild'].includes(minify)
  }
  
  return false
}

/**
 * 验证对象结构
 * 
 * @param obj - 要验证的对象
 * @param schema - 验证模式
 * @returns 验证结果
 */
export function validateObjectSchema(obj: any, schema: ValidationSchema): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  try {
    validateObjectRecursive(obj, schema, '', errors, warnings)
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  } catch (error) {
    return {
      valid: false,
      errors: [`验证过程中发生错误: ${(error as Error).message}`],
      warnings
    }
  }
}

/**
 * 验证模式接口
 */
export interface ValidationSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'function'
  required?: boolean
  properties?: Record<string, ValidationSchema>
  items?: ValidationSchema
  enum?: any[]
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

/**
 * 递归验证对象
 */
function validateObjectRecursive(
  obj: any,
  schema: ValidationSchema,
  path: string,
  errors: string[],
  warnings: string[]
): void {
  const fullPath = path || 'root'
  
  // 检查必需字段
  if (schema.required && (obj === undefined || obj === null)) {
    errors.push(`${fullPath} 是必需的`)
    return
  }
  
  // 如果值为空且不是必需的，跳过验证
  if (obj === undefined || obj === null) {
    return
  }
  
  // 验证类型
  const actualType = Array.isArray(obj) ? 'array' : typeof obj
  if (actualType !== schema.type) {
    errors.push(`${fullPath} 类型错误，期望 ${schema.type}，实际 ${actualType}`)
    return
  }
  
  // 验证枚举值
  if (schema.enum && !schema.enum.includes(obj)) {
    errors.push(`${fullPath} 值必须是 ${schema.enum.join(', ')} 之一`)
  }
  
  // 验证数值范围
  if (schema.type === 'number') {
    if (schema.min !== undefined && obj < schema.min) {
      errors.push(`${fullPath} 不能小于 ${schema.min}`)
    }
    if (schema.max !== undefined && obj > schema.max) {
      errors.push(`${fullPath} 不能大于 ${schema.max}`)
    }
  }
  
  // 验证字符串长度和模式
  if (schema.type === 'string') {
    if (schema.min !== undefined && obj.length < schema.min) {
      errors.push(`${fullPath} 长度不能小于 ${schema.min}`)
    }
    if (schema.max !== undefined && obj.length > schema.max) {
      errors.push(`${fullPath} 长度不能大于 ${schema.max}`)
    }
    if (schema.pattern && !schema.pattern.test(obj)) {
      errors.push(`${fullPath} 格式不正确`)
    }
  }
  
  // 验证数组长度和元素
  if (schema.type === 'array') {
    if (schema.min !== undefined && obj.length < schema.min) {
      errors.push(`${fullPath} 元素数量不能小于 ${schema.min}`)
    }
    if (schema.max !== undefined && obj.length > schema.max) {
      errors.push(`${fullPath} 元素数量不能大于 ${schema.max}`)
    }
    
    if (schema.items) {
      obj.forEach((item: any, index: number) => {
        validateObjectRecursive(item, schema.items!, `${fullPath}[${index}]`, errors, warnings)
      })
    }
  }
  
  // 验证对象属性
  if (schema.type === 'object' && schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      const propPath = path ? `${path}.${key}` : key
      validateObjectRecursive(obj[key], propSchema, propPath, errors, warnings)
    }
  }
  
  // 自定义验证
  if (schema.custom) {
    const result = schema.custom(obj)
    if (result === false) {
      errors.push(`${fullPath} 自定义验证失败`)
    } else if (typeof result === 'string') {
      errors.push(`${fullPath} ${result}`)
    }
  }
}

/**
 * 验证配置文件格式
 * 
 * @param filePath - 文件路径
 * @returns 是否为支持的格式
 */
export function isValidConfigFileFormat(filePath: string): boolean {
  const supportedExtensions = ['.js', '.mjs', '.cjs', '.ts', '.json']
  const ext = filePath.split('.').pop()?.toLowerCase()
  return ext ? supportedExtensions.includes(`.${ext}`) : false
}

/**
 * 验证包名
 * 
 * @param name - 包名
 * @returns 是否有效
 */
export function isValidPackageName(name: string): boolean {
  if (typeof name !== 'string' || name.length === 0) {
    return false
  }
  
  // npm 包名规则
  const npmNameRegex = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  return npmNameRegex.test(name)
}

/**
 * 验证 MIME 类型
 * 
 * @param mimeType - MIME 类型
 * @returns 是否有效
 */
export function isValidMimeType(mimeType: string): boolean {
  if (typeof mimeType !== 'string' || mimeType.length === 0) {
    return false
  }
  
  const mimeTypeRegex = /^[a-zA-Z][a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/
  return mimeTypeRegex.test(mimeType)
}

/**
 * 批量验证
 * 
 * @param validations - 验证函数列表
 * @returns 验证结果
 */
export function batchValidate(validations: Array<() => ValidationResult>): ValidationResult {
  const allErrors: string[] = []
  const allWarnings: string[] = []
  
  for (const validate of validations) {
    try {
      const result = validate()
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    } catch (error) {
      allErrors.push(`验证函数执行失败: ${(error as Error).message}`)
    }
  }
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}
