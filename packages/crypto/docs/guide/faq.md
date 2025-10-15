# 常见问题

本文档收集了使用 @ldesign/crypto 时的常见问题和解答。

## 安装和配置

### 如何安装 @ldesign/crypto？

```bash
# 使用 pnpm
pnpm add @ldesign/crypto

# 使用 npm
npm install @ldesign/crypto

# 使用 yarn
yarn add @ldesign/crypto
```

### 支持哪些 Node.js 版本？

@ldesign/crypto 需要 Node.js >= 16.0.0。

### 支持哪些浏览器？

支持所有支持 ES 模块的现代浏览器：

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### 如何在 TypeScript 项目中使用？

库自带完整的 TypeScript 类型定义，直接导入即可：

```typescript
import { aes, hash } from '@ldesign/crypto'
import type { EncryptResult, DecryptResult } from '@ldesign/crypto'
```

## 加密和解密

### 为什么解密失败？

常见原因：

1. **密钥错误**：确保使用相同的密钥
2. **IV 不匹配**：解密时需要使用加密时的 IV
3. **算法参数不一致**：keySize、mode 等必须相同
4. **数据损坏**：加密数据被截断或篡改

```typescript
// 正确示例
const encrypted = aes.encrypt('data', 'key', { keySize: 256, mode: 'CBC' })
const decrypted = aes.decrypt(encrypted, 'key') // 自动使用相同参数
```

### 如何选择加密算法？

- **对称加密**：推荐 AES-256-CBC 或 AES-256-GCM
- **非对称加密**：推荐 RSA-2048 或 RSA-4096
- **哈希**：推荐 SHA-256 或 SHA-512
- **避免**：DES、3DES、MD5、SHA-1（已不安全）

### AES-128、AES-192 和 AES-256 有什么区别？

主要区别是密钥长度和安全性：

- **AES-128**：128位密钥，速度最快，安全性足够
- **AES-192**：192位密钥，平衡性能和安全
- **AES-256**：256位密钥，最高安全性（推荐）

```typescript
const encrypted128 = aes.encrypt('data', 'key', { keySize: 128 })
const encrypted256 = aes.encrypt('data', 'key', { keySize: 256 })
```

### 什么是 IV？为什么需要它？

IV（初始化向量）是加密时使用的随机值，确保相同的明文在不同加密时产生不同的密文。

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 每次加密使用新的 IV
const iv = RandomUtils.generateIV(16)
const encrypted = aes.encrypt('data', 'key', { iv })
```

**重要**：不要重复使用相同的 IV！

### 如何加密大文件？

使用流式加密：

```typescript
import { encryptFile } from '@ldesign/crypto'

await encryptFile('large-file.txt', 'output.enc', 'key', {
 algorithm: 'aes',
 chunkSize: 64 * 1024, // 64KB
 onProgress: (progress) => console.log(`${progress.percentage}%`)
})
```

### RSA 可以加密大数据吗？

不建议。RSA 适合加密小量数据（如密钥）。对于大数据，使用混合加密：

```typescript
import { aes, rsa, RandomUtils } from '@ldesign/crypto'

// 1. 生成随机 AES 密钥
const aesKey = RandomUtils.generateKey(32)

// 2. 用 AES 加密数据
const encryptedData = aes.encrypt(largeData, aesKey)

// 3. 用 RSA 加密 AES 密钥
const encryptedKey = rsa.encrypt(aesKey, publicKey)

// 传输 encryptedData 和 encryptedKey
```

## 哈希和签名

### 哈希和加密有什么区别？

- **哈希**：单向函数，不可逆，用于数据指纹
- **加密**：双向函数，可逆，用于保护数据机密性

```typescript
// 哈希（不可逆）
const hash = hash.sha256('password') // 无法从哈希还原密码

// 加密（可逆）
const encrypted = aes.encrypt('data', 'key')
const decrypted = aes.decrypt(encrypted, 'key') // 可以还原数据
```

### 如何验证数据完整性？

使用 HMAC 或哈希：

```typescript
import { hmac } from '@ldesign/crypto'

// 生成 HMAC
const data = 'important data'
const mac = hmac.sha256(data, 'secret-key')

// 验证
const isValid = hmac.verify(data, 'secret-key', mac, 'SHA256')
```

### 数字签名和 HMAC 有什么区别？

- **HMAC**：对称密钥，发送方和接收方共享密钥
- **数字签名**：非对称密钥，私钥签名、公钥验证

```typescript
// HMAC（对称）
const mac = hmac.sha256('data', 'shared-key')

// 数字签名（非对称）
const signature = digitalSignature.sign('data', privateKey, 'SHA256')
const isValid = digitalSignature.verify('data', signature, publicKey, 'SHA256')
```

## 性能问题

### 如何提高加密性能？

1. **启用缓存**

```typescript
import { CryptoManager } from '@ldesign/crypto'

const manager = new CryptoManager({
 enableCache: true,
 maxCacheSize: 1000
})
```

2. **批量处理**

```typescript
const operations = items.map((item, index) => ({
 id: String(index),
 data: item,
 key: 'key',
 algorithm: 'AES' as const
}))

const results = await cryptoManager.batchEncrypt(operations)
```

3. **使用 Worker 线程**

```typescript
import { getGlobalWorkerPool } from '@ldesign/crypto'

const pool = getGlobalWorkerPool({ maxWorkers: 4 })
const result = await pool.execute({
 type: 'encrypt',
 algorithm: 'aes',
 data: 'data',
 key: 'key'
})
```

### 缓存如何工作？

库使用 LRU（最近最少使用）缓存机制，自动缓存加密结果：

```typescript
// 第一次调用（慢）
const result1 = aes.encrypt('data', 'key')

// 第二次调用相同参数（快，从缓存）
const result2 = aes.encrypt('data', 'key')

// 查看缓存统计
const stats = cryptoManager.getCacheStats()
console.log('缓存命中率:', stats.hitRate)
```

### 密钥派生很慢怎么办？

密钥派生（PBKDF2）是故意设计得慢，以防止暴力破解。但可以缓存结果：

```typescript
// 第一次调用慢
const derived1 = deriveKey('password', 'salt', { iterations: 100000 })

// 第二次相同参数快（从缓存，2.11x 加速）
const derived2 = deriveKey('password', 'salt', { iterations: 100000 })
```

## Vue 集成

### 如何在 Vue 3 中使用？

安装插件：

```typescript
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')
```

使用组合式函数：

```vue
<script setup>
import { useEncryption } from '@ldesign/crypto/vue'

const { encryptText, decryptText } = useEncryption()
</script>
```

### 可以在 Vue 2 中使用吗？

@ldesign/crypto 核心功能支持 Vue 2，但 Vue 插件和组合式函数仅支持 Vue 3。

Vue 2 项目中直接使用核心 API：

```javascript
import { aes, hash } from '@ldesign/crypto'

export default {
 methods: {
  handleEncrypt() {
   const result = aes.encrypt('data', 'key')
   console.log(result)
  }
 }
}
```

## 错误处理

### 为什么会报 "Invalid Base64 format" 错误？

可能原因：

1. 数据不是有效的 Base64 格式
2. 数据被截断或损坏
3. 编码类型不匹配

```typescript
// 验证 Base64 格式
import { ValidationUtils } from '@ldesign/crypto'

if (ValidationUtils.isValidBase64(data)) {
 const decoded = encoding.base64.decode(data)
} else {
 console.error('Invalid Base64 data')
}
```

### 如何调试加密问题？

启用调试模式：

```typescript
import { CryptoManager } from '@ldesign/crypto'

const manager = new CryptoManager({
 debug: true,
 logLevel: 'debug'
})
```

查看详细错误信息：

```typescript
const result = aes.encrypt('data', 'key')

if (!result.success) {
 console.error('Error:', result.error)
 console.error('Algorithm:', result.algorithm)
}
```

## 安全问题

### 密钥应该存储在哪里？

**不要**：

- 硬编码在代码中
- 提交到 Git
- 存储在前端 localStorage（未加密）

**推荐**：

- 环境变量
- 密钥管理服务（AWS Secrets Manager、Google Secret Manager）
- 加密存储

```typescript
// 使用环境变量
const key = import.meta.env.VITE_ENCRYPTION_KEY

// 或使用加密存储
import { SecureStorage } from '@ldesign/crypto'
const storage = new SecureStorage({ key: 'master-key' })
storage.set('encryption-key', key)
```

### 前端加密安全吗？

前端加密可以保护传输中的数据，但有限制：

- 密钥管理困难
- 容易被逆向工程
- 不能完全信任客户端

**最佳实践**：

- 前端加密 + 后端加密（双重保护）
- 敏感操作在后端执行
- 使用 HTTPS

### 如何防止密钥泄露？

1. **不要在客户端存储长期密钥**
2. **使用会话密钥**
3. **定期轮换密钥**
4. **监控异常访问**

```typescript
// 使用临时会话密钥
const sessionKey = RandomUtils.generateKey(32)
// 使用完毕后清除
sessionKey = null
```

## 兼容性

### 在 Node.js 中使用？

完全支持：

```javascript
const { aes, hash } = require('@ldesign/crypto')

const encrypted = aes.encrypt('data', 'key')
```

### 在 React 中使用？

核心功能完全支持：

```jsx
import { useState } from 'react'
import { aes } from '@ldesign/crypto'

function CryptoComponent() {
 const [encrypted, setEncrypted] = useState('')

 const handleEncrypt = () => {
  const result = aes.encrypt('data', 'key')
  setEncrypted(result.data)
 }

 return <button onClick={handleEncrypt}>Encrypt</button>
}
```

### 支持 SSR（服务端渲染）吗？

完全支持。库在 Node.js 和浏览器环境都能正常工作。

## 更新和迁移

### 如何升级到最新版本？

```bash
# 查看当前版本
npm list @ldesign/crypto

# 升级到最新版本
npm update @ldesign/crypto

# 或指定版本
npm install @ldesign/crypto@latest
```

### 版本之间兼容吗？

- **主版本**（1.x -> 2.x）：可能有破坏性变更
- **次版本**（1.0 -> 1.1）：向后兼容，新功能
- **补丁版本**（1.0.0 -> 1.0.1）：向后兼容，bug 修复

查看 [CHANGELOG.md](../../CHANGELOG.md) 了解详细变更。

## 其他问题

### 如何贡献代码？

1. Fork 仓库
2. 创建功能分支
3. 编写测试
4. 提交 Pull Request

详见 [贡献指南](../../CONTRIBUTING.md)。

### 如何报告 bug？

在 [GitHub Issues](https://github.com/ldesign/crypto/issues) 提交，包含：

- 问题描述
- 重现步骤
- 环境信息（Node.js 版本、浏览器等）
- 最小可复现示例

### 有商业支持吗？

目前是开源项目，社区支持。企业级支持请联系维护团队。

### 性能如何？

- **密钥派生缓存**：2.11x 加速
- **批量处理**：3-5x 加速
- **LRU 缓存**：10-100x 加速（命中时）
- **440+ 测试用例**
- **80%+ 代码覆盖率**

详见 [性能优化指南](/guide/performance)。

### 开源许可是什么？

MIT License - 可自由用于商业和个人项目。

## 获取帮助

- **文档**：查看完整的 [使用指南](/guide/)
- **示例**：查看 [examples 目录](../../examples/)
- **问题**：提交 [GitHub Issue](https://github.com/ldesign/crypto/issues)
- **讨论**：加入 [社区讨论](https://github.com/ldesign/crypto/discussions)

## 下一步

- [快速开始](/guide/quick-start) - 开始使用
- [API 参考](/api/) - 查看完整 API
- [故障排查](/guide/troubleshooting) - 解决问题
