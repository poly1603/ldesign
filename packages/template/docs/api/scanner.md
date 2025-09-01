# 模板扫描器 API

模板扫描器是 LDesign Template 的核心组件，负责自动发现、解析和管理模板文件。

## TemplateScanner

### 构造函数

```typescript
constructor(options: ScannerOptions, callbacks?: ScannerCallbacks)
```

#### ScannerOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `templatesDir` | `string` | 必需 | 模板根目录路径 |
| `enableCache` | `boolean` | `true` | 是否启用缓存 |
| `maxDepth` | `number` | `5` | 最大扫描深度 |
| `includeExtensions` | `string[]` | `['.vue', '.js', '.ts']` | 包含的文件扩展名 |
| `excludePatterns` | `string[]` | `['node_modules', '.git']` | 排除的路径模式 |
| `watchMode` | `boolean` | `false` | 是否启用文件监听模式 |
| `debounceDelay` | `number` | `300` | 防抖延迟时间(ms) |
| `batchSize` | `number` | `10` | 批处理大小 |

#### ScannerCallbacks

| 回调 | 类型 | 描述 |
|------|------|------|
| `onScanComplete` | `(result: ScanResult) => void` | 扫描完成回调 |
| `onScanError` | `(error: Error) => void` | 扫描错误回调 |
| `onTemplateFound` | `(template: TemplateMetadata) => void` | 发现模板回调 |

### 方法

#### scan()

执行模板扫描

```typescript
async scan(): Promise<ScanResult>
```

**返回值：**
- `ScanResult` - 扫描结果对象

**示例：**
```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates'
})

const result = await scanner.scan()
console.log(`发现 ${result.templates.size} 个模板`)
```

#### getTemplates()

获取所有模板

```typescript
getTemplates(): Map<string, TemplateMetadata>
```

**示例：**
```typescript
const templates = scanner.getTemplates()
for (const [name, template] of templates) {
  console.log(`模板: ${template.displayName}`)
}
```

#### getTemplatesByCategory()

按分类获取模板

```typescript
getTemplatesByCategory(category: string): TemplateMetadata[]
```

**参数：**
- `category` - 模板分类名称

**示例：**
```typescript
const loginTemplates = scanner.getTemplatesByCategory('login')
console.log(`登录模板数量: ${loginTemplates.length}`)
```

#### getTemplatesByDevice()

按设备类型获取模板

```typescript
getTemplatesByDevice(device: DeviceType): TemplateMetadata[]
```

**参数：**
- `device` - 设备类型 ('desktop' | 'tablet' | 'mobile')

**示例：**
```typescript
const mobileTemplates = scanner.getTemplatesByDevice('mobile')
console.log(`移动端模板数量: ${mobileTemplates.length}`)
```

#### searchTemplates()

搜索模板

```typescript
searchTemplates(filter: TemplateFilter): TemplateMetadata[]
```

**参数：**
- `filter` - 搜索过滤条件

**示例：**
```typescript
const modernTemplates = scanner.searchTemplates({
  tags: ['modern'],
  categories: ['login', 'dashboard']
})
```

#### startWatching()

启动文件监听

```typescript
async startWatching(): Promise<void>
```

**示例：**
```typescript
await scanner.startWatching()
console.log('文件监听已启动')
```

#### stopWatching()

停止文件监听

```typescript
async stopWatching(): Promise<void>
```

#### clearCache()

清除缓存

```typescript
clearCache(): void
```

## 类型定义

### ScanResult

```typescript
interface ScanResult {
  templates: Map<string, TemplateMetadata>
  stats: ScanStats
  errors: ScanError[]
  timestamp: number
}
```

### ScanStats

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

### TemplateFilter

```typescript
interface TemplateFilter {
  categories?: string[]
  devices?: DeviceType[]
  tags?: string[]
  keyword?: string
  author?: string
  isBuiltIn?: boolean
}
```

## 使用示例

### 基础扫描

```typescript
import { TemplateScanner } from '@ldesign/template'

const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true
})

// 执行扫描
const result = await scanner.scan()

// 查看统计信息
console.log('扫描统计:', result.stats)

// 获取所有模板
const templates = scanner.getTemplates()
```

### 带回调的扫描

```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates'
}, {
  onScanComplete: (result) => {
    console.log(`扫描完成，发现 ${result.templates.size} 个模板`)
  },
  onScanError: (error) => {
    console.error('扫描错误:', error)
  },
  onTemplateFound: (template) => {
    console.log(`发现模板: ${template.displayName}`)
  }
})

await scanner.scan()
```

### 文件监听

```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  watchMode: true,
  debounceDelay: 500
})

// 启动监听
await scanner.startWatching()

// 监听模板变化
scanner.on('template:added', (template) => {
  console.log('新增模板:', template.displayName)
})

scanner.on('template:updated', (template) => {
  console.log('更新模板:', template.displayName)
})

scanner.on('template:removed', (templateName) => {
  console.log('删除模板:', templateName)
})
```

### 高级搜索

```typescript
// 搜索现代风格的登录模板
const modernLoginTemplates = scanner.searchTemplates({
  categories: ['login'],
  tags: ['modern'],
  devices: ['desktop', 'mobile']
})

// 搜索特定作者的模板
const authorTemplates = scanner.searchTemplates({
  author: 'LDesign Team'
})

// 关键词搜索
const searchResults = scanner.searchTemplates({
  keyword: '登录'
})
```

### 性能优化

```typescript
const scanner = new TemplateScanner({
  templatesDir: 'src/templates',
  enableCache: true,
  batchSize: 20,
  maxDepth: 3,
  excludePatterns: [
    'node_modules',
    '.git',
    'dist',
    '*.test.*'
  ]
})

// 预热缓存
await scanner.scan()

// 获取缓存统计
const cacheStats = scanner.getCacheStats()
console.log('缓存命中率:', cacheStats.hitRate)
```

## 错误处理

```typescript
try {
  const result = await scanner.scan()

  if (result.errors.length > 0) {
    console.warn('扫描过程中发现错误:')
    result.errors.forEach((error) => {
      console.warn(`- ${error.path}: ${error.message}`)
    })
  }
}
catch (error) {
  console.error('扫描失败:', error)
}
```

## 最佳实践

1. **启用缓存**：在生产环境中启用缓存以提升性能
2. **合理设置深度**：根据项目结构设置合适的 `maxDepth`
3. **排除无关文件**：使用 `excludePatterns` 排除不必要的文件
4. **监听文件变化**：在开发环境启用 `watchMode`
5. **错误处理**：始终处理扫描错误和异常情况

## 相关链接

- [配置管理器 API](./config)
- [模板管理器 API](./template-manager)
- [类型定义](./types/template)
