# 安全性指南

本指南介绍使用 @ldesign/crypto 时的安全最佳实践。

## 核心安全原则

### 永远不要硬编码密钥

```typescript
// 错误示例 - 硬编码密钥
const SECRET_KEY = 'my-secret-key' // 危险！
const encrypted = aes.encrypt('data', SECRET_KEY)

// 正确示例 - 从环境变量读取
const key = import.meta.env.VITE_ENCRYPTION_KEY
// 或从安全存储读取
const key = await getKeyFromSecureStorage()
```

### 使用强密钥

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成强随机密钥
const strongKey = RandomUtils.generateKey(32) // 256位

// 避免弱密钥
// const weakKey = '12345' // 不安全！
// const weakKey = 'password' // 不安全！
```

### 密钥轮换

```typescript
import { KeyRotationManager } from '@ldesign/crypto'

// 定期轮换密钥
const rotationManager = new KeyRotationManager({
 rotationInterval: 30 * 24 * 60 * 60 * 1000 // 30天
})

// 轮换密钥
const newKey = await rotationManager.rotateKey('old-key')
```

## 算法选择

### 推荐的算法

```typescript
// 对称加密：AES-256
const encrypted = aes.encrypt('data', 'key', {
 keySize: 256,  // 推荐
 mode: 'CBC'     // 或 CTR、GCM
})

// 非对称加密：RSA-2048+
const keyPair = rsa.generateKeyPair(2048) // 最小2048位

// 哈希：SHA-256+
const hash = hash.sha256('data') // 或 SHA-512

// 数字签名：RSA-SHA256
const signature = digitalSignature.sign('data', privateKey, 'SHA256')
```

### 避免的算法

```typescript
// 不推荐用于生产环境

// DES（已不安全）
// const encrypted = des.encrypt('data', 'key') // 避免

// MD5（已不安全）
// const hash = hash.md5('data') // 避免

// SHA1（已不安全）
// const hash = hash.sha1('data') // 避免

// ECB模式（不安全）
// const encrypted = aes.encrypt('data', 'key', { mode: 'ECB' }) // 避免
```

## IV 和 盐值管理

### IV（初始化向量）

```typescript
import { aes, RandomUtils } from '@ldesign/crypto'

// 每次加密使用新的随机IV
const iv = RandomUtils.generateIV(16)

const encrypted = aes.encrypt('data', 'key', {
 keySize: 256,
 mode: 'CBC',
 iv // 使用随机IV
})

// 错误：重复使用相同的IV
// const FIXED_IV = 'fixed-iv-12345' // 危险！
// const encrypted = aes.encrypt('data', 'key', { iv: FIXED_IV })
```

### 盐值（Salt）

```typescript
import { generateSalt, deriveKey } from '@ldesign/crypto'

// 为每个用户生成唯一盐值
const salt = generateSalt(16)

// 使用盐值派生密钥
const derivedKey = deriveKey('user-password', salt, {
 iterations: 100000,
 keyLength: 32,
 digest: 'SHA256'
})

// 存储盐值（盐值可以公开）
localStorage.setItem('salt', salt)
```

## 密钥管理

### 安全存储密钥

```typescript
import { SecureStorage } from '@ldesign/crypto'

// 使用加密存储
const storage = new SecureStorage({
 key: 'master-key', // 主密钥（从安全渠道获取）
 prefix: 'secure_'
})

// 存储敏感密钥
storage.set('encryption-key', encryptionKey, 24 * 60 * 60 * 1000) // 24小时

// 读取密钥
const key = storage.get('encryption-key')
```

### 密钥派生

```typescript
import { deriveKey } from '@ldesign/crypto'

// 从用户密码派生加密密钥
function deriveUserKey(password: string, salt: string): string {
 return deriveKey(password, salt, {
  iterations: 100000, // 足够多的迭代次数
  keyLength: 32,      // 256位密钥
  digest: 'SHA256'     // 使用SHA256
 }).key
}

// 使用派生密钥
const userKey = deriveUserKey('user-password', userSalt)
const encrypted = aes.encrypt('sensitive-data', userKey)
```

### 密钥分离

```typescript
// 分离加密密钥和MAC密钥
const encryptionKey = RandomUtils.generateKey(32)
const macKey = RandomUtils.generateKey(32)

// 使用认证加密
import { encryptWithAuth } from '@ldesign/crypto'

const encrypted = encryptWithAuth('data', encryptionKey, macKey)
```

## 数据完整性

### 使用 HMAC

```typescript
import { hmac } from '@ldesign/crypto'

// 生成数据的HMAC
const data = 'important data'
const mac = hmac.sha256(data, 'secret-key')

// 传输数据和MAC
const package = {
 data,
 mac
}

// 验证数据完整性
const isValid = hmac.verify(
 package.data,
 'secret-key',
 package.mac,
 'SHA256'
)

if (!isValid) {
 throw new Error('Data has been tampered with')
}
```

### 认证加密（AEAD）

```typescript
import { encryptWithAuth, decryptWithAuth } from '@ldesign/crypto'

// 加密并生成认证标签
const encrypted = encryptWithAuth(
 'sensitive data',
 'encryption-key',
 'mac-key'
)

// 解密并验证
const decrypted = decryptWithAuth(
 encrypted,
 'encryption-key',
 'mac-key'
)

if (!decrypted.verified) {
 throw new Error('Authentication failed')
}
```

## 密码安全

### 密码哈希

```typescript
import { hash } from '@ldesign/crypto'

// 存储密码时使用盐值
function hashPassword(password: string, salt: string): string {
 // 组合密码和盐值
 const combined = password + salt

 // 多次哈希增强安全性
 return hash.sha256(hash.sha256(combined))
}

// 验证密码
function verifyPassword(
 password: string,
 salt: string,
 storedHash: string
): boolean {
 const hash = hashPassword(password, salt)
 return hash === storedHash
}
```

### 密码强度验证

```typescript
import { PasswordStrength } from '@ldesign/crypto'

function validatePassword(password: string): boolean {
 const strength = PasswordStrength.analyze(password)

 if (strength.score < 3) {
  console.error('密码强度不足:', strength.feedback)
  return false
 }

 return true
}
```

## 时间攻击防护

### 常数时间比较

```typescript
import { hash } from '@ldesign/crypto'

// 验证哈希时使用常数时间比较
const isValid = hash.verify(
 data,
 expectedHash,
 'SHA256'
)

// 避免：使用 === 比较（易受时间攻击）
// const isValid = (hash.sha256(data) === expectedHash) // 不安全
```

## 防护措施

### 防止重放攻击

```typescript
// 使用时间戳和nonce
interface SecureMessage {
 data: string
 timestamp: number
 nonce: string
 signature: string
}

function createSecureMessage(
 data: string,
 privateKey: string
): SecureMessage {
 const timestamp = Date.now()
 const nonce = RandomUtils.generateKey(16)

 const payload = `${data}|${timestamp}|${nonce}`
 const signature = digitalSignature.sign(payload, privateKey, 'SHA256')

 return { data, timestamp, nonce, signature }
}

function verifySecureMessage(
 message: SecureMessage,
 publicKey: string,
 maxAge: number = 300000 // 5分钟
): boolean {
 // 检查时间戳
 if (Date.now() - message.timestamp > maxAge) {
  return false
 }

 // 验证签名
 const payload = `${message.data}|${message.timestamp}|${message.nonce}`
 return digitalSignature.verify(
  payload,
  message.signature,
  publicKey,
  'SHA256'
 )
}
```

### 防止侧信道攻击

```typescript
// 使用固定时间操作
function secureCompare(a: string, b: string): boolean {
 if (a.length !== b.length) {
  return false
 }

 let result = 0
 for (let i = 0; i < a.length; i++) {
  result |= a.charCodeAt(i) ^ b.charCodeAt(i)
 }

 return result === 0
}
```

## 错误处理

### 不泄露敏感信息

```typescript
// 错误示例：泄露详细错误
try {
 const decrypted = aes.decrypt(encrypted, 'wrong-key')
} catch (error) {
 // 不要直接显示给用户
 alert(error.message) // 可能泄露信息
}

// 正确示例：通用错误消息
try {
 const decrypted = aes.decrypt(encrypted, userKey)

 if (!decrypted.success) {
  // 给用户显示通用消息
  showError('操作失败，请重试')

  // 详细错误记录到日志
  logger.error('Decryption failed', {
   error: decrypted.error,
   timestamp: Date.now()
  })
 }
} catch (error) {
 showError('系统错误')
 logger.error('Unexpected error', error)
}
```

## 安全传输

### 端到端加密

```typescript
// 发送方
import { aes, rsa, RandomUtils } from '@ldesign/crypto'

// 1. 生成会话密钥
const sessionKey = RandomUtils.generateKey(32)

// 2. 使用会话密钥加密数据
const encryptedData = aes.encrypt(data, sessionKey)

// 3. 使用接收方公钥加密会话密钥
const encryptedKey = rsa.encrypt(sessionKey, receiverPublicKey)

// 4. 发送
send({
 encryptedData,
 encryptedKey
})

// 接收方
// 1. 使用私钥解密会话密钥
const decryptedKeyResult = rsa.decrypt(encryptedKey, receiverPrivateKey)
const sessionKey = decryptedKeyResult.data

// 2. 使用会话密钥解密数据
const decryptedData = aes.decrypt(encryptedData, sessionKey)
```

### TLS/HTTPS

```typescript
// 确保使用HTTPS传输
const API_URL = 'https://api.example.com' // 使用HTTPS

// 验证证书
fetch(API_URL, {
 // 不要禁用证书验证
 // rejectUnauthorized: false // 危险！
})
```

## 审计和日志

### 安全日志

```typescript
interface SecurityLog {
 timestamp: number
 operation: string
 userId?: string
 success: boolean
 details?: any
}

class SecurityLogger {
 private logs: SecurityLog[] = []

 log(operation: string, success: boolean, details?: any) {
  this.logs.push({
   timestamp: Date.now(),
   operation,
   success,
   details
  })

  // 异常操作告警
  if (!success) {
   this.alert(operation, details)
  }
 }

 private alert(operation: string, details: any) {
  console.warn(`Security Alert: ${operation} failed`, details)
  // 发送告警到监控系统
 }
}

// 使用
const logger = new SecurityLogger()

try {
 const result = aes.encrypt('data', 'key')
 logger.log('encrypt', result.success)
} catch (error) {
 logger.log('encrypt', false, { error: error.message })
}
```

## 合规性

### GDPR 合规

```typescript
// 用户数据加密
import { aes } from '@ldesign/crypto'

class GDPRCompliantStorage {
 private storage: SecureStorage

 constructor(userConsent: boolean) {
  if (!userConsent) {
   throw new Error('User consent required')
  }

  this.storage = new SecureStorage({
   key: 'gdpr-key',
   ttl: 30 * 24 * 60 * 60 * 1000 // 30天后自动删除
  })
 }

 // 存储个人数据
 storePersonalData(userId: string, data: any) {
  const encrypted = this.storage.set(`user_${userId}`, data)
  this.logDataProcessing(userId, 'store')
  return encrypted
 }

 // 删除用户数据（被遗忘权）
 deleteUserData(userId: string) {
  this.storage.remove(`user_${userId}`)
  this.logDataProcessing(userId, 'delete')
 }

 private logDataProcessing(userId: string, action: string) {
  // 记录数据处理活动
  console.log(`GDPR Log: ${action} data for user ${userId}`)
 }
}
```

## 安全检查清单

在生产环境部署前，检查以下事项：

- [ ] 密钥存储在安全位置（环境变量/密钥管理服务）
- [ ] 使用推荐的算法和密钥长度
- [ ] 每次加密使用新的随机 IV
- [ ] 实施密钥轮换策略
- [ ] 使用 HMAC 或 AEAD 保证数据完整性
- [ ] 密码使用盐值哈希
- [ ] 错误处理不泄露敏感信息
- [ ] 实施防重放攻击机制
- [ ] 启用安全日志和审计
- [ ] 定期安全审计和渗透测试
- [ ] 遵守相关合规要求

## 安全资源

### 推荐阅读

- OWASP Cryptographic Storage Cheat Sheet
- NIST Cryptographic Standards
- RFC 8439 (ChaCha20-Poly1305)
- RFC 5869 (HKDF)

### 工具

- 在线密钥生成器（仅用于测试）
- 密码强度检查器
- 证书验证工具

## 下一步

- [配置指南](/guide/configuration) - 安全配置
- [部署指南](/guide/deployment) - 生产环境安全
- [故障排查](/guide/troubleshooting) - 安全问题排查
