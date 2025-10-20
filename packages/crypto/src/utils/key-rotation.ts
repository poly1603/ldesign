/**
 * 密钥轮换辅助工具
 *
 * 特性：
 * - 支持平滑的密钥轮换
 * - 保持旧密钥的解密能力
 * - 自动重新加密数据
 * - 密钥版本管理
 *
 * @example
 * ```typescript
 * const rotation = new KeyRotation()
 *
 * // 添加初始密钥
 * rotation.addKey('v1', 'old-key-1')
 * rotation.setActiveKey('v1')
 *
 * // 轮换到新密钥
 * rotation.addKey('v2', 'new-key-2')
 * rotation.rotateKey('v2')
 *
 * // 重新加密数据
 * const reencrypted = await rotation.reencryptData(oldEncryptedData)
 * ```
 */

import type { DecryptResult, EncryptionAlgorithm, EncryptResult } from '../types'
import { aes } from '../algorithms'

/**
 * 密钥信息
 */
export interface KeyInfo {
  /** 密钥版本 */
  version: string
  /** 密钥值 */
  key: string
  /** 创建时间 */
  createdAt: Date
  /** 是否激活 */
  active: boolean
  /** 是否已弃用 */
  deprecated: boolean
  /** 过期时间（可选） */
  expiresAt?: Date
}

/**
 * 加密数据元数据
 */
export interface EncryptedDataMetadata {
  /** 密钥版本 */
  keyVersion: string
  /** 加密时间 */
  encryptedAt: Date
  /** 算法 */
  algorithm: string
}

/**
 * 重新加密结果
 */
export interface ReencryptionResult {
  success: boolean
  /** 新的加密数据 */
  newData?: EncryptResult
  /** 旧密钥版本 */
  oldKeyVersion?: string
  /** 新密钥版本 */
  newKeyVersion?: string
  /** 错误信息 */
  error?: string
}

/**
 * 密钥轮换类
 */
export class KeyRotation {
  private keys: Map<string, KeyInfo> = new Map()
  private activeKeyVersion?: string

  /**
   * 添加密钥
   */
  addKey(version: string, key: string, expiresAt?: Date): void {
    if (this.keys.has(version)) {
      throw new Error(`Key version '${version}' already exists`)
    }

    this.keys.set(version, {
      version,
      key,
      createdAt: new Date(),
      active: false,
      deprecated: false,
      expiresAt,
    })
  }

  /**
   * 设置激活密钥
   */
  setActiveKey(version: string): void {
    const keyInfo = this.keys.get(version)
    if (!keyInfo) {
      throw new Error(`Key version '${version}' not found`)
    }

    // 取消之前的激活密钥
    if (this.activeKeyVersion) {
      const oldKey = this.keys.get(this.activeKeyVersion)
      if (oldKey) {
        oldKey.active = false
      }
    }

    keyInfo.active = true
    this.activeKeyVersion = version
  }

  /**
   * 轮换密钥（添加新密钥并设为激活）
   */
  rotateKey(newVersion: string, newKey: string, expiresAt?: Date): void {
    // 标记旧密钥为已弃用
    if (this.activeKeyVersion) {
      const oldKey = this.keys.get(this.activeKeyVersion)
      if (oldKey) {
        oldKey.deprecated = true
      }
    }

    // 添加并激活新密钥
    this.addKey(newVersion, newKey, expiresAt)
    this.setActiveKey(newVersion)
  }

  /**
   * 获取激活密钥
   */
  getActiveKey(): KeyInfo | undefined {
    if (!this.activeKeyVersion) {
      return undefined
    }
    return this.keys.get(this.activeKeyVersion)
  }

  /**
   * 获取密钥
   */
  getKey(version: string): KeyInfo | undefined {
    return this.keys.get(version)
  }

  /**
   * 获取所有密钥
   */
  getAllKeys(): KeyInfo[] {
    return Array.from(this.keys.values())
  }

  /**
   * 删除密钥
   */
  removeKey(version: string): boolean {
    if (version === this.activeKeyVersion) {
      throw new Error('Cannot remove active key')
    }
    return this.keys.delete(version)
  }

  /**
   * 清理过期密钥
   */
  cleanupExpiredKeys(): number {
    const now = new Date()
    let count = 0

    for (const [version, keyInfo] of this.keys.entries()) {
      if (keyInfo.expiresAt && keyInfo.expiresAt < now && !keyInfo.active) {
        this.keys.delete(version)
        count++
      }
    }

    return count
  }

  /**
   * 使用激活密钥加密数据
   */
  encrypt(
    data: string,
    _algorithm: EncryptionAlgorithm = 'AES', // 未使用，默认使用AES
    options?: Record<string, unknown>
  ): EncryptResult & { keyVersion: string } {
    const activeKey = this.getActiveKey()
    if (!activeKey) {
      throw new Error('No active key set')
    }

    const result = aes.encrypt(data, activeKey.key, options)

    return {
      ...result,
      keyVersion: activeKey.version,
    }
  }

  /**
   * 解密数据（自动选择正确的密钥版本）
   */
  decrypt(
    encryptedData: (EncryptResult & { keyVersion: string }) | string,
    _algorithm: EncryptionAlgorithm = 'AES', // 未使用，默认使用AES
    options?: Record<string, unknown>
  ): DecryptResult {
    let keyVersion: string

    // 提取密钥版本
    if (typeof encryptedData === 'string') {
      // 尝试从 JSON 解析
      try {
        const parsed = JSON.parse(encryptedData)
        keyVersion = parsed.keyVersion
      } catch {
        throw new Error('Cannot determine key version from encrypted data')
      }
    } else {
      keyVersion = encryptedData.keyVersion
    }

    const keyInfo = this.getKey(keyVersion)
    if (!keyInfo) {
      throw new Error(`Key version '${keyVersion}' not found`)
    }

    return aes.decrypt(encryptedData, keyInfo.key, options)
  }

  /**
   * 重新加密数据（使用新的激活密钥）
   */
  async reencryptData(
    encryptedData: (EncryptResult & { keyVersion: string }) | string,
    algorithm: EncryptionAlgorithm = 'AES',
    options?: Record<string, unknown>
  ): Promise<ReencryptionResult> {
    try {
      // 解密数据
      const decrypted = this.decrypt(encryptedData, algorithm, options)

      if (!decrypted.success || !decrypted.data) {
        return {
          success: false,
          error: decrypted.error || 'Decryption failed',
        }
      }

      // 使用新密钥加密
      const encrypted = this.encrypt(decrypted.data, algorithm, options)

      const oldKeyVersion =
        typeof encryptedData === 'string'
          ? JSON.parse(encryptedData).keyVersion
          : encryptedData.keyVersion

      return {
        success: true,
        newData: encrypted,
        oldKeyVersion,
        newKeyVersion: encrypted.keyVersion,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Reencryption failed',
      }
    }
  }

  /**
   * 批量重新加密数据
   */
  async reencryptBatch(
    dataList: Array<(EncryptResult & { keyVersion: string }) | string>,
    algorithm: EncryptionAlgorithm = 'AES',
    options?: Record<string, unknown>
  ): Promise<ReencryptionResult[]> {
    const results: ReencryptionResult[] = []

    for (const data of dataList) {
      const result = await this.reencryptData(data, algorithm, options)
      results.push(result)
    }

    return results
  }

  /**
   * 导出密钥配置
   */
  exportKeys(): string {
    const keysArray = Array.from(this.keys.values())
    return JSON.stringify({
      keys: keysArray,
      activeKeyVersion: this.activeKeyVersion,
    })
  }

  /**
   * 导入密钥配置
   */
  importKeys(json: string): void {
    const config = JSON.parse(json)
    this.keys.clear()

    for (const keyInfo of config.keys) {
      this.keys.set(keyInfo.version, {
        ...keyInfo,
        createdAt: new Date(keyInfo.createdAt),
        expiresAt: keyInfo.expiresAt ? new Date(keyInfo.expiresAt) : undefined,
      })
    }

    this.activeKeyVersion = config.activeKeyVersion
  }
}

/**
 * 创建密钥轮换实例
 */
export function createKeyRotation(): KeyRotation {
  return new KeyRotation()
}
