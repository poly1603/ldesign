# 常见问题

本页面收集了使用 @ldesign/crypto 时的常见问题和解答。

## 安装和配置

### Q: 如何安装 @ldesign/crypto？

**A:** 使用 npm、yarn 或 pnpm 安装：

```bash
# npm
npm install @ldesign/crypto

# yarn
yarn add @ldesign/crypto

# pnpm
pnpm add @ldesign/crypto
```

### Q: 支持哪些环境？

**A:** @ldesign/crypto 支持：

- **浏览器**: Chrome 37+, Firefox 34+, Safari 7.1+, Edge 12+
- **Node.js**: 12.0.0+
- **TypeScript**: 4.0+
- **模块系统**: ES 模块、CommonJS、UMD

### Q: 如何在 TypeScript 项目中使用？

**A:** 库已包含完整的类型定义，直接导入即可：

```typescript
import { decrypt, encrypt, hash } from '@ldesign/crypto'

// TypeScript 会自动提供类型提示和检查
const encrypted = encrypt.aes('data', 'key')
```

## 加密和解密

### Q: AES 加密时应该选择哪种密钥长度？

**A:** 推荐选择：

- **AES-256** (32字节密钥): 推荐用于一般用途，安全性高
- **AES-192** (24字节密钥): 平衡安全性和性能
- **AES-128** (16字节密钥): 性能最好，安全性足够

```typescript
// 推荐使用 AES-256
const encrypted = encrypt.aes256(data, key)

// 或者指定密钥长度
const encrypted = encrypt.aes(data, key, { keySize: 256 })
```

### Q: 为什么解密失败了？

**A:** 解密失败的常见原因：

1. **密钥不匹配**：解密密钥必须与加密密钥完全相同
2. **数据损坏**：加密数据在传输或存储过程中被修改
3. **算法参数不匹配**：加密和解密使用了不同的参数

```typescript
// 正确的做法
const key = 'my-secret-key'
const encrypted = encrypt.aes(data, key, { keySize: 256, mode: 'CBC' })
const decrypted = decrypt.aes(encrypted, key, { keySize: 256, mode: 'CBC' })

// 检查解密结果
if (!decrypted.success) {
  console.error('解密失败:', decrypted.error)
}
```

### Q: RSA 加密有数据大小限制吗？

**A:** 是的，RSA 有数据大小限制：

- **RSA-1024**: 最大 117 字节
- **RSA-2048**: 最大 245 字节
- **RSA-4096**: 最大 501 字节

对于大数据，推荐使用混合加密：

```typescript
// 混合加密：RSA + AES
const aesKey = keyGenerator.generateKey(32)
const encryptedData = encrypt.aes(largeData, aesKey)
const encryptedKey = encrypt.rsa(aesKey, rsaPublicKey)

// 传输 encryptedData 和 encryptedKey
```

### Q: 如何安全地存储加密密钥？

**A:** 密钥存储的最佳实践：

1. **不要硬编码**：不要在源代码中写入密钥
2. **使用环境变量**：将密钥存储在环境变量中
3. **密钥管理服务**：使用专业的密钥管理服务
4. **加密存储**：如果必须本地存储，使用主密钥加密

```typescript
// ❌ 错误：硬编码密钥
const key = 'hardcoded-secret-key'

// ✅ 正确：使用环境变量
const key = process.env.ENCRYPTION_KEY

// ✅ 正确：使用密钥派生
const masterKey = process.env.MASTER_KEY
const derivedKey = hash.pbkdf2(masterKey, salt, {
  iterations: 100000,
  keyLength: 32
})
```

## 哈希和验证

### Q: 应该使用哪种哈希算法？

**A:** 算法选择建议：

| 用途       | 推荐算法           | 原因                 |
| ---------- | ------------------ | -------------------- |
| 密码存储   | SHA-256 + PBKDF2   | 安全性高，抗暴力破解 |
| 数据完整性 | SHA-256            | 平衡安全性和性能     |
| 数字签名   | SHA-256 或 SHA-512 | 广泛支持，安全性高   |
| 快速校验   | SHA-256            | 不推荐 MD5 和 SHA-1  |

```typescript
// ❌ 不推荐：MD5 和 SHA-1 已不安全
const md5Hash = hash.md5(data)
const sha1Hash = hash.sha1(data)

// ✅ 推荐：使用 SHA-256 或更强算法
const sha256Hash = hash.sha256(data)
const sha512Hash = hash.sha512(data)
```

### Q: 如何安全地存储用户密码？

**A:** 使用盐值和密钥派生函数：

```typescript
// 存储密码
function storePassword(password: string): string {
  const salt = keyGenerator.generateSalt(16)
  const hashedPassword = hash.pbkdf2(password, salt, {
    iterations: 100000, // 足够的迭代次数
    keyLength: 32,
    hashAlgorithm: 'SHA256'
  })

  return `${salt}:${hashedPassword}`
}

// 验证密码
function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, expectedHash] = storedHash.split(':')
  const computedHash = hash.pbkdf2(password, salt, {
    iterations: 100000,
    keyLength: 32,
    hashAlgorithm: 'SHA256'
  })

  return computedHash === expectedHash
}
```

### Q: HMAC 和普通哈希有什么区别？

**A:** 主要区别：

- **哈希**: 单向函数，用于数据完整性验证
- **HMAC**: 带密钥的哈希，用于身份验证和完整性验证

```typescript
// 普通哈希 - 任何人都可以验证
const dataHash = hash.sha256(data)
const isValid = hash.verify(data, dataHash, 'SHA256')

// HMAC - 需要密钥才能验证
const hmacValue = hmac.sha256(data, secretKey)
const isValidHmac = hmac.verify(data, secretKey, hmacValue, 'SHA256')
```

## Vue 3 集成

### Q: 如何在 Vue 3 中使用？

**A:** 有两种方式：

**方式1：使用 Composition API**

```typescript
import { useCrypto } from '@ldesign/crypto/vue'

export default {
  setup() {
    const { encryptAES, decryptAES, isEncrypting } = useCrypto()

    return {
      encryptAES,
      decryptAES,
      isEncrypting
    }
  }
}
```

**方式2：使用插件**

```typescript
// main.ts
import { CryptoPlugin } from '@ldesign/crypto/vue'
app.use(CryptoPlugin)

// 组件中使用
export default {
  methods: {
    encrypt() {
      const result = this.$crypto.encrypt.aes(this.data, this.key)
    }
  }
}
```

### Q: Vue 组件中如何处理加密错误？

**A:** 使用 composable 的错误处理：

```vue
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref, watch } from 'vue'

const { encryptAES, lastError, clearError } = useCrypto()
const errorMessage = ref('')

// 监听错误
watch(lastError, (error) => {
  if (error) {
    errorMessage.value = error
    // 5秒后自动清除错误
    setTimeout(() => {
      clearError()
      errorMessage.value = ''
    }, 5000)
  }
})

async function handleEncrypt() {
  try {
    clearError()
    const result = await encryptAES(data.value, key.value)
    // 处理成功结果
  }
  catch (error) {
    // 错误会自动设置到 lastError
    console.error('加密失败:', error)
  }
}
</script>

<template>
  <div v-if="errorMessage" class="error">
    {{ errorMessage }}
  </div>
</template>
```

## 性能问题

### Q: 加密操作很慢，如何优化？

**A:** 性能优化建议：

1. **选择合适的算法**：根据需求选择算法
2. **批量处理**：对多个数据项进行批量操作
3. **使用 Web Worker**：在后台线程执行加密
4. **缓存结果**：缓存重复的加密结果

```typescript
// 批量加密
function batchEncrypt(dataList: string[], key: string) {
  return dataList.map(data => encrypt.aes(data, key))
}

// 使用缓存
const encryptionCache = new Map()
function cachedEncrypt(data: string, key: string) {
  const cacheKey = `${data}:${key}`
  if (encryptionCache.has(cacheKey)) {
    return encryptionCache.get(cacheKey)
  }

  const result = encrypt.aes(data, key)
  encryptionCache.set(cacheKey, result)
  return result
}
```

### Q: 在浏览器中处理大文件时内存不足怎么办？

**A:** 使用分块处理：

```typescript
async function encryptLargeFile(fileContent: string, key: string) {
  const chunkSize = 64 * 1024 // 64KB 块
  const chunks = []

  for (let i = 0; i < fileContent.length; i += chunkSize) {
    const chunk = fileContent.slice(i, i + chunkSize)
    const encrypted = encrypt.aes(chunk, key)
    chunks.push(encrypted)

    // 让出控制权，避免阻塞 UI
    await new Promise(resolve => setTimeout(resolve, 0))
  }

  return chunks
}
```

## 安全问题

### Q: 如何防止时间攻击？

**A:** 使用常数时间比较：

```typescript
// 不安全的比较
const unsafeCompare = (a: string, b: string) => a === b

// 安全的常数时间比较
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length)
    return false

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}
```

### Q: 如何确保随机数的安全性？

**A:** 使用密码学安全的随机数生成器：

```typescript
// ✅ 安全：使用库提供的生成器
const secureKey = keyGenerator.generateKey(32)
const secureSalt = keyGenerator.generateSalt(16)

// ❌ 不安全：使用 Math.random()
const insecureKey = Math.random().toString()
```

### Q: 什么时候需要使用数字签名？

**A:** 数字签名适用于：

- **身份验证**：确认数据来源
- **不可否认**：防止发送方否认
- **完整性保护**：检测数据篡改
- **法律效力**：电子合同、证书等

```typescript
// 数字签名示例
const keyPair = rsa.generateKeyPair(2048)
const document = 'Important contract content'

// 签名
const signature = digitalSignature.sign(document, keyPair.privateKey)

// 验证
const isValid = digitalSignature.verify(document, signature, keyPair.publicKey)
```

## 错误处理

### Q: 如何正确处理加密错误？

**A:** 分层错误处理：

```typescript
async function safeEncrypt(data: string, key: string) {
  try {
    // 输入验证
    if (!data || !key) {
      throw new Error('数据和密钥不能为空')
    }

    if (key.length < 16) {
      throw new Error('密钥长度不足')
    }

    // 执行加密
    const result = encrypt.aes(data, key)

    return {
      success: true,
      data: result,
      error: null
    }
  }
  catch (error) {
    console.error('加密错误:', error)

    return {
      success: false,
      data: null,
      error: error.message
    }
  }
}
```

### Q: 生产环境中如何处理敏感错误信息？

**A:** 过滤敏感信息：

```typescript
function sanitizeError(error: Error, isProduction: boolean): string {
  if (!isProduction) {
    return error.message // 开发环境显示详细错误
  }

  // 生产环境过滤敏感信息
  const sensitivePatterns = [
    /key/i,
    /password/i,
    /secret/i,
    /token/i
  ]

  for (const pattern of sensitivePatterns) {
    if (pattern.test(error.message)) {
      return '操作失败，请重试' // 通用错误消息
    }
  }

  return error.message
}
```

## 兼容性问题

### Q: 在老版本浏览器中无法使用怎么办？

**A:** 检查浏览器支持并提供降级方案：

```typescript
function checkCryptoSupport(): boolean {
  return typeof crypto !== 'undefined'
    && typeof crypto.getRandomValues === 'function'
}

if (!checkCryptoSupport()) {
  console.warn('当前浏览器不支持 Web Crypto API')
  // 提供降级方案或提示用户升级浏览器
}
```

### Q: Node.js 和浏览器环境有什么区别？

**A:** 主要区别：

| 特性       | Node.js            | 浏览器                 |
| ---------- | ------------------ | ---------------------- |
| 随机数生成 | crypto.randomBytes | crypto.getRandomValues |
| 模块导入   | require/import     | import                 |
| 文件系统   | 支持               | 不支持                 |
| 性能       | 更好               | 受限                   |

库会自动处理这些差异，无需手动适配。

## 迁移问题

### Q: 如何从其他加密库迁移？

**A:** 迁移步骤：

1. **评估现有加密数据**：确定使用的算法和参数
2. **逐步替换**：先替换新功能，再迁移旧数据
3. **保持兼容**：确保能解密旧数据
4. **测试验证**：充分测试迁移结果

```typescript
// 迁移示例：从旧库迁移到新库
function migrateEncryptedData(oldEncryptedData: any, key: string) {
  try {
    // 尝试用新库解密
    const decrypted = decrypt.aes(oldEncryptedData, key)
    if (decrypted.success) {
      // 用新库重新加密
      return encrypt.aes(decrypted.data, key)
    }
  }
  catch {
    // 如果新库无法解密，使用旧库解密后重新加密
    const oldDecrypted = oldLibrary.decrypt(oldEncryptedData, key)
    return encrypt.aes(oldDecrypted, key)
  }
}
```

## 获取帮助

### Q: 遇到问题如何获取帮助？

**A:** 获取帮助的途径：

1. **查看文档**：详细阅读 [API 文档](../api/) 和 [指南](../guide/)
2. **查看示例**：参考 [示例代码](../examples/)
3. **GitHub Issues**：在 GitHub 仓库提交问题
4. **社区讨论**：参与社区讨论

### Q: 如何报告安全漏洞？

**A:** 安全漏洞报告：

1. **不要公开披露**：不要在公共场所发布安全问题
2. **私下联系**：通过安全邮箱联系维护者
3. **提供详细信息**：包括复现步骤和影响范围
4. **等待响应**：给维护者时间修复问题

如果您还有其他问题，请查看我们的 [GitHub Issues](https://github.com/ldesign/crypto/issues) 或提交新的问题。
