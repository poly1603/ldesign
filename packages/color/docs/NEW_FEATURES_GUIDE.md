# 新功能使用指南

本指南介绍 @ldesign/color 最新添加的实用功能。

## 目录

1. [主题导入/导出](#主题导入导出)
2. [性能监控工具](#性能监控工具)

---

## 主题导入/导出

主题导入/导出功能让你可以轻松地保存、分享和备份颜色主题。

### 基础用法

#### 导出主题

```typescript
import { exportTheme } from '@ldesign/color'

const theme = {
  name: 'my-theme',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    danger: '#f5222d',
  },
}

// 导出为 JSON 字符串
const json = exportTheme(theme, {
  prettify: true,        // 美化 JSON
  author: 'Your Name',   // 作者信息
  tags: ['blue', 'modern'], // 标签
})

console.log(json)
```

输出示例：
```json
{
  "metadata": {
    "name": "my-theme",
    "version": "1.0.0",
    "createdAt": "2025-10-06T12:00:00.000Z",
    "author": "Your Name",
    "tags": ["blue", "modern"]
  },
  "theme": {
    "name": "my-theme",
    "colors": {
      "primary": "#1890ff",
      "success": "#52c41a",
      "warning": "#faad14",
      "danger": "#f5222d"
    }
  },
  "formatVersion": "1.0.0"
}
```

#### 导入主题

```typescript
import { importTheme } from '@ldesign/color'

const json = '...' // JSON 字符串

const theme = importTheme(json, {
  validate: true, // 验证主题格式
  onImported: (theme) => {
    console.log('主题已导入:', theme.name)
  },
})
```

### 文件操作

#### 导出到文件

```typescript
import { exportThemeToFile } from '@ldesign/color'

// 导出主题到文件（浏览器会自动下载）
exportThemeToFile(theme, 'my-theme.json', {
  prettify: true,
  author: 'Your Name',
})
```

#### 从文件导入

```typescript
import { importThemeFromFile } from '@ldesign/color'

// 在文件输入框的 change 事件中
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  
  try {
    const theme = await importThemeFromFile(file, {
      validate: true,
    })
    console.log('导入成功:', theme)
  } catch (error) {
    console.error('导入失败:', error)
  }
}
```

### 分享功能

#### 生成分享链接

```typescript
import { shareTheme } from '@ldesign/color'

const shareUrl = shareTheme(theme)
console.log('分享链接:', shareUrl)
// 输出: https://your-site.com?theme=eyJ0aGVtZSI6...
```

#### 从分享链接导入

```typescript
import { importThemeFromUrl } from '@ldesign/color'

// 自动从当前 URL 导入主题
const theme = importThemeFromUrl()

if (theme) {
  console.log('从 URL 导入主题:', theme.name)
}

// 或从指定 URL 导入
const theme2 = importThemeFromUrl('https://example.com?theme=...')
```

### 剪贴板操作

#### 复制到剪贴板

```typescript
import { copyThemeToClipboard } from '@ldesign/color'

await copyThemeToClipboard(theme, {
  prettify: true,
})

console.log('主题已复制到剪贴板')
```

#### 从剪贴板导入

```typescript
import { importThemeFromClipboard } from '@ldesign/color'

try {
  const theme = await importThemeFromClipboard({
    validate: true,
  })
  console.log('从剪贴板导入:', theme)
} catch (error) {
  console.error('导入失败:', error)
}
```

### 批量操作

#### 批量导出

```typescript
import { exportThemes } from '@ldesign/color'

const themes = [theme1, theme2, theme3]

const json = exportThemes(themes, {
  prettify: true,
})
```

#### 批量导入

```typescript
import { importThemes } from '@ldesign/color'

const themes = importThemes(json, {
  validate: true,
})

console.log(`导入了 ${themes.length} 个主题`)
```

### 主题验证

```typescript
import { validateTheme } from '@ldesign/color'

const validation = validateTheme(theme)

if (validation.valid) {
  console.log('主题有效')
} else {
  console.error('验证失败:', validation.errors)
  console.warn('警告:', validation.warnings)
}
```

---

## 性能监控工具

性能监控工具帮助你分析和优化颜色处理操作的性能。

### 基础用法

#### 测量性能

```typescript
import { measurePerformance } from '@ldesign/color'

const result = await measurePerformance('colorConversion', async () => {
  // 你的代码
  return hexToRgb('#1890ff')
})

console.log('结果:', result)
console.log('耗时:', result.metrics.duration, 'ms')
```

#### 手动监控

```typescript
import { globalPerformanceMonitor } from '@ldesign/color'

// 开始监控
globalPerformanceMonitor.start('myOperation', {
  input: '#1890ff',
})

// 执行操作
const result = hexToRgb('#1890ff')

// 结束监控
const metrics = globalPerformanceMonitor.end('myOperation')

console.log('耗时:', metrics.duration, 'ms')
console.log('内存:', metrics.memory)
```

### 基准测试

```typescript
import { benchmark } from '@ldesign/color'

const report = await benchmark(
  'colorConversion',
  () => hexToRgb('#1890ff'),
  100 // 运行 100 次
)

console.log('平均耗时:', report.averageDuration, 'ms')
console.log('最小耗时:', report.minDuration, 'ms')
console.log('最大耗时:', report.maxDuration, 'ms')
```

### 性能比较

```typescript
import { comparePerformance } from '@ldesign/color'

const comparison = await comparePerformance(
  {
    name: 'Method 1',
    fn: () => method1(),
  },
  {
    name: 'Method 2',
    fn: () => method2(),
  },
  100 // 每个方法运行 100 次
)

console.log('获胜者:', comparison.winner)
console.log('性能提升:', comparison.improvement.toFixed(2), '%')
```

### 装饰器

```typescript
import { monitored } from '@ldesign/color'

class ColorProcessor {
  @monitored('processColor')
  processColor(color: string) {
    // 这个方法的性能会被自动监控
    return hexToRgb(color)
  }
  
  @monitored() // 使用默认名称
  async processAsync(color: string) {
    return await someAsyncOperation(color)
  }
}
```

### 性能报告

#### 获取报告

```typescript
import { getPerformanceReport } from '@ldesign/color'

// 获取所有操作的报告
const report = getPerformanceReport()

// 获取特定操作的报告
const colorReport = getPerformanceReport('colorConversion')

console.log('总操作数:', report.totalOperations)
console.log('平均耗时:', report.averageDuration, 'ms')
```

#### 打印报告

```typescript
import { printPerformanceReport } from '@ldesign/color'

// 打印所有操作的报告
printPerformanceReport()

// 打印特定操作的报告
printPerformanceReport('colorConversion')
```

输出示例：
```
性能报告 - colorConversion
总操作数: 100
总耗时: 45.23ms
平均耗时: 0.45ms
最小耗时: 0.32ms
最大耗时: 1.23ms
平均内存: 0.12MB
峰值内存: 0.25MB
```

### 清除数据

```typescript
import { clearPerformanceData } from '@ldesign/color'

// 清除所有性能数据
clearPerformanceData()
```

### 高级用法

#### 自定义监控器

```typescript
import { PerformanceMonitor } from '@ldesign/color'

const monitor = new PerformanceMonitor(500) // 最多保存 500 条记录

monitor.start('operation1')
// ... 执行操作
monitor.end('operation1')

const report = monitor.getReport()
console.log(report)

// 导出数据
const data = monitor.export()
```

#### 监控内存使用

```typescript
const { result, metrics } = await measurePerformance('heavyOperation', () => {
  // 执行大量计算
  return processLargeDataset()
})

if (metrics.memory) {
  console.log('内存使用:', {
    used: (metrics.memory.used / 1024 / 1024).toFixed(2) + 'MB',
    total: (metrics.memory.total / 1024 / 1024).toFixed(2) + 'MB',
  })
}
```

---

## 完整示例

### 主题管理应用

```typescript
import {
  ThemeManager,
  exportTheme,
  importTheme,
  exportThemeToFile,
  importThemeFromFile,
  shareTheme,
  measurePerformance,
} from '@ldesign/color'

class ThemeApp {
  private manager: ThemeManager
  
  constructor() {
    this.manager = new ThemeManager()
  }
  
  // 导出当前主题
  async exportCurrentTheme() {
    const theme = await this.manager.getCurrentTheme()
    
    const { result, metrics } = await measurePerformance('exportTheme', () => {
      return exportTheme(theme, {
        prettify: true,
        author: 'My App',
      })
    })
    
    console.log(`导出耗时: ${metrics.duration}ms`)
    return result
  }
  
  // 分享主题
  async shareCurrentTheme() {
    const theme = await this.manager.getCurrentTheme()
    const url = shareTheme(theme)
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(url)
    
    return url
  }
  
  // 从文件导入
  async importFromFile(file: File) {
    const theme = await importThemeFromFile(file, {
      validate: true,
      onImported: (theme) => {
        console.log('导入主题:', theme.name)
      },
    })
    
    await this.manager.setTheme(theme.name)
  }
}
```

---

## 最佳实践

### 1. 始终验证导入的主题

```typescript
const theme = importTheme(json, {
  validate: true, // ✅ 推荐
})
```

### 2. 使用性能监控优化关键路径

```typescript
// 监控关键操作
const result = await measurePerformance('criticalOperation', () => {
  return performCriticalOperation()
})

// 如果耗时过长，考虑优化
if (result.metrics.duration > 100) {
  console.warn('操作耗时过长，需要优化')
}
```

### 3. 定期清理性能数据

```typescript
// 在适当的时候清理数据，避免内存泄漏
setInterval(() => {
  clearPerformanceData()
}, 60000) // 每分钟清理一次
```

---

## 总结

新增的功能让 @ldesign/color 更加强大和易用：

- ✅ **主题导入/导出**: 轻松保存、分享和备份主题
- ✅ **性能监控**: 分析和优化性能
- ✅ **完整的 TypeScript 支持**: 类型安全
- ✅ **简单易用的 API**: 直观的接口设计

开始使用这些新功能，让你的颜色管理更加高效！

