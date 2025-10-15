# 编码指南

本指南介绍如何使用 @ldesign/crypto 进行数据编码和解码。

## 概述

编码是将数据从一种格式转换为另一种格式的过程。@ldesign/crypto 提供了多种常用的编码方式，包括 Base64、Hex 和 URL-safe Base64。

**重要提示**：编码不是加密，它不提供安全性。编码仅用于数据格式转换，编码后的数据可以轻易被解码。

## 支持的编码类型

- **Base64**：将二进制数据编码为 ASCII 字符串
- **Hex**：将数据编码为十六进制字符串
- **UTF-8**：默认的文本编码（通常不需要显式转换）

## Base64 编码

### 基础用法

```typescript
import { encoding } from '@ldesign/crypto'

// 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='

// 解码
const decoded = encoding.decode(encoded, 'base64')
console.log(decoded) // 'Hello World'
```

### 便捷方法

```typescript
import { encoding } from '@ldesign/crypto'

// 使用 base64 子对象
const encoded = encoding.base64.encode('Hello World')
const decoded = encoding.base64.decode(encoded)

console.log(encoded) // 'SGVsbG8gV29ybGQ='
console.log(decoded) // 'Hello World'
```

### 直接导入

```typescript
import { base64 } from '@ldesign/crypto'

const encoded = base64.encode('Hello World')
const decoded = base64.decode(encoded)
```

## URL 安全的 Base64

URL-safe Base64 编码使用 `-` 和 `_` 替代标准 Base64 的 `+` 和 `/`，并移除填充字符 `=`，使编码结果可以安全地用于 URL。

```typescript
import { encoding } from '@ldesign/crypto'

// URL 安全编码
const urlEncoded = encoding.base64.encodeUrl('Hello World')
console.log(urlEncoded) // 'SGVsbG8gV29ybGQ'（无填充）

// URL 安全解码
const decoded = encoding.base64.decodeUrl(urlEncoded)
console.log(decoded) // 'Hello World'
```

### 使用场景

```typescript
// 在 URL 中使用
const token = encoding.base64.encodeUrl('user:password')
const url = `https://api.example.com/auth?token=${token}`

// JWT Token
const jwtPayload = encoding.base64.encodeUrl(JSON.stringify({
 userId: 123,
 exp: Date.now() + 3600000
}))
```

## Hex 编码

Hex（十六进制）编码将每个字节转换为两个十六进制字符。

### 基础用法

```typescript
import { encoding } from '@ldesign/crypto'

// 编码
const encoded = encoding.encode('Hello World', 'hex')
console.log(encoded) // '48656c6c6f20576f726c64'

// 解码
const decoded = encoding.decode(encoded, 'hex')
console.log(decoded) // 'Hello World'
```

### 便捷方法

```typescript
import { encoding } from '@ldesign/crypto'

// 使用 hex 子对象
const encoded = encoding.hex.encode('Hello World')
const decoded = encoding.hex.decode(encoded)
```

### 直接导入

```typescript
import { hex } from '@ldesign/crypto'

const encoded = hex.encode('Hello World')
const decoded = hex.decode(encoded)
```

## 编码器类

### 单例模式

编码器使用单例模式，提高性能：

```typescript
import { Encoder } from '@ldesign/crypto'

// 获取单例实例
const encoder = Encoder.getInstance()

// 编码
const encoded = encoder.encode('Hello World', 'base64')

// 解码
const decoded = encoder.decode(encoded, 'base64')
```

### 自定义编码器

```typescript
import { Encoder } from '@ldesign/crypto'

// 创建自定义编码器实例（不推荐，除非有特殊需求）
const encoder = Encoder.getInstance()

// URL-safe Base64
const urlSafe = encoder.encodeBase64Url('data')
const original = encoder.decodeBase64Url(urlSafe)
```

## 常见应用场景

### 图像数据编码

```typescript
import { base64 } from '@ldesign/crypto'

// 将图像数据转换为 Base64
function imageToBase64(imageData: string): string {
 return base64.encode(imageData)
}

// 在 HTML 中使用
const base64Image = imageToBase64(imageData)
const imgSrc = `data:image/png;base64,${base64Image}`
```

### 二进制数据传输

```typescript
import { base64 } from '@ldesign/crypto'

// 发送二进制数据
const binaryData = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f])
const encoded = base64.encode(String.fromCharCode(...binaryData))

// 传输...

// 接收并解码
const decoded = base64.decode(encoded)
```

### 哈希结果编码

```typescript
import { hash, encoding } from '@ldesign/crypto'

// 默认 Hex 编码
const hexHash = hash.sha256('data')
console.log(hexHash)

// Base64 编码
const base64Hash = hash.sha256('data', { encoding: 'base64' })
console.log(base64Hash)

// 手动转换
const hexToBase64 = encoding.base64.encode(
 encoding.hex.decode(hexHash)
)
```

### 加密数据编码

```typescript
import { aes, base64 } from '@ldesign/crypto'

// 加密后编码为 Base64
const encrypted = aes.encrypt('secret data', 'password')
const encodedResult = base64.encode(JSON.stringify(encrypted))

// 存储或传输 encodedResult

// 解码并解密
const decoded = JSON.parse(base64.decode(encodedResult))
const decrypted = aes.decrypt(decoded, 'password')
console.log(decrypted.data)
```

## 编码转换

### Base64 转 Hex

```typescript
import { encoding } from '@ldesign/crypto'

// Base64 -> Hex
const base64Str = 'SGVsbG8gV29ybGQ='
const decoded = encoding.base64.decode(base64Str)
const hexStr = encoding.hex.encode(decoded)
console.log(hexStr) // '48656c6c6f20576f726c64'
```

### Hex 转 Base64

```typescript
import { encoding } from '@ldesign/crypto'

// Hex -> Base64
const hexStr = '48656c6c6f20576f726c64'
const decoded = encoding.hex.decode(hexStr)
const base64Str = encoding.base64.encode(decoded)
console.log(base64Str) // 'SGVsbG8gV29ybGQ='
```

## 错误处理

### 无效的 Base64

```typescript
import { encoding } from '@ldesign/crypto'

try {
 const decoded = encoding.base64.decode('invalid-base64!')
} catch (error) {
 console.error('Base64 解码失败:', error)
 // 错误: Invalid Base64 format
}
```

### 无效的 Hex

```typescript
import { encoding } from '@ldesign/crypto'

try {
 const decoded = encoding.hex.decode('invalid-hex!')
} catch (error) {
 console.error('Hex 解码失败:', error)
 // 错误: Invalid Hex format
}
```

### 安全的错误处理

```typescript
import { encoding } from '@ldesign/crypto'

function safeDecodeBase64(encoded: string): string | null {
 try {
  return encoding.base64.decode(encoded)
 } catch (error) {
  console.error('解码失败:', error)
  return null
 }
}

const result = safeDecodeBase64(userInput)
if (result) {
 console.log('解码成功:', result)
} else {
 console.log('解码失败，使用默认值')
}
```

## 性能优化

### 批量编码

```typescript
import { encoding } from '@ldesign/crypto'

// 获取编码器实例，避免重复创建
const encoder = Encoder.getInstance()

// 批量编码
const data = ['data1', 'data2', 'data3', 'data4', 'data5']
const encoded = data.map(item => encoder.encode(item, 'base64'))
```

### 大数据编码

对于大量数据，考虑分块处理：

```typescript
import { encoding } from '@ldesign/crypto'

function encodeInChunks(data: string, chunkSize: number = 1024): string[] {
 const chunks: string[] = []

 for (let i = 0; i < data.length; i += chunkSize) {
  const chunk = data.substring(i, i + chunkSize)
  chunks.push(encoding.base64.encode(chunk))
 }

 return chunks
}

// 使用
const largeData = 'very large data...'
const encodedChunks = encodeInChunks(largeData)
```

## 最佳实践

### 选择合适的编码

```typescript
// Base64：适用于二进制数据、图像、文件
const imageEncoded = base64.encode(imageData)

// Hex：适用于哈希值、密钥显示
const keyHex = hex.encode(cryptoKey)

// URL-safe Base64：适用于 URL 参数、Token
const token = encoding.base64.encodeUrl(sessionData)
```

### 数据验证

```typescript
import { ValidationUtils } from '@ldesign/crypto'

// 验证 Base64
if (ValidationUtils.isValidBase64(userInput)) {
 const decoded = encoding.base64.decode(userInput)
}

// 验证 Hex
if (ValidationUtils.isValidHex(userInput)) {
 const decoded = encoding.hex.decode(userInput)
}
```

### 安全注意事项

```typescript
// 不要用 Base64 编码敏感信息作为"加密"
// 错误示例：
const password = base64.encode('mypassword') // 不安全！

// 正确做法：使用真正的加密
import { aes } from '@ldesign/crypto'
const encrypted = aes.encrypt('mypassword', 'encryption-key')
```

## 跨平台兼容性

### 浏览器环境

```typescript
// 优先使用原生 API
if (typeof btoa !== 'undefined') {
 // 使用 btoa/atob
} else {
 // 降级到 CryptoJS
}
```

### Node.js 环境

```typescript
// 在 Node.js 中使用 Buffer
const encoded = Buffer.from('Hello World').toString('base64')
const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
```

### 统一接口

```typescript
import { encoding } from '@ldesign/crypto'

// 跨平台统一接口
const encoded = encoding.base64.encode('Hello World')
const decoded = encoding.base64.decode(encoded)
// 在浏览器和 Node.js 中都能正常工作
```

## TypeScript 类型

```typescript
import type { EncodingType, IEncoder } from '@ldesign/crypto'

// 编码类型
const encodingType: EncodingType = 'base64' // 'base64' | 'hex' | 'utf8'

// 自定义编码函数
function customEncode(data: string, encoding: EncodingType): string {
 const encoder: IEncoder = Encoder.getInstance()
 return encoder.encode(data, encoding)
}
```

## 下一步

- [加密](/guide/encryption) - 学习数据加密
- [哈希](/guide/hashing) - 了解哈希函数
- [安全性](/guide/security) - 安全最佳实践
