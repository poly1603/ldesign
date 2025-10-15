# 哈希

本指南介绍如何使用 @ldesign/crypto 进行哈希计算和消息认证。

## 什么是哈希

哈希函数将任意长度的数据映射为固定长度的输出，具有以下特性：

- **确定性**：相同输入总是产生相同输出
- **单向性**：无法从哈希值反推原始数据
- **雪崩效应**：微小的输入变化导致完全不同的输出
- **抗碰撞性**：很难找到两个产生相同哈希的不同输入

## 基础哈希

### 常用哈希算法

```typescript
import { hash } from '@ldesign/crypto'

const data = 'Hello World'

// MD5 (128 位)
const md5 = hash.md5(data)
console.log(md5)

// SHA-1 (160 位)
const sha1 = hash.sha1(data)
console.log(sha1)

// SHA-224 (224 位)
const sha224 = hash.sha224(data)
console.log(sha224)

// SHA-256 (256 位，推荐)
const sha256 = hash.sha256(data)
console.log(sha256)

// SHA-384 (384 位)
const sha384 = hash.sha384(data)
console.log(sha384)

// SHA-512 (512 位)
const sha512 = hash.sha512(data)
console.log(sha512)
```

### 输出编码

```typescript
// Hex 编码（默认）
const hexHash = hash.sha256('Hello', { encoding: 'hex' })
console.log(hexHash) // 'a591a6d40bf42... '

// Base64 编码
const base64Hash = hash.sha256('Hello', { encoding: 'base64' })
console.log(base64Hash) // 'pZGm1Av0J...'
```

### 使用 Hash 类

```typescript
import { Hash } from '@ldesign/crypto'

const hasher = new Hash()

// 计算哈希
const result = hasher.hash('Hello World', 'SHA256')
console.log(result)

// 指定编码
const base64 = hasher.hash('Hello', 'SHA256', { encoding: 'base64' })
```

## HMAC 消息认证码

HMAC 使用密钥进行哈希，用于验证数据完整性和真实性。

### 基础用法

```typescript
import { hmac } from '@ldesign/crypto'

const message = 'Important message'
const secretKey = 'my-secret-key'

// 生成 HMAC
const mac = hmac.sha256(message, secretKey)
console.log(mac)

// 其他算法
const md5Mac = hmac.md5(message, secretKey)
const sha1Mac = hmac.sha1(message, secretKey)
const sha384Mac = hmac.sha384(message, secretKey)
const sha512Mac = hmac.sha512(message, secretKey)
```

### 验证 HMAC

```typescript
// 生成 MAC
const mac = hmac.sha256('message', 'key')

// 验证 MAC（常数时间比较）
const isValid = hmac.verify('message', 'key', mac, 'SHA256')
console.log(isValid) // true

// 篡改数据后验证
const tampered = hmac.verify('modified', 'key', mac, 'SHA256')
console.log(tampered) // false
```

### 指定编码

```typescript
// Base64 编码
const base64Mac = hmac.sha256('message', 'key', { encoding: 'base64' })

// Hex 编码
const hexMac = hmac.sha256('message', 'key', { encoding: 'hex' })
```

## 实际应用场景

### 密码哈希

```typescript
import { hash, RandomUtils } from '@ldesign/crypto'

// 用户注册时
const password = 'user-password'
const salt = RandomUtils.generateSalt(16)

// 存储盐值和哈希
const hashedPassword = hash.sha256(password + salt)

// 登录验证时
const loginPassword = 'user-password'
const loginHash = hash.sha256(loginPassword + salt)

if (loginHash === hashedPassword) {
 console.log('密码正确')
}
```

::: warning 注意
简单的密码哈希不够安全，应使用专门的密码哈希函数如 PBKDF2、bcrypt 或 Argon2。
:::

### 密码哈希（推荐方式）

```typescript
import { hashPassword } from '@ldesign/crypto'

// 注册时
const result = hashPassword('user-password', {
 iterations: 100000,
 keyLength: 32
})

// 存储 result.hash 和 result.salt

// 验证时
const loginResult = hashPassword('user-password', {
 salt: result.salt,
 iterations: 100000,
 keyLength: 32
})

if (loginResult.hash === result.hash) {
 console.log('密码正确')
}
```

### 文件完整性校验

```typescript
import { hash } from '@ldesign/crypto'

// 计算文件哈希
const fileContent = 'file content...'
const fileHash = hash.sha256(fileContent)

// 存储哈希值
console.log('文件 SHA-256:', fileHash)

// 验证文件完整性
const verifyContent = 'file content...'
const verifyHash = hash.sha256(verifyContent)

if (hash.verify(verifyContent, fileHash, 'SHA256')) {
 console.log('文件完整')
} else {
 console.log('文件可能被篡改')
}
```

### API 请求签名

```typescript
import { hmac } from '@ldesign/crypto'

// 构建请求签名
function signRequest(method, url, body, timestamp, apiSecret) {
 const data = `${method}${url}${body}${timestamp}`
 return hmac.sha256(data, apiSecret)
}

// 发送请求
const method = 'POST'
const url = '/api/data'
const body = JSON.stringify({ data: 'value' })
const timestamp = Date.now()
const signature = signRequest(method, url, body, timestamp, 'api-secret')

// 服务器验证
function verifyRequest(method, url, body, timestamp, signature, apiSecret) {
 const data = `${method}${url}${body}${timestamp}`
 return hmac.verify(data, apiSecret, signature, 'SHA256')
}
```

### 数据指纹

```typescript
import { hash } from '@ldesign/crypto'

// 计算对象指纹
function getObjectFingerprint(obj) {
 const json = JSON.stringify(obj, Object.keys(obj).sort())
 return hash.sha256(json)
}

const data1 = { name: 'Alice', age: 30 }
const data2 = { age: 30, name: 'Alice' }

console.log(getObjectFingerprint(data1)) // 相同
console.log(getObjectFingerprint(data2)) // 相同

// 去重
const items = [data1, data2, /* more items */]
const uniqueItems = Array.from(
 new Map(items.map(item => [getObjectFingerprint(item), item]))
  .values()
)
```

## 哈希链

```typescript
import { hash } from '@ldesign/crypto'

// 创建哈希链
function createHashChain(data, length) {
 const chain = [hash.sha256(data)]

 for (let i = 1; i < length; i++) {
  chain.push(hash.sha256(chain[i - 1]))
 }

 return chain
}

const chain = createHashChain('genesis', 10)
console.log(chain)

// 验证哈希链
function verifyHashChain(chain) {
 for (let i = 1; i < chain.length; i++) {
  if (hash.sha256(chain[i - 1]) !== chain[i]) {
   return false
  }
 }
 return true
}

console.log(verifyHashChain(chain)) // true
```

## 性能优化

### 批量哈希

```typescript
import { hash } from '@ldesign/crypto'

// 批量计算哈希
const items = ['data1', 'data2', 'data3', /* ... */]
const hashes = items.map(item => hash.sha256(item))

// 使用 Worker 并行计算
import { getGlobalWorkerPool } from '@ldesign/crypto'

const pool = getGlobalWorkerPool()
const promises = items.map(item =>
 pool.execute({
  type: 'hash',
  algorithm: 'sha256',
  data: item
 })
)

const results = await Promise.all(promises)
```

### 缓存哈希结果

```typescript
import { LRUCache } from '@ldesign/crypto'

// 创建缓存
const hashCache = new LRUCache({ max: 1000 })

function cachedHash(data) {
 const cached = hashCache.get(data)
 if (cached) return cached

 const result = hash.sha256(data)
 hashCache.set(data, result)
 return result
}
```

## 算法选择建议

### 安全性

- **推荐**：SHA-256、SHA-384、SHA-512
- **避免**：MD5、SHA-1（已被破解）
- **密码哈希**：使用 PBKDF2、bcrypt、Argon2

### 性能

- **速度**：MD5 > SHA-1 > SHA-256 > SHA-512
- **安全vs性能**：大多数情况推荐 SHA-256
- **大文件**：考虑使用流式哈希

### 场景

- **数据完整性**：SHA-256
- **密码存储**：PBKDF2/bcrypt/Argon2
- **数字签名**：SHA-256/SHA-512
- **区块链**：SHA-256
- **文件校验**：SHA-256/SHA-512

## 安全建议

### 避免的做法

```typescript
// ❌ 不要：简单哈希密码
const bad = hash.md5(password)

// ❌ 不要：没有盐值
const bad2 = hash.sha256(password)

// ✅ 推荐：使用密钥派生
import { deriveKey } from '@ldesign/crypto'
const good = deriveKey(password, salt, { iterations: 100000 })
```

### 常数时间比较

```typescript
// 验证哈希时使用 verify 方法
// 避免时间攻击
const isValid = hash.verify(data, expectedHash, 'SHA256')

// 验证 HMAC
const isValidMac = hmac.verify(message, key, expectedMac, 'SHA256')
```

## 下一步

- [数字签名](/guide/digital-signature) - 了解数字签名
- [加密](/guide/encryption) - 学习加密功能
- [安全性](/guide/security) - 安全最佳实践
- [API 参考](/api/hashing) - 查看完整 API
