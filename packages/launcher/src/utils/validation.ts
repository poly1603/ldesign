/**
 * @fileoverview 验证工具模块
 * @author ViteLauncher Team
 * @since 1.0.0
 */

import path from 'node:path'
import type { 
  ProjectType, 
  FrameworkType, 
  ValidationRule, 
  ValidationResult, 
  FormValidationConfig 
} from '../types'
import { isValidPort, isValidUrl } from './common'

/**
 * 验证错误类
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * 验证项目名称
 * @param name 项目名称
 * @returns 验证结果
 */
export function validateProjectName(name: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // 检查是否为空
  if (!name || name.trim().length === 0) {
    errors.push('项目名称不能为空')
  }

  // 检查长度
  if (name.length > 214) {
    errors.push('项目名称不能超过214个字符')
  }

  // 检查字符
  if (!/^[a-z0-9@/_-]+$/.test(name)) {
    errors.push('项目名称只能包含小写字母、数字、@、/、_、- 字符')
  }

  // 检查开头字符
  if (/^[._]/.test(name)) {
    errors.push('项目名称不能以 . 或 _ 开头')
  }

  // 检查结尾字符
  if (/[-_]$/.test(name)) {
    warnings.push('项目名称最好不要以 - 或 _ 结尾')
  }

  // 检查保留字
  const reservedNames = [
    'node_modules', 'favicon.ico', 'test', 'build', 'dist',
    'public', 'static', 'assets', '.git', '.vscode'
  ]
  if (reservedNames.includes(name)) {
    errors.push(`"${name}" 是保留名称，不能作为项目名称`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    field: 'projectName'
  }
}

/**
 * 验证框架类型
 * @param framework 框架类型
 * @returns 验证结果
 */
export function validateFrameworkType(framework: string): ValidationResult {
  const errors: string[] = []
  const validFrameworks: FrameworkType[] = [
    'vue2', 'vue3', 'react', 'svelte', 'lit', 'angular', 'vanilla', 'vanilla-ts'
  ]

  if (!validFrameworks.includes(framework as FrameworkType)) {
    errors.push(`不支持的框架类型: ${framework}。支持的框架: ${validFrameworks.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    field: 'framework'
  }
}

/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证结果
 */
export function validatePort(port: number | string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const portNum = typeof port === 'string' ? parseInt(port, 10) : port

  if (isNaN(portNum)) {
    errors.push('端口号必须是数字')
  } else if (!isValidPort(portNum)) {
    errors.push('端口号必须在 1-65535 范围内')
  } else {
    // 检查常用端口
    const wellKnownPorts = [80, 443, 22, 21, 25, 53, 110, 143, 993, 995]
    if (wellKnownPorts.includes(portNum)) {
      warnings.push(`端口 ${portNum} 是系统保留端口，建议使用其他端口`)
    }

    // 检查常用开发端口
    const commonDevPorts = [3000, 3001, 4000, 5000, 5173, 8000, 8080]
    if (commonDevPorts.includes(portNum)) {
      warnings.push(`端口 ${portNum} 是常用开发端口，可能会冲突`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    field: 'port'
  }
}

/**
 * 验证路径
 * @param pathStr 路径字符串
 * @param options 验证选项
 * @returns 验证结果
 */
export function validatePath(
  pathStr: string, 
  options: {
    mustExist?: boolean
    mustBeAbsolute?: boolean
    allowedExtensions?: string[]
  } = {}
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { mustBeAbsolute = false, allowedExtensions } = options

  // 检查是否为空
  if (!pathStr || pathStr.trim().length === 0) {
    errors.push('路径不能为空')
    return { isValid: false, errors, warnings, field: 'path' }
  }

  // 检查路径格式
  try {
    const parsedPath = path.parse(pathStr)
    
    // 检查是否为绝对路径
    if (mustBeAbsolute && !path.isAbsolute(pathStr)) {
      errors.push('必须是绝对路径')
    }

    // 检查文件扩展名
    if (allowedExtensions && parsedPath.ext) {
      if (!allowedExtensions.includes(parsedPath.ext)) {
        errors.push(`不支持的文件扩展名: ${parsedPath.ext}。支持的扩展名: ${allowedExtensions.join(', ')}`)
      }
    }

    // 检查危险字符
    const dangerousChars = ['<', '>', ':', '"', '|', '?', '*']
    if (dangerousChars.some(char => pathStr.includes(char))) {
      errors.push('路径包含非法字符')
    }

    // 检查相对路径中的危险模式
    if (pathStr.includes('..')) {
      warnings.push('路径包含上级目录引用，可能存在安全风险')
    }

  } catch (error) {
    errors.push(`无效的路径格式: ${(error as Error).message}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    field: 'path'
  }
}

/**
 * 验证URL
 * @param url URL字符串
 * @param options 验证选项
 * @returns 验证结果
 */
export function validateUrl(
  url: string,
  options: {
    allowedProtocols?: string[]
    requireProtocol?: boolean
  } = {}
): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const { allowedProtocols = ['http', 'https'], requireProtocol = true } = options

  if (!url || url.trim().length === 0) {
    errors.push('URL不能为空')
    return { isValid: false, errors, warnings, field: 'url' }
  }

  if (!isValidUrl(url)) {
    // 如果不要求协议，尝试添加 http:// 前缀
    if (!requireProtocol && !url.includes('://')) {
      const urlWithProtocol = `http://${url}`
      if (isValidUrl(urlWithProtocol)) {
        warnings.push('URL 缺少协议前缀，已自动添加 http://')
      } else {
        errors.push('无效的URL格式')
      }
    } else {
      errors.push('无效的URL格式')
    }
  } else {
    try {
      const urlObj = new URL(url)
      
      // 检查协议
      const protocol = urlObj.protocol.slice(0, -1) // 移除末尾的 ':'
      if (!allowedProtocols.includes(protocol)) {
        errors.push(`不支持的协议: ${protocol}。支持的协议: ${allowedProtocols.join(', ')}`)
      }

      // 检查主机名
      if (!urlObj.hostname) {
        errors.push('URL 缺少主机名')
      }

    } catch (error) {
      errors.push(`URL 解析失败: ${(error as Error).message}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    field: 'url'
  }
}

/**
 * 验证依赖版本
 * @param version 版本字符串
 * @returns 验证结果
 */
export function validateVersion(version: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!version || version.trim().length === 0) {
    errors.push('版本号不能为空')
    return { isValid: false, errors, warnings, field: 'version' }
  }

  // 简单的 semver 格式检查
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/
  const rangeRegex = /^[\^~><=\s]*\d+\.\d+\.\d+/

  if (!semverRegex.test(version) && !rangeRegex.test(version)) {
    errors.push('无效的版本号格式')
  }

  // 检查预发布版本
  if (version.includes('-alpha') || version.includes('-beta') || version.includes('-rc')) {
    warnings.push('使用了预发布版本，可能不稳定')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    field: 'version'
  }
}

/**
 * 创建验证器
 * @param config 验证配置
 * @returns 验证器函数
 */
export function createValidator(config: FormValidationConfig) {
  return async function validate(data: Record<string, any>): Promise<ValidationResult> {
    const allErrors: string[] = []
    const allWarnings: string[] = []

    for (const [field, rules] of Object.entries(config.rules)) {
      const value = data[field]

      for (const rule of rules) {
        try {
          const isValid = await rule.validate(value)
          
          if (!isValid) {
            allErrors.push(`${field}: ${rule.message}`)
            
            if (config.stopOnFirstFailure) {
              break
            }
          }
        } catch (error) {
          allErrors.push(`${field}: 验证过程中发生错误 - ${(error as Error).message}`)
          
          if (config.stopOnFirstFailure) {
            break
          }
        }
      }

      if (config.stopOnFirstFailure && allErrors.length > 0) {
        break
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }
}

/**
 * 常用验证规则
 */
export const commonRules = {
  /**
   * 必填验证规则
   */
  required: (message = '此字段为必填项'): ValidationRule => ({
    name: 'required',
    validate: (value: any) => {
      if (value === null || value === undefined) return false
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return true
    },
    message,
    required: true
  }),

  /**
   * 最小长度验证规则
   */
  minLength: (min: number, message?: string): ValidationRule => ({
    name: 'minLength',
    validate: (value: string) => !value || value.length >= min,
    message: message || `长度不能少于${min}个字符`
  }),

  /**
   * 最大长度验证规则
   */
  maxLength: (max: number, message?: string): ValidationRule => ({
    name: 'maxLength',
    validate: (value: string) => !value || value.length <= max,
    message: message || `长度不能超过${max}个字符`
  }),

  /**
   * 正则表达式验证规则
   */
  pattern: (regex: RegExp, message = '格式不正确'): ValidationRule => ({
    name: 'pattern',
    validate: (value: string) => !value || regex.test(value),
    message
  }),

  /**
   * 数字范围验证规则
   */
  range: (min: number, max: number, message?: string): ValidationRule => ({
    name: 'range',
    validate: (value: number) => value >= min && value <= max,
    message: message || `值必须在${min}-${max}范围内`
  }),

  /**
   * 邮箱格式验证规则
   */
  email: (message = '邮箱格式不正确'): ValidationRule => ({
    name: 'email',
    validate: (value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  /**
   * 自定义验证规则
   */
  custom: (
    validator: (value: any) => boolean | Promise<boolean>, 
    message = '验证失败'
  ): ValidationRule => ({
    name: 'custom',
    validate: validator,
    message
  })
}