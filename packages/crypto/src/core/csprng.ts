/**
 * 密码学安全随机数生成器 (CSPRNG)
 * Cryptographically Secure Pseudorandom Number Generator
 */

import { Buffer } from 'node:buffer'

import CryptoJS from 'crypto-js'

/**
 * 随机数生成器配置
 */
export interface CSPRNGConfig {
  /** 熵源类型 */
  entropySource: 'crypto' | 'webcrypto' | 'node' | 'fallback'
  /** 种子长度（字节） */
  seedLength: number
  /** 是否使用硬件随机数生成器 */
  useHardwareRNG: boolean
  /** 是否收集额外熵 */
  collectEntropy: boolean
  /** 重新播种间隔（生成次数） */
  reseedInterval: number
}

/**
 * 熵收集器
 */
export class EntropyCollector {
  private entropy: number[] = []
  private mouseEntropy: number[] = []
  private keyboardEntropy: number[] = []
  private timeEntropy: number[] = []
  private collecting: boolean = false

  /**
   * 开始收集熵
   */
  startCollecting(): void {
    if (this.collecting) { return }
    this.collecting = true

    // 收集鼠标移动熵
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.collectMouseEntropy)
      window.addEventListener('keypress', this.collectKeyboardEntropy)
    }

    // 收集时间熵
    this.collectTimeEntropy()
  }

  /**
   * 停止收集熵
   */
  stopCollecting(): void {
    this.collecting = false

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.collectMouseEntropy)
      window.removeEventListener('keypress', this.collectKeyboardEntropy)
    }
  }

  /**
   * 收集鼠标熵
   */
  private collectMouseEntropy = (event: MouseEvent): void => {
    const entropy = (event.clientX ^ event.clientY) * Date.now()
    this.mouseEntropy.push(entropy)

    // 限制数组大小
    if (this.mouseEntropy.length > 256) {
      this.mouseEntropy.shift()
    }
  }

  /**
   * 收集键盘熵
   */
  private collectKeyboardEntropy = (event: KeyboardEvent): void => {
    const entropy = event.keyCode * Date.now()
    this.keyboardEntropy.push(entropy)

    // 限制数组大小
    if (this.keyboardEntropy.length > 256) {
      this.keyboardEntropy.shift()
    }
  }

  /**
   * 收集时间熵
   */
  private collectTimeEntropy(): void {
    const entropy = performance.now() * Date.now()
    this.timeEntropy.push(entropy)

    // 限制数组大小
    if (this.timeEntropy.length > 256) {
      this.timeEntropy.shift()
    }

    if (this.collecting) {
      setTimeout(() => this.collectTimeEntropy(), 100)
    }
  }

  /**
   * 获取收集的熵
   */
  getEntropy(): Uint8Array {
    // 合并所有熵源
    const allEntropy = [
      ...this.entropy,
      ...this.mouseEntropy,
      ...this.keyboardEntropy,
      ...this.timeEntropy,
    ]

    // 混合熵
    let mixed = 0
    for (const e of allEntropy) {
      mixed = mixed ^ e
      mixed = (mixed << 1) | (mixed >>> 31)
    }

    // 转换为字节数组
    const bytes = new Uint8Array(32)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = (mixed >> (i * 8)) & 0xFF
      mixed = (mixed << 3) | (mixed >>> 29)
    }

    return bytes
  }

  /**
   * 添加外部熵
   */
  addEntropy(data: string | Uint8Array): void {
    let entropy: number

    if (typeof data === 'string') {
      entropy = 0
      for (let i = 0; i < data.length; i++) {
        entropy = (entropy << 5) - entropy + data.charCodeAt(i)
        entropy = entropy & entropy
      }
    }
 else {
      entropy = 0
      for (let i = 0; i < data.length; i++) {
        entropy = (entropy << 5) - entropy + data[i]
        entropy = entropy & entropy
      }
    }

    this.entropy.push(entropy)

    // 限制数组大小
    if (this.entropy.length > 256) {
      this.entropy.shift()
    }
  }

  /**
   * 获取熵池质量
   */
  getEntropyQuality(): number {
    const totalEntropy
      = this.entropy.length
        + this.mouseEntropy.length
        + this.keyboardEntropy.length
        + this.timeEntropy.length

    // 简单的质量评估（0-100）
    return Math.min(100, (totalEntropy / 1024) * 100)
  }
}

/**
 * 密码学安全随机数生成器
 */
export class CSPRNG {
  private config: CSPRNGConfig
  private seed: Uint8Array
  private counter: number = 0
  private entropyCollector: EntropyCollector
  private lastReseed: number = 0

  constructor(config: Partial<CSPRNGConfig> = {}) {
    this.config = {
      entropySource: this.detectBestEntropySource(),
      seedLength: 32,
      useHardwareRNG: true,
      collectEntropy: true,
      reseedInterval: 10000,
      ...config,
    }

    this.seed = new Uint8Array(this.config?.seedLength)
    this.entropyCollector = new EntropyCollector()

    // 初始化种子
    this.initializeSeed()

    // 开始收集熵
    if (this.config?.collectEntropy) {
      this.entropyCollector.startCollecting()
    }
  }

  /**
   * 检测最佳熵源
   */
  private detectBestEntropySource(): CSPRNGConfig['entropySource'] {
    // Node.js 环境
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      return 'node'
    }

    // 浏览器 WebCrypto API
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      return 'webcrypto'
    }

    // crypto-js 库
    if (CryptoJS && CryptoJS.lib && CryptoJS.lib.WordArray) {
      return 'crypto'
    }

    // 回退方案
    return 'fallback'
  }

  /**
   * 初始化种子
   */
  private initializeSeed(): void {
    switch (this.config?.entropySource) {
      case 'node':
        // Node.js crypto
        if (typeof require !== 'undefined') {
          try {
            // eslint-disable-next-line ts/no-require-imports
            const crypto = require('node:crypto')
            crypto.randomFillSync(this.seed)
          }
 catch {
            this.fallbackSeed()
          }
        }
 else {
          this.fallbackSeed()
        }
        break

      case 'webcrypto':
        // Web Crypto API
        if (typeof window !== 'undefined' && window.crypto) {
          window.crypto.getRandomValues(this.seed)
        }
 else {
          this.fallbackSeed()
        }
        break

      case 'crypto': {
        // crypto-js
        const wordArray = CryptoJS.lib.WordArray.random(this.config?.seedLength)
        const words = wordArray.words
        for (let i = 0; i < this.seed.length; i++) {
          this.seed[i] = (words[Math.floor(i / 4)] >> ((3 - (i % 4)) * 8)) & 0xFF
        }
        break
      }

      default:
        this.fallbackSeed()
    }

    // 混入收集的熵
    if (this.config?.collectEntropy) {
      const entropy = this.entropyCollector.getEntropy()
      for (let i = 0; i < Math.min(entropy.length, this.seed.length); i++) {
        this.seed[i] ^= entropy[i]
      }
    }
  }

  /**
   * 回退种子生成
   */
  private fallbackSeed(): void {
    // 使用多个源组合生成种子
    const now = Date.now()
    const perf = typeof performance !== 'undefined' ? performance.now() : 0

    for (let i = 0; i < this.seed.length; i++) {
      // 使用多个随机源确保每次都不同
      const random1 = Math.random()
      const random2 = Math.random()
      const random3 = Math.random()

      const value = (now + i * 1000) * (perf + i * 100) * (random1 + i)
        + (random2 * 0x100000000) + (random3 * 0x10000) + i
      this.seed[i] = Math.floor(value) & 0xFF
    }
  }

  /**
   * 生成随机字节
   */
  randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length)

    // 检查是否需要重新播种
    if (this.counter - this.lastReseed > this.config?.reseedInterval) {
      this.reseed()
    }

    switch (this.config?.entropySource) {
      case 'node':
        // Node.js crypto
        if (typeof require !== 'undefined') {
          try {
            // eslint-disable-next-line ts/no-require-imports
            const crypto = require('node:crypto')
            crypto.randomFillSync(bytes)
          }
 catch {
            this.fallbackRandomBytes(bytes)
          }
        }
 else {
          this.fallbackRandomBytes(bytes)
        }
        break

      case 'webcrypto':
        // Web Crypto API
        if (typeof window !== 'undefined' && window.crypto) {
          window.crypto.getRandomValues(bytes)
        }
 else {
          this.fallbackRandomBytes(bytes)
        }
        break

      case 'crypto': {
        // crypto-js
        const wordArray = CryptoJS.lib.WordArray.random(length)
        const words = wordArray.words
        for (let i = 0; i < length; i++) {
          bytes[i] = (words[Math.floor(i / 4)] >> ((3 - (i % 4)) * 8)) & 0xFF
        }
        break
      }

      default:
        this.fallbackRandomBytes(bytes)
    }

    // 混入种子和计数器
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] ^= this.seed[i % this.seed.length]
      bytes[i] ^= (this.counter >> (i % 4) * 8) & 0xFF
    }

    this.counter++
    return bytes
  }

  /**
   * 回退随机字节生成
   */
  private fallbackRandomBytes(bytes: Uint8Array): void {
    // 使用 Xorshift128+ 算法
    let s0 = this.seed[0] | (this.seed[1] << 8) | (this.seed[2] << 16) | (this.seed[3] << 24)
    let s1 = this.seed[4] | (this.seed[5] << 8) | (this.seed[6] << 16) | (this.seed[7] << 24)

    // 确保状态不为零（Xorshift算法要求非零状态）
    if (s0 === 0 && s1 === 0) {
      s0 = 0x12345678
      s1 = 0x9ABCDEF0
    }

    for (let i = 0; i < bytes.length; i++) {
      let x = s0
      const y = s1
      s0 = y
      x ^= x << 23
      x ^= x >>> 17
      x ^= y
      x ^= y >>> 26
      s1 = x
      bytes[i] = (s0 + s1) & 0xFF
    }

    // 更新种子
    this.seed[0] = s0 & 0xFF
    this.seed[1] = (s0 >> 8) & 0xFF
    this.seed[2] = (s0 >> 16) & 0xFF
    this.seed[3] = (s0 >> 24) & 0xFF
    this.seed[4] = s1 & 0xFF
    this.seed[5] = (s1 >> 8) & 0xFF
    this.seed[6] = (s1 >> 16) & 0xFF
    this.seed[7] = (s1 >> 24) & 0xFF
  }

  /**
   * 生成随机整数
   */
  randomInt(min: number, max: number): number {
    if (min >= max) {
      throw new Error('min must be less than max')
    }

    const range = max - min

    // Handle edge cases
    if (range === 1) {
      return min
    }

    const bytesNeeded = Math.max(1, Math.ceil(Math.log2(range) / 8))
    const maxValue = 256 ** bytesNeeded
    const threshold = maxValue - (maxValue % range)

    let value: number
    let attempts = 0
    const maxAttempts = 1000 // Prevent infinite loops

    do {
      if (attempts++ > maxAttempts) {
        // Fallback to simple modulo if we can't get unbiased result
        const bytes = this.randomBytes(4)
        const fallbackValue = (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]
        return min + (Math.abs(fallbackValue) % range)
      }

      const bytes = this.randomBytes(bytesNeeded)
      value = 0
      for (let i = 0; i < bytesNeeded; i++) {
        value = (value << 8) | bytes[i]
      }
    } while (value >= threshold)

    return min + (value % range)
  }

  /**
   * 生成随机浮点数
   */
  randomFloat(min: number = 0, max: number = 1): number {
    const bytes = this.randomBytes(8)
    const view = new DataView(bytes.buffer)
    const mantissa = view.getUint32(0) / 0x100000000
    return min + mantissa * (max - min)
  }

  /**
   * 生成随机字符串
   */
  randomString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      const index = this.randomInt(0, charset.length)
      result += charset[index]
    }
    return result
  }

  /**
   * 生成随机十六进制字符串
   */
  randomHex(length: number): string {
    const bytes = this.randomBytes(Math.ceil(length / 2))
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, length)
  }

  /**
   * 生成随机 Base64 字符串
   */
  randomBase64(length: number): string {
    const bytes = this.randomBytes(Math.ceil(length * 3 / 4))
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64').substring(0, length)
    }
 else {
      // 浏览器环境
      return btoa(String.fromCharCode.apply(null, Array.from(bytes)))
        .substring(0, length)
    }
  }

  /**
   * 生成 UUID v4
   */
  randomUUID(): string {
    const bytes = this.randomBytes(16)

    // 设置版本位 (4)
    bytes[6] = (bytes[6] & 0x0F) | 0x40

    // 设置变体位
    bytes[8] = (bytes[8] & 0x3F) | 0x80

    // 格式化为 UUID 字符串
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    return [
      hex.substring(0, 8),
      hex.substring(8, 12),
      hex.substring(12, 16),
      hex.substring(16, 20),
      hex.substring(20, 32),
    ].join('-')
  }

  /**
   * 生成安全令牌
   */
  randomToken(length: number = 32): string {
    return this.randomBase64(length)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * 随机洗牌数组
   */
  shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.randomInt(0, i + 1)
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  /**
   * 随机选择元素
   */
  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array')
    }
    return array[this.randomInt(0, array.length)]
  }

  /**
   * 随机选择多个元素
   */
  sample<T>(array: T[], count: number): T[] {
    if (count > array.length) {
      throw new Error('Sample size cannot be larger than array length')
    }

    const indices = new Set<number>()
    while (indices.size < count) {
      indices.add(this.randomInt(0, array.length))
    }

    return Array.from(indices).map(i => array[i])
  }

  /**
   * 重新播种
   */
  reseed(additionalEntropy?: Uint8Array): void {
    // 生成新种子
    this.initializeSeed()

    // 混入额外熵
    if (additionalEntropy) {
      for (let i = 0; i < Math.min(additionalEntropy.length, this.seed.length); i++) {
        this.seed[i] ^= additionalEntropy[i]
      }
    }

    // 混入收集的熵
    if (this.config?.collectEntropy) {
      const entropy = this.entropyCollector.getEntropy()
      for (let i = 0; i < Math.min(entropy.length, this.seed.length); i++) {
        this.seed[i] ^= entropy[i]
      }
    }

    this.lastReseed = this.counter
  }

  /**
   * 添加熵
   */
  addEntropy(data: string | Uint8Array): void {
    this.entropyCollector.addEntropy(data)
  }

  /**
   * 获取熵质量
   */
  getEntropyQuality(): number {
    return this.entropyCollector.getEntropyQuality()
  }

  /**
   * 销毁生成器
   */
  destroy(): void {
    // 停止熵收集
    if (this.config?.collectEntropy) {
      this.entropyCollector.stopCollecting()
    }

    // 清除种子
    this.seed.fill(0)
    this.counter = 0
    this.lastReseed = 0
  }
}

/**
 * 全局 CSPRNG 实例
 */
export const csprng = new CSPRNG({
  entropySource: 'webcrypto',
  seedLength: 32,
  useHardwareRNG: true,
  collectEntropy: true,
  reseedInterval: 10000,
})

/**
 * 便捷函数
 */
export const random = {
  bytes: (length: number) => csprng.randomBytes(length),
  int: (min: number, max: number) => csprng.randomInt(min, max),
  float: (min?: number, max?: number) => csprng.randomFloat(min, max),
  string: (length: number, charset?: string) => csprng.randomString(length, charset),
  hex: (length: number) => csprng.randomHex(length),
  base64: (length: number) => csprng.randomBase64(length),
  uuid: () => csprng.randomUUID(),
  token: (length?: number) => csprng.randomToken(length),
  shuffle: <T>(array: T[]) => csprng.shuffle(array),
  choice: <T>(array: T[]) => csprng.choice(array),
  sample: <T>(array: T[], count: number) => csprng.sample(array, count),
}
