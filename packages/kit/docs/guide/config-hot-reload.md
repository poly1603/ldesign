# 配置热更新系统

@ldesign/kit 提供了强大的配置热更新系统，支持实时监听配置文件变更、智能重载和配置缓存。

## 核心功能

### 配置缓存 (ConfigCache)

配置缓存提供了高性能的配置存储和管理功能：

```typescript
import { ConfigCache } from '@ldesign/kit/config'

// 创建配置缓存
const cache = new ConfigCache({
  maxSize: 1000,
  ttl: 3600000, // 1 hour
  enableVersioning: true,
  maxVersions: 10,
})

// 设置配置
cache.set('database.host', 'localhost', {
  dependencies: ['database.port', 'database.name'],
})

// 获取配置
const host = cache.get('database.host')

// 智能重载
const changes = cache.smartReload({
  'database.host': 'new-host',
  'database.port': 5432,
})

// 监听变更
cache.on('changed', change => {
  console.log(`配置 ${change.path} 已更新`)
})
```

### 热重载管理器 (ConfigHotReload)

热重载管理器提供了自动的配置文件监听和重载功能：

```typescript
import { ConfigHotReload, ConfigCache, ConfigLoader } from '@ldesign/kit/config'

const cache = new ConfigCache()
const loader = new ConfigLoader()

// 创建热重载管理器
const hotReload = new ConfigHotReload(cache, loader, {
  enabled: true,
  debounceMs: 500,
  enableDependencyTracking: true,
  enableIncrementalUpdate: true,
  enableRollback: true,
})

// 启用热重载
await hotReload.enable('config.json', './config')

// 监听重载事件
hotReload.on('reloadCompleted', result => {
  console.log(`重载完成，变更了 ${result.changes.length} 个配置项`)
})

// 手动重载
const result = await hotReload.reload('manual')
```

## 支持的配置文件格式

扩展的配置系统现在支持更多文件格式：

### JavaScript 系列

- `.js` - CommonJS 模块
- `.mjs` - ES 模块
- `.cjs` - CommonJS 模块（显式）

### TypeScript 系列

- `.ts` - TypeScript 文件
- `.mts` - TypeScript ES 模块
- `.cts` - TypeScript CommonJS 模块

### JSON 系列

- `.json` - 标准 JSON
- `.json5` - JSON5 格式（支持注释和更灵活的语法）

### 环境配置

- `.env` - 环境变量文件
- `.env.local` - 本地环境变量
- `.env.development` - 开发环境变量
- `.env.production` - 生产环境变量
- `.env.test` - 测试环境变量

### 其他格式

- `.yaml` / `.yml` - YAML 格式
- `.toml` - TOML 格式

## 配置示例

### JSON5 配置文件

```json5
// config.json5
{
  // 数据库配置
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp',
    // 支持注释
    ssl: true,
  },

  // 应用配置
  app: {
    name: 'My Application',
    version: '1.0.0',
    debug: true, // 尾随逗号
  },
}
```

### TypeScript 配置文件

```typescript
// config.ts
export default {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'myapp',
  },

  app: {
    name: 'My Application',
    version: '1.0.0',
    debug: process.env.NODE_ENV === 'development',
  },
}
```

## 高级功能

### 配置依赖追踪

```typescript
// 设置配置依赖关系
cache.set('redis.url', 'redis://localhost:6379', {
  dependencies: ['redis.host', 'redis.port'],
})

// 当依赖项变更时，会自动更新相关配置
cache.set('redis.host', 'new-host')
// redis.url 会自动重新计算
```

### 配置版本管理

```typescript
// 启用版本管理
const cache = new ConfigCache({
  enableVersioning: true,
  maxVersions: 10,
})

// 获取版本历史
const history = cache.getVersionHistory('database.host')

// 回滚到指定版本
cache.rollbackToVersion('database.host', 5)
```

### 配置变更通知

```typescript
// 监听特定配置的变更
cache.on('changed:database.host', change => {
  console.log('数据库主机已更改:', change.newValue)
})

// 监听批量变更
cache.on('batchChanged', changes => {
  console.log(`批量更新了 ${changes.length} 个配置项`)
})
```

## 最佳实践

### 1. 配置文件组织

```
config/
├── base.json5          # 基础配置
├── development.json5   # 开发环境配置
├── production.json5    # 生产环境配置
└── local.json5        # 本地配置（不提交到版本控制）
```

### 2. 环境变量优先级

```typescript
const configManager = new ConfigManager({
  configFile: 'config.json5',
  envPrefix: 'MYAPP',
  // 环境变量会覆盖文件配置
})
```

### 3. 配置验证

```typescript
import { ConfigValidator } from '@ldesign/kit/config'

const validator = new ConfigValidator()

// 设置配置模式
validator.setSchema({
  database: {
    type: 'object',
    properties: {
      host: { type: 'string', required: true },
      port: { type: 'number', minimum: 1, maximum: 65535 },
    },
  },
})

// 验证配置
const result = await validator.validate(config)
if (!result.valid) {
  console.error('配置验证失败:', result.errors)
}
```

### 4. 性能优化

```typescript
// 使用配置缓存减少文件读取
const cache = new ConfigCache({
  maxSize: 1000,
  ttl: 300000, // 5 minutes
})

// 启用压缩和加密（如需要）
const cache = new ConfigCache({
  enableCompression: true,
  enableEncryption: true,
  encryptionKey: process.env.CONFIG_ENCRYPTION_KEY,
})
```

## 故障排除

### 常见问题

1. **配置文件格式错误**

   ```typescript
   // 检查配置文件语法
   try {
     await loader.load('config.json5')
   } catch (error) {
     console.error('配置文件格式错误:', error.message)
   }
   ```

2. **热重载不工作**

   ```typescript
   // 检查文件监听状态
   const stats = hotReload.getStats()
   console.log('热重载状态:', stats)
   ```

3. **配置缓存过期**

   ```typescript
   // 手动清理过期缓存
   cache.cleanup()

   // 或者调整 TTL
   cache.updateOptions({ ttl: 600000 }) // 10 minutes
   ```

### 调试模式

```typescript
// 启用详细日志
const hotReload = new ConfigHotReload(cache, loader, {
  debug: true,
})

// 监听所有事件
hotReload.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```
