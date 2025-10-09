/**
 * 密码强度检测工具
 * 提供高性能的密码强度评估和建议
 */

/**
 * 密码强度等级
 */
export enum PasswordStrength {
  /** 非常弱 */
  VERY_WEAK = 0,
  /** 弱 */
  WEAK = 1,
  /** 中等 */
  MEDIUM = 2,
  /** 强 */
  STRONG = 3,
  /** 非常强 */
  VERY_STRONG = 4,
}

/**
 * 密码强度结果
 */
export interface PasswordStrengthResult {
  /** 强度等级 */
  strength: PasswordStrength
  /** 分数 (0-100) */
  score: number
  /** 强度描述 */
  label: string
  /** 颜色 */
  color: string
  /** 建议 */
  suggestions: string[]
  /** 是否满足最低要求 */
  isValid: boolean
  /** 详细信息 */
  details: {
    length: number
    hasLowerCase: boolean
    hasUpperCase: boolean
    hasNumbers: boolean
    hasSpecialChars: boolean
    hasSequential: boolean
    hasRepeated: boolean
  }
}

/**
 * 密码要求配置
 */
export interface PasswordRequirements {
  /** 最小长度 */
  minLength?: number
  /** 最大长度 */
  maxLength?: number
  /** 需要小写字母 */
  requireLowerCase?: boolean
  /** 需要大写字母 */
  requireUpperCase?: boolean
  /** 需要数字 */
  requireNumbers?: boolean
  /** 需要特殊字符 */
  requireSpecialChars?: boolean
  /** 禁止连续字符 */
  forbidSequential?: boolean
  /** 禁止重复字符 */
  forbidRepeated?: boolean
}

/**
 * 默认要求
 */
const DEFAULT_REQUIREMENTS: Required<PasswordRequirements> = {
  minLength: 8,
  maxLength: 128,
  requireLowerCase: true,
  requireUpperCase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidSequential: false,
  forbidRepeated: false,
}

/**
 * 常见弱密码列表
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
  'baseball', '111111', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123',
  '654321', 'superman', 'qazwsx', 'michael', 'football',
])

/**
 * 检测密码强度
 */
export function checkPasswordStrength(
  password: string,
  requirements: PasswordRequirements = {}
): PasswordStrengthResult {
  const reqs = { ...DEFAULT_REQUIREMENTS, ...requirements }
  
  // 初始化详细信息
  const details = {
    length: password.length,
    hasLowerCase: /[a-z]/.test(password),
    hasUpperCase: /[A-Z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasSequential: hasSequentialChars(password),
    hasRepeated: hasRepeatedChars(password),
  }

  // 计算分数
  let score = 0
  const suggestions: string[] = []

  // 长度评分 (0-30分)
  if (details.length < reqs.minLength) {
    suggestions.push(`密码长度至少需要 ${reqs.minLength} 个字符`)
  } else if (details.length >= reqs.minLength && details.length < 12) {
    score += 15
  } else if (details.length >= 12 && details.length < 16) {
    score += 22
  } else {
    score += 30
  }

  // 字符类型评分 (0-40分)
  if (details.hasLowerCase) {
    score += 10
  } else if (reqs.requireLowerCase) {
    suggestions.push('添加小写字母')
  }

  if (details.hasUpperCase) {
    score += 10
  } else if (reqs.requireUpperCase) {
    suggestions.push('添加大写字母')
  }

  if (details.hasNumbers) {
    score += 10
  } else if (reqs.requireNumbers) {
    suggestions.push('添加数字')
  }

  if (details.hasSpecialChars) {
    score += 10
  } else if (reqs.requireSpecialChars) {
    suggestions.push('添加特殊字符 (!@#$%^&* 等)')
  }

  // 复杂度评分 (0-30分)
  const uniqueChars = new Set(password).size
  const uniqueRatio = uniqueChars / details.length
  
  if (uniqueRatio > 0.8) {
    score += 15
  } else if (uniqueRatio > 0.6) {
    score += 10
  } else if (uniqueRatio > 0.4) {
    score += 5
  } else {
    suggestions.push('避免使用过多重复字符')
  }

  // 检查常见密码
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score = Math.min(score, 20)
    suggestions.push('这是一个常见密码，请使用更复杂的密码')
  }

  // 检查连续字符
  if (details.hasSequential && reqs.forbidSequential) {
    score -= 10
    suggestions.push('避免使用连续字符 (如 abc, 123)')
  }

  // 检查重复字符
  if (details.hasRepeated && reqs.forbidRepeated) {
    score -= 10
    suggestions.push('避免使用重复字符 (如 aaa, 111)')
  }

  // 混合字符类型加分
  const typeCount = [
    details.hasLowerCase,
    details.hasUpperCase,
    details.hasNumbers,
    details.hasSpecialChars,
  ].filter(Boolean).length

  if (typeCount >= 4) {
    score += 15
  } else if (typeCount >= 3) {
    score += 10
  } else if (typeCount >= 2) {
    score += 5
  }

  // 限制分数范围
  score = Math.max(0, Math.min(100, score))

  // 确定强度等级
  let strength: PasswordStrength
  let label: string
  let color: string

  if (score < 20) {
    strength = PasswordStrength.VERY_WEAK
    label = '非常弱'
    color = '#f44336'
  } else if (score < 40) {
    strength = PasswordStrength.WEAK
    label = '弱'
    color = '#ff9800'
  } else if (score < 60) {
    strength = PasswordStrength.MEDIUM
    label = '中等'
    color = '#ffc107'
  } else if (score < 80) {
    strength = PasswordStrength.STRONG
    label = '强'
    color = '#8bc34a'
  } else {
    strength = PasswordStrength.VERY_STRONG
    label = '非常强'
    color = '#4caf50'
  }

  // 验证是否满足最低要求
  const isValid = 
    details.length >= reqs.minLength &&
    details.length <= reqs.maxLength &&
    (!reqs.requireLowerCase || details.hasLowerCase) &&
    (!reqs.requireUpperCase || details.hasUpperCase) &&
    (!reqs.requireNumbers || details.hasNumbers) &&
    (!reqs.requireSpecialChars || details.hasSpecialChars) &&
    (!reqs.forbidSequential || !details.hasSequential) &&
    (!reqs.forbidRepeated || !details.hasRepeated)

  return {
    strength,
    score,
    label,
    color,
    suggestions,
    isValid,
    details,
  }
}

/**
 * 检测连续字符
 */
function hasSequentialChars(password: string): boolean {
  const sequences = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
  ]

  for (const seq of sequences) {
    for (let i = 0; i < seq.length - 2; i++) {
      const substring = seq.substring(i, i + 3)
      if (password.includes(substring)) {
        return true
      }
    }
  }

  return false
}

/**
 * 检测重复字符
 */
function hasRepeatedChars(password: string): boolean {
  return /(.)\1{2,}/.test(password)
}

/**
 * 生成强密码
 */
export function generateStrongPassword(length = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + special
  
  let password = ''
  
  // 确保至少包含每种类型的字符
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // 填充剩余长度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 获取密码强度颜色
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  const colors = {
    [PasswordStrength.VERY_WEAK]: '#f44336',
    [PasswordStrength.WEAK]: '#ff9800',
    [PasswordStrength.MEDIUM]: '#ffc107',
    [PasswordStrength.STRONG]: '#8bc34a',
    [PasswordStrength.VERY_STRONG]: '#4caf50',
  }
  return colors[strength]
}

/**
 * 获取密码强度标签
 */
export function getPasswordStrengthLabel(strength: PasswordStrength): string {
  const labels = {
    [PasswordStrength.VERY_WEAK]: '非常弱',
    [PasswordStrength.WEAK]: '弱',
    [PasswordStrength.MEDIUM]: '中等',
    [PasswordStrength.STRONG]: '强',
    [PasswordStrength.VERY_STRONG]: '非常强',
  }
  return labels[strength]
}

