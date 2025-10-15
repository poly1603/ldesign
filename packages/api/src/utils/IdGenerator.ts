/**
 * ID生成器工具
 * 提供多种ID生成策略：UUID、nanoid、递增、时间戳等
 */

/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 生成短ID（类似nanoid）
 */
export function generateShortId(length: number = 21): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < length; i++) {
      id += alphabet[bytes[i] % alphabet.length]
    }
  }
  else {
    // Fallback
    for (let i = 0; i < length; i++) {
      id += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
  }

  return id
}

/**
 * 生成数字ID（递增）
 */
let counter = 0
export function generateNumericId(): string {
  return String(++counter)
}

/**
 * 重置数字计数器
 */
export function resetNumericCounter(start: number = 0): void {
  counter = start
}

/**
 * 生成时间戳ID
 */
export function generateTimestampId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 生成雪花ID（简化版）
 * 格式：时间戳(41bit) + 机器ID(10bit) + 序列号(12bit)
 */
let sequence = 0
let lastTimestamp = -1
const machineId = Math.floor(Math.random() * 1024) // 0-1023

export function generateSnowflakeId(): string {
  let timestamp = Date.now()

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1) & 0xFFF // 12bit序列号
    if (sequence === 0) {
      // 序列号溢出，等待下一毫秒
      while (timestamp <= lastTimestamp) {
        timestamp = Date.now()
      }
    }
  }
  else {
    sequence = 0
  }

  lastTimestamp = timestamp

  // 组合ID：时间戳 + 机器ID + 序列号
  const id = (BigInt(timestamp) << BigInt(22)) | (BigInt(machineId) << BigInt(12)) | BigInt(sequence)
  return id.toString()
}

/**
 * 生成十六进制ID
 */
export function generateHexId(length: number = 16): string {
  let result = ''
  const chars = '0123456789abcdef'

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(Math.ceil(length / 2))
    crypto.getRandomValues(bytes)
    for (let i = 0; i < length; i++) {
      result += chars[bytes[Math.floor(i / 2)] % 16]
    }
  }
  else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * 16)]
    }
  }

  return result
}

/**
 * 生成Base62 ID
 */
export function generateBase62Id(length: number = 12): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  let result = ''

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length]
    }
  }
  else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }

  return result
}

/**
 * ID生成策略类型
 */
export type IdGeneratorStrategy =
  | 'uuid'
  | 'short'
  | 'numeric'
  | 'timestamp'
  | 'snowflake'
  | 'hex'
  | 'base62'
  | ((() => string))

/**
 * ID生成器配置
 */
export interface IdGeneratorConfig {
  strategy?: IdGeneratorStrategy
  length?: number
  prefix?: string
  suffix?: string
}

/**
 * ID生成器类
 */
export class IdGenerator {
  private strategy: IdGeneratorStrategy
  private length: number
  private prefix: string
  private suffix: string

  constructor(config: IdGeneratorConfig = {}) {
    this.strategy = config.strategy || 'short'
    this.length = config.length || 21
    this.prefix = config.prefix || ''
    this.suffix = config.suffix || ''
  }

  /**
   * 生成ID
   */
  generate(): string {
    let id: string

    if (typeof this.strategy === 'function') {
      id = this.strategy()
    }
    else {
      switch (this.strategy) {
        case 'uuid':
          id = generateUUID()
          break
        case 'numeric':
          id = generateNumericId()
          break
        case 'timestamp':
          id = generateTimestampId()
          break
        case 'snowflake':
          id = generateSnowflakeId()
          break
        case 'hex':
          id = generateHexId(this.length)
          break
        case 'base62':
          id = generateBase62Id(this.length)
          break
        case 'short':
        default:
          id = generateShortId(this.length)
          break
      }
    }

    return `${this.prefix}${id}${this.suffix}`
  }

  /**
   * 批量生成ID
   */
  generateBatch(count: number): string[] {
    return Array.from({ length: count }, () => this.generate())
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<IdGeneratorConfig>): void {
    if (config.strategy !== undefined) {
      this.strategy = config.strategy
    }
    if (config.length !== undefined) {
      this.length = config.length
    }
    if (config.prefix !== undefined) {
      this.prefix = config.prefix
    }
    if (config.suffix !== undefined) {
      this.suffix = config.suffix
    }
  }
}

/**
 * 创建ID生成器
 */
export function createIdGenerator(config?: IdGeneratorConfig): IdGenerator {
  return new IdGenerator(config)
}

/**
 * 全局默认ID生成器
 */
let globalIdGenerator: IdGenerator | null = null

/**
 * 获取全局ID生成器
 */
export function getGlobalIdGenerator(): IdGenerator {
  if (!globalIdGenerator) {
    globalIdGenerator = new IdGenerator()
  }
  return globalIdGenerator
}

/**
 * 设置全局ID生成器
 */
export function setGlobalIdGenerator(generator: IdGenerator): void {
  globalIdGenerator = generator
}

/**
 * 便捷函数：生成ID
 */
export function id(strategy?: IdGeneratorStrategy, length?: number): string {
  const generator = new IdGenerator({ strategy, length })
  return generator.generate()
}
