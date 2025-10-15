# Vue 最佳实践

本指南介绍在 Vue 3 项目中使用 @ldesign/crypto 的最佳实践。

## 项目结构

### 推荐的目录结构

```
src/
├── composables/
│   ├── useSecurity.ts     # 安全相关组合式函数
│   └── useEncryptedStorage.ts # 加密存储
├── services/
│   ├── crypto.service.ts    # 加密服务封装
│   └── auth.service.ts     # 认证服务
├── utils/
│   ├── crypto.helpers.ts    # 加密工具函数
│   └── validators.ts      # 验证工具
├── config/
│   └── crypto.config.ts    # 加密配置
└── main.ts
```

## 插件配置

### 集中式配置

```typescript
// config/crypto.config.ts
import type { CryptoPluginOptions } from '@ldesign/crypto/vue'

export const cryptoConfig: CryptoPluginOptions = {
 globalPropertyName: '$crypto',
 registerComposables: true,
 config: {
  defaultAESKeySize: 256,
  defaultRSAKeySize: 2048,
  defaultHashAlgorithm: 'SHA256',
  defaultEncoding: 'base64'
 }
}
```

```typescript
// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { cryptoConfig } from './config/crypto.config'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin, cryptoConfig)
app.mount('#app')
```

## 服务层封装

### 加密服务

```typescript
// services/crypto.service.ts
import { aes, rsa, hash, encoding } from '@ldesign/crypto'
import type { EncryptResult, DecryptResult } from '@ldesign/crypto'

export class CryptoService {
 /**
  * 加密敏感数据
  */
 static encryptSensitiveData(data: string, key: string): string | null {
  try {
   const result = aes.encrypt(data, key, { keySize: 256 })

   if (result.success && result.data) {
    return encoding.base64.encode(JSON.stringify(result))
   }

   return null
  } catch (error) {
   console.error('Encryption failed:', error)
   return null
  }
 }

 /**
  * 解密敏感数据
  */
 static decryptSensitiveData(encryptedData: string, key: string): string | null {
  try {
   const result = JSON.parse(encoding.base64.decode(encryptedData))
   const decrypted = aes.decrypt(result, key)

   return decrypted.success ? decrypted.data : null
  } catch (error) {
   console.error('Decryption failed:', error)
   return null
  }
 }

 /**
  * 生成数据指纹
  */
 static generateFingerprint(data: string): string {
  return hash.sha256(data)
 }

 /**
  * 验证数据完整性
  */
 static verifyIntegrity(data: string, fingerprint: string): boolean {
  return hash.sha256(data) === fingerprint
 }
}
```

### 认证服务

```typescript
// services/auth.service.ts
import { aes, hash } from '@ldesign/crypto'
import { SecureStorage } from '@ldesign/crypto'

export class AuthService {
 private static storage = new SecureStorage({
  key: 'auth-encryption-key',
  prefix: 'auth_',
  ttl: 24 * 60 * 60 * 1000 // 24小时
 })

 /**
  * 存储认证令牌
  */
 static storeToken(token: string): boolean {
  return this.storage.set('token', token)
 }

 /**
  * 获取认证令牌
  */
 static getToken(): string | undefined {
  return this.storage.get('token')
 }

 /**
  * 清除认证信息
  */
 static clearAuth(): void {
  this.storage.clear()
 }

 /**
  * 加密密码
  */
 static hashPassword(password: string): string {
  // 使用盐值增强安全性
  const salt = 'your-app-salt'
  return hash.sha256(password + salt)
 }
}
```

## 自定义组合式函数

### 安全存储 Hook

```typescript
// composables/useEncryptedStorage.ts
import { ref, watch } from 'vue'
import { SecureStorage } from '@ldesign/crypto'

export function useEncryptedStorage(key: string, encryptionKey: string) {
 const storage = new SecureStorage({
  key: encryptionKey,
  prefix: 'app_'
 })

 const data = ref(storage.get(key))

 // 自动保存
 watch(data, (newValue) => {
  if (newValue !== undefined) {
   storage.set(key, newValue)
  }
 }, { deep: true })

 const remove = () => {
  storage.remove(key)
  data.value = undefined
 }

 return {
  data,
  remove
 }
}
```

### 安全通信 Hook

```typescript
// composables/useSecurity.ts
import { ref } from 'vue'
import { aes, hash, hmac } from '@ldesign/crypto'

export function useSecurity() {
 const isProcessing = ref(false)

 /**
  * 安全发送数据
  */
 const secureSend = async (data: any, key: string) => {
  isProcessing.value = true

  try {
   // 序列化数据
   const jsonData = JSON.stringify(data)

   // 加密数据
   const encrypted = aes.encrypt(jsonData, key)

   // 生成 HMAC
   const mac = hmac.sha256(encrypted.data, key)

   // 返回安全包
   return {
    data: encrypted.data,
    iv: encrypted.iv,
    mac
   }
  } finally {
   isProcessing.value = false
  }
 }

 /**
  * 安全接收数据
  */
 const secureReceive = async (
  encryptedData: string,
  iv: string,
  mac: string,
  key: string
 ) => {
  isProcessing.value = true

  try {
   // 验证 HMAC
   const isValid = hmac.verify(encryptedData, key, mac, 'SHA256')

   if (!isValid) {
    throw new Error('Data integrity check failed')
   }

   // 解密数据
   const decrypted = aes.decrypt(
    { data: encryptedData, iv },
    key
   )

   if (!decrypted.success) {
    throw new Error('Decryption failed')
   }

   // 解析数据
   return JSON.parse(decrypted.data)
  } finally {
   isProcessing.value = false
  }
 }

 return {
  isProcessing,
  secureSend,
  secureReceive
 }
}
```

## 工具函数

### 加密工具

```typescript
// utils/crypto.helpers.ts
import { aes, base64, hash } from '@ldesign/crypto'

/**
 * 快速加密文本
 */
export function quickEncrypt(text: string, password: string): string {
 const result = aes.encrypt(text, password, { keySize: 256 })
 return base64.encode(JSON.stringify(result))
}

/**
 * 快速解密文本
 */
export function quickDecrypt(encrypted: string, password: string): string {
 const data = JSON.parse(base64.decode(encrypted))
 const result = aes.decrypt(data, password)
 return result.data || ''
}

/**
 * 生成安全随机字符串
 */
export function generateSecureId(length: number = 32): string {
 const timestamp = Date.now().toString()
 const random = Math.random().toString(36).substring(2)
 const combined = timestamp + random
 return hash.sha256(combined).substring(0, length)
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
 isStrong: boolean
 score: number
 feedback: string[]
} {
 const feedback: string[] = []
 let score = 0

 if (password.length >= 8) score++
 else feedback.push('密码至少需要8个字符')

 if (/[a-z]/.test(password)) score++
 else feedback.push('需要小写字母')

 if (/[A-Z]/.test(password)) score++
 else feedback.push('需要大写字母')

 if (/[0-9]/.test(password)) score++
 else feedback.push('需要数字')

 if (/[^a-zA-Z0-9]/.test(password)) score++
 else feedback.push('需要特殊字符')

 return {
  isStrong: score >= 4,
  score,
  feedback
 }
}
```

## 组件最佳实践

### 加密表单

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEncryption } from '@ldesign/crypto/vue'
import { validatePasswordStrength } from '@/utils/crypto.helpers'

const encryption = useEncryption()

const form = ref({
 username: '',
 password: '',
 sensitiveData: ''
})

const encryptedData = ref('')

// 密码强度
const passwordStrength = computed(() => {
 return validatePasswordStrength(form.value.password)
})

// 提交表单
const handleSubmit = async () => {
 // 验证密码强度
 if (!passwordStrength.value.isStrong) {
  alert('密码强度不足')
  return
 }

 // 加密敏感数据
 encryptedData.value = await encryption.encryptText(
  form.value.sensitiveData,
  form.value.password
 )

 if (encryptedData.value) {
  // 发送到服务器
  console.log('Encrypted data ready to send')
 }
}
</script>

<template>
 <form @submit.prevent="handleSubmit">
  <div>
   <label>用户名:</label>
   <input v-model="form.username" required />
  </div>

  <div>
   <label>密码:</label>
   <input v-model="form.password" type="password" required />

   <div v-if="form.password" class="password-strength">
    <div :class="['strength-bar', `strength-${passwordStrength.score}`]"></div>
    <ul>
     <li v-for="(item, index) in passwordStrength.feedback" :key="index">
      {{ item }}
     </li>
    </ul>
   </div>
  </div>

  <div>
   <label>敏感数据:</label>
   <textarea v-model="form.sensitiveData" required></textarea>
  </div>

  <button type="submit" :disabled="!passwordStrength.isStrong">
   提交
  </button>
 </form>
</template>

<style scoped>
.password-strength {
 margin-top: 5px;
}

.strength-bar {
 height: 4px;
 background: #ddd;
 border-radius: 2px;
 transition: all 0.3s;
}

.strength-1 {
 width: 20%;
 background: #ff4444;
}

.strength-2 {
 width: 40%;
 background: #ff8844;
}

.strength-3 {
 width: 60%;
 background: #ffaa44;
}

.strength-4 {
 width: 80%;
 background: #88cc44;
}

.strength-5 {
 width: 100%;
 background: #44cc44;
}
</style>
```

### 安全文件上传

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useEncryption } from '@ldesign/crypto/vue'
import { CryptoService } from '@/services/crypto.service'

const encryption = useEncryption()

const file = ref<File | null>(null)
const password = ref('')
const uploadProgress = ref(0)
const fileFingerprint = ref('')

// 处理文件选择
const handleFileSelect = (event: Event) => {
 const target = event.target as HTMLInputElement
 file.value = target.files?.[0] || null
}

// 上传加密文件
const handleUpload = async () => {
 if (!file.value || !password.value) return

 uploadProgress.value = 0

 // 读取文件
 const reader = new FileReader()

 reader.onload = async (e) => {
  const content = e.target?.result as string

  // 生成文件指纹
  fileFingerprint.value = CryptoService.generateFingerprint(content)

  // 加密文件
  uploadProgress.value = 50
  const encrypted = await encryption.encryptFile(content, password.value)

  if (encrypted) {
   uploadProgress.value = 75

   // 上传到服务器
   await uploadToServer({
    filename: file.value.name,
    data: encrypted,
    fingerprint: fileFingerprint.value
   })

   uploadProgress.value = 100
   console.log('File uploaded successfully')
  }
 }

 reader.readAsText(file.value)
}

// 模拟上传
const uploadToServer = async (data: any) => {
 // 实际实现中应该调用 API
 return new Promise((resolve) => setTimeout(resolve, 1000))
}
</script>

<template>
 <div class="file-upload">
  <input type="file" @change="handleFileSelect" />
  <input v-model="password" type="password" placeholder="加密密码" />

  <button @click="handleUpload" :disabled="!file || !password">
   上传加密文件
  </button>

  <div v-if="uploadProgress > 0" class="progress">
   <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
   <span>{{ uploadProgress }}%</span>
  </div>

  <div v-if="fileFingerprint">
   <p>文件指纹:</p>
   <code>{{ fileFingerprint }}</code>
  </div>
 </div>
</template>

<style scoped>
.file-upload {
 padding: 20px;
}

.progress {
 margin-top: 10px;
 position: relative;
 height: 30px;
 background: #f0f0f0;
 border-radius: 4px;
}

.progress-bar {
 height: 100%;
 background: #42b883;
 border-radius: 4px;
 transition: width 0.3s;
}

.progress span {
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translate(-50%, -50%);
 font-weight: bold;
}
</style>
```

## 性能优化

### 密钥缓存

```typescript
// composables/useKeyCache.ts
import { ref } from 'vue'

const keyCache = new Map<string, { key: string, timestamp: number }>()

export function useKeyCache(ttl: number = 300000) { // 5分钟
 const getKey = (id: string): string | null => {
  const cached = keyCache.get(id)

  if (!cached) return null

  // 检查是否过期
  if (Date.now() - cached.timestamp > ttl) {
   keyCache.delete(id)
   return null
  }

  return cached.key
 }

 const setKey = (id: string, key: string): void => {
  keyCache.set(id, {
   key,
   timestamp: Date.now()
  })
 }

 const clearCache = (): void => {
  keyCache.clear()
 }

 return {
  getKey,
  setKey,
  clearCache
 }
}
```

### 批量加密

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { cryptoManager } from '@ldesign/crypto'

const items = ref([
 { id: '1', data: 'data1' },
 { id: '2', data: 'data2' },
 { id: '3', data: 'data3' }
])

const encryptedItems = ref([])

// 批量加密
const handleBatchEncrypt = async () => {
 const operations = items.value.map(item => ({
  id: item.id,
  data: item.data,
  key: 'encryption-key',
  algorithm: 'AES' as const
 }))

 const results = await cryptoManager.batchEncrypt(operations)

 encryptedItems.value = results.map(r => ({
  id: r.id,
  encrypted: r.result.data
 }))
}
</script>
```

## 安全最佳实践

### 密钥管理

```typescript
// 不要硬编码密钥
// 错误示例
const BAD_KEY = 'hardcoded-key' // 危险！

// 正确示例
const key = import.meta.env.VITE_ENCRYPTION_KEY
// 或从安全存储读取
const key = await getKeyFromSecureStorage()
```

### 敏感数据处理

```typescript
// 清理内存中的敏感数据
function clearSensitiveData(data: any) {
 if (typeof data === 'object') {
  for (const key in data) {
   data[key] = null
  }
 }
}

// 使用后立即清理
const password = 'user-password'
// 使用密码...
clearSensitiveData({ password })
```

## 错误处理

### 全局错误处理

```typescript
// composables/useErrorHandler.ts
import { ref } from 'vue'

export function useErrorHandler() {
 const errors = ref<string[]>([])

 const handleError = (error: unknown, context: string) => {
  const message = error instanceof Error
   ? error.message
   : String(error)

  console.error(`[${context}]`, message)
  errors.value.push(`${context}: ${message}`)
 }

 const clearErrors = () => {
  errors.value = []
 }

 return {
  errors,
  handleError,
  clearErrors
 }
}
```

## 测试

### 组合式函数测试

```typescript
// tests/composables/useEncryption.test.ts
import { describe, it, expect } from 'vitest'
import { useEncryption } from '@/composables/useEncryption'

describe('useEncryption', () => {
 it('should encrypt and decrypt text', async () => {
  const { encryptText, decryptText } = useEncryption()

  const original = 'Hello World'
  const password = 'test-password'

  const encrypted = await encryptText(original, password)
  expect(encrypted).not.toBeNull()

  const decrypted = await decryptText(encrypted!, password)
  expect(decrypted).toBe(original)
 })
})
```

## 下一步

- [安全性指南](/guide/security) - 深入了解安全性
- [性能优化](/guide/performance) - 优化性能
- [部署指南](/guide/deployment) - 生产环境部署
