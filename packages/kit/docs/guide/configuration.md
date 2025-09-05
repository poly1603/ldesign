# 配置指南

本指南介绍如何配置和自定义 @ldesign/kit 的各个模块。

## 全局配置

### 环境变量

@ldesign/kit 支持通过环境变量进行全局配置：

```bash
# 设置默认缓存 TTL（秒）
LDESIGN_CACHE_DEFAULT_TTL=3600

# 设置默认缓存大小
LDESIGN_CACHE_MAX_SIZE=1000

# 设置日志级别
LDESIGN_LOG_LEVEL=info

# 设置临时目录
LDESIGN_TEMP_DIR=/tmp/ldesign

# 设置性能监控采样率
LDESIGN_PERFORMANCE_SAMPLE_RATE=0.1
```

### 配置文件

您可以创建一个配置文件来统一管理设置：

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/kit/config'

export default defineConfig({
  cache: {
    defaultTTL: 3600,
    maxSize: 1000,
    strategy: 'lru',
  },
  filesystem: {
    tempDir: './temp',
    watchOptions: {
      ignored: /node_modules/,
      persistent: true,
    },
  },
  validation: {
    stopOnFirstError: false,
    locale: 'zh-CN',
  },
  performance: {
    enabled: true,
    sampleRate: 0.1,
    maxMetrics: 1000,
  },
  notification: {
    appName: 'My Application',
    sound: true,
    timeout: 5000,
  },
})
```

## 模块配置

### Cache 模块配置

```typescript
import { CacheManager } from '@ldesign/kit'

// 内存缓存配置
const memoryCache = CacheManager.create({
  type: 'memory',
  defaultTTL: 3600, // 默认过期时间（秒）
  maxSize: 1000, // 最大缓存项数
  strategy: 'lru', // 驱逐策略：lru, fifo, lfu
  checkPeriod: 600, // 过期检查间隔（秒）
  enableEvents: true, // 启用事件
  serialize: true, // 序列化存储
})

// 文件缓存配置
const fileCache = CacheManager.create({
  type: 'file',
  cacheDir: './cache', // 缓存目录
  defaultTTL: 86400, // 24小时
  maxSize: 100, // 最大文件数
  compression: true, // 启用压缩
  encryption: {
    // 加密配置
    enabled: true,
    algorithm: 'aes-256-gcm',
    key: process.env.CACHE_ENCRYPTION_KEY,
  },
})
```

### FileSystem 模块配置

```typescript
import { FileSystem } from '@ldesign/kit'

// 文件监听配置
const watcher = FileSystem.createWatcher('./src', {
  recursive: true, // 递归监听
  ignored: [
    // 忽略的文件/目录
    /node_modules/,
    /\.git/,
    /dist/,
  ],
  persistent: true, // 持久监听
  followSymlinks: false, // 不跟随符号链接
  depth: 10, // 最大深度
  awaitWriteFinish: {
    // 等待写入完成
    stabilityThreshold: 2000,
    pollInterval: 100,
  },
})

// 文件操作配置
FileSystem.configure({
  defaultEncoding: 'utf8',
  tempDir: './temp',
  backupOnWrite: true, // 写入前备份
  atomicWrites: true, // 原子写入
  permissions: {
    file: 0o644,
    directory: 0o755,
  },
})
```

### Validation 模块配置

```typescript
import { Validator } from '@ldesign/kit'

const validator = Validator.create({
  stopOnFirstError: false, // 不在第一个错误时停止
  locale: 'zh-CN', // 错误消息语言
  customMessages: {
    // 自定义错误消息
    required: '{{field}} 是必填项',
    email: '{{field}} 格式不正确',
    minLength: '{{field}} 至少需要 {{min}} 个字符',
  },
  fieldNameMap: {
    // 字段名映射
    email: '邮箱地址',
    password: '密码',
    confirmPassword: '确认密码',
  },
  async: {
    // 异步验证配置
    timeout: 5000, // 超时时间
    concurrent: 3, // 并发数
  },
})
```

### Git 模块配置

```typescript
import { GitManager } from '@ldesign/kit'

const git = new GitManager('./my-repo', {
  author: {
    name: 'Your Name',
    email: 'your.email@example.com',
  },
  remote: {
    name: 'origin',
    url: 'https://github.com/user/repo.git',
  },
  hooks: {
    // Git hooks
    preCommit: async () => {
      console.log('运行预提交检查...')
      // 运行测试、代码检查等
    },
    postCommit: async () => {
      console.log('提交完成')
    },
  },
  options: {
    gpgSign: false, // GPG 签名
    verbose: true, // 详细输出
    timeout: 30000, // 操作超时
  },
})
```

### SSL 模块配置

```typescript
import { SSLManager } from '@ldesign/kit'

const sslManager = new SSLManager({
  keySize: 2048, // 密钥长度
  algorithm: 'rsa', // 算法类型
  validityDays: 365, // 有效期（天）
  country: 'CN', // 国家
  state: 'Beijing', // 省份
  city: 'Beijing', // 城市
  organization: 'My Org', // 组织
  unit: 'IT Department', // 部门
  extensions: {
    // 扩展
    subjectAltName: ['DNS:localhost', 'DNS:*.example.com', 'IP:127.0.0.1'],
    keyUsage: ['digitalSignature', 'keyEncipherment'],
    extKeyUsage: ['serverAuth', 'clientAuth'],
  },
})
```

### CLI 模块配置

```typescript
import { CLIManager } from '@ldesign/kit'

const cli = new CLIManager({
  name: 'my-tool',
  version: '1.0.0',
  description: '我的命令行工具',
  usage: 'my-tool <command> [options]',
  helpOption: '-h, --help',
  versionOption: '-v, --version',
  colors: true, // 启用颜色
  suggestions: true, // 启用命令建议
  globalOptions: [
    // 全局选项
    {
      name: 'verbose',
      description: '详细输出',
      type: 'boolean',
      alias: 'v',
    },
    {
      name: 'config',
      description: '配置文件路径',
      type: 'string',
      alias: 'c',
    },
  ],
  middleware: [
    // 中间件
    async (ctx, next) => {
      console.log(`执行命令: ${ctx.command}`)
      await next()
    },
  ],
})
```

### Performance 模块配置

```typescript
import { PerformanceMonitor } from '@ldesign/kit'

const monitor = PerformanceMonitor.create({
  enabled: true, // 启用监控
  sampleRate: 0.1, // 采样率
  maxMetrics: 1000, // 最大指标数
  enableMemory: true, // 启用内存监控
  enableCPU: true, // 启用 CPU 监控
  enableGC: true, // 启用 GC 监控
  flushInterval: 60000, // 刷新间隔（毫秒）
  storage: {
    // 存储配置
    type: 'file',
    path: './performance.log',
    format: 'json',
  },
  alerts: {
    // 告警配置
    memoryThreshold: 0.8, // 内存使用率阈值
    cpuThreshold: 0.9, // CPU 使用率阈值
    responseTimeThreshold: 1000, // 响应时间阈值（毫秒）
  },
})
```

### Notification 模块配置

```typescript
import { NotificationManager } from '@ldesign/kit'

const notificationManager = NotificationManager.create({
  appName: 'My Application',
  appIcon: './icon.png', // 应用图标
  sound: true, // 启用声音
  timeout: 5000, // 超时时间（毫秒）
  position: 'topRight', // 位置
  maxNotifications: 5, // 最大通知数
  template: {
    // 模板配置
    success: {
      icon: '✅',
      color: '#4CAF50',
    },
    error: {
      icon: '❌',
      color: '#F44336',
    },
    warning: {
      icon: '⚠️',
      color: '#FF9800',
    },
    info: {
      icon: 'ℹ️',
      color: '#2196F3',
    },
  },
  platforms: {
    // 平台特定配置
    windows: {
      toastActivatorCLSID: '{...}',
    },
    macos: {
      bundleId: 'com.example.myapp',
    },
    linux: {
      urgency: 'normal',
    },
  },
})
```

## 配置文件示例

### 完整配置文件

```typescript
// config/ldesign.config.ts
export default {
  // 全局设置
  global: {
    tempDir: './temp',
    logLevel: 'info',
    locale: 'zh-CN',
  },

  // 缓存配置
  cache: {
    memory: {
      defaultTTL: 3600,
      maxSize: 1000,
      strategy: 'lru',
    },
    file: {
      cacheDir: './cache',
      compression: true,
      encryption: {
        enabled: false,
      },
    },
  },

  // 文件系统配置
  filesystem: {
    defaultEncoding: 'utf8',
    backupOnWrite: false,
    atomicWrites: true,
    watch: {
      ignored: [/node_modules/, /\.git/],
      persistent: true,
    },
  },

  // 验证配置
  validation: {
    stopOnFirstError: false,
    locale: 'zh-CN',
    async: {
      timeout: 5000,
      concurrent: 3,
    },
  },

  // 性能监控配置
  performance: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1,
    storage: {
      type: 'file',
      path: './logs/performance.log',
    },
  },

  // 通知配置
  notification: {
    appName: process.env.APP_NAME || 'My App',
    sound: true,
    timeout: 5000,
  },
}
```

### 环境特定配置

```typescript
// config/development.ts
export default {
  cache: {
    memory: {
      defaultTTL: 300, // 开发环境短缓存
      maxSize: 100,
    },
  },
  performance: {
    enabled: false, // 开发环境禁用性能监控
  },
  validation: {
    stopOnFirstError: true, // 开发环境快速失败
  },
}

// config/production.ts
export default {
  cache: {
    memory: {
      defaultTTL: 3600,
      maxSize: 10000,
    },
    file: {
      encryption: {
        enabled: true, // 生产环境启用加密
      },
    },
  },
  performance: {
    enabled: true,
    sampleRate: 0.01, // 生产环境低采样率
  },
}
```

## 配置加载

```typescript
import { loadConfig } from '@ldesign/kit/config'

// 自动加载配置
const config = await loadConfig()

// 指定配置文件
const config = await loadConfig('./my-config.ts')

// 合并多个配置
const config = await loadConfig(['./base.config.ts', `./env/${process.env.NODE_ENV}.config.ts`])
```

## 运行时配置更新

```typescript
import { ConfigManager } from '@ldesign/kit'

const configManager = ConfigManager.getInstance()

// 更新配置
configManager.update('cache.defaultTTL', 7200)

// 监听配置变化
configManager.on('change', (key, newValue, oldValue) => {
  console.log(`配置 ${key} 从 ${oldValue} 更新为 ${newValue}`)
})

// 重置配置
configManager.reset()
```

## 最佳实践

1. **环境分离**：为不同环境创建不同的配置文件
2. **敏感信息**：使用环境变量存储敏感配置
3. **类型安全**：使用 TypeScript 定义配置类型
4. **验证配置**：在应用启动时验证配置的有效性
5. **文档化**：为每个配置项添加注释说明

## 下一步

- 查看 [集成指南](./integration/) 了解如何在不同项目中集成
- 阅读 [最佳实践](/best-practices/) 了解配置优化建议
- 查看 [API 参考](/api/) 了解各模块的详细配置选项
