# 类型定义

本文档包含 @ldesign/cache 的所有 TypeScript 类型定义。

## 核心类型

### StorageEngine

支持的存储引擎类型：

```typescript
type StorageEngine = 
  | 'memory'
  | 'localStorage' 
  | 'sessionStorage'
  | 'indexedDB'
  | 'cookie'
```

### StorageStrategy

存储策略类型：

```typescript
type StorageStrategy = 
  | 'performance'    // 性能优先
  | 'persistence'    // 持久化优先
  | 'security'       // 安全优先
  | 'balanced'       // 平衡模式
```

## 接口定义

### IStorageEngine

存储引擎接口：

```typescript
interface IStorageEngine {
  name: string
  isAvailable: boolean
  
  setItem: (key: string, value: string, ttl?: number) => Promise<void>
  getItem: (key: string) => Promise<string | null>
  removeItem: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
  hasItem: (key: string) => Promise<boolean>
  length: () => Promise<number>
  cleanup: () => Promise<void>
}
```

### ICacheManager

缓存管理器接口：

```typescript
interface ICacheManager {
  set: <T = any>(key: string, value: T, options?: SetOptions) => Promise<void>
  get: <T = any>(key: string) => Promise<T | null>
  remove: (key: string) => Promise<void>
  clear: (engine?: StorageEngine) => Promise<void>
  has: (key: string) => Promise<boolean>
  keys: (engine?: StorageEngine) => Promise<string[]>
  getMetadata: (key: string) => Promise<CacheMetadata | null>
  getStats: () => Promise<CacheStats>
  cleanup: () => Promise<void>
  destroy: () => Promise<void>
}
```

## 配置选项

### CacheManagerOptions

缓存管理器配置：

```typescript
interface CacheManagerOptions {
  engines?: StorageEngine[]
  strategy?: StorageStrategy | IStorageStrategy
  security?: SecurityOptions
  debug?: boolean
  eventEmitter?: EventEmitter
}
```

### SetOptions

设置选项：

```typescript
interface SetOptions {
  ttl?: number              // 过期时间（毫秒）
  engine?: StorageEngine    // 指定存储引擎
  compress?: boolean        // 是否压缩
  encrypt?: boolean         // 是否加密
}
```

### SecurityOptions

安全配置：

```typescript
interface SecurityOptions {
  encryption?: EncryptionOptions
  obfuscation?: ObfuscationOptions
  integrity?: IntegrityOptions
}
```

### EncryptionOptions

加密配置：

```typescript
interface EncryptionOptions {
  enabled: boolean
  algorithm: 'AES-GCM' | 'AES-CBC'
  keyDerivation: KeyDerivationOptions
}
```

### KeyDerivationOptions

密钥派生配置：

```typescript
interface KeyDerivationOptions {
  algorithm: 'PBKDF2'
  iterations: number
  salt: string
  keyLength?: number
}
```

### ObfuscationOptions

混淆配置：

```typescript
interface ObfuscationOptions {
  enabled: boolean
  algorithm: 'base64' | 'hash' | 'custom'
  customObfuscate?: (key: string) => string
  customDeobfuscate?: (key: string) => string
}
```

### IntegrityOptions

完整性配置：

```typescript
interface IntegrityOptions {
  enabled: boolean
  algorithm: 'SHA-256' | 'SHA-512'
}
```

## 引擎配置

### MemoryEngineOptions

内存引擎配置：

```typescript
interface MemoryEngineOptions {
  maxSize?: number          // 最大存储大小（字节）
  cleanupInterval?: number  // 清理间隔（毫秒）
}
```

### LocalStorageEngineOptions

LocalStorage 引擎配置：

```typescript
interface LocalStorageEngineOptions {
  prefix?: string  // 键名前缀
}
```

### SessionStorageEngineOptions

SessionStorage 引擎配置：

```typescript
interface SessionStorageEngineOptions {
  prefix?: string  // 键名前缀
}
```

### IndexedDBEngineOptions

IndexedDB 引擎配置：

```typescript
interface IndexedDBEngineOptions {
  dbName?: string      // 数据库名称
  storeName?: string   // 存储名称
  version?: number     // 数据库版本
}
```

### CookieEngineOptions

Cookie 引擎配置：

```typescript
interface CookieEngineOptions {
  domain?: string                           // Cookie 域名
  path?: string                            // Cookie 路径
  secure?: boolean                         // 是否仅 HTTPS
  sameSite?: 'strict' | 'lax' | 'none'    // SameSite 策略
}
```

## 数据类型

### CacheMetadata

缓存元数据：

```typescript
interface CacheMetadata {
  key: string
  size: number
  createdAt: number
  updatedAt: number
  expiresAt?: number
  engine: string
  compressed: boolean
  encrypted: boolean
}
```

### CacheStats

缓存统计信息：

```typescript
interface CacheStats {
  totalItems: number
  totalSize: number
  hitRate: number
  engines: Record<string, EngineStats>
}
```

### EngineStats

引擎统计信息：

```typescript
interface EngineStats {
  items: number
  size: number
  hits: number
  misses: number
}
```

### CacheEvent

缓存事件：

```typescript
interface CacheEvent {
  type: 'set' | 'get' | 'remove' | 'clear' | 'error'
  key: string
  value?: any
  engine: string
  timestamp: number
  error?: Error
}
```

## Vue 相关类型

### UseCacheOptions

Vue 组合式函数配置：

```typescript
interface UseCacheOptions {
  engines?: StorageEngine[]
  strategy?: StorageStrategy
  security?: SecurityOptions
  debug?: boolean
}
```

### UseCacheReturn

Vue 组合式函数返回值：

```typescript
interface UseCacheReturn {
  set: <T = any>(key: string, value: T, options?: SetOptions) => Promise<void>
  get: <T = any>(key: string) => Promise<T | null>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  has: (key: string) => Promise<boolean>
  keys: () => Promise<string[]>
  cleanup: () => Promise<void>
  
  getStats: () => Promise<CacheStats>
  refreshStats: () => Promise<void>
  stats: ComputedRef<CacheStats | null>
  
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  isReady: ComputedRef<boolean>
  hasError: ComputedRef<boolean>
  
  useReactiveCache: <T = any>(key: string, defaultValue?: T) => any
  manager: CacheManager
}
```

## 策略接口

### IStorageStrategy

存储策略接口：

```typescript
interface IStorageStrategy {
  name: string
  selectEngine: (
    key: string,
    value: any,
    availableEngines: StorageEngine[],
    context: StrategyContext
  ) => StrategyResult
}
```

### StrategyContext

策略上下文：

```typescript
interface StrategyContext {
  dataSize: number
  isSecure: boolean
  ttl?: number
  userPreference?: StorageEngine
}
```

### StrategyResult

策略结果：

```typescript
interface StrategyResult {
  engine: StorageEngine
  reason: string
  confidence: number
}
```

## 工具类型

### DeepPartial

深度可选类型：

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}
```

### CacheKey

缓存键类型：

```typescript
type CacheKey = string | number | symbol
```

### SerializableValue

可序列化值类型：

```typescript
type SerializableValue = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | SerializableObject 
  | SerializableArray

interface SerializableObject {
  [key: string]: SerializableValue
}

interface SerializableArray extends Array<SerializableValue> {}
```

## 错误类型

### CacheError

缓存错误基类：

```typescript
class CacheError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'CacheError'
  }
}
```

### EncryptionError

加密错误：

```typescript
class EncryptionError extends CacheError {
  constructor(message: string) {
    super(message, 'ENCRYPTION_ERROR')
    this.name = 'EncryptionError'
  }
}
```

### StorageError

存储错误：

```typescript
class StorageError extends CacheError {
  constructor(message: string, public engine?: string) {
    super(message, 'STORAGE_ERROR')
    this.name = 'StorageError'
  }
}
```

## 常量

### 默认配置

```typescript
const DEFAULT_CACHE_OPTIONS: CacheManagerOptions = {
  engines: ['localStorage', 'memory'],
  strategy: 'balanced',
  debug: false,
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000 // 24小时

const MAX_COOKIE_SIZE = 4096 // 4KB
const MAX_LOCALSTORAGE_SIZE = 5 * 1024 * 1024 // 5MB
```
