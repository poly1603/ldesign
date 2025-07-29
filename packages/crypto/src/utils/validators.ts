import type {
  EncryptionConfig,
  HashConfig,
  HMACConfig,
  Base64Config,
  RandomConfig,
  KeyDerivationConfig,
  EncryptionAlgorithm,
  HashAlgorithm,
  HMACAlgorithm,
  EncodingFormat
} from '../types'

/**
 * 验证加密配置
 */
export function validateEncryptionConfig(config: EncryptionConfig): void {
  if (!config.algorithm) {
    throw new Error('Encryption algorithm is required')
  }

  if (!config.key) {
    throw new Error('Encryption key is required')
  }

  if (config.key.length === 0) {
    throw new Error('Encryption key cannot be empty')
  }

  // 验证AES密钥长度
  if (config.algorithm === EncryptionAlgorithm.AES) {
    const keyLength = config.key.length
    if (![16, 24, 32].includes(keyLength)) {
      throw new Error('AES key must be 16, 24, or 32 characters long')
    }
  }

  // 验证DES密钥长度
  if (config.algorithm === EncryptionAlgorithm.DES) {
    if (config.key.length !== 8) {
      throw new Error('DES key must be 8 characters long')
    }
  }

  // 验证3DES密钥长度
  if (config.algorithm === EncryptionAlgorithm.TRIPLE_DES) {
    const keyLength = config.key.length
    if (![16, 24].includes(keyLength)) {
      throw new Error('3DES key must be 16 or 24 characters long')
    }
  }

  // 验证IV长度
  if (config.iv) {
    if (config.algorithm === EncryptionAlgorithm.AES && config.iv.length !== 16) {
      throw new Error('AES IV must be 16 characters long')
    }
    if (config.algorithm === EncryptionAlgorithm.DES && config.iv.length !== 8) {
      throw new Error('DES IV must be 8 characters long')
    }
    if (config.algorithm === EncryptionAlgorithm.TRIPLE_DES && config.iv.length !== 8) {
      throw new Error('3DES IV must be 8 characters long')
    }
  }
}

/**
 * 验证哈希配置
 */
export function validateHashConfig(config: HashConfig): void {
  if (!config.algorithm) {
    throw new Error('Hash algorithm is required')
  }

  if (!Object.values(HashAlgorithm).includes(config.algorithm)) {
    throw new Error(`Unsupported hash algorithm: ${config.algorithm}`)
  }

  if (config.outputFormat && !Object.values(EncodingFormat).includes(config.outputFormat)) {
    throw new Error(`Unsupported output format: ${config.outputFormat}`)
  }
}

/**
 * 验证HMAC配置
 */
export function validateHMACConfig(config: HMACConfig): void {
  if (!config.algorithm) {
    throw new Error('HMAC algorithm is required')
  }

  if (!config.key) {
    throw new Error('HMAC key is required')
  }

  if (config.key.length === 0) {
    throw new Error('HMAC key cannot be empty')
  }

  if (!Object.values(HMACAlgorithm).includes(config.algorithm)) {
    throw new Error(`Unsupported HMAC algorithm: ${config.algorithm}`)
  }

  if (config.outputFormat && !Object.values(EncodingFormat).includes(config.outputFormat)) {
    throw new Error(`Unsupported output format: ${config.outputFormat}`)
  }
}

/**
 * 验证Base64配置
 */
export function validateBase64Config(config: Base64Config): void {
  if (typeof config.urlSafe !== 'undefined' && typeof config.urlSafe !== 'boolean') {
    throw new Error('urlSafe must be a boolean')
  }

  if (typeof config.padding !== 'undefined' && typeof config.padding !== 'boolean') {
    throw new Error('padding must be a boolean')
  }
}

/**
 * 验证随机数配置
 */
export function validateRandomConfig(config: RandomConfig): void {
  if (!config.length || config.length <= 0) {
    throw new Error('Random length must be a positive number')
  }

  if (config.length > 1024) {
    throw new Error('Random length cannot exceed 1024')
  }

  if (config.format && !Object.values(EncodingFormat).includes(config.format)) {
    throw new Error(`Unsupported format: ${config.format}`)
  }
}

/**
 * 验证密钥派生配置
 */
export function validateKeyDerivationConfig(config: KeyDerivationConfig): void {
  if (!config.password) {
    throw new Error('Password is required for key derivation')
  }

  if (!config.salt) {
    throw new Error('Salt is required for key derivation')
  }

  if (config.iterations && config.iterations <= 0) {
    throw new Error('Iterations must be a positive number')
  }

  if (config.keySize && config.keySize <= 0) {
    throw new Error('Key size must be a positive number')
  }
}

/**
 * 验证十六进制字符串
 */
export function isValidHex(hex: string): boolean {
  return /^[0-9a-fA-F]+$/.test(hex)
}

/**
 * 验证Base64字符串
 */
export function isValidBase64(base64: string): boolean {
  try {
    return btoa(atob(base64)) === base64
  } catch {
    return false
  }
}

/**
 * 验证Base64URL字符串
 */
export function isValidBase64Url(base64url: string): boolean {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4
  const paddedBase64 = padding ? base64 + '='.repeat(4 - padding) : base64
  return isValidBase64(paddedBase64)
}

/**
 * 验证UTF-8字符串
 */
export function isValidUtf8(str: string): boolean {
  try {
    return str === decodeURIComponent(encodeURIComponent(str))
  } catch {
    return false
  }
}

/**
 * 验证密钥强度
 */
export function validateKeyStrength(key: string): {
  score: number
  level: 'weak' | 'medium' | 'strong' | 'very-strong'
  suggestions: string[]
} {
  let score = 0
  const suggestions: string[] = []

  // 长度检查
  if (key.length >= 8) score += 1
  else suggestions.push('密钥长度至少8个字符')

  if (key.length >= 12) score += 1
  if (key.length >= 16) score += 1

  // 字符类型检查
  if (/[a-z]/.test(key)) score += 1
  else suggestions.push('包含小写字母')

  if (/[A-Z]/.test(key)) score += 1
  else suggestions.push('包含大写字母')

  if (/[0-9]/.test(key)) score += 1
  else suggestions.push('包含数字')

  if (/[^a-zA-Z0-9]/.test(key)) score += 1
  else suggestions.push('包含特殊字符')

  // 重复字符检查
  if (!/(..).*\1/.test(key)) score += 1
  else suggestions.push('避免重复字符模式')

  let level: 'weak' | 'medium' | 'strong' | 'very-strong'
  if (score <= 2) level = 'weak'
  else if (score <= 4) level = 'medium'
  else if (score <= 6) level = 'strong'
  else level = 'very-strong'

  return { score, level, suggestions }
}