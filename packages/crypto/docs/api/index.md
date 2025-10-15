# API 参考文档

欢迎使用 @ldesign/crypto API 参考文档。本库提供了全面的加密、解密、哈希等密码学功能。

## 快速导航

- [加密 API](./encryption.md) - 对称和非对称加密功能
- [解密 API](./decryption.md) - 解密功能
- [哈希 API](./hashing.md) - 消息摘要和 HMAC
- [密钥生成 API](./key-generation.md) - 密钥和随机数生成
- [管理器 API](./manager.md) - 统一的加解密管理器
- [工具函数 API](./utilities.md) - 实用工具函数
- [类型定义 API](./types.md) - TypeScript 类型定义

## 核心概念

### 加密算法

@ldesign/crypto 支持以下加密算法：

- **AES**（高级加密标准）：对称加密，支持 128/192/256 位密钥
- **RSA**：非对称加密，支持 1024/2048/3072/4096 位密钥
- **DES/3DES**：传统对称加密算法
- **Blowfish**：对称分组密码

### 哈希算法

支持的哈希算法：

- MD5
- SHA-1
- SHA-224/256/384/512
- HMAC-MD5/SHA1/SHA256/SHA384/SHA512

### 编码方式

支持的编码类型：

- **Base64**：标准和 URL 安全编码
- **Hex**：十六进制编码
- **UTF-8**：标准文本编码

## 基本使用

### 导入方式

```typescript
// 默认导入（推荐）
import crypto from '@ldesign/crypto'

// 命名导入
import { encrypt, decrypt, hash } from '@ldesign/crypto'

// 导入类
import { Encrypt, Decrypt, Hash, CryptoManager } from '@ldesign/crypto'
```

### 快速示例

```typescript
import crypto from '@ldesign/crypto'

// 加密和解密
const encrypted = crypto.encrypt.aes('Hello World', 'secret-key')
const decrypted = crypto.decrypt.aes(encrypted, 'secret-key')

// 哈希
const hash = crypto.hash.sha256('password')

// HMAC
const hmac = crypto.hmac.sha256('message', 'secret-key')

// 密钥生成
const key = crypto.keyGenerator.generateKey(32)
const rsaKeys = crypto.keyGenerator.generateRSAKeyPair(2048)
```

## 结果结构

### EncryptResult

加密操作返回的结果对象：

```typescript
interface EncryptResult {
  success: boolean       // 操作是否成功
  data?: string         // 加密后的数据
  algorithm: string       // 使用的算法
  mode?: string         // 加密模式
  iv?: string          // 初始化向量
  salt?: string         // 盐值
  keySize?: number       // 密钥大小（位）
  error?: string        // 错误信息
}
```

### DecryptResult

解密操作返回的结果对象：

```typescript
interface DecryptResult {
  success: boolean       // 操作是否成功
  data?: string         // 解密后的数据
  algorithm: string       // 使用的算法
  mode?: string         // 加密模式
  error?: string        // 错误信息
}
```

### HashResult

哈希操作返回的结果对象：

```typescript
interface HashResult {
  success: boolean       // 操作是否成功
  hash: string         // 哈希值
  algorithm: string       // 使用的算法
  encoding: EncodingType    // 编码类型
  error?: string        // 错误信息
}
```

## 高级特性

### 链式调用

使用链式 API 进行流畅的操作：

```typescript
import { chain } from '@ldesign/crypto'

// 加密并编码
const result = chain('Hello World')
  .encrypt('AES', 'secret-key')
  .base64()
  .execute()

// 解码并解密
const decrypted = chain(result)
  .fromBase64()
  .decrypt('AES', 'secret-key')
  .execute()
```

### 认证加密

提供数据机密性和完整性保护：

```typescript
import { encryptWithAuth, decryptWithAuth } from '@ldesign/crypto'

// 加密并认证
const result = encryptWithAuth('sensitive data', 'secret-key')

// 解密并验证
const decrypted = decryptWithAuth(result, 'secret-key')
if (decrypted.verified) {
  console.log('数据完整且未被篡改:', decrypted.data)
}
```

### 批量操作

使用管理器进行批量加密/解密：

```typescript
import { cryptoManager } from '@ldesign/crypto'

const operations = [
  { id: '1', data: 'data1', key: 'key1', algorithm: 'AES' },
  { id: '2', data: 'data2', key: 'key2', algorithm: 'AES' }
]

const results = await cryptoManager.batchEncrypt(operations)
```

## 性能优化

库内置了多种性能优化：

1. **LRU 缓存**：密钥派生结果缓存
2. **对象池**：复用加密/解密结果对象
3. **单例模式**：避免重复实例化
4. **并行处理**：批量操作支持并行执行

## 安全建议

1. **密钥管理**
   - 使用强随机密钥
   - 定期轮换密钥
   - 安全存储密钥（不要硬编码）

2. **算法选择**
   - 优先使用 AES-256-CBC 或 AES-256-GCM
   - RSA 仅用于密钥交换或签名
   - 避免使用 DES 和 MD5（已不安全）

3. **初始化向量**
   - 每次加密使用不同的 IV
   - 不要重用 IV

4. **密钥派生**
   - 使用足够的迭代次数（推荐 100,000+）
   - 使用随机盐值

## 错误处理

所有 API 都提供友好的错误处理：

```typescript
const result = crypto.encrypt.aes('data', 'key')
if (!result.success) {
  console.error('加密失败:', result.error)
}
```

链式 API 的错误处理：

```typescript
const chain = crypto.chain('data')
  .encrypt('AES', 'key')
  .base64()

if (chain.hasError()) {
  console.error('操作失败:', chain.getError())
} else {
  const result = chain.execute()
}
```

## TypeScript 支持

完整的 TypeScript 类型定义和智能提示：

```typescript
import type {
  EncryptResult,
  DecryptResult,
  HashResult,
  AESOptions,
  RSAOptions,
  HashAlgorithm
} from '@ldesign/crypto'
```

## 下一步

- 查看详细的 [加密 API 文档](./encryption.md)
- 了解 [管理器 API](./manager.md) 的高级功能
- 探索 [工具函数](./utilities.md) 提供的实用功能

## 版本信息

当前版本：0.1.0

## 相关资源

- [快速开始指南](../README.md)
- [示例代码](../examples/)
- [GitHub 仓库](https://github.com/ldesign/crypto)
