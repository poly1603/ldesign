# 快速开始

本指南将帮助你快速上手 @ldesign/crypto 的基本功能。

## 基础加密

### AES 加密解密

AES 是最常用的对称加密算法：

```typescript
import { aes } from '@ldesign/crypto'

// 加密
const encrypted = aes.encrypt('Hello World', 'my-secret-key')
console.log(encrypted)
/*
{
 success: true,
 data: 'encrypted_string',
 iv: 'initialization_vector',
 algorithm: 'AES',
 mode: 'CBC',
 keySize: 256
}
*/

// 解密
const decrypted = aes.decrypt(encrypted, 'my-secret-key')
console.log(decrypted)
/*
{
 success: true,
 data: 'Hello World'
}
*/
```

### 指定加密参数

```typescript
// 使用 AES-128-ECB
const result = aes.encrypt('Hello', 'key', {
 keySize: 128,
 mode: 'ECB'
})

// 便捷方法
const result128 = aes.aes128.encrypt('Hello', 'key')
const result192 = aes.aes192.encrypt('Hello', 'key')
const result256 = aes.aes256.encrypt('Hello', 'key')
```

## 哈希计算

### SHA 哈希

```typescript
import { hash } from '@ldesign/crypto'

// 计算 SHA-256 哈希
const sha256 = hash.sha256('Hello World')
console.log(sha256) // 十六进制字符串

// 其他算法
const md5 = hash.md5('Hello World')
const sha1 = hash.sha1('Hello World')
const sha512 = hash.sha512('Hello World')
```

### 指定输出编码

```typescript
// Base64 编码
const base64Hash = hash.sha256('Hello World', { encoding: 'base64' })

// Hex 编码（默认）
const hexHash = hash.sha256('Hello World', { encoding: 'hex' })
```

### HMAC 消息认证

```typescript
import { hmac } from '@ldesign/crypto'

// 生成 HMAC
const mac = hmac.sha256('message', 'secret-key')
console.log(mac)

// 验证 HMAC
const isValid = hmac.verify('message', 'secret-key', mac, 'SHA256')
console.log(isValid) // true
```

## 编码转换

### Base64 和 Hex

```typescript
import { encoding } from '@ldesign/crypto'

// Base64 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='

// Base64 解码
const decoded = encoding.decode(encoded, 'base64')
console.log(decoded) // 'Hello World'

// Hex 编码
const hexEncoded = encoding.encode('Hello World', 'hex')
console.log(hexEncoded)

// 便捷方法
const b64 = encoding.base64.encode('Hello')
const hexStr = encoding.hex.encode('Hello')
```

## RSA 非对称加密

### 生成密钥对

```typescript
import { rsa } from '@ldesign/crypto'

// 生成 2048 位密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log(keyPair.publicKey)
console.log(keyPair.privateKey)
```

### 加密和解密

```typescript
// 使用公钥加密
const encrypted = rsa.encrypt('Hello World', keyPair.publicKey)
console.log(encrypted)

// 使用私钥解密
const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)
console.log(decrypted.data) // 'Hello World'
```

## 数字签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 使用私钥签名
const signature = digitalSignature.sign('message', keyPair.privateKey, 'SHA256')
console.log(signature)

// 使用公钥验证
const isValid = digitalSignature.verify(
 'message',
 signature,
 keyPair.publicKey,
 'SHA256'
)
console.log(isValid) // true
```

## 密钥生成

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成随机密钥（32 字节）
const key = RandomUtils.generateKey(32)
console.log(key) // 64 个十六进制字符

// 生成随机盐值
const salt = RandomUtils.generateSalt(16)

// 生成随机 IV
const iv = RandomUtils.generateIV(16)
```

## 使用管理器

`CryptoManager` 提供了统一的加密管理接口：

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 加密
const encrypted = cryptoManager.encrypt('Hello', 'key', {
 algorithm: 'AES',
 keySize: 256,
 mode: 'CBC'
})

// 解密
const decrypted = cryptoManager.decrypt(encrypted, 'key')

// 批量加密
const operations = [
 { data: 'data1', key: 'key1' },
 { data: 'data2', key: 'key2' }
]
const results = cryptoManager.batchEncrypt(operations, { algorithm: 'AES' })

// 获取性能指标
const metrics = cryptoManager.getPerformanceMetrics()
console.log(metrics)
```

## 链式调用

```typescript
import { chain, encryptToBase64, decryptFromBase64 } from '@ldesign/crypto'

// 链式加密
const result = chain('Hello World')
 .encrypt('aes', 'key')
 .toBase64()
 .execute()

// 便捷函数
const encrypted = encryptToBase64('Hello', 'key', 'AES')
const decrypted = decryptFromBase64(encrypted, 'key', 'AES')
```

## 认证加密

```typescript
import { encryptWithAuth, decryptWithAuth } from '@ldesign/crypto'

// 加密并生成 MAC
const encrypted = encryptWithAuth('Hello World', 'encryption-key', 'mac-key')
console.log(encrypted)
/*
{
 success: true,
 data: 'encrypted_data',
 mac: 'authentication_code',
 iv: '...'
}
*/

// 解密并验证 MAC
const decrypted = decryptWithAuth(encrypted, 'encryption-key', 'mac-key')
console.log(decrypted)
/*
{
 success: true,
 data: 'Hello World',
 verified: true
}
*/
```

## 错误处理

```typescript
import { aes } from '@ldesign/crypto'

const result = aes.encrypt('Hello', 'key')

if (result.success) {
 console.log('加密成功:', result.data)
} else {
 console.error('加密失败:', result.error)
}

// 解密时密钥错误
const decrypted = aes.decrypt(result, 'wrong-key')
console.log(decrypted.success) // false
console.log(decrypted.error) // 错误信息
```

## Vue 3 快速开始

```vue
<script setup>
import { useEncryption, useHash } from '@ldesign/crypto/vue'

// 使用加密
const encryption = useEncryption()
const handleEncrypt = async () => {
 const result = await encryption.encryptText('Hello', 'password')
 console.log(result)
}

// 使用哈希
const hashUtil = useHash()
const calculateHash = async () => {
 const hash = await hashUtil.sha256('Hello')
 console.log(hash)
}
</script>

<template>
 <div>
  <button @click="handleEncrypt">加密</button>
  <button @click="calculateHash">哈希</button>
 </div>
</template>
```

## 下一步

- [加密](/guide/encryption) - 深入了解加密功能
- [哈希](/guide/hashing) - 学习哈希和 HMAC
- [Vue 集成](/guide/vue-plugin) - 在 Vue 中使用
- [API 参考](/api/) - 查看完整 API
