# 数字签名指南

本指南介绍如何使用 @ldesign/crypto 进行数字签名和验证。

## 概述

数字签名使用非对称加密技术，通过私钥对数据生成签名，然后使用对应的公钥验证签名的真实性。数字签名可以确保：

- **身份认证**：验证数据来源
- **数据完整性**：确保数据未被篡改
- **不可否认性**：签名者无法否认签名行为

## 基础用法

### 生成密钥对

```typescript
import { rsa } from '@ldesign/crypto'

// 生成 RSA 密钥对
const keyPair = rsa.generateKeyPair(2048)

console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)
```

### 签名和验证

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 使用私钥签名
const message = 'Important message'
const signature = digitalSignature.sign(message, keyPair.privateKey, 'SHA256')

console.log('签名:', signature)

// 使用公钥验证
const isValid = digitalSignature.verify(
 message,
 signature,
 keyPair.publicKey,
 'SHA256'
)

console.log('签名有效:', isValid) // true
```

## 支持的哈希算法

数字签名支持多种哈希算法：

```typescript
import { digitalSignature } from '@ldesign/crypto'

// SHA256（推荐）
const sig256 = digitalSignature.sign(data, privateKey, 'SHA256')

// SHA512（更高安全性）
const sig512 = digitalSignature.sign(data, privateKey, 'SHA512')

// SHA1（不推荐，仅用于兼容性）
const sig1 = digitalSignature.sign(data, privateKey, 'SHA1')

// MD5（不推荐，仅用于兼容性）
const sigMd5 = digitalSignature.sign(data, privateKey, 'MD5')
```

## 完整示例

### 文档签名

```typescript
import { rsa, digitalSignature } from '@ldesign/crypto'

// 1. 生成密钥对
const keyPair = rsa.generateKeyPair(2048)

// 2. 文档内容
const document = {
 id: '12345',
 content: 'This is an important document',
 timestamp: Date.now()
}

// 3. 序列化文档
const documentString = JSON.stringify(document)

// 4. 签名
const signature = digitalSignature.sign(
 documentString,
 keyPair.privateKey,
 'SHA256'
)

// 5. 发送文档和签名
const signedDocument = {
 document,
 signature,
 publicKey: keyPair.publicKey
}

// 6. 验证签名
const receivedDoc = signedDocument.document
const receivedSig = signedDocument.signature
const receivedPubKey = signedDocument.publicKey

const isValid = digitalSignature.verify(
 JSON.stringify(receivedDoc),
 receivedSig,
 receivedPubKey,
 'SHA256'
)

console.log('文档签名有效:', isValid)
```

### API 请求签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 签名 API 请求
function signApiRequest(
 method: string,
 url: string,
 body: any,
 privateKey: string
): string {
 // 构建待签名字符串
 const signString = `${method}\n${url}\n${JSON.stringify(body)}\n${Date.now()}`

 // 生成签名
 return digitalSignature.sign(signString, privateKey, 'SHA256')
}

// 验证 API 请求
function verifyApiRequest(
 method: string,
 url: string,
 body: any,
 signature: string,
 publicKey: string,
 timestamp: number
): boolean {
 // 检查时间戳（防止重放攻击）
 const now = Date.now()
 if (now - timestamp > 60000) { // 60秒有效期
  return false
 }

 // 重建待签名字符串
 const signString = `${method}\n${url}\n${JSON.stringify(body)}\n${timestamp}`

 // 验证签名
 return digitalSignature.verify(signString, signature, publicKey, 'SHA256')
}

// 使用
const signature = signApiRequest('POST', '/api/data', { value: 123 }, privateKey)
const isValid = verifyApiRequest('POST', '/api/data', { value: 123 }, signature, publicKey, Date.now())
```

## 密钥管理

### 密钥存储

```typescript
import { rsa } from '@ldesign/crypto'

// 生成密钥对
const keyPair = rsa.generateKeyPair(2048)

// 存储密钥（示例）
localStorage.setItem('privateKey', keyPair.privateKey)
localStorage.setItem('publicKey', keyPair.publicKey)

// 读取密钥
const storedPrivateKey = localStorage.getItem('privateKey')
const storedPublicKey = localStorage.getItem('publicKey')
```

### 安全存储

```typescript
import { aes, rsa } from '@ldesign/crypto'

// 加密存储私钥
const keyPair = rsa.generateKeyPair(2048)
const masterPassword = 'user-master-password'

// 加密私钥
const encryptedPrivateKey = aes.encrypt(keyPair.privateKey, masterPassword)

// 存储加密后的私钥
localStorage.setItem('encryptedPrivateKey', JSON.stringify(encryptedPrivateKey))
localStorage.setItem('publicKey', keyPair.publicKey)

// 使用时解密
const storedEncrypted = JSON.parse(localStorage.getItem('encryptedPrivateKey'))
const decryptedKey = aes.decrypt(storedEncrypted, masterPassword)

if (decryptedKey.success) {
 const privateKey = decryptedKey.data
 // 使用私钥进行签名
}
```

## 签名格式

### Base64 签名

```typescript
import { digitalSignature, base64 } from '@ldesign/crypto'

// 生成签名并编码为 Base64
const signature = digitalSignature.sign(message, privateKey, 'SHA256')
const base64Signature = base64.encode(signature)

// 解码并验证
const decodedSignature = base64.decode(base64Signature)
const isValid = digitalSignature.verify(message, decodedSignature, publicKey, 'SHA256')
```

### Hex 签名

```typescript
import { digitalSignature, hex } from '@ldesign/crypto'

// 生成签名并编码为 Hex
const signature = digitalSignature.sign(message, privateKey, 'SHA256')
const hexSignature = hex.encode(signature)

// 解码并验证
const decodedSignature = hex.decode(hexSignature)
const isValid = digitalSignature.verify(message, decodedSignature, publicKey, 'SHA256')
```

## 高级应用

### 多重签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 多个签名者
const signers = [
 { name: 'Alice', keyPair: rsa.generateKeyPair(2048) },
 { name: 'Bob', keyPair: rsa.generateKeyPair(2048) },
 { name: 'Charlie', keyPair: rsa.generateKeyPair(2048) }
]

// 文档
const document = 'Multi-signature document'

// 每个签名者签名
const signatures = signers.map(signer => ({
 signer: signer.name,
 signature: digitalSignature.sign(document, signer.keyPair.privateKey, 'SHA256'),
 publicKey: signer.keyPair.publicKey
}))

// 验证所有签名
const allValid = signatures.every(sig =>
 digitalSignature.verify(document, sig.signature, sig.publicKey, 'SHA256')
)

console.log('所有签名有效:', allValid)
```

### 时间戳签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 带时间戳的签名
function signWithTimestamp(data: string, privateKey: string): {
 data: string
 timestamp: number
 signature: string
} {
 const timestamp = Date.now()
 const signData = `${data}|${timestamp}`
 const signature = digitalSignature.sign(signData, privateKey, 'SHA256')

 return {
  data,
  timestamp,
  signature
 }
}

// 验证带时间戳的签名
function verifyWithTimestamp(
 data: string,
 timestamp: number,
 signature: string,
 publicKey: string,
 maxAge: number = 3600000 // 1小时
): boolean {
 // 检查时间戳
 const now = Date.now()
 if (now - timestamp > maxAge) {
  return false
 }

 // 验证签名
 const signData = `${data}|${timestamp}`
 return digitalSignature.verify(signData, signature, publicKey, 'SHA256')
}

// 使用
const signed = signWithTimestamp('important data', privateKey)
const isValid = verifyWithTimestamp(
 signed.data,
 signed.timestamp,
 signed.signature,
 publicKey
)
```

### 链式签名

```typescript
import { digitalSignature, hash } from '@ldesign/crypto'

// 签名链（类似区块链）
interface SignedBlock {
 data: string
 previousHash: string
 timestamp: number
 signature: string
}

function createSignedBlock(
 data: string,
 previousHash: string,
 privateKey: string
): SignedBlock {
 const timestamp = Date.now()
 const blockData = `${data}|${previousHash}|${timestamp}`
 const signature = digitalSignature.sign(blockData, privateKey, 'SHA256')

 return {
  data,
  previousHash,
  timestamp,
  signature
 }
}

function verifySignedBlock(
 block: SignedBlock,
 publicKey: string
): boolean {
 const blockData = `${block.data}|${block.previousHash}|${block.timestamp}`
 return digitalSignature.verify(blockData, block.signature, publicKey, 'SHA256')
}

// 使用
const keyPair = rsa.generateKeyPair(2048)
const genesisBlock = createSignedBlock('Genesis', '0', keyPair.privateKey)
const block2 = createSignedBlock(
 'Block 2',
 hash.sha256(JSON.stringify(genesisBlock)),
 keyPair.privateKey
)

const isValid = verifySignedBlock(block2, keyPair.publicKey)
```

## Vue 3 集成

### 使用组合式函数

```vue
<script setup>
import { useSignature } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { sign, verify, generateKeyPair, loading, error } = useSignature()

const message = ref('')
const signature = ref('')
const keyPair = ref(null)

// 生成密钥对
const handleGenerateKeys = async () => {
 keyPair.value = await generateKeyPair(2048)
}

// 签名
const handleSign = async () => {
 if (!keyPair.value) return

 signature.value = await sign(
  message.value,
  keyPair.value.privateKey,
  'SHA256'
 )
}

// 验证
const handleVerify = async () => {
 if (!keyPair.value || !signature.value) return

 const isValid = await verify(
  message.value,
  signature.value,
  keyPair.value.publicKey,
  'SHA256'
 )

 console.log('签名有效:', isValid)
}
</script>

<template>
 <div>
  <button @click="handleGenerateKeys">生成密钥对</button>
  <input v-model="message" placeholder="输入消息" />
  <button @click="handleSign" :disabled="!keyPair">签名</button>
  <button @click="handleVerify" :disabled="!signature">验证</button>

  <div v-if="loading">处理中...</div>
  <div v-if="error">错误: {{ error }}</div>
  <div v-if="signature">签名: {{ signature }}</div>
 </div>
</template>
```

## 错误处理

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 安全的签名
function safeSign(
 data: string,
 privateKey: string,
 algorithm: 'SHA256' | 'SHA512' = 'SHA256'
): string | null {
 try {
  return digitalSignature.sign(data, privateKey, algorithm)
 } catch (error) {
  console.error('签名失败:', error)
  return null
 }
}

// 安全的验证
function safeVerify(
 data: string,
 signature: string,
 publicKey: string,
 algorithm: 'SHA256' | 'SHA512' = 'SHA256'
): boolean {
 try {
  return digitalSignature.verify(data, signature, publicKey, algorithm)
 } catch (error) {
  console.error('验证失败:', error)
  return false
 }
}
```

## 安全建议

### 密钥安全

```typescript
// 不要在客户端硬编码私钥
// 错误示例：
const privateKey = '-----BEGIN PRIVATE KEY-----...' // 危险！

// 正确做法：
// 1. 私钥存储在服务器端
// 2. 或使用用户密码加密后存储
// 3. 公钥可以公开分发
```

### 算法选择

```typescript
// 推荐使用 SHA256 或 SHA512
const signature = digitalSignature.sign(data, privateKey, 'SHA256')

// 避免使用 MD5 或 SHA1（安全性较弱）
// const signature = digitalSignature.sign(data, privateKey, 'MD5') // 不推荐
```

### 密钥长度

```typescript
// 至少使用 2048 位密钥
const keyPair = rsa.generateKeyPair(2048)

// 更高安全性使用 4096 位
const strongKeyPair = rsa.generateKeyPair(4096)

// 不要使用 1024 位或更短（不安全）
// const weakKeyPair = rsa.generateKeyPair(1024) // 不推荐
```

### 签名验证

```typescript
// 始终验证签名
const isValid = digitalSignature.verify(data, signature, publicKey, 'SHA256')

if (isValid) {
 // 处理已验证的数据
 processData(data)
} else {
 // 拒绝无效数据
 console.error('签名验证失败，数据可能被篡改')
}
```

### 时间戳保护

```typescript
// 使用时间戳防止重放攻击
function createTimestampedSignature(data: string, privateKey: string) {
 const timestamp = Date.now()
 const nonce = Math.random().toString(36)
 const signData = `${data}|${timestamp}|${nonce}`

 return {
  data,
  timestamp,
  nonce,
  signature: digitalSignature.sign(signData, privateKey, 'SHA256')
 }
}
```

## 性能考虑

### 密钥生成

```typescript
// 密钥生成是耗时操作，建议提前生成并缓存
const keyPair = rsa.generateKeyPair(2048) // 可能需要几百毫秒
```

### 批量签名

```typescript
import { cryptoManager } from '@ldesign/crypto'

// 使用批量操作提高性能
const operations = messages.map((msg, index) => ({
 id: String(index),
 data: msg,
 key: privateKey,
 algorithm: 'RSA' as const
}))

const results = await cryptoManager.batchEncrypt(operations)
```

## 下一步

- [加密](/guide/encryption) - 学习数据加密
- [哈希](/guide/hashing) - 了解哈希函数
- [安全性](/guide/security) - 安全最佳实践
- [性能优化](/guide/performance) - 提升性能
