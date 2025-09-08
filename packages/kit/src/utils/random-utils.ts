/**
 * 随机工具类
 * 提供各种随机数生成和随机选择功能
 */

import { randomBytes } from 'node:crypto'

/**
 * 随机工具
 */
export class RandomUtils {
  /**
   * 生成随机整数
   * @param min 最小值（包含）
   * @param max 最大值（包含）
   * @returns 随机整数
   */
  static int(min: number, max: number): number {
    if (min > max) {
      throw new Error('min must be less than or equal to max')
    }
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 生成随机浮点数
   * @param min 最小值（包含）
   * @param max 最大值（不包含）
   * @returns 随机浮点数
   */
  static float(min: number = 0, max: number = 1): number {
    if (min > max) {
      throw new Error('min must be less than or equal to max')
    }
    return Math.random() * (max - min) + min
  }

  /**
   * 生成随机布尔值
   * @param probability 为true的概率（0-1）
   * @returns 随机布尔值
   */
  static boolean(probability: number = 0.5): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error('probability must be between 0 and 1')
    }
    return Math.random() < probability
  }

  /**
   * 从数组中随机选择一个元素
   * @param array 数组
   * @returns 随机元素
   */
  static choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Array cannot be empty')
    }
    return array[RandomUtils.int(0, array.length - 1)]!
  }

  /**
   * 从数组中随机选择多个元素（不重复）
   * @param array 数组
   * @param count 选择数量
   * @returns 随机元素数组
   */
  static choices<T>(array: T[], count: number): T[] {
    if (count < 0) {
      throw new Error('count must be non-negative')
    }
    if (count > array.length) {
      throw new Error('count cannot be greater than array length')
    }
    if (array.length === 0) {
      return []
    }

    const shuffled = RandomUtils.shuffle([...array])
    return shuffled.slice(0, count)
  }

  /**
   * 从数组中随机选择多个元素（可重复）
   * @param array 数组
   * @param count 选择数量
   * @returns 随机元素数组
   */
  static sample<T>(array: T[], count: number): T[] {
    if (count < 0) {
      throw new Error('count must be non-negative')
    }
    if (array.length === 0) {
      return []
    }

    const result: T[] = []
    for (let i = 0; i < count; i++) {
      result.push(RandomUtils.choice(array))
    }
    return result
  }

  /**
   * 洗牌数组（Fisher-Yates算法）
   * @param array 数组
   * @returns 洗牌后的新数组
   */
  static shuffle<T>(array: T[]): T[] {
    const result = [...array]
    for (let i = result.length - 1; i > 0; i--) {
      const j = RandomUtils.int(0, i)
      const tmp = result[i]!
      result[i] = result[j]!
      result[j] = tmp
    }
    return result
  }

  /**
   * 加权随机选择
   * @param items 项目数组
   * @param weights 权重数组
   * @returns 随机选择的项目
   */
  static weightedChoice<T>(items: T[], weights: number[]): T {
    if (items.length !== weights.length) {
      throw new Error('items and weights arrays must have the same length')
    }
    if (items.length === 0) {
      throw new Error('Arrays cannot be empty')
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
    if (totalWeight <= 0) {
      throw new Error('Total weight must be positive')
    }

    let random = Math.random() * totalWeight
    for (let i = 0; i < items.length; i++) {
      random -= (weights[i] ?? 0)
      if (random <= 0) {
        const item = items[i]
        if (item !== undefined)
          return item
      }
    }

    // fallback（不应该到达这里）
    return items[items.length - 1]!
  }

  /**
   * 生成随机字符串
   * @param length 长度
   * @param charset 字符集
   * @returns 随机字符串
   */
  static string(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    if (length < 0) {
      throw new Error('length must be non-negative')
    }
    if (charset.length === 0) {
      throw new Error('charset cannot be empty')
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset[RandomUtils.int(0, charset.length - 1)]
    }
    return result
  }

  /**
   * 生成随机字母字符串
   * @param length 长度
   * @param uppercase 是否包含大写字母
   * @param lowercase 是否包含小写字母
   * @returns 随机字母字符串
   */
  static letters(length: number, uppercase: boolean = true, lowercase: boolean = true): string {
    let charset = ''
    if (uppercase)
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase)
      charset += 'abcdefghijklmnopqrstuvwxyz'

    if (charset.length === 0) {
      throw new Error('At least one of uppercase or lowercase must be true')
    }

    return RandomUtils.string(length, charset)
  }

  /**
   * 生成随机数字字符串
   * @param length 长度
   * @returns 随机数字字符串
   */
  static digits(length: number): string {
    return RandomUtils.string(length, '0123456789')
  }

  /**
   * 生成随机ID字符串
   * @param length 长度
   * @returns 随机ID
   */
  static generateId(length: number = 8): string {
    return RandomUtils.string(length, 'abcdefghijklmnopqrstuvwxyz0123456789')
  }

  /**
   * 生成随机字母数字字符串
   * @param length 长度
   * @returns 随机字母数字字符串
   */
  static alphanumeric(length: number): string {
    return RandomUtils.string(
      length,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    )
  }

  /**
   * 生成随机十六进制字符串
   * @param length 长度
   * @returns 随机十六进制字符串
   */
  static hex(length: number): string {
    return RandomUtils.string(length, '0123456789abcdef')
  }

  /**
   * 生成随机UUID v4
   * @returns UUID字符串
   */
  static uuid(): string {
    const hex = RandomUtils.hex(32)
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      `4${hex.slice(13, 16)}`,
      ['8', '9', 'a', 'b'][RandomUtils.int(0, 3)] + hex.slice(17, 20),
      hex.slice(20, 32),
    ].join('-')
  }

  /**
   * 生成随机颜色（十六进制）
   * @returns 随机颜色
   */
  static color(): string {
    return `#${RandomUtils.hex(6)}`
  }

  /**
   * 生成随机RGB颜色
   * @returns RGB颜色对象
   */
  static rgb(): { r: number, g: number, b: number } {
    return {
      r: RandomUtils.int(0, 255),
      g: RandomUtils.int(0, 255),
      b: RandomUtils.int(0, 255),
    }
  }

  /**
   * 生成随机HSL颜色
   * @returns HSL颜色对象
   */
  static hsl(): { h: number, s: number, l: number } {
    return {
      h: RandomUtils.int(0, 360),
      s: RandomUtils.int(0, 100),
      l: RandomUtils.int(0, 100),
    }
  }

  /**
   * 生成随机日期
   * @param start 开始日期
   * @param end 结束日期
   * @returns 随机日期
   */
  static date(start: Date = new Date(2000, 0, 1), end: Date = new Date()): Date {
    const startTime = start.getTime()
    const endTime = end.getTime()
    const randomTime = RandomUtils.float(startTime, endTime)
    return new Date(randomTime)
  }

  /**
   * 生成随机IP地址（IPv4）
   * @returns 随机IP地址
   */
  static ipv4(): string {
    return [
      RandomUtils.int(1, 255),
      RandomUtils.int(0, 255),
      RandomUtils.int(0, 255),
      RandomUtils.int(1, 254),
    ].join('.')
  }

  /**
   * 生成随机MAC地址
   * @returns 随机MAC地址
   */
  static macAddress(): string {
    const parts: string[] = []
    for (let i = 0; i < 6; i++) {
      parts.push(RandomUtils.hex(2))
    }
    return parts.join(':')
  }

  /**
   * 生成随机端口号
   * @param wellKnown 是否包含知名端口（1-1023）
   * @returns 随机端口号
   */
  static port(wellKnown: boolean = false): number {
    return wellKnown ? RandomUtils.int(1, 65535) : RandomUtils.int(1024, 65535)
  }

  /**
   * 生成随机用户代理字符串
   * @returns 随机用户代理
   */
  static userAgent(): string {
    const browsers = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    ]
    return RandomUtils.choice(browsers)
  }

  /**
   * 使用加密安全的随机数生成器
   * @param min 最小值
   * @param max 最大值
   * @returns 加密安全的随机整数
   */
  static secureInt(min: number, max: number): number {
    if (min > max) {
      throw new Error('min must be less than or equal to max')
    }

    const range = max - min + 1
    const bytesNeeded = Math.ceil(Math.log2(range) / 8)
    const maxValue = 256 ** bytesNeeded
    const threshold = maxValue - (maxValue % range)

    let randomValue: number
    do {
      const bytes = randomBytes(bytesNeeded)
      randomValue = 0
      for (let i = 0; i < bytesNeeded; i++) {
        const byte = bytes[i] ?? 0
        randomValue = randomValue * 256 + byte
      }
    } while (randomValue >= threshold)

    return min + (randomValue % range)
  }

  /**
   * 生成加密安全的随机字符串
   * @param length 长度
   * @param charset 字符集
   * @returns 加密安全的随机字符串
   */
  static secureString(
    length: number,
    charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ): string {
    if (length < 0) {
      throw new Error('length must be non-negative')
    }
    if (charset.length === 0) {
      throw new Error('charset cannot be empty')
    }

    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset[RandomUtils.secureInt(0, charset.length - 1)]
    }
    return result
  }

  /**
   * 生成随机密码
   * @param length 长度
   * @param options 选项
   * @returns 随机密码
   */
  static password(
    length: number = 12,
    options: {
      uppercase?: boolean
      lowercase?: boolean
      numbers?: boolean
      symbols?: boolean
      excludeSimilar?: boolean
    } = {},
  ): string {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = false,
      excludeSimilar = false,
    } = options

    let charset = ''
    if (uppercase)
      charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase)
      charset += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers)
      charset += '0123456789'
    if (symbols)
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '')
    }

    if (charset.length === 0) {
      throw new Error('At least one character type must be enabled')
    }

    return RandomUtils.secureString(length, charset)
  }

  /**
   * 生成随机种子
   * @returns 随机种子
   */
  static seed(): number {
    return RandomUtils.secureInt(0, Number.MAX_SAFE_INTEGER)
  }

  /**
   * 设置随机种子（用于可重现的随机序列）
   * 注意：这会影响 Math.random()
   * @param seed 种子值
   */
  static setSeed(seed: number): void {
    // 注意：JavaScript 的 Math.random() 不支持设置种子
    // 这里提供一个简单的线性同余生成器作为替代
    let currentSeed = seed
    const originalRandom = Math.random

    Math.random = () => {
      currentSeed = (currentSeed * 1664525 + 1013904223) % 2 ** 32
      return currentSeed / 2 ** 32
    }

    // 提供恢复原始随机函数的方法
    ;(Math.random as any).restore = () => {
      Math.random = originalRandom
    }
  }
}
