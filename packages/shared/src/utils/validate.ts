/**
 * 数据验证工具
 * 
 * @description
 * 提供身份证、手机号、银行卡、邮箱等常用数据的验证功能。
 * 支持中国大陆的各种证件和格式验证。
 */

/**
 * 验证中国大陆手机号
 * 
 * @param phone - 手机号
 * @returns 是否为有效手机号
 * 
 * @example
 * ```typescript
 * isValidPhone('13812345678') // true
 * isValidPhone('12345678901') // false
 * isValidPhone('138-1234-5678') // true (支持带分隔符)
 * ```
 */
export function isValidPhone(phone: string): boolean {
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '')

  // 中国大陆手机号规则：11位，以1开头，第二位为3-9
  const phoneRegex = /^1[3-9]\d{9}$/

  return phoneRegex.test(cleanPhone)
}

/**
 * 验证中国大陆身份证号
 * 
 * @param idCard - 身份证号
 * @returns 是否为有效身份证号
 * 
 * @example
 * ```typescript
 * isValidIdCard('110101199003077777') // true (18位)
 * isValidIdCard('110101900307777') // true (15位)
 * isValidIdCard('11010119900307777X') // true (带X)
 * isValidIdCard('123456789012345678') // false
 * ```
 */
export function isValidIdCard(idCard: string): boolean {
  const cleanIdCard = idCard.trim().toUpperCase()

  // 15位或18位身份证
  if (!/^(\d{15}|\d{17}[\dX])$/.test(cleanIdCard)) {
    return false
  }

  // 15位身份证验证
  if (cleanIdCard.length === 15) {
    return isValid15IdCard(cleanIdCard)
  }

  // 18位身份证验证
  return isValid18IdCard(cleanIdCard)
}

/**
 * 验证15位身份证
 */
function isValid15IdCard(idCard: string): boolean {
  // 地区码验证
  const areaCode = idCard.substring(0, 6)
  if (!isValidAreaCode(areaCode)) {
    return false
  }

  // 出生日期验证（15位身份证年份为2位，默认19xx年）
  const year = parseInt('19' + idCard.substring(6, 8))
  const month = parseInt(idCard.substring(8, 10))
  const day = parseInt(idCard.substring(10, 12))

  return isValidDate(year, month, day)
}

/**
 * 验证18位身份证
 */
function isValid18IdCard(idCard: string): boolean {
  // 地区码验证
  const areaCode = idCard.substring(0, 6)
  if (!isValidAreaCode(areaCode)) {
    return false
  }

  // 出生日期验证
  const year = parseInt(idCard.substring(6, 10))
  const month = parseInt(idCard.substring(10, 12))
  const day = parseInt(idCard.substring(12, 14))

  if (!isValidDate(year, month, day)) {
    return false
  }

  // 校验码验证
  return isValidCheckCode(idCard)
}

/**
 * 验证地区码
 */
function isValidAreaCode(areaCode: string): boolean {
  // 简化的地区码验证，实际应用中可以使用完整的地区码表
  const validProvinceCodes = [
    '11', '12', '13', '14', '15', '21', '22', '23',
    '31', '32', '33', '34', '35', '36', '37', '41',
    '42', '43', '44', '45', '46', '50', '51', '52',
    '53', '54', '61', '62', '63', '64', '65', '71',
    '81', '82'
  ]

  const provinceCode = areaCode.substring(0, 2)
  return validProvinceCodes.includes(provinceCode)
}

/**
 * 验证日期
 */
function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > new Date().getFullYear()) {
    return false
  }

  if (month < 1 || month > 12) {
    return false
  }

  const daysInMonth = new Date(year, month, 0).getDate()
  return day >= 1 && day <= daysInMonth
}

/**
 * 验证18位身份证校验码
 */
function isValidCheckCode(idCard: string): boolean {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard.charAt(i)) * weights[i]
  }

  const expectedCheckCode = checkCodes[sum % 11]
  return idCard.charAt(17) === expectedCheckCode
}

/**
 * 验证银行卡号
 * 
 * @param cardNumber - 银行卡号
 * @returns 是否为有效银行卡号
 * 
 * @example
 * ```typescript
 * isValidBankCard('6222600260001072444') // true
 * isValidBankCard('1234567890123456') // false
 * isValidBankCard('6222 6002 6000 1072 444') // true (支持带空格)
 * ```
 */
export function isValidBankCard(cardNumber: string): boolean {
  // 移除所有非数字字符
  const cleanCardNumber = cardNumber.replace(/\D/g, '')

  // 银行卡号长度通常为13-19位
  if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
    return false
  }

  // 使用Luhn算法验证
  return isValidLuhn(cleanCardNumber)
}

/**
 * Luhn算法验证
 */
function isValidLuhn(cardNumber: string): boolean {
  let sum = 0
  let isEven = false

  // 从右到左遍历
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))

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
 * 验证邮箱地址
 * 
 * @param email - 邮箱地址
 * @returns 是否为有效邮箱
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com') // true
 * isValidEmail('user.name+tag@example.co.uk') // true
 * isValidEmail('invalid-email') // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const trimmedEmail = email.trim()

  // 检查是否有连续的点
  if (trimmedEmail.includes('..')) {
    return false
  }

  // 检查是否以点开头或结尾
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return false
  }

  // 检查@符号前后是否有点
  const atIndex = trimmedEmail.indexOf('@')
  if (atIndex > 0 && trimmedEmail.charAt(atIndex - 1) === '.') {
    return false
  }
  if (atIndex < trimmedEmail.length - 1 && trimmedEmail.charAt(atIndex + 1) === '.') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(trimmedEmail)
}

/**
 * 验证URL
 * 
 * @param url - URL地址
 * @returns 是否为有效URL
 * 
 * @example
 * ```typescript
 * isValidUrl('https://example.com') // true
 * isValidUrl('http://localhost:3000') // true
 * isValidUrl('ftp://files.example.com') // true
 * isValidUrl('invalid-url') // false
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
 * 验证IP地址（IPv4）
 * 
 * @param ip - IP地址
 * @returns 是否为有效IPv4地址
 * 
 * @example
 * ```typescript
 * isValidIPv4('192.168.1.1') // true
 * isValidIPv4('255.255.255.255') // true
 * isValidIPv4('256.1.1.1') // false
 * ```
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
  const match = ip.match(ipv4Regex)

  if (!match) {
    return false
  }

  return match.slice(1).every(octet => {
    // 检查前导零（除了单独的"0"）
    if (octet.length > 1 && octet.startsWith('0')) {
      return false
    }

    const num = parseInt(octet)
    return num >= 0 && num <= 255
  })
}

/**
 * 验证IPv6地址
 * 
 * @param ip - IPv6地址
 * @returns 是否为有效IPv6地址
 * 
 * @example
 * ```typescript
 * isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334') // true
 * isValidIPv6('2001:db8:85a3::8a2e:370:7334') // true
 * isValidIPv6('::1') // true
 * ```
 */
export function isValidIPv6(ip: string): boolean {
  // 处理特殊情况
  if (ip === '::' || ip === '::1') {
    return true
  }

  // 检查是否包含双冒号（压缩格式）
  const doubleColonCount = (ip.match(/::/g) || []).length
  if (doubleColonCount > 1) {
    return false
  }

  let parts: string[]
  if (doubleColonCount === 1) {
    // 处理压缩格式
    const [left, right] = ip.split('::')
    const leftParts = left ? left.split(':') : []
    const rightParts = right ? right.split(':') : []
    const missingParts = 8 - leftParts.length - rightParts.length

    if (missingParts < 0) {
      return false
    }

    parts = [...leftParts, ...Array(missingParts).fill('0'), ...rightParts]
  } else {
    // 完整格式
    parts = ip.split(':')
    if (parts.length !== 8) {
      return false
    }
  }

  // 验证每个部分
  return parts.every(part => {
    if (part === '') return false
    if (part.length > 4) return false
    return /^[0-9a-fA-F]+$/.test(part)
  })
}

/**
 * 验证中国大陆固定电话号码
 * 
 * @param phone - 固定电话号码
 * @returns 是否为有效固定电话
 * 
 * @example
 * ```typescript
 * isValidLandline('010-12345678') // true
 * isValidLandline('0755-87654321') // true
 * isValidLandline('400-123-4567') // true
 * ```
 */
export function isValidLandline(phone: string): boolean {
  // 移除所有非数字字符
  const cleanPhone = phone.replace(/\D/g, '')

  // 固定电话格式：区号(3-4位) + 号码(7-8位)
  const landlineRegex = /^0\d{2,3}\d{7,8}$|^400\d{7}$|^800\d{7}$/

  return landlineRegex.test(cleanPhone)
}

/**
 * 验证中国大陆邮政编码
 * 
 * @param zipCode - 邮政编码
 * @returns 是否为有效邮政编码
 * 
 * @example
 * ```typescript
 * isValidZipCode('100000') // true
 * isValidZipCode('518000') // true
 * isValidZipCode('12345') // false
 * ```
 */
export function isValidZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{6}$/
  return zipRegex.test(zipCode.trim())
}

/**
 * 验证密码强度
 * 
 * @param password - 密码
 * @param options - 验证选项
 * @returns 密码强度等级和详细信息
 * 
 * @example
 * ```typescript
 * validatePassword('123456') 
 * // { level: 'weak', score: 1, feedback: ['密码长度至少8位', '需要包含大写字母'] }
 * 
 * validatePassword('MyPassword123!')
 * // { level: 'strong', score: 4, feedback: [] }
 * ```
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number
    requireUppercase?: boolean
    requireLowercase?: boolean
    requireNumbers?: boolean
    requireSymbols?: boolean
  } = {}
): {
  level: 'weak' | 'medium' | 'strong'
  score: number
  feedback: string[]
} {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSymbols = true,
  } = options

  const feedback: string[] = []
  let score = 0

  // 长度检查
  if (password.length < minLength) {
    feedback.push(`密码长度至少${minLength}位`)
  } else {
    score++
  }

  // 大写字母检查
  if (requireUppercase && !/[A-Z]/.test(password)) {
    feedback.push('需要包含大写字母')
  } else if (/[A-Z]/.test(password)) {
    score++
  }

  // 小写字母检查
  if (requireLowercase && !/[a-z]/.test(password)) {
    feedback.push('需要包含小写字母')
  } else if (/[a-z]/.test(password)) {
    score++
  }

  // 数字检查
  if (requireNumbers && !/\d/.test(password)) {
    feedback.push('需要包含数字')
  } else if (/\d/.test(password)) {
    score++
  }

  // 特殊字符检查
  if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('需要包含特殊字符')
  } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  }

  // 常见密码检查
  const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345']
  if (commonPasswords.includes(password.toLowerCase())) {
    feedback.push('不能使用常见密码')
    score = Math.max(0, score - 2)
  }

  // 计算最大可能分数
  let maxPossibleScore = 1 // 长度分数
  if (requireUppercase) maxPossibleScore++
  if (requireLowercase) maxPossibleScore++
  if (requireNumbers) maxPossibleScore++
  if (requireSymbols) maxPossibleScore++

  // 确定强度等级（基于得分比例）
  let level: 'weak' | 'medium' | 'strong'
  const scoreRatio = score / maxPossibleScore
  if (scoreRatio < 0.6) {
    level = 'weak'
  } else if (scoreRatio < 0.9) {
    level = 'medium'
  } else {
    level = 'strong'
  }

  return { level, score, feedback }
}

/**
 * 验证统一社会信用代码
 * 
 * @param code - 统一社会信用代码
 * @returns 是否为有效的统一社会信用代码
 * 
 * @example
 * ```typescript
 * isValidSocialCreditCode('91110000000000000A') // true
 * isValidSocialCreditCode('12345678901234567890') // false
 * ```
 */
export function isValidSocialCreditCode(code: string): boolean {
  const cleanCode = code.trim().toUpperCase()

  // 统一社会信用代码为18位
  if (cleanCode.length !== 18) {
    return false
  }

  // 格式检查：数字和大写字母，不包含I、O、S、V、Z
  const formatRegex = /^[0-9A-HJ-NPQRTUWXY]{18}$/
  if (!formatRegex.test(cleanCode)) {
    return false
  }

  // 校验码验证
  const weights = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28]
  const chars = '0123456789ABCDEFGHJKLMNPQRTUWXY'

  let sum = 0
  for (let i = 0; i < 17; i++) {
    const charIndex = chars.indexOf(cleanCode.charAt(i))
    sum += charIndex * weights[i]
  }

  const checkIndex = 31 - (sum % 31)
  const expectedCheckChar = checkIndex === 31 ? '0' : chars.charAt(checkIndex)

  return cleanCode.charAt(17) === expectedCheckChar
}
