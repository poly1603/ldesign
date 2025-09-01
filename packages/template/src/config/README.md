# 配置管理器 (Configuration Manager)

## 📋 概述

配置管理器是Vue3模板管理系统的配置中心，提供统一的配置管理、验证、持久化和热更新功能。支持环境变量、配置验证、事件监听等高级特性。

## ✨ 主要特性

- **🔧 统一配置**：集中管理所有系统配置
- **✅ 配置验证**：内置配置验证和错误修复
- **🌍 环境变量**：支持从环境变量加载配置
- **📡 事件监听**：配置变更的实时事件通知
- **💾 持久化**：配置的导入导出功能
- **🔄 热更新**：运行时动态更新配置
- **🛡️ 类型安全**：完整的TypeScript类型支持

## 🚀 快速开始

### 基础使用

```typescript
import { TemplateConfigManager } from '@ldesign/template/config'

// 创建配置管理器
const configManager = new TemplateConfigManager({
  templatesDir: 'src/templates',
  autoScan: true,
  enableHMR: false,
  debug: false
})

// 获取配置
const config = configManager.getConfig()
console.log('当前配置:', config)

// 更新配置
configManager.set('debug', true)
configManager.set('scanner.maxDepth', 10)
```

### 全局配置管理器

```typescript
import { getConfigManager } from '@ldesign/template/config'

// 获取全局单例实例
const configManager = getConfigManager({
  templatesDir: 'src/templates',
  debug: true
})

// 在应用的任何地方使用
const config = configManager.getConfig()
```

## ⚙️ 配置选项

### TemplateSystemConfig

```typescript
interface TemplateSystemConfig {
  // 基础配置
  templatesDir: string // 模板目录路径
  autoScan: boolean // 是否自动扫描
  enableHMR: boolean // 是否启用热更新
  defaultDevice: DeviceType // 默认设备类型
  debug: boolean // 调试模式

  // 扫描器配置
  scanner: {
    maxDepth: number // 最大扫描深度
    includeExtensions: string[] // 包含的文件扩展名
    excludePatterns: string[] // 排除的路径模式
    enableCache: boolean // 是否启用缓存
    watchMode: boolean // 是否启用监听模式
    debounceDelay: number // 防抖延迟
    batchSize: number // 批处理大小
  }

  // 缓存配置
  cache: {
    enabled: boolean // 是否启用缓存
    strategy: 'lru' | 'fifo' // 缓存策略
    maxSize: number // 最大缓存大小
    ttl: number // 缓存过期时间
  }

  // 错误处理配置
  errorHandling: {
    enableReporting: boolean // 是否启用错误报告
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
}
```

## 🔧 API 参考

### TemplateConfigManager 类

#### 构造函数

```typescript
constructor(initialConfig?: Partial<TemplateSystemConfig>)
```

#### 主要方法

##### getConfig()

获取完整配置对象

```typescript
getConfig(): TemplateSystemConfig
```

##### get()

获取指定路径的配置值

```typescript
get<T>(path: string): T | undefined

// 示例
const templatesDir = configManager.get('templatesDir')
const maxDepth = configManager.get('scanner.maxDepth')
```

##### set()

设置指定路径的配置值

```typescript
set<T>(path: string, value: T): void

// 示例
configManager.set('debug', true)
configManager.set('cache.maxSize', 100)
```

##### updateConfig()

批量更新配置

```typescript
updateConfig(updates: Partial<TemplateSystemConfig>): void

// 示例
configManager.updateConfig({
  debug: true,
  scanner: {
    maxDepth: 10,
    enableCache: false
  }
})
```

##### validateConfig()

验证配置对象

```typescript
validateConfig(config: any): ValidationResult

interface ValidationResult {
  valid: boolean
  errors: string[]
  fixedConfig?: TemplateSystemConfig
}
```

##### exportConfig()

导出配置为JSON字符串

```typescript
exportConfig(): string
```

##### importConfig()

从JSON字符串导入配置

```typescript
importConfig(configJson: string): void
```

## 📡 事件监听

### 添加监听器

```typescript
const unsubscribe = configManager.addListener((event) => {
  console.log('配置变更:', event)
})

// 移除监听器
unsubscribe()
```

### 事件类型

```typescript
interface ConfigUpdateEvent {
  path: string // 配置路径
  oldValue: any // 旧值
  newValue: any // 新值
  timestamp: number // 时间戳
}
```

### 监听特定配置

```typescript
// 监听调试模式变更
configManager.addListener((event) => {
  if (event.path === 'debug') {
    console.log('调试模式变更:', event.newValue)
  }
})

// 监听扫描器配置变更
configManager.addListener((event) => {
  if (event.path.startsWith('scanner.')) {
    console.log('扫描器配置变更:', event.path, event.newValue)
  }
})
```

## 🌍 环境变量支持

配置管理器支持从环境变量自动加载配置：

### 环境变量命名规则

```bash
# 基础配置
TEMPLATE_TEMPLATES_DIR=src/templates
TEMPLATE_AUTO_SCAN=true
TEMPLATE_ENABLE_HMR=false
TEMPLATE_DEBUG=true

# 嵌套配置（使用下划线分隔）
TEMPLATE_SCANNER_MAX_DEPTH=10
TEMPLATE_SCANNER_ENABLE_CACHE=true
TEMPLATE_CACHE_MAX_SIZE=100
```

### 类型转换

环境变量会自动转换为正确的类型：

```typescript
// 字符串
TEMPLATE_TEMPLATES_DIR=src/templates → templatesDir: 'src/templates'

// 布尔值
TEMPLATE_DEBUG=true → debug: true
TEMPLATE_AUTO_SCAN=false → autoScan: false

// 数字
TEMPLATE_SCANNER_MAX_DEPTH=10 → scanner.maxDepth: 10

// 数组（逗号分隔）
TEMPLATE_SCANNER_INCLUDE_EXTENSIONS=.vue,.js,.ts → scanner.includeExtensions: ['.vue', '.js', '.ts']
```

## ✅ 配置验证

### 内置验证规则

```typescript
// 验证配置
const result = configManager.validateConfig({
  templatesDir: '', // 无效：空字符串
  scanner: {
    maxDepth: -1 // 无效：负数
  }
})

if (!result.valid) {
  console.log('配置错误:', result.errors)

  // 使用修复后的配置
  if (result.fixedConfig) {
    configManager.updateConfig(result.fixedConfig)
  }
}
```

### 自定义验证

```typescript
// 扩展验证规则
class CustomConfigManager extends TemplateConfigManager {
  validateConfig(config: any): ValidationResult {
    const result = super.validateConfig(config)

    // 添加自定义验证逻辑
    if (config.templatesDir && !config.templatesDir.startsWith('src/')) {
      result.valid = false
      result.errors.push('模板目录必须在src目录下')
    }

    return result
  }
}
```

## 💾 配置持久化

### 导出配置

```typescript
// 导出当前配置
// 保存到文件
import fs from 'node:fs'

const configJson = configManager.exportConfig()
fs.writeFileSync('config.json', configJson)
```

### 导入配置

```typescript
// 从文件加载配置
import fs from 'node:fs'
const configJson = fs.readFileSync('config.json', 'utf-8')

// 导入配置
configManager.importConfig(configJson)
```

### 配置备份和恢复

```typescript
// 备份当前配置
const backup = configManager.exportConfig()

// 修改配置
configManager.set('debug', true)

// 恢复配置
configManager.importConfig(backup)
```

## 🔄 热更新集成

配置管理器与热更新系统无缝集成：

```typescript
import { getHotReloadManager } from '@ldesign/template/utils'

const configManager = getConfigManager()
const hotReloadManager = getHotReloadManager()

// 监听配置文件变化
hotReloadManager.addListener((event) => {
  if (event.type === 'config-updated') {
    // 重新加载配置
    configManager.reloadConfig()
  }
})
```

## 🛠️ 故障排除

### 常见问题

**Q: 环境变量不生效？**
A: 检查环境变量命名是否正确，确保使用 `TEMPLATE_` 前缀。

**Q: 配置验证失败？**
A: 使用 `validateConfig()` 方法查看具体错误信息。

**Q: 配置更新不触发事件？**
A: 确保使用 `set()` 或 `updateConfig()` 方法更新配置。

### 调试模式

```typescript
const configManager = new TemplateConfigManager({
  debug: true // 启用调试输出
})

// 查看配置加载过程
configManager.addListener((event) => {
  console.log('配置变更:', event)
})
```

## 📝 最佳实践

1. **使用全局实例**：在应用中使用 `getConfigManager()` 获取单例实例
2. **环境变量优先**：生产环境使用环境变量覆盖默认配置
3. **配置验证**：始终验证外部配置输入
4. **事件监听**：监听关键配置变更并做出响应
5. **配置备份**：重要配置变更前先备份

## 🔗 相关模块

- [模板扫描器](../scanner/README.md)
- [缓存系统](../utils/cache/README.md)
- [热更新管理器](../utils/hot-reload-manager/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
