# Vue 组合式函数指南

本指南介绍如何使用 @ldesign/crypto 提供的 Vue 3 组合式函数（Composables）。

## 概述

@ldesign/crypto 提供了一套响应式的组合式函数，让你可以在 Vue 3 组件中优雅地使用加密功能：

- **useEncryption**：简化的加密解密
- **useCrypto**：完整的加密功能
- **useHash**：哈希计算
- **useSignature**：数字签名
- **useKeyManager**：密钥管理

## useEncryption

最简单易用的加密组合式函数，提供文本和文件加密功能。

### 基础用法

```vue
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
 encryptText,
 decryptText,
 isLoading,
 error,
 result,
 hasError,
 isReady
} = useEncryption()

const message = ref('Hello World')
const password = ref('my-password')
const encrypted = ref('')

// 加密文本
const handleEncrypt = async () => {
 encrypted.value = await encryptText(message.value, password.value)

 if (encrypted.value) {
  console.log('加密成功')
 }
}

// 解密文本
const handleDecrypt = async () => {
 const decrypted = await decryptText(encrypted.value, password.value)

 if (decrypted) {
  message.value = decrypted
  console.log('解密成功')
 }
}
</script>

<template>
 <div>
  <input v-model="message" placeholder="输入消息" />
  <input v-model="password" type="password" placeholder="输入密码" />

  <button @click="handleEncrypt" :disabled="isLoading">
   {{ isLoading ? '处理中...' : '加密' }}
  </button>

  <button @click="handleDecrypt" :disabled="!encrypted || isLoading">
   解密
  </button>

  <div v-if="hasError" class="error">
   错误: {{ error }}
  </div>

  <div v-if="encrypted">
   <p>加密结果:</p>
   <pre>{{ encrypted }}</pre>
  </div>
 </div>
</template>
```

### 文件加密

```vue
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { encryptFile, decryptFile, isLoading } = useEncryption()

const fileContent = ref('')
const encryptedFile = ref('')
const password = ref('file-password')

// 读取文件
const handleFileUpload = (event) => {
 const file = event.target.files[0]
 const reader = new FileReader()

 reader.onload = (e) => {
  fileContent.value = e.target.result
 }

 reader.readAsText(file)
}

// 加密文件
const handleEncryptFile = async () => {
 encryptedFile.value = await encryptFile(
  fileContent.value,
  password.value
 )
}

// 解密文件
const handleDecryptFile = async () => {
 const decrypted = await decryptFile(
  encryptedFile.value,
  password.value
 )

 if (decrypted) {
  // 下载解密后的文件
  const blob = new Blob([decrypted], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'decrypted.txt'
  a.click()
 }
}
</script>

<template>
 <div>
  <input type="file" @change="handleFileUpload" />
  <input v-model="password" type="password" placeholder="密码" />

  <button @click="handleEncryptFile" :disabled="!fileContent || isLoading">
   加密文件
  </button>

  <button @click="handleDecryptFile" :disabled="!encryptedFile || isLoading">
   解密文件
  </button>

  <div v-if="isLoading">处理中...</div>
 </div>
</template>
```

### API 参考

```typescript
interface UseEncryptionReturn {
 // 状态
 isLoading: Ref<boolean>
 error: Ref<string | null>
 result: Ref<string | null>

 // 计算属性
 hasError: Ref<boolean>
 isReady: Ref<boolean>

 // 方法
 encryptText: (text: string, password: string) => Promise<string | null>
 decryptText: (encryptedText: string, password: string) => Promise<string | null>
 encryptFile: (fileContent: string, password: string) => Promise<string | null>
 decryptFile: (encryptedContent: string, password: string) => Promise<string | null>
 clearError: () => void
 reset: () => void
}
```

## useCrypto

提供完整的加密解密功能，支持多种算法。

### 基础用法

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'

const { encrypt, decrypt, hash, hmac } = useCrypto()

// AES 加密
const handleAesEncrypt = () => {
 const result = encrypt.aes('Hello World', 'secret-key')
 console.log(result)
}

// RSA 加密
const handleRsaEncrypt = () => {
 const result = encrypt.rsa('Hello World', publicKey)
 console.log(result)
}

// 计算哈希
const handleHash = () => {
 const sha256 = hash.sha256('Hello World')
 console.log(sha256)
}

// 计算 HMAC
const handleHmac = () => {
 const mac = hmac.sha256('message', 'secret-key')
 console.log(mac)
}
</script>
```

### 多算法支持

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { encrypt, decrypt } = useCrypto()

const algorithm = ref('aes')
const message = ref('')
const key = ref('')
const result = ref(null)

const handleEncrypt = () => {
 switch (algorithm.value) {
  case 'aes':
   result.value = encrypt.aes(message.value, key.value)
   break
  case 'des':
   result.value = encrypt.des(message.value, key.value)
   break
  case '3des':
   result.value = encrypt.des3(message.value, key.value)
   break
  case 'blowfish':
   result.value = encrypt.blowfish(message.value, key.value)
   break
 }
}
</script>

<template>
 <div>
  <select v-model="algorithm">
   <option value="aes">AES</option>
   <option value="des">DES</option>
   <option value="3des">3DES</option>
   <option value="blowfish">Blowfish</option>
  </select>

  <input v-model="message" placeholder="消息" />
  <input v-model="key" placeholder="密钥" />
  <button @click="handleEncrypt">加密</button>

  <div v-if="result">
   <pre>{{ JSON.stringify(result, null, 2) }}</pre>
  </div>
 </div>
</template>
```

## useHash

专门用于哈希计算的组合式函数。

### 基础用法

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { md5, sha1, sha256, sha512 } = useHash()

const input = ref('Hello World')
const hashes = ref({})

const calculateAll = async () => {
 hashes.value = {
  md5: await md5(input.value),
  sha1: await sha1(input.value),
  sha256: await sha256(input.value),
  sha512: await sha512(input.value)
 }
}
</script>

<template>
 <div>
  <input v-model="input" placeholder="输入文本" />
  <button @click="calculateAll">计算所有哈希</button>

  <div v-if="Object.keys(hashes).length">
   <h3>哈希结果:</h3>
   <div v-for="(value, key) in hashes" :key="key">
    <strong>{{ key.toUpperCase() }}:</strong>
    <code>{{ value }}</code>
   </div>
  </div>
 </div>
</template>
```

### 文件哈希

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { sha256 } = useHash()

const fileHash = ref('')
const isCalculating = ref(false)

const handleFileUpload = async (event) => {
 const file = event.target.files[0]
 if (!file) return

 isCalculating.value = true

 const reader = new FileReader()
 reader.onload = async (e) => {
  const content = e.target.result
  fileHash.value = await sha256(content)
  isCalculating.value = false
 }

 reader.readAsText(file)
}
</script>

<template>
 <div>
  <input type="file" @change="handleFileUpload" />

  <div v-if="isCalculating">计算中...</div>

  <div v-if="fileHash">
   <p>文件 SHA256:</p>
   <code>{{ fileHash }}</code>
  </div>
 </div>
</template>
```

## useSignature

数字签名组合式函数。

### 基础用法

```vue
<script setup>
import { useSignature } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
 sign,
 verify,
 generateKeyPair,
 loading,
 error,
 keyPair
} = useSignature()

const message = ref('Important message')
const signature = ref('')

// 生成密钥对
const handleGenerateKeys = async () => {
 await generateKeyPair(2048)
}

// 签名
const handleSign = async () => {
 if (!keyPair.value) return

 signature.value = await sign(
  message.value,
  keyPair.value.privateKey,
  'SHA256'
 )
}

// 验证
const handleVerify = async () => {
 if (!keyPair.value || !signature.value) return

 const isValid = await verify(
  message.value,
  signature.value,
  keyPair.value.publicKey,
  'SHA256'
 )

 alert(isValid ? '签名有效' : '签名无效')
}
</script>

<template>
 <div>
  <button @click="handleGenerateKeys" :disabled="loading">
   生成密钥对
  </button>

  <div v-if="keyPair">
   <p>密钥对已生成</p>
   <textarea v-model="message" rows="4"></textarea>

   <button @click="handleSign" :disabled="loading">签名</button>
   <button @click="handleVerify" :disabled="!signature || loading">
    验证
   </button>
  </div>

  <div v-if="error" class="error">{{ error }}</div>

  <div v-if="signature">
   <p>签名:</p>
   <pre>{{ signature.substring(0, 100) }}...</pre>
  </div>
 </div>
</template>
```

## useKeyManager

密钥管理组合式函数。

### 基础用法

```vue
<script setup>
import { useKeyManager } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
 generateAESKey,
 generateRSAKeyPair,
 storeKey,
 getKey,
 keys,
 keyNames,
 keyCount,
 isGenerating
} = useKeyManager()

const keyName = ref('')

// 生成并存储 AES 密钥
const handleGenerateAES = async () => {
 const key = await generateAESKey(256)

 if (key && keyName.value) {
  storeKey(keyName.value, key)
  console.log('AES 密钥已存储')
 }
}

// 生成并存储 RSA 密钥对
const handleGenerateRSA = async () => {
 const keyPair = await generateRSAKeyPair(2048)

 if (keyPair && keyName.value) {
  storeKey(keyName.value, keyPair)
  console.log('RSA 密钥对已存储')
 }
}

// 使用存储的密钥
const useStoredKey = (name) => {
 const key = getKey(name)
 if (key) {
  console.log('找到密钥:', name)
 }
}
</script>

<template>
 <div>
  <h3>密钥管理</h3>

  <input v-model="keyName" placeholder="密钥名称" />

  <button @click="handleGenerateAES" :disabled="!keyName || isGenerating">
   生成 AES 密钥
  </button>

  <button @click="handleGenerateRSA" :disabled="!keyName || isGenerating">
   生成 RSA 密钥对
  </button>

  <div v-if="keyCount > 0">
   <h4>已存储的密钥 ({{ keyCount }})</h4>
   <ul>
    <li v-for="name in keyNames" :key="name">
     {{ name }}
     <button @click="useStoredKey(name)">使用</button>
    </li>
   </ul>
  </div>
 </div>
</template>
```

### 密钥导入导出

```vue
<script setup>
import { useKeyManager } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
 exportKeys,
 importKeys,
 clearKeys,
 keyCount
} = useKeyManager()

const exportedData = ref('')

// 导出密钥
const handleExport = () => {
 exportedData.value = exportKeys()

 // 下载为文件
 const blob = new Blob([exportedData.value], { type: 'application/json' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = 'keys.json'
 a.click()
}

// 导入密钥
const handleImport = (event) => {
 const file = event.target.files[0]
 const reader = new FileReader()

 reader.onload = (e) => {
  const data = e.target.result
  const success = importKeys(data)

  if (success) {
   console.log('密钥导入成功')
  } else {
   console.error('密钥导入失败')
  }
 }

 reader.readAsText(file)
}

// 清空所有密钥
const handleClear = () => {
 if (confirm('确定要清空所有密钥吗？')) {
  clearKeys()
 }
}
</script>

<template>
 <div>
  <h3>密钥导入导出</h3>

  <button @click="handleExport" :disabled="keyCount === 0">
   导出密钥
  </button>

  <input type="file" @change="handleImport" accept=".json" />

  <button @click="handleClear" :disabled="keyCount === 0">
   清空所有密钥
  </button>

  <p>当前存储: {{ keyCount }} 个密钥</p>
 </div>
</template>
```

## 组合使用

多个组合式函数可以一起使用：

```vue
<script setup>
import {
 useEncryption,
 useHash,
 useKeyManager
} from '@ldesign/crypto/vue'
import { ref } from 'vue'

// 加密功能
const encryption = useEncryption()

// 哈希功能
const hashUtil = useHash()

// 密钥管理
const keyManager = useKeyManager()

const message = ref('Secret message')
const encryptedData = ref('')
const messageHash = ref('')

// 完整的加密流程
const handleSecureEncrypt = async () => {
 // 1. 生成密钥
 const key = await keyManager.generateAESKey(256)

 if (!key) return

 // 2. 存储密钥
 keyManager.storeKey('message-key', key)

 // 3. 加密消息
 encryptedData.value = await encryption.encryptText(
  message.value,
  key
 )

 // 4. 计算消息哈希
 messageHash.value = await hashUtil.sha256(message.value)

 console.log('加密完成')
}

// 完整的解密流程
const handleSecureDecrypt = async () => {
 // 1. 获取密钥
 const key = keyManager.getKey('message-key')

 if (!key) {
  console.error('未找到密钥')
  return
 }

 // 2. 解密消息
 const decrypted = await encryption.decryptText(
  encryptedData.value,
  key as string
 )

 // 3. 验证哈希
 if (decrypted) {
  const hash = await hashUtil.sha256(decrypted)
  const hashValid = hash === messageHash.value

  console.log('解密成功，哈希验证:', hashValid)
 }
}
</script>

<template>
 <div>
  <textarea v-model="message" rows="4"></textarea>

  <button @click="handleSecureEncrypt">安全加密</button>
  <button @click="handleSecureDecrypt" :disabled="!encryptedData">
   安全解密
  </button>

  <div v-if="encryptedData">
   <p>加密数据:</p>
   <pre>{{ encryptedData.substring(0, 100) }}...</pre>
  </div>

  <div v-if="messageHash">
   <p>消息哈希:</p>
   <code>{{ messageHash }}</code>
  </div>
 </div>
</template>
```

## TypeScript 支持

所有组合式函数都提供完整的 TypeScript 类型：

```typescript
import type {
 UseEncryptionReturn,
 UseCryptoReturn,
 UseHashReturn,
 UseSignatureReturn,
 UseKeyManagerReturn
} from '@ldesign/crypto/vue'

// 明确指定返回类型
const encryption: UseEncryptionReturn = useEncryption()
const crypto: UseCryptoReturn = useCrypto()
const hash: UseHashReturn = useHash()
```

## 最佳实践

### 错误处理

```vue
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'
import { watch } from 'vue'

const { encryptText, error, clearError } = useEncryption()

// 监听错误
watch(error, (newError) => {
 if (newError) {
  console.error('加密错误:', newError)
  // 显示错误提示
  setTimeout(clearError, 3000)
 }
})
</script>
```

### 状态重置

```vue
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'

const { encryptText, reset } = useEncryption()

// 操作完成后重置状态
const handleOperation = async () => {
 await encryptText('data', 'key')
 // 3秒后重置状态
 setTimeout(reset, 3000)
}
</script>
```

## 下一步

- [Vue 插件](/guide/vue-plugin) - 学习插件安装
- [Vue 最佳实践](/guide/vue-best-practices) - 最佳实践
- [快速开始](/guide/quick-start) - 基础用法
