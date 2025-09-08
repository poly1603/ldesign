/**
 * 加密工具类
 * 提供哈希、加密、解密等功能
 */

import { createHash, createHmac, pbkdf2Sync, randomBytes, scryptSync } from 'node:crypto'

/**
 * 加密工具
 */
export class CryptoUtils {
  /**
   * MD5 哈希
   * @param data 数据
   * @param encoding 编码格式
   * @returns 哈希值
   */
  static md5(data: string | Buffer, encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash('md5').update(data).digest(encoding)
  }

  /**
   * SHA1 哈希
   * @param data 数据
   * @param encoding 编码格式
   * @returns 哈希值
   */
  static sha1(data: string | Buffer, encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash('sha1').update(data).digest(encoding)
  }

  /**
   * SHA256 哈希
   * @param data 数据
   * @param encoding 编码格式
   * @returns 哈希值
   */
  static sha256(data: string | Buffer, encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash('sha256').update(data).digest(encoding)
  }

  /**
   * SHA512 哈希
   * @param data 数据
   * @param encoding 编码格式
   * @returns 哈希值
   */
  static sha512(data: string | Buffer, encoding: 'hex' | 'base64' = 'hex'): string {
    return createHash('sha512').update(data).digest(encoding)
  }

  /**
   * 通用哈希方法
   * @param data 数据
   * @param algorithm 算法
   * @param encoding 编码格式
   * @returns 哈希值
   */
  static hash(
    data: string | Buffer,
    algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256',
    encoding: 'hex' | 'base64' = 'hex',
  ): string {
    return createHash(algorithm).update(data).digest(encoding)
  }

  /**
   * HMAC 哈希
   * @param algorithm 算法
   * @param key 密钥
   * @param data 数据
   * @param encoding 编码格式
   * @returns HMAC值
   */
  static hmac(
    algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512',
    key: string | Buffer,
    data: string | Buffer,
    encoding: 'hex' | 'base64' = 'hex',
  ): string {
    return createHmac(algorithm, key).update(data).digest(encoding)
  }

  /**
   * HMAC-SHA256
   * @param key 密钥
   * @param data 数据
   * @param encoding 编码格式
   * @returns HMAC值
   */
  static hmacSha256(
    key: string | Buffer,
    data: string | Buffer,
    encoding: 'hex' | 'base64' = 'hex',
  ): string {
    return CryptoUtils.hmac('sha256', key, data, encoding)
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
   * @param charset 字符集
   * @returns 随机字符串
   */
  static randomString(
    length: number,
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    const bytes = CryptoUtils.randomBytes(length)
    let result = ''

    for (let i = 0; i < length; i++) {
      const byte = bytes.at(i) ?? 0
      result += charset.charAt(byte % charset.length)
    }

    return result
  }

  /**
   * 生成随机十六进制字符串
   * @param length 长度
   * @returns 十六进制字符串
   */
  static randomHex(length: number): string {
    return CryptoUtils.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length)
  }

  /**
   * Base64 编码
   * @param data 数据
   * @returns Base64字符串
   */
  static base64Encode(data: string | Buffer): string {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')
    return buffer.toString('base64')
  }

  /**
   * Base64 解码
   * @param base64 Base64字符串
   * @param encoding 输出编码
   * @returns 解码后的数据
   */
  static base64Decode(base64: string, encoding: BufferEncoding = 'utf8'): string {
    return Buffer.from(base64, 'base64').toString(encoding)
  }

  /**
   * URL安全的Base64编码
   * @param data 数据
   * @returns URL安全的Base64字符串
   */
  static base64UrlEncode(data: string | Buffer): string {
    return CryptoUtils.base64Encode(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  /**
   * URL安全的Base64解码
   * @param base64Url URL安全的Base64字符串
   * @param encoding 输出编码
   * @returns 解码后的数据
   */
  static base64UrlDecode(base64Url: string, encoding: BufferEncoding = 'utf8'): string {
    // 添加填充
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4)
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding

    return CryptoUtils.base64Decode(base64, encoding)
  }

  /**
   * 十六进制编码
   * @param data 数据
   * @returns 十六进制字符串
   */
  static hexEncode(data: string | Buffer): string {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')
    return buffer.toString('hex')
  }

  /**
   * 十六进制解码
   * @param hex 十六进制字符串
   * @param encoding 输出编码
   * @returns 解码后的数据
   */
  static hexDecode(hex: string, encoding: BufferEncoding = 'utf8'): string {
    return Buffer.from(hex, 'hex').toString(encoding)
  }

  /**
   * 简单的异或加密/解密
   * @param data 数据
   * @param key 密钥
   * @returns 加密/解密后的数据
   */
  static xor(data: string | Buffer, key: string | Buffer): Buffer {
    const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8')
    const keyBuffer = Buffer.isBuffer(key) ? key : Buffer.from(key, 'utf8')
    const result = Buffer.alloc(dataBuffer.length)

    for (let i = 0; i < dataBuffer.length; i++) {
      const db = dataBuffer[i]!
      const kb = keyBuffer[i % keyBuffer.length]!
      result[i] = db ^ kb
    }

    return result
  }

  /**
   * PBKDF2 密钥派生
   * @param password 密码
   * @param salt 盐值
   * @param iterations 迭代次数
   * @param keyLength 密钥长度
   * @param digest 摘要算法
   * @returns 派生密钥
   */
  static pbkdf2(
    password: string | Buffer,
    salt: string | Buffer,
    iterations: number,
    keyLength: number,
    digest: 'sha1' | 'sha256' | 'sha512' = 'sha256',
  ): Buffer {
    return pbkdf2Sync(password, salt, iterations, keyLength, digest)
  }

  /**
   * Scrypt 密钥派生
   * @param password 密码
   * @param salt 盐值
   * @param keyLength 密钥长度
   * @param options Scrypt选项
   * @returns 派生密钥
   */
  static scrypt(
    password: string | Buffer,
    salt: string | Buffer,
    keyLength: number,
    options: {
      cost?: number
      blockSize?: number
      parallelization?: number
      maxmem?: number
    } = {},
  ): Buffer {
    const { cost = 16384, blockSize = 8, parallelization = 1, maxmem = 32 * 1024 * 1024 } = options

    return scryptSync(password, salt, keyLength, {
      cost,
      blockSize,
      parallelization,
      maxmem,
    })
  }

  /**
   * 生成密码哈希（使用PBKDF2）
   * @param password 密码
   * @param salt 盐值（可选，自动生成）
   * @param iterations 迭代次数
   * @returns 哈希结果
   */
  static hashPassword(
    password: string,
    salt?: string,
    iterations = 100000,
  ): { hash: string, salt: string } {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : CryptoUtils.randomBytes(32)
    const hashBuffer = CryptoUtils.pbkdf2(password, saltBuffer, iterations, 64, 'sha256')

    return {
      hash: hashBuffer.toString('hex'),
      salt: saltBuffer.toString('hex'),
    }
  }

  /**
   * 验证密码
   * @param password 密码
   * @param hash 存储的哈希值
   * @param salt 盐值
   * @param iterations 迭代次数
   * @returns 是否匹配
   */
  static verifyPassword(
    password: string,
    hash: string,
    salt: string,
    iterations = 100000,
  ): boolean {
    const { hash: computedHash } = CryptoUtils.hashPassword(password, salt, iterations)
    return computedHash === hash
  }

  /**
   * 时间安全的字符串比较
   * @param a 字符串a
   * @param b 字符串b
   * @returns 是否相等
   */
  static timingSafeEqual(a: string, b: string): boolean {
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
   * 生成UUID v4
   * @returns UUID字符串
   */
  static uuid(): string {
    const bytes = CryptoUtils.randomBytes(16)

    // 设置版本号 (4) 和变体位
    const b6 = bytes[6]!
    const b8 = bytes[8]!
    bytes[6] = (b6 & 0x0F) | 0x40
    bytes[8] = (b8 & 0x3F) | 0x80

    const hex = bytes.toString('hex')
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ].join('-')
  }

  /**
   * 生成纳秒ID（基于时间戳和随机数）
   * @returns 纳秒ID
   */
  static nanoid(size = 21): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const bytes = CryptoUtils.randomBytes(size)
    let id = ''

    for (let i = 0; i < size; i++) {
      const byte = bytes.at(i) ?? 0
      id += alphabet.charAt(byte % alphabet.length)
    }

    return id
  }

  /**
   * 计算文件哈希
   * @param filePath 文件路径
   * @param algorithm 算法
   * @param encoding 编码格式
   * @returns 文件哈希值
   */
  static async fileHash(
    filePath: string,
    algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512' = 'sha256',
    encoding: 'hex' | 'base64' = 'hex',
  ): Promise<string> {
    const fs = await import('node:fs')
    const stream = fs.createReadStream(filePath)
    const hash = createHash(algorithm)

    return new Promise((resolve, reject) => {
      stream.on('data', chunk => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest(encoding)))
      stream.on('error', reject)
    })
  }

  /**
   * 生成JWT风格的token（简化版）
   * @param payload 载荷
   * @param secret 密钥
   * @param expiresIn 过期时间（秒）
   * @returns Token
   */
  static createToken(payload: Record<string, any>, secret: string, expiresIn?: number): string {
    const header = { alg: 'HS256', typ: 'JWT' }
    const now = Math.floor(Date.now() / 1000)

    const tokenPayload = {
      ...payload,
      iat: now,
      ...(expiresIn && { exp: now + expiresIn }),
    }

    const encodedHeader = CryptoUtils.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = CryptoUtils.base64UrlEncode(JSON.stringify(tokenPayload))
    const signature = CryptoUtils.hmacSha256(secret, `${encodedHeader}.${encodedPayload}`, 'base64')
    const encodedSignature = CryptoUtils.base64UrlEncode(signature)

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`
  }

  /**
   * 验证JWT风格的token（简化版）
   * @param token Token
   * @param secret 密钥
   * @returns 验证结果
   */
  static verifyToken(
    token: string,
    secret: string,
  ): {
      valid: boolean
      payload?: Record<string, any>
      error?: string
    } {
    try {
      const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')

      if (!encodedHeader || !encodedPayload || !encodedSignature) {
        return { valid: false, error: 'Invalid token format' }
      }

      // 验证签名
      const expectedSignature = CryptoUtils.hmacSha256(
        secret,
        `${encodedHeader}.${encodedPayload}`,
        'base64',
      )
      const expectedEncodedSignature = CryptoUtils.base64UrlEncode(expectedSignature)

      if (!CryptoUtils.timingSafeEqual(encodedSignature, expectedEncodedSignature)) {
        return { valid: false, error: 'Invalid signature' }
      }

      // 解析载荷
      const payload = JSON.parse(CryptoUtils.base64UrlDecode(encodedPayload))

      // 检查过期时间
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'Token expired' }
      }

      return { valid: true, payload }
    }
    catch {
      return { valid: false, error: 'Token parsing failed' }
    }
  }
}
