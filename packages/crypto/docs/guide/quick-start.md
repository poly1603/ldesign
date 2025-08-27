# 快速开始

本指南将帮助你在 5 分钟内上手 @ldesign/crypto。

## 基础用法

### 导入库

```typescript
// 导入核心功能
import { decrypt, encrypt, hash, hmac } from '@ldesign/crypto'

// 或者导入特定算法
import { aes, base64, rsa } from '@ldesign/crypto'
```

### AES 加密

AES 是最常用的对称加密算法：

```typescript
// 基础 AES 加密
const data = 'Hello, World!'
const key = 'my-secret-key'

const encrypted = encrypt.aes(data, key)
console.log('加密结果:', encrypted.data)
console.log('算法:', encrypted.algorithm)
console.log('IV:', encrypted.iv)

// 解密
const decrypted = decrypt.aes(encrypted, key)
console.log('解密结果:', decrypted.data) // "Hello, World!"
console.log('成功:', decrypted.success) // true
```

### 指定 AES 参数

```typescript
// 使用 AES-256-CBC 模式
const encrypted = encrypt.aes256(data, key, {
  mode: 'CBC',
  iv: 'custom-iv-16-bytes',
})

// 或者使用选项对象
const encrypted2 = encrypt.aes(data, key, {
  keySize: 256,
  mode: 'CBC',
})
```

### RSA 加密

RSA 用于非对称加密和数字签名：

```typescript
// 生成 RSA 密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// RSA 加密（使用公钥）
const encrypted = encrypt.rsa(data, keyPair.publicKey)
console.log('加密结果:', encrypted.data)

// RSA 解密（使用私钥）
const decrypted = decrypt.rsa(encrypted, keyPair.privateKey)
console.log('解密结果:', decrypted.data)
```

### 哈希计算

```typescript
// 常用哈希算法
const md5Hash = hash.md5('Hello, World!')
const sha256Hash = hash.sha256('Hello, World!')
const sha512Hash = hash.sha512('Hello, World!')

console.log('MD5:', md5Hash)
console.log('SHA256:', sha256Hash)
console.log('SHA512:', sha512Hash)

// 验证哈希
const isValid = hash.verify('Hello, World!', sha256Hash, 'SHA256')
console.log('哈希验证:', isValid) // true
```

### HMAC 消息认证

```typescript
const message = 'Hello, World!'
const secretKey = 'secret-key'

// 生成 HMAC
const hmacValue = hmac.sha256(message, secretKey)
console.log('HMAC:', hmacValue)

// 验证 HMAC
const isValid = hmac.verify(message, secretKey, hmacValue, 'SHA256')
console.log('HMAC 验证:', isValid) // true
```

### Base64 编码

```typescript
// Base64 编码
const encoded = encrypt.base64('Hello, World!')
console.log('编码结果:', encoded)

// Base64 解码
const decoded = decrypt.base64(encoded)
console.log('解码结果:', decoded) // "Hello, World!"

// URL 安全的 Base64
const urlSafeEncoded = base64.encodeUrl('Hello, World!')
const urlSafeDecoded = base64.decodeUrl(urlSafeEncoded)
```

## Vue 3 集成

### 安装插件

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')
```

### 使用 Composition API

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { encryptAES, decryptAES, isEncrypting, isDecrypting, lastError, clearError } = useCrypto()

const inputData = ref('')
const inputKey = ref('')
const encryptedResult = ref(null)
const decryptedResult = ref(null)

async function handleEncrypt() {
  try {
    clearError()
    encryptedResult.value = await encryptAES(inputData.value, inputKey.value)
    decryptedResult.value = null
  }
  catch (error) {
    console.error('加密失败:', error)
  }
}

async function handleDecrypt() {
  try {
    clearError()
    decryptedResult.value = await decryptAES(encryptedResult.value, inputKey.value)
  }
  catch (error) {
    console.error('解密失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>加密示例</h2>
    <div>
      <input v-model="inputData" placeholder="输入要加密的数据">
      <input v-model="inputKey" placeholder="输入密钥">
      <button :disabled="isEncrypting" @click="handleEncrypt">
        {{ isEncrypting ? '加密中...' : '加密' }}
      </button>
    </div>

    <div v-if="encryptedResult">
      <h3>加密结果</h3>
      <p>数据: {{ encryptedResult.data }}</p>
      <p>算法: {{ encryptedResult.algorithm }}</p>
      <button :disabled="isDecrypting" @click="handleDecrypt">
        {{ isDecrypting ? '解密中...' : '解密' }}
      </button>
    </div>

    <div v-if="decryptedResult">
      <h3>解密结果</h3>
      <p>{{ decryptedResult.data }}</p>
    </div>

    <div v-if="lastError" class="error">
      错误: {{ lastError }}
    </div>
  </div>
</template>

<style>
.error {
  color: red;
  margin-top: 10px;
}
</style>
```

### 使用哈希 Hook

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { md5, sha256, sha512, isHashing } = useHash()

const inputText = ref('')
const hashResults = ref([])

async function calculateHash() {
  if (!inputText.value)
    return

  try {
    const results = await Promise.all([
      { algorithm: 'MD5', hash: await md5(inputText.value) },
      { algorithm: 'SHA256', hash: await sha256(inputText.value) },
      { algorithm: 'SHA512', hash: await sha512(inputText.value) },
    ])

    hashResults.value = results
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>哈希示例</h2>
    <input v-model="inputText" placeholder="输入要哈希的文本">
    <button :disabled="isHashing" @click="calculateHash">
      {{ isHashing ? '计算中...' : '计算哈希' }}
    </button>

    <div v-if="hashResults.length">
      <h3>哈希结果</h3>
      <div v-for="result in hashResults" :key="result.algorithm">
        <strong>{{ result.algorithm }}:</strong> {{ result.hash }}
      </div>
    </div>
  </div>
</template>
```

## 实际应用示例

### 用户密码加密

```typescript
import { encrypt, hash, keyGenerator } from '@ldesign/crypto'

// 用户注册时加密密码
function hashPassword(password: string): string {
  // 生成盐值
  const salt = keyGenerator.generateSalt()

  // 使用盐值和密码生成哈希
  const hashedPassword = hash.sha256(password + salt)

  // 返回盐值和哈希值的组合
  return `${salt}:${hashedPassword}`
}

// 用户登录时验证密码
function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  const computedHash = hash.sha256(password + salt)
  return computedHash === hash
}
```

### API 请求签名

```typescript
import { hmac } from '@ldesign/crypto'

function signApiRequest(method: string, url: string, body: string, secretKey: string): string {
  const timestamp = Date.now().toString()
  const message = `${method}\n${url}\n${body}\n${timestamp}`

  const signature = hmac.sha256(message, secretKey)

  return `${timestamp}:${signature}`
}

// 使用示例
const signature = signApiRequest(
  'POST',
  '/api/users',
  JSON.stringify({ name: 'John' }),
  'secret-key'
)
```

### 本地存储加密

```typescript
import { decrypt, encrypt } from '@ldesign/crypto'

class SecureStorage {
  private key: string

  constructor(key: string) {
    this.key = key
  }

  setItem(key: string, value: any): void {
    const serialized = JSON.stringify(value)
    const encrypted = encrypt.aes(serialized, this.key)
    localStorage.setItem(key, JSON.stringify(encrypted))
  }

  getItem(key: string): any {
    const stored = localStorage.getItem(key)
    if (!stored)
      return null

    try {
      const encrypted = JSON.parse(stored)
      const decrypted = decrypt.aes(encrypted, this.key)

      if (!decrypted.success)
        return null

      return JSON.parse(decrypted.data)
    }
    catch {
      return null
    }
  }
}

// 使用示例
const storage = new SecureStorage('user-secret-key')
storage.setItem('user-data', { name: 'John', email: 'john@example.com' })
const userData = storage.getItem('user-data')
```

## 下一步

现在你已经掌握了基础用法，可以继续学习：

- [加密算法详解](./encryption) - 深入了解各种加密算法
- [Vue 3 集成指南](./vue-composables) - 更多 Vue 集成技巧
- [API 参考](../api/) - 完整的 API 文档
- [实际应用示例](../examples/) - 更多实用示例
