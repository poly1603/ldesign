# DES 加密示例

DES (Data Encryption Standard) 是一种对称加密算法，使用 64 位密钥（实际有效位数为 56 位）。

## 基础用法

### 简单加密解密

```typescript
import { des } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret12' // DES 密钥长度为 8 字节

// 加密
const encrypted = des.encrypt(data, key)
console.log('加密结果:', encrypted)

// 解密
const decrypted = des.decrypt(encrypted.data!, key, {
  iv: encrypted.iv,
})
console.log('解密结果:', decrypted.data)
```

### 指定加密模式

```typescript
import { des } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret12'

// CBC 模式（默认）
const cbcEncrypted = des.encrypt(data, key, {
  mode: 'CBC',
})

// ECB 模式
const ecbEncrypted = des.encrypt(data, key, {
  mode: 'ECB',
})

// CFB 模式
const cfbEncrypted = des.encrypt(data, key, {
  mode: 'CFB',
})

// OFB 模式
const ofbEncrypted = des.encrypt(data, key, {
  mode: 'OFB',
})
```

### 使用自定义 IV

```typescript
import { des, RandomUtils } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret12'

// 生成自定义 IV
const customIV = RandomUtils.generateIV(8) // DES IV 长度为 8 字节

// 使用自定义 IV 加密
const encrypted = des.encrypt(data, key, {
  iv: customIV,
  mode: 'CBC',
})

// 解密时使用相同的 IV
const decrypted = des.decrypt(encrypted.data!, key, {
  iv: customIV,
  mode: 'CBC',
})
```

## 使用类实例

```typescript
import { DESEncryptor } from '@ldesign/crypto'

const desEncryptor = new DESEncryptor()
const data = 'Hello, World!'
const key = 'secret12'

// 加密
const encrypted = desEncryptor.encrypt(data, key, {
  mode: 'CBC',
})

if (encrypted.success) {
  console.log('加密成功:', encrypted.data)
  console.log('IV:', encrypted.iv)

  // 解密
  const decrypted = desEncryptor.decrypt(encrypted.data!, key, {
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
import { des } from '@ldesign/crypto'

// 生成随机密钥
const randomKey = des.generateKey()
console.log('随机密钥:', randomKey) // 8 字节密钥

// 使用生成的密钥
const data = 'Hello, World!'
const encrypted = des.encrypt(data, randomKey)
const decrypted = des.decrypt(encrypted.data!, randomKey, {
  iv: encrypted.iv,
})
```

## 错误处理

```typescript
import { des } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'secret12'

// 加密
const encrypted = des.encrypt(data, key)

if (encrypted.success) {
  // 尝试用错误的密钥解密
  const wrongKey = 'wrong123'
  const decrypted = des.decrypt(encrypted.data!, wrongKey, {
    iv: encrypted.iv,
  })

  if (!decrypted.success) {
    console.error('解密失败:', decrypted.error)
    // 处理解密错误
  }
}
else {
  console.error('加密失败:', encrypted.error)
  // 处理加密错误
}
```

## Vue 3 集成

```vue
<script setup>
import { des } from '@ldesign/crypto'
import { ref } from 'vue'

const plaintext = ref('')
const key = ref('secret12')
const encrypted = ref('')
const decrypted = ref('')
const error = ref('')

function handleEncrypt() {
  if (!plaintext.value || !key.value) {
    error.value = '请输入明文和密钥'
    return
  }

  const result = des.encrypt(plaintext.value, key.value)

  if (result.success) {
    encrypted.value = JSON.stringify(
      {
        data: result.data,
        iv: result.iv,
      },
      null,
      2
    )
    error.value = ''
  }
  else {
    error.value = result.error || '加密失败'
  }
}

function handleDecrypt() {
  if (!encrypted.value || !key.value) {
    error.value = '请先加密数据'
    return
  }

  try {
    const encryptedData = JSON.parse(encrypted.value)
    const result = des.decrypt(encryptedData.data, key.value, {
      iv: encryptedData.iv,
    })

    if (result.success) {
      decrypted.value = result.data || ''
      error.value = ''
    }
    else {
      error.value = result.error || '解密失败'
    }
  }
  catch (e) {
    error.value = '解析加密数据失败'
  }
}
</script>

<template>
  <div class="des-demo">
    <h3>DES 加密演示</h3>

    <div class="form-group">
      <label>明文:</label>
      <input v-model="plaintext" placeholder="输入要加密的文本">
    </div>

    <div class="form-group">
      <label>密钥 (8字节):</label>
      <input v-model="key" placeholder="输入8字节密钥" maxlength="8">
    </div>

    <div class="buttons">
      <button @click="handleEncrypt">
        加密
      </button>
      <button :disabled="!encrypted" @click="handleDecrypt">
        解密
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
.des-demo {
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

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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

.buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin: 10px 0;
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
}
</style>
```

## 注意事项

1. **密钥长度**: DES 使用 8 字节（64 位）密钥，其中 8 位用于奇偶校验
2. **安全性**: DES 已被认为不够安全，建议在生产环境中使用 AES
3. **IV 管理**: 在 CBC、CFB、OFB 模式下需要使用初始化向量（IV）
4. **数据填充**: 默认使用 PKCS7 填充方式
5. **Web 兼容性**: 在 Web 环境中完全兼容，无需额外配置

## 性能考虑

- DES 加密速度较快，但安全性较低
- 适合对安全性要求不高的场景
- 建议优先使用 AES 算法
