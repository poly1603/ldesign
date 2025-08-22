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
import { decrypt, encrypt, hash } from '@ldesign/crypto'

// AES 加密
const encrypted = encrypt.aes('Hello World', 'secret-key')
const decrypted = decrypt.aes(encrypted, 'secret-key')

// 哈希
const md5Hash = hash.md5('Hello World')
const sha256Hash = hash.sha256('Hello World')

// Base64 编码
const encoded = encrypt.base64('Hello World')
const decoded = decrypt.base64(encoded)
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

详细文档请访问: [文档地址]

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
