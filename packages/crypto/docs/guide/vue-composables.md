# Vue 3 Composition API

@ldesign/crypto 为 Vue 3 提供了完整的 Composition API 集成，包括响应式状态管理、错误处理和加载状态。

## 可用的 Composables

- `useCrypto`: 加解密操作
- `useHash`: 哈希计算
- `useSignature`: 数字签名

## useCrypto

`useCrypto` 提供了完整的加解密功能，包括 AES、RSA、Base64 和 Hex 编码。

### 基本用法

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  encryptAES,
  decryptAES,
  isEncrypting,
  isDecrypting,
  lastError,
  lastResult,
  clearError,
  reset
} = useCrypto()

const data = ref('')
const key = ref('')
const encryptedResult = ref(null)
const decryptedResult = ref(null)

async function handleEncrypt() {
  try {
    clearError()
    encryptedResult.value = await encryptAES(data.value, key.value)
    decryptedResult.value = null
  }
  catch (error) {
    console.error('加密失败:', error)
  }
}

async function handleDecrypt() {
  try {
    clearError()
    decryptedResult.value = await decryptAES(encryptedResult.value, key.value)
  }
  catch (error) {
    console.error('解密失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>AES 加密示例</h2>

    <!-- 输入表单 -->
    <div>
      <input v-model="data" placeholder="输入要加密的数据">
      <input v-model="key" placeholder="输入密钥">
      <button :disabled="isEncrypting" @click="handleEncrypt">
        {{ isEncrypting ? '加密中...' : '加密' }}
      </button>
      <button :disabled="isDecrypting || !encryptedResult" @click="handleDecrypt">
        {{ isDecrypting ? '解密中...' : '解密' }}
      </button>
    </div>

    <!-- 结果显示 -->
    <div v-if="encryptedResult">
      <h3>加密结果</h3>
      <p>数据: {{ encryptedResult.data }}</p>
      <p>算法: {{ encryptedResult.algorithm }}</p>
      <p>IV: {{ encryptedResult.iv }}</p>
    </div>

    <div v-if="decryptedResult">
      <h3>解密结果</h3>
      <p>{{ decryptedResult.data }}</p>
    </div>

    <!-- 错误显示 -->
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

### RSA 加密示例

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  encryptRSA,
  decryptRSA,
  generateRSAKeyPair,
  isEncrypting,
  isDecrypting
} = useCrypto()

const rsaData = ref('Hello, RSA!')
const keyPair = ref(null)
const encryptedRSA = ref(null)
const decryptedRSA = ref(null)

async function generateKeys() {
  keyPair.value = await generateRSAKeyPair(2048)
  encryptedRSA.value = null
  decryptedRSA.value = null
}

async function encryptRSAData() {
  if (!keyPair.value)
    return
  encryptedRSA.value = await encryptRSA(rsaData.value, keyPair.value.publicKey)
  decryptedRSA.value = null
}

async function decryptRSAData() {
  if (!keyPair.value || !encryptedRSA.value)
    return
  decryptedRSA.value = await decryptRSA(encryptedRSA.value, keyPair.value.privateKey)
}
</script>

<template>
  <div>
    <h2>RSA 加密示例</h2>

    <div>
      <textarea v-model="rsaData" placeholder="输入要加密的数据" />
      <button :disabled="isEncrypting" @click="generateKeys">
        生成密钥对
      </button>
      <button :disabled="isEncrypting || !keyPair" @click="encryptRSA">
        加密
      </button>
      <button :disabled="isDecrypting || !encryptedRSA" @click="decryptRSA">
        解密
      </button>
    </div>

    <div v-if="keyPair">
      <h3>密钥对</h3>
      <div>
        <h4>公钥</h4>
        <textarea readonly :value="keyPair.publicKey" />
      </div>
      <div>
        <h4>私钥</h4>
        <textarea readonly :value="keyPair.privateKey" />
      </div>
    </div>

    <div v-if="encryptedRSA">
      <h3>RSA 加密结果</h3>
      <p>{{ encryptedRSA.data }}</p>
    </div>

    <div v-if="decryptedRSA">
      <h3>RSA 解密结果</h3>
      <p>{{ decryptedRSA.data }}</p>
    </div>
  </div>
</template>
```

### 编码示例

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  encodeBase64,
  decodeBase64,
  encodeHex,
  decodeHex
} = useCrypto()

const encodingData = ref('Hello, Encoding! 你好，编码！')
const encodedBase64 = ref('')
const decodedBase64 = ref('')
const encodedHex = ref('')
const decodedHex = ref('')

async function encodeBase64Data() {
  encodedBase64.value = await encodeBase64(encodingData.value)
  decodedBase64.value = ''
}

async function decodeBase64Data() {
  decodedBase64.value = await decodeBase64(encodedBase64.value)
}

async function encodeHexData() {
  encodedHex.value = await encodeHex(encodingData.value)
  decodedHex.value = ''
}

async function decodeHexData() {
  decodedHex.value = await decodeHex(encodedHex.value)
}
</script>

<template>
  <div>
    <h2>编码示例</h2>

    <div>
      <textarea v-model="encodingData" placeholder="输入要编码的数据" />
      <button @click="encodeBase64Data">
        Base64 编码
      </button>
      <button :disabled="!encodedBase64" @click="decodeBase64Data">
        Base64 解码
      </button>
      <button @click="encodeHexData">
        Hex 编码
      </button>
      <button :disabled="!encodedHex" @click="decodeHexData">
        Hex 解码
      </button>
    </div>

    <div v-if="encodedBase64">
      <h3>Base64 编码结果</h3>
      <p>{{ encodedBase64 }}</p>
    </div>

    <div v-if="decodedBase64">
      <h3>Base64 解码结果</h3>
      <p>{{ decodedBase64 }}</p>
    </div>

    <div v-if="encodedHex">
      <h3>Hex 编码结果</h3>
      <p>{{ encodedHex }}</p>
    </div>

    <div v-if="decodedHex">
      <h3>Hex 解码结果</h3>
      <p>{{ decodedHex }}</p>
    </div>
  </div>
</template>
```

## useHash

`useHash` 提供了所有哈希算法的响应式接口。

### 基本用法

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
  hashMultiple,
  isHashing,
  lastError,
  clearError
} = useHash()

const hashData = ref('Hello, Hash!')
const selectedAlgorithm = ref('SHA256')
const hashResult = ref('')
const allHashResults = ref([])

async function calculateHash() {
  try {
    clearError()
    allHashResults.value = []

    switch (selectedAlgorithm.value) {
      case 'MD5':
        hashResult.value = await md5(hashData.value)
        break
      case 'SHA1':
        hashResult.value = await sha1(hashData.value)
        break
      case 'SHA256':
        hashResult.value = await sha256(hashData.value)
        break
      case 'SHA384':
        hashResult.value = await sha384(hashData.value)
        break
      case 'SHA512':
        hashResult.value = await sha512(hashData.value)
        break
    }
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}

async function calculateAllHashes() {
  try {
    clearError()
    hashResult.value = ''

    const algorithms = ['MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512']
    const results = await Promise.all([
      { algorithm: 'MD5', hash: await md5(hashData.value) },
      { algorithm: 'SHA1', hash: await sha1(hashData.value) },
      { algorithm: 'SHA256', hash: await sha256(hashData.value) },
      { algorithm: 'SHA384', hash: await sha384(hashData.value) },
      { algorithm: 'SHA512', hash: await sha512(hashData.value) }
    ])

    allHashResults.value = results
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>哈希计算示例</h2>

    <div>
      <textarea v-model="hashData" placeholder="输入要哈希的数据" />
      <select v-model="selectedAlgorithm">
        <option value="MD5">
          MD5
        </option>
        <option value="SHA1">
          SHA1
        </option>
        <option value="SHA256">
          SHA256
        </option>
        <option value="SHA384">
          SHA384
        </option>
        <option value="SHA512">
          SHA512
        </option>
      </select>
      <button :disabled="isHashing" @click="calculateHash">
        {{ isHashing ? '计算中...' : '计算哈希' }}
      </button>
      <button :disabled="isHashing" @click="calculateAllHashes">
        计算所有算法
      </button>
    </div>

    <div v-if="hashResult">
      <h3>{{ selectedAlgorithm }} 哈希结果</h3>
      <p>{{ hashResult }}</p>
    </div>

    <div v-if="allHashResults.length">
      <h3>所有哈希结果</h3>
      <div v-for="result in allHashResults" :key="result.algorithm">
        <strong>{{ result.algorithm }}:</strong> {{ result.hash }}
      </div>
    </div>

    <div v-if="lastError" class="error">
      错误: {{ lastError }}
    </div>
  </div>
</template>
```

### HMAC 示例

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  hmacMd5,
  hmacSha1,
  hmacSha256,
  hmacSha384,
  hmacSha512,
  verifyHmac
} = useHash()

const hmacData = ref('Hello, HMAC!')
const hmacKey = ref('secret-key')
const hmacAlgorithm = ref('SHA256')
const hmacResult = ref('')
const hmacVerified = ref(null)

async function calculateHMAC() {
  try {
    hmacVerified.value = null

    switch (hmacAlgorithm.value) {
      case 'MD5':
        hmacResult.value = await hmacMd5(hmacData.value, hmacKey.value)
        break
      case 'SHA1':
        hmacResult.value = await hmacSha1(hmacData.value, hmacKey.value)
        break
      case 'SHA256':
        hmacResult.value = await hmacSha256(hmacData.value, hmacKey.value)
        break
      case 'SHA384':
        hmacResult.value = await hmacSha384(hmacData.value, hmacKey.value)
        break
      case 'SHA512':
        hmacResult.value = await hmacSha512(hmacData.value, hmacKey.value)
        break
    }
  }
  catch (error) {
    console.error('HMAC 计算失败:', error)
  }
}

async function verifyHMACValue() {
  try {
    hmacVerified.value = await verifyHmac(
      hmacData.value,
      hmacKey.value,
      hmacResult.value,
      hmacAlgorithm.value
    )
  }
  catch (error) {
    console.error('HMAC 验证失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>HMAC 示例</h2>

    <div>
      <textarea v-model="hmacData" placeholder="输入消息" />
      <input v-model="hmacKey" placeholder="输入密钥">
      <select v-model="hmacAlgorithm">
        <option value="MD5">
          HMAC-MD5
        </option>
        <option value="SHA1">
          HMAC-SHA1
        </option>
        <option value="SHA256">
          HMAC-SHA256
        </option>
        <option value="SHA384">
          HMAC-SHA384
        </option>
        <option value="SHA512">
          HMAC-SHA512
        </option>
      </select>
      <button :disabled="isHashing" @click="calculateHMAC">
        计算 HMAC
      </button>
      <button :disabled="!hmacResult" @click="verifyHMAC">
        验证 HMAC
      </button>
    </div>

    <div v-if="hmacResult">
      <h3>HMAC 结果</h3>
      <p>{{ hmacResult }}</p>
    </div>

    <div v-if="hmacVerified !== null">
      <h3>HMAC 验证</h3>
      <p>{{ hmacVerified ? '✅ 验证成功' : '❌ 验证失败' }}</p>
    </div>
  </div>
</template>
```

## useSignature

`useSignature` 提供数字签名功能。

### 基本用法

```vue
<script setup>
import { useSignature } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const {
  sign,
  verify,
  isSigning,
  isVerifying,
  lastError,
  clearError
} = useSignature()

const signatureData = ref('Hello, Digital Signature!')
const keyPair = ref(null)
const signature = ref('')
const verificationResult = ref(null)

async function generateKeyPair() {
  // 这里应该调用实际的密钥生成函数
  // 为了演示，我们模拟生成
  keyPair.value = { generated: true }
  signature.value = ''
  verificationResult.value = null
}

async function signData() {
  try {
    clearError()
    // 这里应该使用实际的私钥进行签名
    // 为了演示，我们模拟签名过程
    signature.value = `mock-signature-${Date.now()}`
    verificationResult.value = null
  }
  catch (error) {
    console.error('签名失败:', error)
  }
}

async function verifySignature() {
  try {
    clearError()
    // 这里应该使用实际的公钥进行验证
    // 为了演示，我们模拟验证过程
    verificationResult.value = true
  }
  catch (error) {
    console.error('验证失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>数字签名示例</h2>

    <div>
      <textarea v-model="signatureData" placeholder="输入要签名的数据" />
      <button @click="generateKeyPair">
        生成密钥对
      </button>
      <button :disabled="isSigning || !keyPair" @click="signData">
        {{ isSigning ? '签名中...' : '数字签名' }}
      </button>
      <button :disabled="isVerifying || !signature" @click="verifySignature">
        {{ isVerifying ? '验证中...' : '验证签名' }}
      </button>
    </div>

    <div v-if="keyPair">
      <h3>密钥对已生成</h3>
      <p>密钥长度: 2048 位</p>
    </div>

    <div v-if="signature">
      <h3>数字签名</h3>
      <p style="word-break: break-all;">
        {{ signature }}
      </p>
    </div>

    <div v-if="verificationResult !== null">
      <h3>签名验证</h3>
      <p>{{ verificationResult ? '✅ 验证成功' : '❌ 验证失败' }}</p>
    </div>

    <div v-if="lastError" class="error">
      错误: {{ lastError }}
    </div>
  </div>
</template>
```

## 状态管理

所有 composables 都提供了响应式状态管理：

### 加载状态

```vue
<script setup>
const { isEncrypting, isDecrypting, isHashing, isSigning, isVerifying } = useCrypto()

// 计算属性：任何操作正在进行
const isLoading = computed(() =>
  isEncrypting.value || isDecrypting.value || isHashing.value || isSigning.value || isVerifying.value
)
</script>

<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner">
      处理中...
    </div>
  </div>
</template>
```

### 错误处理

```vue
<script setup>
const { lastError, clearError } = useCrypto()

// 监听错误变化
watch(lastError, (error) => {
  if (error) {
    console.error('Crypto error:', error)
    // 可以显示通知或执行其他错误处理逻辑
  }
})

// 自动清除错误
onMounted(() => {
  setTimeout(() => {
    if (lastError.value) {
      clearError()
    }
  }, 5000) // 5秒后自动清除错误
})
</script>
```

### 结果缓存

```vue
<script setup>
const { lastResult } = useCrypto()

// 监听结果变化
watch(lastResult, (result) => {
  if (result) {
    // 缓存结果或执行其他逻辑
    localStorage.setItem('lastCryptoResult', JSON.stringify(result))
  }
})
</script>
```

## 高级用法

### 自定义配置

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'

// 使用自定义配置
const crypto = useCrypto({
  defaultAESKeySize: 256,
  defaultRSAKeySize: 4096,
  autoRetry: true,
  retryCount: 3
})
</script>
```

### 组合多个 Composables

```vue
<script setup>
import { useCrypto, useHash, useSignature } from '@ldesign/crypto/vue'

const crypto = useCrypto()
const hasher = useHash()
const signer = useSignature()

// 组合使用：先哈希，再签名
async function hashAndSign(data, privateKey) {
  const hashValue = await hasher.sha256(data)
  const signature = await signer.sign(hashValue, privateKey)
  return { hash: hashValue, signature }
}
</script>
```
