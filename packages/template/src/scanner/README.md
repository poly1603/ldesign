# 模板扫描器 (Template Scanner)

## 📋 概述

模板扫描器是Vue3模板管理系统的核心模块，负责自动发现、解析和管理模板文件。它提供了强大的文件系统扫描能力，支持缓存、热更新和实时监听等功能。

## ✨ 主要特性

- **🔍 智能扫描**：自动发现模板目录中的所有模板文件
- **📁 层次结构**：支持分类/设备/模板名称的目录结构
- **⚡ 高性能缓存**：内置LRU缓存机制，提升扫描性能
- **🔄 实时监听**：支持文件变化的实时监听和热更新
- **🎯 灵活过滤**：支持文件扩展名、路径模式等多种过滤方式
- **📊 详细统计**：提供扫描结果的详细统计信息
- **🛠️ 高度可配置**：丰富的配置选项满足不同需求

## 🚀 快速开始

### 基础使用

```typescript
import { TemplateScanner } from '@ldesign/template/scanner'

// 创建扫描器实例
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true,
  watchMode: false
})

// 执行扫描
const result = await scanner.scan()
console.log('扫描结果:', result)

// 获取特定分类的模板
const loginTemplates = scanner.getTemplatesByCategory('login')
console.log('登录模板:', loginTemplates)
```

### 高级配置

```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true,
  maxDepth: 5,
  includeExtensions: ['.vue', '.tsx', '.js', '.ts'],
  excludePatterns: ['node_modules', '.git', 'dist'],
  watchMode: true,
  debounceDelay: 300,
  batchSize: 10
}, {
  onScanComplete: (result) => {
    console.log('扫描完成:', result.stats)
  },
  onScanError: (error) => {
    console.error('扫描错误:', error)
  },
  onTemplateFound: (template) => {
    console.log('发现模板:', template.name)
  }
})
```

## ⚙️ 配置选项

### ScannerOptions

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `templatesDir` | string | 必需 | 模板根目录路径 |
| `enableCache` | boolean | true | 是否启用缓存 |
| `maxDepth` | number | 5 | 最大扫描深度 |
| `includeExtensions` | string[] | ['.vue', '.js', '.ts', '.css', '.less', '.scss'] | 包含的文件扩展名 |
| `excludePatterns` | string[] | ['node_modules', '.git'] | 排除的路径模式 |
| `watchMode` | boolean | false | 是否启用文件监听模式 |
| `debounceDelay` | number | 300 | 防抖延迟时间(ms) |
| `batchSize` | number | 10 | 批处理大小 |

### ScannerCallbacks

| 回调 | 类型 | 描述 |
|------|------|------|
| `onScanComplete` | (result: ScanResult) => void | 扫描完成回调 |
| `onScanError` | (error: Error) => void | 扫描错误回调 |
| `onTemplateFound` | (template: TemplateMetadata) => void | 发现模板回调 |

## 📁 目录结构

扫描器期望的模板目录结构：

```
templates/
├── login/                    # 分类目录
│   ├── desktop/             # 设备类型目录
│   │   ├── default/         # 模板名称目录
│   │   │   ├── index.vue    # 主组件文件
│   │   │   ├── config.ts    # 配置文件
│   │   │   ├── style.css    # 样式文件
│   │   │   └── preview.png  # 预览图片
│   │   └── modern/
│   ├── tablet/
│   └── mobile/
├── dashboard/
└── user/
```

## 🔍 API 参考

### TemplateScanner 类

#### 构造函数

```typescript
constructor(
  options: ScannerOptions,
  callbacks?: ScannerCallbacks
)
```

#### 主要方法

##### scan()

执行模板扫描

```typescript
async scan(): Promise<ScanResult>
```

**返回值：**
- `ScanResult` - 扫描结果对象

##### getTemplates()

获取所有模板

```typescript
getTemplates(): Map<string, TemplateMetadata>
```

##### getTemplatesByCategory()

按分类获取模板

```typescript
getTemplatesByCategory(category: string): TemplateMetadata[]
```

##### getTemplatesByDevice()

按设备类型获取模板

```typescript
getTemplatesByDevice(device: DeviceType): TemplateMetadata[]
```

##### searchTemplates()

搜索模板

```typescript
searchTemplates(filter: TemplateFilter): TemplateMetadata[]
```

##### startWatching()

启动文件监听

```typescript
async startWatching(): Promise<void>
```

##### stopWatching()

停止文件监听

```typescript
async stopWatching(): Promise<void>
```

##### clearCache()

清除缓存

```typescript
clearCache(): void
```

## 📊 扫描结果

### ScanResult 接口

```typescript
interface ScanResult {
  templates: Map<string, TemplateMetadata>
  stats: ScanStats
  errors: ScanError[]
  timestamp: number
}
```

### ScanStats 接口

```typescript
interface ScanStats {
  totalTemplates: number
  totalFiles: number
  scanDuration: number
  cacheHits: number
  byCategory: Record<string, number>
  byDevice: Record<string, number>
  byFileType: Record<string, number>
}
```

## 🔄 文件监听

扫描器支持实时文件监听，当模板文件发生变化时自动更新：

```typescript
// 启用监听模式
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  watchMode: true,
  debounceDelay: 300
}, {
  onTemplateFound: (template) => {
    console.log('新增模板:', template.name)
  }
})

// 手动启动监听
await scanner.startWatching()

// 停止监听
await scanner.stopWatching()
```

## 🎯 过滤和搜索

### 模板过滤

```typescript
const filter: TemplateFilter = {
  categories: ['login', 'dashboard'],
  devices: ['desktop', 'mobile'],
  tags: ['modern', 'responsive'],
  keyword: '登录'
}

const filteredTemplates = scanner.searchTemplates(filter)
```

### 排序选项

```typescript
const sortedTemplates = scanner.sortTemplates(templates, {
  field: 'name',
  direction: 'asc'
})
```

## 🚀 性能优化

### 缓存策略

```typescript
// 启用缓存
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true
})

// 清除缓存
scanner.clearCache()

// 获取缓存统计
const stats = scanner.getCacheStats()
```

### 批处理

```typescript
// 配置批处理大小
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  batchSize: 20 // 每批处理20个文件
})
```

## 🛠️ 故障排除

### 常见问题

**Q: 扫描器找不到模板文件？**
A: 检查 `templatesDir` 路径是否正确，确保目录存在且有读取权限。

**Q: 扫描速度很慢？**
A: 启用缓存 (`enableCache: true`) 并适当调整 `batchSize` 参数。

**Q: 文件监听不工作？**
A: 确保 `watchMode: true` 并检查文件系统权限。

### 调试模式

```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  debug: true // 启用调试输出
})
```

## 📝 最佳实践

1. **合理设置缓存**：在开发环境可以禁用缓存，生产环境启用缓存
2. **优化扫描深度**：根据实际目录结构设置合适的 `maxDepth`
3. **使用文件过滤**：通过 `excludePatterns` 排除不必要的文件
4. **监听模式使用**：只在开发环境启用 `watchMode`
5. **错误处理**：始终监听 `onScanError` 回调处理扫描错误

## 🔗 相关模块

- [配置管理器](../config/README.md)
- [缓存系统](../utils/cache/README.md)
- [文件监听器](../utils/file-watcher/README.md)
- [模板分类管理器](../utils/template-category-manager/README.md)

## 📄 许可证

MIT License - 详见 [LICENSE](../../../LICENSE) 文件
