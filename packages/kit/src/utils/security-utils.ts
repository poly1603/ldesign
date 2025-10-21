/**
 * 安全工具类
 * 提供加密、哈希、Token 生成等安全功能
 * 
 * @example
 * ```typescript
 * import { SecurityUtils, HashUtils, TokenUtils } from '@ldesign/kit'
 * 
 * // 生成随机 Token
 * const token = TokenUtils.generateToken(32)
 * 
 * // 哈希密码
 * const hash = await HashUtils.hash('password123')
 * const valid = await HashUtils.verify('password123', hash)
 * 
 * // 加密数据
 * const encrypted = SecurityUtils.encrypt('sensitive data', 'secret-key')
 * const decrypted = SecurityUtils.decrypt(encrypted, 'secret-key')
 * ```
 */

import { createCipheriv, createDecipheriv, createHash, createHmac, pbkdf2, randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const pbkdf2Async = promisify(pbkdf2)
const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>

/**
 * 加密选项
 */
export interface EncryptOptions {
  /**
   * 加密算法
   */
  algorithm?: string
  /**
   * 初始化向量
   */
  iv?: Buffer
  /**
   * 密钥长度
   */
  keyLength?: number
}

/**
 * 哈希选项
 */
export interface HashOptions {
  /**
   * 哈希算法
   */
  algorithm?: 'sha256' | 'sha512' | 'md5' | 'sha1'
  /**
   * 盐值
   */
  salt?: string
  /**
   * 迭代次数
   */
  iterations?: number
  /**
   * 密钥长度
   */
  keyLength?: number
  /**
   * 输出格式
   */
  encoding?: 'hex' | 'base64'
}

/**
 * Token 选项
 */
export interface TokenOptions {
  /**
   * Token 长度
   */
  length?: number
  /**
   * 输出格式
   */
  encoding?: 'hex' | 'base64' | 'base64url'
  /**
   * 过期时间（毫秒）
   */
  expiresIn?: number
}

/**
 * 安全工具类
 */
export class SecurityUtils {
  /**
   * 加密数据
   * @param data 数据
   * @param key 密钥
   * @param options 选项
   * @returns 加密后的数据
   */
  static encrypt(data: string, key: string, options: EncryptOptions = {}): string {
    const {
      algorithm = 'aes-256-cbc',
      keyLength = 32,
    } = options

    // 生成密钥
    const keyBuffer = createHash('sha256').update(key).digest().slice(0, keyLength)

    // 生成或使用提供的 IV
    const iv = options.iv || randomBytes(16)

    // 创建加密器
    const cipher = createCipheriv(algorithm, keyBuffer, iv)

    // 加密数据
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // 返回 IV + 加密数据
    return `${iv.toString('hex')}:${encrypted}`
  }

  /**
   * 解密数据
   * @param encryptedData 加密的数据
   * @param key 密钥
   * @param options 选项
   * @returns 解密后的数据
   */
  static decrypt(encryptedData: string, key: string, options: EncryptOptions = {}): string {
    const {
      algorithm = 'aes-256-cbc',
      keyLength = 32,
    } = options

    // 分离 IV 和加密数据
    const [ivHex, encrypted] = encryptedData.split(':')
    if (!ivHex || !encrypted) {
      throw new Error('Invalid encrypted data format')
    }

    // 生成密钥
    const keyBuffer = createHash('sha256').update(key).digest().slice(0, keyLength)
    const iv = Buffer.from(ivHex, 'hex')

    // 创建解密器
    const decipher = createDecipheriv(algorithm, keyBuffer, iv)

    // 解密数据
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  /**
   * 生成随机字节
   * @param size 字节数
   * @returns 随机字节
   */
  static randomBytes(size: number): Buffer {
    return randomBytes(size)
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @param encoding 编码
   * @returns 随机字符串
   */
  static randomString(length: number, encoding: 'hex' | 'base64' | 'base64url' = 'hex'): string {
    const bytes = randomBytes(Math.ceil(length * 0.5))
    let result = bytes.toString(encoding === 'base64url' ? 'base64' : encoding)

    if (encoding === 'base64url') {
      result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    }

    return result.slice(0, length)
  }

  /**
   * 生成 UUID v4
   * @returns UUID
   */
  static generateUuid(): string {
    const bytes = randomBytes(16)

    // 设置版本（4）和变体位
    bytes[6] = (bytes[6]! & 0x0f) | 0x40
    bytes[8] = (bytes[8]! & 0x3f) | 0x80

    return [
      bytes.toString('hex', 0, 4),
      bytes.toString('hex', 4, 6),
      bytes.toString('hex', 6, 8),
      bytes.toString('hex', 8, 10),
      bytes.toString('hex', 10, 16),
    ].join('-')
  }

  /**
   * 生成安全的随机整数
   * @param min 最小值
   * @param max 最大值
   * @returns 随机整数
   */
  static randomInt(min: number, max: number): number {
    const range = max - min + 1
    const bytesNeeded = Math.ceil(Math.log2(range) / 8)
    const maxValue = 256 ** bytesNeeded
    const randomValue = randomBytes(bytesNeeded).readUIntBE(0, bytesNeeded)

    return min + Math.floor((randomValue / maxValue) * range)
  }

  /**
   * 计算 HMAC
   * @param data 数据
   * @param key 密钥
   * @param algorithm 算法
   * @returns HMAC
   */
  static hmac(data: string, key: string, algorithm: 'sha256' | 'sha512' | 'sha1' = 'sha256'): string {
    return createHmac(algorithm, key).update(data).digest('hex')
  }

  /**
   * 验证 HMAC
   * @param data 数据
   * @param key 密钥
   * @param expectedHmac 期望的 HMAC
   * @param algorithm 算法
   * @returns 是否匹配
   */
  static verifyHmac(data: string, key: string, expectedHmac: string, algorithm: 'sha256' | 'sha512' | 'sha1' = 'sha256'): boolean {
    const actualHmac = SecurityUtils.hmac(data, key, algorithm)
    return SecurityUtils.constantTimeCompare(actualHmac, expectedHmac)
  }

  /**
   * 常量时间比较（防止时序攻击）
   * @param a 字符串 a
   * @param b 字符串 b
   * @returns 是否相等
   */
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  /**
   * 转义 HTML
   * @param str 字符串
   * @returns 转义后的字符串
   */
  static escapeHtml(str: string): string {
    const htmlEscapes: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    }
    return str.replace(/[&<>"'/]/g, char => htmlEscapes[char] || char)
  }

  /**
   * 清理 SQL 注入
   * @param str 字符串
   * @returns 清理后的字符串
   */
  static sanitizeSql(str: string): string {
    return str.replace(/['";\\]/g, char => `\\${char}`)
  }

  /**
   * 验证密码强度
   * @param password 密码
   * @returns 强度分数（0-100）
   */
  static passwordStrength(password: string): number {
    let score = 0

    // 长度
    if (password.length >= 8) score += 20
    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // 包含小写字母
    if (/[a-z]/.test(password)) score += 10

    // 包含大写字母
    if (/[A-Z]/.test(password)) score += 10

    // 包含数字
    if (/\d/.test(password)) score += 10

    // 包含特殊字符
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 15

    // 包含多种字符类型
    const types = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    ].filter(Boolean).length

    if (types >= 3) score += 15

    return Math.min(score, 100)
  }

  /**
   * 生成密码建议
   * @param length 长度
   * @param options 选项
   * @returns 密码
   */
  static generatePassword(
    length = 16,
    options: {
      lowercase?: boolean
      uppercase?: boolean
      numbers?: boolean
      symbols?: boolean
    } = {},
  ): string {
    const {
      lowercase = true,
      uppercase = true,
      numbers = true,
      symbols = true,
    } = options

    let charset = ''
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (numbers) charset += '0123456789'
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!charset) {
      throw new Error('At least one character type must be enabled')
    }

    let password = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = SecurityUtils.randomInt(0, charset.length - 1)
      password += charset[randomIndex]
    }

    return password
  }
}

/**
 * 哈希工具类
 */
export class HashUtils {
  /**
   * 计算哈希
   * @param data 数据
   * @param algorithm 算法
   * @param encoding 编码
   * @returns 哈希值
   */
  static hash(data: string, algorithm: 'sha256' | 'sha512' | 'md5' | 'sha1' = 'sha256', encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash(algorithm).update(data).digest(encoding)
  }

  /**
   * 计算文件哈希
   * @param filePath 文件路径
   * @param algorithm 算法
   * @returns 哈希值
   */
  static async hashFile(filePath: string, algorithm: 'sha256' | 'sha512' | 'md5' | 'sha1' = 'sha256'): Promise<string> {
    const { createReadStream } = await import('node:fs')
    const { pipeline } = await import('node:stream/promises')

    const hash = createHash(algorithm)
    const stream = createReadStream(filePath)

    await pipeline(stream, hash)

    return hash.digest('hex')
  }

  /**
   * 使用 PBKDF2 哈希密码
   * @param password 密码
   * @param options 选项
   * @returns 哈希值（包含盐值）
   */
  static async hashPassword(password: string, options: HashOptions = {}): Promise<string> {
    const {
      algorithm = 'sha256',
      iterations = 100000,
      keyLength = 64,
      encoding = 'hex',
    } = options

    // 生成盐值
    const salt = options.salt || randomBytes(16).toString('hex')

    // 计算哈希
    const hash = await pbkdf2Async(password, salt, iterations, keyLength, algorithm)

    // 返回：算法$迭代次数$盐值$哈希值
    return `${algorithm}$${iterations}$${salt}$${hash.toString(encoding)}`
  }

  /**
   * 验证密码
   * @param password 密码
   * @param hashedPassword 哈希值
   * @returns 是否匹配
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // 解析哈希值
      const [algorithm, iterationsStr, salt, expectedHash] = hashedPassword.split('$')
      if (!algorithm || !iterationsStr || !salt || !expectedHash) {
        return false
      }

      const iterations = Number.parseInt(iterationsStr, 10)
      const keyLength = Buffer.from(expectedHash, 'hex').length

      // 计算哈希
      const hash = await pbkdf2Async(password, salt, iterations, keyLength, algorithm as any)

      // 比较哈希值
      return SecurityUtils.constantTimeCompare(hash.toString('hex'), expectedHash)
    }
    catch {
      return false
    }
  }

  /**
   * 使用 scrypt 哈希密码
   * @param password 密码
   * @param options 选项
   * @returns 哈希值（包含盐值）
   */
  static async hashPasswordScrypt(password: string, options: HashOptions = {}): Promise<string> {
    const {
      keyLength = 64,
      encoding = 'hex',
    } = options

    // 生成盐值
    const salt = options.salt || randomBytes(16).toString('hex')

    // 计算哈希
    const hash = await scryptAsync(password, salt, keyLength)

    // 返回：scrypt$盐值$哈希值
    return `scrypt$${salt}$${hash.toString(encoding)}`
  }

  /**
   * 使用 scrypt 验证密码
   * @param password 密码
   * @param hashedPassword 哈希值
   * @returns 是否匹配
   */
  static async verifyPasswordScrypt(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // 解析哈希值
      const [algorithm, salt, expectedHash] = hashedPassword.split('$')
      if (algorithm !== 'scrypt' || !salt || !expectedHash) {
        return false
      }

      const keyLength = Buffer.from(expectedHash, 'hex').length

      // 计算哈希
      const hash = await scryptAsync(password, salt, keyLength)

      // 比较哈希值
      return SecurityUtils.constantTimeCompare(hash.toString('hex'), expectedHash)
    }
    catch {
      return false
    }
  }

  /**
   * 计算 MD5 哈希
   * @param data 数据
   * @returns MD5 哈希值
   */
  static md5(data: string): string {
    return createHash('md5').update(data).digest('hex')
  }

  /**
   * 计算 SHA-1 哈希
   * @param data 数据
   * @returns SHA-1 哈希值
   */
  static sha1(data: string): string {
    return createHash('sha1').update(data).digest('hex')
  }

  /**
   * 计算 SHA-256 哈希
   * @param data 数据
   * @returns SHA-256 哈希值
   */
  static sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex')
  }

  /**
   * 计算 SHA-512 哈希
   * @param data 数据
   * @returns SHA-512 哈希值
   */
  static sha512(data: string): string {
    return createHash('sha512').update(data).digest('hex')
  }
}

/**
 * Token 工具类
 */
export class TokenUtils {
  /**
   * 生成随机 Token
   * @param options 选项
   * @returns Token
   */
  static generateToken(options: number | TokenOptions = {}): string {
    if (typeof options === 'number') {
      options = { length: options }
    }

    const {
      length = 32,
      encoding = 'hex',
    } = options

    return SecurityUtils.randomString(length, encoding)
  }

  /**
   * 生成 JWT 风格的 Token（简化版）
   * @param payload 载荷
   * @param secret 密钥
   * @param options 选项
   * @returns Token
   */
  static generateJwtLike(
    payload: Record<string, any>,
    secret: string,
    options: TokenOptions = {},
  ): string {
    const { expiresIn } = options

    // 添加过期时间
    if (expiresIn) {
      payload.exp = Date.now() + expiresIn
    }

    // 编码头部和载荷
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url')

    // 计算签名
    const signature = SecurityUtils.hmac(`${header}.${body}`, secret, 'sha256')

    return `${header}.${body}.${signature}`
  }

  /**
   * 验证 JWT 风格的 Token
   * @param token Token
   * @param secret 密钥
   * @returns 载荷或 null
   */
  static verifyJwtLike(token: string, secret: string): Record<string, any> | null {
    try {
      const [header, body, signature] = token.split('.')
      if (!header || !body || !signature) {
        return null
      }

      // 验证签名
      const expectedSignature = SecurityUtils.hmac(`${header}.${body}`, secret, 'sha256')
      if (!SecurityUtils.constantTimeCompare(signature, expectedSignature)) {
        return null
      }

      // 解码载荷
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))

      // 检查过期时间
      if (payload.exp && Date.now() > payload.exp) {
        return null
      }

      return payload
    }
    catch {
      return null
    }
  }

  /**
   * 生成 API Key
   * @param prefix 前缀
   * @param length Token 长度
   * @returns API Key
   */
  static generateApiKey(prefix = 'sk', length = 32): string {
    const token = TokenUtils.generateToken({ length, encoding: 'base64url' })
    return `${prefix}_${token}`
  }

  /**
   * 生成会话 ID
   * @param length 长度
   * @returns 会话 ID
   */
  static generateSessionId(length = 32): string {
    return TokenUtils.generateToken({ length, encoding: 'base64url' })
  }

  /**
   * 生成刷新 Token
   * @param length 长度
   * @returns 刷新 Token
   */
  static generateRefreshToken(length = 64): string {
    return TokenUtils.generateToken({ length, encoding: 'base64url' })
  }

  /**
   * 生成 CSRF Token
   * @param length 长度
   * @returns CSRF Token
   */
  static generateCsrfToken(length = 32): string {
    return TokenUtils.generateToken({ length, encoding: 'base64url' })
  }

  /**
   * 生成验证码
   * @param length 长度
   * @param charset 字符集
   * @returns 验证码
   */
  static generateCaptcha(length = 6, charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = SecurityUtils.randomInt(0, charset.length - 1)
      result += charset[randomIndex]
    }
    return result
  }

  /**
   * 生成 OTP（一次性密码）
   * @param length 长度
   * @returns OTP
   */
  static generateOtp(length = 6): string {
    let otp = ''
    for (let i = 0; i < length; i++) {
      otp += SecurityUtils.randomInt(0, 9).toString()
    }
    return otp
  }
}





