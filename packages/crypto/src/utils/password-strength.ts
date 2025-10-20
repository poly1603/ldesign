/**
 * 密码强度检测工具
 * 提供密码强度评估和安全建议
 */

/**
 * 密码强度级别
 */
export enum PasswordStrength {
  VeryWeak = 0,
  Weak = 1,
  Fair = 2,
  Good = 3,
  Strong = 4,
  VeryStrong = 5,
}

/**
 * 密码分析结果
 */
interface CharacterTypes { lowercase: boolean; uppercase: boolean; numbers: boolean; symbols: boolean; unicode: boolean }

export interface PasswordAnalysis {
  /** 强度级别 */
  strength: PasswordStrength
  /** 强度分数（0-100） */
  score: number
  /** 长度 */
  length: number
  /** 包含的字符类型 */
  characterTypes: {
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
    unicode: boolean
  }
  /** 熵值（比特） */
  entropy: number
  /** 破解时间估算 */
  crackTime: {
    online: string // 在线攻击
    offline: string // 离线攻击
    offlineSlowHash: string // 使用慢哈希的离线攻击
  }
  /** 问题列表 */
  issues: string[]
  /** 建议列表 */
  suggestions: string[]
  /** 是否包含常见密码 */
  isCommon: boolean
  /** 是否包含重复字符 */
  hasRepeats: boolean
  /** 是否包含序列 */
  hasSequence: boolean
  /** 是否包含键盘模式 */
  hasKeyboardPattern: boolean
}

/**
 * 密码强度检测器
 */
export class PasswordStrengthChecker {
  // 常见密码列表（简化版）
  private readonly commonPasswords = new Set([
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'qwertyuiop',
    'abc123',
    'Password1',
    'password1',
    '123123',
    'welcome123',
    'admin123',
    'root',
    'toor',
    'pass',
    'pass123',
    'pass1234',
    'password1234',
    'qwerty123',
    'qwerty1234',
    'qazwsx',
    'password!',
    'p@ssword',
    'p@ssw0rd',
    'Password123',
    'admin@123',
    'Admin@123',
    'administrator',
    'Administrator',
  ])

  // 键盘模式
  private readonly keyboardPatterns = [
    'qwerty',
    'asdfgh',
    'zxcvbn',
    'qwertyuiop',
    'asdfghjkl',
    'zxcvbnm',
    '123456',
    '987654',
    'qazwsx',
    'qweasd',
    '!@#$%^',
    '1qaz2wsx',
  ]

  // 常见序列
  private readonly sequences = [
    'abcdef',
    'fedcba',
    '123456',
    '654321',
    'zyxwvu',
    'uvwxyz',
    '012345',
    '543210',
  ]


  /**
   * 分析密码强度
   */
  analyze(password: string): PasswordAnalysis {
    const length = password.length
    const characterTypes = this.analyzeCharacterTypes(password)
    const entropy = this.calculateEntropy(password)
    const score = this.calculateScore(password, characterTypes, entropy)
    const strength = this.getStrengthLevel(score)
    const issues = this.identifyIssues(password, characterTypes)
    const suggestions = this.generateSuggestions(password, characterTypes, issues)
    const crackTime = this.estimateCrackTime(entropy)

    return {
      strength,
      score,
      length,
      characterTypes,
      entropy,
      crackTime,
      issues,
      suggestions,
      isCommon: this.isCommonPassword(password),
      hasRepeats: this.hasRepeatingCharacters(password),
      hasSequence: this.hasSequence(password),
      hasKeyboardPattern: this.hasKeyboardPattern(password),
    }
  }

  /**
   * 分析字符类型
   */
  private analyzeCharacterTypes(password: string): CharacterTypes {
    return {
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^a-z0-9]/i.test(password),
      unicode: /[^\u0020-\u007E]/.test(password),
    }
  }

  /**
   * 计算熵值
   */
  private calculateEntropy(password: string): number {
    const charset = this.getCharsetSize(password)
    return password.length * Math.log2(charset)
  }

  /**
   * 获取字符集大小
   */
  private getCharsetSize(password: string): number {
    let size = 0
    if (/[a-z]/.test(password)) { size += 26 }
    if (/[A-Z]/.test(password)) { size += 26 }
    if (/\d/.test(password)) { size += 10 }
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) { size += 32 }
    if (/[^\u0020-\u007E]/.test(password)) { size += 128 } // Unicode
    return size || 1
  }

  /**
   * 计算分数
   */
  private calculateScore(
    password: string,
    characterTypes: CharacterTypes,
    entropy: number,
  ): number {
    let score = 0

    // 基础分数（基于熵）
    score = Math.min(entropy * 1.5, 50)

    // 长度奖励
    if (password.length >= 8) { score += 10 }
    if (password.length >= 12) { score += 10 }
    if (password.length >= 16) { score += 10 }
    if (password.length >= 20) { score += 10 }

    // 字符类型奖励
    const typeCount = Object.values(characterTypes).filter(Boolean).length
    score += typeCount * 5

    // 惩罚
    if (this.isCommonPassword(password)) { score -= 50 }
    if (this.hasRepeatingCharacters(password)) { score -= 10 }
    if (this.hasSequence(password)) { score -= 15 }
    if (this.hasKeyboardPattern(password)) { score -= 15 }
    if (password.length < 8) { score -= 20 }

    // 特殊字符奖励
    if (characterTypes.symbols) { score += 10 }
    if (characterTypes.unicode) { score += 5 }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 获取强度级别
   */
  private getStrengthLevel(score: number): PasswordStrength {
    if (score < 20) { return PasswordStrength.VeryWeak }
    if (score < 40) { return PasswordStrength.Weak }
    if (score < 60) { return PasswordStrength.Fair }
    if (score < 75) { return PasswordStrength.Good }
    if (score < 90) { return PasswordStrength.Strong }
    return PasswordStrength.VeryStrong
  }

  /**
   * 识别问题
   */
  private identifyIssues(password: string, characterTypes: CharacterTypes): string[] {
    const issues: string[] = []

    if (password.length < 8) {
      issues.push('密码太短（少于8个字符）')
    }
    if (password.length < 12) {
      issues.push('密码长度建议至少12个字符')
    }
    if (this.isCommonPassword(password)) {
      issues.push('密码过于常见，容易被猜测')
    }
    if (!characterTypes.uppercase) {
      issues.push('缺少大写字母')
    }
    if (!characterTypes.lowercase) {
      issues.push('缺少小写字母')
    }
    if (!characterTypes.numbers) {
      issues.push('缺少数字')
    }
    if (!characterTypes.symbols) {
      issues.push('缺少特殊字符')
    }
    if (this.hasRepeatingCharacters(password)) {
      issues.push('包含重复字符')
    }
    if (this.hasSequence(password)) {
      issues.push('包含可预测的序列')
    }
    if (this.hasKeyboardPattern(password)) {
      issues.push('包含键盘模式')
    }
    if (this.containsPersonalInfo(password)) {
      issues.push('可能包含个人信息')
    }

    return issues
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    password: string,
    characterTypes: CharacterTypes,
    issues: string[],
  ): string[] {
    const suggestions: string[] = []

    if (password.length < 12) {
      suggestions.push('增加密码长度至12个字符以上')
    }
    if (password.length < 16) {
      suggestions.push('考虑使用16个字符或更长的密码以获得更好的安全性')
    }
    if (!characterTypes.uppercase || !characterTypes.lowercase) {
      suggestions.push('混合使用大小写字母')
    }
    if (!characterTypes.numbers) {
      suggestions.push('添加数字增强复杂度')
    }
    if (!characterTypes.symbols) {
      suggestions.push('使用特殊字符如 !@#$%^&*')
    }
    if (issues.length > 3) {
      suggestions.push('考虑使用密码管理器生成和存储强密码')
    }
    if (this.isCommonPassword(password)) {
      suggestions.push('避免使用常见密码，创建独特的密码')
    }
    suggestions.push('考虑使用密码短语（多个单词组合）')
    suggestions.push('定期更新密码')
    suggestions.push('为不同账户使用不同的密码')

    return suggestions
  }

  /**
   * 估算破解时间
   */
  private estimateCrackTime(entropy: number): {
    online: string
    offline: string
    offlineSlowHash: string
  } {
    // 假设攻击速度
    const onlineAttacksPerSecond = 100 // 在线攻击（有速率限制）
    const offlineAttacksPerSecond = 1e9 // 离线攻击（10亿次/秒）
    const offlineSlowHashAttacksPerSecond = 1e4 // 使用慢哈希的离线攻击

    const possibleCombinations = 2 ** entropy
    const averageAttempts = possibleCombinations / 2

    const onlineSeconds = averageAttempts / onlineAttacksPerSecond
    const offlineSeconds = averageAttempts / offlineAttacksPerSecond
    const offlineSlowHashSeconds = averageAttempts / offlineSlowHashAttacksPerSecond

    return {
      online: this.formatTime(onlineSeconds),
      offline: this.formatTime(offlineSeconds),
      offlineSlowHash: this.formatTime(offlineSlowHashSeconds),
    }
  }

  /**
   * 格式化时间
   */
  private formatTime(seconds: number): string {
    if (seconds < 1) { return '立即' }
    if (seconds < 60) { return `${Math.round(seconds)}秒` }
    if (seconds < 3600) { return `${Math.round(seconds / 60)}分钟` }
    if (seconds < 86400) { return `${Math.round(seconds / 3600)}小时` }
    if (seconds < 2592000) { return `${Math.round(seconds / 86400)}天` }
    if (seconds < 31536000) { return `${Math.round(seconds / 2592000)}个月` }
    if (seconds < 3153600000) { return `${Math.round(seconds / 31536000)}年` }

    const years = seconds / 31536000
    if (years < 1000) { return `${Math.round(years)}年` }
    if (years < 1000000) { return `${Math.round(years / 1000)}千年` }
    if (years < 1000000000) { return `${Math.round(years / 1000000)}百万年` }
    return '数十亿年以上'
  }

  /**
   * 检查是否为常见密码
   */
  private isCommonPassword(password: string): boolean {
    return this.commonPasswords.has(password.toLowerCase())
  }

  /**
   * 检查重复字符
   */
  private hasRepeatingCharacters(password: string): boolean {
    return /(.)\1{2,}/.test(password)
  }

  /**
   * 检查序列
   */
  private hasSequence(password: string): boolean {
    const lower = password.toLowerCase()
    return this.sequences.some(seq => lower.includes(seq))
  }

  /**
   * 检查键盘模式
   */
  private hasKeyboardPattern(password: string): boolean {
    const lower = password.toLowerCase()
    return this.keyboardPatterns.some(pattern => lower.includes(pattern))
  }

  /**
   * 检查是否包含个人信息（简化版）
   */
  private containsPersonalInfo(password: string): boolean {
    const commonPersonalInfo = [
      /\d{4}/, // 年份
      /\d{2}[/-]\d{2}/, // 日期
      /[a-z]+\d{2,4}/, // 名字+数字
    ]
    return commonPersonalInfo.some(pattern => pattern.test(password.toLowerCase()))
  }

  /**
   * 生成强密码
   */
  generateStrongPassword(options: {
    length?: number
    includeUppercase?: boolean
    includeLowercase?: boolean
    includeNumbers?: boolean
    includeSymbols?: boolean
    excludeSimilar?: boolean
    excludeAmbiguous?: boolean
  } = {}): string {
    const opts = {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      ...options,
    }

    let charset = ''
    let password = ''

    // 构建字符集
    if (opts.includeLowercase) {
      charset += opts.excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz'
    }
    if (opts.includeUppercase) {
      charset += opts.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    }
    if (opts.includeNumbers) {
      charset += opts.excludeSimilar ? '23456789' : '0123456789'
    }
    if (opts.includeSymbols) {
      charset += opts.excludeAmbiguous ? '!@#$%^&*+-=' : '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    // 确保至少包含每种类型的字符
    const requiredChars: string[] = []
    if (opts.includeLowercase) { requiredChars.push(this.getRandomChar('abcdefghijklmnopqrstuvwxyz')) }
    if (opts.includeUppercase) { requiredChars.push(this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ')) }
    if (opts.includeNumbers) { requiredChars.push(this.getRandomChar('0123456789')) }
    if (opts.includeSymbols) { requiredChars.push(this.getRandomChar('!@#$%^&*()_+-=')) }

    // 生成剩余字符
    for (let i = requiredChars.length; i < opts.length; i++) {
      password += this.getRandomChar(charset)
    }

    // 随机插入必需字符
    for (const char of requiredChars) {
      const position = Math.floor(Math.random() * (password.length + 1))
      password = password.slice(0, position) + char + password.slice(position)
    }

    return password
  }

  /**
   * 获取随机字符
   */
  private getRandomChar(charset: string): string {
    const randomIndex = Math.floor(Math.random() * charset.length)
    return charset[randomIndex]
  }

  /**
   * 生成密码短语
   */
  generatePassphrase(options: {
    wordCount?: number
    separator?: string
    capitalize?: boolean
    includeNumbers?: boolean
  } = {}): string {
    const opts = {
      wordCount: 4,
      separator: '-',
      capitalize: true,
      includeNumbers: false,
      ...options,
    }

    // 简化的单词列表
    const words = [
      'time',
      'person',
      'year',
      'way',
      'day',
      'thing',
      'man',
      'world',
      'life',
      'hand',
      'part',
      'child',
      'eye',
      'woman',
      'place',
      'work',
      'week',
      'case',
      'point',
      'company',
      'number',
      'group',
      'problem',
      'fact',
      'blue',
      'green',
      'red',
      'yellow',
      'orange',
      'purple',
      'black',
      'white',
      'happy',
      'sad',
      'angry',
      'calm',
      'brave',
      'clever',
      'kind',
      'strong',
      'run',
      'jump',
      'walk',
      'talk',
      'think',
      'know',
      'want',
      'see',
      'ocean',
      'mountain',
      'river',
      'forest',
      'desert',
      'island',
      'valley',
      'lake',
    ]

    const selectedWords: string[] = []
    for (let i = 0; i < opts.wordCount; i++) {
      let word = words[Math.floor(Math.random() * words.length)]
      if (opts.capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1)
      }
      selectedWords.push(word)
    }

    let passphrase = selectedWords.join(opts.separator)

    if (opts.includeNumbers) {
      passphrase += opts.separator + Math.floor(Math.random() * 10000)
    }

    return passphrase
  }

  /**
   * 获取强度描述
   */
  getStrengthDescription(strength: PasswordStrength): string {
    switch (strength) {
      case PasswordStrength.VeryWeak:
        return '非常弱'
      case PasswordStrength.Weak:
        return '弱'
      case PasswordStrength.Fair:
        return '一般'
      case PasswordStrength.Good:
        return '好'
      case PasswordStrength.Strong:
        return '强'
      case PasswordStrength.VeryStrong:
        return '非常强'
      default:
        return '未知'
    }
  }

  /**
   * 获取强度颜色（用于UI显示）
   */
  getStrengthColor(strength: PasswordStrength): string {
    switch (strength) {
      case PasswordStrength.VeryWeak:
        return '#d32f2f' // 红色
      case PasswordStrength.Weak:
        return '#f57c00' // 橙色
      case PasswordStrength.Fair:
        return '#fbc02d' // 黄色
      case PasswordStrength.Good:
        return '#689f38' // 浅绿色
      case PasswordStrength.Strong:
        return '#388e3c' // 绿色
      case PasswordStrength.VeryStrong:
        return '#1976d2' // 蓝色
      default:
        return '#757575' // 灰色
    }
  }
}

// 导出实例
export const passwordStrengthChecker = new PasswordStrengthChecker()
