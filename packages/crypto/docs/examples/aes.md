# AES 对称加密示例

AES (Advanced Encryption Standard) 是最广泛使用的对称加密算法。本页面提供了完整的交互式演示。

## 交互式演示

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔐 AES 加密演示</h3>

    <div class="form-group">
      <label>要加密的数据:</label>
      <textarea id="aes-data" placeholder="输入要加密的数据">Hello, AES Encryption!</textarea>
    </div>

    <div class="form-group">
      <label>密钥:</label>
      <input type="text" id="aes-key" placeholder="输入密钥" value="my-secret-key-32-characters-long">
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>密钥长度:</label>
        <select id="aes-key-size">
          <option value="128">AES-128</option>
          <option value="192">AES-192</option>
          <option value="256" selected>AES-256</option>
        </select>
      </div>

      <div class="form-group">
        <label>加密模式:</label>
        <select id="aes-mode">
          <option value="CBC" selected>CBC</option>
          <option value="ECB">ECB</option>
          <option value="CFB">CFB</option>
          <option value="OFB">OFB</option>
          <option value="CTR">CTR</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button id="aes-encrypt-btn" class="btn primary">🔒 加密</button>
      <button id="aes-decrypt-btn" class="btn secondary">🔓 解密</button>
      <button id="aes-generate-key-btn" class="btn success">🔑 生成密钥</button>
      <button id="aes-clear-btn" class="btn">🗑️ 清除</button>
    </div>

    <div id="aes-encrypted-result" class="result-box" style="display: none;">
      <h4>🔒 加密结果</h4>
      <div class="result-item">
        <label>加密数据:</label>
        <div id="aes-encrypted-data" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>算法:</label>
        <div id="aes-algorithm" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>初始化向量 (IV):</label>
        <div id="aes-iv" class="result-value"></div>
      </div>
    </div>

    <div id="aes-decrypted-result" class="result-box success" style="display: none;">
      <h4>🔓 解密结果</h4>
      <div class="result-item">
        <label>解密数据:</label>
        <div id="aes-decrypted-data" class="result-value"></div>
      </div>
    </div>

    <div id="aes-error" class="result-box error" style="display: none;"></div>

  </div>
</div>

## 代码示例

### 基本用法

```typescript
import { decrypt, encrypt } from '@ldesign/crypto'

// 基本 AES 加密
const data = 'Hello, AES!'
const key = 'my-secret-key'

const encrypted = encrypt.aes(data, key)
console.log('加密结果:', encrypted)
// {
//   data: "encrypted-string",
//   algorithm: "AES-256-CBC",
//   iv: "initialization-vector"
// }

// 解密
const decrypted = decrypt.aes(encrypted, key)
console.log('解密结果:', decrypted.data) // "Hello, AES!"
```

### 指定参数

```typescript
// 使用 AES-128-ECB 模式
const encrypted128 = encrypt.aes(data, key, {
  keySize: 128,
  mode: 'ECB',
})

// 使用 AES-256-CTR 模式
const encrypted256 = encrypt.aes(data, key, {
  keySize: 256,
  mode: 'CTR',
})
```

### 自定义 IV

```typescript
import { keyGenerator } from '@ldesign/crypto'

// 生成自定义 IV
const customIV = keyGenerator.generateIV(16)

const encrypted = encrypt.aes(data, key, {
  iv: customIV,
})

// 解密时使用相同的 IV
const decrypted = decrypt.aes(encrypted, key, {
  iv: customIV,
})
```

### 便捷方法

```typescript
// 直接使用特定密钥长度的方法
const encrypted128 = encrypt.aes128(data, key)
const encrypted192 = encrypt.aes192(data, key)
const encrypted256 = encrypt.aes256(data, key)

// 对应的解密方法
const decrypted128 = decrypt.aes128(encrypted128, key)
const decrypted192 = decrypt.aes192(encrypted192, key)
const decrypted256 = decrypt.aes256(encrypted256, key)
```

## Vue 3 集成

### 使用 Composition API

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { encryptAES, decryptAES, isEncrypting, isDecrypting } = useCrypto()

const data = ref('Hello, Vue AES!')
const key = ref('vue-secret-key')
const encryptedResult = ref(null)
const decryptedResult = ref(null)

async function handleEncrypt() {
  encryptedResult.value = await encryptAES(data.value, key.value)
  decryptedResult.value = null
}

async function handleDecrypt() {
  if (encryptedResult.value) {
    decryptedResult.value = await decryptAES(encryptedResult.value, key.value)
  }
}
</script>

<template>
  <div>
    <input v-model="data" placeholder="输入数据" />
    <input v-model="key" placeholder="输入密钥" />
    <button :disabled="isEncrypting" @click="handleEncrypt">
      {{ isEncrypting ? '加密中...' : '加密' }}
    </button>
    <button :disabled="isDecrypting" @click="handleDecrypt">
      {{ isDecrypting ? '解密中...' : '解密' }}
    </button>

    <div v-if="encryptedResult">
      <h3>加密结果</h3>
      <p>数据: {{ encryptedResult.data }}</p>
      <p>算法: {{ encryptedResult.algorithm }}</p>
    </div>

    <div v-if="decryptedResult">
      <h3>解密结果</h3>
      <p>{{ decryptedResult.data }}</p>
    </div>
  </div>
</template>
```

## 实际应用场景

### 1. 敏感数据存储

```typescript
class SecureStorage {
  private key: string

  constructor(userKey: string) {
    this.key = userKey
  }

  // 加密存储
  setItem(key: string, value: any): void {
    const serialized = JSON.stringify(value)
    const encrypted = encrypt.aes(serialized, this.key)
    localStorage.setItem(key, JSON.stringify(encrypted))
  }

  // 解密读取
  getItem(key: string): any {
    const stored = localStorage.getItem(key)
    if (!stored) return null

    try {
      const encrypted = JSON.parse(stored)
      const decrypted = decrypt.aes(encrypted, this.key)

      if (!decrypted.success) return null

      return JSON.parse(decrypted.data)
    } catch {
      return null
    }
  }
}

// 使用示例
const storage = new SecureStorage('user-master-key')
storage.setItem('userProfile', { name: 'John', email: 'john@example.com' })
const profile = storage.getItem('userProfile')
```

### 2. 配置文件加密

```typescript
interface AppConfig {
  apiKey: string
  databaseUrl: string
  secretSettings: object
}

class ConfigManager {
  private static readonly CONFIG_KEY = 'app-config-key'

  static saveConfig(config: AppConfig): string {
    const configJson = JSON.stringify(config)
    const encrypted = encrypt.aes256(configJson, this.CONFIG_KEY)
    return JSON.stringify(encrypted)
  }

  static loadConfig(encryptedConfig: string): AppConfig | null {
    try {
      const encrypted = JSON.parse(encryptedConfig)
      const decrypted = decrypt.aes256(encrypted, this.CONFIG_KEY)

      if (!decrypted.success) return null

      return JSON.parse(decrypted.data)
    } catch {
      return null
    }
  }
}
```

### 3. 表单数据保护

```typescript
class FormEncryption {
  static encryptFormData(formData: FormData, key: string): string {
    const data: Record<string, string> = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }

    const jsonData = JSON.stringify(data)
    const encrypted = encrypt.aes(jsonData, key)

    return JSON.stringify(encrypted)
  }

  static decryptFormData(encryptedData: string, key: string): FormData | null {
    try {
      const encrypted = JSON.parse(encryptedData)
      const decrypted = decrypt.aes(encrypted, key)

      if (!decrypted.success) return null

      const data = JSON.parse(decrypted.data)
      const formData = new FormData()

      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value as string)
      }

      return formData
    } catch {
      return null
    }
  }
}
```

## 性能测试

### 不同密钥长度的性能对比

```typescript
function performanceTest() {
  const data = 'A'.repeat(10000) // 10KB 数据
  const key = 'performance-test-key-32-chars-long'

  console.time('AES-128')
  const encrypted128 = encrypt.aes128(data, key)
  const decrypted128 = decrypt.aes128(encrypted128, key)
  console.timeEnd('AES-128')

  console.time('AES-192')
  const encrypted192 = encrypt.aes192(data, key)
  const decrypted192 = decrypt.aes192(encrypted192, key)
  console.timeEnd('AES-192')

  console.time('AES-256')
  const encrypted256 = encrypt.aes256(data, key)
  const decrypted256 = decrypt.aes256(encrypted256, key)
  console.timeEnd('AES-256')
}

performanceTest()
```

### 不同模式的性能对比

```typescript
function modePerformanceTest() {
  const data = 'Performance test data'
  const key = 'test-key'
  const modes = ['CBC', 'ECB', 'CFB', 'OFB', 'CTR']

  modes.forEach(mode => {
    console.time(`AES-256-${mode}`)

    const encrypted = encrypt.aes(data, key, { mode })
    const decrypted = decrypt.aes(encrypted, key, { mode })

    console.timeEnd(`AES-256-${mode}`)
    console.log(`${mode} 结果匹配:`, decrypted.data === data)
  })
}
```

## 安全注意事项

### 1. 密钥管理

```typescript
// ❌ 错误：硬编码密钥
const BAD_KEY = 'hardcoded-key'

// ✅ 正确：从安全来源获取密钥
const key = process.env.ENCRYPTION_KEY || (await getKeyFromSecureStorage())

// ✅ 正确：生成强随机密钥
const strongKey = keyGenerator.generateKey(32) // 256 位密钥
```

### 2. IV 管理

```typescript
// ❌ 错误：重复使用相同的 IV
const FIXED_IV = '1234567890abcdef'

// ✅ 正确：每次加密使用新的随机 IV
const randomIV = keyGenerator.generateIV(16)
const encrypted = encrypt.aes(data, key, { iv: randomIV })
```

### 3. 错误处理

```typescript
function safeDecrypt(encryptedData: any, key: string) {
  try {
    const result = decrypt.aes(encryptedData, key)

    if (!result.success) {
      console.error('解密失败:', result.error)
      return null
    }

    return result.data
  } catch (error) {
    console.error('解密异常:', error.message)
    return null
  }
}
```

<script>
// 交互式演示的 JavaScript 代码
document.addEventListener('DOMContentLoaded', function() {
  // 这里会添加交互式演示的逻辑
  // 由于这是 markdown 文件，实际的 JavaScript 需要在 VitePress 主题中实现
  console.log('AES 演示页面已加载')
})
</script>

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
</style>
