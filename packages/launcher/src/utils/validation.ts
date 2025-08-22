/**
 * 验证工具模块
 * 提供各种输入验证和格式检查的工具函数
 * 
 * @author Vite Launcher Team
 * @version 1.0.0
 */

/**
 * 验证结果接口
 */
export interface ValidationResult {
  /** 是否通过验证 */
  valid: boolean
  /** 错误消息列表 */
  errors: string[]
  /** 警告消息列表 */
  warnings?: string[]
}

/**
 * 项目名称验证选项
 */
export interface ProjectNameValidationOptions {
  /** 最小长度 */
  minLength?: number
  /** 最大长度 */
  maxLength?: number
  /** 是否允许大写字母 */
  allowUppercase?: boolean
  /** 是否允许特殊字符 */
  allowSpecialChars?: boolean
  /** 自定义保留名称 */
  reservedNames?: string[]
}

/**
 * 验证工具类
 * 提供各种常用的验证功能
 */
export class ValidationUtils {
  /**
   * 预定义的保留名称列表
   */
  private static readonly DEFAULT_RESERVED_NAMES = [
    // Node.js 保留
    'node_modules',
    'npm-debug.log',
    'package.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml',
    
    // 常见系统文件
    'favicon.ico',
    '.git',
    '.gitignore',
    '.env',
    '.env.local',
    'thumbs.db',
    'desktop.ini',
    '.ds_store',
    
    // 构建产物
    'dist',
    'build',
    'out',
    'coverage',
    '.nyc_output',
    
    // 编辑器/IDE
    '.vscode',
    '.idea',
    '.sublime-project',
    '.sublime-workspace',
    
    // 其他常见名称
    'config',
    'src',
    'public',
    'static',
    'assets'
  ]

  /**
   * 验证项目名称
   * @param name 项目名称
   * @param options 验证选项
   * @returns 验证结果
   * @example
   * ```typescript
   * const result = ValidationUtils.validateProjectName('my-awesome-project')
   * if (result.valid) {
   *   console.log('项目名称有效')
   * } else {
   *   console.log('错误:', result.errors)
   * }
   * ```
   */
  static validateProjectName(name: string, options: ProjectNameValidationOptions = {}): ValidationResult {
    const {
      minLength = 1,
      maxLength = 214,
      allowUppercase = false,
      allowSpecialChars = false,
      reservedNames = this.DEFAULT_RESERVED_NAMES
    } = options

    const errors: string[] = []
    const warnings: string[] = []

    // 检查是否为空
    if (!name || typeof name !== 'string') {
      errors.push('项目名称不能为空')
      return { valid: false, errors, warnings }
    }

    // 检查长度
    if (name.length < minLength) {
      errors.push(`项目名称长度不能少于${minLength}个字符`)
    }

    if (name.length > maxLength) {
      errors.push(`项目名称长度不能超过${maxLength}个字符`)
    }

    // 检查首尾字符
    if (name.startsWith('.') || name.startsWith('_')) {
      errors.push('项目名称不能以点号或下划线开头')
    }

    if (name.endsWith('.') || name.endsWith('_')) {
      warnings.push('项目名称以点号或下划线结尾可能导致问题')
    }

    // 检查字符集
    if (!allowUppercase && /[A-Z]/.test(name)) {
      errors.push('项目名称不应包含大写字母')
    }

    if (!allowSpecialChars) {
      // 只允许小写字母、数字、连字符、下划线、@符号和斜杠
      if (!/^[a-z0-9\-_@/]+$/.test(name)) {
        errors.push('项目名称只能包含小写字母、数字、连字符、下划线、@符号和斜杠')
      }
    }

    // 检查连续的特殊字符
    if (/--/.test(name)) {
      warnings.push('项目名称包含连续的连字符')
    }

    if (/__/.test(name)) {
      warnings.push('项目名称包含连续的下划线')
    }

    // 检查保留名称
    const lowerName = name.toLowerCase()
    if (reservedNames.some(reserved => lowerName === reserved.toLowerCase())) {
      errors.push(`项目名称不能使用保留名称: ${name}`)
    }

    // npm 包名特殊规则
    if (name.startsWith('@')) {
      const parts = name.split('/')
      if (parts.length !== 2) {
        errors.push('作用域包名格式应为 @scope/package')
      } else {
        const [scope, packageName] = parts
        if (scope.length <= 1) {
          errors.push('作用域名称不能为空')
        }
        if (!packageName) {
          errors.push('包名称不能为空')
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证端口号
   * @param port 端口号
   * @returns 是否有效
   * @example
   * ```typescript
   * ValidationUtils.validatePort(3000) // true
   * ValidationUtils.validatePort(70000) // false
   * ValidationUtils.validatePort(-1) // false
   * ```
   */
  static validatePort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535
  }

  /**
   * 验证 URL
   * @param url URL字符串
   * @param options 验证选项
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validateUrl('https://example.com') // { valid: true, errors: [] }
   * ValidationUtils.validateUrl('invalid-url') // { valid: false, errors: [...] }
   * ```
   */
  static validateUrl(url: string, options: {
    /** 允许的协议 */
    allowedProtocols?: string[]
    /** 是否必须有协议 */
    requireProtocol?: boolean
  } = {}): ValidationResult {
    const { allowedProtocols = ['http', 'https'], requireProtocol = true } = options
    const errors: string[] = []

    if (!url || typeof url !== 'string') {
      errors.push('URL不能为空')
      return { valid: false, errors }
    }

    try {
      const urlObj = new URL(url)
      
      if (requireProtocol && !urlObj.protocol) {
        errors.push('URL必须包含协议')
      }

      if (allowedProtocols.length > 0) {
        const protocol = urlObj.protocol.replace(':', '')
        if (!allowedProtocols.includes(protocol)) {
          errors.push(`不支持的协议: ${protocol}. 支持的协议: ${allowedProtocols.join(', ')}`)
        }
      }

      if (!urlObj.hostname) {
        errors.push('URL必须包含主机名')
      }
    } catch (error) {
      errors.push(`无效的URL格式: ${(error as Error).message}`)
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 验证电子邮箱地址
   * @param email 邮箱地址
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validateEmail('user@example.com') // { valid: true, errors: [] }
   * ValidationUtils.validateEmail('invalid-email') // { valid: false, errors: [...] }
   * ```
   */
  static validateEmail(email: string): ValidationResult {
    const errors: string[] = []

    if (!email || typeof email !== 'string') {
      errors.push('邮箱地址不能为空')
      return { valid: false, errors }
    }

    // 基本的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('邮箱地址格式无效')
    }

    // 长度检查
    if (email.length > 254) {
      errors.push('邮箱地址长度不能超过254个字符')
    }

    // 本地部分长度检查
    const [localPart] = email.split('@')
    if (localPart && localPart.length > 64) {
      errors.push('邮箱地址本地部分长度不能超过64个字符')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 验证语义化版本号
   * @param version 版本号
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validateSemVer('1.2.3') // { valid: true, errors: [] }
   * ValidationUtils.validateSemVer('1.2.3-alpha.1') // { valid: true, errors: [] }
   * ValidationUtils.validateSemVer('invalid') // { valid: false, errors: [...] }
   * ```
   */
  static validateSemVer(version: string): ValidationResult {
    const errors: string[] = []

    if (!version || typeof version !== 'string') {
      errors.push('版本号不能为空')
      return { valid: false, errors }
    }

    // 语义化版本号正则表达式
    const semVerRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

    if (!semVerRegex.test(version)) {
      errors.push('版本号格式无效，应符合语义化版本号规范 (如: 1.2.3, 1.2.3-alpha.1)')
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 验证目录路径
   * @param dirPath 目录路径
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validatePath('/path/to/directory') // { valid: true, errors: [] }
   * ValidationUtils.validatePath('con') // { valid: false, errors: [...] } (Windows保留名)
   * ```
   */
  static validatePath(dirPath: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!dirPath || typeof dirPath !== 'string') {
      errors.push('路径不能为空')
      return { valid: false, errors, warnings }
    }

    // Windows 保留名称
    const windowsReservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ]

    // 检查是否包含非法字符
    const invalidChars = process.platform === 'win32' 
      ? /[<>:"|?*\x00-\x1f]/
      : /[\x00]/

    if (invalidChars.test(dirPath)) {
      errors.push('路径包含非法字符')
    }

    // 检查长度
    if (dirPath.length > 260 && process.platform === 'win32') {
      errors.push('Windows系统下路径长度不能超过260个字符')
    }

    // 检查 Windows 保留名称
    if (process.platform === 'win32') {
      const pathParts = dirPath.split(/[/\\]/)
      for (const part of pathParts) {
        const baseName = part.split('.')[0].toUpperCase()
        if (windowsReservedNames.includes(baseName)) {
          errors.push(`路径包含Windows保留名称: ${part}`)
        }
      }
    }

    // 检查相对路径中的危险模式
    if (dirPath.includes('..')) {
      warnings.push('路径包含上级目录引用(..)，可能存在安全风险')
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  /**
   * 验证 JSON 字符串
   * @param jsonString JSON字符串
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validateJson('{"key": "value"}') // { valid: true, errors: [] }
   * ValidationUtils.validateJson('invalid json') // { valid: false, errors: [...] }
   * ```
   */
  static validateJson(jsonString: string): ValidationResult {
    const errors: string[] = []

    if (!jsonString || typeof jsonString !== 'string') {
      errors.push('JSON字符串不能为空')
      return { valid: false, errors }
    }

    try {
      JSON.parse(jsonString)
    } catch (error) {
      errors.push(`JSON格式无效: ${(error as Error).message}`)
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * 验证 IP 地址
   * @param ip IP地址
   * @param version IP版本 (4 或 6)
   * @returns 验证结果
   * @example
   * ```typescript
   * ValidationUtils.validateIp('192.168.1.1') // { valid: true, errors: [] }
   * ValidationUtils.validateIp('2001:db8::1', 6) // { valid: true, errors: [] }
   * ```
   */
  static validateIp(ip: string, version?: 4 | 6): ValidationResult {
    const errors: string[] = []

    if (!ip || typeof ip !== 'string') {
      errors.push('IP地址不能为空')
      return { valid: false, errors }
    }

    // IPv4 验证
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const isValidIpv4 = ipv4Regex.test(ip)

    // IPv6 验证
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    const isValidIpv6 = ipv6Regex.test(ip) || 
                       /^(?:[0-9a-fA-F]{1,4}:){1,7}:$/.test(ip) || 
                       /^:(?::[0-9a-fA-F]{1,4}){1,7}$/.test(ip)

    if (version === 4) {
      if (!isValidIpv4) {
        errors.push('无效的IPv4地址格式')
      }
    } else if (version === 6) {
      if (!isValidIpv6) {
        errors.push('无效的IPv6地址格式')
      }
    } else {
      // 自动检测版本
      if (!isValidIpv4 && !isValidIpv6) {
        errors.push('无效的IP地址格式')
      }
    }

    return { valid: errors.length === 0, errors }
  }
}

// 导出便捷函数
export const {
  validateProjectName,
  validatePort,
  validateUrl,
  validateEmail,
  validateSemVer,
  validatePath,
  validateJson,
  validateIp,
} = ValidationUtils