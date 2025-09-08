/**
 * 验证工具类
 * 提供各种数据验证功能
 */

/**
 * 验证工具
 */
export class ValidationUtils {
  /**
   * 验证邮箱地址
   * @param email 邮箱地址
   * @returns 是否有效
   */
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 验证URL
   * @param url URL字符串
   * @returns 是否有效
   */
  static isUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      void parsed
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 验证IP地址（IPv4）
   * @param ip IP地址
   * @returns 是否有效
   */
  static isIPv4(ip: string): boolean {
    const ipv4Regex
      = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})$/
    return ipv4Regex.test(ip)
  }

  /**
   * 验证IP地址（IPv6）
   * @param ip IP地址
   * @returns 是否有效
   */
  static isIPv6(ip: string): boolean {
    const ipv6Regex = /^(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$|^::1$|^::$/i
    return ipv6Regex.test(ip)
  }

  /**
   * 验证IP地址（IPv4或IPv6）
   * @param ip IP地址
   * @returns 是否有效
   */
  static isIP(ip: string): boolean {
    return ValidationUtils.isIPv4(ip) || ValidationUtils.isIPv6(ip)
  }

  /**
   * 验证端口号
   * @param port 端口号
   * @returns 是否有效
   */
  static isPort(port: number | string): boolean {
    const portNum = typeof port === 'string' ? Number.parseInt(port, 10) : port
    return Number.isInteger(portNum) && portNum >= 1 && portNum <= 65535
  }

  /**
   * 验证MAC地址
   * @param mac MAC地址
   * @returns 是否有效
   */
  static isMacAddress(mac: string): boolean {
    const macRegex = /^(?:[0-9A-F]{2}[:-]){5}[0-9A-F]{2}$/i
    return macRegex.test(mac)
  }

  /**
   * 验证手机号码（中国）
   * @param phone 手机号码
   * @returns 是否有效
   */
  static isChinesePhone(phone: string): boolean {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  /**
   * 验证身份证号码（中国）
   * @param idCard 身份证号码
   * @returns 是否有效
   */
  static isChineseIdCard(idCard: string): boolean {
    if (!/^\d{17}[\dX]$/i.test(idCard)) {
      return false
    }

    // 校验码验证
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

    let sum = 0
    for (let i = 0; i < 17; i++) {
      const ch = idCard[i] ?? '0'
      const w = weights[i] ?? 0
      sum += Number.parseInt(ch, 10) * w
    }

    const checkCode = checkCodes[sum % 11]
    return (idCard[17]?.toUpperCase() || '') === checkCode
  }

  /**
   * 验证信用卡号码
   * @param cardNumber 信用卡号码
   * @returns 是否有效
   */
  static isCreditCard(cardNumber: string): boolean {
    // 移除空格和连字符
    const cleaned = cardNumber.replace(/[\s-]/g, '')

    // 检查是否只包含数字
    if (!/^\d+$/.test(cleaned)) {
      return false
    }

    // 检查长度
    if (cleaned.length < 13 || cleaned.length > 19) {
      return false
    }

    // Luhn算法验证
    let sum = 0
    let isEven = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = Number.parseInt(cleaned[i] ?? '0')

      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }

      sum += digit
      isEven = !isEven
    }

    return sum % 10 === 0
  }

  /**
   * 验证UUID
   * @param uuid UUID字符串
   * @param version UUID版本（可选）
   * @returns 是否有效
   */
  static isUUID(uuid: string, version?: 1 | 2 | 3 | 4 | 5): boolean {
    const uuidRegex = version
      ? new RegExp(
        `^[0-9a-f]{8}-[0-9a-f]{4}-${version}[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,
        'i',
      )
      : /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    return uuidRegex.test(uuid)
  }

  /**
   * 验证JSON字符串
   * @param json JSON字符串
   * @returns 是否有效
   */
  static isJSON(json: string): boolean {
    try {
      JSON.parse(json)
      return true
    }
    catch {
      return false
    }
  }

  /**
   * 验证Base64字符串
   * @param base64 Base64字符串
   * @returns 是否有效
   */
  static isBase64(base64: string): boolean {
    const base64Regex = /^[A-Z0-9+/]*={0,2}$/i
    return base64Regex.test(base64) && base64.length % 4 === 0
  }

  /**
   * 验证十六进制字符串
   * @param hex 十六进制字符串
   * @returns 是否有效
   */
  static isHex(hex: string): boolean {
    const hexRegex = /^[0-9a-f]+$/i
    return hexRegex.test(hex)
  }

  /**
   * 验证颜色值（十六进制）
   * @param color 颜色值
   * @returns 是否有效
   */
  static isHexColor(color: string): boolean {
    const colorRegex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i
    return colorRegex.test(color)
  }

  /**
   * 验证RGB颜色值
   * @param color RGB颜色值
   * @returns 是否有效
   */
  static isRGBColor(color: string): boolean {
    const rgbRegex = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
    const match = color.match(rgbRegex)

    if (!match)
      return false

    const [, r, g, b] = match
    return [r, g, b].every((val) => {
      const num = Number.parseInt(val ?? '0')
      return num >= 0 && num <= 255
    })
  }

  /**
   * 验证RGBA颜色值
   * @param color RGBA颜色值
   * @returns 是否有效
   */
  static isRGBAColor(color: string): boolean {
    const rgbaRegex
      = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/
    const match = color.match(rgbaRegex)

    if (!match)
      return false

    const [, r, g, b, a] = match
    const rgbValid = [r, g, b].every((val) => {
      const num = Number.parseInt(val ?? '0')
      return num >= 0 && num <= 255
    })

    const alpha = Number.parseFloat(a ?? '0')
    return rgbValid && alpha >= 0 && alpha <= 1
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @param options 验证选项
   * @returns 验证结果
   */
  static validatePassword(
    password: string,
    options: {
      minLength?: number
      maxLength?: number
      requireUppercase?: boolean
      requireLowercase?: boolean
      requireNumbers?: boolean
      requireSpecialChars?: boolean
      specialChars?: string
    } = {},
  ): {
      isValid: boolean
      score: number
      errors: string[]
    } {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true,
      specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?',
    } = options

    const errors: string[] = []
    let score = 0

    // 长度检查
    if (password.length < minLength) {
      errors.push(`密码长度至少需要 ${minLength} 个字符`)
    }
    else {
      score += 1
    }

    if (password.length > maxLength) {
      errors.push(`密码长度不能超过 ${maxLength} 个字符`)
    }

    // 大写字母
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母')
    }
    else if (/[A-Z]/.test(password)) {
      score += 1
    }

    // 小写字母
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母')
    }
    else if (/[a-z]/.test(password)) {
      score += 1
    }

    // 数字
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('密码必须包含数字')
    }
    else if (/\d/.test(password)) {
      score += 1
    }

    // 特殊字符
    const specialCharRegex = new RegExp(`[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
    if (requireSpecialChars && !specialCharRegex.test(password)) {
      errors.push('密码必须包含特殊字符')
    }
    else if (specialCharRegex.test(password)) {
      score += 1
    }

    // 额外分数
    if (password.length >= 12)
      score += 1
    if (/(.)\1{2,}/.test(password))
      score -= 1 // 重复字符扣分

    return {
      isValid: errors.length === 0,
      score: Math.max(0, Math.min(5, score)),
      errors,
    }
  }

  /**
   * 验证文件扩展名
   * @param filename 文件名
   * @param allowedExtensions 允许的扩展名
   * @returns 是否有效
   */
  static isValidFileExtension(filename: string, allowedExtensions: string[]): boolean {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (!ext)
      return false

    return allowedExtensions.map(e => e.toLowerCase()).includes(ext)
  }

  /**
   * 验证MIME类型
   * @param mimeType MIME类型
   * @param allowedTypes 允许的类型
   * @returns 是否有效
   */
  static isValidMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2)
        return mimeType.startsWith(prefix)
      }
      return mimeType === type
    })
  }

  /**
   * 验证日期字符串
   * @param dateString 日期字符串
   * @param format 日期格式
   * @returns 是否有效
   */
  static isValidDate(dateString: string, format?: string): boolean {
    if (!format) {
      const date = new Date(dateString)
      return !Number.isNaN(date.getTime())
    }

    // 简化的格式验证
    const formats: Record<string, RegExp> = {
      'YYYY-MM-DD': /^\d{4}-\d{2}-\d{2}$/,
      'DD/MM/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'MM/DD/YYYY': /^\d{2}\/\d{2}\/\d{4}$/,
      'YYYY-MM-DD HH:mm:ss': /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
    }

    const regex = formats[format]
    if (!regex)
      return false

    if (!regex.test(dateString))
      return false

    // 尝试解析日期
    try {
      const date = new Date(dateString)
      return !Number.isNaN(date.getTime())
    }
    catch {
      return false
    }
  }

  /**
   * 验证数字范围
   * @param value 值
   * @param min 最小值
   * @param max 最大值
   * @param inclusive 是否包含边界
   * @returns 是否有效
   */
  static isInRange(value: number, min: number, max: number, inclusive = true): boolean {
    return inclusive ? value >= min && value <= max : value > min && value < max
  }

  /**
   * 验证字符串长度
   * @param str 字符串
   * @param min 最小长度
   * @param max 最大长度
   * @returns 是否有效
   */
  static isValidLength(str: string, min: number, max?: number): boolean {
    if (str.length < min)
      return false
    if (max !== undefined && str.length > max)
      return false
    return true
  }

  /**
   * 验证正则表达式
   * @param value 值
   * @param pattern 正则表达式
   * @returns 是否匹配
   */
  static matches(value: string, pattern: RegExp): boolean {
    return pattern.test(value)
  }

  /**
   * 验证是否为空值
   * @param value 值
   * @returns 是否为空
   */
  static isEmpty(value: any): boolean {
    if (value === null || value === undefined)
      return true
    if (typeof value === 'string')
      return value.trim().length === 0
    if (Array.isArray(value))
      return value.length === 0
    if (typeof value === 'object')
      return Object.keys(value).length === 0
    return false
  }

  /**
   * 验证是否不为空值
   * @param value 值
   * @returns 是否不为空
   */
  static isNotEmpty(value: any): boolean {
    return !ValidationUtils.isEmpty(value)
  }
}
