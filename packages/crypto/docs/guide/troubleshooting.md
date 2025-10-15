# 故障排查

本指南帮助你诊断和解决使用 @ldesign/crypto 时遇到的常见问题。

## 安装问题

### 安装失败

**问题**：`npm install @ldesign/crypto` 失败

**可能原因和解决方案**：

1. **网络问题**

```bash
# 使用淘宝镜像
npm install @ldesign/crypto --registry=https://registry.npmmirror.com

# 或配置镜像源
npm config set registry https://registry.npmmirror.com
```

2. **Node.js 版本过低**

```bash
# 检查版本
node --version

# 需要 Node.js >= 16.0.0
# 升级 Node.js
nvm install 18
nvm use 18
```

3. **权限问题**

```bash
# 使用 sudo（不推荐）
sudo npm install @ldesign/crypto

# 或修复 npm 权限
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### TypeScript 类型错误

**问题**：找不到类型定义

```typescript
// Error: Could not find a declaration file for module '@ldesign/crypto'
import { aes } from '@ldesign/crypto'
```

**解决方案**：

```json
// tsconfig.json
{
 "compilerOptions": {
  "moduleResolution": "bundler", // 或 "node"
  "types": ["node"]
 }
}
```

## 加密解密问题

### 解密失败

**问题**：`decrypt` 返回 `success: false`

**诊断步骤**：

```typescript
const encrypted = aes.encrypt('data', 'key', { keySize: 256 })
const decrypted = aes.decrypt(encrypted, 'wrong-key')

console.log('Success:', decrypted.success)
console.log('Error:', decrypted.error)
console.log('Algorithm:', decrypted.algorithm)
```

**常见原因**：

1. **密钥不匹配**

```typescript
// 错误
const encrypted = aes.encrypt('data', 'key1')
const decrypted = aes.decrypt(encrypted, 'key2') // 失败

// 正确
const encrypted = aes.encrypt('data', 'key')
const decrypted = aes.decrypt(encrypted, 'key') // 成功
```

2. **IV 丢失或不匹配**

```typescript
// 错误：没有传递 IV
const encrypted = aes.encrypt('data', 'key')
const decrypted = aes.decrypt(
 { data: encrypted.data }, // 缺少 iv
 'key'
) // 失败

// 正确：完整的加密结果
const decrypted = aes.decrypt(encrypted, 'key') // 成功
```

3. **算法参数不一致**

```typescript
// 错误：keySize 不同
const encrypted = aes.encrypt('data', 'key', { keySize: 256 })
const decrypted = aes.decrypt(encrypted, 'key', { keySize: 128 }) // 失败

// 正确：使用相同参数（或不指定，自动匹配）
const decrypted = aes.decrypt(encrypted, 'key') // 成功
```

4. **数据损坏**

```typescript
// 检查数据完整性
import { ValidationUtils } from '@ldesign/crypto'

if (encrypted.data && ValidationUtils.isValidBase64(encrypted.data)) {
 // 数据格式正确
} else {
 console.error('Data corrupted')
}
```

### 加密结果为空

**问题**：`encrypt` 返回 `success: true` 但 `data` 为空

**诊断**：

```typescript
const result = aes.encrypt('', 'key') // 空字符串
console.log('Success:', result.success)
console.log('Data:', result.data)
console.log('Has data:', !!result.data)
```

**解决方案**：

```typescript
// 验证输入
function safeEncrypt(data: string, key: string) {
 if (!data) {
  throw new Error('Data cannot be empty')
 }

 if (!key) {
  throw new Error('Key cannot be empty')
 }

 return aes.encrypt(data, key)
}
```

### RSA 加密大数据失败

**问题**：RSA 加密大文本失败

```typescript
const largeData = 'very large text...'.repeat(1000)
const result = rsa.encrypt(largeData, publicKey)
// Error: Data too large
```

**解决方案**：使用混合加密

```typescript
import { aes, rsa, RandomUtils } from '@ldesign/crypto'

// 1. 生成临时 AES 密钥
const aesKey = RandomUtils.generateKey(32)

// 2. 用 AES 加密大数据
const encryptedData = aes.encrypt(largeData, aesKey)

// 3. 用 RSA 加密 AES 密钥
const encryptedKey = rsa.encrypt(aesKey, publicKey)

// 传输两者
const package = {
 data: encryptedData,
 key: encryptedKey
}
```

## 性能问题

### 加密速度慢

**问题**：加密操作耗时过长

**诊断**：

```typescript
console.time('encrypt')
const result = aes.encrypt('data', 'key')
console.timeEnd('encrypt')

// 检查性能指标
const metrics = cryptoManager.getPerformanceMetrics()
console.log('Average latency:', metrics.averageLatency, 'ms')
console.log('Ops/sec:', metrics.operationsPerSecond)
```

**解决方案**：

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
// 慢：逐个处理
for (const item of items) {
 aes.encrypt(item, 'key')
}

// 快：批量处理
const operations = items.map((item, i) => ({
 id: String(i),
 data: item,
 key: 'key',
 algorithm: 'AES' as const
}))
const results = await cryptoManager.batchEncrypt(operations)
```

3. **使用更快的算法**

```typescript
// AES-256 -> AES-128（更快但稍弱）
const fast = aes.encrypt('data', 'key', { keySize: 128 })
```

### 内存占用过高

**问题**：应用内存持续增长

**诊断**：

```typescript
// 检查缓存大小
const stats = cryptoManager.getCacheStats()
console.log('Cache size:', stats.size)
console.log('Memory usage:', metrics.memoryUsage / 1024 / 1024, 'MB')
```

**解决方案**：

1. **定期清理缓存**

```typescript
// 每小时清理一次
setInterval(() => {
 const cleaned = cryptoManager.cleanupCache()
 console.log(`Cleaned ${cleaned} items`)
}, 3600000)
```

2. **限制缓存大小**

```typescript
const optimizer = new PerformanceOptimizer({
 maxCacheSize: 500, // 减少缓存大小
 cacheTTL: 2 * 60 * 1000 // 2分钟过期
})
```

3. **处理完成后清空**

```typescript
async function processBatch(data: string[]) {
 // 处理数据
 await batchProcess(data)

 // 清空缓存
 cryptoManager.clearCache()
}
```

### 密钥派生慢

**问题**：`deriveKey` 耗时很长

```typescript
console.time('derive')
const derived = deriveKey('password', 'salt', {
 iterations: 100000 // 很慢
})
console.timeEnd('derive') // 可能 >1秒
```

**解决方案**：

1. **利用缓存**（自动）

```typescript
// 第一次慢
const key1 = deriveKey('password', 'salt', { iterations: 100000 })

// 第二次快（从缓存，2.11x 加速）
const key2 = deriveKey('password', 'salt', { iterations: 100000 })
```

2. **预计算**

```typescript
// 应用启动时预计算
const derivedKeys = new Map()

async function precomputeKeys() {
 const commonPasswords = ['user1', 'user2']

 for (const password of commonPasswords) {
  const key = deriveKey(password, 'salt', { iterations: 100000 })
  derivedKeys.set(password, key)
 }
}
```

3. **降低迭代次数**（不推荐）

```typescript
// 较快但安全性降低
const key = deriveKey('password', 'salt', {
 iterations: 10000 // 更快但不太安全
})
```

## Vue 集成问题

### 插件未正确注册

**问题**：`this.$crypto` 未定义

```javascript
// Error: Cannot read property '$crypto' of undefined
export default {
 mounted() {
  console.log(this.$crypto) // undefined
 }
}
```

**解决方案**：

```typescript
// main.ts - 确保正确注册插件
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'

const app = createApp(App)
app.use(CryptoPlugin) // 必须在 mount 之前
app.mount('#app')
```

### 组合式函数不工作

**问题**：`useEncryption` 返回错误

```vue
<script setup>
// Error: useEncryption is not a function
import { useEncryption } from '@ldesign/crypto' // 错误的导入路径
</script>
```

**解决方案**：

```vue
<script setup>
// 正确：从 /vue 导入
import { useEncryption } from '@ldesign/crypto/vue'

const { encryptText, decryptText } = useEncryption()
</script>
```

### SSR 报错

**问题**：服务端渲染时报错

```
ReferenceError: window is not defined
```

**解决方案**：

```vue
<script setup>
import { onMounted } from 'vue'
import { useEncryption } from '@ldesign/crypto/vue'

const encryption = useEncryption()

// 只在客户端执行
onMounted(() => {
 // 浏览器环境下的加密操作
 encryption.encryptText('data', 'key')
})
</script>
```

或使用条件导入：

```vue
<script setup>
import { ref } from 'vue'

const crypto = ref(null)

if (typeof window !== 'undefined') {
 // 只在客户端导入
 import('@ldesign/crypto/vue').then(module => {
  crypto.value = module
 })
}
</script>
```

## 构建问题

### Vite 构建错误

**问题**：`Build failed` with crypto module

**解决方案**：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
 optimizeDeps: {
  include: ['@ldesign/crypto']
 },

 build: {
  commonjsOptions: {
   include: [/crypto/, /node_modules/]
  }
 }
})
```

### Webpack 打包问题

**问题**：模块解析错误

**解决方案**：

```javascript
// webpack.config.js
module.exports = {
 resolve: {
  extensions: ['.ts', '.js', '.json'],
  alias: {
   '@ldesign/crypto': require.resolve('@ldesign/crypto')
  }
 }
}
```

## 浏览器兼容性

### IE11 不支持

**问题**：在 IE11 中报错

**解决方案**：@ldesign/crypto 不支持 IE11。建议使用现代浏览器或提示用户升级。

```javascript
// 检测浏览器
if (typeof Symbol === 'undefined' || typeof Promise === 'undefined') {
 alert('请使用现代浏览器（Chrome、Firefox、Edge、Safari）')
}
```

### Safari 私有模式问题

**问题**：Safari 私有模式下 localStorage 不可用

**解决方案**：

```typescript
function isStorageAvailable() {
 try {
  const test = '__storage_test__'
  localStorage.setItem(test, test)
  localStorage.removeItem(test)
  return true
 } catch (e) {
  return false
 }
}

// 使用
if (isStorageAvailable()) {
 // 使用 SecureStorage
} else {
 // 使用内存存储
 const memoryStorage = new Map()
}
```

## 调试技巧

### 启用调试日志

```typescript
import { CryptoManager } from '@ldesign/crypto'

const manager = new CryptoManager({
 debug: true,
 logLevel: 'debug' // 'error' | 'warn' | 'info' | 'debug'
})

// 查看详细日志
manager.encrypt('data', 'key', 'AES')
```

### 检查加密结果

```typescript
const result = aes.encrypt('data', 'key')

console.log('Success:', result.success)
console.log('Data:', result.data)
console.log('IV:', result.iv)
console.log('Algorithm:', result.algorithm)
console.log('Mode:', result.mode)
console.log('KeySize:', result.keySize)

if (!result.success) {
 console.error('Error:', result.error)
}
```

### 性能分析

```typescript
// 测量单个操作
console.time('encrypt')
const result = aes.encrypt('data', 'key')
console.timeEnd('encrypt')

// 批量性能测试
console.time('batch')
for (let i = 0; i < 1000; i++) {
 aes.encrypt(`data${i}`, 'key')
}
console.timeEnd('batch')

// 查看缓存统计
const stats = cryptoManager.getCacheStats()
console.table(stats)
```

### 网络调试

```typescript
// 拦截和记录加密操作
const originalEncrypt = aes.encrypt

aes.encrypt = function(...args) {
 console.log('Encrypting:', args[0].substring(0, 20))
 const result = originalEncrypt.apply(this, args)
 console.log('Result:', result.success)
 return result
}
```

## 常见错误代码

### 错误码表

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `ENCRYPTION_ERROR` | 加密失败 | 检查密钥和数据 |
| `DECRYPTION_ERROR` | 解密失败 | 验证密钥、IV 和算法参数 |
| `INVALID_KEY` | 密钥无效 | 使用正确长度的密钥 |
| `INVALID_IV` | IV 无效 | 使用正确长度的 IV |
| `INVALID_DATA` | 数据无效 | 检查数据格式 |
| `ALGORITHM_NOT_SUPPORTED` | 不支持的算法 | 使用支持的算法 |

## 获取帮助

如果问题仍未解决：

1. **查看文档**

  - [快速开始](/guide/quick-start)
  - [API 参考](/api/)
  - [常见问题](/guide/faq)

2. **搜索已知问题**

  - [GitHub Issues](https://github.com/ldesign/crypto/issues)
  - [讨论区](https://github.com/ldesign/crypto/discussions)

3. **提交问题**

提交 Issue 时请包含：

```markdown
## 问题描述
简要描述问题

## 重现步骤
1. 步骤 1
2. 步骤 2
3. ...

## 期望行为
应该发生什么

## 实际行为
实际发生什么

## 环境信息
- @ldesign/crypto 版本：
- Node.js 版本：
- 浏览器版本：
- 操作系统：

## 最小可复现示例
```javascript
// 你的代码
```
```

4. **社区帮助**

  - [Stack Overflow](https://stackoverflow.com/questions/tagged/ldesign-crypto)
  - [Discord 社区](https://discord.gg/ldesign)

## 预防措施

### 最佳实践检查清单

- [ ] 使用推荐的算法和密钥长度
- [ ] 每次加密使用新的 IV
- [ ] 密钥安全存储
- [ ] 完整的错误处理
- [ ] 定期更新依赖
- [ ] 启用性能监控
- [ ] 编写单元测试
- [ ] 代码审查

### 测试建议

```typescript
// 编写测试确保功能正常
import { describe, it, expect } from 'vitest'
import { aes } from '@ldesign/crypto'

describe('AES Encryption', () => {
 it('should encrypt and decrypt', () => {
  const data = 'test data'
  const key = 'test-key'

  const encrypted = aes.encrypt(data, key)
  expect(encrypted.success).toBe(true)

  const decrypted = aes.decrypt(encrypted, key)
  expect(decrypted.success).toBe(true)
  expect(decrypted.data).toBe(data)
 })
})
```

## 下一步

- [常见问题](/guide/faq) - 查看常见问题
- [安全性](/guide/security) - 了解安全最佳实践
- [性能优化](/guide/performance) - 提升性能
