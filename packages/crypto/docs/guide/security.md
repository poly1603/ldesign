# 安全考虑

本指南提供了使用 @ldesign/crypto 时的安全最佳实践和注意事项。

## 密钥管理安全

### 密钥生成

```typescript
import { keyGenerator } from '@ldesign/crypto'

// ✅ 正确：基于密码生成强密钥
import { hash } from '@ldesign/crypto'

// ✅ 正确：使用强随机密钥
const strongKey = keyGenerator.generateKey(32) // 256位密钥

// ✅ 正确：使用足够长度的密钥
const aes256Key = keyGenerator.generateKey(32) // AES-256
const aes192Key = keyGenerator.generateKey(24) // AES-192
const aes128Key = keyGenerator.generateKey(16) // AES-128

// ❌ 错误：使用弱密钥
const weakKey = '123456'
const predictableKey = 'password'

function deriveKeyFromPassword(password: string, salt: string): string {
  // 使用 PBKDF2 派生密钥
  return hash.pbkdf2(password, salt, {
    iterations: 100000, // 足够的迭代次数
    keyLength: 32, // 256位密钥
    hashAlgorithm: 'SHA256',
  })
}

const userPassword = 'user-password'
const salt = keyGenerator.generateSalt(16)
const derivedKey = deriveKeyFromPassword(userPassword, salt)
```

### 密钥存储

```typescript
// ✅ 正确：安全的密钥存储
class SecureKeyStorage {
  private static readonly STORAGE_KEY = 'encrypted_keys'

  // 使用主密钥加密存储其他密钥
  static storeKey(keyId: string, key: string, masterKey: string): void {
    const keys = this.getAllKeys(masterKey)
    keys[keyId] = key

    const encrypted = encrypt.aes(JSON.stringify(keys), masterKey)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(encrypted))
  }

  static retrieveKey(keyId: string, masterKey: string): string | null {
    const keys = this.getAllKeys(masterKey)
    return keys[keyId] || null
  }

  private static getAllKeys(masterKey: string): Record<string, string> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored)
        return {}

      const encrypted = JSON.parse(stored)
      const decrypted = decrypt.aes(encrypted, masterKey)

      if (!decrypted.success)
        return {}

      return JSON.parse(decrypted.data)
    }
    catch {
      return {}
    }
  }

  static clearKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

// ❌ 错误：明文存储密钥
localStorage.setItem('apiKey', 'secret-key')

// ✅ 正确：加密存储密钥
const masterKey = keyGenerator.generateKey(32)
SecureKeyStorage.storeKey('apiKey', 'secret-key', masterKey)
```

### 密钥轮换

```typescript
// 密钥轮换策略
class KeyRotationManager {
  private currentKeyId: string = '1'
  private keys: Map<string, string> = new Map()
  private rotationInterval: number

  constructor(rotationInterval = 24 * 60 * 60 * 1000) {
    // 24小时
    this.rotationInterval = rotationInterval
    this.scheduleRotation()
  }

  // 生成新密钥
  generateNewKey(): string {
    const newKeyId = (Number.parseInt(this.currentKeyId) + 1).toString()
    const newKey = keyGenerator.generateKey(32)

    this.keys.set(newKeyId, newKey)
    this.currentKeyId = newKeyId

    console.log(`密钥已轮换到版本 ${newKeyId}`)
    return newKey
  }

  // 获取当前密钥
  getCurrentKey(): string {
    return this.keys.get(this.currentKeyId) || this.generateNewKey()
  }

  // 获取指定版本的密钥（用于解密旧数据）
  getKey(keyId: string): string | undefined {
    return this.keys.get(keyId)
  }

  // 加密时使用当前密钥
  encrypt(data: string): any {
    const currentKey = this.getCurrentKey()
    const encrypted = encrypt.aes(data, currentKey)

    // 在加密结果中包含密钥版本
    return {
      ...encrypted,
      keyVersion: this.currentKeyId,
    }
  }

  // 解密时使用对应版本的密钥
  decrypt(encryptedData: any): any {
    const keyVersion = encryptedData.keyVersion || '1'
    const key = this.getKey(keyVersion)

    if (!key) {
      throw new Error(`密钥版本 ${keyVersion} 不存在`)
    }

    return decrypt.aes(encryptedData, key)
  }

  private scheduleRotation(): void {
    setInterval(() => {
      this.generateNewKey()
    }, this.rotationInterval)
  }

  // 清理旧密钥（保留最近几个版本）
  cleanupOldKeys(keepVersions = 3): void {
    const currentVersion = Number.parseInt(this.currentKeyId)
    const keysToDelete = []

    for (const [keyId] of this.keys) {
      const version = Number.parseInt(keyId)
      if (currentVersion - version > keepVersions) {
        keysToDelete.push(keyId)
      }
    }

    keysToDelete.forEach((keyId) => {
      this.keys.delete(keyId)
      console.log(`已清理密钥版本 ${keyId}`)
    })
  }
}
```

## 算法安全性

### 算法选择建议

```typescript
// ✅ 推荐的安全算法配置
const secureConfig = {
  // AES 配置
  aes: {
    keySize: 256, // 使用 AES-256
    mode: 'GCM', // 使用认证加密模式
    tagLength: 128, // 128位认证标签
  },

  // RSA 配置
  rsa: {
    keySize: 4096, // 使用 4096位密钥
    padding: 'OAEP', // 使用 OAEP 填充
    hashAlgorithm: 'SHA256',
  },

  // 哈希配置
  hash: {
    algorithm: 'SHA256', // 避免使用 MD5 和 SHA1
    iterations: 100000, // PBKDF2 使用足够的迭代次数
  },
}

// ❌ 不安全的配置
const insecureConfig = {
  aes: {
    keySize: 128, // 密钥长度不足
    mode: 'ECB', // 不安全的加密模式
  },
  rsa: {
    keySize: 1024, // 密钥长度不足
    padding: 'PKCS1', // 较弱的填充方式
  },
  hash: {
    algorithm: 'MD5', // 已被破解的算法
    iterations: 1000, // 迭代次数不足
  },
}
```

### 安全的随机数生成

```typescript
// ✅ 正确：使用密码学安全的随机数
const secureRandom = keyGenerator.generateRandomBytes(32)
const secureIV = keyGenerator.generateIV(16)
const secureSalt = keyGenerator.generateSalt(16)

// ❌ 错误：使用不安全的随机数
const insecureRandom = Math.random().toString()
const predictableIV = '1234567890abcdef'

// 自定义安全随机数生成器
class SecureRandom {
  static generateBytes(length: number): Uint8Array {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      // 浏览器环境
      const array = new Uint8Array(length)
      crypto.getRandomValues(array)
      return array
    }
    else if (typeof require !== 'undefined') {
      // Node.js 环境
      const crypto = require('node:crypto')
      return new Uint8Array(crypto.randomBytes(length))
    }
    else {
      throw new TypeError('无法获取安全随机数生成器')
    }
  }

  static generateString(length: number, charset?: string): string {
    const defaultCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const chars = charset || defaultCharset
    const bytes = this.generateBytes(length)

    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length]
    }

    return result
  }
}
```

## 数据保护

### 敏感数据处理

```typescript
// 敏感数据包装器
class SensitiveData {
  private data: string
  private isCleared: boolean = false

  constructor(data: string) {
    this.data = data
  }

  // 获取数据（仅一次）
  consume(): string {
    if (this.isCleared) {
      throw new Error('敏感数据已被清除')
    }

    const result = this.data
    this.clear()
    return result
  }

  // 安全地清除数据
  clear(): void {
    if (!this.isCleared) {
      // 用随机数据覆盖原始数据
      this.data = SecureRandom.generateString(this.data.length)
      this.data = ''
      this.isCleared = true
    }
  }

  // 检查是否已清除
  isDestroyed(): boolean {
    return this.isCleared
  }

  // 析构函数
  destroy(): void {
    this.clear()
  }
}

// 使用示例
const sensitivePassword = new SensitiveData('user-password')
const password = sensitivePassword.consume() // 只能调用一次
// sensitivePassword.consume() // 会抛出错误

// 自动清理
setTimeout(() => {
  sensitivePassword.destroy()
}, 5000) // 5秒后自动清理
```

### 内存安全

```typescript
// 安全的内存管理
class SecureMemoryManager {
  private allocatedBuffers: Set<ArrayBuffer> = new Set()

  allocate(size: number): ArrayBuffer {
    const buffer = new ArrayBuffer(size)
    this.allocatedBuffers.add(buffer)
    return buffer
  }

  // 安全清除缓冲区
  secureWipe(buffer: ArrayBuffer): void {
    const view = new Uint8Array(buffer)

    // 多次覆盖以确保数据无法恢复
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.floor(Math.random() * 256)
      }
    }

    // 最后用零填充
    view.fill(0)

    this.allocatedBuffers.delete(buffer)
  }

  // 清除所有分配的缓冲区
  clearAll(): void {
    for (const buffer of this.allocatedBuffers) {
      this.secureWipe(buffer)
    }
  }

  // 获取分配的缓冲区数量
  getAllocatedCount(): number {
    return this.allocatedBuffers.size
  }
}

const memoryManager = new SecureMemoryManager()

// 在应用退出时清理内存
window.addEventListener('beforeunload', () => {
  memoryManager.clearAll()
})
```

## 时间攻击防护

### 常数时间比较

```typescript
// 防止时间攻击的安全比较
class SecureComparison {
  // 常数时间字符串比较
  static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  // 常数时间字节数组比较
  static constantTimeEqualsBytes(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a[i] ^ b[i]
    }

    return result === 0
  }

  // 安全的哈希验证
  static verifyHash(data: string, expectedHash: string, algorithm = 'SHA256'): boolean {
    const computedHash = hash[algorithm.toLowerCase()](data)
    return this.constantTimeEquals(computedHash, expectedHash)
  }

  // 安全的 HMAC 验证
  static verifyHMAC(
    data: string,
    key: string,
    expectedHmac: string,
    algorithm = 'SHA256'
  ): boolean {
    const computedHmac = hmac[algorithm.toLowerCase()](data, key)
    return this.constantTimeEquals(computedHmac, expectedHmac)
  }
}

// 使用示例
const isValid = SecureComparison.verifyHash('data', 'expected-hash')
```

## 侧信道攻击防护

### 缓存时间攻击防护

```typescript
// 防护缓存时间攻击
class CacheTimingProtection {
  private static readonly DUMMY_OPERATIONS = 1000

  // 添加随机延迟
  static async addRandomDelay(minMs = 10, maxMs = 50): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  // 执行虚假操作以混淆时间
  static performDummyOperations(): void {
    let dummy = 0
    for (let i = 0; i < this.DUMMY_OPERATIONS; i++) {
      dummy += Math.random()
    }
    // 确保操作不被优化掉
    if (dummy < 0)
      console.log(dummy)
  }

  // 安全的密钥验证
  static async secureKeyVerification(inputKey: string, correctKey: string): Promise<boolean> {
    const startTime = performance.now()

    // 始终执行完整的比较操作
    const isValid = SecureComparison.constantTimeEquals(inputKey, correctKey)

    // 执行虚假操作
    this.performDummyOperations()

    // 添加随机延迟
    await this.addRandomDelay()

    const endTime = performance.now()
    const duration = endTime - startTime

    // 记录时间（用于监控异常）
    if (duration > 100) {
      console.warn('密钥验证时间异常:', duration)
    }

    return isValid
  }
}
```

## 错误处理安全

### 安全的错误信息

```typescript
// 安全的错误处理
class SecureErrorHandler {
  private static readonly GENERIC_ERROR = '操作失败，请重试'

  // 过滤敏感信息的错误处理
  static handleCryptoError(error: Error, context: string): Error {
    // 记录详细错误（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error(`[${context}] 详细错误:`, error)
    }

    // 生产环境返回通用错误信息
    if (process.env.NODE_ENV === 'production') {
      return new Error(this.GENERIC_ERROR)
    }

    // 过滤可能包含敏感信息的错误消息
    const sensitivePatterns = [/key/i, /password/i, /secret/i, /token/i, /credential/i]

    const message = error.message
    for (const pattern of sensitivePatterns) {
      if (pattern.test(message)) {
        return new Error(this.GENERIC_ERROR)
      }
    }

    return error
  }

  // 安全的加密操作包装
  static async secureOperation<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<{ success: boolean, data?: T, error?: string }> {
    try {
      const data = await operation()
      return { success: true, data }
    }
    catch (error) {
      const safeError = this.handleCryptoError(error as Error, context)
      return { success: false, error: safeError.message }
    }
  }
}

// 使用示例
const result = await SecureErrorHandler.secureOperation(() => encrypt.aes('data', 'key'), 'AES加密')

if (!result.success) {
  console.error('加密失败:', result.error)
}
```

## 审计和监控

### 安全事件记录

```typescript
// 安全审计日志
class SecurityAuditLogger {
  private logs: any[] = []
  private maxLogs: number

  constructor(maxLogs = 10000) {
    this.maxLogs = maxLogs
  }

  // 记录安全事件
  logSecurityEvent(event: {
    type: 'encryption' | 'decryption' | 'key_generation' | 'authentication'
    success: boolean
    algorithm?: string
    keySize?: number
    timestamp?: number
    userId?: string
    ipAddress?: string
    userAgent?: string
  }): void {
    const logEntry = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      id: this.generateLogId(),
    }

    this.logs.push(logEntry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 检测异常模式
    this.detectAnomalies(logEntry)
  }

  private generateLogId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 检测异常模式
  private detectAnomalies(newEvent: any): void {
    const recentEvents = this.logs.slice(-100) // 最近100个事件

    // 检测频繁失败
    const recentFailures = recentEvents.filter(e => !e.success).length
    if (recentFailures > 10) {
      console.warn('检测到频繁的加密操作失败')
    }

    // 检测异常时间模式
    const now = Date.now()
    const recentInMinute = recentEvents.filter(e => now - e.timestamp < 60000).length
    if (recentInMinute > 100) {
      console.warn('检测到异常高频的加密操作')
    }
  }

  // 获取安全统计
  getSecurityStats(timeRange = 24 * 60 * 60 * 1000): any {
    const cutoff = Date.now() - timeRange
    const recentLogs = this.logs.filter(log => log.timestamp > cutoff)

    return {
      totalOperations: recentLogs.length,
      successfulOperations: recentLogs.filter(log => log.success).length,
      failedOperations: recentLogs.filter(log => !log.success).length,
      algorithmUsage: this.getAlgorithmStats(recentLogs),
      timeRange,
    }
  }

  private getAlgorithmStats(logs: any[]): Record<string, number> {
    const stats: Record<string, number> = {}

    for (const log of logs) {
      if (log.algorithm) {
        stats[log.algorithm] = (stats[log.algorithm] || 0) + 1
      }
    }

    return stats
  }

  // 导出日志（用于外部分析）
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2)
    }
    else {
      // CSV 格式
      const headers = ['id', 'type', 'success', 'algorithm', 'timestamp']
      const csvLines = [headers.join(',')]

      for (const log of this.logs) {
        const values = headers.map(header => log[header] || '')
        csvLines.push(values.join(','))
      }

      return csvLines.join('\n')
    }
  }
}

// 全局审计实例
const securityAudit = new SecurityAuditLogger()

// 在加密操作中使用
function auditedEncrypt(data: string, key: string) {
  try {
    const result = encrypt.aes(data, key)

    securityAudit.logSecurityEvent({
      type: 'encryption',
      success: true,
      algorithm: 'AES-256',
      keySize: 256,
    })

    return result
  }
  catch (error) {
    securityAudit.logSecurityEvent({
      type: 'encryption',
      success: false,
      algorithm: 'AES-256',
    })

    throw error
  }
}
```

遵循这些安全最佳实践，可以确保您的应用程序在使用 @ldesign/crypto 时保持高度的安全性。
