# 工具函数模块 (Utils)

## 📋 概述

工具函数模块提供了Vue3模板管理系统所需的各种实用工具和辅助功能，包括缓存管理、文件监听、热更新、模板分类管理等核心功能。

## 📁 模块结构

```
utils/
├── cache/                    # 缓存系统
│   ├── lru-cache.ts         # LRU缓存实现
│   ├── component-cache.ts   # 组件缓存
│   └── README.md
├── file-watcher/            # 文件监听器
│   ├── index.ts
│   └── README.md
├── hot-reload-manager/      # 热更新管理器
│   ├── index.ts
│   └── README.md
├── template-category-manager/ # 模板分类管理器
│   ├── index.ts
│   └── README.md
├── path.ts                  # 路径工具函数
├── validation.ts            # 验证工具函数
├── format.ts               # 格式化工具函数
└── index.ts                # 统一导出
```

## 🚀 快速开始

### 统一导入

```typescript
import {
  ComponentCache,
  FileWatcher,
  formatUtils,
  HotReloadManager,
  LRUCache,
  pathUtils,
  TemplateCategoryManager,
  validationUtils
} from '@ldesign/template/utils'
```

### 分模块导入

```typescript
// 缓存系统
import { ComponentCache, LRUCache } from '@ldesign/template/utils/cache'

// 文件监听
import { FileWatcher } from '@ldesign/template/utils/file-watcher'

// 热更新管理
import { HotReloadManager } from '@ldesign/template/utils/hot-reload-manager'

// 模板分类管理
import { TemplateCategoryManager } from '@ldesign/template/utils/template-category-manager'
```

## 🔧 核心工具模块

### 1. 缓存系统 (Cache)

提供高性能的缓存解决方案：

```typescript
import { ComponentCache, LRUCache } from '@ldesign/template/utils/cache'

// LRU缓存
const cache = new LRUCache<string>({ maxSize: 100, ttl: 60000 })
cache.set('key', 'value')
const value = cache.get('key')

// 组件缓存
const componentCache = new ComponentCache({ maxSize: 50 })
componentCache.setComponent('login', 'desktop', 'default', component)
const cachedComponent = componentCache.getComponent('login', 'desktop', 'default')
```

**详细文档**: [缓存系统 README](./cache/README.md)

### 2. 文件监听器 (File Watcher)

监听文件系统变化：

```typescript
import { FileWatcher } from '@ldesign/template/utils/file-watcher'

const watcher = new FileWatcher({
  rootDir: 'src/templates',
  includeExtensions: ['.vue', '.ts'],
  excludePatterns: ['node_modules']
}, {
  onTemplateChange: (event) => {
    console.log('模板变化:', event)
  }
})

await watcher.startWatching()
```

**详细文档**: [文件监听器 README](./file-watcher/README.md)

### 3. 热更新管理器 (Hot Reload Manager)

管理开发环境的热更新：

```typescript
import { HotReloadManager } from '@ldesign/template/utils/hot-reload-manager'

const hotReloadManager = new HotReloadManager({
  enabled: true,
  debug: false
})

hotReloadManager.addListener((event) => {
  console.log('热更新事件:', event)
})
```

**详细文档**: [热更新管理器 README](./hot-reload-manager/README.md)

### 4. 模板分类管理器 (Template Category Manager)

管理模板分类和标签：

```typescript
import { TemplateCategoryManager } from '@ldesign/template/utils/template-category-manager'

const categoryManager = new TemplateCategoryManager()

// 过滤模板
const filtered = categoryManager.filterTemplates(templates, {
  categories: ['login'],
  tags: ['modern']
})

// 排序模板
const sorted = categoryManager.sortTemplates(templates, {
  field: 'name',
  direction: 'asc'
})
```

**详细文档**: [模板分类管理器 README](./template-category-manager/README.md)

## 🛠️ 辅助工具函数

### 路径工具 (Path Utils)

```typescript
import { pathUtils } from '@ldesign/template/utils'

// 规范化路径
const normalizedPath = pathUtils.normalize('/path//to///file')

// 解析模板路径
const templateInfo = pathUtils.parseTemplatePath('templates/login/desktop/default/index.vue')
// { category: 'login', device: 'desktop', templateName: 'default', fileName: 'index.vue' }

// 构建模板路径
const templatePath = pathUtils.buildTemplatePath('login', 'desktop', 'default', 'index.vue')

// 检查路径是否在指定目录下
const isInside = pathUtils.isInsideDirectory('/path/to/file', '/path/to')
```

### 验证工具 (Validation Utils)

```typescript
import { validationUtils } from '@ldesign/template/utils'

// 验证模板元数据
const isValid = validationUtils.validateTemplateMetadata(metadata)

// 验证配置对象
const configResult = validationUtils.validateConfig(config)

// 验证文件扩展名
const hasValidExtension = validationUtils.isValidExtension('.vue', ['.vue', '.js', '.ts'])

// 验证设备类型
const isValidDevice = validationUtils.isValidDeviceType('desktop')
```

### 格式化工具 (Format Utils)

```typescript
import { formatUtils } from '@ldesign/template/utils'

// 格式化文件大小
const fileSize = formatUtils.formatFileSize(1024) // "1 KB"

// 格式化时间
const timeAgo = formatUtils.formatTimeAgo(Date.now() - 60000) // "1分钟前"

// 格式化模板名称
const displayName = formatUtils.formatTemplateName('login-modern-v2')

// 格式化错误信息
const errorMessage = formatUtils.formatError(error)
```

## 📊 性能监控

### 性能统计

```typescript
import { performanceUtils } from '@ldesign/template/utils'

// 开始性能监控
const timer = performanceUtils.startTimer('template-scan')

// 执行操作
await scanner.scan()

// 结束监控
const duration = timer.end()
console.log('扫描耗时:', duration, 'ms')

// 获取性能统计
const stats = performanceUtils.getStats()
console.log('性能统计:', stats)
```

### 内存监控

```typescript
// 监控内存使用
const memoryUsage = performanceUtils.getMemoryUsage()
console.log('内存使用:', memoryUsage)

// 垃圾回收建议
if (performanceUtils.shouldGarbageCollect()) {
  performanceUtils.forceGarbageCollect()
}
```

## 🔍 调试工具

### 日志工具

```typescript
import { debugUtils } from '@ldesign/template/utils'

// 创建调试器
const debug = debugUtils.createDebugger('template:scanner')

debug('开始扫描模板')
debug('发现模板: %s', templateName)
debug('扫描完成，共发现 %d 个模板', count)
```

### 错误追踪

```typescript
// 错误上下文
const errorContext = debugUtils.createErrorContext({
  operation: 'template-scan',
  templateDir: 'src/templates'
})

try {
  await scanner.scan()
}
catch (error) {
  debugUtils.reportError(error, errorContext)
}
```

## 🧪 测试工具

### 模拟数据生成

```typescript
import { testUtils } from '@ldesign/template/utils'

// 生成模拟模板数据
const mockTemplate = testUtils.createMockTemplate({
  name: 'test-template',
  category: 'login'
})

// 生成模拟配置
const mockConfig = testUtils.createMockConfig({
  templatesDir: 'test/templates'
})

// 创建临时目录
const tempDir = await testUtils.createTempDirectory()
```

### 断言工具

```typescript
// 模板断言
testUtils.assertTemplateValid(template)
testUtils.assertTemplateStructure(template, expectedStructure)

// 配置断言
testUtils.assertConfigValid(config)
testUtils.assertConfigComplete(config)
```

## 🔧 配置选项

### 全局配置

```typescript
import { configureUtils } from '@ldesign/template/utils'

// 配置工具函数
configureUtils({
  debug: true,
  performance: {
    enableMonitoring: true,
    sampleRate: 0.1
  },
  cache: {
    defaultTTL: 60000,
    maxMemoryUsage: 100 * 1024 * 1024 // 100MB
  }
})
```

## 🛠️ 故障排除

### 常见问题

**Q: 缓存占用内存过多？**
A: 调整缓存大小限制或启用TTL过期机制。

**Q: 文件监听不工作？**
A: 检查文件系统权限和监听路径是否正确。

**Q: 热更新延迟？**
A: 调整防抖延迟时间或检查HMR配置。

### 调试模式

```typescript
// 启用全局调试
process.env.DEBUG = 'template:*'

// 或者选择性启用
process.env.DEBUG = 'template:cache,template:scanner'
```

## 📝 最佳实践

1. **按需导入**：只导入需要的工具函数，减少包体积
2. **缓存策略**：合理配置缓存大小和过期时间
3. **错误处理**：使用统一的错误处理和报告机制
4. **性能监控**：在关键操作中添加性能监控
5. **测试覆盖**：使用测试工具确保代码质量

## 🔗 相关模块

- [模板扫描器](../scanner/README.md)
- [配置管理器](../config/README.md)
- [组合式函数](../composables/README.md)
- [Vue组件](../components/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
