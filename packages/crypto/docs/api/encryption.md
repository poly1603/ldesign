# 加密 API

本页面详细介绍了 @ldesign/crypto 的加密 API。

## encrypt 模块

### encrypt.aes()

AES 对称加密函数。

```typescript
function aes(data: string, key: string, options?: AESOptions): EncryptResult
```

**参数：**

- `data` (string): 要加密的数据
- `key` (string): 加密密钥
- `options` (AESOptions, 可选): 加密选项

**返回值：**

- `EncryptResult`: 加密结果对象

**示例：**

```typescript
import { encrypt } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key'

// 基本用法
const encrypted = encrypt.aes(data, key)

// 使用选项
const encrypted = encrypt.aes(data, key, {
  keySize: 256,
  mode: 'CBC',
  iv: 'custom-iv'
})
```

### encrypt.aes128()

AES-128 加密的便捷方法。

```typescript
function aes128(data: string, key: string, options?: AESOptions): EncryptResult
```

**示例：**

```typescript
const encrypted = encrypt.aes128('Hello, World!', 'my-key')
```

### encrypt.aes192()

AES-192 加密的便捷方法。

```typescript
function aes192(data: string, key: string, options?: AESOptions): EncryptResult
```

### encrypt.aes256()

AES-256 加密的便捷方法。

```typescript
function aes256(data: string, key: string, options?: AESOptions): EncryptResult
```

### encrypt.rsa()

RSA 非对称加密函数。

```typescript
function rsa(data: string, publicKey: string, options?: RSAOptions): EncryptResult
```

**参数：**

- `data` (string): 要加密的数据
- `publicKey` (string): RSA 公钥
- `options` (RSAOptions, 可选): 加密选项

**示例：**

```typescript
import { encrypt, rsa } from '@ldesign/crypto'

// 生成密钥对
const keyPair = rsa.generateKeyPair(2048)

// 加密数据
const encrypted = encrypt.rsa('Hello, RSA!', keyPair.publicKey)
```

### encrypt.base64()

Base64 编码函数。

```typescript
function base64(data: string): string
```

**参数：**

- `data` (string): 要编码的数据

**返回值：**

- `string`: Base64 编码后的字符串

**示例：**

```typescript
const encoded = encrypt.base64('Hello, Base64!')
// 输出: "SGVsbG8sIEJhc2U2NCE="
```

### encrypt.base64Url()

URL 安全的 Base64 编码函数。

```typescript
function base64Url(data: string): string
```

**示例：**

```typescript
const encoded = encrypt.base64Url('Hello, URL-safe Base64!')
```

### encrypt.hex()

十六进制编码函数。

```typescript
function hex(data: string): string
```

**示例：**

```typescript
const encoded = encrypt.hex('Hello, Hex!')
// 输出: "48656c6c6f2c20486578210"
```

## 类型定义

### EncryptResult

加密操作的结果类型。

```typescript
interface EncryptResult {
  data: string // 加密后的数据
  algorithm: string // 使用的算法
  iv?: string // 初始化向量（如果适用）
  keySize?: number // 密钥长度
  mode?: string // 加密模式
  timestamp?: number // 加密时间戳
}
```

### AESOptions

AES 加密选项。

```typescript
interface AESOptions {
  keySize?: 128 | 192 | 256 // 密钥长度，默认 256
  mode?: AESMode // 加密模式，默认 'CBC'
  iv?: string // 自定义初始化向量
  padding?: string // 填充方式，默认 'Pkcs7'
  encoding?: EncodingType // 输出编码，默认 'hex'
}
```

### AESMode

AES 加密模式枚举。

```typescript
type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
```

### RSAOptions

RSA 加密选项。

```typescript
interface RSAOptions {
  keyFormat?: 'pem' | 'der' // 密钥格式，默认 'pem'
  padding?: string // 填充方式，默认 'OAEP'
  hashAlgorithm?: string // 哈希算法，默认 'SHA256'
  encoding?: EncodingType // 输出编码，默认 'hex'
}
```

### EncodingType

编码类型枚举。

```typescript
type EncodingType = 'hex' | 'base64' | 'utf8' | 'binary'
```

## 错误处理

### EncryptionError

加密操作可能抛出的错误类型。

```typescript
class EncryptionError extends Error {
  constructor(message: string, algorithm: string, cause?: Error)
}
```

**错误处理示例：**

```typescript
try {
  const encrypted = encrypt.aes('data', 'key')
}
catch (error) {
  if (error instanceof EncryptionError) {
    console.error('加密错误:', error.message)
    console.error('算法:', error.algorithm)
  }
}
```

## 高级用法

### 自定义初始化向量

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成自定义 IV
const customIV = keyGenerator.generateIV(16)

const encrypted = encrypt.aes('data', 'key', {
  iv: customIV
})
```

### 批量加密

```typescript
function batchEncrypt(dataList: string[], key: string) {
  return dataList.map(data => encrypt.aes(data, key))
}

const dataList = ['data1', 'data2', 'data3']
const encryptedList = batchEncrypt(dataList, 'my-key')
```

### 流式加密

```typescript
class StreamEncryptor {
  private key: string
  private options: AESOptions

  constructor(key: string, options: AESOptions = {}) {
    this.key = key
    this.options = options
  }

  encryptChunk(chunk: string): EncryptResult {
    return encrypt.aes(chunk, this.key, this.options)
  }

  encryptStream(chunks: string[]): EncryptResult[] {
    return chunks.map(chunk => this.encryptChunk(chunk))
  }
}

const encryptor = new StreamEncryptor('my-key', { keySize: 256 })
const chunks = ['chunk1', 'chunk2', 'chunk3']
const encryptedChunks = encryptor.encryptStream(chunks)
```

## 性能考虑

### 算法性能对比

| 算法     | 相对速度 | 安全性 | 推荐用途     |
| -------- | -------- | ------ | ------------ |
| AES-128  | 最快     | 高     | 一般用途     |
| AES-192  | 中等     | 很高   | 敏感数据     |
| AES-256  | 较慢     | 最高   | 高度敏感数据 |
| RSA-1024 | 很慢     | 低     | 不推荐       |
| RSA-2048 | 慢       | 高     | 推荐         |
| RSA-4096 | 最慢     | 最高   | 高安全要求   |

### 性能优化建议

1. **选择合适的密钥长度**：根据安全需求选择最小可接受的密钥长度
2. **使用合适的加密模式**：ECB 最快但不安全，CBC 平衡，GCM 提供认证
3. **批量处理**：对多个数据项使用批量加密可以提高效率
4. **缓存密钥**：避免重复生成相同的密钥

### 内存使用优化

```typescript
// 大数据加密的内存优化
function encryptLargeData(data: string, key: string, chunkSize = 64 * 1024) {
  const chunks = []

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const encrypted = encrypt.aes(chunk, key)
    chunks.push(encrypted)
  }

  return chunks
}
```

## 安全注意事项

### 密钥管理

1. **使用强随机密钥**：使用 `keyGenerator.generateKey()` 生成密钥
2. **定期轮换密钥**：实施密钥轮换策略
3. **安全存储密钥**：不要在代码中硬编码密钥

### 初始化向量

1. **每次加密使用新的 IV**：避免重复使用相同的 IV
2. **使用随机 IV**：使用 `keyGenerator.generateIV()` 生成 IV
3. **正确存储 IV**：IV 可以公开，但必须与密文一起传输

### 加密模式选择

1. **避免 ECB 模式**：ECB 模式不安全，不要用于生产环境
2. **推荐 GCM 模式**：GCM 提供认证加密，防止篡改
3. **正确使用 CBC 模式**：确保使用随机 IV

## 兼容性

### 浏览器支持

- Chrome 37+
- Firefox 34+
- Safari 7.1+
- Edge 12+

### Node.js 支持

- Node.js 12+
- 支持 ES 模块和 CommonJS

### TypeScript 支持

- TypeScript 4.0+
- 完整的类型定义
- 严格模式兼容

## 相关 API

- [解密 API](./decryption.md) - 解密相关函数
- [哈希 API](./hashing.md) - 哈希和 HMAC 函数
- [密钥生成 API](./key-generation.md) - 密钥和随机数生成
- [工具函数 API](./utilities.md) - 辅助工具函数
