# 哈希算法示例

哈希算法用于生成数据的固定长度摘要，本页面提供了完整的交互式演示。

## 交互式演示

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔢 哈希计算演示</h3>

    <div class="form-group">
      <label>要哈希的数据:</label>
      <textarea id="hash-data" placeholder="输入要哈希的数据">Hello, Hash Algorithm!</textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>哈希算法:</label>
        <select id="hash-algorithm">
          <option value="MD5">MD5</option>
          <option value="SHA1">SHA1</option>
          <option value="SHA224">SHA224</option>
          <option value="SHA256" selected>SHA256</option>
          <option value="SHA384">SHA384</option>
          <option value="SHA512">SHA512</option>
        </select>
      </div>

      <div class="form-group">
        <label>输出编码:</label>
        <select id="hash-encoding">
          <option value="hex" selected>Hex</option>
          <option value="base64">Base64</option>
        </select>
      </div>
    </div>

    <div class="form-actions">
      <button id="hash-calculate-btn" class="btn primary">🔢 计算哈希</button>
      <button id="hash-all-btn" class="btn secondary">📊 计算所有算法</button>
      <button id="hash-verify-btn" class="btn success">✅ 验证哈希</button>
      <button id="hash-clear-btn" class="btn">🗑️ 清除</button>
    </div>

    <div id="hash-result" class="result-box" style="display: none;">
      <h4>🔢 哈希结果</h4>
      <div class="result-item">
        <label>哈希值:</label>
        <div id="hash-value" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>算法:</label>
        <div id="hash-algorithm-used" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>编码:</label>
        <div id="hash-encoding-used" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>长度:</label>
        <div id="hash-length" class="result-value"></div>
      </div>
    </div>

    <div id="hash-all-result" class="result-box" style="display: none;">
      <h4>📊 所有哈希结果</h4>
      <div id="hash-all-values"></div>
    </div>

    <div id="hash-verify-result" class="result-box success" style="display: none;">
      <h4>✅ 哈希验证</h4>
      <div id="hash-verify-message" class="result-value"></div>
    </div>

    <div id="hash-error" class="result-box error" style="display: none;"></div>

  </div>
</div>

## HMAC 演示

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔐 HMAC 消息认证码演示</h3>

    <div class="form-group">
      <label>消息:</label>
      <textarea id="hmac-message" placeholder="输入消息">Hello, HMAC!</textarea>
    </div>

    <div class="form-group">
      <label>密钥:</label>
      <input type="text" id="hmac-key" placeholder="输入HMAC密钥" value="secret-key">
    </div>

    <div class="form-group">
      <label>HMAC算法:</label>
      <select id="hmac-algorithm">
        <option value="MD5">HMAC-MD5</option>
        <option value="SHA1">HMAC-SHA1</option>
        <option value="SHA256" selected>HMAC-SHA256</option>
        <option value="SHA384">HMAC-SHA384</option>
        <option value="SHA512">HMAC-SHA512</option>
      </select>
    </div>

    <div class="form-actions">
      <button id="hmac-calculate-btn" class="btn primary">🔐 计算HMAC</button>
      <button id="hmac-verify-btn" class="btn success">✅ 验证HMAC</button>
      <button id="hmac-generate-key-btn" class="btn secondary">🔑 生成密钥</button>
      <button id="hmac-clear-btn" class="btn">🗑️ 清除</button>
    </div>

    <div id="hmac-result" class="result-box" style="display: none;">
      <h4>🔐 HMAC结果</h4>
      <div class="result-item">
        <label>HMAC值:</label>
        <div id="hmac-value" class="result-value"></div>
      </div>
      <div class="result-item">
        <label>算法:</label>
        <div id="hmac-algorithm-used" class="result-value"></div>
      </div>
    </div>

    <div id="hmac-verify-result" class="result-box success" style="display: none;">
      <h4>✅ HMAC验证</h4>
      <div id="hmac-verify-message" class="result-value"></div>
    </div>

    <div id="hmac-error" class="result-box error" style="display: none;"></div>

  </div>
</div>

## 代码示例

### 基本哈希计算

```typescript
import { hash } from '@ldesign/crypto'

// 计算不同算法的哈希
const data = 'Hello, Hash!'

const md5Hash = hash.md5(data)
const sha1Hash = hash.sha1(data)
const sha256Hash = hash.sha256(data)
const sha384Hash = hash.sha384(data)
const sha512Hash = hash.sha512(data)

console.log('MD5:', md5Hash)
console.log('SHA1:', sha1Hash)
console.log('SHA256:', sha256Hash)
console.log('SHA384:', sha384Hash)
console.log('SHA512:', sha512Hash)
```

### 指定输出编码

```typescript
// 使用不同的编码格式
const data = 'Hello, Encoding!'

// Hex 编码（默认）
const hexHash = hash.sha256(data, { encoding: 'hex' })

// Base64 编码
const base64Hash = hash.sha256(data, { encoding: 'base64' })

console.log('Hex:', hexHash)
console.log('Base64:', base64Hash)
```

### 哈希验证

```typescript
const originalData = 'Important data'
const expectedHash = hash.sha256(originalData)

// 验证数据完整性
const isValid = hash.verify(originalData, expectedHash, 'SHA256')
console.log('数据完整性验证:', isValid) // true

// 数据被篡改的情况
const tamperedData = 'Tampered data'
const isValidTampered = hash.verify(tamperedData, expectedHash, 'SHA256')
console.log('篡改数据验证:', isValidTampered) // false
```

### HMAC 计算

```typescript
import { hmac } from '@ldesign/crypto'

const message = 'Important message'
const secretKey = 'my-secret-key'

// 计算不同算法的 HMAC
const hmacMd5 = hmac.md5(message, secretKey)
const hmacSha1 = hmac.sha1(message, secretKey)
const hmacSha256 = hmac.sha256(message, secretKey)
const hmacSha384 = hmac.sha384(message, secretKey)
const hmacSha512 = hmac.sha512(message, secretKey)

console.log('HMAC-MD5:', hmacMd5)
console.log('HMAC-SHA1:', hmacSha1)
console.log('HMAC-SHA256:', hmacSha256)
console.log('HMAC-SHA384:', hmacSha384)
console.log('HMAC-SHA512:', hmacSha512)
```

### HMAC 验证

```typescript
const message = 'API request data'
const secretKey = 'api-secret-key'

// 生成 HMAC
const hmacValue = hmac.sha256(message, secretKey)

// 验证 HMAC
const isValid = hmac.verify(message, secretKey, hmacValue, 'SHA256')
console.log('HMAC 验证:', isValid) // true
```

## Vue 3 集成示例

```vue
<script setup>
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { md5, sha1, sha256, sha384, sha512, isHashing } = useHash()

const data = ref('Hello, Vue Hash!')
const algorithm = ref('SHA256')
const hashResult = ref('')

async function calculateHash() {
  try {
    switch (algorithm.value) {
      case 'MD5':
        hashResult.value = await md5(data.value)
        break
      case 'SHA1':
        hashResult.value = await sha1(data.value)
        break
      case 'SHA256':
        hashResult.value = await sha256(data.value)
        break
      case 'SHA384':
        hashResult.value = await sha384(data.value)
        break
      case 'SHA512':
        hashResult.value = await sha512(data.value)
        break
    }
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}
</script>

<template>
  <div>
    <h2>哈希计算</h2>

    <div>
      <textarea v-model="data" placeholder="输入要哈希的数据" />
      <select v-model="algorithm">
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
    </div>

    <div v-if="hashResult">
      <h3>哈希结果</h3>
      <p>{{ algorithm }}: {{ hashResult }}</p>
    </div>
  </div>
</template>
```

## 实际应用场景

### 1. 密码存储

```typescript
import { hash, keyGenerator } from '@ldesign/crypto'

class PasswordManager {
  // 哈希密码
  static hashPassword(password: string): string {
    const salt = keyGenerator.generateSalt(16)
    const hashedPassword = hash.sha256(password + salt)
    return `${salt}:${hashedPassword}`
  }

  // 验证密码
  static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, expectedHash] = storedHash.split(':')
    const computedHash = hash.sha256(password + salt)
    return computedHash === expectedHash
  }
}

// 使用示例
const password = 'user123456'
const hashedPassword = PasswordManager.hashPassword(password)
const isValid = PasswordManager.verifyPassword(password, hashedPassword)
console.log('密码验证:', isValid)
```

### 2. 文件完整性验证

```typescript
class FileIntegrityChecker {
  // 计算文件哈希
  static calculateFileHash(fileContent: string): string {
    return hash.sha256(fileContent)
  }

  // 验证文件完整性
  static verifyFileIntegrity(fileContent: string, expectedHash: string): boolean {
    const actualHash = this.calculateFileHash(fileContent)
    return actualHash === expectedHash
  }

  // 生成文件校验和
  static generateChecksum(fileContent: string): {
    md5: string
    sha1: string
    sha256: string
  } {
    return {
      md5: hash.md5(fileContent),
      sha1: hash.sha1(fileContent),
      sha256: hash.sha256(fileContent)
    }
  }
}

// 使用示例
const fileContent = 'File content...'
const checksum = FileIntegrityChecker.generateChecksum(fileContent)
console.log('文件校验和:', checksum)
```

### 3. API 请求签名

```typescript
class APIRequestSigner {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  // 生成请求签名
  signRequest(method: string, url: string, body: string, timestamp: number): string {
    const message = `${method}\n${url}\n${body}\n${timestamp}`
    return hmac.sha256(message, this.secretKey)
  }

  // 验证请求签名
  verifyRequest(method: string, url: string, body: string, timestamp: number, signature: string): boolean {
    const expectedSignature = this.signRequest(method, url, body, timestamp)
    return expectedSignature === signature
  }
}

// 使用示例
const signer = new APIRequestSigner('api-secret-key')
const timestamp = Date.now()
const signature = signer.signRequest('POST', '/api/users', '{"name":"John"}', timestamp)
console.log('请求签名:', signature)
```

### 4. 数据去重

```typescript
class DataDeduplicator {
  private hashes = new Set<string>()

  // 检查是否重复
  isDuplicate(data: string): boolean {
    const dataHash = hash.sha256(data)

    if (this.hashes.has(dataHash)) {
      return true
    }

    this.hashes.add(dataHash)
    return false
  }

  // 获取数据指纹
  getFingerprint(data: string): string {
    return hash.sha256(data)
  }

  // 清除缓存
  clear(): void {
    this.hashes.clear()
  }
}

// 使用示例
const deduplicator = new DataDeduplicator()
console.log(deduplicator.isDuplicate('data1')) // false
console.log(deduplicator.isDuplicate('data2')) // false
console.log(deduplicator.isDuplicate('data1')) // true (重复)
```

## 性能比较

### 不同算法的性能测试

```typescript
function performanceTest() {
  const data = 'A'.repeat(10000) // 10KB 数据
  const iterations = 1000

  console.time('MD5')
  for (let i = 0; i < iterations; i++) {
    hash.md5(data)
  }
  console.timeEnd('MD5')

  console.time('SHA1')
  for (let i = 0; i < iterations; i++) {
    hash.sha1(data)
  }
  console.timeEnd('SHA1')

  console.time('SHA256')
  for (let i = 0; i < iterations; i++) {
    hash.sha256(data)
  }
  console.timeEnd('SHA256')

  console.time('SHA512')
  for (let i = 0; i < iterations; i++) {
    hash.sha512(data)
  }
  console.timeEnd('SHA512')
}

performanceTest()
```

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
