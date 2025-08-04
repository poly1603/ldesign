# 哈希 API

本页面详细介绍了 @ldesign/crypto 的哈希和 HMAC API。

## hash 模块

### hash.md5()

计算 MD5 哈希值。

```typescript
function md5(data: string, options?: HashOptions): string
```

**参数：**

- `data` (string): 要哈希的数据
- `options` (HashOptions, 可选): 哈希选项

**返回值：**

- `string`: MD5 哈希值

**示例：**

```typescript
import { hash } from '@ldesign/crypto'

const data = 'Hello, MD5!'
const md5Hash = hash.md5(data)
console.log('MD5:', md5Hash)
// 输出: "5d41402abc4b2a76b9719d911017c592"

// 使用不同编码
const base64Hash = hash.md5(data, { encoding: 'base64' })
console.log('MD5 (Base64):', base64Hash)
```

**⚠️ 安全警告：** MD5 已被证明存在安全漏洞，不应用于安全相关的应用。仅建议用于非安全场景的校验和计算。

### hash.sha1()

计算 SHA-1 哈希值。

```typescript
function sha1(data: string, options?: HashOptions): string
```

**示例：**

```typescript
const sha1Hash = hash.sha1('Hello, SHA1!')
console.log('SHA1:', sha1Hash)
```

**⚠️ 安全警告：** SHA-1 也存在安全问题，不推荐用于新的安全应用。

### hash.sha224()

计算 SHA-224 哈希值。

```typescript
function sha224(data: string, options?: HashOptions): string
```

### hash.sha256()

计算 SHA-256 哈希值（推荐）。

```typescript
function sha256(data: string, options?: HashOptions): string
```

**示例：**

```typescript
const sha256Hash = hash.sha256('Hello, SHA256!')
console.log('SHA256:', sha256Hash)
// 输出: "185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969"
```

### hash.sha384()

计算 SHA-384 哈希值。

```typescript
function sha384(data: string, options?: HashOptions): string
```

### hash.sha512()

计算 SHA-512 哈希值。

```typescript
function sha512(data: string, options?: HashOptions): string
```

**示例：**

```typescript
const sha512Hash = hash.sha512('Hello, SHA512!')
console.log('SHA512:', sha512Hash)
```

### hash.verify()

验证哈希值。

```typescript
function verify(data: string, expectedHash: string, algorithm: HashAlgorithm, options?: HashOptions): boolean
```

**参数：**

- `data` (string): 原始数据
- `expectedHash` (string): 期望的哈希值
- `algorithm` (HashAlgorithm): 哈希算法
- `options` (HashOptions, 可选): 哈希选项

**返回值：**

- `boolean`: 验证结果

**示例：**

```typescript
const data = 'Hello, World!'
const expectedHash = hash.sha256(data)

// 验证哈希
const isValid = hash.verify(data, expectedHash, 'SHA256')
console.log('哈希验证:', isValid) // true

// 验证被篡改的数据
const tamperedData = 'Hello, World!!'
const isValidTampered = hash.verify(tamperedData, expectedHash, 'SHA256')
console.log('篡改数据验证:', isValidTampered) // false
```

## hmac 模块

### hmac.md5()

计算 HMAC-MD5。

```typescript
function md5(data: string, key: string, options?: HashOptions): string
```

**参数：**

- `data` (string): 要计算 HMAC 的数据
- `key` (string): HMAC 密钥
- `options` (HashOptions, 可选): 选项

**示例：**

```typescript
import { hmac } from '@ldesign/crypto'

const data = 'Hello, HMAC!'
const key = 'secret-key'

const hmacMd5 = hmac.md5(data, key)
console.log('HMAC-MD5:', hmacMd5)
```

### hmac.sha1()

计算 HMAC-SHA1。

```typescript
function sha1(data: string, key: string, options?: HashOptions): string
```

### hmac.sha256()

计算 HMAC-SHA256（推荐）。

```typescript
function sha256(data: string, key: string, options?: HashOptions): string
```

**示例：**

```typescript
const hmacSha256 = hmac.sha256('Important message', 'secret-key')
console.log('HMAC-SHA256:', hmacSha256)
```

### hmac.sha384()

计算 HMAC-SHA384。

```typescript
function sha384(data: string, key: string, options?: HashOptions): string
```

### hmac.sha512()

计算 HMAC-SHA512。

```typescript
function sha512(data: string, key: string, options?: HashOptions): string
```

### hmac.verify()

验证 HMAC 值。

```typescript
function verify(data: string, key: string, expectedHmac: string, algorithm: HashAlgorithm, options?: HashOptions): boolean
```

**参数：**

- `data` (string): 原始数据
- `key` (string): HMAC 密钥
- `expectedHmac` (string): 期望的 HMAC 值
- `algorithm` (HashAlgorithm): 哈希算法
- `options` (HashOptions, 可选): 选项

**示例：**

```typescript
const data = 'API request data'
const key = 'api-secret-key'

// 生成 HMAC
const hmacValue = hmac.sha256(data, key)

// 验证 HMAC
const isValid = hmac.verify(data, key, hmacValue, 'SHA256')
console.log('HMAC 验证:', isValid) // true
```

## 类型定义

### HashOptions

哈希选项接口。

```typescript
interface HashOptions {
  encoding?: EncodingType // 输出编码，默认 'hex'
  iterations?: number // 迭代次数（用于 PBKDF2）
  salt?: string // 盐值
}
```

### HashAlgorithm

支持的哈希算法类型。

```typescript
type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512'
```

### EncodingType

编码类型枚举。

```typescript
type EncodingType = 'hex' | 'base64' | 'utf8' | 'binary'
```

## 高级功能

### PBKDF2 密钥派生

```typescript
// PBKDF2 密钥派生函数
function pbkdf2(password: string, salt: string, options: PBKDF2Options): string

interface PBKDF2Options {
  iterations: number // 迭代次数
  keyLength: number // 输出密钥长度
  hashAlgorithm?: HashAlgorithm // 哈希算法，默认 'SHA256'
}
```

**示例：**

```typescript
const password = 'user-password'
const salt = keyGenerator.generateSalt(16)

const derivedKey = hash.pbkdf2(password, salt, {
  iterations: 100000, // 10万次迭代
  keyLength: 32, // 256位密钥
  hashAlgorithm: 'SHA256'
})

console.log('派生密钥:', derivedKey)
```

### Scrypt 密钥派生

```typescript
// Scrypt 密钥派生函数
function scrypt(password: string, salt: string, options: ScryptOptions): string

interface ScryptOptions {
  N: number               // CPU/内存成本参数
  r: number              // 块大小参数
  p: number              // 并行化参数
  keyLength: number      // 输出密钥长度
}
```

**示例：**

```typescript
const scryptKey = hash.scrypt(password, salt, {
  N: 16384, // 2^14
  r: 8,
  p: 1,
  keyLength: 32
})
```

## 实际应用示例

### 1. 密码哈希存储

```typescript
class PasswordHasher {
  private static readonly SALT_LENGTH = 16
  private static readonly ITERATIONS = 100000

  // 哈希密码
  static hashPassword(password: string): string {
    const salt = keyGenerator.generateSalt(this.SALT_LENGTH)
    const hashedPassword = hash.pbkdf2(password, salt, {
      iterations: this.ITERATIONS,
      keyLength: 32,
      hashAlgorithm: 'SHA256'
    })

    // 返回盐值和哈希值的组合
    return `${salt}:${hashedPassword}`
  }

  // 验证密码
  static verifyPassword(password: string, storedHash: string): boolean {
    try {
      const [salt, expectedHash] = storedHash.split(':')
      const computedHash = hash.pbkdf2(password, salt, {
        iterations: this.ITERATIONS,
        keyLength: 32,
        hashAlgorithm: 'SHA256'
      })

      // 使用常数时间比较防止时间攻击
      return this.constantTimeEquals(computedHash, expectedHash)
    }
    catch {
      return false
    }
  }

  private static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length)
      return false

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }
}

// 使用示例
const password = 'user123456'
const hashedPassword = PasswordHasher.hashPassword(password)
const isValid = PasswordHasher.verifyPassword(password, hashedPassword)
```

### 2. 文件完整性验证

```typescript
class FileIntegrityChecker {
  // 计算文件哈希
  static calculateFileHash(fileContent: string, algorithm: HashAlgorithm = 'SHA256'): string {
    switch (algorithm) {
      case 'MD5': return hash.md5(fileContent)
      case 'SHA1': return hash.sha1(fileContent)
      case 'SHA256': return hash.sha256(fileContent)
      case 'SHA384': return hash.sha384(fileContent)
      case 'SHA512': return hash.sha512(fileContent)
      default: return hash.sha256(fileContent)
    }
  }

  // 生成文件校验和
  static generateChecksum(fileContent: string): {
    md5: string
    sha1: string
    sha256: string
    sha512: string
  } {
    return {
      md5: hash.md5(fileContent),
      sha1: hash.sha1(fileContent),
      sha256: hash.sha256(fileContent),
      sha512: hash.sha512(fileContent)
    }
  }

  // 验证文件完整性
  static verifyFileIntegrity(
    fileContent: string,
    expectedHash: string,
    algorithm: HashAlgorithm = 'SHA256'
  ): boolean {
    const actualHash = this.calculateFileHash(fileContent, algorithm)
    return actualHash === expectedHash
  }

  // 批量验证文件
  static verifyMultipleFiles(files: Array<{
    content: string
    expectedHash: string
    algorithm?: HashAlgorithm
  }>): Array<{ index: number, valid: boolean, actualHash: string }> {
    return files.map((file, index) => {
      const algorithm = file.algorithm || 'SHA256'
      const actualHash = this.calculateFileHash(file.content, algorithm)
      const valid = actualHash === file.expectedHash

      return { index, valid, actualHash }
    })
  }
}

// 使用示例
const fileContent = 'File content here...'
const checksum = FileIntegrityChecker.generateChecksum(fileContent)
console.log('文件校验和:', checksum)

const isValid = FileIntegrityChecker.verifyFileIntegrity(
  fileContent,
  checksum.sha256,
  'SHA256'
)
console.log('文件完整性:', isValid ? '✅ 完整' : '❌ 已损坏')
```

### 3. API 请求签名

```typescript
class APIRequestSigner {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  // 生成请求签名
  signRequest(method: string, url: string, body: string, timestamp?: number): {
    signature: string
    timestamp: number
  } {
    const requestTimestamp = timestamp || Date.now()
    const message = this.createSignatureMessage(method, url, body, requestTimestamp)
    const signature = hmac.sha256(message, this.secretKey)

    return {
      signature,
      timestamp: requestTimestamp
    }
  }

  // 验证请求签名
  verifyRequest(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    signature: string,
    maxAge: number = 300000 // 5分钟
  ): { valid: boolean, reason?: string } {
    // 检查时间戳
    const now = Date.now()
    if (now - timestamp > maxAge) {
      return { valid: false, reason: '请求已过期' }
    }

    if (timestamp > now + 60000) { // 允许1分钟的时钟偏差
      return { valid: false, reason: '请求时间戳无效' }
    }

    // 验证签名
    const message = this.createSignatureMessage(method, url, body, timestamp)
    const expectedSignature = hmac.sha256(message, this.secretKey)

    if (signature !== expectedSignature) {
      return { valid: false, reason: '签名验证失败' }
    }

    return { valid: true }
  }

  private createSignatureMessage(method: string, url: string, body: string, timestamp: number): string {
    return `${method}\n${url}\n${body}\n${timestamp}`
  }
}

// 使用示例
const signer = new APIRequestSigner('api-secret-key')

// 签名请求
const { signature, timestamp } = signer.signRequest(
  'POST',
  '/api/users',
  '{"name":"John","email":"john@example.com"}'
)

// 验证请求
const verification = signer.verifyRequest(
  'POST',
  '/api/users',
  '{"name":"John","email":"john@example.com"}',
  timestamp,
  signature
)

console.log('请求验证:', verification.valid ? '✅ 有效' : `❌ ${verification.reason}`)
```

## 性能考虑

### 算法性能对比

| 算法    | 相对速度 | 输出长度 | 安全性 | 推荐用途   |
| ------- | -------- | -------- | ------ | ---------- |
| MD5     | 最快     | 128位    | 低     | 仅校验和   |
| SHA-1   | 快       | 160位    | 低     | 已弃用     |
| SHA-224 | 中等     | 224位    | 中     | 一般用途   |
| SHA-256 | 中等     | 256位    | 高     | **推荐**   |
| SHA-384 | 慢       | 384位    | 高     | 高安全要求 |
| SHA-512 | 慢       | 512位    | 高     | 高安全要求 |

### 批量哈希优化

```typescript
// 批量哈希处理
function batchHash(dataList: string[], algorithm: HashAlgorithm = 'SHA256') {
  const hashFunction = hash[algorithm.toLowerCase()]
  return dataList.map(data => hashFunction(data))
}

// 异步批量处理
async function batchHashAsync(dataList: string[], algorithm: HashAlgorithm = 'SHA256') {
  const results = []
  const batchSize = 100

  for (let i = 0; i < dataList.length; i += batchSize) {
    const batch = dataList.slice(i, i + batchSize)
    const batchResults = batch.map(data => hash[algorithm.toLowerCase()](data))
    results.push(...batchResults)

    // 让出控制权
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return results
}
```

## 安全注意事项

### 算法选择建议

1. **推荐使用 SHA-256 或更强的算法**
2. **避免使用 MD5 和 SHA-1** 用于安全相关应用
3. **使用盐值** 防止彩虹表攻击
4. **选择足够的迭代次数** 用于密码哈希

### 时间攻击防护

```typescript
// 安全的哈希比较
function secureHashCompare(hash1: string, hash2: string): boolean {
  if (hash1.length !== hash2.length)
    return false

  let result = 0
  for (let i = 0; i < hash1.length; i++) {
    result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i)
  }

  return result === 0
}
```

## 相关 API

- [加密 API](./encryption.md) - 加密相关函数
- [解密 API](./decryption.md) - 解密相关函数
- [密钥生成 API](./key-generation.md) - 密钥和随机数生成
- [工具函数 API](./utilities.md) - 辅助工具函数
