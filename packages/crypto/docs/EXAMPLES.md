# @ldesign/crypto 使用示例

## 基础示例

### 1. 简单的文本加密解密

```typescript
import { aes } from '@ldesign/crypto'

// 加密文本
const plainText = '这是一段需要加密的敏感信息'
const password = 'my-secret-password'

const encrypted = aes.encrypt(plainText, password)
if (encrypted.success) {
  console.log('加密成功!')
  console.log('加密数据:', encrypted.data)
  console.log('IV:', encrypted.iv)
  
  // 解密文本
  const decrypted = aes.decrypt(encrypted, password)
  if (decrypted.success) {
    console.log('解密成功:', decrypted.data)
    // 输出: 这是一段需要加密的敏感信息
  }
}
```

### 2. 文件内容加密

```typescript
import { aes, encoding } from '@ldesign/crypto'

// 模拟文件内容
const fileContent = `
{
  "name": "sensitive-data.json",
  "data": {
    "apiKey": "sk-1234567890abcdef",
    "secret": "very-secret-value"
  }
}
`

// 加密文件内容
const password = 'file-encryption-key'
const encrypted = aes.encrypt(fileContent, password, { keySize: 256 })

if (encrypted.success) {
  // 保存加密后的文件（实际应用中保存到文件系统）
  const encryptedFile = {
    data: encrypted.data,
    iv: encrypted.iv,
    algorithm: encrypted.algorithm,
    keySize: encrypted.keySize
  }
  
  console.log('加密文件:', JSON.stringify(encryptedFile, null, 2))
  
  // 读取并解密文件
  const decrypted = aes.decrypt(encryptedFile, password, {
    keySize: encryptedFile.keySize,
    iv: encryptedFile.iv
  })
  
  if (decrypted.success) {
    console.log('解密文件内容:', decrypted.data)
  }
}
```

### 3. 数据完整性验证

```typescript
import { hash, hmac } from '@ldesign/crypto'

const data = '重要的业务数据'
const secretKey = 'integrity-check-key'

// 计算数据哈希
const dataHash = hash.sha256(data)
console.log('数据哈希:', dataHash)

// 使用 HMAC 进行完整性验证
const mac = hmac.sha256(data, secretKey)
console.log('HMAC:', mac)

// 验证数据完整性
const isValid = hmac.verify(data, secretKey, mac, 'SHA256')
console.log('数据完整性验证:', isValid ? '通过' : '失败')

// 模拟数据被篡改
const tamperedData = '被篡改的业务数据'
const isTamperedValid = hmac.verify(tamperedData, secretKey, mac, 'SHA256')
console.log('篡改数据验证:', isTamperedValid ? '通过' : '失败')
```

## 高级示例

### 4. RSA 非对称加密

```typescript
import { rsa } from '@ldesign/crypto'

// 生成 RSA 密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 使用公钥加密
const message = '这是一条机密消息'
const encrypted = rsa.encrypt(message, keyPair.publicKey)

if (encrypted.success) {
  console.log('RSA 加密成功:', encrypted.data)
  
  // 使用私钥解密
  const decrypted = rsa.decrypt(encrypted.data!, keyPair.privateKey)
  if (decrypted.success) {
    console.log('RSA 解密成功:', decrypted.data)
  }
}
```

### 5. 混合加密（RSA + AES）

```typescript
import { rsa, aes, keyGenerator } from '@ldesign/crypto'

// 生成 RSA 密钥对
const rsaKeyPair = rsa.generateKeyPair(2048)

// 生成随机 AES 密钥
const aesKey = keyGenerator.generateKey(32) // 256位密钥

// 大量数据
const largeData = 'A'.repeat(10000) // 10KB 数据

// 1. 使用 AES 加密大量数据
const aesEncrypted = aes.encrypt(largeData, aesKey)

if (aesEncrypted.success) {
  // 2. 使用 RSA 加密 AES 密钥
  const rsaEncrypted = rsa.encrypt(aesKey, rsaKeyPair.publicKey)
  
  if (rsaEncrypted.success) {
    console.log('混合加密完成')
    
    // 解密过程
    // 1. 使用 RSA 私钥解密 AES 密钥
    const decryptedAESKey = rsa.decrypt(rsaEncrypted.data!, rsaKeyPair.privateKey)
    
    if (decryptedAESKey.success) {
      // 2. 使用解密的 AES 密钥解密数据
      const decryptedData = aes.decrypt(aesEncrypted, decryptedAESKey.data!)
      
      if (decryptedData.success) {
        console.log('混合解密成功，数据长度:', decryptedData.data!.length)
        console.log('数据完整性:', decryptedData.data === largeData ? '正确' : '错误')
      }
    }
  }
}
```

## Vue 3 集成示例

### 6. Vue 组件中的加密功能

```vue
<template>
  <div class="crypto-demo">
    <h2>加密解密演示</h2>
    
    <div class="input-group">
      <label>原始文本:</label>
      <textarea v-model="plainText" placeholder="输入要加密的文本"></textarea>
    </div>
    
    <div class="input-group">
      <label>密码:</label>
      <input v-model="password" type="password" placeholder="输入密码">
    </div>
    
    <div class="actions">
      <button @click="handleEncrypt" :disabled="isLoading">
        {{ isLoading ? '加密中...' : '加密' }}
      </button>
      <button @click="handleDecrypt" :disabled="isLoading">
        {{ isLoading ? '解密中...' : '解密' }}
      </button>
    </div>
    
    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
    
    <div v-if="encryptedText" class="result">
      <h3>加密结果:</h3>
      <textarea v-model="encryptedText" readonly></textarea>
    </div>
    
    <div v-if="decryptedText" class="result">
      <h3>解密结果:</h3>
      <p>{{ decryptedText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEncryption } from '@ldesign/crypto/vue'

// 响应式数据
const plainText = ref('Hello, Vue + Crypto!')
const password = ref('my-secret-password')
const encryptedText = ref('')
const decryptedText = ref('')

// 使用加密组合式函数
const { encryptText, decryptText, isLoading, error, clearError } = useEncryption()

// 加密处理
const handleEncrypt = async () => {
  if (!plainText.value || !password.value) return
  
  clearError()
  const result = await encryptText(plainText.value, password.value)
  if (result) {
    encryptedText.value = result
    decryptedText.value = ''
  }
}

// 解密处理
const handleDecrypt = async () => {
  if (!encryptedText.value || !password.value) return
  
  clearError()
  const result = await decryptText(encryptedText.value, password.value)
  if (result) {
    decryptedText.value = result
  }
}
</script>

<style scoped>
.crypto-demo {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin-right: 10px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.actions button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.result textarea {
  height: 100px;
  resize: vertical;
}
</style>
```

### 7. 密钥管理组件

```vue
<template>
  <div class="key-manager">
    <h2>密钥管理</h2>
    
    <div class="actions">
      <button @click="generateAES" :disabled="isGenerating">
        {{ isGenerating ? '生成中...' : '生成 AES 密钥' }}
      </button>
      <button @click="generateRSA" :disabled="isGenerating">
        {{ isGenerating ? '生成中...' : '生成 RSA 密钥对' }}
      </button>
    </div>
    
    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
    
    <div v-if="keyCount > 0" class="keys-list">
      <h3>已生成的密钥 ({{ keyCount }})</h3>
      <div v-for="keyName in keyNames" :key="keyName" class="key-item">
        <span>{{ keyName }}</span>
        <button @click="removeKey(keyName)" class="delete-btn">删除</button>
      </div>
    </div>
    
    <div class="export-import">
      <button @click="exportKeys">导出密钥</button>
      <input type="file" @change="importKeys" accept=".json">
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKeyManager } from '@ldesign/crypto/vue'

const {
  generateAESKey,
  generateRSAKeyPair,
  storeKey,
  removeKey,
  exportKeys: exportKeysData,
  importKeys: importKeysData,
  isGenerating,
  error,
  keyCount,
  keyNames,
  clearError
} = useKeyManager()

const generateAES = async () => {
  clearError()
  const key = await generateAESKey(256)
  if (key) {
    storeKey(`AES-${Date.now()}`, key)
  }
}

const generateRSA = async () => {
  clearError()
  const keyPair = await generateRSAKeyPair(2048)
  if (keyPair) {
    storeKey(`RSA-${Date.now()}`, keyPair)
  }
}

const exportKeys = () => {
  const data = exportKeysData()
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'crypto-keys.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importKeys = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result as string
      importKeysData(data)
    }
    reader.readAsText(file)
  }
}
</script>
```

## 实际应用场景

### 8. 用户数据加密存储

```typescript
import { aes, hash } from '@ldesign/crypto'

class SecureUserStorage {
  private masterKey: string
  
  constructor(userPassword: string) {
    // 使用用户密码生成主密钥
    this.masterKey = hash.sha256(userPassword + 'salt-string')
  }
  
  // 加密存储用户数据
  encryptAndStore(key: string, data: any): boolean {
    try {
      const jsonData = JSON.stringify(data)
      const encrypted = aes.encrypt(jsonData, this.masterKey)
      
      if (encrypted.success) {
        localStorage.setItem(key, JSON.stringify(encrypted))
        return true
      }
      return false
    } catch (error) {
      console.error('存储失败:', error)
      return false
    }
  }
  
  // 解密读取用户数据
  decryptAndRetrieve<T>(key: string): T | null {
    try {
      const storedData = localStorage.getItem(key)
      if (!storedData) return null
      
      const encryptedData = JSON.parse(storedData)
      const decrypted = aes.decrypt(encryptedData, this.masterKey)
      
      if (decrypted.success) {
        return JSON.parse(decrypted.data!)
      }
      return null
    } catch (error) {
      console.error('读取失败:', error)
      return null
    }
  }
}

// 使用示例
const userStorage = new SecureUserStorage('user-password-123')

// 存储敏感数据
const userData = {
  email: 'user@example.com',
  preferences: { theme: 'dark', language: 'zh-CN' },
  tokens: { accessToken: 'abc123', refreshToken: 'def456' }
}

userStorage.encryptAndStore('user-profile', userData)

// 读取数据
const retrievedData = userStorage.decryptAndRetrieve('user-profile')
console.log('用户数据:', retrievedData)
```

### 9. API 通信加密

```typescript
import { aes, rsa, keyGenerator } from '@ldesign/crypto'

class SecureApiClient {
  private serverPublicKey: string
  private clientPrivateKey: string
  
  constructor(serverPublicKey: string, clientPrivateKey: string) {
    this.serverPublicKey = serverPublicKey
    this.clientPrivateKey = clientPrivateKey
  }
  
  // 发送加密请求
  async sendSecureRequest(endpoint: string, data: any): Promise<any> {
    // 1. 生成临时 AES 密钥
    const sessionKey = keyGenerator.generateKey(32)
    
    // 2. 使用 AES 加密请求数据
    const encryptedData = aes.encrypt(JSON.stringify(data), sessionKey)
    
    if (!encryptedData.success) {
      throw new Error('数据加密失败')
    }
    
    // 3. 使用服务器公钥加密会话密钥
    const encryptedSessionKey = rsa.encrypt(sessionKey, this.serverPublicKey)
    
    if (!encryptedSessionKey.success) {
      throw new Error('会话密钥加密失败')
    }
    
    // 4. 发送加密请求
    const payload = {
      sessionKey: encryptedSessionKey.data,
      data: encryptedData.data,
      iv: encryptedData.iv
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    return response.json()
  }
}
```

这些示例展示了 @ldesign/crypto 在各种实际场景中的应用，从简单的文本加密到复杂的混合加密方案，以及在 Vue 3 应用中的集成使用。
