# Vue 插件使用指南

本指南介绍如何在 Vue 3 项目中使用 @ldesign/crypto 插件。

## 概述

@ldesign/crypto 提供了完整的 Vue 3 集成支持，包括：

- **Vue 插件**：全局注册加密功能
- **Composition API**：响应式加密钩子
- **类型支持**：完整的 TypeScript 类型定义
- **自动配置**：开箱即用的默认配置

## 安装插件

### 基础安装

```typescript
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)

// 使用插件
app.use(CryptoPlugin)

app.mount('#app')
```

### 带配置的安装

```typescript
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)

// 使用自定义配置
app.use(CryptoPlugin, {
 // 全局属性名称（默认'$crypto'）
 globalPropertyName: '$crypto',

 // 是否注册全局组合式函数（默认true）
 registerComposables: true,

 // 自定义配置
 config: {
  defaultAESKeySize: 256,
  defaultRSAKeySize: 2048,
  defaultHashAlgorithm: 'SHA256',
  defaultEncoding: 'base64'
 }
})

app.mount('#app')
```

## 使用全局属性

安装插件后，可以在组件中通过 `this.$crypto` 访问加密功能。

### Options API

```vue
<script>
export default {
 data() {
  return {
   message: '',
   encrypted: null
  }
 },

 methods: {
  handleEncrypt() {
   // 使用 AES 加密
   const result = this.$crypto.encrypt.aes(
    this.message,
    'my-secret-key'
   )

   if (result.success) {
    this.encrypted = result.data
   }
  },

  handleDecrypt() {
   // 解密
   const result = this.$crypto.decrypt.aes(
    this.encrypted,
    'my-secret-key'
   )

   if (result.success) {
    console.log('解密结果:', result.data)
   }
  },

  calculateHash() {
   // 计算哈希
   const hash = this.$crypto.hash.sha256(this.message)
   console.log('SHA256:', hash)
  }
 }
}
</script>

<template>
 <div>
  <input v-model="message" placeholder="输入消息" />
  <button @click="handleEncrypt">加密</button>
  <button @click="handleDecrypt">解密</button>
  <button @click="calculateHash">哈希</button>
 </div>
</template>
```

### Composition API (setup)

```vue
<script>
import { getCurrentInstance } from 'vue'

export default {
 setup() {
  const instance = getCurrentInstance()
  const crypto = instance.appContext.config.globalProperties.$crypto

  const handleEncrypt = () => {
   const result = crypto.encrypt.aes('Hello World', 'key')
   console.log(result)
  }

  return {
   handleEncrypt
  }
 }
}
</script>
```

## 使用依赖注入

插件会自动提供 `crypto` 和 `cryptoConfig` 注入。

```vue
<script setup>
import { inject } from 'vue'

// 注入加密实例
const crypto = inject('crypto')

// 注入配置
const config = inject('cryptoConfig')

const handleEncrypt = () => {
 const result = crypto.encrypt.aes('data', 'key')
 console.log(result)
}
</script>
```

## 可用的全局属性

插件注入的 `$crypto` 对象包含以下属性：

```typescript
interface GlobalCrypto {
 // 核心功能
 encrypt: typeof encrypt   // 统一加密接口
 decrypt: typeof decrypt   // 统一解密接口
 hash: typeof hash        // 哈希函数
 hmac: typeof hmac        // HMAC 函数
 keyGenerator: typeof keyGenerator       // 密钥生成器
 digitalSignature: typeof digitalSignature // 数字签名

 // 算法实现
 aes: typeof aes          // AES 加密
 rsa: typeof rsa          // RSA 加密
 encoding: typeof encoding // 编码工具
 base64: typeof base64     // Base64 编码
 hex: typeof hex          // Hex 编码

 // Composition API
 useCrypto: typeof useCrypto
 useHash: typeof useHash
 useSignature: typeof useSignature
}
```

## 完整示例

### 加密通信应用

```vue
<script setup>
import { ref, inject } from 'vue'

const crypto = inject('crypto')

const message = ref('')
const encryptedMessage = ref('')
const key = ref('my-secret-key')

// 加密消息
const encrypt = () => {
 const result = crypto.aes.encrypt(message.value, key.value)

 if (result.success) {
  encryptedMessage.value = crypto.base64.encode(
   JSON.stringify(result)
  )
  console.log('加密成功')
 } else {
  console.error('加密失败:', result.error)
 }
}

// 解密消息
const decrypt = () => {
 try {
  const encryptedData = JSON.parse(
   crypto.base64.decode(encryptedMessage.value)
  )

  const result = crypto.aes.decrypt(encryptedData, key.value)

  if (result.success) {
   message.value = result.data
   console.log('解密成功')
  } else {
   console.error('解密失败:', result.error)
  }
 } catch (error) {
  console.error('解密出错:', error)
 }
}

// 计算消息指纹
const calculateFingerprint = () => {
 const fingerprint = crypto.hash.sha256(message.value)
 console.log('消息指纹:', fingerprint)
}
</script>

<template>
 <div class="crypto-demo">
  <h2>加密通信演示</h2>

  <div class="form-group">
   <label>密钥:</label>
   <input v-model="key" type="password" />
  </div>

  <div class="form-group">
   <label>消息:</label>
   <textarea v-model="message" rows="4"></textarea>
  </div>

  <div class="actions">
   <button @click="encrypt">加密</button>
   <button @click="decrypt">解密</button>
   <button @click="calculateFingerprint">计算指纹</button>
  </div>

  <div v-if="encryptedMessage" class="result">
   <label>加密结果:</label>
   <pre>{{ encryptedMessage }}</pre>
  </div>
 </div>
</template>

<style scoped>
.crypto-demo {
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

.actions {
 margin: 15px 0;
}

.actions button {
 margin-right: 10px;
 padding: 8px 16px;
 background: #42b883;
 color: white;
 border: none;
 border-radius: 4px;
 cursor: pointer;
}

.actions button:hover {
 background: #35a372;
}

.result {
 margin-top: 20px;
 padding: 15px;
 background: #f5f5f5;
 border-radius: 4px;
}

.result pre {
 word-break: break-all;
 white-space: pre-wrap;
}
</style>
```

### 数字签名应用

```vue
<script setup>
import { ref, inject } from 'vue'

const crypto = inject('crypto')

const document = ref('')
const keyPair = ref(null)
const signature = ref('')

// 生成密钥对
const generateKeys = () => {
 keyPair.value = crypto.rsa.generateKeyPair(2048)
 console.log('密钥对生成成功')
}

// 签名文档
const signDocument = () => {
 if (!keyPair.value) {
  alert('请先生成密钥对')
  return
 }

 signature.value = crypto.digitalSignature.sign(
  document.value,
  keyPair.value.privateKey,
  'SHA256'
 )

 console.log('文档签名成功')
}

// 验证签名
const verifySignature = () => {
 if (!keyPair.value || !signature.value) {
  alert('请先签名文档')
  return
 }

 const isValid = crypto.digitalSignature.verify(
  document.value,
  signature.value,
  keyPair.value.publicKey,
  'SHA256'
 )

 if (isValid) {
  alert('签名有效 - 文档未被篡改')
 } else {
  alert('签名无效 - 文档可能被篡改')
 }
}
</script>

<template>
 <div class="signature-demo">
  <h2>数字签名演示</h2>

  <div class="actions">
   <button @click="generateKeys">生成密钥对</button>
   <span v-if="keyPair" class="status">已生成</span>
  </div>

  <div class="form-group">
   <label>文档内容:</label>
   <textarea v-model="document" rows="6"></textarea>
  </div>

  <div class="actions">
   <button @click="signDocument" :disabled="!keyPair">签名</button>
   <button @click="verifySignature" :disabled="!signature">验证</button>
  </div>

  <div v-if="signature" class="result">
   <label>签名:</label>
   <pre>{{ signature.substring(0, 100) }}...</pre>
  </div>
 </div>
</template>

<style scoped>
.signature-demo {
 max-width: 600px;
 margin: 0 auto;
 padding: 20px;
}

.status {
 color: #42b883;
 margin-left: 10px;
 font-weight: bold;
}

.form-group {
 margin: 20px 0;
}

.form-group label {
 display: block;
 margin-bottom: 5px;
 font-weight: bold;
}

.form-group textarea {
 width: 100%;
 padding: 8px;
 border: 1px solid #ddd;
 border-radius: 4px;
}

.actions {
 margin: 15px 0;
}

.actions button {
 margin-right: 10px;
 padding: 8px 16px;
 background: #42b883;
 color: white;
 border: none;
 border-radius: 4px;
 cursor: pointer;
}

.actions button:disabled {
 background: #ccc;
 cursor: not-allowed;
}

.actions button:not(:disabled):hover {
 background: #35a372;
}

.result {
 margin-top: 20px;
 padding: 15px;
 background: #f5f5f5;
 border-radius: 4px;
}

.result pre {
 word-break: break-all;
 white-space: pre-wrap;
}
</style>
```

## TypeScript 支持

### 类型声明

```typescript
// 在 vue 项目中使用类型
import type { CryptoPluginOptions, GlobalCrypto } from '@ldesign/crypto/vue'

// 扩展 Vue 全局属性类型
declare module '@vue/runtime-core' {
 interface ComponentCustomProperties {
  $crypto: GlobalCrypto
 }
}
```

### 在组件中使用类型

```vue
<script setup lang="ts">
import { inject } from 'vue'
import type { GlobalCrypto } from '@ldesign/crypto/vue'

const crypto = inject<GlobalCrypto>('crypto')

// 类型安全的使用
const handleEncrypt = () => {
 if (!crypto) return

 const result = crypto.aes.encrypt('data', 'key')
 // TypeScript 会提示 result 的类型
}
</script>
```

## 便捷安装函数

### installCrypto

```typescript
import { createApp } from 'vue'
import { installCrypto } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)

// 使用便捷函数
installCrypto(app, {
 config: {
  defaultAESKeySize: 256
 }
})

app.mount('#app')
```

### createCryptoPlugin

```typescript
import { createApp } from 'vue'
import { createCryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)

// 创建插件实例
const cryptoPlugin = createCryptoPlugin({
 globalPropertyName: '$crypto',
 config: {
  defaultHashAlgorithm: 'SHA256'
 }
})

app.use(cryptoPlugin)
app.mount('#app')
```

## 配置选项

```typescript
interface CryptoPluginOptions {
 // 全局属性名称（默认'$crypto'）
 globalPropertyName?: string

 // 是否注册全局组合式函数（默认true）
 registerComposables?: boolean

 // 自定义配置
 config?: {
  // 默认 AES 密钥大小
  defaultAESKeySize?: 128 | 192 | 256

  // 默认 RSA 密钥大小
  defaultRSAKeySize?: 1024 | 2048 | 3072 | 4096

  // 默认哈希算法
  defaultHashAlgorithm?:
   | 'MD5'
   | 'SHA1'
   | 'SHA224'
   | 'SHA256'
   | 'SHA384'
   | 'SHA512'

  // 默认编码类型
  defaultEncoding?: 'base64' | 'hex' | 'utf8'
 }
}
```

## 开发模式调试

插件在开发模式下会输出调试信息：

```typescript
// 开发环境输出
[LDesign Crypto] Plugin installed successfully
[LDesign Crypto] Global property: $crypto
[LDesign Crypto] Config: { defaultAESKeySize: 256, ... }
```

## 最佳实践

### 按需使用

```vue
<script setup>
import { inject } from 'vue'

// 只注入需要的功能
const crypto = inject('crypto')

// 或者直接使用组合式函数（更推荐）
import { useEncryption } from '@ldesign/crypto/vue'
const { encryptText, decryptText } = useEncryption()
</script>
```

### 错误处理

```vue
<script setup>
import { inject } from 'vue'

const crypto = inject('crypto')

const handleEncrypt = () => {
 try {
  const result = crypto.aes.encrypt('data', 'key')

  if (result.success) {
   console.log('成功:', result.data)
  } else {
   console.error('失败:', result.error)
  }
 } catch (error) {
  console.error('异常:', error)
 }
}
</script>
```

### 配置管理

```typescript
// centralized config
export const cryptoConfig = {
 globalPropertyName: '$crypto',
 config: {
  defaultAESKeySize: 256,
  defaultRSAKeySize: 2048,
  defaultHashAlgorithm: 'SHA256',
  defaultEncoding: 'base64'
 }
}

// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { cryptoConfig } from './config'

const app = createApp(App)
app.use(CryptoPlugin, cryptoConfig)
app.mount('#app')
```

## 下一步

- [Vue 组合式函数](/guide/vue-composables) - 学习响应式加密钩子
- [Vue 最佳实践](/guide/vue-best-practices) - Vue 项目中的最佳实践
- [快速开始](/guide/quick-start) - 基础用法
