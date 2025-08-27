# Blowfish 加密示例

Blowfish 是一种快速的分组密码算法，支持可变长度的密钥（32-448 位）。在 Web 环境中，我们使用 AES 作为
替代实现以确保兼容性。

## 基础用法

### 简单加密解密

```typescript
import { blowfish } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key-123' // Blowfish 支持可变长度密钥

// 加密
const encrypted = blowfish.encrypt(data, key)
console.log('加密结果:', encrypted)

// 解密
const decrypted = blowfish.decrypt(encrypted.data!, key, {
  iv: encrypted.iv,
})
console.log('解密结果:', decrypted.data)
```

### 指定加密模式

```typescript
import { blowfish } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key-123'

// CBC 模式（默认）
const cbcEncrypted = blowfish.encrypt(data, key, {
  mode: 'CBC',
})

// ECB 模式
const ecbEncrypted = blowfish.encrypt(data, key, {
  mode: 'ECB',
})
```

### 使用不同长度的密钥

```typescript
import { blowfish } from '@ldesign/crypto'

const data = 'Hello, World!'

// 短密钥
const shortKey = 'short'
const encryptedShort = blowfish.encrypt(data, shortKey)

// 中等长度密钥
const mediumKey = 'medium-length-key'
const encryptedMedium = blowfish.encrypt(data, mediumKey)

// 长密钥
const longKey = 'this-is-a-very-long-key-for-blowfish-encryption-algorithm'
const encryptedLong = blowfish.encrypt(data, longKey)

console.log('短密钥加密:', encryptedShort)
console.log('中等密钥加密:', encryptedMedium)
console.log('长密钥加密:', encryptedLong)
```

## 使用类实例

```typescript
import { BlowfishEncryptor } from '@ldesign/crypto'

const blowfishEncryptor = new BlowfishEncryptor()
const data = 'Hello, World!'
const key = 'my-secret-key-123'

// 加密
const encrypted = blowfishEncryptor.encrypt(data, key, {
  mode: 'CBC',
})

if (encrypted.success) {
  console.log('加密成功:', encrypted.data)
  console.log('IV:', encrypted.iv)
  console.log('密钥大小:', encrypted.keySize) // 256 位（AES 替代实现）

  // 解密
  const decrypted = blowfishEncryptor.decrypt(encrypted.data!, key, {
    iv: encrypted.iv,
    mode: 'CBC',
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

## 密钥生成

```typescript
import { blowfish } from '@ldesign/crypto'

// 生成默认长度密钥（32 字节）
const defaultKey = blowfish.generateKey()
console.log('默认密钥:', defaultKey)
console.log('密钥长度:', defaultKey.length)

// 生成指定长度密钥
const key16 = blowfish.generateKey(16)
const key32 = blowfish.generateKey(32)
const key64 = blowfish.generateKey(64)

console.log('16字节密钥:', key16)
console.log('32字节密钥:', key32)
console.log('64字节密钥:', key64)

// 使用生成的密钥
const data = 'Hello, World!'
const encrypted = blowfish.encrypt(data, key32)
const decrypted = blowfish.decrypt(encrypted.data!, key32, {
  iv: encrypted.iv,
})
```

## 与统一管理器集成

```typescript
import { cryptoManager } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key-123'

// 使用统一管理器加密
const encrypted = await cryptoManager.encryptData(data, key, 'Blowfish', {
  mode: 'CBC',
})

if (encrypted.success) {
  console.log('加密成功:', encrypted)

  // 解密
  const decrypted = await cryptoManager.decryptData(encrypted, key, 'Blowfish')

  if (decrypted.success) {
    console.log('解密成功:', decrypted.data)
  }
}
```

## Vue 3 集成示例

```vue
<script setup>
import { blowfish } from '@ldesign/crypto'
import { computed, onMounted, ref } from 'vue'

const plaintext = ref('')
const key = ref('')
const keyLength = ref(32)
const mode = ref('CBC')
const encrypted = ref('')
const decrypted = ref('')
const isProcessing = ref(false)
const error = ref('')
const warning = ref('')

const keyLengthOptions = [8, 16, 24, 32, 48, 64]

const isValidInput = computed(() => {
  return plaintext.value.trim() && key.value.trim()
})

onMounted(() => {
  // 显示 Web 环境兼容性警告
  warning.value = '注意：在 Web 环境中，Blowfish 使用 AES 作为替代实现以确保兼容性。'
})

async function handleEncrypt() {
  if (!isValidInput.value) {
    error.value = '请输入明文和密钥'
    return
  }

  isProcessing.value = true
  error.value = ''

  try {
    const result = blowfish.encrypt(plaintext.value, key.value, {
      mode: mode.value as any
    })

    if (result.success) {
      encrypted.value = JSON.stringify({
        data: result.data,
        iv: result.iv,
        mode: result.mode,
        keySize: result.keySize,
        algorithm: result.algorithm
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
    const result = blowfish.decrypt(encryptedData.data, key.value, {
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
  key.value = blowfish.generateKey(keyLength.value)
}

function clearAll() {
  plaintext.value = ''
  encrypted.value = ''
  decrypted.value = ''
  error.value = ''
}
</script>

<template>
  <div class="blowfish-demo">
    <h3>Blowfish 加密演示</h3>

    <div v-if="warning" class="warning">
      ⚠️ {{ warning }}
    </div>

    <div class="form-group">
      <label>明文:</label>
      <textarea v-model="plaintext" placeholder="输入要加密的文本" rows="3" />
    </div>

    <div class="form-group">
      <label>密钥 ({{ key.length }} 字符):</label>
      <input v-model="key" placeholder="输入密钥">
      <div class="key-controls">
        <label>生成长度:</label>
        <select v-model="keyLength">
          <option v-for="length in keyLengthOptions" :key="length" :value="length">
            {{ length }} 字节
          </option>
        </select>
        <button class="btn-small" @click="generateRandomKey">
          生成随机密钥
        </button>
      </div>
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
      </select>
    </div>

    <div class="buttons">
      <button :disabled="isProcessing || !isValidInput" @click="handleEncrypt">
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
.blowfish-demo {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.warning {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  margin-bottom: 20px;
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

.key-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.key-controls label {
  margin: 0;
  font-weight: normal;
}

.key-controls select {
  width: auto;
  min-width: 100px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  white-space: nowrap;
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

## Web 环境兼容性说明

由于 Blowfish 算法在 Web 环境中的原生支持有限，本库采用以下策略：

1. **替代实现**: 使用 AES-256-CBC 作为 Blowfish 的替代实现
2. **兼容性**: 确保在所有现代浏览器中正常工作
3. **警告提示**: 在使用时会显示相应的警告信息
4. **API 一致性**: 保持与其他算法相同的 API 接口

## 最佳实践

1. **密钥长度**: 建议使用 16-64 字节的密钥
2. **模式选择**: 推荐使用 CBC 模式
3. **IV 管理**: 每次加密使用不同的 IV
4. **升级建议**: 在生产环境中考虑使用 AES 算法
5. **测试验证**: 在部署前充分测试加密解密功能

## 性能特点

- 在 Web 环境中性能良好（基于 AES 实现）
- 支持可变长度密钥，灵活性高
- 适合对兼容性要求较高的场景
