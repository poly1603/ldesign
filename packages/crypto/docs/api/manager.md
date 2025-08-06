# 统一管理器 API

`CryptoManager` 是一个统一的加解密管理器，提供简化的 API 和性能优化功能。

## 类：CryptoManager

### 构造函数

```typescript
constructor(config?: CryptoConfig)
```

创建一个新的 CryptoManager 实例。

**参数：**

- `config` (可选): 配置选项

**示例：**

```typescript
import { CryptoManager } from '@ldesign/crypto'

// 使用默认配置
const manager = new CryptoManager()

// 使用自定义配置
const manager = new CryptoManager({
  defaultAlgorithm: 'AES',
  enableCache: true,
  debug: true
})
```

### 配置选项

```typescript
interface CryptoConfig {
  defaultAlgorithm?: EncryptionAlgorithm
  enableCache?: boolean
  maxCacheSize?: number
  enableParallel?: boolean
  autoGenerateIV?: boolean
  keyDerivation?: boolean
  debug?: boolean
  logLevel?: 'error' | 'warn' | 'info' | 'debug'
}
```

**属性说明：**

- `defaultAlgorithm`: 默认加密算法（默认：'AES'）
- `enableCache`: 是否启用缓存（默认：true）
- `maxCacheSize`: 最大缓存大小（默认：1000）
- `enableParallel`: 是否启用并行处理（默认：true）
- `autoGenerateIV`: 是否自动生成 IV（默认：true）
- `keyDerivation`: 是否启用密钥派生（默认：false）
- `debug`: 是否启用调试模式（默认：false）
- `logLevel`: 日志级别（默认：'error'）

## 核心方法

### encryptData()

```typescript
async encryptData(
  data: string,
  key: string,
  algorithm?: EncryptionAlgorithm,
  options?: any
): Promise<EncryptResult>
```

加密数据。

**参数：**

- `data`: 要加密的数据
- `key`: 加密密钥
- `algorithm` (可选): 加密算法，默认使用配置中的默认算法
- `options` (可选): 算法特定的选项

**返回值：**

- `Promise<EncryptResult>`: 加密结果

**示例：**

```typescript
const manager = new CryptoManager()

// 使用默认算法（AES）
const result1 = await manager.encryptData('Hello World', 'secret-key')

// 指定算法
const result2 = await manager.encryptData('Hello World', 'secret-key', 'DES')

// 带选项
const result3 = await manager.encryptData('Hello World', 'secret-key', 'AES', {
  mode: 'CBC',
  keySize: 256
})
```

### decryptData()

```typescript
async decryptData(
  encryptedData: string | EncryptResult,
  key: string,
  algorithm?: EncryptionAlgorithm,
  options?: any
): Promise<DecryptResult>
```

解密数据。

**参数：**

- `encryptedData`: 加密的数据或加密结果对象
- `key`: 解密密钥
- `algorithm` (可选): 解密算法，如果传入 EncryptResult 对象会自动识别
- `options` (可选): 算法特定的选项

**返回值：**

- `Promise<DecryptResult>`: 解密结果

**示例：**

```typescript
const manager = new CryptoManager()

// 解密字符串（需要指定算法）
const result1 = await manager.decryptData('encrypted_string', 'secret-key', 'AES')

// 解密 EncryptResult 对象（自动识别算法）
const encrypted = await manager.encryptData('Hello World', 'secret-key')
const result2 = await manager.decryptData(encrypted, 'secret-key')
```

## 批量操作

### batchEncrypt()

```typescript
async batchEncrypt(
  operations: BatchOperation[]
): Promise<Array<{ id: string; result: EncryptResult }>>
```

批量加密操作。

**参数：**

- `operations`: 批量操作数组

**返回值：**

- `Promise<Array<{ id: string; result: EncryptResult }>>`: 批量加密结果

**示例：**

```typescript
const manager = new CryptoManager()

const operations = [
  { id: '1', data: 'Message 1', key: 'key1', algorithm: 'AES' as const },
  { id: '2', data: 'Message 2', key: 'key2', algorithm: 'DES' as const },
  { id: '3', data: 'Message 3', key: 'key3', algorithm: '3DES' as const }
]

const results = await manager.batchEncrypt(operations)
console.log('批量加密结果:', results)
```

### batchDecrypt()

```typescript
async batchDecrypt(
  operations: BatchOperation[]
): Promise<Array<{ id: string; result: DecryptResult }>>
```

批量解密操作。

**参数：**

- `operations`: 批量操作数组

**返回值：**

- `Promise<Array<{ id: string; result: DecryptResult }>>`: 批量解密结果

## 工具方法

### hashData()

```typescript
hashData(
  data: string,
  algorithm?: HashAlgorithm,
  options?: HashOptions
): HashResult
```

计算数据哈希值。

**参数：**

- `data`: 要哈希的数据
- `algorithm` (可选): 哈希算法（默认：'SHA256'）
- `options` (可选): 哈希选项

**返回值：**

- `HashResult`: 哈希结果

### hmacData()

```typescript
hmacData(
  data: string,
  key: string,
  algorithm?: HashAlgorithm
): HashResult
```

计算 HMAC 值。

**参数：**

- `data`: 要计算 HMAC 的数据
- `key`: HMAC 密钥
- `algorithm` (可选): 哈希算法（默认：'SHA256'）

**返回值：**

- `HashResult`: HMAC 结果

### generateKey()

```typescript
generateKey(
  algorithm: EncryptionAlgorithm,
  keySize?: number
): string | RSAKeyPair
```

生成密钥。

**参数：**

- `algorithm`: 算法类型
- `keySize` (可选): 密钥大小

**返回值：**

- `string | RSAKeyPair`: 生成的密钥

**示例：**

```typescript
const manager = new CryptoManager()

// 生成 AES 密钥
const aesKey = manager.generateKey('AES', 256)

// 生成 RSA 密钥对
const rsaKeys = manager.generateKey('RSA', 2048)

// 生成 DES 密钥
const desKey = manager.generateKey('DES')
```

## 管理方法

### getSupportedAlgorithms()

```typescript
getSupportedAlgorithms(): EncryptionAlgorithm[]
```

获取支持的算法列表。

**返回值：**

- `EncryptionAlgorithm[]`: 支持的算法数组

### getPerformanceStats()

```typescript
getPerformanceStats(): CacheStats
```

获取性能统计信息。

**返回值：**

- `CacheStats`: 缓存统计信息

### clearCache()

```typescript
clearCache(): void
```

清除缓存。

### updateConfig()

```typescript
updateConfig(newConfig: Partial<CryptoConfig>): void
```

更新配置。

**参数：**

- `newConfig`: 新的配置选项

### getConfig()

```typescript
getConfig(): CryptoConfig
```

获取当前配置。

**返回值：**

- `CryptoConfig`: 当前配置

## 默认实例

库提供了一个默认的管理器实例：

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 直接使用默认实例
const result = await cryptoManager.encryptData('Hello World', 'secret-key')
```

## 完整示例

```typescript
import { CryptoManager } from '@ldesign/crypto'

// 创建管理器实例
const manager = new CryptoManager({
  defaultAlgorithm: 'AES',
  enableCache: true,
  debug: true,
  logLevel: 'info'
})

async function example() {
  try {
    // 加密数据
    const encrypted = await manager.encryptData(
      'Sensitive information',
      'my-secret-key',
      'AES',
      { mode: 'CBC', keySize: 256 }
    )

    console.log('加密成功:', encrypted)

    // 解密数据
    const decrypted = await manager.decryptData(encrypted, 'my-secret-key')

    console.log('解密成功:', decrypted.data)

    // 计算哈希
    const hash = manager.hashData('Hello World', 'SHA256')
    console.log('哈希值:', hash.hash)

    // 生成密钥
    const newKey = manager.generateKey('AES', 256)
    console.log('新密钥:', newKey)

    // 获取性能统计
    const stats = manager.getPerformanceStats()
    console.log('性能统计:', stats)
  }
  catch (error) {
    console.error('操作失败:', error)
  }
}

example()
```

## 类型定义

```typescript
interface BatchOperation {
  id: string
  data: string
  key: string
  algorithm: EncryptionAlgorithm
  options?: any
}

interface CacheStats {
  keyCache: number
  resultCache: number
  maxSize: number
}
```
