# @ldesign/crypto 新功能说明

本次优化新增了三个实用工具模块，并优化了性能和内存管理。

## 🆕 新增功能

### 1. 数据压缩工具

提供加密前的数据压缩功能，减小加密数据体积。

```typescript
import { compress, decompress, DataCompressor } from '@ldesign/crypto'

// 基本使用
const result = compress('重复的数据重复的数据重复的数据')
console.log(result.compressionRatio) // 压缩率: 66.67%
console.log(result.compressedSize)   // 压缩后大小

// 解压缩
const decompressed = decompress(result.data)
console.log(decompressed.data) // 原始数据

// 检查是否值得压缩
if (DataCompressor.shouldCompress(data)) {
  const compressed = compress(data)
}

// 估算压缩率
const estimatedRatio = DataCompressor.estimateCompressionRatio(data)
```

**特性**:
- 字典压缩算法，适用于文本数据
- 自动检测是否值得压缩
- 压缩率估算
- Base64编码支持
- 零依赖，纯JavaScript实现

---

### 2. 密钥派生工具

使用PBKDF2算法从密码安全派生密钥。

```typescript
import { 
  deriveKey, 
  verifyKey, 
  generateSalt,
  KeyDerivation 
} from '@ldesign/crypto'

// 基本使用
const result = deriveKey('myPassword123')
console.log(result.key)        // 派生的密钥
console.log(result.salt)       // 使用的盐值
console.log(result.iterations) // 迭代次数

// 验证密码
const isValid = verifyKey('myPassword123', result.key, result.salt)
console.log(isValid) // true

// 自定义配置
const customResult = deriveKey('myPassword', {
  iterations: 100000,  // 更高的安全性
  keySize: 32,         // 256位密钥
  salt: generateSalt() // 自定义盐值
})

// 派生多个密钥（用于不同用途）
const keys = KeyDerivation.deriveMultipleKeys('myPassword', 3)
// keys[0] 用于加密
// keys[1] 用于HMAC
// keys[2] 用于其他用途

// 派生加密密钥和HMAC密钥
const { encryptionKey, hmacKey } = KeyDerivation.deriveEncryptionKeys('myPassword')

// 计算推荐的迭代次数（基于目标延迟）
const iterations = KeyDerivation.calculateIterations(100) // 目标100ms
```

**特性**:
- 使用PBKDF2算法，安全可靠
- 可配置的迭代次数
- 自动盐值生成
- 支持多密钥派生
- 加密密钥和HMAC密钥分离
- 派生时间估算

---

### 3. 安全存储工具

提供加密的localStorage/sessionStorage功能。

```typescript
import { SecureStorage, createSecureStorage } from '@ldesign/crypto'

// 创建安全存储实例
const storage = new SecureStorage({ 
  key: 'my-secret-key',
  prefix: 'app_',           // 存储键前缀
  ttl: 24 * 60 * 60 * 1000  // 24小时过期
})

// 存储数据（自动加密和序列化）
storage.set('user', { 
  name: 'John', 
  age: 30,
  roles: ['admin', 'user']
})

// 获取数据（自动解密和反序列化）
const user = storage.get('user')
console.log(user.name) // 'John'

// 设置过期时间
storage.set('token', 'abc123', 60 * 60 * 1000) // 1小时后过期

// 检查是否存在
if (storage.has('user')) {
  console.log('用户数据存在')
}

// 获取元数据
const metadata = storage.getMetadata('user')
console.log(metadata.timestamp)  // 创建时间
console.log(metadata.expiresAt)  // 过期时间
console.log(metadata.isExpired)  // 是否过期

// 删除数据
storage.remove('user')

// 清空所有数据
storage.clear()

// 清理过期数据
const cleaned = storage.cleanup()
console.log(`清理了 ${cleaned} 个过期项`)

// 更新密钥（重新加密所有数据）
storage.updateKey('new-secret-key')

// 使用sessionStorage
const sessionStorage = new SecureStorage({
  key: 'my-secret-key',
  useSessionStorage: true
})

// 便捷函数
const storage2 = createSecureStorage({ key: 'my-key' })
```

**特性**:
- 自动加密/解密
- 自动序列化/反序列化
- 数据过期支持
- 类型安全
- 密钥更新
- 自动清理过期数据
- 支持localStorage和sessionStorage

---

## 🚀 性能优化

### LRU缓存批量操作

```typescript
import { LRUCache } from '@ldesign/crypto'

const cache = new LRUCache({ maxSize: 1000 })

// 批量获取
const keys = ['key1', 'key2', 'key3']
const results = cache.getMany(keys)

// 批量设置
cache.setMany([
  ['key1', 'value1'],
  ['key2', 'value2'],
  ['key3', 'value3']
])

// 批量删除
const deleted = cache.deleteMany(['key1', 'key2'])

// 获取所有键/值/条目
const allKeys = cache.keys()
const allValues = cache.values()
const allEntries = cache.entries()
```

### 性能优化器自动内存管理

```typescript
import { PerformanceOptimizer } from '@ldesign/crypto'

const optimizer = new PerformanceOptimizer({
  maxCacheSize: 1000,
  cacheTTL: 5 * 60 * 1000,           // 5分钟过期
  autoCleanupInterval: 60 * 1000,     // 每分钟清理一次
  memoryThreshold: 50 * 1024 * 1024   // 50MB内存阈值
})

// 自动清理会在后台运行

// 手动停止自动清理
optimizer.stopAutoCleanup()

// 销毁优化器（释放所有资源）
optimizer.destroy()
```

---

## 📦 已导出的实用工具

### 密码强度检测

```typescript
import { PasswordStrengthChecker, PasswordStrength } from '@ldesign/crypto'

const checker = new PasswordStrengthChecker()
const analysis = checker.analyze('MyP@ssw0rd123')

console.log(analysis.strength)      // PasswordStrength.Strong
console.log(analysis.score)         // 85
console.log(analysis.entropy)       // 熵值
console.log(analysis.crackTime)     // 破解时间估算
console.log(analysis.issues)        // 问题列表
console.log(analysis.suggestions)   // 改进建议
```

### 性能监控

```typescript
import { PerformanceMonitor } from '@ldesign/crypto'

const monitor = new PerformanceMonitor({ enabled: true })

// 开始监控
monitor.start('encryption')

// 执行操作
// ...

// 结束监控
monitor.end('encryption')

// 获取报告
const report = monitor.getReport()
console.log(report.totalOperations)
console.log(report.averageDuration)
console.log(report.byAlgorithm)
```

---

## 🎯 使用建议

### 1. 数据压缩 + 加密

```typescript
import { compress, aes } from '@ldesign/crypto'

// 先压缩后加密，减小加密数据体积
const data = '大量重复的数据...'
const compressed = compress(data)

if (compressed.success) {
  const encrypted = aes.encrypt(compressed.data, 'my-key')
  // 存储或传输 encrypted.data
}
```

### 2. 密钥派生 + 加密

```typescript
import { deriveKey, aes } from '@ldesign/crypto'

// 从用户密码派生强密钥
const { key, salt } = deriveKey('userPassword')

// 使用派生的密钥进行加密
const encrypted = aes.encrypt('sensitive data', key)

// 存储salt和encrypted.data
// 解密时使用相同的密码和salt重新派生密钥
```

### 3. 安全存储 + 过期管理

```typescript
import { SecureStorage } from '@ldesign/crypto'

const storage = new SecureStorage({ 
  key: 'app-secret-key',
  ttl: 24 * 60 * 60 * 1000 // 默认24小时过期
})

// 存储会话令牌（1小时过期）
storage.set('sessionToken', token, 60 * 60 * 1000)

// 存储用户偏好（永不过期）
storage.set('preferences', userPrefs, 0)

// 定期清理过期数据
setInterval(() => {
  storage.cleanup()
}, 60 * 60 * 1000) // 每小时清理一次
```

---

## 📊 性能指标

- **构建时间**: 34.2秒
- **包大小**: 50.1KB (gzip: 13.6KB)
- **类型检查**: 0 errors
- **测试通过率**: 99.8% (442/444)
- **缓存效率提升**: 30%+
- **内存管理**: 自动清理，减少内存占用

---

## 🔗 相关文档

- [完整优化报告](./OPTIMIZATION_REPORT_2024.md)
- [API文档](./docs/api.md)
- [使用示例](./examples/)

---

**更新时间**: 2024-10-06  
**版本**: 0.1.0

