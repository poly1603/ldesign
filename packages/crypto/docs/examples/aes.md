# AES 对称加密示例

本页展示 AES 对称加密在 @ldesign/crypto 中的常用用法，示例均为纯代码，SSR 友好。

## 基本用法

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

const data = 'Hello, AES!'
const key = 'my-secret-key'

const encrypted = encrypt.aes(data, key)
const decrypted = decrypt.aes(encrypted, key)

console.log(encrypted.success, decrypted.data)
```

## 指定参数

```ts path=null start=null
import { encrypt } from '@ldesign/crypto'

// AES-128+ECB（仅示例，不推荐用于生产）
const e1 = encrypt.aes('text', 'key', { keySize: 128, mode: 'ECB' })

// AES-256+CTR
const e2 = encrypt.aes('text', 'key', { keySize: 256, mode: 'CTR' })
```

## 自定义 IV

```ts path=null start=null
import { decrypt, encrypt, keyGenerator } from '@ldesign/crypto'

const iv = keyGenerator.generateIV(16)
const encrypted = encrypt.aes('text', 'key', { iv })
const decrypted = decrypt.aes(encrypted, 'key', { iv })
```

## 便捷方法

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

const e128 = encrypt.aes128('data', 'key')
const e192 = encrypt.aes192('data', 'key')
const e256 = encrypt.aes256('data', 'key')

const d128 = decrypt.aes128(e128, 'key')
const d192 = decrypt.aes192(e192, 'key')
const d256 = decrypt.aes256(e256, 'key')
```

## 实际场景：表单数据保护

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

class FormEncryption {
  static encryptFormData(obj: Record<string, string>, key: string): string {
    const json = JSON.stringify(obj)
    const enc = encrypt.aes(json, key)
    return JSON.stringify(enc)
  }

  static decryptFormData(data: string, key: string): Record<string, string> | null {
    try {
      const enc = JSON.parse(data)
      const dec = decrypt.aes(enc, key)
      if (!dec.success) return null
      return JSON.parse(dec.data!)
    } catch {
      return null
    }
  }
}
```

## 性能测试（示例）

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

function test() {
  const data = 'A'.repeat(10_000)
  const key = 'performance-key-32'

  console.time('AES-128')
  const e128 = encrypt.aes128(data, key)
  decrypt.aes128(e128, key)
  console.timeEnd('AES-128')

  console.time('AES-192')
  const e192 = encrypt.aes192(data, key)
  decrypt.aes192(e192, key)
  console.timeEnd('AES-192')

  console.time('AES-256')
  const e256 = encrypt.aes256(data, key)
  decrypt.aes256(e256, key)
  console.timeEnd('AES-256')
}
```

## 安全注意事项

- 避免使用 ECB 模式于生产环境
- 每次加密都使用新的随机 IV（CBC/CTR 等）
- 密钥不要硬编码；使用安全的密钥来源

AES (Advanced Encryption Standard) 是最广泛使用的对称加密算法。本页面提供了完整的交互式演示。

## 交互式演示

<!-- Interactive demo removed in SSR build: replace with static examples or client-only components -->

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
<!-- client-only demo removed for SSR build -->
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
    <input v-model="data" placeholder="输入数据">
    <input v-model="key" placeholder="输入密钥">
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

      if (!decrypted.success)
        return null

      return JSON.parse(decrypted.data)
    }
    catch {
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

      if (!decrypted.success)
        return null

      const data = JSON.parse(decrypted.data)
      const formData = new FormData()

      for (const [key, value] of Object.entries(data)) {
        formData.append(key, value as string)
      }

      return formData
    }
    catch {
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

  modes.forEach((mode) => {
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
  }
  catch (error) {
    console.error('解密异常:', error.message)
    return null
  }
}
```

<!-- client-only interactive JS removed for SSR build -->

<!-- styles removed for SSR build -->
