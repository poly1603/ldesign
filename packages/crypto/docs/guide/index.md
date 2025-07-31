# 介绍

@ldesign/crypto 是一个全面的加解密库，专为现代 JavaScript 应用程序设计。它不仅支持所有主流的加密算法，还为 Vue 3 生态系统提供了深度集成。

## 特性

### 🔐 全面的加密算法支持

- **对称加密**: AES-128/192/256，支持 CBC、ECB、CFB、OFB、CTR 等多种模式
- **非对称加密**: RSA 加密和数字签名
- **哈希算法**: MD5、SHA-1、SHA-224、SHA-256、SHA-384、SHA-512
- **消息认证码**: HMAC-MD5、HMAC-SHA1、HMAC-SHA256、HMAC-SHA384、HMAC-SHA512
- **编码算法**: Base64、Hex、URL安全Base64

### 🚀 高性能设计

- 优化的算法实现，适合生产环境使用
- 支持大数据量处理
- 异步操作支持，不阻塞主线程
- 内存使用优化

### 🎯 框架无关

- 可在浏览器环境中使用
- 支持 Node.js 环境
- 兼容所有主流 JavaScript 框架
- 提供多种模块格式（ESM、UMD、CommonJS）

### 🔧 Vue 3 深度集成

- **Composition API**: 提供 `useCrypto`、`useHash`、`useSignature` 等 hooks
- **插件系统**: 一键安装，全局可用
- **响应式状态**: 自动管理加载状态和错误处理
- **TypeScript 支持**: 完整的类型定义

## 设计理念

### 安全第一

我们遵循密码学最佳实践，确保：

- 使用经过验证的加密算法
- 正确的密钥管理
- 安全的随机数生成
- 防止常见的安全漏洞

### 易用性

简洁直观的 API 设计：

```typescript
// 简单直接
const encrypted = encrypt.aes('data', 'key')
const decrypted = decrypt.aes(encrypted, 'key')

// 链式调用
const hash = hash.sha256('data')
```

### 可扩展性

模块化设计，按需使用：

```typescript
// 只导入需要的功能
import { aes } from '@ldesign/crypto/algorithms'
import { useCrypto } from '@ldesign/crypto/vue'
```

## 适用场景

### Web 应用安全

- 用户密码加密存储
- 敏感数据传输加密
- API 接口签名验证
- 本地数据加密存储

### 数据处理

- 文件完整性校验
- 数据去重（哈希比较）
- 缓存键生成
- 唯一标识符生成

### Vue 应用

- 表单数据加密
- 用户认证流程
- 实时数据加密
- 组件状态管理

## 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | ≥ 63 |
| Firefox | ≥ 57 |
| Safari | ≥ 11.1 |
| Edge | ≥ 79 |

## Node.js 兼容性

- Node.js ≥ 16.0.0
- 支持 ESM 和 CommonJS

## 下一步

- [安装指南](./installation) - 了解如何安装和配置
- [快速开始](./quick-start) - 5分钟上手使用
- [API 文档](../api/) - 详细的 API 参考
- [示例代码](../examples/) - 实际使用示例
