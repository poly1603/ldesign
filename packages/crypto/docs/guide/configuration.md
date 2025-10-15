# 配置指南

本指南介绍如何配置 @ldesign/crypto 以满足不同的需求。

## 基础配置

### CryptoManager 配置

```typescript
import { CryptoManager } from '@ldesign/crypto'

const manager = new CryptoManager({
 // 默认算法
 defaultAlgorithm: 'AES',

 // 性能优化
 enableCache: true,
 maxCacheSize: 1000,
 enableParallel: true,

 // 安全选项
 autoGenerateIV: true,
 keyDerivation: false,

 // 调试选项
 debug: false,
 logLevel: 'error' // 'error' | 'warn' | 'info' | 'debug'
})
```

### 性能优化器配置

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer({
 // 最大缓存数量
 maxCacheSize: 1000,

 // 缓存过期时间（毫秒）
 cacheTTL: 5 * 60 * 1000, // 5分钟

 // 是否启用缓存
 enableCache: true,

 // 最大操作时间记录数
 maxOperationTimes: 1000,

 // 自动清理间隔（毫秒）
 autoCleanupInterval: 60 * 1000, // 1分钟

 // 内存使用阈值（字节）
 memoryThreshold: 50 * 1024 * 1024, // 50MB

 // 是否启用 Worker 并行处理
 enableWorker: false,

 // Worker 线程池大小
 workerPoolSize: 4,

 // 批量操作最大并发数
 maxConcurrency: 10
})
```

## 加密算法配置

### AES 配置

```typescript
import { aes } from '@ldesign/crypto'

// AES-256-CBC（推荐）
const result1 = aes.encrypt('data', 'key', {
 keySize: 256,
 mode: 'CBC',
 padding: 'Pkcs7'
})

// AES-192-CTR
const result2 = aes.encrypt('data', 'key', {
 keySize: 192,
 mode: 'CTR',
 padding: 'Pkcs7'
})

// AES-128-GCM（如果支持）
const result3 = aes.encrypt('data', 'key', {
 keySize: 128,
 mode: 'GCM',
 padding: 'NoPadding'
})

// 自定义 IV
const result4 = aes.encrypt('data', 'key', {
 keySize: 256,
 mode: 'CBC',
 iv: 'custom-iv-16bytes'
})
```

### RSA 配置

```typescript
import { rsa } from '@ldesign/crypto'

// 生成密钥对
const keyPair1 = rsa.generateKeyPair(2048) // 标准
const keyPair2 = rsa.generateKeyPair(4096) // 高安全性

// 加密配置
const encrypted1 = rsa.encrypt('data', publicKey, {
 padding: 'OAEP',       // OAEP（推荐）
 hashAlgorithm: 'SHA256'  // SHA256（推荐）
})

const encrypted2 = rsa.encrypt('data', publicKey, {
 padding: 'PKCS1',       // PKCS1 v1.5
 hashAlgorithm: 'SHA1'
})
```

## 哈希配置

### 哈希算法选择

```typescript
import { hash } from '@ldesign/crypto'

// SHA-256（推荐）
const hash1 = hash.sha256('data')

// SHA-512（更高安全性）
const hash2 = hash.sha512('data')

// SHA-384
const hash3 = hash.sha384('data')

// 指定编码
const hash4 = hash.sha256('data', { encoding: 'base64' })
const hash5 = hash.sha256('data', { encoding: 'hex' })
```

### HMAC 配置

```typescript
import { hmac } from '@ldesign/crypto'

// HMAC-SHA256（推荐）
const mac1 = hmac.sha256('message', 'key')

// HMAC-SHA512
const mac2 = hmac.sha512('message', 'key')

// 指定编码
const mac3 = hmac.sha256('message', 'key', { encoding: 'base64' })
```

## 密钥派生配置

### PBKDF2 配置

```typescript
import { deriveKey } from '@ldesign/crypto'

const derived = deriveKey('user-password', 'salt', {
 // 迭代次数（越多越安全，但越慢）
 iterations: 100000, // 推荐 100,000+

 // 密钥长度（字节）
 keyLength: 32, // 256 位

 // 哈希算法
 digest: 'SHA256' // 'SHA1' | 'SHA256' | 'SHA512'
})
```

### 密钥生成配置

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成 AES 密钥
const aesKey256 = RandomUtils.generateKey(32) // 256 位
const aesKey192 = RandomUtils.generateKey(24) // 192 位
const aesKey128 = RandomUtils.generateKey(16) // 128 位

// 生成盐值
const salt = RandomUtils.generateSalt(16) // 128 位

// 生成 IV
const iv = RandomUtils.generateIV(16) // 128 位
```

## 存储配置

### 安全存储配置

```typescript
import { SecureStorage } from '@ldesign/crypto'

// 使用 localStorage
const storage1 = new SecureStorage({
 key: 'encryption-key',
 prefix: 'app_',
 useSessionStorage: false,
 ttl: 24 * 60 * 60 * 1000 // 24小时
})

// 使用 sessionStorage
const storage2 = new SecureStorage({
 key: 'encryption-key',
 prefix: 'session_',
 useSessionStorage: true,
 ttl: 0 // 不过期
})
```

## Vue 插件配置

### 基础配置

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'

app.use(CryptoPlugin, {
 globalPropertyName: '$crypto',
 registerComposables: true,
 config: {
  defaultAESKeySize: 256,
  defaultRSAKeySize: 2048,
  defaultHashAlgorithm: 'SHA256',
  defaultEncoding: 'base64'
 }
})
```

### 高级配置

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'

app.use(CryptoPlugin, {
 // 自定义全局属性名
 globalPropertyName: '$security',

 // 禁用全局组合式函数
 registerComposables: false,

 // 详细配置
 config: {
  // AES 配置
  defaultAESKeySize: 256,   // 128 | 192 | 256

  // RSA 配置
  defaultRSAKeySize: 2048,   // 1024 | 2048 | 3072 | 4096

  // 哈希配置
  defaultHashAlgorithm: 'SHA256', // 'MD5' | 'SHA1' | ... | 'SHA512'

  // 编码配置
  defaultEncoding: 'base64'    // 'base64' | 'hex' | 'utf8'
 }
})
```

## 环境配置

### 开发环境

```typescript
// .env.development
VITE_CRYPTO_DEBUG=true
VITE_CRYPTO_LOG_LEVEL=debug
VITE_ENCRYPTION_KEY=dev-encryption-key
VITE_ENABLE_CACHE=true
```

```typescript
// config/crypto.config.ts
export const cryptoConfig = {
 debug: import.meta.env.VITE_CRYPTO_DEBUG === 'true',
 logLevel: import.meta.env.VITE_CRYPTO_LOG_LEVEL || 'error',
 encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY,
 enableCache: import.meta.env.VITE_ENABLE_CACHE === 'true'
}
```

### 生产环境

```typescript
// .env.production
VITE_CRYPTO_DEBUG=false
VITE_CRYPTO_LOG_LEVEL=error
VITE_ENCRYPTION_KEY= # 从安全渠道注入
VITE_ENABLE_CACHE=true
```

## 流式加密配置

### ChunkEncryptor 配置

```typescript
import { ChunkEncryptor } from '@ldesign/crypto'

const encryptor = new ChunkEncryptor({
 algorithm: 'aes',
 key: 'encryption-key',
 chunkSize: 64 * 1024, // 64KB
 mode: 'CBC',
 keySize: 256
})
```

### 文件加密配置

```typescript
import { encryptFile } from '@ldesign/crypto'

await encryptFile('input.txt', 'output.enc', 'key', {
 algorithm: 'aes',
 chunkSize: 64 * 1024,
 onProgress: (progress) => {
  console.log(`Progress: ${progress.percentage}%`)
 }
})
```

## Worker 配置

### Worker 池配置

```typescript
import { getGlobalWorkerPool } from '@ldesign/crypto'

const pool = getGlobalWorkerPool({
 maxWorkers: 4,    // 最大 Worker 数量
 timeout: 30000     // 超时时间（毫秒）
})

// 使用 Worker 池
const result = await pool.execute({
 type: 'encrypt',
 algorithm: 'aes',
 data: 'large data',
 key: 'key'
})
```

## 缓存配置

### LRU 缓存配置

```typescript
import { LRUCache } from '@ldesign/crypto'

const cache = new LRUCache({
 maxSize: 1000,             // 最大缓存项数
 ttl: 5 * 60 * 1000,       // 过期时间（毫秒）
 updateAgeOnGet: true,        // 获取时更新年龄
 onEvict: (key, value) => {  // 淘汰回调
  console.log(`Evicted: ${key}`)
 }
})
```

## 配置验证

### 运行时验证

```typescript
import { ValidationUtils } from '@ldesign/crypto'

// 验证密钥长度
function validateKeyLength(key: string, algorithm: string): boolean {
 const minLengths = {
  'AES-128': 16,
  'AES-192': 24,
  'AES-256': 32,
  'DES': 8,
  '3DES': 24
 }

 const minLength = minLengths[algorithm]
 return !minLength || key.length >= minLength
}

// 验证配置
function validateConfig(config: any): boolean {
 if (config.enableCache && config.maxCacheSize <= 0) {
  throw new Error('Invalid maxCacheSize')
 }

 if (config.cacheTTL < 0) {
  throw new Error('Invalid cacheTTL')
 }

 return true
}
```

## TypeScript 配置

### 类型定义

```typescript
import type {
 CryptoConfig,
 PerformanceOptimizerConfig,
 SecureStorageOptions,
 AESOptions,
 RSAOptions,
 HashOptions
} from '@ldesign/crypto'

// 自定义配置类型
interface CustomCryptoConfig extends CryptoConfig {
 customOption?: string
}

// 使用类型
const config: CustomCryptoConfig = {
 defaultAlgorithm: 'AES',
 enableCache: true,
 customOption: 'value'
}
```

## 配置最佳实践

### 安全配置

```typescript
// 1. 使用环境变量
const key = process.env.ENCRYPTION_KEY // Node.js
const key = import.meta.env.VITE_ENCRYPTION_KEY // Vite

// 2. 验证配置
if (!key) {
 throw new Error('Encryption key not configured')
}

// 3. 使用强密钥
if (key.length < 32) {
 console.warn('Weak encryption key')
}
```

### 性能配置

```typescript
// 根据应用规模调整缓存大小
const config = {
 // 小型应用
 maxCacheSize: 100,

 // 中型应用
 maxCacheSize: 1000,

 // 大型应用
 maxCacheSize: 10000
}
```

### 调试配置

```typescript
// 开发环境启用调试
const isDev = process.env.NODE_ENV === 'development'

const config = {
 debug: isDev,
 logLevel: isDev ? 'debug' : 'error'
}
```

## 配置迁移

### 从旧版本迁移

```typescript
// 旧配置（假设）
const oldConfig = {
 algorithm: 'AES',
 cacheEnabled: true
}

// 新配置
const newConfig = {
 defaultAlgorithm: oldConfig.algorithm,
 enableCache: oldConfig.cacheEnabled,
 maxCacheSize: 1000,
 enableParallel: true
}
```

## 配置示例

### 完整配置示例

```typescript
import { CryptoManager, PerformanceOptimizer } from '@ldesign/crypto'

// 创建性能优化器
const optimizer = new PerformanceOptimizer({
 maxCacheSize: 1000,
 cacheTTL: 5 * 60 * 1000,
 enableCache: true,
 maxOperationTimes: 1000,
 autoCleanupInterval: 60 * 1000,
 memoryThreshold: 50 * 1024 * 1024,
 enableWorker: false,
 maxConcurrency: 10
})

// 创建加密管理器
const manager = new CryptoManager({
 defaultAlgorithm: 'AES',
 enableCache: true,
 maxCacheSize: 1000,
 enableParallel: true,
 autoGenerateIV: true,
 keyDerivation: false,
 debug: process.env.NODE_ENV === 'development',
 logLevel: 'error'
})

// 导出配置
export { optimizer, manager }
```

## 下一步

- [性能优化](/guide/performance) - 优化性能
- [安全性](/guide/security) - 安全配置
- [部署指南](/guide/deployment) - 生产环境配置
