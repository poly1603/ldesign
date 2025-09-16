# 安全特性

## 🔒 安全概述

@ldesign/cache 提供了多层安全防护机制，确保缓存数据的安全性和隐私保护。

## 🔐 数据加密

### AES-GCM 加密

默认使用 AES-GCM 算法进行数据加密，提供认证加密功能：

```typescript
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES',
      secretKey: 'your-secret-key-here',
    },
  },
})

// 数据会被自动加密存储
await cache.set('sensitive-data', {
  password: 'user-password',
  creditCard: '1234-5678-9012-3456',
})
```

### 自定义加密算法

支持使用自定义加密算法：

```typescript
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'custom',
      customEncrypt: (data: string) => {
        // 实现自定义加密逻辑
        return yourEncryptFunction(data)
      },
      customDecrypt: (data: string) => {
        // 实现自定义解密逻辑
        return yourDecryptFunction(data)
      },
    },
  },
})
```

### 加密配置选项

```typescript
interface EncryptionConfig {
  enabled: boolean // 是否启用加密
  algorithm?: 'AES' | 'custom' // 加密算法
  secretKey?: string // 密钥
  customEncrypt?: (data: string) => string // 自定义加密函数
  customDecrypt?: (data: string) => string // 自定义解密函数
}
```

## 🎭 键名混淆

### 混淆原理

键名混淆通过对缓存键名进行编码，防止敏感信息通过键名泄露：

```typescript
const cache = createCache({
  security: {
    obfuscation: {
      enabled: true,
      algorithm: 'hash', // 使用哈希算法
      prefix: 'secure_', // 混淆前缀
    },
  },
})

// 原始键名: 'user-123-profile'
// 混淆后: 'secure_a7b8c9d0e1f2g3h4'
await cache.set('user-123-profile', userData)
```

### 混淆算法

支持多种混淆算法：

#### 1. Hash 算法（推荐）

```typescript
{
  obfuscation: {
    algorithm: 'hash' // 使用 SHA-256 哈希
  }
}
```

#### 2. Base64 算法

```typescript
{
  obfuscation: {
    algorithm: 'base64' // 使用 Base64 编码
  }
}
```

#### 3. 自定义算法

```typescript
{
  obfuscation: {
    algorithm: 'custom',
    customObfuscate: (key: string) => {
      // 自定义混淆逻辑
      const yourObfuscateFunction = (k: string) => k
      return yourObfuscateFunction(key)
    },
    customDeobfuscate: (key: string) => {
      // 自定义反混淆逻辑
      const yourDeobfuscateFunction = (k: string) => k
      return yourDeobfuscateFunction(key)
    },
  },
}
```

## 🛡️ 安全级别

### 级别配置

```typescript
// 低安全级别 - 仅基础保护
const lowSecurityCache = createCache({
  security: {
    encryption: { enabled: false },
    obfuscation: { enabled: true },
  },
})

// 中等安全级别 - 标准保护
const mediumSecurityCache = createCache({
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
  },
})

// 高安全级别 - 最强保护
const highSecurityCache = createCache({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES',
      secretKey: generateSecureKey(),
    },
    obfuscation: {
      enabled: true,
      algorithm: 'hash',
    },
    integrity: {
      enabled: true, // 数据完整性验证
      algorithm: 'SHA-256',
    },
  },
})
```

## 🔑 密钥管理

### 密钥生成

```typescript
// 生成安全的随机密钥
function generateSecureKey(): string {
  const array = new Uint8Array(32) // 256位密钥
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      secretKey: generateSecureKey(),
    },
  },
})
```

### 密钥轮换

```typescript
// 定期轮换密钥
class SecureCacheManager {
  private cache: CacheManager
  private currentKey: string

  constructor() {
    this.currentKey = generateSecureKey()
    this.cache = createCache({
      security: {
        encryption: {
          enabled: true,
          secretKey: this.currentKey,
        },
      },
    })

    // 每30天轮换密钥
    setInterval(() => {
      this.rotateKey()
    }, 30 * 24 * 60 * 60 * 1000)
  }

  private async rotateKey() {
    const newKey = generateSecureKey()

    // 使用新密钥重新加密所有数据
    await this.reencryptAllData(this.currentKey, newKey)

    this.currentKey = newKey
  }
}
```

## 🔍 数据完整性

### 完整性验证

```typescript
const cache = createCache({
  security: {
    integrity: {
      enabled: true,
      algorithm: 'SHA-256',
      onIntegrityFailed: (key, error) => {
        console.error(`数据完整性验证失败: ${key}`, error)
        // 可以选择删除损坏的数据
        cache.remove(key)
      },
    },
  },
})
```

### 数据签名

```typescript
// 为敏感数据添加数字签名
await cache.set('important-data', data, {
  sign: true, // 启用数字签名
  signKey: 'sign-key', // 签名密钥
})

// 获取时自动验证签名
const data = await cache.get('important-data')
// 如果签名验证失败，会抛出错误
```

## 🚨 安全最佳实践

### 1. 密钥管理

```typescript
// ✅ 推荐：使用环境变量存储密钥
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      secretKey: process.env.CACHE_SECRET_KEY,
    },
  },
})

// ❌ 不推荐：硬编码密钥
const cache = createCache({
  security: {
    encryption: {
      secretKey: 'hardcoded-key-123', // 安全风险
    },
  },
})
```

### 2. 敏感数据处理

```typescript
// ✅ 推荐：对敏感数据启用完整安全保护
await cache.set('user-credentials', credentials, {
  encrypt: true, // 强制加密
  obfuscateKey: true, // 混淆键名
  ttl: 15 * 60 * 1000, // 15分钟过期
})

// ✅ 推荐：及时清理敏感数据
setTimeout(() => {
  cache.remove('user-credentials')
}, 15 * 60 * 1000)
```

### 3. 安全配置验证

```typescript
// ✅ 推荐：验证安全配置
const cache = createCache({
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
    validation: {
      enabled: true,
      strictMode: true, // 严格模式
    },
  },
})

// 检查安全状态
const securityStatus = await cache.getSecurityStatus()
if (!securityStatus.isSecure) {
  console.warn('安全配置不完整:', securityStatus.warnings)
}
```

## 🔐 加密性能

### 性能影响

| 操作     | 无加密 | AES 加密 | 性能影响 |
| -------- | ------ | -------- | -------- |
| 设置     | 1ms    | 3ms      | +200%    |
| 获取     | 0.5ms  | 2ms      | +300%    |
| 存储空间 | 100%   | 120%     | +20%     |

### 性能优化

```typescript
// 批量加密优化
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      batchSize: 100, // 批量处理大小
      workerEnabled: true, // 使用 Web Worker
    },
  },
})
```

## 🔒 安全审计

### 审计日志

```typescript
const cache = createCache({
  security: {
    audit: {
      enabled: true,
      logLevel: 'info',
      logSensitiveData: false, // 不记录敏感数据
      onAuditEvent: (event) => {
        // 发送到审计系统
        sendToAuditSystem(event)
      },
    },
  },
})
```

### 安全报告

```typescript
// 生成安全报告
const securityReport = await cache.generateSecurityReport()

console.log('安全报告:', {
  encryptedItems: securityReport.encryptedItems,
  obfuscatedKeys: securityReport.obfuscatedKeys,
  integrityChecks: securityReport.integrityChecks,
  securityEvents: securityReport.securityEvents,
})
```

## ⚠️ 安全注意事项

### 1. 密钥安全

- 🔑 **密钥强度** - 使用至少 256 位的强密钥
- 🔄 **密钥轮换** - 定期更换加密密钥
- 🚫 **密钥泄露** - 避免在代码中硬编码密钥
- 🔒 **密钥存储** - 使用安全的密钥管理服务

### 2. 数据分类

- 🔴 **高敏感** - 密码、令牌、个人身份信息
- 🟡 **中敏感** - 用户偏好、行为数据
- 🟢 **低敏感** - 公开配置、缓存数据

### 3. 合规要求

- **GDPR** - 欧盟数据保护法规
- **CCPA** - 加州消费者隐私法
- **SOX** - 萨班斯-奥克斯利法案
- **HIPAA** - 健康保险便携性和责任法案

## 🔗 相关文档

- [配置指南](/guide/getting-started#%E9%85%8D%E7%BD%AE%E7%BC%93%E5%AD%98%E7%AE%A1%E7%90%86%E5%99%A8) - 详细配置说明
- [API 参考](/api/security.md) - 安全 API 文档
- [最佳实践](./best-practices.md) - 安全最佳实践
