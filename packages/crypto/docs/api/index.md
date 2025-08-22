# API 概览

@ldesign/crypto 提供了完整的加密、解密、哈希和编码功能。本页面提供了所有 API 的概览。

## 核心 API

### 加密 API

```typescript
import { encrypt } from '@ldesign/crypto'

// AES 对称加密
const encrypted = encrypt.aes(data, key, options)
const encrypted128 = encrypt.aes128(data, key, options)
const encrypted192 = encrypt.aes192(data, key, options)
const encrypted256 = encrypt.aes256(data, key, options)

// RSA 非对称加密
const encrypted = encrypt.rsa(data, publicKey, options)

// Base64 编码
const encoded = encrypt.base64(data)
const urlSafeEncoded = encrypt.base64Url(data)

// Hex 编码
const encoded = encrypt.hex(data)
```

### 解密 API

```typescript
import { decrypt } from '@ldesign/crypto'

// AES 对称解密
const decrypted = decrypt.aes(encryptedData, key, options)
const decrypted128 = decrypt.aes128(encryptedData, key, options)
const decrypted192 = decrypt.aes192(encryptedData, key, options)
const decrypted256 = decrypt.aes256(encryptedData, key, options)

// RSA 非对称解密
const decrypted = decrypt.rsa(encryptedData, privateKey, options)

// Base64 解码
const decoded = decrypt.base64(encodedData)
const urlSafeDecoded = decrypt.base64Url(encodedData)

// Hex 解码
const decoded = decrypt.hex(encodedData)
```

### 哈希 API

```typescript
import { hash, hmac } from '@ldesign/crypto'

// 哈希算法
const md5Hash = hash.md5(data, options)
const sha1Hash = hash.sha1(data, options)
const sha224Hash = hash.sha224(data, options)
const sha256Hash = hash.sha256(data, options)
const sha384Hash = hash.sha384(data, options)
const sha512Hash = hash.sha512(data, options)

// 哈希验证
const isValid = hash.verify(data, expectedHash, algorithm, options)

// HMAC 消息认证码
const hmacMd5 = hmac.md5(data, key)
const hmacSha1 = hmac.sha1(data, key)
const hmacSha256 = hmac.sha256(data, key)
const hmacSha384 = hmac.sha384(data, key)
const hmacSha512 = hmac.sha512(data, key)

// HMAC 验证
const isValid = hmac.verify(data, key, expectedHmac, algorithm)
```

### 密钥生成 API

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成随机密钥
const key = keyGenerator.generateKey(length?)

// 生成盐值
const salt = keyGenerator.generateSalt(length?)

// 生成初始化向量
const iv = keyGenerator.generateIV(length?)

// 生成 RSA 密钥对
const keyPair = keyGenerator.generateRSAKeyPair(keySize?)
```

### 数字签名 API

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 生成数字签名
const signature = digitalSignature.sign(data, privateKey, algorithm?)

// 验证数字签名
const isValid = digitalSignature.verify(data, signature, publicKey, algorithm?)
```

## 算法 API

### AES 算法

```typescript
import { aes } from '@ldesign/crypto'

// 加密
const encrypted = aes.encrypt(data, key, options)
const encrypted128 = aes.encrypt128(data, key, options)
const encrypted192 = aes.encrypt192(data, key, options)
const encrypted256 = aes.encrypt256(data, key, options)

// 解密
const decrypted = aes.decrypt(encryptedData, key, options)
const decrypted128 = aes.decrypt128(encryptedData, key, options)
const decrypted192 = aes.decrypt192(encryptedData, key, options)
const decrypted256 = aes.decrypt256(encryptedData, key, options)
```

### RSA 算法

```typescript
import { rsa } from '@ldesign/crypto'

// 生成密钥对
const keyPair = rsa.generateKeyPair(keySize)

// 加密
const encrypted = rsa.encrypt(data, publicKey, options)

// 解密
const decrypted = rsa.decrypt(encryptedData, privateKey, options)

// 签名
const signature = rsa.sign(data, privateKey, algorithm)

// 验证签名
const isValid = rsa.verify(data, signature, publicKey, algorithm)
```

### 编码算法

```typescript
import { base64, encoding, hex } from '@ldesign/crypto'

// 通用编码接口
const encoded = encoding.encode(data, type)
const decoded = encoding.decode(encodedData, type)

// Base64 编码
const encoded = base64.encode(data)
const decoded = base64.decode(encodedData)
const urlSafeEncoded = base64.encodeUrl(data)
const urlSafeDecoded = base64.decodeUrl(encodedData)

// Hex 编码
const encoded = hex.encode(data)
const decoded = hex.decode(encodedData)
```

## Vue 3 API

### useCrypto Hook

```typescript
import { useCrypto } from '@ldesign/crypto/vue'

const {
  // AES 加密
  encryptAES,
  decryptAES,

  // RSA 加密
  encryptRSA,
  decryptRSA,
  generateRSAKeyPair,

  // 编码
  encodeBase64,
  decodeBase64,
  encodeHex,
  decodeHex,

  // 密钥生成
  generateKey,
  generateSalt,
  generateIV,

  // 状态
  isEncrypting,
  isDecrypting,
  lastError,
  lastResult,

  // 操作
  clearError,
  reset,

  // 直接访问
  encrypt,
  decrypt,
  keyGenerator,
} = useCrypto()
```

### useHash Hook

```typescript
import { useHash } from '@ldesign/crypto/vue'

const {
  // 哈希算法
  md5,
  sha1,
  sha224,
  sha256,
  sha384,
  sha512,

  // HMAC 算法
  hmacMd5,
  hmacSha1,
  hmacSha256,
  hmacSha384,
  hmacSha512,

  // 验证
  verify,
  verifyHmac,

  // 批量操作
  hashMultiple,

  // 状态
  isHashing,
  lastError,
  lastResult,

  // 操作
  clearError,
  reset,
} = useHash()
```

### useSignature Hook

```typescript
import { useSignature } from '@ldesign/crypto/vue'

const {
  // 签名操作
  sign,
  verify,

  // 状态
  isSigning,
  isVerifying,
  lastError,
  lastResult,

  // 操作
  clearError,
  reset,
} = useSignature()
```

## 类型定义

### 基础类型

```typescript
// 加密算法类型
type EncryptionAlgorithm = 'AES' | 'RSA'

// AES 相关类型
type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'
type AESKeySize = 128 | 192 | 256

// 哈希算法类型
type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512'

// 编码类型
type EncodingType = 'hex' | 'base64' | 'utf8'

// RSA 密钥格式
type RSAKeyFormat = 'pem' | 'der'
```

### 选项类型

```typescript
// AES 选项
interface AESOptions {
  keySize?: AESKeySize
  mode?: AESMode
  iv?: string
  padding?: string
}

// RSA 选项
interface RSAOptions {
  keyFormat?: RSAKeyFormat
  padding?: string
}

// 哈希选项
interface HashOptions {
  encoding?: EncodingType
}
```

### 结果类型

```typescript
// 加密结果
interface EncryptResult {
  data: string
  algorithm: string
  iv?: string
  keySize?: number
  mode?: string
}

// 解密结果
interface DecryptResult {
  success: boolean
  data: string
  error?: string
}

// 哈希结果
interface HashResult {
  hash: string
  algorithm: string
  encoding: string
  length: number
}

// RSA 密钥对
interface RSAKeyPair {
  publicKey: string
  privateKey: string
  keySize: number
  format: RSAKeyFormat
}
```

## 错误处理

### 错误类型

```typescript
// 加密错误
class EncryptionError extends Error {
  constructor(message: string, algorithm: string)
}

// 解密错误
class DecryptionError extends Error {
  constructor(message: string, algorithm: string)
}

// 哈希错误
class HashError extends Error {
  constructor(message: string, algorithm: string)
}

// 编码错误
class EncodingError extends Error {
  constructor(message: string, encoding: string)
}
```

### 错误处理示例

```typescript
try {
  const encrypted = encrypt.aes(data, key)
  const decrypted = decrypt.aes(encrypted, key)

  if (!decrypted.success) {
    console.error('解密失败:', decrypted.error)
  }
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('加密错误:', error.message)
  } else if (error instanceof DecryptionError) {
    console.error('解密错误:', error.message)
  } else {
    console.error('未知错误:', error.message)
  }
}
```

## 配置选项

### 全局配置

```typescript
// 设置默认配置
import { setDefaultConfig } from '@ldesign/crypto'

setDefaultConfig({
  aes: {
    keySize: 256,
    mode: 'CBC',
  },
  rsa: {
    keySize: 2048,
    keyFormat: 'pem',
  },
  hash: {
    algorithm: 'SHA256',
    encoding: 'hex',
  },
})
```

### Vue 插件配置

```typescript
// Vue 插件配置
app.use(CryptoPlugin, {
  globalPropertyName: '$crypto',
  registerComposables: true,
  config: {
    defaultAESKeySize: 256,
    defaultRSAKeySize: 2048,
    defaultHashAlgorithm: 'SHA256',
    defaultEncoding: 'hex',
  },
})
```

## 工具函数

### 验证函数

```typescript
import { ValidationUtils } from '@ldesign/crypto'

// 验证 AES 密钥长度
const isValidAESKey = ValidationUtils.validateAESKeyLength(key, keySize)

// 验证十六进制字符串
const isValidHex = ValidationUtils.isValidHex(hexString)

// 验证 Base64 字符串
const isValidBase64 = ValidationUtils.isValidBase64(base64String)

// 验证 RSA 密钥格式
const isValidRSAKey = ValidationUtils.validateRSAKey(keyString)
```

### 字符串工具

```typescript
import { StringUtils } from '@ldesign/crypto'

// 字符串转字节数组
const bytes = StringUtils.stringToBytes(str)

// 字节数组转字符串
const str = StringUtils.bytesToString(bytes)

// 安全字符串比较
const isEqual = StringUtils.secureCompare(str1, str2)
```

### 随机数工具

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成随机字节
const randomBytes = RandomUtils.generateRandomBytes(length)

// 生成随机字符串
const randomString = RandomUtils.generateRandomString(length, charset?)

// 生成随机十六进制字符串
const randomHex = RandomUtils.generateRandomHex(length)
```

## 常量

```typescript
import { CONSTANTS } from '@ldesign/crypto'

// 算法常量
console.log(CONSTANTS.ALGORITHMS.AES.KEY_SIZES) // [128, 192, 256]
console.log(CONSTANTS.ALGORITHMS.AES.MODES) // ['CBC', 'ECB', 'CFB', 'OFB', 'CTR']
console.log(CONSTANTS.ALGORITHMS.HASH.ALGORITHMS) // ['MD5', 'SHA1', 'SHA256', ...]

// 默认值
console.log(CONSTANTS.DEFAULTS.AES_KEY_SIZE) // 256
console.log(CONSTANTS.DEFAULTS.RSA_KEY_SIZE) // 2048
console.log(CONSTANTS.DEFAULTS.HASH_ALGORITHM) // 'SHA256'
```
