# 哈希算法示例

本页展示哈希与 HMAC 的常见用法，示例为纯代码，SSR 友好。

## 哈希计算

```ts path=null start=null
import { hash } from '@ldesign/crypto'

const data = 'Hello, Hash!'
const md5 = hash.md5(data)
const sha1 = hash.sha1(data)
const sha256 = hash.sha256(data)
const sha384 = hash.sha384(data)
const sha512 = hash.sha512(data)
```

## HMAC 计算

```ts path=null start=null
import { hmac } from '@ldesign/crypto'

const msg = 'API request'
const key = 'api-secret'
const mac = hmac.sha256(msg, key)
const ok = hmac.verify(msg, key, mac, 'SHA256')
```

## 密码哈希（示例，PBKDF2）

```ts path=null start=null
import { hash, keyGenerator } from '@ldesign/crypto'

const salt = keyGenerator.generateSalt(16)
const password = 'user-password'
// 伪代码：若集成 KDF 模块，可使用 PBKDF2/Argon2 等
// const derived = kdf.pbkdf2(password, salt, { iterations: 100_000, keyLength: 32 })
```

## 注意事项

- 不要将 MD5/SHA-1 用于安全场景；推荐 SHA-256/384/512
- 验证时使用常数时间比较，避免时序攻击

哈希算法用于生成数据的固定长度摘要，本页面提供了完整的交互式演示。

<!-- 交互式演示与样式已移除，下面保留的纯代码示例可在 SSR 下构建通过。 -->

<!-- Interactive demo removed in SSR build: replace with static examples or client-only components -->

## HMAC 演示


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
<!-- client-only demo removed for SSR build -->
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
      sha256: hash.sha256(fileContent),
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
  verifyRequest(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    signature: string
  ): boolean {
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

