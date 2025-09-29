/**
 * 字符串验证工具函数
 * 提供各种字符串验证功能
 */

/**
 * 验证是否为有效的邮箱地址
 * @param email 邮箱地址
 * @returns 是否为有效邮箱
 * @example
 * ```typescript
 * import { isValidEmail } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isValidEmail('test@example.com') // true
 * const result2 = isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 验证是否为有效的URL
 * @param url URL地址
 * @returns 是否为有效URL
 * @example
 * ```typescript
 * import { isValidUrl } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isValidUrl('https://example.com') // true
 * const result2 = isValidUrl('invalid-url') // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * 验证是否为有效的手机号码（中国大陆）
 * @param phone 手机号码
 * @returns 是否为有效手机号
 * @example
 * ```typescript
 * import { isValidPhone } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isValidPhone('13812345678') // true
 * const result2 = isValidPhone('12345') // false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 验证是否为有效的身份证号码（中国大陆）
 * @param idCard 身份证号码
 * @returns 是否为有效身份证号
 * @example
 * ```typescript
 * import { isValidIdCard } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isValidIdCard('110101199003077777') // true（示例）
 * ```
 */
export function isValidIdCard(idCard: string): boolean {
  // 18位身份证号码正则
  const idCardRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  
  if (!idCardRegex.test(idCard)) {
    return false
  }
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  
  const checkCode = checkCodes[sum % 11]
  return checkCode === idCard[17].toUpperCase()
}

/**
 * 验证密码强度
 * @param password 密码
 * @param options 验证选项
 * @returns 密码强度等级和是否通过验证
 * @example
 * ```typescript
 * import { validatePassword } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = validatePassword('Abc123!@#')
 * // { strength: 'strong', isValid: true, score: 4 }
 * ```
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSpecialChars?: boolean
  } = {}
): {
  strength: 'weak' | 'medium' | 'strong'
  isValid: boolean
  score: number
  issues: string[]
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options
  
  const issues: string[] = []
  let score = 0
  
  // 检查长度
  if (password.length < minLength) {
    issues.push(`密码长度至少需要${minLength}位`)
  } else {
    score++
  }
  
  // 检查大写字母
  if (requireUppercase && !/[A-Z]/.test(password)) {
    issues.push('密码需要包含大写字母')
  } else if (/[A-Z]/.test(password)) {
    score++
  }
  
  // 检查小写字母
  if (requireLowercase && !/[a-z]/.test(password)) {
    issues.push('密码需要包含小写字母')
  } else if (/[a-z]/.test(password)) {
    score++
  }
  
  // 检查数字
  if (requireNumbers && !/\d/.test(password)) {
    issues.push('密码需要包含数字')
  } else if (/\d/.test(password)) {
    score++
  }
  
  // 检查特殊字符
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('密码需要包含特殊字符')
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  }
  
  // 计算强度
  let strength: 'weak' | 'medium' | 'strong'
  if (score <= 2) {
    strength = 'weak'
  } else if (score <= 3) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }
  
  return {
    strength,
    isValid: issues.length === 0,
    score,
    issues
  }
}

/**
 * 检查字符串是否只包含数字
 * @param str 输入字符串
 * @returns 是否只包含数字
 * @example
 * ```typescript
 * import { isNumeric } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isNumeric('12345') // true
 * const result2 = isNumeric('123abc') // false
 * ```
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str)
}

/**
 * 检查字符串是否只包含字母
 * @param str 输入字符串
 * @returns 是否只包含字母
 * @example
 * ```typescript
 * import { isAlpha } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isAlpha('hello') // true
 * const result2 = isAlpha('hello123') // false
 * ```
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str)
}

/**
 * 检查字符串是否只包含字母和数字
 * @param str 输入字符串
 * @returns 是否只包含字母和数字
 * @example
 * ```typescript
 * import { isAlphanumeric } from '@ldesign/typescript-utils-example/string'
 * 
 * const result = isAlphanumeric('hello123') // true
 * const result2 = isAlphanumeric('hello-123') // false
 * ```
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str)
}
