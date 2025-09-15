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

## 导出结构

- ESM（推荐）
  - 命名导出：
    ```ts path=null start=null
    import { aes, rsa, hash, hmac, encoding } from '@ldesign/crypto'
    ```
  - 命名空间导入：
    ```ts path=null start=null
    import * as LDesignCrypto from '@ldesign/crypto'
    // 例如：LDesignCrypto.aes.encrypt('data', 'key')
    ```
- CommonJS（需要在 CJS 环境）
  ```js path=null start=null
  const Crypto = require('@ldesign/crypto')
  const result = Crypto.aes.encrypt('data', 'key')
  ```

## API 总览

- AES（对称加密）
  - `aes.encrypt(data, key, options?)` → `{ success, data?, iv?, algorithm, mode, keySize, error? }`
  - `aes.decrypt(input, key, options?)` → `{ success, data?, error? }`
  - 便捷方法：`aes128/aes192/aes256`（对应 keySize 128/192/256）
  - 常用可选项：`{ keySize?: 128|192|256, mode?: 'CBC'|'ECB'|'CFB'|'OFB'|'CTR', iv?: string }`
- RSA（非对称加密）
  - `rsa.generateKeyPair(bits = 2048)` → `{ publicKey, privateKey }`
  - `rsa.encrypt(data, publicKey, options?)` / `rsa.decrypt(input, privateKey, options?)`
  - 常用可选项：`{ padding?: 'OAEP'|'PKCS1', hashAlgorithm?: 'SHA256'|'SHA1' }`
- Hash（哈希）
  - `hash.md5/sha1/sha224/sha256/sha384/sha512(data, { encoding?: 'hex'|'base64' } = { encoding:'hex' })`
  - `hash.verify(data, expected, algorithm)` 常数时间比较
- HMAC（消息认证码）
  - `hmac.md5/sha1/sha256/sha384/sha512(message, key, { encoding?: 'hex'|'base64' })`
  - `hmac.verify(message, key, mac, 'SHA256' | ... )`
- 编码
  - `encoding.encode(text, 'base64' | 'hex')` / `encoding.decode(text, 'base64' | 'hex')`
  - 便捷：`encrypt.base64/base64Url/hex`，`decrypt.base64/base64Url/hex`（如在示例中所示）
- 随机/密钥工具（名称视导出可能为 keyGenerator 或 RandomUtils）
  - `generateKey(lengthBytes)`、`generateIV(lengthBytes)`、`generateSalt(lengthBytes)`
- 数字签名
  - `digitalSignature.sign(data, privateKey, 'SHA256' | ... )`
  - `digitalSignature.verify(data, signature, publicKey, 'SHA256' | ... )`
- 统一管理器（如有暴露）
  - `cryptoManager.batchEncrypt(ops)` / `cryptoManager.batchDecrypt(ops)`（批量与并行）

> 注：以上为概要，具体入参与返回结构请以源码与类型声明为准。

## 安全建议（强烈推荐阅读）

- 算法选择
  - 避免在生产使用 ECB；首选 AES-256（CBC/CTR）与 RSA-OAEP + SHA-256
  - 避免将 MD5/SHA-1 用于安全场景；首选 SHA-256/384/512
- IV/Nonce
  - CBC/CTR/CFB/OFB 等模式请每次加密使用新的随机 IV，不要复用
  - IV 可公开存储，但必须与对应密文绑定
- 密钥管理
  - 不要在代码中硬编码密钥；通过安全存储或环境变量注入
  - 使用足够长度与熵的密钥；定期轮换
- 完整性与认证
  - 对敏感数据同时使用 HMAC 进行完整性校验或采用 AEAD（若后续提供）
  - 比较摘要/签名时使用常数时间比较（库已提供 verify）
- 编码误区
  - Base64/Hex 仅是编码，不提供安全性
- 其他
  - 处理失败（success=false 或抛错）时不要泄漏过多错误细节
  - 注意浏览器与 Node 环境差异，必要时使用 polyfill/降级实现

## 常见问题（FAQ）

- 解密失败常见原因？
  - 密钥错误、IV 不匹配、加密模式/参数不一致、密文被截断/篡改
- 如何在前端页面安全使用？
  - 避免在客户端存储长期有效的密钥；必要时使用临时密钥与后端协商
  - 文档中的交互示例在 SSR 中已移除/静态化，避免构建报错
- 为什么我的哈希值与其他工具不同？
  - 请核对输入是否包含空白/编码差异，以及输出编码（hex/base64）是否一致
- RSA 能加密大数据吗？
  - 不适合。请使用“混合加密”（RSA 加密对称密钥，对称密钥加密大数据）

## 变更日志

请查看根目录的 [CHANGELOG.md](./CHANGELOG.md)。

## 许可证

MIT License
