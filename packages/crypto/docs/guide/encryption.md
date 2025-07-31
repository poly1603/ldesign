# 加密算法

@ldesign/crypto 支持多种加密算法，包括对称加密和非对称加密。

## 对称加密

### AES (Advanced Encryption Standard)

AES 是目前最广泛使用的对称加密算法，支持 128、192 和 256 位密钥长度。

#### 支持的模式

- **CBC (Cipher Block Chaining)**: 默认模式，安全性高
- **ECB (Electronic Codebook)**: 简单但不推荐用于生产环境
- **CFB (Cipher Feedback)**: 流密码模式
- **OFB (Output Feedback)**: 流密码模式
- **CTR (Counter)**: 计数器模式，支持并行处理

#### 基本用法

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// 使用默认设置 (AES-256-CBC)
const encrypted = encrypt.aes('Hello, World!', 'my-secret-key')
console.log(encrypted)
// {
//   data: "encrypted-data-string",
//   algorithm: "AES-256-CBC",
//   iv: "initialization-vector"
// }

// 解密
const decrypted = decrypt.aes(encrypted, 'my-secret-key')
console.log(decrypted.data) // "Hello, World!"
```

#### 指定密钥长度和模式

```typescript
// AES-128-ECB
const encrypted128 = encrypt.aes('data', 'key', {
  keySize: 128,
  mode: 'ECB'
})

// AES-192-CFB
const encrypted192 = encrypt.aes('data', 'key', {
  keySize: 192,
  mode: 'CFB'
})

// AES-256-CTR (推荐用于高性能场景)
const encrypted256 = encrypt.aes('data', 'key', {
  keySize: 256,
  mode: 'CTR'
})
```

#### 自定义初始化向量 (IV)

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成随机 IV
const iv = keyGenerator.generateIV(16)

const encrypted = encrypt.aes('data', 'key', {
  iv: iv
})

// 解密时使用相同的 IV
const decrypted = decrypt.aes(encrypted, 'key', {
  iv: iv
})
```

## 非对称加密

### RSA

RSA 是最常用的非对称加密算法，支持加密、解密和数字签名。

#### 密钥生成

```typescript
import { rsa } from '@ldesign/crypto'

// 生成 2048 位密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log(keyPair.publicKey)  // PEM 格式公钥
console.log(keyPair.privateKey) // PEM 格式私钥

// 支持的密钥长度: 1024, 2048, 3072, 4096
const keyPair4096 = rsa.generateKeyPair(4096)
```

#### 加密和解密

```typescript
// 使用公钥加密
const encrypted = encrypt.rsa('Hello, RSA!', keyPair.publicKey)

// 使用私钥解密
const decrypted = decrypt.rsa(encrypted, keyPair.privateKey)
console.log(decrypted.data) // "Hello, RSA!"
```

#### 数字签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

const data = 'Important message'

// 使用私钥签名
const signature = digitalSignature.sign(data, keyPair.privateKey)

// 使用公钥验证签名
const isValid = digitalSignature.verify(data, signature, keyPair.publicKey)
console.log(isValid) // true
```

## 最佳实践

### 密钥管理

1. **使用强密钥**: 密钥应该足够长且随机
2. **安全存储**: 永远不要在代码中硬编码密钥
3. **定期轮换**: 定期更换加密密钥
4. **分离存储**: 密钥和加密数据分开存储

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成强随机密钥
const strongKey = keyGenerator.generateKey(32) // 256 位密钥

// 生成盐值用于密钥派生
const salt = keyGenerator.generateSalt(16)
```

### 选择合适的算法

- **AES-256-CBC**: 通用场景，平衡安全性和性能
- **AES-256-GCM**: 需要认证加密时使用
- **RSA-2048**: 一般用途的非对称加密
- **RSA-4096**: 高安全要求的场景

### 错误处理

```typescript
try {
  const encrypted = encrypt.aes('data', 'key')
  const decrypted = decrypt.aes(encrypted, 'key')
  
  if (!decrypted.success) {
    console.error('解密失败:', decrypted.error)
  }
} catch (error) {
  console.error('加密操作失败:', error.message)
}
```

## 性能考虑

### AES 性能优化

- 对于大量数据，使用 CTR 模式可以并行处理
- 预生成 IV 可以提高批量加密性能
- 重用密钥对象避免重复的密钥派生

### RSA 性能考虑

- RSA 加密速度较慢，不适合大数据量
- 通常用 RSA 加密 AES 密钥，用 AES 加密实际数据
- 选择合适的密钥长度平衡安全性和性能

```typescript
// 混合加密示例：RSA + AES
const aesKey = keyGenerator.generateKey(32)
const data = 'Large amount of data...'

// 用 AES 加密数据
const encryptedData = encrypt.aes(data, aesKey)

// 用 RSA 加密 AES 密钥
const encryptedKey = encrypt.rsa(aesKey, rsaPublicKey)

// 传输 encryptedData 和 encryptedKey
```
