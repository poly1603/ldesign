# @ldesign/crypto

一个全面的加解密库，支持所有主流 JavaScript 框架，并专门为 Vue 3 生态系统提供了深度集成。

## 特性

- 🔐 **全面的加密算法支持**: AES、RSA、MD5、SHA 系列、Base64、HMAC 等
- 🚀 **高性能**: 优化的算法实现，适合生产环境使用
- 🎯 **框架无关**: 可在任何 JavaScript 环境中使用
- 🔧 **Vue 3 深度集成**: 提供 Composition API hooks 和插件
- 📦 **多种构建格式**: ESM、UMD、CommonJS 等
- 🛡️ **TypeScript 支持**: 完整的类型定义
- ✅ **完整测试覆盖**: 单元测试和端到端测试
- 📚 **详细文档**: API 文档和使用示例

## 安装

```bash
# 使用 pnpm
pnpm add @ldesign/crypto

# 使用 npm
npm install @ldesign/crypto

# 使用 yarn
yarn add @ldesign/crypto
```

## 快速开始

### 基础用法

```typescript
import { aes, encoding, hash, hmac } from '@ldesign/crypto'

// AES 加密
const encrypted = aes.encrypt('Hello World', 'secret-key')
console.log(encrypted.success) // true
console.log(encrypted.data) // 加密后的数据
console.log(encrypted.algorithm) // 'AES'
console.log(encrypted.mode) // 'CBC'
console.log(encrypted.keySize) // 256

// AES 解密
const decrypted = aes.decrypt(encrypted, 'secret-key')
console.log(decrypted.success) // true
console.log(decrypted.data) // 'Hello World'

// 哈希（默认 Hex 编码字符串）
const sha256 = hash.sha256('Hello World')
console.log(sha256) // SHA256 哈希值（hex）

// HMAC（单独的 hmac 模块）
const mac = hmac.sha256('Hello World', 'secret-key')
console.log(mac) // HMAC 值（hex）

// Base64 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='

const decoded = encoding.decode(encoded, 'base64')
console.log(decoded) // 'Hello World'
```

### 高级用法

#### 不同密钥长度的 AES 加密

```typescript
import { aes } from '@ldesign/crypto'

// AES-128
const encrypted128 = aes.encrypt('Hello World', 'secret-key', { keySize: 128 })

// AES-192
const encrypted192 = aes.encrypt('Hello World', 'secret-key', { keySize: 192 })

// AES-256 (默认)
const encrypted256 = aes.encrypt('Hello World', 'secret-key', { keySize: 256 })
```

#### 不同加密模式

```typescript
import { aes } from '@ldesign/crypto'

// CBC 模式 (默认)
const cbcEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'CBC' })

// ECB 模式
const ecbEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'ECB' })

// CFB 模式
const cfbEncrypted = aes.encrypt('Hello World', 'secret-key', { mode: 'CFB' })
```

#### 密钥生成

```typescript
import { RandomUtils } from '@ldesign/crypto'

// 生成随机密钥
const key32 = RandomUtils.generateKey(32) // 32字节密钥 (64个十六进制字符)
const key16 = RandomUtils.generateKey(16) // 16字节密钥 (32个十六进制字符)

// 生成随机盐值
const salt = RandomUtils.generateSalt(16)

// 生成随机IV
const iv = RandomUtils.generateIV(16)
```

#### 数据完整性验证

```typescript
import { hmac } from '@ldesign/crypto'

const data = 'Important data'
const secretKey = 'verification-key'

// 生成 HMAC 用于验证数据完整性
const mac = hmac.sha256(data, secretKey)

// 验证数据完整性
const isValid = hmac.verify(data, secretKey, mac, 'SHA256')
console.log(isValid) // true
```

### Vue 3 集成

```typescript
// 使用 Composition API
import { useCrypto, useHash } from '@ldesign/crypto/vue'

export default {
  setup() {
    const { encrypt, decrypt } = useCrypto()
    const { md5, sha256 } = useHash()

    const handleEncrypt = () => {
      const result = encrypt.aes('data', 'key')
      console.log(result)
    }

    return {
      handleEncrypt,
    }
  },
}
```

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// 使用插件
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')

// 在组件中使用
export default {
  mounted() {
    const encrypted = this.$crypto.encrypt.aes('data', 'key')
    console.log(encrypted)
  },
}
```

## 支持的算法

- **对称加密**: AES-128, AES-192, AES-256
- **非对称加密**: RSA
- **哈希算法**: MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512
- **消息认证码**: HMAC-MD5, HMAC-SHA1, HMAC-SHA256
- **编码**: Base64, Hex

## 文档

- 本地文档：在本包目录运行 `pnpm docs:dev` 启动文档站点
- 构建预览：`pnpm docs:build && pnpm docs:preview`

## 示例

查看 `examples/` 目录获取完整的使用示例:

- `examples/vanilla/` - 原生 JavaScript 示例
- `examples/vue/` - Vue 3 集成示例

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 端到端测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
```

## 许可证

MIT License
