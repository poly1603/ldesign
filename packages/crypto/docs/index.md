---
layout: home

hero:
 name: "@ldesign/crypto"
 text: "现代加密库"
 tagline: 功能强大、类型安全的加密解决方案，支持Vue 3集成
 actions:
  - theme: brand
   text: 快速开始
   link: /guide/quick-start
  - theme: alt
   text: 查看示例
   link: /examples/
  - theme: alt
   text: GitHub
   link: https://github.com/ldesign/crypto

features:
 - icon: 🔐
  title: 多种加密算法
  details: 支持 AES、RSA、DES、3DES、Blowfish、ChaCha20、XSalsa20 等多种加密算法

 - icon: 🛡️
  title: 量子安全加密
  details: 支持 LWE、SPHINCS+、Dilithium 等后量子密码算法，为未来做好准备

 - icon: 🔑
  title: 丰富的哈希函数
  details: MD5、SHA1、SHA224、SHA256、SHA384、SHA512、HMAC、BLAKE2b

 - icon: 📝
  title: 多种编码方式
  details: Base64、Hex、URL-safe Base64 等常用编码格式

 - icon: 🎯
  title: TypeScript 支持
  details: 完整的类型定义和智能提示，提供更好的开发体验

 - icon: 🚀
  title: 现代 API
  details: 支持 Promise 和异步操作，符合现代 JavaScript 开发习惯

 - icon: 🔧
  title: Vue 3 深度集成
  details: 提供 Composition API 钩子和插件系统，无缝集成 Vue 3

 - icon: 📦
  title: 模块化设计
  details: 按需导入，Tree-shaking 友好，减小打包体积

 - icon: 🛡️
  title: 安全性
  details: 遵循最佳安全实践，支持密钥管理和轮换

 - icon: ⚡
  title: 高性能
  details: WASM 加速、LRU 缓存优化、批量处理、密钥派生缓存（2.11x 加速）

 - icon: 💾
  title: 内存优化
  details: 智能缓存管理、自动过期清理、内存泄漏防护

 - icon: 🌐
  title: 跨平台
  details: 支持浏览器和 Node.js 环境，一套代码多端运行
---

## 快速示例

```typescript
import { aes, hash, encoding } from '@ldesign/crypto'

// AES 加密
const encrypted = aes.encrypt('Hello World', 'secret-key')
console.log(encrypted.data)

// AES 解密
const decrypted = aes.decrypt(encrypted, 'secret-key')
console.log(decrypted.data) // 'Hello World'

// 哈希
const sha256Hash = hash.sha256('Hello World')
console.log(sha256Hash)

// Base64 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='
```

## Vue 3 集成

```vue
<script setup>
import { useEncryption, useHash } from '@ldesign/crypto/vue'

// 使用加密功能
const encryption = useEncryption()
const encrypted = await encryption.encryptText('Hello World', 'password')

// 使用哈希功能
const hashUtil = useHash()
const hash = await hashUtil.sha256('Hello World')
</script>
```

## 主要特性

### 丰富的算法支持

- **对称加密**：AES-128/192/256、DES、3DES、Blowfish、ChaCha20、XSalsa20
- **非对称加密**：RSA（PKCS1、OAEP）
- **后量子加密**：LWE、SPHINCS+、Dilithium
- **哈希算法**：MD5、SHA-1、SHA-224、SHA-256、SHA-384、SHA-512、BLAKE2b
- **消息认证码**：HMAC-MD5、HMAC-SHA1、HMAC-SHA256
- **密钥派生**：PBKDF2、HKDF

### 完善的安全特性

- 自动 IV 生成和管理
- 密钥派生和轮换
- 安全随机数生成（CSPRNG）
- 认证加密（AEAD）
- 数字签名和验证
- 常数时间比较

### 卓越的性能

- LRU 缓存优化，减少重复计算
- 批量处理支持，提升吞吐量
- Worker 线程池，利用多核性能
- 流式加密，处理大文件
- 对象池管理，减少 GC 压力
- 密钥派生缓存，性能提升 2.11x

### 开发者友好

- 完整的 TypeScript 类型定义
- 详细的 JSDoc 注释
- 链式调用 API
- 统一的错误处理
- 性能监控和基准测试
- 丰富的示例和文档

## 安装

```bash
# 使用 pnpm
pnpm add @ldesign/crypto

# 使用 npm
npm install @ldesign/crypto

# 使用 yarn
yarn add @ldesign/crypto
```

## 下一步

- [快速开始](/guide/quick-start) - 开始使用 @ldesign/crypto
- [API 参考](/api/) - 查看完整的 API 文档
- [示例](/examples/) - 浏览更多示例代码
- [Vue 集成](/guide/vue-plugin) - 了解 Vue 3 集成

## 许可证

MIT License © 2024-present LDesign
