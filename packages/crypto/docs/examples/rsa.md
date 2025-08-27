# RSA 非对称加密示例

RSA 是一种非对称加密算法，使用公钥加密、私钥解密。本页面提供了完整的交互式演示。

## 交互式演示

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔑 RSA 密钥生成演示</h3>

    <div class="form-group">
      <label>密钥长度:</label>
      <select id="rsa-key-size">
        <option value="1024">1024 位（不推荐）</option>
        <option value="2048" selected>2048 位（推荐）</option>
        <option value="3072">3072 位（高安全）</option>
        <option value="4096">4096 位（最高安全）</option>
      </select>
    </div>

    <div class="form-actions">
      <button id="rsa-generate-keys-btn" class="btn primary">🔑 生成密钥对</button>
      <button id="rsa-clear-keys-btn" class="btn">🗑️ 清除密钥</button>
    </div>

    <div id="rsa-keys-result" class="result-box" style="display: none;">
      <h4>🔑 RSA 密钥对</h4>
      <div class="result-item">
        <label>公钥 (Public Key):</label>
        <textarea id="rsa-public-key" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>私钥 (Private Key):</label>
        <textarea id="rsa-private-key" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>密钥信息:</label>
        <div id="rsa-key-info" class="result-value"></div>
      </div>
    </div>

  </div>
</div>

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔐 RSA 加密解密演示</h3>

    <div class="form-group">
      <label>要加密的数据:</label>
      <textarea id="rsa-data" placeholder="输入要加密的数据（RSA适合加密小量数据）">Hello, RSA Encryption!</textarea>
    </div>

    <div class="form-group">
      <label>公钥 (用于加密):</label>
      <textarea id="rsa-encrypt-public-key" placeholder="粘贴公钥或先生成密钥对"></textarea>
    </div>

    <div class="form-group">
      <label>私钥 (用于解密):</label>
      <textarea id="rsa-decrypt-private-key" placeholder="粘贴私钥或先生成密钥对"></textarea>
    </div>

    <div class="form-actions">
      <button id="rsa-encrypt-btn" class="btn primary">🔒 RSA 加密</button>
      <button id="rsa-decrypt-btn" class="btn secondary">🔓 RSA 解密</button>
      <button id="rsa-copy-keys-btn" class="btn success">📋 复制密钥</button>
      <button id="rsa-clear-data-btn" class="btn">🗑️ 清除</button>
    </div>

    <div id="rsa-encrypted-result" class="result-box" style="display: none;">
      <h4>🔒 RSA 加密结果</h4>
      <div class="result-item">
        <label>加密数据:</label>
        <textarea id="rsa-encrypted-data" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>算法信息:</label>
        <div id="rsa-encrypt-info" class="result-value"></div>
      </div>
    </div>

    <div id="rsa-decrypted-result" class="result-box success" style="display: none;">
      <h4>🔓 RSA 解密结果</h4>
      <div class="result-item">
        <label>解密数据:</label>
        <div id="rsa-decrypted-data" class="result-value"></div>
      </div>
    </div>

    <div id="rsa-error" class="result-box error" style="display: none;"></div>

  </div>
</div>

<div class="crypto-demo">
  <div class="demo-section">
    <h3>✍️ RSA 数字签名演示</h3>

    <div class="form-group">
      <label>要签名的数据:</label>
      <textarea id="rsa-sign-data" placeholder="输入要签名的数据">This is a message to be signed.</textarea>
    </div>

    <div class="form-group">
      <label>签名私钥:</label>
      <textarea id="rsa-sign-private-key" placeholder="粘贴私钥用于签名"></textarea>
    </div>

    <div class="form-group">
      <label>验证公钥:</label>
      <textarea id="rsa-verify-public-key" placeholder="粘贴公钥用于验证"></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>哈希算法:</label>
        <select id="rsa-hash-algorithm">
          <option value="SHA1">SHA1</option>
          <option value="SHA256" selected>SHA256</option>
          <option value="SHA384">SHA384</option>
          <option value="SHA512">SHA512</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button id="rsa-sign-btn" class="btn primary">✍️ 生成签名</button>
      <button id="rsa-verify-btn" class="btn success">✅ 验证签名</button>
      <button id="rsa-clear-sign-btn" class="btn">🗑️ 清除</button>
    </div>

    <div id="rsa-signature-result" class="result-box" style="display: none;">
      <h4>✍️ 数字签名</h4>
      <div class="result-item">
        <label>签名值:</label>
        <textarea id="rsa-signature-value" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>签名信息:</label>
        <div id="rsa-signature-info" class="result-value"></div>
      </div>
    </div>

    <div id="rsa-verify-result" class="result-box success" style="display: none;">
      <h4>✅ 签名验证结果</h4>
      <div id="rsa-verify-message" class="result-value"></div>
    </div>

    <div id="rsa-sign-error" class="result-box error" style="display: none;"></div>

  </div>
</div>

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

<style>
.crypto-demo {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background-color: #f8f9fa;
}

.demo-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.result-textarea {
  min-height: 120px;
  font-family: monospace;
  font-size: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  margin: 20px 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn.primary {
  background-color: #007bff;
  color: white;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.success {
  background-color: #28a745;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  background-color: white;
}

.result-box.success {
  border-left-color: #28a745;
  background-color: #d4edda;
}

.result-box.error {
  border-left-color: #dc3545;
  background-color: #f8d7da;
  color: #721c24;
}

.result-box h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.result-item {
  margin-bottom: 10px;
}

.result-item label {
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
  display: block;
}

.result-value {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
  border: 1px solid #e9ecef;
}

.error {
  color: #dc3545;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
}
</style>
