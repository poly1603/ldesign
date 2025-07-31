---
layout: home

hero:
  name: "@ldesign/crypto"
  text: "全面的加解密库"
  tagline: "支持所有主流 JavaScript 框架，专为 Vue 3 深度集成"
  image:
    src: /logo.svg
    alt: LDesign Crypto
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
    title: 全面的加密算法
    details: 支持 AES、RSA、MD5、SHA系列、Base64、HMAC 等所有主流加密算法
  - icon: 🚀
    title: 高性能优化
    details: 优化的算法实现，适合生产环境使用，支持大数据量处理
  - icon: 🎯
    title: 框架无关
    details: 可在任何 JavaScript 环境中使用，包括浏览器、Node.js 等
  - icon: 🔧
    title: Vue 3 深度集成
    details: 提供 Composition API hooks 和插件，完美融入 Vue 3 生态系统
  - icon: 📦
    title: 多种构建格式
    details: 支持 ESM、UMD、CommonJS 等多种格式，满足不同使用场景
  - icon: 🛡️
    title: TypeScript 支持
    details: 完整的类型定义，提供优秀的开发体验和类型安全
  - icon: ✅
    title: 完整测试覆盖
    details: 单元测试和端到端测试，确保代码质量和稳定性
  - icon: 📚
    title: 详细文档
    details: 完整的 API 文档和使用示例，快速上手和深入学习
---

## 快速体验

### 基础用法

```typescript
import { encrypt, decrypt, hash } from '@ldesign/crypto'

// AES 加密
const encrypted = encrypt.aes('Hello World', 'secret-key')
const decrypted = decrypt.aes(encrypted, 'secret-key')

// 哈希计算
const md5Hash = hash.md5('Hello World')
const sha256Hash = hash.sha256('Hello World')

// Base64 编码
const encoded = encrypt.base64('Hello World')
const decoded = decrypt.base64(encoded)
```

### Vue 3 集成

```vue
<template>
  <div>
    <input v-model="data" placeholder="输入要加密的数据" />
    <input v-model="key" placeholder="输入密钥" />
    <button @click="handleEncrypt" :disabled="isEncrypting">
      {{ isEncrypting ? '加密中...' : '加密' }}
    </button>
    <div v-if="encryptedData">
      加密结果: {{ encryptedData }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

const { encryptAES, isEncrypting } = useCrypto()

const data = ref('')
const key = ref('')
const encryptedData = ref('')

const handleEncrypt = async () => {
  const result = await encryptAES(data.value, key.value)
  encryptedData.value = result.data
}
</script>
```

## 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/crypto
```

```bash [npm]
npm install @ldesign/crypto
```

```bash [yarn]
yarn add @ldesign/crypto
```

:::

## 支持的算法

| 类型 | 算法 | 描述 |
|------|------|------|
| 对称加密 | AES-128/192/256 | 高级加密标准，支持多种模式 |
| 非对称加密 | RSA | 公钥加密算法，支持签名验证 |
| 哈希算法 | MD5, SHA-1/224/256/384/512 | 消息摘要算法 |
| 消息认证 | HMAC-MD5/SHA1/SHA256/SHA384/SHA512 | 基于哈希的消息认证码 |
| 编码算法 | Base64, Hex | 数据编码转换 |

## 为什么选择 @ldesign/crypto？

- **🎯 专业性**: 专注于加密领域，提供最全面的加密解决方案
- **🔧 易用性**: 简洁的 API 设计，降低学习成本
- **⚡ 性能**: 优化的算法实现，适合生产环境
- **🛡️ 安全性**: 遵循最佳安全实践，保障数据安全
- **🔄 兼容性**: 支持多种环境和框架
- **📖 文档**: 详细的文档和示例，快速上手

## 社区与支持

- [GitHub Issues](https://github.com/ldesign/crypto/issues) - 报告问题和功能请求
- [GitHub Discussions](https://github.com/ldesign/crypto/discussions) - 社区讨论
- [更新日志](https://github.com/ldesign/crypto/blob/main/CHANGELOG.md) - 查看版本更新

## 许可证

[MIT License](https://github.com/ldesign/crypto/blob/main/LICENSE) © 2024 LDesign Team
