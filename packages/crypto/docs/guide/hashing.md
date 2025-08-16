# 哈希算法

哈希算法用于生成数据的固定长度摘要，广泛应用于数据完整性验证、密码存储、数字签名等场景。

## 支持的哈希算法

@ldesign/crypto 支持以下哈希算法：

| 算法    | 输出长度 | 安全性 | 推荐用途           |
| ------- | -------- | ------ | ------------------ |
| MD5     | 128 位   | 低     | 仅用于非安全场景   |
| SHA-1   | 160 位   | 低     | 已弃用，不推荐使用 |
| SHA-224 | 224 位   | 中     | 一般用途           |
| SHA-256 | 256 位   | 高     | **推荐使用**       |
| SHA-384 | 384 位   | 高     | 高安全要求         |
| SHA-512 | 512 位   | 高     | 高安全要求         |

## 基本用法

### 单个哈希计算

```typescript
import { hash } from '@ldesign/crypto'

const data = 'Hello, World!'

// 推荐使用 SHA-256
const sha256Hash = hash.sha256(data)
console.log(sha256Hash) // "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f"

// 其他算法
const md5Hash = hash.md5(data)
const sha1Hash = hash.sha1(data)
const sha384Hash = hash.sha384(data)
const sha512Hash = hash.sha512(data)
```

### 指定输出编码

```typescript
// 默认使用 hex 编码
const hexHash = hash.sha256(data, { encoding: 'hex' })

// 使用 base64 编码
const base64Hash = hash.sha256(data, { encoding: 'base64' })

// 使用 utf8 编码（不推荐）
const utf8Hash = hash.sha256(data, { encoding: 'utf8' })
```

### 哈希验证

```typescript
const originalData = 'Important data'
const expectedHash = hash.sha256(originalData)

// 验证数据完整性
const isValid = hash.verify(originalData, expectedHash, 'SHA256')
console.log(isValid) // true

// 数据被篡改的情况
const tamperedData = 'Tampered data'
const isValidTampered = hash.verify(tamperedData, expectedHash, 'SHA256')
console.log(isValidTampered) // false
```

## HMAC (Hash-based Message Authentication Code)

HMAC 提供数据完整性和身份验证，使用密钥和哈希算法生成消息认证码。

### 基本用法

```typescript
import { hmac } from '@ldesign/crypto'

const message = 'Important message'
const secretKey = 'my-secret-key'

// 生成 HMAC-SHA256
const hmacValue = hmac.sha256(message, secretKey)
console.log(hmacValue)

// 其他 HMAC 算法
const hmacMd5 = hmac.md5(message, secretKey)
const hmacSha1 = hmac.sha1(message, secretKey)
const hmacSha384 = hmac.sha384(message, secretKey)
const hmacSha512 = hmac.sha512(message, secretKey)
```

### HMAC 验证

```typescript
const message = 'API request data'
const secretKey = 'api-secret-key'

// 发送方生成 HMAC
const hmacValue = hmac.sha256(message, secretKey)

// 接收方验证 HMAC
const isValid = hmac.verify(message, secretKey, hmacValue, 'SHA256')
console.log(isValid) // true
```

### API 签名示例

```typescript
function signApiRequest(method: string, url: string, body: string, secretKey: string) {
  const timestamp = Date.now().toString()
  const message = `${method}\n${url}\n${body}\n${timestamp}`

  const signature = hmac.sha256(message, secretKey)

  return {
    signature,
    timestamp,
  }
}

// 使用示例
const apiSignature = signApiRequest('POST', '/api/users', '{"name":"John"}', 'api-secret')
console.log(apiSignature)
```

## 实际应用场景

### 1. 密码存储

```typescript
import { hash, keyGenerator } from '@ldesign/crypto'

function hashPassword(password: string): string {
  // 生成随机盐值
  const salt = keyGenerator.generateSalt(16)

  // 使用盐值哈希密码
  const hashedPassword = hash.sha256(password + salt)

  // 返回盐值和哈希值的组合
  return `${salt}:${hashedPassword}`
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':')
  const computedHash = hash.sha256(password + salt)
  return computedHash === hash
}

// 使用示例
const userPassword = 'user123456'
const storedHash = hashPassword(userPassword)
const isValid = verifyPassword(userPassword, storedHash)
```

### 2. 文件完整性验证

```typescript
function calculateFileHash(fileContent: string): string {
  return hash.sha256(fileContent)
}

function verifyFileIntegrity(fileContent: string, expectedHash: string): boolean {
  const actualHash = calculateFileHash(fileContent)
  return actualHash === expectedHash
}

// 使用示例
const fileContent = 'File content...'
const fileHash = calculateFileHash(fileContent)

// 稍后验证文件是否被修改
const isFileIntact = verifyFileIntegrity(fileContent, fileHash)
```

### 3. 数据去重

```typescript
class DataDeduplicator {
  private hashes = new Set<string>()

  isDuplicate(data: string): boolean {
    const dataHash = hash.sha256(data)

    if (this.hashes.has(dataHash)) {
      return true
    }

    this.hashes.add(dataHash)
    return false
  }
}

// 使用示例
const deduplicator = new DataDeduplicator()
console.log(deduplicator.isDuplicate('data1')) // false
console.log(deduplicator.isDuplicate('data2')) // false
console.log(deduplicator.isDuplicate('data1')) // true (重复)
```

### 4. 缓存键生成

```typescript
function generateCacheKey(userId: string, action: string, params: object): string {
  const keyData = `${userId}:${action}:${JSON.stringify(params)}`
  return hash.sha256(keyData)
}

// 使用示例
const cacheKey = generateCacheKey('user123', 'getUserProfile', { includeSettings: true })
```

## 性能考虑

### 算法选择

- **SHA-256**: 推荐用于一般用途，安全性和性能平衡
- **SHA-512**: 在 64 位系统上可能比 SHA-256 更快
- **MD5**: 仅用于非安全场景，如校验和计算

### 批量处理

```typescript
// 批量哈希计算
function hashMultiple(dataList: string[]): string[] {
  return dataList.map(data => hash.sha256(data))
}

// 使用 Worker 进行大量数据的哈希计算（浏览器环境）
function hashInWorker(data: string): Promise<string> {
  return new Promise(resolve => {
    const worker = new Worker('hash-worker.js')
    worker.postMessage(data)
    worker.onmessage = e => {
      resolve(e.data)
      worker.terminate()
    }
  })
}
```

## 安全注意事项

1. **不要使用 MD5 和 SHA-1** 用于安全相关的应用
2. **使用盐值** 防止彩虹表攻击
3. **选择合适的算法** 根据安全要求选择 SHA-256 或更强的算法
4. **密钥管理** HMAC 的密钥应该安全存储和管理
5. **时间攻击防护** 使用常数时间比较函数验证哈希值

```typescript
// 安全的哈希比较（防止时间攻击）
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
```
