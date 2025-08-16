# 故障排除指南

本指南帮助您解决使用 @ldesign/crypto 时可能遇到的常见问题。

## 安装问题

### 问题：npm 安装失败

**症状：**

```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案：**

1. 清理 npm 缓存：

   ```bash
   npm cache clean --force
   ```

2. 删除 node_modules 和 package-lock.json：

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. 使用 --legacy-peer-deps 标志：
   ```bash
   npm install @ldesign/crypto --legacy-peer-deps
   ```

### 问题：TypeScript 类型错误

**症状：**

```typescript
Cannot find module '@ldesign/crypto' or its corresponding type declarations.
```

**解决方案：**

1. 确保安装了 TypeScript：

   ```bash
   npm install -D typescript
   ```

2. 检查 tsconfig.json 配置：

   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

3. 重启 TypeScript 服务器（VS Code 中按 Ctrl+Shift+P，选择 "TypeScript: Restart TS Server"）

## 加密/解密问题

### 问题：解密失败，返回空字符串

**症状：**

```typescript
const decrypted = aes.decrypt(encrypted, key)
console.log(decrypted.data) // 输出空字符串或 undefined
```

**可能原因和解决方案：**

1. **密钥不匹配**

   ```typescript
   // 错误：使用不同的密钥
   const encrypted = aes.encrypt('data', 'key1')
   const decrypted = aes.decrypt(encrypted.data, 'key2') // 失败

   // 正确：使用相同的密钥
   const encrypted = aes.encrypt('data', 'key1')
   const decrypted = aes.decrypt(encrypted.data, 'key1') // 成功
   ```

2. **加密参数不一致**

   ```typescript
   // 错误：加密和解密使用不同的参数
   const encrypted = aes.encrypt('data', 'key', { keySize: 256, mode: 'CBC' })
   const decrypted = aes.decrypt(encrypted.data, 'key', { keySize: 128, mode: 'ECB' })

   // 正确：使用相同的参数
   const options = { keySize: 256, mode: 'CBC' }
   const encrypted = aes.encrypt('data', 'key', options)
   const decrypted = aes.decrypt(encrypted.data, 'key', options)
   ```

3. **缺少 IV（初始化向量）**

   ```typescript
   // 错误：没有传递 IV
   const encrypted = aes.encrypt('data', 'key', { mode: 'CBC' })
   const decrypted = aes.decrypt(encrypted.data, 'key', { mode: 'CBC' })

   // 正确：传递 IV
   const encrypted = aes.encrypt('data', 'key', { mode: 'CBC' })
   const decrypted = aes.decrypt(encrypted.data, 'key', {
     mode: 'CBC',
     iv: encrypted.iv,
   })
   ```

### 问题：RSA 加密失败

**症状：**

```typescript
const encrypted = rsa.encrypt(data, publicKey)
console.log(encrypted.success) // false
```

**可能原因和解决方案：**

1. **数据过大**

   ```typescript
   // RSA 只能加密小量数据（通常小于密钥长度）
   const largeData = 'x'.repeat(1000) // 太大

   // 解决方案：使用混合加密
   const aesKey = keyGenerator.generateKey(32)
   const encryptedData = aes.encrypt(largeData, aesKey)
   const encryptedKey = rsa.encrypt(aesKey, publicKey)
   ```

2. **密钥格式错误**

   ```typescript
   // 确保使用正确的 PEM 格式
   const publicKey = `-----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
   -----END PUBLIC KEY-----`
   ```

3. **密钥长度不足**
   ```typescript
   // 使用至少 2048 位的密钥
   const keyPair = keyGenerator.generateRSAKeyPair(2048)
   ```

## 哈希问题

### 问题：哈希结果不一致

**症状：**

```typescript
const hash1 = hash.sha256('data')
const hash2 = hash.sha256('data')
console.log(hash1 === hash2) // 应该是 true，但可能是 false
```

**可能原因和解决方案：**

1. **输入数据编码问题**

   ```typescript
   // 确保输入数据的编码一致
   const data = 'Hello, 世界!'
   const hash1 = hash.sha256(data)
   const hash2 = hash.sha256(data) // 应该相同
   ```

2. **使用了不同的哈希选项**
   ```typescript
   // 检查是否使用了不同的选项
   const hash1 = hash.sha256('data', { encoding: 'hex' })
   const hash2 = hash.sha256('data', { encoding: 'base64' })
   // 这两个结果会不同
   ```

## Vue 集成问题

### 问题：Vue 插件注册失败

**症状：**

```typescript
app.use(CryptoPlugin) // 报错
```

**解决方案：**

1. 检查导入路径：

   ```typescript
   // 正确的导入方式
   import { CryptoPlugin } from '@ldesign/crypto/vue'
   ```

2. 确保 Vue 版本兼容（需要 Vue 3.0+）：
   ```bash
   npm list vue
   ```

### 问题：Composition API Hook 不可用

**症状：**

```typescript
import { useCrypto } from '@ldesign/crypto/vue'
// TypeError: useCrypto is not a function
```

**解决方案：**

1. 确保插件已正确注册：

   ```typescript
   app.use(CryptoPlugin, {
     registerComposables: true, // 确保这个选项为 true
   })
   ```

2. 检查导入路径：
   ```typescript
   import { useCrypto } from '@ldesign/crypto/vue'
   ```

## 性能问题

### 问题：加密操作很慢

**症状：** 大量数据加密时应用卡顿或响应缓慢。

**解决方案：**

1. **启用缓存**

   ```typescript
   import { cryptoManager } from '@ldesign/crypto'

   cryptoManager.configure({
     enableCache: true,
     maxCacheSize: 1000,
   })
   ```

2. **使用批量处理**

   ```typescript
   import { PerformanceOptimizer } from '@ldesign/crypto'

   const optimizer = new PerformanceOptimizer()
   const results = await optimizer.processBatch(operations)
   ```

3. **使用 Web Worker**

   ```typescript
   // 将加密操作移到 Web Worker 中
   const worker = new Worker('/crypto-worker.js')
   worker.postMessage({ type: 'encrypt', data, key })
   ```

4. **分块处理大文件**
   ```typescript
   function encryptLargeData(data: string, key: string) {
     const chunkSize = 64 * 1024 // 64KB
     const chunks = []

     for (let i = 0; i < data.length; i += chunkSize) {
       const chunk = data.slice(i, i + chunkSize)
       chunks.push(aes.encrypt(chunk, key))
     }

     return chunks
   }
   ```

### 问题：内存使用过高

**症状：** 应用内存使用持续增长，可能导致内存泄漏。

**解决方案：**

1. **清理缓存**

   ```typescript
   // 定期清理缓存
   setInterval(() => {
     cryptoManager.clearCache()
   }, 300000) // 每5分钟清理一次
   ```

2. **限制缓存大小**

   ```typescript
   cryptoManager.configure({
     maxCacheSize: 100, // 减少缓存大小
     cacheTimeout: 60000, // 1分钟超时
   })
   ```

3. **及时清理敏感数据**

   ```typescript
   let sensitiveData = 'secret information'
   const encrypted = aes.encrypt(sensitiveData, key)

   // 清理原始数据
   sensitiveData = null
   ```

## 浏览器兼容性问题

### 问题：在旧浏览器中不工作

**症状：** 在 IE 或旧版本浏览器中出现错误。

**解决方案：**

1. **添加 polyfill**

   ```bash
   npm install core-js
   ```

   ```typescript
   // 在应用入口添加
   import 'core-js/stable'
   ```

2. **检查浏览器支持**

   ```typescript
   function checkBrowserSupport() {
     if (!window.crypto || !window.crypto.subtle) {
       throw new Error('浏览器不支持 Web Crypto API')
     }
   }

   checkBrowserSupport()
   ```

3. **使用 Babel 转译**
   ```json
   // .babelrc
   {
     "presets": [
       [
         "@babel/preset-env",
         {
           "targets": {
             "browsers": ["last 2 versions", "ie >= 11"]
           }
         }
       ]
     ]
   }
   ```

## 调试技巧

### 启用调试模式

```typescript
import { cryptoManager } from '@ldesign/crypto'

cryptoManager.configure({
  debug: true,
  logLevel: 'debug',
})
```

### 检查操作结果

```typescript
const result = aes.encrypt('data', 'key')

console.log('加密结果:', {
  success: result.success,
  data: result.data,
  error: result.error,
  algorithm: result.algorithm,
  iv: result.iv,
})
```

### 验证输入参数

```typescript
import { ValidationUtils } from '@ldesign/crypto'

function validateInputs(data: string, key: string) {
  if (!data || typeof data !== 'string') {
    throw new Error('数据必须是非空字符串')
  }

  if (!key || typeof key !== 'string') {
    throw new Error('密钥必须是非空字符串')
  }

  if (!ValidationUtils.validateAESKeyLength(key, 256)) {
    console.warn('密钥长度可能不适合 AES-256')
  }
}
```

## 获取帮助

如果以上解决方案都无法解决您的问题，请：

1. **查看示例代码**

   - 参考 [examples](../../examples/) 目录中的示例项目
   - 查看 [实战教程](../tutorials/practical-examples.md)

2. **检查版本兼容性**

   ```bash
   npm list @ldesign/crypto
   ```

3. **提交 Issue**

   - 访问 [GitHub Issues](https://github.com/ldesign/crypto/issues)
   - 提供详细的错误信息和复现步骤
   - 包含您的环境信息（Node.js 版本、浏览器版本等）

4. **查看更新日志**
   - 检查 [CHANGELOG.md](../../CHANGELOG.md) 了解最新变更
   - 确保使用最新版本

## 常见错误代码

| 错误代码   | 描述             | 解决方案                     |
| ---------- | ---------------- | ---------------------------- |
| CRYPTO_001 | 密钥长度无效     | 检查密钥长度是否符合算法要求 |
| CRYPTO_002 | 加密数据格式错误 | 确保输入数据为有效字符串     |
| CRYPTO_003 | 解密失败         | 检查密钥和参数是否正确       |
| CRYPTO_004 | 不支持的算法     | 使用支持的算法名称           |
| CRYPTO_005 | 浏览器不支持     | 添加 polyfill 或升级浏览器   |

记住，大多数问题都是由于参数不匹配或配置错误引起的。仔细检查您的代码，确保加密和解密使用相同的参数。
