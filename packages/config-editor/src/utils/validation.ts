/**
 * 验证工具函数
 * 
 * 提供配置验证的工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { ValidationResult, ValidationRule, ConfigFieldDefinition } from '../types/common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'
import {
  PACKAGE_NAME_PATTERN,
  VERSION_PATTERN,
  EMAIL_PATTERN,
  URL_PATTERN,
  PORT_PATTERN,
  HEX_COLOR_PATTERN,
  RGB_COLOR_PATTERN,
  RGBA_COLOR_PATTERN
} from '../constants/patterns'

/**
 * 验证单个字段值
 * @param value 字段值
 * @param rules 验证规则
 * @returns 验证结果
 */
export function validateField(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = []
  
  for (const rule of rules) {
    const isValid = validateRule(value, rule)
    if (!isValid) {
      errors.push(rule.message)
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证单个规则
 * @param value 字段值
 * @param rule 验证规则
 * @returns 是否有效
 */
function validateRule(value: any, rule: ValidationRule): boolean {
  switch (rule.type) {
    case 'required':
      return validateRequired(value)
    
    case 'min':
      return validateMin(value, rule.value)
    
    case 'max':
      return validateMax(value, rule.value)
    
    case 'pattern':
      return validatePattern(value, rule.value)
    
    case 'custom':
      return rule.validator ? rule.validator(value) : true
    
    default:
      return true
  }
}

/**
 * 验证必填字段
 * @param value 字段值
 * @returns 是否有效
 */
function validateRequired(value: any): boolean {
  if (value === null || value === undefined) {
    return false
  }
  
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  
  if (Array.isArray(value)) {
    return value.length > 0
  }
  
  return true
}

/**
 * 验证最小值/长度
 * @param value 字段值
 * @param min 最小值
 * @returns 是否有效
 */
function validateMin(value: any, min: number): boolean {
  if (typeof value === 'number') {
    return value >= min
  }
  
  if (typeof value === 'string') {
    return value.length >= min
  }
  
  if (Array.isArray(value)) {
    return value.length >= min
  }
  
  return true
}

/**
 * 验证最大值/长度
 * @param value 字段值
 * @param max 最大值
 * @returns 是否有效
 */
function validateMax(value: any, max: number): boolean {
  if (typeof value === 'number') {
    return value <= max
  }
  
  if (typeof value === 'string') {
    return value.length <= max
  }
  
  if (Array.isArray(value)) {
    return value.length <= max
  }
  
  return true
}

/**
 * 验证正则表达式模式
 * @param value 字段值
 * @param pattern 正则表达式
 * @returns 是否有效
 */
function validatePattern(value: any, pattern: RegExp): boolean {
  if (typeof value !== 'string') {
    return false
  }
  
  return pattern.test(value)
}

/**
 * 验证包名
 * @param packageName 包名
 * @returns 验证结果
 */
export function validatePackageName(packageName: string): ValidationResult {
  const errors: string[] = []
  
  if (!packageName || packageName.trim().length === 0) {
    errors.push('包名不能为空')
  } else if (!PACKAGE_NAME_PATTERN.test(packageName)) {
    errors.push('包名格式不正确')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证版本号
 * @param version 版本号
 * @returns 验证结果
 */
export function validateVersion(version: string): ValidationResult {
  const errors: string[] = []
  
  if (!version || version.trim().length === 0) {
    errors.push('版本号不能为空')
  } else if (!VERSION_PATTERN.test(version)) {
    errors.push('版本号格式不正确，应符合 semver 规范')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证邮箱地址
 * @param email 邮箱地址
 * @returns 验证结果
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = []
  
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.push('邮箱地址格式不正确')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证 URL
 * @param url URL 地址
 * @returns 验证结果
 */
export function validateUrl(url: string): ValidationResult {
  const errors: string[] = []
  
  if (url && !URL_PATTERN.test(url)) {
    errors.push('URL 格式不正确')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证端口号
 * @param port 端口号
 * @returns 验证结果
 */
export function validatePort(port: number | string): ValidationResult {
  const errors: string[] = []
  
  const portStr = String(port)
  if (!PORT_PATTERN.test(portStr)) {
    errors.push('端口号必须在 1-65535 之间')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证颜色值
 * @param color 颜色值
 * @returns 验证结果
 */
export function validateColor(color: string): ValidationResult {
  const errors: string[] = []
  
  if (color && !isValidColor(color)) {
    errors.push('颜色值格式不正确')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 检查是否为有效的颜色值
 * @param color 颜色值
 * @returns 是否有效
 */
function isValidColor(color: string): boolean {
  return (
    HEX_COLOR_PATTERN.test(color) ||
    RGB_COLOR_PATTERN.test(color) ||
    RGBA_COLOR_PATTERN.test(color) ||
    isNamedColor(color)
  )
}

/**
 * 检查是否为命名颜色
 * @param color 颜色值
 * @returns 是否为命名颜色
 */
function isNamedColor(color: string): boolean {
  const namedColors = [
    'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'black', 'white', 'gray', 'grey', 'transparent', 'currentColor'
  ]
  return namedColors.includes(color.toLowerCase())
}

/**
 * 验证 Launcher 配置
 * @param config Launcher 配置
 * @returns 验证结果
 */
export function validateLauncherConfig(config: LauncherConfig): ValidationResult {
  const errors: string[] = []
  
  // 验证服务器配置
  if (config.server) {
    if (config.server.port) {
      const portResult = validatePort(config.server.port)
      if (!portResult.valid) {
        errors.push(...portResult.errors.map(err => `server.port: ${err}`))
      }
    }
    
    if (config.server.host && config.server.host.trim().length === 0) {
      errors.push('server.host: 主机地址不能为空')
    }
  }
  
  // 验证构建配置
  if (config.build) {
    if (config.build.outDir && config.build.outDir.trim().length === 0) {
      errors.push('build.outDir: 输出目录不能为空')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证 App 配置
 * @param config App 配置
 * @returns 验证结果
 */
export function validateAppConfig(config: AppConfig): ValidationResult {
  const errors: string[] = []
  
  // 验证基本信息
  if (!config.appName || config.appName.trim().length === 0) {
    errors.push('appName: 应用名称不能为空')
  }
  
  if (!config.version || config.version.trim().length === 0) {
    errors.push('version: 版本号不能为空')
  } else {
    const versionResult = validateVersion(config.version)
    if (!versionResult.valid) {
      errors.push(...versionResult.errors.map(err => `version: ${err}`))
    }
  }
  
  // 验证 API 配置
  if (config.api) {
    if (!config.api.baseUrl || config.api.baseUrl.trim().length === 0) {
      errors.push('api.baseUrl: API 基础 URL 不能为空')
    } else {
      const urlResult = validateUrl(config.api.baseUrl)
      if (!urlResult.valid) {
        errors.push(...urlResult.errors.map(err => `api.baseUrl: ${err}`))
      }
    }
    
    if (config.api.timeout && config.api.timeout <= 0) {
      errors.push('api.timeout: 超时时间必须大于 0')
    }
  }
  
  // 验证主题配置
  if (config.theme) {
    if (config.theme.primaryColor) {
      const colorResult = validateColor(config.theme.primaryColor)
      if (!colorResult.valid) {
        errors.push(...colorResult.errors.map(err => `theme.primaryColor: ${err}`))
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证 Package.json 配置
 * @param config Package.json 配置
 * @returns 验证结果
 */
export function validatePackageJsonConfig(config: PackageJsonConfig): ValidationResult {
  const errors: string[] = []
  
  // 验证包名
  const nameResult = validatePackageName(config.name)
  if (!nameResult.valid) {
    errors.push(...nameResult.errors.map(err => `name: ${err}`))
  }
  
  // 验证版本号
  const versionResult = validateVersion(config.version)
  if (!versionResult.valid) {
    errors.push(...versionResult.errors.map(err => `version: ${err}`))
  }
  
  // 验证作者邮箱
  if (typeof config.author === 'object' && config.author.email) {
    const emailResult = validateEmail(config.author.email)
    if (!emailResult.valid) {
      errors.push(...emailResult.errors.map(err => `author.email: ${err}`))
    }
  }
  
  // 验证主页 URL
  if (config.homepage) {
    const urlResult = validateUrl(config.homepage)
    if (!urlResult.valid) {
      errors.push(...urlResult.errors.map(err => `homepage: ${err}`))
    }
  }
  
  // 验证仓库 URL
  if (typeof config.repository === 'object' && config.repository.url) {
    const urlResult = validateUrl(config.repository.url)
    if (!urlResult.valid) {
      errors.push(...urlResult.errors.map(err => `repository.url: ${err}`))
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
