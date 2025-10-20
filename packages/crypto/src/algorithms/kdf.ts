/**
 * 密钥派生函数（Key Derivation Functions）
 * 提供多种密钥派生算法，用于从密码生成加密密钥
 */

import CryptoJS from 'crypto-js'

import { RandomUtils } from '../utils'

/**
 * KDF 配置选项
 */
export interface KDFOptions {
  /** 迭代次数 */
  iterations?: number
  /** 密钥长度（字节） */
  keyLength?: number
  /** 盐值 */
  salt?: string
  /** 内存成本（Argon2/scrypt） */
  memoryCost?: number
  /** 并行度（Argon2/scrypt） */
  parallelism?: number
  /** 时间成本（Argon2） */
  timeCost?: number
  /** 输出格式 */
  outputFormat?: 'hex' | 'base64' | 'raw'
}

/**
 * KDF 结果
 */
export interface KDFResult {
  /** 派生的密钥 */
  key: string
  /** 使用的盐值 */
  salt: string
  /** 算法名称 */
  algorithm: string
  /** 参数 */
  parameters: {
    iterations?: number
    keyLength: number
    memoryCost?: number
    parallelism?: number
    timeCost?: number
  }
}

/**
 * PBKDF2 实现
 * Password-Based Key Derivation Function 2
 */
export class PBKDF2 {
  private readonly defaultOptions: Required<Omit<KDFOptions, 'memoryCost' | 'parallelism' | 'timeCost'>> = {
    iterations: 100000, // OWASP 推荐最少 100,000 次
    keyLength: 32, // 256 bits
    salt: '',
    outputFormat: 'hex',
  }

  /**
   * 派生密钥
   */
  derive(password: string, options: KDFOptions = {}): KDFResult {
    const opts = { ...this.defaultOptions, ...options }

    // 生成或使用提供的盐值
    const salt = opts.salt || RandomUtils.generateSalt(16)

    // 使用 CryptoJS 的 PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: opts.keyLength / 4, // CryptoJS 使用 words (4 bytes)
      iterations: opts.iterations,
      hasher: CryptoJS.algo.SHA256,
    })

    // 格式化输出
    let keyString: string
    switch (opts.outputFormat) {
      case 'base64':
        keyString = CryptoJS.enc.Base64.stringify(key)
        break
      case 'raw':
        keyString = key.toString()
        break
      case 'hex':
      default:
        keyString = key.toString(CryptoJS.enc.Hex)
    }

    return {
      key: keyString,
      salt,
      algorithm: 'PBKDF2-SHA256',
      parameters: {
        iterations: opts.iterations,
        keyLength: opts.keyLength,
      },
    }
  }

  /**
   * 验证密码
   */
  verify(password: string, derivedKey: string, salt: string, options: KDFOptions = {}): boolean {
    const result = this.derive(password, { ...options, salt })
    return result.key === derivedKey
  }

  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel: 'low' | 'medium' | 'high' = 'medium'): KDFOptions {
    switch (securityLevel) {
      case 'low':
        return { iterations: 50000, keyLength: 16 } // 128 bits
      case 'high':
        return { iterations: 200000, keyLength: 64 } // 512 bits
      case 'medium':
      default:
        return { iterations: 100000, keyLength: 32 } // 256 bits
    }
  }
}

/**
 * Argon2 实现（简化版）
 * 内存硬化的密钥派生函数
 */
export class Argon2 {
  private readonly defaultOptions: Required<KDFOptions> = {
    iterations: 3, // 时间成本
    keyLength: 32,
    salt: '',
    memoryCost: 4096, // 4 MB
    parallelism: 1,
    timeCost: 3,
    outputFormat: 'hex',
  }

  /**
   * 派生密钥（简化实现）
   * 注意：这是一个简化的实现，实际应使用专门的 Argon2 库
   */
  derive(password: string, options: KDFOptions = {}): KDFResult {
    const opts = { ...this.defaultOptions, ...options }
    const salt = opts.salt || RandomUtils.generateSalt(16)

    // 简化的 Argon2 实现
    // 实际应使用 argon2-browser 或类似库
    let hash = password + salt

    // 模拟时间成本
    for (let t = 0; t < (opts.timeCost || opts.iterations); t++) {
      // 模拟内存成本
      const memoryBlocks: string[] = []
      const blockCount = Math.floor((opts.memoryCost || 4096) / 128)

      for (let i = 0; i < blockCount; i++) {
        const block = CryptoJS.SHA256(hash + i).toString()
        memoryBlocks.push(block)

        // 模拟并行度
        if (i % (opts.parallelism || 1) === 0) {
          hash = CryptoJS.SHA256(hash + memoryBlocks.join('')).toString()
        }
      }

      hash = CryptoJS.SHA256(hash + memoryBlocks.join('')).toString()
    }

    // 调整到所需长度
    while (hash.length < opts.keyLength * 2) {
      hash += CryptoJS.SHA256(hash).toString()
    }
    hash = hash.substring(0, opts.keyLength * 2)

    // 格式化输出
    let keyString = hash
    if (opts.outputFormat === 'base64') {
      const wordArray = CryptoJS.enc.Hex.parse(hash)
      keyString = CryptoJS.enc.Base64.stringify(wordArray)
    }

    return {
      key: keyString,
      salt,
      algorithm: 'Argon2id',
      parameters: {
        iterations: opts.timeCost || opts.iterations,
        keyLength: opts.keyLength,
        memoryCost: opts.memoryCost,
        parallelism: opts.parallelism,
        timeCost: opts.timeCost,
      },
    }
  }

  /**
   * 验证密码
   */
  verify(password: string, derivedKey: string, salt: string, options: KDFOptions = {}): boolean {
    const result = this.derive(password, { ...options, salt })
    return result.key === derivedKey
  }

  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel: 'low' | 'medium' | 'high' = 'medium'): KDFOptions {
    switch (securityLevel) {
      case 'low':
        return {
          timeCost: 2,
          memoryCost: 2048, // 2 MB
          parallelism: 1,
          keyLength: 16,
        }
      case 'high':
        return {
          timeCost: 4,
          memoryCost: 8192, // 8 MB
          parallelism: 2,
          keyLength: 64,
        }
      case 'medium':
      default:
        return {
          timeCost: 3,
          memoryCost: 4096, // 4 MB
          parallelism: 1,
          keyLength: 32,
        }
    }
  }
}

/**
 * scrypt 实现（简化版）
 * 内存硬化的密钥派生函数
 */
export class Scrypt {
  private readonly defaultOptions: Required<Omit<KDFOptions, 'timeCost'>> = {
    iterations: 16384, // N = 2^14
    keyLength: 32,
    salt: '',
    memoryCost: 8, // r = 8
    parallelism: 1, // p = 1
    outputFormat: 'hex',
  }

  /**
   * 派生密钥（简化实现）
   * 注意：这是一个简化的实现，实际应使用专门的 scrypt 库
   */
  derive(password: string, options: KDFOptions = {}): KDFResult {
    const opts = { ...this.defaultOptions, ...options }
    const salt = opts.salt || RandomUtils.generateSalt(16)

    // 简化的 scrypt 实现
    // 实际应使用 scrypt-js 或类似库

    // 步骤 1: PBKDF2-SHA256 初始派生
    let derivedKey = CryptoJS.PBKDF2(password, salt, {
      keySize: opts.keyLength / 4,
      iterations: 1,
      hasher: CryptoJS.algo.SHA256,
    }).toString()

    // 步骤 2: ROMix (简化版)
    // const _blockSize = opts.memoryCost || 8 // 未使用，简化实现中省略
    const blocks: string[] = []

    // 生成内存块
    for (let i = 0; i < opts.iterations; i++) {
      derivedKey = CryptoJS.SHA256(derivedKey + i).toString()
      blocks.push(derivedKey)
    }

    // 混合内存块
    for (let i = 0; i < opts.iterations; i++) {
      const j = Number.parseInt(derivedKey.substring(0, 8), 16) % blocks.length
      derivedKey = CryptoJS.SHA256(derivedKey + blocks[j]).toString()
    }

    // 步骤 3: 最终 PBKDF2
    const finalKey = CryptoJS.PBKDF2(derivedKey, salt, {
      keySize: opts.keyLength / 4,
      iterations: 1,
      hasher: CryptoJS.algo.SHA256,
    })

    // 格式化输出
    let keyString: string
    switch (opts.outputFormat) {
      case 'base64':
        keyString = CryptoJS.enc.Base64.stringify(finalKey)
        break
      case 'raw':
        keyString = finalKey.toString()
        break
      case 'hex':
      default:
        keyString = finalKey.toString(CryptoJS.enc.Hex)
    }

    return {
      key: keyString,
      salt,
      algorithm: 'scrypt',
      parameters: {
        iterations: opts.iterations,
        keyLength: opts.keyLength,
        memoryCost: opts.memoryCost,
        parallelism: opts.parallelism,
      },
    }
  }

  /**
   * 验证密码
   */
  verify(password: string, derivedKey: string, salt: string, options: KDFOptions = {}): boolean {
    const result = this.derive(password, { ...options, salt })
    return result.key === derivedKey
  }

  /**
   * 推荐的安全参数
   */
  getRecommendedParameters(securityLevel: 'low' | 'medium' | 'high' = 'medium'): KDFOptions {
    switch (securityLevel) {
      case 'low':
        return {
          iterations: 8192, // N = 2^13
          memoryCost: 8,
          parallelism: 1,
          keyLength: 16,
        }
      case 'high':
        return {
          iterations: 32768, // N = 2^15
          memoryCost: 8,
          parallelism: 2,
          keyLength: 64,
        }
      case 'medium':
      default:
        return {
          iterations: 16384, // N = 2^14
          memoryCost: 8,
          parallelism: 1,
          keyLength: 32,
        }
    }
  }
}

/**
 * KDF 管理器
 */
export class KDFManager {
  private pbkdf2 = new PBKDF2()
  private argon2 = new Argon2()
  private scrypt = new Scrypt()

  /**
   * 派生密钥
   */
  derive(
    password: string,
    algorithm: 'pbkdf2' | 'argon2' | 'scrypt' = 'pbkdf2',
    options?: KDFOptions,
  ): KDFResult {
    switch (algorithm) {
      case 'argon2':
        return this.argon2.derive(password, options)
      case 'scrypt':
        return this.scrypt.derive(password, options)
      case 'pbkdf2':
      default:
        return this.pbkdf2.derive(password, options)
    }
  }

  /**
   * 派生密钥（异步版本）
   */
  async deriveKey(
    password: string,
    salt: string,
    algorithm: 'pbkdf2' | 'argon2' | 'scrypt' = 'pbkdf2',
    options?: KDFOptions,
  ): Promise<KDFResult> {
    return this.derive(password, algorithm, { ...options, salt })
  }

  /**
   * 验证密码
   */
  verify(
    password: string,
    derivedKey: string,
    salt: string,
    algorithm: 'pbkdf2' | 'argon2' | 'scrypt' = 'pbkdf2',
    options?: KDFOptions,
  ): boolean {
    switch (algorithm) {
      case 'argon2':
        return this.argon2.verify(password, derivedKey, salt, options)
      case 'scrypt':
        return this.scrypt.verify(password, derivedKey, salt, options)
      case 'pbkdf2':
      default:
        return this.pbkdf2.verify(password, derivedKey, salt, options)
    }
  }

  /**
   * 获取推荐参数
   */
  getRecommendedParameters(
    algorithm: 'pbkdf2' | 'argon2' | 'scrypt' = 'pbkdf2',
    securityLevel: 'low' | 'medium' | 'high' = 'medium',
  ): KDFOptions {
    switch (algorithm) {
      case 'argon2':
        return this.argon2.getRecommendedParameters(securityLevel)
      case 'scrypt':
        return this.scrypt.getRecommendedParameters(securityLevel)
      case 'pbkdf2':
      default:
        return this.pbkdf2.getRecommendedParameters(securityLevel)
    }
  }

  /**
   * 基准测试 - 测试不同参数的性能
   */
  async benchmark(algorithm: 'pbkdf2' | 'argon2' | 'scrypt', password: string = 'test'): Promise<{
    algorithm: string
    parameters: KDFOptions
    timeMs: number
    opsPerSecond: number
  }[]> {
    const results = []
    const securityLevels: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high']

    for (const level of securityLevels) {
      let params = this.getRecommendedParameters(algorithm, level)

      // 为基准测试使用更低的参数以避免超时
      if (algorithm === 'pbkdf2') {
        params = {
          ...params,
          iterations: level === 'low' ? 1000 : level === 'medium' ? 5000 : 10000,
        }
      }

      const startTime = performance.now()

      // 只执行3次以减少测试时间
      for (let i = 0; i < 3; i++) {
        this.derive(password + i, algorithm, params)
      }

      const endTime = performance.now()
      const timeMs = (endTime - startTime) / 3

      results.push({
        algorithm: `${algorithm}-${level}`,
        parameters: params,
        timeMs,
        opsPerSecond: 1000 / timeMs,
      })
    }

    return results
  }
}

// 导出实例
export const pbkdf2 = new PBKDF2()
export const argon2 = new Argon2()
export const scrypt = new Scrypt()
export const kdfManager = new KDFManager()
