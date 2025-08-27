# 安全最佳实践

本指南介绍使用 @ldesign/crypto 时的安全最佳实践，帮助您构建安全可靠的应用程序。

## 1. 密钥管理

### 密钥生成

**✅ 推荐做法：**

```typescript
import { keyGenerator, RandomUtils } from '@ldesign/crypto'

// 使用加密安全的随机数生成器
const strongKey = keyGenerator.generateKey(32) // 256位密钥
const salt = RandomUtils.generateRandomBytes(32)
const iv = keyGenerator.generateIV(16)
```

**❌ 避免做法：**

```typescript
// 不要使用弱密钥
const weakKey = '123456'
const predictableKey = 'password'

// 不要使用 Math.random()
const insecureRandom = Math.random().toString(36)
```

### 密钥存储

**✅ 推荐做法：**

```typescript
// 使用环境变量
const masterKey = process.env.CRYPTO_MASTER_KEY

// 使用密钥管理服务（如 AWS KMS、Azure Key Vault）
class KeyManager {
  async getKey(keyId: string): Promise<string> {
    // 从安全的密钥管理服务获取密钥
    return await keyManagementService.getKey(keyId)
  }
}

// 密钥轮换
class KeyRotation {
  private currentKeyVersion = 1

  async rotateKey(): Promise<void> {
    const newKey = keyGenerator.generateKey(32)
    await this.storeKey(`key_v${this.currentKeyVersion + 1}`, newKey)
    this.currentKeyVersion++
  }
}
```

**❌ 避免做法：**

```typescript
// 不要硬编码密钥
const hardcodedKey = 'my-secret-key-123'

// 不要在客户端存储主密钥
localStorage.setItem('masterKey', key)

// 不要在代码中明文存储密钥
const config = {
  apiKey: 'sk-1234567890abcdef',
  secretKey: 'super-secret-key',
}
```

### 密钥派生

**✅ 推荐做法：**

```typescript
import { hash, RandomUtils } from '@ldesign/crypto'

class KeyDerivation {
  // 使用 PBKDF2 或类似的密钥派生函数
  deriveKey(password: string, salt: string, iterations: number = 100000): string {
    let derived = password + salt

    for (let i = 0; i < iterations; i++) {
      derived = hash.sha256(derived)
    }

    return derived
  }

  // 为不同用途派生不同的密钥
  deriveKeys(
    masterKey: string,
    purpose: string
  ): {
      encryptionKey: string
      authKey: string
    } {
    const encryptionKey = hash.sha256(`${masterKey + purpose}encryption`)
    const authKey = hash.sha256(`${masterKey + purpose}authentication`)

    return { encryptionKey, authKey }
  }
}
```

## 2. 算法选择

### 对称加密

**✅ 推荐算法：**

```typescript
// AES-256-GCM（推荐）
const encrypted = aes.encrypt(data, key, {
  keySize: 256,
  mode: 'GCM', // 提供认证加密
})

// AES-256-CBC（备选）
const encrypted = aes.encrypt(data, key, {
  keySize: 256,
  mode: 'CBC',
  iv: keyGenerator.generateIV(16), // 每次使用不同的IV
})
```

**❌ 避免算法：**

```typescript
// 不要使用弱算法
const encrypted = des.encrypt(data, key) // DES 已被破解
const encrypted = aes.encrypt(data, key, { keySize: 128 }) // AES-128 相对较弱

// 不要使用 ECB 模式
const encrypted = aes.encrypt(data, key, { mode: 'ECB' }) // 不安全
```

### 非对称加密

**✅ 推荐做法：**

```typescript
// 使用足够长的密钥
const keyPair = keyGenerator.generateRSAKeyPair(2048) // 最小2048位
const keyPair = keyGenerator.generateRSAKeyPair(4096) // 更安全

// 使用安全的填充方式
const encrypted = rsa.encrypt(data, publicKey, {
  padding: 'OAEP', // 推荐
})
```

### 哈希算法

**✅ 推荐算法：**

```typescript
// 使用强哈希算法
const hash256 = hash.sha256(data)
const hash384 = hash.sha384(data)
const hash512 = hash.sha512(data)

// 使用 HMAC 进行消息认证
const hmacValue = hmac.sha256(message, secretKey)
```

**❌ 避免算法：**

```typescript
// 不要使用弱哈希算法
const md5Hash = hash.md5(data) // MD5 已被破解
const sha1Hash = hash.sha1(data) // SHA-1 已被破解
```

## 3. 数据处理

### 输入验证

**✅ 推荐做法：**

```typescript
import { ValidationUtils } from '@ldesign/crypto'

class SecureDataProcessor {
  validateInput(data: any): string {
    // 类型检查
    if (typeof data !== 'string') {
      throw new TypeError('输入必须是字符串')
    }

    // 长度检查
    if (data.length === 0) {
      throw new Error('输入不能为空')
    }

    if (data.length > 1024 * 1024) {
      // 1MB限制
      throw new Error('输入数据过大')
    }

    // 格式验证
    if (!ValidationUtils.isValidUTF8(data)) {
      throw new Error('输入包含无效字符')
    }

    return data
  }

  sanitizeKey(key: string): string {
    // 密钥长度验证
    if (!ValidationUtils.validateAESKeyLength(key, 256)) {
      throw new Error('密钥长度不符合要求')
    }

    return key
  }
}
```

### 敏感数据清理

**✅ 推荐做法：**

```typescript
class SecureMemoryManager {
  private sensitiveData: Map<string, string> = new Map()

  storeSensitiveData(id: string, data: string): void {
    this.sensitiveData.set(id, data)

    // 设置自动清理
    setTimeout(() => {
      this.clearSensitiveData(id)
    }, 300000) // 5分钟后清理
  }

  clearSensitiveData(id: string): void {
    const data = this.sensitiveData.get(id)
    if (data) {
      // 覆盖内存中的敏感数据
      const cleared = 'x'.repeat(data.length)
      this.sensitiveData.set(id, cleared)
      this.sensitiveData.delete(id)
    }
  }

  clearAllSensitiveData(): void {
    for (const [id] of this.sensitiveData) {
      this.clearSensitiveData(id)
    }
  }
}

// 在页面卸载时清理敏感数据
window.addEventListener('beforeunload', () => {
  secureMemoryManager.clearAllSensitiveData()
})
```

## 4. 传输安全

### HTTPS 强制

**✅ 推荐做法：**

```typescript
class SecureTransport {
  checkSecureConnection(): void {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error('必须使用 HTTPS 连接')
    }
  }

  async sendEncryptedData(data: any, endpoint: string): Promise<Response> {
    this.checkSecureConnection()

    // 端到端加密
    const encryptedData = this.encryptForTransport(data)

    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Encrypted': 'true',
      },
      body: JSON.stringify(encryptedData),
    })
  }

  private encryptForTransport(data: any): any {
    // 使用临时密钥进行传输加密
    const transportKey = keyGenerator.generateKey(32)
    const encrypted = aes.encrypt(JSON.stringify(data), transportKey)

    // 使用服务器公钥加密传输密钥
    const encryptedKey = rsa.encrypt(transportKey, this.serverPublicKey)

    return {
      data: encrypted.data,
      key: encryptedKey,
      iv: encrypted.iv,
    }
  }
}
```

### 请求签名

**✅ 推荐做法：**

```typescript
class RequestSigner {
  signRequest(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    nonce: string,
    secretKey: string
  ): string {
    // 构建签名字符串
    const signatureString = [method.toUpperCase(), url, body, timestamp.toString(), nonce].join(
      '\n'
    )

    // 生成 HMAC 签名
    return hmac.sha256(signatureString, secretKey)
  }

  verifyRequest(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    nonce: string,
    signature: string,
    secretKey: string
  ): boolean {
    // 检查时间戳（防重放攻击）
    const now = Date.now()
    if (Math.abs(now - timestamp) > 300000) {
      // 5分钟窗口
      return false
    }

    // 检查 nonce（防重复请求）
    if (this.isNonceUsed(nonce)) {
      return false
    }

    // 验证签名
    const expectedSignature = this.signRequest(method, url, body, timestamp, nonce, secretKey)
    return StringUtils.secureCompare(signature, expectedSignature)
  }

  private isNonceUsed(nonce: string): boolean {
    // 实现 nonce 检查逻辑
    return this.usedNonces.has(nonce)
  }
}
```

## 5. 错误处理

### 安全的错误处理

**✅ 推荐做法：**

```typescript
class SecureErrorHandler {
  handleCryptoError(error: Error, operation: string): never {
    // 记录详细错误（仅在服务端）
    if (typeof window === 'undefined') {
      console.error(`Crypto operation failed: ${operation}`, {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      })
    }

    // 向用户返回通用错误消息
    throw new Error('操作失败，请稍后重试')
  }

  validateAndProcess(data: string, key: string): string {
    try {
      this.validateInput(data, key)
      return aes.encrypt(data, key).data!
    }
    catch (error) {
      // 不要在错误消息中暴露敏感信息
      if (error.message.includes('key')) {
        throw new Error('认证失败')
      }
      else {
        throw new Error('处理失败')
      }
    }
  }
}
```

**❌ 避免做法：**

```typescript
// 不要暴露敏感信息
try {
  const result = aes.decrypt(data, secretKey)
}
catch (error) {
  // 错误：暴露了密钥信息
  throw new Error(`解密失败，使用的密钥是: ${secretKey}`)
}
```

## 6. 审计和监控

### 操作日志

**✅ 推荐做法：**

```typescript
class CryptoAuditor {
  private auditLog: Array<{
    operation: string
    timestamp: number
    userId?: string
    success: boolean
    dataSize: number
  }> = []

  logOperation(operation: string, success: boolean, dataSize: number, userId?: string): void {
    this.auditLog.push({
      operation,
      timestamp: Date.now(),
      userId,
      success,
      dataSize,
    })

    // 定期清理旧日志
    this.cleanupOldLogs()
  }

  private cleanupOldLogs(): void {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    this.auditLog = this.auditLog.filter(log => log.timestamp > oneWeekAgo)
  }

  getSecurityReport(): any {
    return {
      totalOperations: this.auditLog.length,
      failureRate: this.calculateFailureRate(),
      suspiciousActivity: this.detectSuspiciousActivity(),
    }
  }

  private detectSuspiciousActivity(): any[] {
    // 检测异常模式
    const suspicious = []

    // 检测频繁失败
    const recentFailures = this.auditLog.filter(
      log => !log.success && Date.now() - log.timestamp < 3600000
    ).length

    if (recentFailures > 10) {
      suspicious.push({
        type: 'frequent_failures',
        count: recentFailures,
      })
    }

    return suspicious
  }
}
```

## 7. 合规性考虑

### 数据保护法规

**GDPR 合规：**

```typescript
class GDPRCompliantCrypto {
  // 实现数据主体权利
  async deleteUserData(userId: string): Promise<void> {
    // 删除用户的所有加密数据
    await this.deleteEncryptedData(userId)

    // 删除相关的密钥
    await this.deleteUserKeys(userId)

    // 记录删除操作
    this.auditLogger.log('data_deletion', userId)
  }

  // 数据可移植性
  async exportUserData(userId: string): Promise<any> {
    const encryptedData = await this.getUserEncryptedData(userId)

    // 解密用户数据用于导出
    const decryptedData = this.decryptUserData(encryptedData, userId)

    return {
      userId,
      data: decryptedData,
      exportDate: new Date().toISOString(),
    }
  }
}
```

### 行业标准

**PCI DSS 合规（支付卡行业）：**

```typescript
class PCICompliantCrypto {
  // 强加密要求
  encryptCardData(cardNumber: string): string {
    // 使用 AES-256 加密
    return aes.encrypt(cardNumber, this.getCardDataKey(), {
      keySize: 256,
      mode: 'GCM',
    }).data!
  }

  // 密钥管理要求
  private getCardDataKey(): string {
    // 从安全的密钥管理系统获取
    return this.keyManager.getKey('card_data_encryption')
  }

  // 访问控制
  validateAccess(userId: string, operation: string): boolean {
    return this.accessControl.hasPermission(userId, operation)
  }
}
```

## 8. 测试安全性

### 安全测试

```typescript
describe('Security Tests', () => {
  test('should not leak sensitive data in errors', () => {
    const sensitiveKey = 'super-secret-key'

    expect(() => {
      aes.encrypt('data', null as any)
    }).toThrow()

    // 确保错误消息不包含敏感信息
    try {
      aes.encrypt('data', null as any)
    }
    catch (error) {
      expect(error.message).not.toContain(sensitiveKey)
    }
  })

  test('should use different IVs for each encryption', () => {
    const data = 'test data'
    const key = 'test key'

    const encrypted1 = aes.encrypt(data, key, { mode: 'CBC' })
    const encrypted2 = aes.encrypt(data, key, { mode: 'CBC' })

    expect(encrypted1.iv).not.toBe(encrypted2.iv)
  })

  test('should securely compare strings', () => {
    const hash1 = hash.sha256('password')
    const hash2 = hash.sha256('password')
    const hash3 = hash.sha256('different')

    expect(StringUtils.secureCompare(hash1, hash2)).toBe(true)
    expect(StringUtils.secureCompare(hash1, hash3)).toBe(false)
  })
})
```

## 总结

遵循这些安全最佳实践可以显著提高您应用程序的安全性：

1. **密钥管理**：使用强密钥，安全存储，定期轮换
2. **算法选择**：使用现代、安全的加密算法
3. **数据处理**：验证输入，及时清理敏感数据
4. **传输安全**：使用 HTTPS，实现端到端加密
5. **错误处理**：不暴露敏感信息
6. **审计监控**：记录操作，检测异常
7. **合规性**：遵循相关法规和标准
8. **安全测试**：定期进行安全测试

记住，安全是一个持续的过程，需要定期审查和更新您的安全实践。
