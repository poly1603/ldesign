import type { ObfuscationConfig } from '../types'

/**
 * 键名混淆器
 */
export class KeyObfuscator {
  private config: ObfuscationConfig
  private keyMap: Map<string, string> = new Map() // 原始键 -> 混淆键
  private reverseKeyMap: Map<string, string> = new Map() // 混淆键 -> 原始键

  constructor(config: ObfuscationConfig) {
    this.config = {
      enabled: config.enabled,
      prefix: config.prefix || 'ld_',
      algorithm: config.algorithm || 'hash',
      customObfuscate: config.customObfuscate,
      customDeobfuscate: config.customDeobfuscate,
    }
  }

  /**
   * 检查混淆功能是否可用
   */
  isAvailable(): boolean {
    return true // 混淆功能总是可用
  }

  /**
   * 混淆键名
   */
  async obfuscate(key: string): Promise<string> {
    if (!this.config?.enabled) {
      return key
    }

    // 检查缓存
    if (this.keyMap.has(key)) {
      return this.keyMap.get(key)!
    }

    let obfuscatedKey: string

    // 使用自定义混淆函数
    if (this.config?.customObfuscate) {
      obfuscatedKey = this.config?.customObfuscate(key)
      // 自定义混淆函数的结果直接使用，不添加前缀
      const finalKey = obfuscatedKey

      // 缓存映射关系
      this.keyMap.set(key, finalKey)
      this.reverseKeyMap.set(finalKey, key)

      return finalKey
    }
    else {
      // 使用内置混淆算法
      switch (this.config?.algorithm) {
        case 'hash':
          obfuscatedKey = await this.hashObfuscate(key)
          break
        case 'base64':
          obfuscatedKey = this.base64Obfuscate(key)
          break
        default:
          obfuscatedKey = await this.hashObfuscate(key)
      }
    }

    // 添加前缀（仅对内置算法）
    const finalKey = `${this.config?.prefix}${obfuscatedKey}`

    // 缓存映射关系
    this.keyMap.set(key, finalKey)
    this.reverseKeyMap.set(finalKey, key)

    return finalKey
  }

  /**
   * 反混淆键名
   */
  async deobfuscate(obfuscatedKey: string): Promise<string> {
    if (!this.config?.enabled) {
      return obfuscatedKey
    }

    // 检查缓存
    if (this.reverseKeyMap.has(obfuscatedKey)) {
      return this.reverseKeyMap.get(obfuscatedKey)!
    }

    // 移除前缀
    const prefix = this.config?.prefix || 'ld_'
    if (!obfuscatedKey.startsWith(prefix)) {
      return obfuscatedKey // 不是混淆的键
    }

    const keyWithoutPrefix = obfuscatedKey.slice(prefix.length)

    // 使用自定义反混淆函数
    if (this.config?.customDeobfuscate) {
      const originalKey = this.config?.customDeobfuscate(keyWithoutPrefix)
      this.reverseKeyMap.set(obfuscatedKey, originalKey)
      this.keyMap.set(originalKey, obfuscatedKey)
      return originalKey
    }

    // 对于哈希混淆，无法直接反向，需要从存储的映射中查找
    // 这里返回混淆后的键，实际使用中应该维护映射关系
    return obfuscatedKey
  }

  /**
   * 哈希混淆
   */
  private async hashObfuscate(key: string): Promise<string> {
    if (
      typeof window !== 'undefined'
      && window.crypto
      && window.crypto.subtle
    ) {
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(key)
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
        const hashArray = new Uint8Array(hashBuffer)

        // 转换为十六进制字符串
        return Array.from(hashArray)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
          .slice(0, 16) // 取前16位
      }
      catch (error) {
        console.warn(
          'Web Crypto API hash failed, falling back to simple hash:',
          error,
        )
      }
    }

    // 回退到简单哈希
    return this.simpleHash(key)
  }

  /**
   * Base64 混淆
   */
  private base64Obfuscate(key: string): string {
    try {
      // 使用现代方法替代已弃用的 unescape
      const encoder = new TextEncoder()
      const data = encoder.encode(key)
      const binary = Array.from(data, byte => String.fromCharCode(byte)).join(
        '',
      )

      return btoa(binary).replace(/[+/=]/g, (match) => {
        switch (match) {
          case '+':
            return '-'
          case '/':
            return '_'
          case '=':
            return ''
          default:
            return match
        }
      })
    }
    catch (error) {
      console.error('Base64 obfuscation failed:', error)
      return key
    }
  }

  /**
   * 简单哈希算法（回退方案）
   */
  private simpleHash(str: string): string {
    let hash = 0
    if (str.length === 0) { return hash.toString() }

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // 转换为32位整数
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * 清理缓存的映射关系
   */
  clearCache(): void {
    this.keyMap.clear()
    this.reverseKeyMap.clear()
  }

  /**
   * 获取映射统计
   */
  getStats(): {
    totalMappings: number
    cacheHitRate: number
  } {
    return {
      totalMappings: this.keyMap.size,
      cacheHitRate: this.keyMap.size > 0 ? 1 : 0, // 简化的命中率计算
    }
  }

  /**
   * 导出键映射（用于持久化）
   */
  exportKeyMappings(): Record<string, string> {
    const mappings: Record<string, string> = {}
    for (const [original, obfuscated] of this.keyMap) {
      mappings[original] = obfuscated
    }
    return mappings
  }

  /**
   * 导入键映射（用于恢复）
   */
  importKeyMappings(mappings: Record<string, string>): void {
    this.keyMap.clear()
    this.reverseKeyMap.clear()

    for (const [original, obfuscated] of Object.entries(mappings)) {
      this.keyMap.set(original, obfuscated)
      this.reverseKeyMap.set(obfuscated, original)
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ObfuscationConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }

    // 如果算法改变，清理缓存
    if (config.algorithm && config.algorithm !== this.config?.algorithm) {
      this.clearCache()
    }
  }

  /**
   * 获取配置
   */
  getConfig(): ObfuscationConfig {
    return { ...this.config }
  }
}
