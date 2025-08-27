# 安全管理 API

安全管理模块提供数据加密、密钥混淆和完整性验证功能。

## SecurityManager

安全管理器主类，负责协调各种安全功能。

### 构造函数

```typescript
constructor(options: SecurityOptions)
```

### 配置选项

```typescript
interface SecurityOptions {
  encryption?: EncryptionOptions
  obfuscation?: ObfuscationOptions
  integrity?: IntegrityOptions
}
```

### 方法

#### encrypt

加密数据：

```typescript
async encrypt(data: string): Promise<string>
```

#### decrypt

解密数据：

```typescript
async decrypt(encryptedData: string): Promise<string>
```

#### obfuscateKey

混淆键名：

```typescript
obfuscateKey(key: string): string
```

#### deobfuscateKey

反混淆键名：

```typescript
deobfuscateKey(obfuscatedKey: string): string
```

#### generateHash

生成数据哈希：

```typescript
async generateHash(data: string): Promise<string>
```

#### verifyIntegrity

验证数据完整性：

```typescript
async verifyIntegrity(data: string, hash: string): Promise<boolean>
```

### 示例

```typescript
import { SecurityManager } from '@ldesign/cache'

const security = new SecurityManager({
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM',
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 100000,
      salt: 'your-salt',
    },
  },
  obfuscation: {
    enabled: true,
    algorithm: 'base64',
  },
})

// 加密数据
const encrypted = await security.encrypt('sensitive data')

// 解密数据
const decrypted = await security.decrypt(encrypted)

// 混淆键名
const obfuscated = security.obfuscateKey('user:123')
```

## AESCrypto

AES 加密实现类。

### 构造函数

```typescript
constructor(options: AESCryptoOptions)
```

### 配置选项

```typescript
interface AESCryptoOptions {
  algorithm: 'AES-GCM' | 'AES-CBC'
  keyDerivation: KeyDerivationOptions
}

interface KeyDerivationOptions {
  algorithm: 'PBKDF2'
  iterations: number
  salt: string
  keyLength?: number
}
```

### 方法

#### encrypt

加密数据：

```typescript
async encrypt(data: string): Promise<string>
```

#### decrypt

解密数据：

```typescript
async decrypt(encryptedData: string): Promise<string>
```

#### deriveKey

派生加密密钥：

```typescript
async deriveKey(password: string): Promise<CryptoKey>
```

### 示例

```typescript
import { AESCrypto } from '@ldesign/cache'

const crypto = new AESCrypto({
  algorithm: 'AES-GCM',
  keyDerivation: {
    algorithm: 'PBKDF2',
    iterations: 100000,
    salt: 'unique-salt',
  },
})

const encrypted = await crypto.encrypt('secret data')
const decrypted = await crypto.decrypt(encrypted)
```

## KeyObfuscator

密钥混淆器，用于混淆和反混淆键名。

### 构造函数

```typescript
constructor(options: ObfuscationOptions)
```

### 配置选项

```typescript
interface ObfuscationOptions {
  enabled: boolean
  algorithm: 'base64' | 'hash' | 'custom'
  customObfuscate?: (key: string) => string
  customDeobfuscate?: (key: string) => string
}
```

### 方法

#### obfuscate

混淆键名：

```typescript
obfuscate(key: string): string
```

#### deobfuscate

反混淆键名：

```typescript
deobfuscate(obfuscatedKey: string): string
```

### 示例

```typescript
import { KeyObfuscator } from '@ldesign/cache'

// Base64 混淆
const obfuscator = new KeyObfuscator({
  enabled: true,
  algorithm: 'base64',
})

const obfuscated = obfuscator.obfuscate('user:profile:123')
const original = obfuscator.deobfuscate(obfuscated)

// 自定义混淆
const customObfuscator = new KeyObfuscator({
  enabled: true,
  algorithm: 'custom',
  customObfuscate: (key) => key.split('').reverse().join(''),
  customDeobfuscate: (key) => key.split('').reverse().join(''),
})
```

## 安全配置

### 加密配置

```typescript
interface EncryptionOptions {
  enabled: boolean
  algorithm: 'AES-GCM' | 'AES-CBC'
  keyDerivation: KeyDerivationOptions
}
```

### 混淆配置

```typescript
interface ObfuscationOptions {
  enabled: boolean
  algorithm: 'base64' | 'hash' | 'custom'
  customObfuscate?: (key: string) => string
  customDeobfuscate?: (key: string) => string
}
```

### 完整性配置

```typescript
interface IntegrityOptions {
  enabled: boolean
  algorithm: 'SHA-256' | 'SHA-512'
}
```

## 安全级别

### 基础级别

```typescript
const basicSecurity = {
  obfuscation: {
    enabled: true,
    algorithm: 'base64',
  },
}
```

### 标准级别

```typescript
const standardSecurity = {
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM',
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 10000,
      salt: 'app-salt',
    },
  },
  obfuscation: {
    enabled: true,
    algorithm: 'hash',
  },
}
```

### 高级级别

```typescript
const advancedSecurity = {
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM',
    keyDerivation: {
      algorithm: 'PBKDF2',
      iterations: 100000,
      salt: 'complex-salt',
    },
  },
  obfuscation: {
    enabled: true,
    algorithm: 'hash',
  },
  integrity: {
    enabled: true,
    algorithm: 'SHA-256',
  },
}
```

## 错误处理

安全操作可能抛出以下错误：

- `EncryptionError`: 加密失败
- `DecryptionError`: 解密失败
- `KeyDerivationError`: 密钥派生失败
- `IntegrityError`: 完整性验证失败

```typescript
try {
  const encrypted = await security.encrypt(data)
} catch (error) {
  if (error instanceof EncryptionError) {
    console.error('加密失败:', error.message)
  }
}
```

## 最佳实践

1. **使用强密码**: 确保密钥派生使用足够复杂的密码
2. **定期更换密钥**: 定期更新加密密钥和盐值
3. **验证完整性**: 对重要数据启用完整性验证
4. **安全存储**: 不要在客户端存储敏感的密钥信息
5. **错误处理**: 妥善处理加密解密错误

## 性能考虑

- 加密操作会增加存储和读取的延迟
- PBKDF2 迭代次数越高，安全性越好但性能越差
- 建议根据实际需求选择合适的安全级别
