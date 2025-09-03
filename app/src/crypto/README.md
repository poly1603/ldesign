# Crypto 插件集成

本模块将 `@ldesign/crypto` 包集成到 `@ldesign/engine` 应用中，提供完整的加密解密功能。

## 功能特性

### 🔐 加密算法支持
- **AES 加密**：支持 128/192/256 位密钥
- **DES/3DES 加密**：传统对称加密算法
- **RSA 加密**：非对称加密，支持 1024-4096 位密钥
- **Blowfish 加密**：高性能对称加密算法

### 🔑 密钥管理
- **密钥生成**：安全的随机密钥生成
- **密钥派生**：基于密码的密钥派生函数
- **密钥存储**：安全的密钥存储机制

### 🔍 哈希和签名
- **哈希算法**：MD5、SHA1、SHA256、SHA384、SHA512
- **HMAC**：基于哈希的消息认证码
- **数字签名**：RSA 数字签名和验证

### 🔄 编码转换
- **Base64 编码**：标准 Base64 编码解码
- **十六进制编码**：Hex 编码解码
- **UTF-8 编码**：字符串编码转换

## 配置说明

### 基础配置
```typescript
{
  name: 'crypto',
  version: '1.0.0',
  autoInstall: true,
  globalPropertyName: '$crypto',
  registerComposables: true
}
```

### 加密参数配置
```typescript
{
  config: {
    defaultAESKeySize: 256,      // AES 密钥大小
    defaultRSAKeySize: 2048,     // RSA 密钥大小
    defaultHashAlgorithm: 'SHA256', // 默认哈希算法
    defaultEncoding: 'base64'    // 默认编码方式
  }
}
```

### 环境差异化配置
- **开发环境**：启用调试模式和性能监控
- **生产环境**：关闭调试，优化性能

## 使用方法

### 1. Composition API 方式
```typescript
import { useCrypto, useHash, useSignature } from '@ldesign/crypto/vue'

export default {
  setup() {
    const { encryptAES, decryptAES } = useCrypto()
    const { sha256, md5 } = useHash()
    const { sign, verify } = useSignature()

    const handleEncrypt = async () => {
      const encrypted = await encryptAES('Hello World', 'secret-key')
      const hash = await sha256('Hello World')
      return { encrypted, hash }
    }

    return { handleEncrypt }
  }
}
```

### 2. 全局属性方式
```typescript
export default {
  methods: {
    async handleCrypto() {
      // 通过 this.$crypto 访问所有加密功能
      const encrypted = this.$crypto.encrypt.aes('data', 'key')
      const decrypted = this.$crypto.decrypt.aes(encrypted, 'key')
      const hash = this.$crypto.hash.sha256('data')
      
      return { encrypted, decrypted, hash }
    }
  }
}
```

### 3. 直接导入方式
```typescript
import { aes, hash, rsa, keyGenerator } from '@ldesign/crypto'

// AES 加密
const encrypted = aes.encrypt('Hello World', 'secret-key')
const decrypted = aes.decrypt(encrypted, 'secret-key')

// 哈希计算
const hashValue = hash.sha256('Hello World')

// RSA 加密
const keyPair = keyGenerator.generateRSAKeyPair(2048)
const rsaEncrypted = rsa.encrypt('Secret', keyPair.publicKey)
```

## 性能优化

### 缓存机制
- 自动缓存计算结果
- 智能缓存失效策略
- 内存使用优化

### 异步处理
- 支持异步加密操作
- 批量处理优化
- Web Worker 支持（可选）

### 性能监控
- 加密操作耗时统计
- 内存使用监控
- 性能瓶颈分析

## 安全考虑

### 密钥安全
- 安全的随机数生成
- 密钥不会在内存中长期保存
- 支持密钥轮换机制

### 算法安全
- 使用业界标准加密算法
- 定期更新加密库依赖
- 支持最新的安全标准

### 数据保护
- 敏感数据自动清理
- 防止内存泄漏
- 安全的错误处理

## 故障排除

### 常见问题
1. **插件未正确安装**：检查 bootstrap.ts 中是否正确导入
2. **全局属性未定义**：确认 autoInstall 为 true
3. **类型错误**：检查 TypeScript 配置和类型导入

### 调试模式
开发环境下启用调试模式，可以在控制台看到详细的操作日志：
```typescript
debug: process.env.NODE_ENV === 'development'
```

## 相关链接
- [@ldesign/crypto 文档](../../packages/crypto/README.md)
- [加密算法指南](../../packages/crypto/docs/guide/)
- [API 参考](../../packages/crypto/docs/api/)
