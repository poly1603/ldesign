# Vue 3 插件使用

@ldesign/crypto 提供了完整的 Vue 3 插件，支持全局注册和配置。

## 安装插件

### 基本安装

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 使用默认配置安装插件
app.use(CryptoPlugin)

app.mount('#app')
```

### 自定义配置

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 使用自定义配置安装插件
app.use(CryptoPlugin, {
  // 全局属性名称（默认为 $crypto）
  globalPropertyName: '$crypto',

  // 是否注册全局组合式函数（默认为 true）
  registerComposables: true,

  // 自定义配置
  config: {
    // 默认 AES 密钥大小
    defaultAESKeySize: 256,

    // 默认 RSA 密钥大小
    defaultRSAKeySize: 2048,

    // 默认哈希算法
    defaultHashAlgorithm: 'SHA256',

    // 默认编码类型
    defaultEncoding: 'hex',
  },
})

app.mount('#app')
```

### 便捷安装函数

```typescript
import { installCrypto } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 使用便捷安装函数
installCrypto(app, {
  config: {
    defaultAESKeySize: 256,
    defaultRSAKeySize: 4096,
  },
})

app.mount('#app')
```

## 全局属性使用

安装插件后，可以在任何组件中通过 `this.$crypto` 访问加密功能。

### Options API 中使用

```vue
<script>
export default {
  data() {
    return {
      data: 'Hello, Plugin!',
      key: 'my-secret-key',
      encrypted: null,
      decrypted: '',
    }
  },

  methods: {
    encrypt() {
      // 使用全局 $crypto 属性
      this.encrypted = this.$crypto.encrypt.aes(this.data, this.key)
      this.decrypted = ''
    },

    decrypt() {
      if (this.encrypted) {
        const result = this.$crypto.decrypt.aes(this.encrypted, this.key)
        this.decrypted = result.data
      }
    },

    generateHash() {
      // 使用哈希功能
      const hashValue = this.$crypto.hash.sha256(this.data)
      console.log('SHA256 哈希:', hashValue)
    },

    encodeBase64() {
      // 使用编码功能
      const encoded = this.$crypto.base64.encode(this.data)
      console.log('Base64 编码:', encoded)
    },
  },
}
</script>

<template>
  <div>
    <input v-model="data" placeholder="输入数据">
    <input v-model="key" placeholder="输入密钥">
    <button @click="encrypt">
      加密
    </button>
    <button :disabled="!encrypted" @click="decrypt">
      解密
    </button>

    <div v-if="encrypted">
      <h3>加密结果</h3>
      <p>{{ encrypted.data }}</p>
    </div>

    <div v-if="decrypted">
      <h3>解密结果</h3>
      <p>{{ decrypted }}</p>
    </div>
  </div>
</template>
```

### Composition API 中使用

```vue
<script setup>
import { getCurrentInstance, ref } from 'vue'

const data = ref('Hello, Composition API!')
const result = ref('')

// 获取当前实例以访问全局属性
const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

function handleCrypto() {
  if (!$crypto)
    return

  // 使用全局 crypto 实例
  const key = 'test-key'
  const encrypted = $crypto.encrypt.aes(data.value, key)
  const decrypted = $crypto.decrypt.aes(encrypted, key)
  const hashValue = $crypto.hash.sha256(data.value)

  result.value = {
    original: data.value,
    encrypted: encrypted.data,
    decrypted: decrypted.data,
    hash: hashValue,
  }
}
</script>

<template>
  <div>
    <input v-model="data" placeholder="输入数据">
    <button @click="handleCrypto">
      测试加密
    </button>

    <div v-if="result">
      <h3>结果</h3>
      <pre>{{ result }}</pre>
    </div>
  </div>
</template>
```

## 依赖注入使用

插件还提供了依赖注入支持，可以在任何组件中注入加密功能。

### 注入加密实例

```vue
<script setup>
import { inject, ref } from 'vue'

// 注入加密实例
const crypto = inject('crypto')
const cryptoConfig = inject('cryptoConfig')

const cryptoResult = ref(null)

function testCrypto() {
  if (!crypto) {
    console.error('Crypto not available')
    return
  }

  const testData = 'Dependency Injection Test'
  const testKey = 'injection-key'

  // 使用注入的加密实例
  const encrypted = crypto.encrypt.aes(testData, testKey)
  const decrypted = crypto.decrypt.aes(encrypted, testKey)

  cryptoResult.value = {
    original: testData,
    encrypted: encrypted.data,
    decrypted: decrypted.data,
    match: decrypted.data === testData,
  }

  console.log('Crypto config:', cryptoConfig)
}
</script>

<template>
  <div>
    <h2>依赖注入示例</h2>
    <button @click="testCrypto">
      测试加密功能
    </button>

    <div v-if="cryptoResult">
      <h3>加密测试结果</h3>
      <p>原始数据: {{ cryptoResult.original }}</p>
      <p>加密数据: {{ cryptoResult.encrypted }}</p>
      <p>解密数据: {{ cryptoResult.decrypted }}</p>
      <p>匹配: {{ cryptoResult.match ? '✅' : '❌' }}</p>
    </div>
  </div>
</template>
```

### 在子组件中使用

```vue
<!-- ParentComponent.vue -->
<script setup>
import { inject, ref } from 'vue'
import ChildComponent from './ChildComponent.vue'
</script>

<script setup>
const crypto = inject('crypto')
const hashResult = ref('')

function useInjectedCrypto() {
  if (crypto) {
    hashResult.value = crypto.hash.sha256('Child component data')
  }
}
</script>

<!-- ChildComponent.vue -->
<template>
  <div>
    <h2>父组件</h2>
    <ChildComponent />
  </div>
</template>

<template>
  <div>
    <h3>子组件</h3>
    <button @click="useInjectedCrypto">使用注入的加密功能</button>

    <div v-if="hashResult">
      <p>哈希结果: {{ hashResult }}</p>
    </div>
  </div>
</template>
```

## 插件配置选项

### 完整配置示例

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(CryptoPlugin, {
  // 全局属性名称
  globalPropertyName: '$crypto',

  // 是否注册全局组合式函数
  registerComposables: true,

  // 自定义配置
  config: {
    // 默认 AES 密钥大小 (128, 192, 256)
    defaultAESKeySize: 256,

    // 默认 RSA 密钥大小 (1024, 2048, 3072, 4096)
    defaultRSAKeySize: 2048,

    // 默认哈希算法
    defaultHashAlgorithm: 'SHA256',

    // 默认编码类型
    defaultEncoding: 'hex',
  },
})

app.mount('#app')
```

### 环境特定配置

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// config/crypto.ts
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import { cryptoConfig } from './config/crypto'

export const cryptoConfig = {
  development: {
    defaultAESKeySize: 128, // 开发环境使用较小的密钥以提高性能
    defaultRSAKeySize: 1024,
    defaultHashAlgorithm: 'SHA256',
    defaultEncoding: 'hex',
  },

  production: {
    defaultAESKeySize: 256, // 生产环境使用更强的加密
    defaultRSAKeySize: 4096,
    defaultHashAlgorithm: 'SHA512',
    defaultEncoding: 'base64',
  },
}

const app = createApp(App)

const env = process.env.NODE_ENV || 'development'
app.use(CryptoPlugin, {
  config: cryptoConfig[env],
})

app.mount('#app')
```

## 类型支持

插件提供完整的 TypeScript 支持。

### 全局属性类型声明

```typescript
// types/vue.d.ts
import type { GlobalCrypto } from '@ldesign/crypto/vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $crypto: GlobalCrypto
  }
}
```

### 组件中的类型使用

```vue
<script setup lang="ts">
import type { DecryptResult, EncryptResult } from '@ldesign/crypto'
import { getCurrentInstance, ref } from 'vue'

const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

const encryptedData = ref<EncryptResult | null>(null)
const decryptedData = ref<DecryptResult | null>(null)

function handleEncryption(): void {
  if (!$crypto)
    return

  const data = 'TypeScript example'
  const key = 'typescript-key'

  encryptedData.value = $crypto.encrypt.aes(data, key)

  if (encryptedData.value) {
    decryptedData.value = $crypto.decrypt.aes(encryptedData.value, key)
  }
}
</script>
```

## 最佳实践

### 1. 错误处理

```vue
<script setup>
import { getCurrentInstance, ref } from 'vue'

const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

const error = ref('')
const result = ref('')

async function safeEncrypt(data, key) {
  try {
    error.value = ''

    if (!$crypto) {
      throw new Error('Crypto plugin not available')
    }

    const encrypted = $crypto.encrypt.aes(data, key)
    const decrypted = $crypto.decrypt.aes(encrypted, key)

    if (!decrypted.success) {
      throw new Error(decrypted.error || 'Decryption failed')
    }

    result.value = decrypted.data
  }
  catch (err) {
    error.value = err.message
    console.error('Encryption error:', err)
  }
}
</script>
```

### 2. 性能优化

```vue
<script setup>
import { computed, getCurrentInstance, ref } from 'vue'

const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

// 缓存加密结果
const encryptionCache = new Map()

function cachedEncrypt(data, key) {
  const cacheKey = `${data}:${key}`

  if (encryptionCache.has(cacheKey)) {
    return encryptionCache.get(cacheKey)
  }

  const result = $crypto.encrypt.aes(data, key)
  encryptionCache.set(cacheKey, result)

  return result
}

// 清理缓存
function clearCache() {
  encryptionCache.clear()
}
</script>
```

### 3. 组件封装

```vue
<!-- CryptoForm.vue -->
<script setup>
import { computed, getCurrentInstance, ref } from 'vue'

const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

const data = ref('')
const key = ref('')
const encrypted = ref(null)
const decrypted = ref('')
const error = ref('')

const canEncrypt = computed(() => data.value && key.value)
const canDecrypt = computed(() => encrypted.value && key.value)

function encrypt() {
  try {
    error.value = ''
    encrypted.value = $crypto.encrypt.aes(data.value, key.value)
    decrypted.value = ''
  }
  catch (err) {
    error.value = err.message
  }
}

function decrypt() {
  try {
    error.value = ''
    const result = $crypto.decrypt.aes(encrypted.value, key.value)
    if (result.success) {
      decrypted.value = result.data
    }
    else {
      error.value = result.error || 'Decryption failed'
    }
  }
  catch (err) {
    error.value = err.message
  }
}

function clear() {
  data.value = ''
  key.value = ''
  encrypted.value = null
  decrypted.value = ''
  error.value = ''
}
</script>

<template>
  <div class="crypto-form">
    <div class="form-group">
      <label>数据:</label>
      <textarea v-model="data" placeholder="输入要加密的数据" />
    </div>

    <div class="form-group">
      <label>密钥:</label>
      <input v-model="key" type="password" placeholder="输入密钥">
    </div>

    <div class="form-actions">
      <button :disabled="!canEncrypt" @click="encrypt">
        加密
      </button>
      <button :disabled="!canDecrypt" @click="decrypt">
        解密
      </button>
      <button @click="clear">
        清除
      </button>
    </div>

    <div v-if="encrypted" class="result">
      <h3>加密结果</h3>
      <p>{{ encrypted.data }}</p>
    </div>

    <div v-if="decrypted" class="result success">
      <h3>解密结果</h3>
      <p>{{ decrypted }}</p>
    </div>

    <div v-if="error" class="result error">
      <h3>错误</h3>
      <p>{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.crypto-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin: 20px 0;
}

.form-actions button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f5f5;
}

.result.success {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
}

.result.error {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
  color: #721c24;
}
</style>
```
