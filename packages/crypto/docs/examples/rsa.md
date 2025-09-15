# RSA 非对称加密示例

本页展示 RSA 的常用用法（密钥对生成、加密/解密、签名/验签），示例均为纯代码，SSR 友好。

## 密钥对生成

```ts path=null start=null
import { rsa } from '@ldesign/crypto'

const keyPair = rsa.generateKeyPair(2048)
console.log(keyPair.publicKey, keyPair.privateKey)
```

## 加密与解密

```ts path=null start=null
import { decrypt, encrypt, rsa } from '@ldesign/crypto'

const { publicKey, privateKey } = rsa.generateKeyPair(2048)
const enc = encrypt.rsa('Hello, RSA!', publicKey)
const dec = decrypt.rsa(enc, privateKey)
console.log(dec.success, dec.data)
```

## 数字签名

```ts path=null start=null
import { digitalSignature, rsa } from '@ldesign/crypto'

const { publicKey, privateKey } = rsa.generateKeyPair(2048)
const data = 'Important document'
const signature = digitalSignature.sign(data, privateKey)
const isValid = digitalSignature.verify(data, signature, publicKey)
```

## 混合加密（示例）

```ts path=null start=null
import { decrypt, encrypt, rsa, keyGenerator } from '@ldesign/crypto'

const aesKey = keyGenerator.generateKey(32)
const payload = encrypt.aes('large-data', aesKey)
const wrappedKey = encrypt.rsa(aesKey, rsa.generateKeyPair(2048).publicKey)

// 发送 payload + wrappedKey
```

## 注意事项

- RSA 仅适合加密小数据；大数据请使用混合加密
- 推荐最少 2048 位密钥；使用 OAEP 填充与安全哈希（SHA-256）

RSA 是一种非对称加密算法，使用公钥加密、私钥解密。本页面提供了完整的交互式演示。

## 交互式演示

<!-- Interactive demo removed in SSR build: replace with static examples or client-only components -->



## 代码示例

### 基本 RSA 加密解密

```typescript
import { decrypt, encrypt, rsa } from '@ldesign/crypto'

// 1. 生成 RSA 密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 2. 使用公钥加密
const data = 'Hello, RSA!'
const encrypted = encrypt.rsa(data, keyPair.publicKey)
console.log('加密结果:', encrypted)

// 3. 使用私钥解密
const decrypted = decrypt.rsa(encrypted, keyPair.privateKey)
console.log('解密结果:', decrypted.data)
```

### 指定 RSA 参数

```typescript
// 生成不同长度的密钥
const keyPair1024 = rsa.generateKeyPair(1024) // 不推荐，安全性不足
const keyPair2048 = rsa.generateKeyPair(2048) // 推荐
const keyPair4096 = rsa.generateKeyPair(4096) // 高安全性

// 使用不同的填充方式
const encrypted1 = encrypt.rsa(data, publicKey, {
  padding: 'OAEP', // 推荐的填充方式
  hashAlgorithm: 'SHA256',
})

const encrypted2 = encrypt.rsa(data, publicKey, {
  padding: 'PKCS1', // 传统填充方式
  hashAlgorithm: 'SHA1',
})
```

### RSA 数字签名

```typescript
import { digitalSignature } from '@ldesign/crypto'

// 生成密钥对
const keyPair = rsa.generateKeyPair(2048)

// 对数据进行签名
const data = 'Important document'
const signature = digitalSignature.sign(data, keyPair.privateKey, 'SHA256')
console.log('数字签名:', signature)

// 验证签名
const isValid = digitalSignature.verify(data, signature, keyPair.publicKey, 'SHA256')
console.log('签名验证:', isValid ? '✅ 有效' : '❌ 无效')
```

## Vue 3 集成示例

### 使用 Composition API

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { generateRSAKeyPair, encryptRSA, decryptRSA, isEncrypting, isDecrypting, lastError }
  = useCrypto()

const data = ref('Hello, Vue RSA!')
const keyPair = ref(null)
const encryptedResult = ref(null)
const decryptedResult = ref(null)
const isGenerating = ref(false)
const error = computed(() => lastError.value)

async function generateKeys() {
  try {
    isGenerating.value = true
    keyPair.value = await generateRSAKeyPair(2048)
    encryptedResult.value = null
    decryptedResult.value = null
  }
  catch (err) {
    console.error('密钥生成失败:', err)
  }
  finally {
    isGenerating.value = false
  }
}

async function encryptData() {
  if (!keyPair.value)
    return

  try {
    encryptedResult.value = await encryptRSA(data.value, keyPair.value.publicKey)
    decryptedResult.value = null
  }
  catch (err) {
    console.error('加密失败:', err)
  }
}

async function decryptData() {
  if (!keyPair.value || !encryptedResult.value)
    return

  try {
    decryptedResult.value = await decryptRSA(encryptedResult.value, keyPair.value.privateKey)
  }
  catch (err) {
    console.error('解密失败:', err)
  }
}
</script>

<template>
  <div>
    <h2>RSA 加密演示</h2>

    <div>
      <button :disabled="isGenerating" @click="generateKeys">
        {{ isGenerating ? '生成中...' : '生成密钥对' }}
      </button>
    </div>

    <div v-if="keyPair">
      <h3>密钥对已生成</h3>
      <p>密钥长度: {{ keyPair.keySize }} 位</p>

      <div>
        <textarea v-model="data" placeholder="输入要加密的数据" />
        <button :disabled="isEncrypting" @click="encryptData">
          {{ isEncrypting ? '加密中...' : '加密' }}
        </button>
        <button :disabled="isDecrypting || !encryptedResult" @click="decryptData">
          {{ isDecrypting ? '解密中...' : '解密' }}
        </button>
      </div>
    </div>

    <div v-if="encryptedResult">
      <h3>加密结果</h3>
      <pre>{{ encryptedResult.data }}</pre>
    </div>

    <div v-if="decryptedResult">
      <h3>解密结果</h3>
      <p>{{ decryptedResult.data }}</p>
    </div>

    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
  </div>
</template>
```

## 实际应用场景

### 1. 安全通信

```typescript
// 客户端-服务器安全通信
class SecureCommunication {
  private clientKeyPair: any
  private serverPublicKey: string

  constructor(serverPublicKey: string) {
    this.serverPublicKey = serverPublicKey
    this.clientKeyPair = rsa.generateKeyPair(2048)
  }

  // 发送加密消息给服务器
  sendSecureMessage(message: string): string {
    const encrypted = encrypt.rsa(message, this.serverPublicKey)
    return JSON.stringify(encrypted)
  }

  // 接收服务器的加密消息
  receiveSecureMessage(encryptedMessage: string): string {
    const encrypted = JSON.parse(encryptedMessage)
    const decrypted = decrypt.rsa(encrypted, this.clientKeyPair.privateKey)

    if (!decrypted.success) {
      throw new Error('消息解密失败')
    }

    return decrypted.data
  }

  // 获取客户端公钥（发送给服务器）
  getPublicKey(): string {
    return this.clientKeyPair.publicKey
  }
}

// 使用示例
const serverPublicKey = '-----BEGIN PUBLIC KEY-----...'
const comm = new SecureCommunication(serverPublicKey)

// 发送消息
const encryptedMessage = comm.sendSecureMessage('Hello, Server!')

// 接收消息
const decryptedMessage = comm.receiveSecureMessage(encryptedMessage)
```

### 2. 数字证书验证

```typescript
// 数字证书管理
class DigitalCertificate {
  private issuerKeyPair: any

  constructor() {
    this.issuerKeyPair = rsa.generateKeyPair(4096)
  }

  // 签发证书
  issueCertificate(userInfo: {
    name: string
    email: string
    publicKey: string
    validUntil: number
  }): string {
    const certificateData = JSON.stringify({
      ...userInfo,
      issuer: 'My Certificate Authority',
      issuedAt: Date.now(),
    })

    const signature = digitalSignature.sign(
      certificateData,
      this.issuerKeyPair.privateKey,
      'SHA256'
    )

    return JSON.stringify({
      data: certificateData,
      signature,
      issuerPublicKey: this.issuerKeyPair.publicKey,
    })
  }

  // 验证证书
  verifyCertificate(certificate: string): boolean {
    try {
      const cert = JSON.parse(certificate)
      const isValid = digitalSignature.verify(
        cert.data,
        cert.signature,
        cert.issuerPublicKey,
        'SHA256'
      )

      if (!isValid)
        return false

      // 检查证书是否过期
      const certData = JSON.parse(cert.data)
      if (Date.now() > certData.validUntil) {
        return false
      }

      return true
    }
    catch {
      return false
    }
  }
}

// 使用示例
const ca = new DigitalCertificate()
const userKeyPair = rsa.generateKeyPair(2048)

const certificate = ca.issueCertificate({
  name: 'John Doe',
  email: 'john@example.com',
  publicKey: userKeyPair.publicKey,
  validUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1年后过期
})

const isValid = ca.verifyCertificate(certificate)
console.log('证书验证:', isValid ? '✅ 有效' : '❌ 无效')
```

### 3. 混合加密系统

```typescript
// RSA + AES 混合加密（解决 RSA 加密大数据的问题）
class HybridEncryption {
  static encrypt(
    data: string,
    rsaPublicKey: string
  ): {
      encryptedData: any
      encryptedKey: any
    } {
    // 1. 生成随机 AES 密钥
    const aesKey = keyGenerator.generateKey(32) // 256位密钥

    // 2. 使用 AES 加密数据
    const encryptedData = encrypt.aes(data, aesKey)

    // 3. 使用 RSA 加密 AES 密钥
    const encryptedKey = encrypt.rsa(aesKey, rsaPublicKey)

    return {
      encryptedData,
      encryptedKey,
    }
  }

  static decrypt(encryptedData: any, encryptedKey: any, rsaPrivateKey: string): string {
    // 1. 使用 RSA 解密 AES 密钥
    const decryptedKey = decrypt.rsa(encryptedKey, rsaPrivateKey)

    if (!decryptedKey.success) {
      throw new Error('密钥解密失败')
    }

    // 2. 使用 AES 密钥解密数据
    const decryptedData = decrypt.aes(encryptedData, decryptedKey.data)

    if (!decryptedData.success) {
      throw new Error('数据解密失败')
    }

    return decryptedData.data
  }
}

// 使用示例
const keyPair = rsa.generateKeyPair(2048)
const largeData = 'A'.repeat(10000) // 10KB 数据

// 加密
const { encryptedData, encryptedKey } = HybridEncryption.encrypt(largeData, keyPair.publicKey)

// 解密
const decryptedData = HybridEncryption.decrypt(encryptedData, encryptedKey, keyPair.privateKey)

console.log('数据匹配:', decryptedData === largeData)
```

## 性能和安全考虑

### 密钥长度选择

| 密钥长度 | 安全级别 | 性能 | 推荐用途             |
| -------- | -------- | ---- | -------------------- |
| 1024 位  | 低       | 快   | 不推荐使用           |
| 2048 位  | 高       | 中等 | **推荐用于一般用途** |
| 3072 位  | 很高     | 慢   | 高安全要求           |
| 4096 位  | 最高     | 很慢 | 最高安全要求         |

### RSA 使用限制

1. **数据大小限制**：RSA 只能加密小于密钥长度的数据
2. **性能考虑**：RSA 比对称加密慢得多
3. **推荐做法**：使用 RSA 加密对称密钥，用对称加密处理大数据

### 安全最佳实践

```typescript
// 安全的 RSA 配置
const secureRSAConfig = {
  keySize: 2048, // 最小推荐长度
  padding: 'OAEP', // 使用 OAEP 填充
  hashAlgorithm: 'SHA256', // 使用 SHA256
}

// 不安全的配置（避免使用）
const insecureConfig = {
  keySize: 1024, // 密钥长度不足
  padding: 'PKCS1', // 较弱的填充
  hashAlgorithm: 'SHA1', // 已被破解的哈希
}
```


