/**
 * 加密密钥管理系统
 * 提供安全的密钥生成、存储、轮换和访问控制
 */

import { Buffer } from 'node:buffer'

import CryptoJS from 'crypto-js'

import { aes } from '../algorithms/aes'
import { KDFManager } from '../algorithms/kdf'

/**
 * 密钥元数据
 */
export interface KeyMetadata {
  id: string
  name: string
  algorithm: string
  purpose: 'encryption' | 'signing' | 'key-derivation' | 'authentication'
  created: Date
  expires?: Date
  rotated?: Date
  version: number
  tags: string[]
  permissions: KeyPermission[]
}

/**
 * 密钥权限
 */
export interface KeyPermission {
  operation: 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'derive'
  allowed: boolean
  conditions?: {
    timeWindow?: { start: Date, end: Date }
    ipWhitelist?: string[]
    maxUses?: number
    requireMFA?: boolean
  }
}

/**
 * 密钥存储选项
 */
export interface KeyStorageOptions {
  /** 存储类型 */
  type: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB' | 'secure'
  /** 是否加密存储 */
  encrypted: boolean
  /** 主密钥派生算法 */
  kdfAlgorithm: 'pbkdf2' | 'argon2' | 'scrypt'
  /** KDF 参数 */
  kdfParams?: Record<string, unknown>
  /** 是否启用密钥轮换 */
  autoRotation: boolean
  /** 轮换间隔（天） */
  rotationInterval: number
}

/**
 * 密钥材料
 */
interface KeyMaterial {
  key: string | CryptoKey
  metadata: KeyMetadata
  encrypted: boolean
  salt?: string
  iv?: string
}

/**
 * 密钥管理器
 */
export class KeyManager {
  private keys: Map<string, KeyMaterial> = new Map()
  private masterKey: string | null = null
  private options: KeyStorageOptions
  private kdfManager: KDFManager

  private rotationTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(options: Partial<KeyStorageOptions> = {}) {
    this.options = {
      type: 'memory',
      encrypted: true,
      kdfAlgorithm: 'argon2',
      autoRotation: false,
      rotationInterval: 90,
      ...options,
    }

    this.kdfManager = new KDFManager()

    if (this.options.type !== 'memory') {
      this.loadKeysFromStorage()
    }
  }

  /**
   * 通过口令派生并初始化主密钥（向后兼容别名）
   * 等价于 initializeMasterKey，但保留 name 参数以兼容现有调用方（仅用于标记用途）。
   * @param password 用于派生主密钥的口令
   * @param name 可选的主密钥标识标签（用于存储标记，不参与派生）
   */
  async deriveKeyFromPassword(password: string, name?: string): Promise<void> {
    await this.initializeMasterKey(password)
    if (name && this.options.type !== 'memory') {
      await this.saveToStorage('master_label', name)
    }
  }

  /**
   * 初始化主密钥
   */
  async initializeMasterKey(password: string): Promise<void> {
    const salt = this.generateSalt()

    // 使用 KDF 派生主密钥
    const derivedKey = await this.kdfManager.deriveKey(
      password,
      salt,
      this.options.kdfAlgorithm,
      {
        keyLength: 32,
        ...this.options.kdfParams,
      },
    )

    this.masterKey = derivedKey.key

    // 存储主密钥的 salt
    if (this.options.type !== 'memory') {
      this.saveToStorage('master_salt', salt)
    }
  }

  /**
   * 生成新密钥
   */
  async generateKey(options: {
    name: string
    algorithm: 'AES' | 'RSA' | 'ECDSA' | 'Ed25519'
    purpose: KeyMetadata['purpose']
    keySize?: number
    expires?: Date
    tags?: string[]
    permissions?: KeyPermission[]
  }): Promise<string> {
    const keyId = this.generateKeyId()

    // 生成密钥材料
    let keyMaterial: string
    switch (options.algorithm) {
      case 'AES':
        keyMaterial = this.generateRandomKey(options.keySize || 256)
        break
      case 'RSA':
        // RSA 密钥生成（简化版）
        keyMaterial = await this.generateRSAKey(options.keySize || 2048)
        break
      case 'ECDSA':
        // ECDSA 密钥生成（简化版）
        keyMaterial = await this.generateECDSAKey('P-256')
        break
      case 'Ed25519':
        // Ed25519 密钥生成（简化版）
        keyMaterial = await this.generateEd25519Key()
        break
      default:
        throw new Error(`Unsupported algorithm: ${options.algorithm}`)
    }

    // 创建元数据
    const metadata: KeyMetadata = {
      id: keyId,
      name: options.name,
      algorithm: options.algorithm,
      purpose: options.purpose,
      created: new Date(),
      expires: options.expires,
      version: 1,
      tags: options.tags || [],
      permissions: options.permissions || this.getDefaultPermissions(options.purpose),
    }

    // 加密存储密钥
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(keyMaterial)
      this.keys.set(keyId, {
        key: encrypted.key,
        metadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv,
      })
    } else {
      this.keys.set(keyId, {
        key: keyMaterial,
        metadata,
        encrypted: false,
      })
    }

    // 设置自动轮换
    if (this.options.autoRotation) {
      this.scheduleKeyRotation(keyId)
    }

    // 持久化存储
    if (this.options.type !== 'memory') {
      await this.saveKeyToStorage(keyId)
    }

    return keyId
  }

  /**
   * 获取密钥
   */
  async getKey(keyId: string, operation?: KeyPermission['operation']): Promise<string | null> {
    const keyMaterial = this.keys.get(keyId)
    if (!keyMaterial) {
      return null
    }

    // 检查权限
    if (operation && !this.checkPermission(keyMaterial.metadata, operation)) {
      throw new Error(`Operation '${operation}' not allowed for key ${keyId}`)
    }

    // 检查过期
    if (keyMaterial.metadata.expires && new Date() > keyMaterial.metadata.expires) {
      throw new Error(`Key ${keyId} has expired`)
    }

    // 解密密钥
    if (keyMaterial.encrypted && this.masterKey) {
      return await this.decryptKey(keyMaterial)
    }

    return keyMaterial.key as string
  }

  /**
   * 轮换密钥
   */
  async rotateKey(keyId: string): Promise<string> {
    const oldKeyMaterial = this.keys.get(keyId)
    if (!oldKeyMaterial) {
      throw new Error(`Key ${keyId} not found`)
    }

    // 生成新密钥
    const newKeyMaterial = this.generateRandomKey(256)
    const newKeyId = this.generateKeyId()

    // 更新元数据
    const newMetadata: KeyMetadata = {
      ...oldKeyMaterial.metadata,
      id: newKeyId,
      created: new Date(),
      rotated: new Date(),
      version: oldKeyMaterial.metadata.version + 1,
    }

    // 加密存储新密钥
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(newKeyMaterial)
      this.keys.set(newKeyId, {
        key: encrypted.key,
        metadata: newMetadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv,
      })
    } else {
      this.keys.set(newKeyId, {
        key: newKeyMaterial,
        metadata: newMetadata,
        encrypted: false,
      })
    }

    // 标记旧密钥为已轮换
    oldKeyMaterial.metadata.rotated = new Date()

    // 重新调度轮换
    if (this.options.autoRotation) {
      this.scheduleKeyRotation(newKeyId)
    }

    // 持久化存储
    if (this.options.type !== 'memory') {
      await this.saveKeyToStorage(newKeyId)
    }

    return newKeyId
  }

  /**
   * 删除密钥
   */
  async deleteKey(keyId: string): Promise<boolean> {
    const exists = this.keys.has(keyId)
    if (!exists) {
      return false
    }

    // 取消轮换定时器
    const timer = this.rotationTimers.get(keyId)
    if (timer) {
      clearTimeout(timer)
      this.rotationTimers.delete(keyId)
    }

    // 删除密钥
    this.keys.delete(keyId)

    // 从持久化存储中删除
    if (this.options.type !== 'memory') {
      await this.removeFromStorage(keyId)
    }

    return true
  }

  /**
   * 列出所有密钥
   */
  listKeys(filter?: {
    purpose?: KeyMetadata['purpose']
    algorithm?: string
    tags?: string[]
    includeExpired?: boolean
  }): KeyMetadata[] {
    const keys: KeyMetadata[] = []
    const now = new Date()

    for (const [, keyMaterial] of this.keys) {
      const metadata = keyMaterial.metadata

      // 过滤过期密钥
      if (!filter?.includeExpired && metadata.expires && now > metadata.expires) {
        continue
      }

      // 过滤 purpose
      if (filter?.purpose && metadata.purpose !== filter.purpose) {
        continue
      }

      // 过滤算法
      if (filter?.algorithm && metadata.algorithm !== filter.algorithm) {
        continue
      }

      // 过滤标签
      if (filter?.tags && filter.tags.length > 0) {
        const hasAllTags = filter.tags.every(tag => metadata.tags.includes(tag))
        if (!hasAllTags) {
          continue
        }
      }

      keys.push({ ...metadata })
    }

    return keys
  }

  /**
   * 导出密钥
   */
  async exportKey(keyId: string, format: 'raw' | 'jwk' | 'pem' = 'raw'): Promise<string> {
    const key = await this.getKey(keyId)
    if (!key) {
      throw new Error(`Key ${keyId} not found`)
    }

    const keyMaterial = this.keys.get(keyId)
    if (!keyMaterial) {
      throw new Error(`Key material for ${keyId} not found`)
    }

    switch (format) {
      case 'raw':
        return key
      case 'jwk':
        return this.convertToJWK(key, keyMaterial.metadata)
      case 'pem':
        return this.convertToPEM(key, keyMaterial.metadata)
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * 导入密钥
   */
  async importKey(
    keyData: string,
    format: 'raw' | 'jwk' | 'pem',
    metadata: Omit<KeyMetadata, 'id' | 'created' | 'version'>,
  ): Promise<string> {
    const keyId = this.generateKeyId()

    // 解析密钥数据
    let keyMaterial: string
    switch (format) {
      case 'raw':
        keyMaterial = keyData
        break
      case 'jwk':
        keyMaterial = this.parseJWK(keyData)
        break
      case 'pem':
        keyMaterial = this.parsePEM(keyData)
        break
      default:
        throw new Error(`Unsupported import format: ${format}`)
    }

    // 创建完整的元数据
    const fullMetadata: KeyMetadata = {
      ...metadata,
      id: keyId,
      created: new Date(),
      version: 1,
    }

    // 存储密钥
    if (this.options.encrypted && this.masterKey) {
      const encrypted = await this.encryptKey(keyMaterial)
      this.keys.set(keyId, {
        key: encrypted.key,
        metadata: fullMetadata,
        encrypted: true,
        salt: encrypted.salt,
        iv: encrypted.iv,
      })
    } else {
      this.keys.set(keyId, {
        key: keyMaterial,
        metadata: fullMetadata,
        encrypted: false,
      })
    }

    // 持久化存储
    if (this.options.type !== 'memory') {
      await this.saveKeyToStorage(keyId)
    }

    return keyId
  }

  /**
   * 备份所有密钥
   */
  async backup(password?: string): Promise<string> {
    const backup: { version: string; created: string; keys: Array<{ id: string; key: string; metadata: KeyMetadata }> } = {
      version: '1.0',
      created: new Date().toISOString(),
      keys: [],
    }

    for (const [keyId, keyMaterial] of this.keys) {
      const key = await this.getKey(keyId)
      if (key) {
        backup.keys.push({
          id: keyId,
          key,
          metadata: keyMaterial.metadata,
        })
      }
    }

    const json = JSON.stringify(backup)

    // 如果提供了密码，加密备份
    if (password) {
      const encrypted = aes.encrypt(json, password)
      if (!encrypted.success) {
        throw new Error('Failed to encrypt backup')
      }
      // 将IV和加密数据组合成一个字符串：IV:EncryptedData
      return `${encrypted.iv}:${encrypted.data}`
    }

    return json
  }

  /**
   * 恢复备份
   */
  async restore(backupData: string, password?: string): Promise<number> {
    let json: string

    // 如果提供了密码，解密备份
    if (password) {
      // 分离IV和加密数据
      const parts = backupData.split(':')
      if (parts.length === 2) {
        const [iv, encryptedData] = parts
        const decrypted = aes.decrypt(encryptedData, password, { iv })
    if (!decrypted.success || !decrypted.data) {
      throw new Error('Failed to decrypt backup')
    }
    json = decrypted.data
      } else {
        // 兼容旧格式，直接尝试解密
        const decrypted = aes.decrypt(backupData, password)
        if (!decrypted.success || !decrypted.data) {
          throw new Error('Failed to decrypt backup')
        }
        json = decrypted.data
      }
    } else {
      json = backupData
    }

    const backup = JSON.parse(json)
    let restored = 0

    for (const item of backup.keys) {
      // 恢复密钥
      if (this.options.encrypted && this.masterKey) {
        const encrypted = await this.encryptKey(item.key)
        this.keys.set(item.id, {
          key: encrypted.key,
          metadata: item.metadata,
          encrypted: true,
          salt: encrypted.salt,
          iv: encrypted.iv,
        })
      } else {
        this.keys.set(item.id, {
          key: item.key,
          metadata: item.metadata,
          encrypted: false,
        })
      }
      restored++
    }

    // 持久化存储
    if (this.options.type !== 'memory') {
      for (const [keyId] of this.keys) {
        await this.saveKeyToStorage(keyId)
      }
    }

    return restored
  }

  /**
   * 清理过期密钥
   */
  cleanupExpiredKeys(): number {
    const now = new Date()
    let cleaned = 0

    for (const [keyId, keyMaterial] of this.keys) {
      if (keyMaterial.metadata.expires && now > keyMaterial.metadata.expires) {
        this.deleteKey(keyId)
        cleaned++
      }
    }

    return cleaned
  }

  // 私有方法

  private generateKeyId(): string {
    return `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateSalt(): string {
    return CryptoJS.lib.WordArray.random(128 / 8).toString()
  }

  private generateRandomKey(bits: number): string {
    return CryptoJS.lib.WordArray.random(bits / 8).toString()
  }

  private async generateRSAKey(keySize: number): Promise<string> {
    // 简化实现，实际应该使用 WebCrypto API 或 node-forge
    return this.generateRandomKey(keySize / 8)
  }

  private async generateECDSAKey(_curve: string): Promise<string> {
    // 简化实现
    return this.generateRandomKey(256)
  }

  private async generateEd25519Key(): Promise<string> {
    // 简化实现
    return this.generateRandomKey(256)
  }

  private async encryptKey(key: string): Promise<{
    key: string
    salt: string
    iv: string
  }> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized')
    }

    const iv = CryptoJS.lib.WordArray.random(128 / 8).toString()
    const salt = this.generateSalt()

    const encrypted = aes.encrypt(key, this.masterKey, {
      keySize: 256,
      iv,
    })

    if (!encrypted.data) {
      throw new Error('Failed to encrypt key - no data returned')
    }
    
    return {
      key: encrypted.data,
      salt,
      iv,
    }
  }

  private async decryptKey(keyMaterial: KeyMaterial): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized')
    }

    const decrypted = aes.decrypt(
      keyMaterial.key as string,
      this.masterKey,
      {
        keySize: 256,
        iv: keyMaterial.iv,
      },
    )

    if (!decrypted.success || !decrypted.data) {
      throw new Error('Failed to decrypt key')
    }

    return decrypted.data
  }

  private getDefaultPermissions(purpose: KeyMetadata['purpose']): KeyPermission[] {
    switch (purpose) {
      case 'encryption':
        return [
          { operation: 'encrypt', allowed: true },
          { operation: 'decrypt', allowed: true },
        ]
      case 'signing':
        return [
          { operation: 'sign', allowed: true },
          { operation: 'verify', allowed: true },
        ]
      case 'key-derivation':
        return [
          { operation: 'derive', allowed: true },
        ]
      case 'authentication':
        return [
          { operation: 'sign', allowed: true },
          { operation: 'verify', allowed: true },
        ]
      default:
        return []
    }
  }

  private checkPermission(metadata: KeyMetadata, operation: KeyPermission['operation']): boolean {
    const permission = metadata.permissions.find(p => p.operation === operation)
    if (!permission || !permission.allowed) {
      return false
    }

    // 检查条件
    if (permission.conditions) {
      const now = new Date()

      // 时间窗口
      if (permission.conditions.timeWindow) {
        if (now < permission.conditions.timeWindow.start
          || now > permission.conditions.timeWindow.end) {
          return false
        }
      }

      // 其他条件可以在这里添加
    }

    return true
  }

  private scheduleKeyRotation(keyId: string): void {
    // 清除现有定时器
    const existingTimer = this.rotationTimers.get(keyId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新定时器
    const timer = setTimeout(() => {
      this.rotateKey(keyId).catch(console.error)
    }, this.options.rotationInterval * 24 * 60 * 60 * 1000)

    this.rotationTimers.set(keyId, timer)
  }

  private convertToJWK(key: string, metadata: KeyMetadata): string {
    // 简化的 JWK 转换
    const jwk = {
      kty: metadata.algorithm === 'RSA' ? 'RSA' : 'oct',
      kid: metadata.id,
      use: metadata.purpose === 'encryption' ? 'enc' : 'sig',
      alg: metadata.algorithm,
      k: Buffer.from(key).toString('base64url'),
    }
    return JSON.stringify(jwk)
  }

  private convertToPEM(key: string, metadata: KeyMetadata): string {
    // 简化的 PEM 转换
    const base64 = Buffer.from(key).toString('base64')
    const type = metadata.purpose === 'encryption' ? 'ENCRYPTED PRIVATE KEY' : 'PRIVATE KEY'
    return `-----BEGIN ${type}-----\n${base64}\n-----END ${type}-----`
  }

  private parseJWK(jwkString: string): string {
    const jwk = JSON.parse(jwkString)
    return Buffer.from(jwk.k, 'base64url').toString()
  }

  private parsePEM(pem: string): string {
    const base64 = pem
      .replace(/-----BEGIN.*-----/, '')
      .replace(/-----END.*-----/, '')
      .replace(/\s/g, '')
    return Buffer.from(base64, 'base64').toString()
  }

  // 存储相关方法

  private async loadKeysFromStorage(): Promise<void> {
    // 根据存储类型加载密钥
    // 这里简化实现
  }

  private async saveKeyToStorage(_keyId: string): Promise<void> {
    // 根据存储类型保存密钥
    // 这里简化实现
  }

  private async saveToStorage(_key: string, _value: string): Promise<void> {
    // 保存到存储
    // 这里简化实现
  }

  private async removeFromStorage(_keyId: string): Promise<void> {
    // 从存储中删除
    // 这里简化实现
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 清除所有定时器
    for (const timer of this.rotationTimers.values()) {
      clearTimeout(timer)
    }
    this.rotationTimers.clear()

    // 清除密钥
    this.keys.clear()
    this.masterKey = null
  }
}

/**
 * 全局密钥管理器实例
 */
export const keyManager = new KeyManager({
  type: 'memory',
  encrypted: true,
  kdfAlgorithm: 'argon2',
  autoRotation: true,
  rotationInterval: 90,
})
