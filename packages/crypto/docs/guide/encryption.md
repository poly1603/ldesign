# 加密

本指南介绍如何使用 @ldesign/crypto 进行数据加密和解密。

## 对称加密

对称加密使用相同的密钥进行加密和解密，适合大量数据的快速加密。

### AES 加密

AES 是目前最广泛使用的对称加密算法。

#### 基础用法

```typescript
import { aes } from '@ldesign/crypto'

// 默认使用 AES-256-CBC
const encrypted = aes.encrypt('敏感数据', 'my-secret-key')
console.log(encrypted)
/*
{
 success: true,
 data: 'U2FsdGVkX1+...',
 iv: '0123456789abcdef...',
 algorithm: 'AES',
 mode: 'CBC',
 keySize: 256
}
*/

// 解密
const decrypted = aes.decrypt(encrypted, 'my-secret-key')
console.log(decrypted.data) // '敏感数据'
```

#### 密钥长度选择

```typescript
// AES-128 (16 字节密钥)
const result128 = aes.encrypt('data', 'key', { keySize: 128 })

// AES-192 (24 字节密钥)
const result192 = aes.encrypt('data', 'key', { keySize: 192 })

// AES-256 (32 字节密钥，默认，推荐)
const result256 = aes.encrypt('data', 'key', { keySize: 256 })

// 便捷方法
const encrypted = aes.aes256.encrypt('data', 'key')
```

#### 加密模式

```typescript
// CBC 模式（默认，推荐）
const cbcResult = aes.encrypt('data', 'key', { mode: 'CBC' })

// ECB 模式（不推荐用于生产）
const ecbResult = aes.encrypt('data', 'key', { mode: 'ECB' })

// CFB 模式
const cfbResult = aes.encrypt('data', 'key', { mode: 'CFB' })

// OFB 模式
const ofbResult = aes.encrypt('data', 'key', { mode: 'OFB' })

// CTR 模式
const ctrResult = aes.encrypt('data', 'key', { mode: 'CTR' })
```

#### 自定义 IV

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成随机 IV
const iv = RandomUtils.generateIV(16)

// 使用自定义 IV 加密
const encrypted = aes.encrypt('data', 'key', { iv })

// 解密时使用相同 IV
const decrypted = aes.decrypt(encrypted, 'key')
```

### DES 加密

DES 是较老的加密算法，不推荐用于新项目。

```typescript
import { des } from '@ldesign/crypto'

const encrypted = des.encrypt('data', 'secret')
const decrypted = des.decrypt(encrypted, 'secret')
```

### TripleDES 加密

```typescript
import { tripledes, des3 } from '@ldesign/crypto'

// 使用 tripledes 或 des3
const encrypted = tripledes.encrypt('data', 'secret-key')
const decrypted = tripledes.decrypt(encrypted, 'secret-key')
```

### Blowfish 加密

```typescript
import { blowfish } from '@ldesign/crypto'

const encrypted = blowfish.encrypt('data', 'secret-key')
const decrypted = blowfish.decrypt(encrypted, 'secret-key')
```

## 非对称加密

非对称加密使用公钥加密、私钥解密，适合小量数据和密钥交换。

### RSA 加密

#### 生成密钥对

```typescript
import { rsa } from '@ldesign/crypto'

// 生成 2048 位密钥对（默认）
const keyPair = rsa.generateKeyPair()

// 生成 4096 位密钥对（更安全）
const strongKeyPair = rsa.generateKeyPair(4096)

console.log(keyPair.publicKey)  // PEM 格式公钥
console.log(keyPair.privateKey) // PEM 格式私钥
```

#### 加密和解密

```typescript
// 使用公钥加密
const encrypted = rsa.encrypt('Hello World', keyPair.publicKey)
console.log(encrypted)

// 使用私钥解密
const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)
console.log(decrypted.data) // 'Hello World'
```

#### 填充模式

```typescript
// OAEP 填充（推荐）
const result = rsa.encrypt('data', publicKey, {
 padding: 'OAEP',
 hashAlgorithm: 'SHA256'
})

// PKCS1 填充
const result2 = rsa.encrypt('data', publicKey, {
 padding: 'PKCS1'
})
```

#### 大数据加密

RSA 不适合加密大量数据，应使用混合加密：

```typescript
import { aes, rsa, RandomUtils } from '@ldesign/crypto'

// 1. 生成随机 AES 密钥
const aesKey = RandomUtils.generateKey(32)

// 2. 使用 AES 加密大数据
const encryptedData = aes.encrypt(largeData, aesKey)

// 3. 使用 RSA 加密 AES 密钥
const encryptedKey = rsa.encrypt(aesKey, publicKey)

// 传输 encryptedData 和 encryptedKey

// 解密时：
// 1. 使用 RSA 解密 AES 密钥
const decryptedKey = rsa.decrypt(encryptedKey, privateKey)

// 2. 使用 AES 解密数据
const decryptedData = aes.decrypt(encryptedData, decryptedKey.data)
```

## 统一加密接口

使用 `Encrypt` 和 `Decrypt` 类提供统一接口：

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// AES 加密
const aesResult = encrypt.aes('data', 'key')

// RSA 加密
const rsaResult = encrypt.rsa('data', publicKey)

// DES 加密
const desResult = encrypt.des('data', 'key')

// 解密
const aesDecrypted = decrypt.aes(aesResult, 'key')
const rsaDecrypted = decrypt.rsa(rsaResult, privateKey)
const desDecrypted = decrypt.des(desResult, 'key')
```

## 加密管理器

`CryptoManager` 提供高级加密管理功能：

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 加密
const encrypted = cryptoManager.encrypt('data', 'key', {
 algorithm: 'AES',
 keySize: 256,
 mode: 'CBC'
})

// 解密
const decrypted = cryptoManager.decrypt(encrypted, 'key')

// 批量加密
const operations = [
 { data: 'data1', key: 'key1' },
 { data: 'data2', key: 'key2' },
 { data: 'data3', key: 'key3' }
]
const results = cryptoManager.batchEncrypt(operations, {
 algorithm: 'AES',
 parallel: true
})

// 批量解密
const decryptResults = cryptoManager.batchDecrypt(results, 'key')
```

## 流式加密

处理大文件时使用流式加密：

```typescript
import { ChunkEncryptor, ChunkDecryptor } from '@ldesign/crypto'

// 创建加密器
const encryptor = new ChunkEncryptor({
 algorithm: 'aes',
 key: 'secret-key',
 chunkSize: 64 * 1024 // 64KB
})

// 加密数据流
const chunks = ['chunk1', 'chunk2', 'chunk3']
for (const chunk of chunks) {
 const encrypted = encryptor.encryptChunk(chunk)
 // 处理加密后的数据块
}
const final = encryptor.finalize()

// 文件加密
import { encryptFile, decryptFile } from '@ldesign/crypto'

await encryptFile('input.txt', 'output.enc', 'secret-key', {
 algorithm: 'aes',
 onProgress: (progress) => {
  console.log(`进度: ${progress.percentage}%`)
 }
})

await decryptFile('output.enc', 'decrypted.txt', 'secret-key')
```

## 认证加密（AEAD）

认证加密同时保证数据的机密性和完整性：

```typescript
import { encryptWithAuth, decryptWithAuth } from '@ldesign/crypto'

// 加密并生成 MAC
const encrypted = encryptWithAuth('data', 'encryption-key', 'mac-key', {
 algorithm: 'AES',
 keySize: 256
})

console.log(encrypted)
/*
{
 success: true,
 data: 'encrypted_data',
 mac: 'authentication_tag',
 iv: '...',
 algorithm: 'AES'
}
*/

// 解密并验证 MAC
const decrypted = decryptWithAuth(encrypted, 'encryption-key', 'mac-key')

if (decrypted.verified) {
 console.log('数据完整且未被篡改:', decrypted.data)
} else {
 console.error('数据可能被篡改！')
}
```

## Worker 线程加密

利用 Web Worker 进行并行加密：

```typescript
import { getGlobalWorkerPool } from '@ldesign/crypto'

const pool = getGlobalWorkerPool({ maxWorkers: 4 })

// 在 Worker 中加密
const result = await pool.execute({
 type: 'encrypt',
 algorithm: 'aes',
 data: 'large data',
 key: 'secret-key'
})

console.log(result)
```

## 密钥派生

从密码派生加密密钥：

```typescript
import { deriveKey, generateSalt } from '@ldesign/crypto'

// 生成盐值
const salt = generateSalt(16)

// 从密码派生密钥
const derivedKey = deriveKey('user-password', salt, {
 iterations: 100000,
 keyLength: 32,
 digest: 'SHA256'
})

// 使用派生的密钥加密
const encrypted = aes.encrypt('data', derivedKey.key)
```

## 安全建议

### 密钥管理

- **不要硬编码密钥**：从环境变量或安全存储中读取
- **使用强密钥**：至少 256 位随机密钥
- **定期轮换密钥**：使用密钥轮换机制
- **安全存储**：使用操作系统的密钥存储或 HSM

### 算法选择

- **推荐**：AES-256-CBC/CTR/GCM、RSA-OAEP-SHA256
- **避免**：ECB 模式、弱密钥长度、MD5/SHA1

### IV 管理

- **每次加密使用新 IV**：不要重复使用
- **随机生成**：使用 CSPRNG
- **可公开存储**：IV 不需要保密

### 错误处理

```typescript
const result = aes.encrypt('data', 'key')

if (!result.success) {
 // 不要暴露详细错误信息给用户
 console.error('加密失败')
 // 记录详细错误到日志
 logger.error(result.error)
}
```

## 下一步

- [哈希](/guide/hashing) - 学习哈希和 HMAC
- [数字签名](/guide/digital-signature) - 了解数字签名
- [安全性](/guide/security) - 安全最佳实践
- [性能优化](/guide/performance) - 提升加密性能
