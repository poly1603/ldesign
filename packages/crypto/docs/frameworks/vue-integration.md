# Vue 3 集成指南

本指南详细介绍如何在 Vue 3 项目中集成和使用 @ldesign/crypto。

## 安装

```bash
npm install @ldesign/crypto
# 或
yarn add @ldesign/crypto
# 或
pnpm add @ldesign/crypto
```

## 基础集成

### 1. 全局插件注册

```typescript
// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)

// 注册加密插件
app.use(CryptoPlugin, {
  // 插件配置选项
  globalPropertyName: '$crypto', // 全局属性名称
  registerComposables: true, // 是否注册 Composables
  config: {
    defaultAlgorithm: 'AES',
    enableCache: true,
    maxCacheSize: 1000,
    enableParallel: true,
    autoGenerateIV: true,
    keyDerivation: false,
    debug: false,
    logLevel: 'error',
  },
})

app.mount('#app')
```

### 2. 在组件中使用全局 API

```vue
<template>
  <div class="crypto-demo">
    <h2>加密演示</h2>

    <div class="form-section">
      <input v-model="plaintext" placeholder="输入要加密的文本" />
      <input v-model="secretKey" placeholder="输入密钥" />
      <button @click="handleEncrypt">加密</button>
      <button @click="handleDecrypt" :disabled="!encrypted">解密</button>
    </div>

    <div class="result-section" v-if="encrypted">
      <h3>加密结果:</h3>
      <pre>{{ encrypted }}</pre>
    </div>

    <div class="result-section" v-if="decrypted">
      <h3>解密结果:</h3>
      <p>{{ decrypted }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue'

// 获取全局加密实例
const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

// 响应式数据
const plaintext = ref('Hello, Vue!')
const secretKey = ref('my-secret-key')
const encrypted = ref('')
const decrypted = ref('')

// 加密处理
const handleEncrypt = () => {
  try {
    const result = $crypto.aes.encrypt(plaintext.value, secretKey.value, {
      keySize: 256,
      mode: 'CBC',
    })

    if (result.success) {
      encrypted.value = result.data
    } else {
      alert('加密失败: ' + result.error)
    }
  } catch (error) {
    alert('加密错误: ' + error.message)
  }
}

// 解密处理
const handleDecrypt = () => {
  try {
    const result = $crypto.aes.decrypt(encrypted.value, secretKey.value, {
      keySize: 256,
      mode: 'CBC',
    })

    if (result.success) {
      decrypted.value = result.data
    } else {
      alert('解密失败: ' + result.error)
    }
  } catch (error) {
    alert('解密错误: ' + error.message)
  }
}
</script>
```

## Composition API 集成

### 1. useCrypto Hook

```vue
<template>
  <div class="crypto-composable-demo">
    <h2>Composition API 加密演示</h2>

    <div class="form-section">
      <input v-model="inputData" placeholder="输入数据" />
      <input v-model="inputKey" placeholder="输入密钥" />

      <div class="button-group">
        <button @click="performEncryption" :disabled="isEncrypting">
          {{ isEncrypting ? '加密中...' : '🔒 AES 加密' }}
        </button>

        <button @click="performDecryption" :disabled="isDecrypting || !encryptedResult">
          {{ isDecrypting ? '解密中...' : '🔓 AES 解密' }}
        </button>

        <button @click="generateRSAKeys" :disabled="isGeneratingKeys">
          {{ isGeneratingKeys ? '生成中...' : '🔑 生成 RSA 密钥' }}
        </button>
      </div>
    </div>

    <!-- 错误显示 -->
    <div v-if="lastError" class="error-message">
      ❌ {{ lastError }}
      <button @click="clearError">清除</button>
    </div>

    <!-- 加密结果 -->
    <div v-if="encryptedResult" class="result-section">
      <h3>🔒 加密结果:</h3>
      <pre>{{ encryptedResult }}</pre>
      <button @click="copyToClipboard(encryptedResult)">📋 复制</button>
    </div>

    <!-- 解密结果 -->
    <div v-if="decryptedResult" class="result-section">
      <h3>🔓 解密结果:</h3>
      <p class="decrypted-text">{{ decryptedResult }}</p>
    </div>

    <!-- RSA 密钥对 -->
    <div v-if="rsaKeyPair" class="key-section">
      <h3>🔑 RSA 密钥对:</h3>
      <div class="key-item">
        <h4>公钥:</h4>
        <textarea :value="rsaKeyPair.publicKey" readonly rows="4"></textarea>
        <button @click="copyToClipboard(rsaKeyPair.publicKey)">📋 复制公钥</button>
      </div>
      <div class="key-item">
        <h4>私钥:</h4>
        <textarea :value="rsaKeyPair.privateKey" readonly rows="4"></textarea>
        <button @click="copyToClipboard(rsaKeyPair.privateKey)">📋 复制私钥</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

// 使用加密 Composable
const {
  // AES 加密方法
  encryptAES,
  decryptAES,

  // RSA 密钥生成
  generateRSAKeyPair,

  // 编码方法
  encodeBase64,
  decodeBase64,

  // 状态
  isEncrypting,
  isDecrypting,
  isGeneratingKeys,
  lastError,
  lastResult,

  // 操作方法
  clearError,
  reset,
} = useCrypto()

// 组件状态
const inputData = ref('Hello, Vue Composition API!')
const inputKey = ref('my-secret-key')
const encryptedResult = ref('')
const decryptedResult = ref('')
const rsaKeyPair = ref(null)

// 执行加密
const performEncryption = async () => {
  try {
    const result = await encryptAES(inputData.value, inputKey.value, {
      keySize: 256,
      mode: 'CBC',
    })
    encryptedResult.value = result
    decryptedResult.value = '' // 清空解密结果
  } catch (error) {
    console.error('加密失败:', error)
  }
}

// 执行解密
const performDecryption = async () => {
  try {
    const result = await decryptAES(encryptedResult.value, inputKey.value, {
      keySize: 256,
      mode: 'CBC',
    })
    decryptedResult.value = result
  } catch (error) {
    console.error('解密失败:', error)
  }
}

// 生成 RSA 密钥对
const generateRSAKeys = async () => {
  try {
    const keyPair = await generateRSAKeyPair(2048)
    rsaKeyPair.value = keyPair
  } catch (error) {
    console.error('密钥生成失败:', error)
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (error) {
    alert('复制失败')
  }
}
</script>

<style scoped>
.crypto-composable-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.form-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.form-section input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.button-group button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  background: #007bff;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.button-group button:hover:not(:disabled) {
  background: #0056b3;
}

.button-group button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-section {
  background: #d4edda;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.result-section h3 {
  margin-top: 0;
  color: #155724;
}

.result-section pre {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.decrypted-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #155724;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
}

.key-section {
  background: #fff3cd;
  padding: 1.5rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.key-section h3 {
  margin-top: 0;
  color: #856404;
}

.key-item {
  margin-bottom: 1rem;
}

.key-item h4 {
  margin-bottom: 0.5rem;
  color: #856404;
}

.key-item textarea {
  width: 100%;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 0.5rem;
  resize: vertical;
}
</style>
```

### 2. useHash Hook

```vue
<template>
  <div class="hash-demo">
    <h2>哈希算法演示</h2>

    <div class="form-section">
      <textarea v-model="inputData" placeholder="输入要哈希的数据..." rows="4"></textarea>

      <select v-model="selectedAlgorithm">
        <option value="md5">MD5</option>
        <option value="sha1">SHA1</option>
        <option value="sha224">SHA224</option>
        <option value="sha256">SHA256</option>
        <option value="sha384">SHA384</option>
        <option value="sha512">SHA512</option>
      </select>

      <button @click="calculateHash" :disabled="isHashing">
        {{ isHashing ? '计算中...' : '🔍 计算哈希' }}
      </button>

      <button @click="calculateHMAC" :disabled="isHashing">
        {{ isHashing ? '计算中...' : '🔐 计算 HMAC' }}
      </button>
    </div>

    <div class="hmac-section" v-if="showHMACInput">
      <input v-model="hmacKey" placeholder="输入 HMAC 密钥" type="password" />
    </div>

    <div v-if="hashResult" class="result-section">
      <h3>{{ selectedAlgorithm.toUpperCase() }} 哈希结果:</h3>
      <div class="hash-result">{{ hashResult }}</div>
      <button @click="copyToClipboard(hashResult)">📋 复制</button>
    </div>

    <div v-if="hmacResult" class="result-section">
      <h3>{{ selectedAlgorithm.toUpperCase() }} HMAC 结果:</h3>
      <div class="hash-result">{{ hmacResult }}</div>
      <button @click="copyToClipboard(hmacResult)">📋 复制</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useHash } from '@ldesign/crypto/vue'

// 使用哈希 Composable
const {
  // 哈希方法
  md5,
  sha1,
  sha224,
  sha256,
  sha384,
  sha512,

  // HMAC 方法
  hmacMd5,
  hmacSha1,
  hmacSha224,
  hmacSha256,
  hmacSha384,
  hmacSha512,

  // 验证方法
  verify,
  verifyHmac,

  // 状态
  isHashing,
  lastError,

  // 操作
  clearError,
} = useHash()

// 组件状态
const inputData = ref('Hello, Hash!')
const selectedAlgorithm = ref('sha256')
const hashResult = ref('')
const hmacResult = ref('')
const hmacKey = ref('secret-key')
const showHMACInput = ref(false)

// 计算哈希
const calculateHash = async () => {
  try {
    let result: string

    switch (selectedAlgorithm.value) {
      case 'md5':
        result = await md5(inputData.value)
        break
      case 'sha1':
        result = await sha1(inputData.value)
        break
      case 'sha224':
        result = await sha224(inputData.value)
        break
      case 'sha256':
        result = await sha256(inputData.value)
        break
      case 'sha384':
        result = await sha384(inputData.value)
        break
      case 'sha512':
        result = await sha512(inputData.value)
        break
      default:
        result = await sha256(inputData.value)
    }

    hashResult.value = result
    hmacResult.value = '' // 清空 HMAC 结果
    showHMACInput.value = false
  } catch (error) {
    console.error('哈希计算失败:', error)
  }
}

// 计算 HMAC
const calculateHMAC = async () => {
  showHMACInput.value = true

  if (!hmacKey.value) {
    alert('请输入 HMAC 密钥')
    return
  }

  try {
    let result: string

    switch (selectedAlgorithm.value) {
      case 'md5':
        result = await hmacMd5(inputData.value, hmacKey.value)
        break
      case 'sha1':
        result = await hmacSha1(inputData.value, hmacKey.value)
        break
      case 'sha224':
        result = await hmacSha224(inputData.value, hmacKey.value)
        break
      case 'sha256':
        result = await hmacSha256(inputData.value, hmacKey.value)
        break
      case 'sha384':
        result = await hmacSha384(inputData.value, hmacKey.value)
        break
      case 'sha512':
        result = await hmacSha512(inputData.value, hmacKey.value)
        break
      default:
        result = await hmacSha256(inputData.value, hmacKey.value)
    }

    hmacResult.value = result
    hashResult.value = '' // 清空普通哈希结果
  } catch (error) {
    console.error('HMAC 计算失败:', error)
  }
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  } catch (error) {
    alert('复制失败')
  }
}
</script>
```

## 高级用法

### 1. 自定义配置

```typescript
// crypto.config.ts
import type { CryptoPluginOptions } from '@ldesign/crypto/vue'

export const cryptoConfig: CryptoPluginOptions = {
  globalPropertyName: '$crypto',
  registerComposables: true,
  config: {
    defaultAlgorithm: 'AES',
    enableCache: true,
    maxCacheSize: 1000,
    enableParallel: true,
    autoGenerateIV: true,
    keyDerivation: false,
    debug: process.env.NODE_ENV === 'development',
    logLevel: 'warn',
  },
}

// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { cryptoConfig } from './crypto.config'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin, cryptoConfig)
app.mount('#app')
```

### 2. 类型安全

```typescript
// types/crypto.d.ts
import type { GlobalCrypto } from '@ldesign/crypto/vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto: GlobalCrypto
  }
}
```

### 3. 错误处理

```vue
<script setup lang="ts">
import { useCrypto } from '@ldesign/crypto/vue'
import { watch } from 'vue'

const { lastError, clearError } = useCrypto()

// 监听错误并处理
watch(lastError, error => {
  if (error) {
    console.error('加密操作错误:', error)

    // 显示用户友好的错误消息
    showErrorNotification(error)

    // 自动清除错误（可选）
    setTimeout(() => {
      clearError()
    }, 5000)
  }
})

function showErrorNotification(error: string) {
  // 实现错误通知逻辑
  // 例如使用 Element Plus 的 ElMessage
  // ElMessage.error(error)
}
</script>
```

## 高级集成示例

### 1. 实时数据加密组件

```vue
<template>
  <div class="real-time-crypto">
    <h3>实时加密演示</h3>

    <div class="input-section">
      <textarea
        v-model="inputText"
        @input="handleRealTimeEncryption"
        placeholder="输入文本，实时查看加密结果..."
        rows="4"
      ></textarea>

      <div class="key-section">
        <input
          v-model="encryptionKey"
          @input="handleRealTimeEncryption"
          placeholder="加密密钥"
          type="password"
        />
        <button @click="generateRandomKey">🎲 随机密钥</button>
      </div>
    </div>

    <div class="output-section">
      <div class="encrypted-output">
        <h4>🔒 加密结果</h4>
        <pre v-if="encryptedResult">{{ encryptedResult }}</pre>
        <p v-else class="placeholder">输入文本后显示加密结果</p>
      </div>

      <div class="hash-output">
        <h4>🔍 SHA-256 哈希</h4>
        <code v-if="hashResult">{{ hashResult }}</code>
        <p v-else class="placeholder">输入文本后显示哈希值</p>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <span class="label">加密次数:</span>
        <span class="value">{{ encryptionCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">平均耗时:</span>
        <span class="value">{{ averageTime.toFixed(2) }}ms</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCrypto, useHash } from '@ldesign/crypto/vue'
import { keyGenerator } from '@ldesign/crypto'

// 使用 Composables
const { encryptAES } = useCrypto()
const { sha256 } = useHash()

// 响应式数据
const inputText = ref('')
const encryptionKey = ref('default-key')
const encryptedResult = ref('')
const hashResult = ref('')
const encryptionCount = ref(0)
const encryptionTimes = ref<number[]>([])

// 计算平均时间
const averageTime = computed(() => {
  if (encryptionTimes.value.length === 0) return 0
  const sum = encryptionTimes.value.reduce((a, b) => a + b, 0)
  return sum / encryptionTimes.value.length
})

// 防抖处理
let debounceTimer: NodeJS.Timeout | null = null

const handleRealTimeEncryption = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(async () => {
    if (inputText.value && encryptionKey.value) {
      await performEncryption()
    } else {
      encryptedResult.value = ''
      hashResult.value = ''
    }
  }, 300) // 300ms 防抖
}

const performEncryption = async () => {
  const startTime = performance.now()

  try {
    // 并行执行加密和哈希
    const [encrypted, hashed] = await Promise.all([
      encryptAES(inputText.value, encryptionKey.value, { keySize: 256 }),
      sha256(inputText.value),
    ])

    encryptedResult.value = encrypted
    hashResult.value = hashed

    // 记录性能
    const endTime = performance.now()
    const duration = endTime - startTime
    encryptionTimes.value.push(duration)

    // 保持最近100次记录
    if (encryptionTimes.value.length > 100) {
      encryptionTimes.value.shift()
    }

    encryptionCount.value++
  } catch (error) {
    console.error('加密失败:', error)
  }
}

const generateRandomKey = () => {
  encryptionKey.value = keyGenerator.generateKey(32)
  handleRealTimeEncryption()
}

// 监听输入变化
watch([inputText, encryptionKey], handleRealTimeEncryption)
</script>

<style scoped>
.real-time-crypto {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  resize: vertical;
}

.key-section {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.key-section input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.output-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.encrypted-output,
.hash-output {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.encrypted-output h4,
.hash-output h4 {
  margin-top: 0;
  color: #4a5568;
}

.encrypted-output pre {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.9rem;
}

.hash-output code {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  display: block;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  word-break: break-all;
}

.placeholder {
  color: #a0aec0;
  font-style: italic;
}

.stats-section {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #e6fffa;
  border-radius: 8px;
  border: 1px solid #81e6d9;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-item .label {
  font-size: 0.9rem;
  color: #234e52;
  margin-bottom: 0.25rem;
}

.stat-item .value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #234e52;
}

@media (max-width: 768px) {
  .output-section {
    grid-template-columns: 1fr;
  }

  .stats-section {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
```

### 2. 文件加密上传组件

```vue
<template>
  <div class="file-crypto-uploader">
    <h3>安全文件上传</h3>

    <div class="upload-section">
      <div
        class="drop-zone"
        :class="{ 'drag-over': isDragOver }"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          @change="handleFileSelect"
          style="display: none"
          multiple
          accept=".txt,.json,.csv"
        />

        <div class="drop-content">
          <div class="icon">📁</div>
          <p>拖拽文件到此处或点击选择文件</p>
          <small>支持 .txt, .json, .csv 文件</small>
        </div>
      </div>

      <div class="encryption-options">
        <label>
          <input v-model="encryptionKey" placeholder="加密密钥" type="password" />
        </label>
        <button @click="generateSecureKey" class="key-gen-btn">🔑 生成安全密钥</button>
      </div>
    </div>

    <div v-if="files.length > 0" class="files-list">
      <h4>文件列表 ({{ files.length }})</h4>

      <div class="file-item" v-for="file in files" :key="file.id">
        <div class="file-info">
          <div class="file-name">{{ file.name }}</div>
          <div class="file-size">{{ formatFileSize(file.size) }}</div>
          <div class="file-status" :class="file.status">
            {{ getStatusText(file.status) }}
          </div>
        </div>

        <div class="file-actions">
          <button
            v-if="file.status === 'ready'"
            @click="encryptFile(file)"
            :disabled="!encryptionKey"
            class="encrypt-btn"
          >
            🔒 加密
          </button>

          <button
            v-if="file.status === 'encrypted'"
            @click="downloadEncryptedFile(file)"
            class="download-btn"
          >
            💾 下载
          </button>

          <button @click="removeFile(file.id)" class="remove-btn">🗑️ 删除</button>
        </div>

        <div v-if="file.status === 'encrypting'" class="progress-bar">
          <div class="progress-fill" :style="{ width: file.progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'
import { keyGenerator, hash } from '@ldesign/crypto'

interface FileItem {
  id: string
  name: string
  size: number
  content: string
  status: 'ready' | 'encrypting' | 'encrypted' | 'error'
  progress: number
  encryptedData?: string
  iv?: string
  hash?: string
}

// 使用加密 Composable
const { encryptAES } = useCrypto()

// 响应式数据
const files = ref<FileItem[]>([])
const encryptionKey = ref('')
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

// 处理文件拖拽
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const droppedFiles = Array.from(event.dataTransfer?.files || [])
  processFiles(droppedFiles)
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const selectedFiles = Array.from(target.files || [])
  processFiles(selectedFiles)
}

// 触发文件输入
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 处理文件
const processFiles = async (fileList: File[]) => {
  for (const file of fileList) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB 限制
      alert(`文件 ${file.name} 过大，最大支持 5MB`)
      continue
    }

    const content = await readFileContent(file)
    const fileItem: FileItem = {
      id: Math.random().toString(36),
      name: file.name,
      size: file.size,
      content,
      status: 'ready',
      progress: 0,
    }

    files.value.push(fileItem)
  }
}

// 读取文件内容
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

// 加密文件
const encryptFile = async (file: FileItem) => {
  file.status = 'encrypting'
  file.progress = 0

  try {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      if (file.progress < 90) {
        file.progress += Math.random() * 20
      }
    }, 100)

    // 计算文件哈希
    const fileHash = hash.sha256(file.content)

    // 加密文件内容
    const encrypted = await encryptAES(file.content, encryptionKey.value, {
      keySize: 256,
      mode: 'CBC',
    })

    clearInterval(progressInterval)
    file.progress = 100

    // 更新文件状态
    file.encryptedData = encrypted
    file.hash = fileHash
    file.status = 'encrypted'

    await nextTick()
    setTimeout(() => {
      file.progress = 0
    }, 1000)
  } catch (error) {
    file.status = 'error'
    console.error('文件加密失败:', error)
  }
}

// 下载加密文件
const downloadEncryptedFile = (file: FileItem) => {
  if (!file.encryptedData) return

  const exportData = {
    originalName: file.name,
    encryptedData: file.encryptedData,
    hash: file.hash,
    timestamp: new Date().toISOString(),
    algorithm: 'AES-256-CBC',
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${file.name}.encrypted.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 移除文件
const removeFile = (fileId: string) => {
  const index = files.value.findIndex(f => f.id === fileId)
  if (index !== -1) {
    files.value.splice(index, 1)
  }
}

// 生成安全密钥
const generateSecureKey = () => {
  encryptionKey.value = keyGenerator.generateKey(32)
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap = {
    ready: '准备就绪',
    encrypting: '加密中...',
    encrypted: '已加密',
    error: '错误',
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.file-crypto-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.drop-zone {
  border: 2px dashed #cbd5e0;
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.drop-zone:hover,
.drop-zone.drag-over {
  border-color: #667eea;
  background: #f0f4ff;
}

.drop-content .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.drop-content p {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #4a5568;
}

.drop-content small {
  color: #718096;
}

.encryption-options {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
}

.encryption-options input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.key-gen-btn {
  padding: 0.75rem 1rem;
  background: #805ad5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
}

.files-list {
  margin-top: 2rem;
}

.files-list h4 {
  color: #4a5568;
  margin-bottom: 1rem;
}

.file-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.file-info {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.file-name {
  font-weight: 600;
  color: #2d3748;
}

.file-size {
  color: #718096;
  font-size: 0.9rem;
}

.file-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.file-status.ready {
  background: #bee3f8;
  color: #2b6cb0;
}

.file-status.encrypting {
  background: #fef5e7;
  color: #d69e2e;
}

.file-status.encrypted {
  background: #c6f6d5;
  color: #38a169;
}

.file-status.error {
  background: #fed7d7;
  color: #e53e3e;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.file-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.encrypt-btn {
  background: #667eea;
  color: white;
}

.download-btn {
  background: #38a169;
  color: white;
}

.remove-btn {
  background: #e53e3e;
  color: white;
}

.file-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}
</style>
```

## 最佳实践

### 1. 性能优化

- 使用 `enableCache` 选项缓存加密结果
- 对于大量数据，启用 `enableParallel` 并行处理
- 合理设置 `maxCacheSize` 避免内存泄漏
- 使用防抖处理实时加密场景

### 2. 安全考虑

- 不要在前端硬编码敏感密钥
- 使用环境变量管理配置
- 定期清理敏感数据
- 使用 HTTPS 传输加密数据
- 实现适当的访问控制

### 3. 错误处理

- 始终处理加密/解密可能的错误
- 提供用户友好的错误消息
- 记录详细的错误日志用于调试
- 实现重试机制

### 4. 用户体验

- 提供加密进度指示
- 实现拖拽上传功能
- 显示操作状态和结果
- 提供快捷操作按钮

### 5. 测试

```typescript
// tests/crypto.test.ts
import { mount } from '@vue/test-utils'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import YourComponent from '@/components/YourComponent.vue'

describe('Crypto Integration', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const wrapper = mount(YourComponent, {
      global: {
        plugins: [CryptoPlugin],
      },
    })

    // 测试加密功能
    await wrapper.find('[data-test="encrypt-button"]').trigger('click')

    // 验证结果
    expect(wrapper.find('[data-test="encrypted-result"]').text()).toBeTruthy()
  })

  it('should handle encryption errors gracefully', async () => {
    const wrapper = mount(YourComponent, {
      global: {
        plugins: [CryptoPlugin],
      },
    })

    // 模拟错误情况
    await wrapper.setData({ encryptionKey: '' })
    await wrapper.find('[data-test="encrypt-button"]').trigger('click')

    // 验证错误处理
    expect(wrapper.find('[data-test="error-message"]').exists()).toBe(true)
  })
})
```
