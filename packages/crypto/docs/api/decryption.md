# 解密 API

本页面详细介绍了 @ldesign/crypto 的解密 API。

## decrypt 模块

### decrypt.aes()

AES 对称解密函数。

```typescript
function aes(encryptedData: EncryptResult, key: string, options?: AESOptions): DecryptResult
```

**参数：**

- `encryptedData` (EncryptResult): 加密结果对象
- `key` (string): 解密密钥（必须与加密时使用的密钥相同）
- `options` (AESOptions, 可选): 解密选项

**返回值：**

- `DecryptResult`: 解密结果对象

**示例：**

```typescript
import { decrypt, encrypt } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key'

// 加密
const encrypted = encrypt.aes(data, key)

// 解密
const decrypted = decrypt.aes(encrypted, key)

if (decrypted.success) {
  console.log('解密成功:', decrypted.data)
}
else {
  console.error('解密失败:', decrypted.error)
}
```

### decrypt.aes128()

AES-128 解密的便捷方法。

```typescript
function aes128(encryptedData: EncryptResult, key: string, options?: AESOptions): DecryptResult
```

**示例：**

```typescript
const encrypted = encrypt.aes128('Hello, World!', 'my-key')
const decrypted = decrypt.aes128(encrypted, 'my-key')
```

### decrypt.aes192()

AES-192 解密的便捷方法。

```typescript
function aes192(encryptedData: EncryptResult, key: string, options?: AESOptions): DecryptResult
```

### decrypt.aes256()

AES-256 解密的便捷方法。

```typescript
function aes256(encryptedData: EncryptResult, key: string, options?: AESOptions): DecryptResult
```

### decrypt.rsa()

RSA 非对称解密函数。

```typescript
function rsa(encryptedData: EncryptResult, privateKey: string, options?: RSAOptions): DecryptResult
```

**参数：**

- `encryptedData` (EncryptResult): 加密结果对象
- `privateKey` (string): RSA 私钥
- `options` (RSAOptions, 可选): 解密选项

**示例：**

```typescript
import { decrypt, encrypt, rsa } from '@ldesign/crypto'

// 生成密钥对
const keyPair = rsa.generateKeyPair(2048)

// 加密
const encrypted = encrypt.rsa('Hello, RSA!', keyPair.publicKey)

// 解密
const decrypted = decrypt.rsa(encrypted, keyPair.privateKey)

if (decrypted.success) {
  console.log('解密成功:', decrypted.data)
}
```

### decrypt.base64()

Base64 解码函数。

```typescript
function base64(encodedData: string): string
```

**参数：**

- `encodedData` (string): Base64 编码的字符串

**返回值：**

- `string`: 解码后的原始字符串

**示例：**

```typescript
const encoded = 'SGVsbG8sIEJhc2U2NCE='
const decoded = decrypt.base64(encoded)
// 输出: "Hello, Base64!"
```

### decrypt.base64Url()

URL 安全的 Base64 解码函数。

```typescript
function base64Url(encodedData: string): string
```

**示例：**

```typescript
const encoded = 'SGVsbG8sIFVSTC1zYWZlIEJhc2U2NCE'
const decoded = decrypt.base64Url(encoded)
```

### decrypt.hex()

十六进制解码函数。

```typescript
function hex(encodedData: string): string
```

**示例：**

```typescript
const encoded = '48656c6c6f2c20486578210'
const decoded = decrypt.hex(encoded)
// 输出: "Hello, Hex!"
```

## 类型定义

### DecryptResult

解密操作的结果类型。

```typescript
interface DecryptResult {
  success: boolean // 解密是否成功
  data: string // 解密后的数据（成功时）
  error?: string // 错误信息（失败时）
  algorithm?: string // 使用的算法
  timestamp?: number // 解密时间戳
}
```

### EncryptResult

作为解密输入的加密结果类型。

```typescript
interface EncryptResult {
  data: string // 加密后的数据
  algorithm: string // 使用的算法
  iv?: string // 初始化向量
  keySize?: number // 密钥长度
  mode?: string // 加密模式
  timestamp?: number // 加密时间戳
}
```

## 错误处理

### DecryptionError

解密操作可能抛出的错误类型。

```typescript
class DecryptionError extends Error {
  constructor(message: string, algorithm: string, cause?: Error)
}
```

### 常见错误类型

1. **密钥错误**：使用了错误的解密密钥
2. **数据损坏**：加密数据被篡改或损坏
3. **算法不匹配**：解密算法与加密算法不匹配
4. **格式错误**：输入数据格式不正确

**错误处理示例：**

```typescript
try {
  const decrypted = decrypt.aes(encryptedData, key)

  if (!decrypted.success) {
    console.error('解密失败:', decrypted.error)
    return
  }

  console.log('解密成功:', decrypted.data)
}
catch (error) {
  if (error instanceof DecryptionError) {
    console.error('解密异常:', error.message)
    console.error('算法:', error.algorithm)
  }
}
```

## 高级用法

### 批量解密

```typescript
function batchDecrypt(encryptedList: EncryptResult[], key: string): DecryptResult[] {
  return encryptedList.map(encrypted => decrypt.aes(encrypted, key))
}

// 使用示例
const encryptedList = [
  encrypt.aes('data1', 'key'),
  encrypt.aes('data2', 'key'),
  encrypt.aes('data3', 'key')
]

const decryptedList = batchDecrypt(encryptedList, 'key')

// 检查解密结果
decryptedList.forEach((result, index) => {
  if (result.success) {
    console.log(`数据 ${index + 1} 解密成功:`, result.data)
  }
  else {
    console.error(`数据 ${index + 1} 解密失败:`, result.error)
  }
})
```

### 流式解密

```typescript
class StreamDecryptor {
  private key: string
  private options: AESOptions

  constructor(key: string, options: AESOptions = {}) {
    this.key = key
    this.options = options
  }

  decryptChunk(encryptedChunk: EncryptResult): DecryptResult {
    return decrypt.aes(encryptedChunk, this.key, this.options)
  }

  decryptStream(encryptedChunks: EncryptResult[]): string | null {
    const decryptedChunks: string[] = []

    for (const chunk of encryptedChunks) {
      const result = this.decryptChunk(chunk)

      if (!result.success) {
        console.error('解密块失败:', result.error)
        return null
      }

      decryptedChunks.push(result.data)
    }

    return decryptedChunks.join('')
  }
}

// 使用示例
const decryptor = new StreamDecryptor('my-key', { keySize: 256 })
const originalData = decryptor.decryptStream(encryptedChunks)
```

### 安全解密包装器

```typescript
class SecureDecryptor {
  private maxRetries: number
  private retryDelay: number

  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  async secureDecrypt(
    encryptedData: EncryptResult,
    key: string,
    options?: AESOptions
  ): Promise<DecryptResult> {
    let lastError: string = ''

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = decrypt.aes(encryptedData, key, options)

        if (result.success) {
          return result
        }

        lastError = result.error || '未知错误'

        if (attempt < this.maxRetries) {
          console.warn(`解密尝试 ${attempt} 失败，${this.retryDelay}ms 后重试`)
          await this.delay(this.retryDelay)
        }
      }
      catch (error) {
        lastError = error instanceof Error ? error.message : '解密异常'

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay)
        }
      }
    }

    return {
      success: false,
      data: '',
      error: `解密失败，已重试 ${this.maxRetries} 次。最后错误: ${lastError}`
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// 使用示例
const secureDecryptor = new SecureDecryptor()
const result = await secureDecryptor.secureDecrypt(encryptedData, key)
```

## 数据验证

### 解密前验证

```typescript
function validateEncryptedData(encryptedData: any): boolean {
  // 检查必需字段
  if (!encryptedData || typeof encryptedData !== 'object') {
    return false
  }

  if (!encryptedData.data || typeof encryptedData.data !== 'string') {
    return false
  }

  if (!encryptedData.algorithm || typeof encryptedData.algorithm !== 'string') {
    return false
  }

  // 检查算法支持
  const supportedAlgorithms = ['AES-128-CBC', 'AES-192-CBC', 'AES-256-CBC', 'RSA']
  if (!supportedAlgorithms.includes(encryptedData.algorithm)) {
    return false
  }

  return true
}

// 安全解密函数
function safeDecrypt(encryptedData: any, key: string): DecryptResult {
  if (!validateEncryptedData(encryptedData)) {
    return {
      success: false,
      data: '',
      error: '无效的加密数据格式'
    }
  }

  return decrypt.aes(encryptedData, key)
}
```

### 解密后验证

```typescript
function validateDecryptedData(data: string, expectedFormat?: string): boolean {
  if (!data || typeof data !== 'string') {
    return false
  }

  // 根据期望格式进行验证
  switch (expectedFormat) {
    case 'json':
      try {
        JSON.parse(data)
        return true
      }
      catch {
        return false
      }

    case 'base64':
      return /^[A-Z0-9+/]*={0,2}$/i.test(data)

    case 'hex':
      return /^[0-9a-f]*$/i.test(data)

    default:
      return true
  }
}

// 带验证的解密
function decryptWithValidation(encryptedData: EncryptResult, key: string, expectedFormat?: string): DecryptResult {
  const result = decrypt.aes(encryptedData, key)

  if (result.success && !validateDecryptedData(result.data, expectedFormat)) {
    return {
      success: false,
      data: '',
      error: '解密数据格式验证失败'
    }
  }

  return result
}
```

## 性能优化

### 解密缓存

```typescript
class DecryptionCache {
  private cache = new Map<string, DecryptResult>()
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
  }

  private generateCacheKey(encryptedData: EncryptResult, key: string): string {
    // 使用加密数据和密钥的哈希作为缓存键
    const dataHash = this.simpleHash(encryptedData.data)
    const keyHash = this.simpleHash(key)
    return `${dataHash}:${keyHash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  cachedDecrypt(encryptedData: EncryptResult, key: string): DecryptResult {
    const cacheKey = this.generateCacheKey(encryptedData, key)

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    // 执行解密
    const result = decrypt.aes(encryptedData, key)

    // 只缓存成功的结果
    if (result.success) {
      // 管理缓存大小
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value
        this.cache.delete(firstKey)
      }

      this.cache.set(cacheKey, result)
    }

    return result
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    }
  }
}

// 使用示例
const decryptCache = new DecryptionCache()
const result = decryptCache.cachedDecrypt(encryptedData, key)
```

## 安全注意事项

### 密钥安全

1. **密钥一致性**：确保解密使用的密钥与加密时完全相同
2. **密钥存储**：安全存储解密密钥，避免泄露
3. **密钥轮换**：定期更换密钥，并能解密旧数据

### 数据完整性

1. **验证数据**：解密前验证数据完整性
2. **错误处理**：正确处理解密错误，避免信息泄露
3. **时间攻击**：使用常数时间比较避免时间攻击

### 内存安全

```typescript
// 安全清理解密结果
function secureDecryptAndClean(encryptedData: EncryptResult, key: string): string | null {
  const result = decrypt.aes(encryptedData, key)

  if (!result.success) {
    return null
  }

  // 复制结果
  const data = result.data

  // 清理原始结果
  result.data = ''

  return data
}
```

## 相关 API

- [加密 API](./encryption.md) - 加密相关函数
- [哈希 API](./hashing.md) - 哈希和验证函数
- [密钥生成 API](./key-generation.md) - 密钥管理函数
- [工具函数 API](./utilities.md) - 辅助工具函数
