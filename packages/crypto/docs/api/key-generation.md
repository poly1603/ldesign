# 密钥生成 API

本页面详细介绍了 @ldesign/crypto 的密钥生成和随机数生成 API。

## keyGenerator 模块

### keyGenerator.generateKey()

生成随机密钥。

```typescript
function generateKey(length?: number): string
```

**参数：**

- `length` (number, 可选): 密钥长度（字节），默认 32（256 位）

**返回值：**

- `string`: 十六进制格式的随机密钥

**示例：**

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成 256位（32字节）密钥
const key256 = keyGenerator.generateKey()
console.log('256位密钥:', key256)

// 生成 128位（16字节）密钥
const key128 = keyGenerator.generateKey(16)
console.log('128位密钥:', key128)

// 生成 192位（24字节）密钥
const key192 = keyGenerator.generateKey(24)
console.log('192位密钥:', key192)
```

### keyGenerator.generateSalt()

生成随机盐值。

```typescript
function generateSalt(length?: number): string
```

**参数：**

- `length` (number, 可选): 盐值长度（字节），默认 16

**返回值：**

- `string`: 十六进制格式的随机盐值

**示例：**

```typescript
// 生成 16字节盐值
const salt = keyGenerator.generateSalt()
console.log('盐值:', salt)

// 生成 32字节盐值
const longSalt = keyGenerator.generateSalt(32)
console.log('长盐值:', longSalt)
```

### keyGenerator.generateIV()

生成初始化向量（IV）。

```typescript
function generateIV(length?: number): string
```

**参数：**

- `length` (number, 可选): IV 长度（字节），默认 16

**返回值：**

- `string`: 十六进制格式的随机 IV

**示例：**

```typescript
// 生成 AES 的 IV（16字节）
const iv = keyGenerator.generateIV()
console.log('IV:', iv)

// 生成自定义长度的 IV
const customIV = keyGenerator.generateIV(12) // 96位 IV
console.log('自定义 IV:', customIV)
```

### keyGenerator.generateRSAKeyPair()

生成 RSA 密钥对。

```typescript
function generateRSAKeyPair(keySize?: number, options?: RSAKeyGenerationOptions): RSAKeyPair
```

**参数：**

- `keySize` (number, 可选): 密钥长度（位），默认 2048
- `options` (RSAKeyGenerationOptions, 可选): 密钥生成选项

**返回值：**

- `RSAKeyPair`: RSA 密钥对对象

**示例：**

```typescript
// 生成 2048位 RSA 密钥对
const keyPair = keyGenerator.generateRSAKeyPair()
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 生成 4096位 RSA 密钥对
const strongKeyPair = keyGenerator.generateRSAKeyPair(4096)
console.log('强密钥对已生成')

// 使用自定义选项
const customKeyPair = keyGenerator.generateRSAKeyPair(2048, {
  keyFormat: 'pem',
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
})
```

### keyGenerator.generateRandomBytes()

生成随机字节数组。

```typescript
function generateRandomBytes(length: number): Uint8Array
```

**参数：**

- `length` (number): 字节数组长度

**返回值：**

- `Uint8Array`: 随机字节数组

**示例：**

```typescript
// 生成 32字节随机数据
const randomBytes = keyGenerator.generateRandomBytes(32)
console.log('随机字节:', randomBytes)

// 转换为十六进制字符串
const hexString = Array.from(randomBytes)
  .map(b => b.toString(16).padStart(2, '0'))
  .join('')
console.log('十六进制:', hexString)
```

### keyGenerator.generateRandomString()

生成随机字符串。

```typescript
function generateRandomString(length: number, charset?: string): string
```

**参数：**

- `length` (number): 字符串长度
- `charset` (string, 可选): 字符集，默认为字母数字

**返回值：**

- `string`: 随机字符串

**示例：**

```typescript
// 生成 16位随机字符串
const randomString = keyGenerator.generateRandomString(16)
console.log('随机字符串:', randomString)

// 使用自定义字符集
const customString = keyGenerator.generateRandomString(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
console.log('自定义字符串:', customString)

// 生成密码
const password = keyGenerator.generateRandomString(
  16,
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
)
console.log('随机密码:', password)
```

## 类型定义

### RSAKeyPair

RSA 密钥对接口。

```typescript
interface RSAKeyPair {
  publicKey: string // 公钥（PEM 格式）
  privateKey: string // 私钥（PEM 格式）
  keySize: number // 密钥长度（位）
  format: string // 密钥格式
}
```

### RSAKeyGenerationOptions

RSA 密钥生成选项。

```typescript
interface RSAKeyGenerationOptions {
  keyFormat?: 'pem' | 'der' // 密钥格式
  publicKeyEncoding?: {
    type: 'spki' | 'pkcs1' // 公钥编码类型
    format: 'pem' | 'der' // 公钥格式
  }
  privateKeyEncoding?: {
    type: 'pkcs8' | 'pkcs1' // 私钥编码类型
    format: 'pem' | 'der' // 私钥格式
    cipher?: string // 私钥加密算法
    passphrase?: string // 私钥密码
  }
}
```

## 高级用法

### 密钥派生

```typescript
// 从密码派生密钥
function deriveKeyFromPassword(password: string, salt: string, keyLength: number = 32): string {
  return hash.pbkdf2(password, salt, {
    iterations: 100000,
    keyLength,
    hashAlgorithm: 'SHA256',
  })
}

// 使用示例
const password = 'user-password'
const salt = keyGenerator.generateSalt(16)
const derivedKey = deriveKeyFromPassword(password, salt)
console.log('派生密钥:', derivedKey)
```

### 密钥强度验证

```typescript
// 验证密钥强度
function validateKeyStrength(key: string): {
  valid: boolean
  strength: 'weak' | 'medium' | 'strong'
  issues: string[]
} {
  const issues: string[] = []
  let strength: 'weak' | 'medium' | 'strong' = 'weak'

  // 检查长度
  if (key.length < 16) {
    issues.push('密钥长度不足（建议至少16字符）')
  }
  else if (key.length >= 32) {
    strength = 'strong'
  }
  else if (key.length >= 24) {
    strength = 'medium'
  }

  // 检查字符多样性
  const hasLower = /[a-z]/.test(key)
  const hasUpper = /[A-Z]/.test(key)
  const hasDigit = /\d/.test(key)
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(key)

  const charTypes = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length

  if (charTypes < 2) {
    issues.push('密钥字符类型不够多样化')
    strength = 'weak'
  }

  // 检查重复模式
  if (/(.)\1{2,}/.test(key)) {
    issues.push('密钥包含重复字符')
    strength = 'weak'
  }

  return {
    valid: issues.length === 0,
    strength,
    issues,
  }
}

// 使用示例
const weakKey = '123456'
const strongKey = keyGenerator.generateRandomString(32)

console.log('弱密钥验证:', validateKeyStrength(weakKey))
console.log('强密钥验证:', validateKeyStrength(strongKey))
```

### 密钥管理器

```typescript
class KeyManager {
  private keys: Map<string, string> = new Map()
  private keyMetadata: Map<
    string,
    {
      created: number
      lastUsed: number
      usage: number
    }
  > = new Map()

  // 生成并存储密钥
  generateKey(keyId: string, length: number = 32): string {
    const key = keyGenerator.generateKey(length)
    this.keys.set(keyId, key)
    this.keyMetadata.set(keyId, {
      created: Date.now(),
      lastUsed: Date.now(),
      usage: 0,
    })
    return key
  }

  // 获取密钥
  getKey(keyId: string): string | null {
    const key = this.keys.get(keyId)
    if (key) {
      const metadata = this.keyMetadata.get(keyId)!
      metadata.lastUsed = Date.now()
      metadata.usage++
    }
    return key || null
  }

  // 轮换密钥
  rotateKey(keyId: string, length: number = 32): string {
    const oldKey = this.keys.get(keyId)
    if (oldKey) {
      // 保存旧密钥用于解密旧数据
      this.keys.set(`${keyId}_old_${Date.now()}`, oldKey)
    }

    return this.generateKey(keyId, length)
  }

  // 删除密钥
  deleteKey(keyId: string): boolean {
    const deleted = this.keys.delete(keyId)
    this.keyMetadata.delete(keyId)
    return deleted
  }

  // 清理旧密钥
  cleanupOldKeys(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
    const now = Date.now()
    let cleaned = 0

    for (const [keyId, metadata] of this.keyMetadata.entries()) {
      if (keyId.includes('_old_') && now - metadata.created > maxAge) {
        this.deleteKey(keyId)
        cleaned++
      }
    }

    return cleaned
  }

  // 获取密钥统计
  getKeyStats(): {
    totalKeys: number
    activeKeys: number
    oldKeys: number
    mostUsedKey: string | null
  } {
    const totalKeys = this.keys.size
    const oldKeys = Array.from(this.keys.keys()).filter(k => k.includes('_old_')).length
    const activeKeys = totalKeys - oldKeys

    let mostUsedKey: string | null = null
    let maxUsage = 0

    for (const [keyId, metadata] of this.keyMetadata.entries()) {
      if (!keyId.includes('_old_') && metadata.usage > maxUsage) {
        maxUsage = metadata.usage
        mostUsedKey = keyId
      }
    }

    return {
      totalKeys,
      activeKeys,
      oldKeys,
      mostUsedKey,
    }
  }
}

// 使用示例
const keyManager = new KeyManager()

// 生成密钥
const apiKey = keyManager.generateKey('api-key')
const dbKey = keyManager.generateKey('database-key', 64)

// 使用密钥
const retrievedKey = keyManager.getKey('api-key')

// 轮换密钥
const newApiKey = keyManager.rotateKey('api-key')

// 获取统计信息
const stats = keyManager.getKeyStats()
console.log('密钥统计:', stats)
```

## 安全随机数生成

### 熵源验证

```typescript
// 检查随机数生成器的可用性
function checkRandomnessAvailability(): {
  available: boolean
  source: string
  quality: 'high' | 'medium' | 'low'
} {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return {
      available: true,
      source: 'Web Crypto API',
      quality: 'high',
    }
  }

  if (typeof require !== 'undefined') {
    try {
      const nodeCrypto = require('node:crypto')
      if (nodeCrypto.randomBytes) {
        return {
          available: true,
          source: 'Node.js crypto',
          quality: 'high',
        }
      }
    }
    catch {
      // Node.js crypto 不可用
    }
  }

  return {
    available: false,
    source: 'none',
    quality: 'low',
  }
}

// 使用示例
const randomnessCheck = checkRandomnessAvailability()
console.log('随机数生成器状态:', randomnessCheck)

if (!randomnessCheck.available) {
  console.warn('⚠️ 安全随机数生成器不可用，密钥安全性可能受影响')
}
```

### 随机数质量测试

```typescript
// 简单的随机性测试
function testRandomness(
  generator: () => number,
  samples: number = 10000
): {
    mean: number
    variance: number
    uniformity: number
  } {
  const values: number[] = []

  for (let i = 0; i < samples; i++) {
    values.push(generator())
  }

  // 计算均值
  const mean = values.reduce((sum, val) => sum + val, 0) / samples

  // 计算方差
  const variance = values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / samples

  // 计算均匀性（简化版卡方检验）
  const buckets = Array.from({ length: 10 }).fill(0)
  values.forEach((val) => {
    const bucket = Math.floor(val * 10)
    if (bucket >= 0 && bucket < 10) {
      buckets[bucket]++
    }
  })

  const expected = samples / 10
  const chiSquare = buckets.reduce(
    (sum, observed) => sum + (observed - expected) ** 2 / expected,
    0
  )

  return {
    mean,
    variance,
    uniformity: chiSquare,
  }
}

// 测试内置随机数生成器
const testResults = testRandomness(() => Math.random())
console.log('随机数质量测试:', testResults)
```

## 性能优化

### 批量密钥生成

```typescript
// 批量生成密钥
function generateKeysBatch(count: number, length: number = 32): string[] {
  const keys: string[] = []

  for (let i = 0; i < count; i++) {
    keys.push(keyGenerator.generateKey(length))
  }

  return keys
}

// 异步批量生成
async function generateKeysBatchAsync(count: number, length: number = 32): Promise<string[]> {
  const keys: string[] = []
  const batchSize = 100

  for (let i = 0; i < count; i += batchSize) {
    const batchCount = Math.min(batchSize, count - i)
    const batch = generateKeysBatch(batchCount, length)
    keys.push(...batch)

    // 让出控制权
    if (i + batchSize < count) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return keys
}

// 使用示例
const keys = generateKeysBatch(100, 32)
console.log(`生成了 ${keys.length} 个密钥`)
```

### 密钥缓存

```typescript
// 密钥缓存池
class KeyPool {
  private pool: string[] = []
  private keyLength: number
  private maxSize: number

  constructor(keyLength: number = 32, maxSize: number = 100) {
    this.keyLength = keyLength
    this.maxSize = maxSize
    this.refillPool()
  }

  // 获取密钥
  getKey(): string {
    if (this.pool.length === 0) {
      this.refillPool()
    }

    return this.pool.pop() || keyGenerator.generateKey(this.keyLength)
  }

  // 补充密钥池
  private refillPool(): void {
    while (this.pool.length < this.maxSize) {
      this.pool.push(keyGenerator.generateKey(this.keyLength))
    }
  }

  // 获取池状态
  getPoolStatus(): { available: number, maxSize: number } {
    return {
      available: this.pool.length,
      maxSize: this.maxSize,
    }
  }
}

// 使用示例
const keyPool = new KeyPool(32, 50)
const key1 = keyPool.getKey()
const key2 = keyPool.getKey()
console.log('密钥池状态:', keyPool.getPoolStatus())
```

## 安全注意事项

### 密钥存储安全

1. **不要在代码中硬编码密钥**
2. **使用环境变量或安全的密钥管理服务**
3. **定期轮换密钥**
4. **安全删除不再使用的密钥**

### 随机数安全

1. **使用密码学安全的随机数生成器**
2. **避免使用 Math.random() 生成密钥**
3. **确保足够的熵源**
4. **定期测试随机数质量**

### 密钥长度建议

| 用途    | 推荐长度 | 最小长度 |
| ------- | -------- | -------- |
| AES-128 | 16 字节  | 16 字节  |
| AES-192 | 24 字节  | 24 字节  |
| AES-256 | 32 字节  | 32 字节  |
| HMAC    | 32 字节  | 16 字节  |
| 盐值    | 16 字节  | 8 字节   |
| IV      | 16 字节  | 12 字节  |

## 相关 API

- [加密 API](./encryption.md) - 使用生成的密钥进行加密
- [哈希 API](./hashing.md) - 密钥派生和验证
- [工具函数 API](./utilities.md) - 密钥验证和转换工具
