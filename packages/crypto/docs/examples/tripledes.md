# 3DES (Triple DES) 加密示例

3DES (Triple Data Encryption Standard) 是 DES 的增强版本，使用三次 DES 加密来提高安全性，密钥长度为 192 位（24 字节）。

## 基础用法

### 简单加密解密

```typescript
import { des3, tripledes } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret123456789012345678' // 3DES 密钥长度为 24 字节

// 使用 tripledes
const encrypted = tripledes.encrypt(data, key)
console.log('加密结果:', encrypted)

// 解密
const decrypted = tripledes.decrypt(encrypted.data!, key, {
  iv: encrypted.iv
})
console.log('解密结果:', decrypted.data)

// 使用 des3 别名（功能相同）
const encrypted2 = des3.encrypt(data, key)
const decrypted2 = des3.decrypt(encrypted2.data!, key, {
  iv: encrypted2.iv
})
```

### 指定加密模式

```typescript
import { tripledes } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret123456789012345678'

// CBC 模式（默认）
const cbcEncrypted = tripledes.encrypt(data, key, {
  mode: 'CBC'
})

// ECB 模式
const ecbEncrypted = tripledes.encrypt(data, key, {
  mode: 'ECB'
})

// CFB 模式
const cfbEncrypted = tripledes.encrypt(data, key, {
  mode: 'CFB'
})

// OFB 模式
const ofbEncrypted = tripledes.encrypt(data, key, {
  mode: 'OFB'
})
```

### 使用自定义 IV

```typescript
import { RandomUtils, tripledes } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret123456789012345678'

// 生成自定义 IV
const customIV = RandomUtils.generateIV(8) // 3DES IV 长度为 8 字节

// 使用自定义 IV 加密
const encrypted = tripledes.encrypt(data, key, {
  iv: customIV,
  mode: 'CBC'
})

// 解密时使用相同的 IV
const decrypted = tripledes.decrypt(encrypted.data!, key, {
  iv: customIV,
  mode: 'CBC'
})
```

## 使用类实例

```typescript
import { TripleDESEncryptor } from '@ldesign/crypto'

const tripleDesEncryptor = new TripleDESEncryptor()
const data = 'Hello, World!'
const key = 'secret123456789012345678'

// 加密
const encrypted = tripleDesEncryptor.encrypt(data, key, {
  mode: 'CBC'
})

if (encrypted.success) {
  console.log('加密成功:', encrypted.data)
  console.log('IV:', encrypted.iv)
  console.log('密钥大小:', encrypted.keySize) // 192 位

  // 解密
  const decrypted = tripleDesEncryptor.decrypt(encrypted.data!, key, {
    iv: encrypted.iv,
    mode: 'CBC'
  })

  if (decrypted.success) {
    console.log('解密成功:', decrypted.data)
  }
  else {
    console.error('解密失败:', decrypted.error)
  }
}
else {
  console.error('加密失败:', encrypted.error)
}
```

## 密钥生成和处理

```typescript
import { tripledes } from '@ldesign/crypto'

// 生成随机密钥
const randomKey = tripledes.generateKey()
console.log('随机密钥:', randomKey) // 24 字节密钥
console.log('密钥长度:', randomKey.length)

// 使用生成的密钥
const data = 'Hello, World!'
const encrypted = tripledes.encrypt(data, randomKey)
const decrypted = tripledes.decrypt(encrypted.data!, randomKey, {
  iv: encrypted.iv
})

// 密钥长度处理
const shortKey = 'short' // 短密钥会被自动扩展
const longKey = 'this_is_a_very_long_key_that_exceeds_24_bytes' // 长密钥会被截取

const encryptedShort = tripledes.encrypt(data, shortKey)
const encryptedLong = tripledes.encrypt(data, longKey)
```

## 批量加密

```typescript
import { cryptoManager } from '@ldesign/crypto'

const data = [
  { id: '1', text: 'First message' },
  { id: '2', text: 'Second message' },
  { id: '3', text: 'Third message' }
]

const key = 'secret123456789012345678'

// 批量加密
const batchOperations = data.map(item => ({
  id: item.id,
  data: item.text,
  key,
  algorithm: '3DES' as const,
  options: { mode: 'CBC' }
}))

const encryptedResults = await cryptoManager.batchEncrypt(batchOperations)

console.log('批量加密结果:', encryptedResults)

// 批量解密
const decryptOperations = encryptedResults.map(result => ({
  id: result.id,
  data: result.result.data!,
  key,
  algorithm: '3DES' as const,
  options: {
    mode: 'CBC',
    iv: result.result.iv
  }
}))

const decryptedResults = await cryptoManager.batchDecrypt(decryptOperations)
console.log('批量解密结果:', decryptedResults)
```

## Vue 3 Composition API

```vue
<script setup>
import { tripledes } from '@ldesign/crypto'
import { computed, ref } from 'vue'

const plaintext = ref('')
const key = ref('secret123456789012345678')
const mode = ref('CBC')
const encrypted = ref('')
const decrypted = ref('')
const isProcessing = ref(false)
const error = ref('')

const keyLength = computed(() => key.value.length)
const isValidKey = computed(() => keyLength.value >= 8)

async function handleEncrypt() {
  if (!plaintext.value || !isValidKey.value) {
    error.value = '请输入明文和有效密钥（至少8字符）'
    return
  }

  isProcessing.value = true
  error.value = ''

  try {
    const result = tripledes.encrypt(plaintext.value, key.value, {
      mode: mode.value as any
    })

    if (result.success) {
      encrypted.value = JSON.stringify({
        data: result.data,
        iv: result.iv,
        mode: result.mode,
        keySize: result.keySize
      }, null, 2)
    }
    else {
      error.value = result.error || '加密失败'
    }
  }
  catch (e) {
    error.value = '加密过程中发生错误'
  }
  finally {
    isProcessing.value = false
  }
}

async function handleDecrypt() {
  if (!encrypted.value) {
    error.value = '请先加密数据'
    return
  }

  isProcessing.value = true
  error.value = ''

  try {
    const encryptedData = JSON.parse(encrypted.value)
    const result = tripledes.decrypt(encryptedData.data, key.value, {
      iv: encryptedData.iv,
      mode: encryptedData.mode
    })

    if (result.success) {
      decrypted.value = result.data || ''
    }
    else {
      error.value = result.error || '解密失败'
    }
  }
  catch (e) {
    error.value = '解析或解密数据失败'
  }
  finally {
    isProcessing.value = false
  }
}

function generateRandomKey() {
  key.value = tripledes.generateKey()
}

function clearAll() {
  plaintext.value = ''
  encrypted.value = ''
  decrypted.value = ''
  error.value = ''
}
</script>

<template>
  <div class="tripledes-demo">
    <h3>3DES 加密演示</h3>

    <div class="form-group">
      <label>明文:</label>
      <textarea v-model="plaintext" placeholder="输入要加密的文本" rows="3" />
    </div>

    <div class="form-group">
      <label>
        密钥 ({{ keyLength }}/24字符):
        <span :class="{ valid: isValidKey, invalid: !isValidKey }">
          {{ isValidKey ? '✓' : '✗' }}
        </span>
      </label>
      <input v-model="key" placeholder="输入密钥（建议24字符）">
      <button class="btn-small" @click="generateRandomKey">
        生成随机密钥
      </button>
    </div>

    <div class="form-group">
      <label>加密模式:</label>
      <select v-model="mode">
        <option value="CBC">
          CBC
        </option>
        <option value="ECB">
          ECB
        </option>
        <option value="CFB">
          CFB
        </option>
        <option value="OFB">
          OFB
        </option>
      </select>
    </div>

    <div class="buttons">
      <button :disabled="isProcessing || !isValidKey" @click="handleEncrypt">
        {{ isProcessing ? '处理中...' : '加密' }}
      </button>
      <button :disabled="isProcessing || !encrypted" @click="handleDecrypt">
        {{ isProcessing ? '处理中...' : '解密' }}
      </button>
      <button class="btn-secondary" @click="clearAll">
        清空
      </button>
    </div>

    <div v-if="error" class="error">
      错误: {{ error }}
    </div>

    <div v-if="encrypted" class="result">
      <h4>加密结果:</h4>
      <pre>{{ encrypted }}</pre>
    </div>

    <div v-if="decrypted" class="result">
      <h4>解密结果:</h4>
      <p>{{ decrypted }}</p>
    </div>
  </div>
</template>

<style scoped>
.tripledes-demo {
  max-width: 700px;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.btn-small {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.valid {
  color: green;
}

.invalid {
  color: red;
}

.buttons {
  margin: 20px 0;
}

.buttons button {
  margin-right: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #6c757d !important;
}

.buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.result {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.result pre {
  background: #e9ecef;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
```

## 安全性和最佳实践

1. **密钥管理**: 使用强随机密钥，定期更换
2. **IV 使用**: 每次加密使用不同的 IV
3. **模式选择**: 推荐使用 CBC 模式
4. **密钥存储**: 安全存储密钥，避免硬编码
5. **升级建议**: 考虑升级到 AES 算法以获得更好的安全性

## 性能特点

- 比 DES 更安全，但比 AES 慢
- 适合对安全性有一定要求但不需要最高安全级别的场景
- 在现代浏览器中性能良好
