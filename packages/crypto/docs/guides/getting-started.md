# 快速开始指南

欢迎使用 @ldesign/crypto！本指南将帮助您快速上手这个强大的 JavaScript 加密库。

## 安装

### 使用 npm

```bash
npm install @ldesign/crypto
```

### 使用 yarn

```bash
yarn add @ldesign/crypto
```

### 使用 pnpm

```bash
pnpm add @ldesign/crypto
```

## 基础用法

### 1. AES 对称加密

AES 是最常用的对称加密算法，适合加密大量数据。

```typescript
import { aes } from '@ldesign/crypto'

// 基础加密
const plaintext = 'Hello, World!'
const secretKey = 'my-secret-key'

const encrypted = aes.encrypt(plaintext, secretKey)
console.log('加密结果:', encrypted)

// 解密
const decrypted = aes.decrypt(encrypted.data, secretKey)
console.log('解密结果:', decrypted.data)
```

### 2. 高级 AES 选项

```typescript
import { aes } from '@ldesign/crypto'

const data = 'Sensitive information'
const key = 'super-secret-key-256-bits'

// 使用 AES-256-CBC 模式
const encrypted = aes.encrypt(data, key, {
  keySize: 256,
  mode: 'CBC',
})

console.log('加密数据:', encrypted.data)
console.log('初始化向量:', encrypted.iv)

// 解密时需要相同的参数
const decrypted = aes.decrypt(encrypted.data, key, {
  keySize: 256,
  mode: 'CBC',
})

console.log('解密结果:', decrypted.data)
```

### 3. RSA 非对称加密

RSA 适合加密小量数据和密钥交换。

```typescript
import { rsa, keyGenerator } from '@ldesign/crypto'

// 生成 RSA 密钥对
const keyPair = keyGenerator.generateRSAKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 使用公钥加密
const message = 'Secret message'
const encrypted = rsa.encrypt(message, keyPair.publicKey)
console.log('加密结果:', encrypted)

// 使用私钥解密
const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)
console.log('解密结果:', decrypted)
```

### 4. 哈希算法

哈希算法用于数据完整性验证和密码存储。

```typescript
import { hash } from '@ldesign/crypto'

const data = 'Hello, Hash!'

// 常用哈希算法
const md5Hash = hash.md5(data)
const sha1Hash = hash.sha1(data)
const sha256Hash = hash.sha256(data)
const sha512Hash = hash.sha512(data)

console.log('MD5:', md5Hash)
console.log('SHA1:', sha1Hash)
console.log('SHA256:', sha256Hash)
console.log('SHA512:', sha512Hash)
```

### 5. HMAC 消息认证码

HMAC 用于验证消息的完整性和真实性。

```typescript
import { hmac } from '@ldesign/crypto'

const message = 'Important message'
const secretKey = 'shared-secret'

// 生成 HMAC
const hmacValue = hmac.sha256(message, secretKey)
console.log('HMAC:', hmacValue)

// 验证 HMAC
const isValid = hmac.verify(message, secretKey, hmacValue, 'SHA256')
console.log('验证结果:', isValid)
```

### 6. 编码和解码

```typescript
import { base64, hex } from '@ldesign/crypto'

const data = 'Hello, Encoding!'

// Base64 编码
const base64Encoded = base64.encode(data)
const base64Decoded = base64.decode(base64Encoded)
console.log('Base64 编码:', base64Encoded)
console.log('Base64 解码:', base64Decoded)

// Hex 编码
const hexEncoded = hex.encode(data)
const hexDecoded = hex.decode(hexEncoded)
console.log('Hex 编码:', hexEncoded)
console.log('Hex 解码:', hexDecoded)
```

## 统一接口

### 使用核心功能类

```typescript
import { encrypt, decrypt, hash } from '@ldesign/crypto'

// 统一的加密接口
const encrypted = encrypt.aes('data', 'key', { keySize: 256 })
const decrypted = decrypt.aes(encrypted.data, 'key', { keySize: 256 })

// 统一的哈希接口
const hashValue = hash.sha256('data')
```

### 使用管理器

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 配置管理器
cryptoManager.configure({
  defaultAlgorithm: 'AES',
  enableCache: true,
  maxCacheSize: 1000,
})

// 使用管理器进行操作
const encrypted = await cryptoManager.encryptData('data', 'key', 'AES')
const decrypted = await cryptoManager.decryptData(encrypted, 'key')
```

## Vue 3 集成

### 安装插件

```typescript
// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')
```

### 使用 Composition API

```vue
<template>
  <div>
    <input v-model="plaintext" placeholder="输入文本" />
    <button @click="handleEncrypt" :disabled="isEncrypting">
      {{ isEncrypting ? '加密中...' : '加密' }}
    </button>
    <div v-if="encryptedData">加密结果: {{ encryptedData }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

const { encryptAES, isEncrypting } = useCrypto()

const plaintext = ref('Hello, Vue!')
const encryptedData = ref('')

const handleEncrypt = async () => {
  try {
    const result = await encryptAES(plaintext.value, 'secret-key')
    encryptedData.value = result
  } catch (error) {
    console.error('加密失败:', error)
  }
}
</script>
```

## 常见用例

### 1. 用户密码加密

```typescript
import { hash, RandomUtils } from '@ldesign/crypto'

function hashPassword(password: string): { hash: string; salt: string } {
  const salt = RandomUtils.generateRandomHex(32)
  const hashedPassword = hash.sha256(password + salt)

  return { hash: hashedPassword, salt }
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = hash.sha256(password + salt)
  return computedHash === hash
}

// 注册时
const { hash: hashedPassword, salt } = hashPassword('user-password')
// 存储 hashedPassword 和 salt 到数据库

// 登录时
const isValid = verifyPassword('user-password', hashedPassword, salt)
```

### 2. 敏感数据存储

```typescript
import { aes, keyGenerator } from '@ldesign/crypto'

class DataVault {
  private masterKey = process.env.MASTER_KEY!

  encrypt(data: string): { encrypted: string; iv: string } {
    const iv = keyGenerator.generateIV(16)
    const encrypted = aes.encrypt(data, this.masterKey, {
      keySize: 256,
      mode: 'CBC',
      iv,
    })

    return {
      encrypted: encrypted.data!,
      iv: encrypted.iv!,
    }
  }

  decrypt(encrypted: string, iv: string): string {
    const decrypted = aes.decrypt(encrypted, this.masterKey, {
      keySize: 256,
      mode: 'CBC',
      iv,
    })

    return decrypted.data!
  }
}

const vault = new DataVault()

// 加密敏感数据
const { encrypted, iv } = vault.encrypt('sensitive information')

// 解密数据
const decrypted = vault.decrypt(encrypted, iv)
```

### 3. API 签名验证

```typescript
import { hmac } from '@ldesign/crypto'

function generateAPISignature(
  method: string,
  url: string,
  body: string,
  timestamp: number,
  secretKey: string
): string {
  const signatureString = `${method}\n${url}\n${body}\n${timestamp}`
  return hmac.sha256(signatureString, secretKey)
}

function verifyAPISignature(
  method: string,
  url: string,
  body: string,
  timestamp: number,
  signature: string,
  secretKey: string
): boolean {
  const expectedSignature = generateAPISignature(method, url, body, timestamp, secretKey)
  return signature === expectedSignature
}

// 客户端生成签名
const timestamp = Date.now()
const signature = generateAPISignature('POST', '/api/data', '{"key":"value"}', timestamp, 'secret')

// 服务端验证签名
const isValid = verifyAPISignature(
  'POST',
  '/api/data',
  '{"key":"value"}',
  timestamp,
  signature,
  'secret'
)
```

## 错误处理

### 基本错误处理

```typescript
import { aes } from '@ldesign/crypto'

try {
  const encrypted = aes.encrypt('data', 'key')

  if (encrypted.success) {
    console.log('加密成功:', encrypted.data)
  } else {
    console.error('加密失败:', encrypted.error)
  }
} catch (error) {
  console.error('加密异常:', error.message)
}
```

### 高级错误处理

```typescript
import { EncryptionError, DecryptionError } from '@ldesign/crypto'

function safeEncrypt(data: string, key: string) {
  try {
    const result = aes.encrypt(data, key)
    return { success: true, data: result.data }
  } catch (error) {
    if (error instanceof EncryptionError) {
      return { success: false, error: '加密失败: ' + error.message }
    } else {
      return { success: false, error: '未知错误: ' + error.message }
    }
  }
}
```

## 性能优化

### 启用缓存

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 启用缓存以提高重复操作的性能
cryptoManager.configure({
  enableCache: true,
  maxCacheSize: 1000,
  cacheTimeout: 300000, // 5分钟
})
```

### 批量处理

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer()

const operations = [
  { type: 'encrypt', data: 'data1', key: 'key1', algorithm: 'AES' },
  { type: 'encrypt', data: 'data2', key: 'key2', algorithm: 'AES' },
  { type: 'hash', data: 'data3', algorithm: 'SHA256' },
]

const results = await optimizer.processBatch(operations)
```

## 安全最佳实践

1. **密钥管理**

   - 使用环境变量存储密钥
   - 定期轮换密钥
   - 使用强随机数生成器

2. **算法选择**

   - 优先使用 AES-256 进行对称加密
   - 使用 RSA-2048 或更高位数进行非对称加密
   - 使用 SHA-256 或更强的哈希算法

3. **数据处理**
   - 及时清理敏感数据
   - 使用 HTTPS 传输加密数据
   - 验证输入数据的完整性

## 下一步

- 查看 [API 参考文档](../api/index.md) 了解详细的 API 说明
- 阅读 [实战教程](../tutorials/practical-examples.md) 学习更多应用场景
- 参考 [Vue 集成指南](../frameworks/vue-integration.md) 了解框架集成
- 查看 [性能优化指南](./performance-optimization.md) 提升应用性能

如果遇到问题，请查看 [故障排除指南](./troubleshooting.md) 或提交
[GitHub Issue](https://github.com/ldesign/crypto/issues)。
