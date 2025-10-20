
# 性能优化指南

本指南介绍如何配置和优化编辑器性能。

## 按需加载

### 插件懒加载

只在需要时加载插件，减少初始加载时间：

```typescript
import { getPluginRegistry } from '@ldesign/editor'

const registry = getPluginRegistry()

// 注册插件时配置懒加载
registry.register('image', () => import('./plugins/ImagePlugin'), {
  name: 'image',
  category: PluginCategory.MEDIA
}, {
  enabled: true,
  lazy: true // 懒加载
})

// 只有在使用时才会加载
await registry.load('image')
```

### 工具栏懒加载

工具栏项目按需加载，使用Intersection Observer：

```typescript
import { ToolbarManager } from '@ldesign/editor'

const toolbar = new ToolbarManager(editor, {
  lazyLoad: true, // 启用懒加载
  position: 'top',
  sticky: true
})

// 工具栏项在可见时自动加载
toolbar.render()
```

## 插件配置

### 启用/禁用插件

```typescript
const pluginConfig = {
  // 核心插件 - 立即加载
  'bold': {
    enabled: true,
    lazy: false,
    priority: 100
  },
  
  // 高级功能 - 懒加载
  'table': {
    enabled: true,
    lazy: true,
    priority: 50
  },
  
  // 禁用不需要的功能
  'ai': {
    enabled: false
  }
}
```

### 插件优先级

控制插件加载顺序：

```typescript
{
  'bold': { priority: 100 }, // 最先加载
  'image': { priority: 50 },
  'ai': { priority: 10 }     // 最后加载
}
```

### 插件依赖

自动管理插件依赖关系：

```typescript
registry.register('aiAssistant', aiLoader, metadata, {
  enabled: true,
  dependencies: ['aiService', 'toolbar'] // 先加载依赖
})
```

## 工具栏优化

### 工具栏分组

将工具栏项分组，提高可读性和性能：

```typescript
const toolbarConfig = {
  groups: [
    {
      name: 'format',
      items: ['bold', 'italic', 'underline'],
      visible: true,
      order: 1
    },
    {
      name: 'media',
      items: ['image', 'video', 'table'],
      visible: true,
      collapsed: true, // 默认折叠
      order: 2
    }
  ]
}
```

### 显示/隐藏工具栏项

动态控制工具栏显示：

```typescript
const toolbar = new ToolbarManager(editor, config)

// 隐藏不常用的功能
toolbar.hideItem('video')
toolbar.hideGroup('advanced')

// 根据条件显示
if (user.isPro) {
  toolbar.showGroup('ai')
}
```

### 紧凑模式

减少工具栏占用空间：

```typescript
const toolbar = new ToolbarManager(editor, {
  compact: true,      // 紧凑模式
  showLabels: false,  // 隐藏文字标签
  sticky: true        // 固定在顶部
})
```

## 性能监控

### 使用性能监控器

```typescript
import { getPerformanceMonitor } from '@ldesign/editor'

const monitor = getPerformanceMonitor()

// 测量操作性能
monitor.start('render')
// 执行渲染
monitor.end('render')

// 获取统计信息
const stats = monitor.getStats('render')
console.log(`平均耗时: ${stats.average.toFixed(2)}ms`)

// 生成报告
console.log(monitor.generateReport())
```

### 性能指标

监控关键性能指标：

```typescript
const metrics = monitor.getMetrics()

console.log({
  fps: metrics.fps,              // 帧率
  memoryUsage: metrics.memoryUsage, // 内存使用(MB)
  loadTime: metrics.loadTime,    // 加载时间
  renderTime: metrics.renderTime // 渲染时间
})
```

### 识别慢操作

```typescript
// 获取超过100ms的操作
const slowOps = monitor.getSlowOperations(100)

slowOps.forEach(op => {
  console.log(`${op.name}: ${op.duration.toFixed(2)}ms`)
})
```

## 事件系统优化

### 使用优化的事件发射器

```typescript
import { OptimizedEventEmitter } from '@ldesign/editor'

class MyPlugin extends OptimizedEventEmitter {
  // 自动优化内存使用
}

// 定期清理
setInterval(() => {
  plugin.optimize()
}, 60000)
```

### 事件优先级

```typescript
emitter.on('update', handler1, 100) // 高优先级
emitter.on('update', handler2, 50)  // 中优先级
emitter.on('update', handler3, 0)   // 低优先级
```

### 内存监控

```typescript
const usage = emitter.getMemoryUsage()

console.log({
  events: usage.events,
  listeners: usage.listeners,
  average: usage.averageListenersPerEvent
})
```

## 缓存策略

### 图标缓存

```typescript
const iconManager = getIconManager({
  enableCache: true, // 启用缓存
  defaultSet: 'lucide'
})

// 图标渲染结果自动缓存
const icon = iconManager.renderIcon('bold') // 首次渲染
const icon2 = iconManager.renderIcon('bold') // 从缓存获取
```

### 配置缓存

```typescript
// 导出配置
const config = configManager.exportConfig()
localStorage.setItem('editor-config', config)

// 恢复配置（避免重新初始化）
const saved = localStorage.getItem('editor-config')
configManager.importConfig(saved)
```

## 防抖和节流

### 输入防抖

```typescript
import { debounce } from '@ldesign/editor/utils'

const handleInput = debounce((value) => {
  // 处理输入
}, 300) // 300ms防抖

editor.on('input', handleInput)
```

### 渲染节流

```typescript
import { throttle } from '@ldesign/editor/utils'

const handleRender = throttle(() => {
  // 执行渲染
}, 16) // 16ms节流 (60fps)

editor.on('update', handleRender)
```

## 虚拟滚动

对于大文档启用虚拟滚动：

```typescript
const editor = new Editor({
  virtualScroll: {
    enabled: true,
    itemHeight: 24,    // 每行高度
    bufferSize: 10     // 缓冲区大小
  }
})
```

## 代码分割

### 动态导入

```typescript
// 按需导入大型插件
async function loadAdvancedFeature() {
  const { AdvancedPlugin } = await import('./plugins/AdvancedPlugin')
  registry.register('advanced', () => new AdvancedPlugin())
  await registry.load('advanced')
}

// 只在需要时加载
button.addEventListener('click', loadAdvancedFeature)
```

### Webpack配置

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 将编辑器核心单独打包
        editor: {
          test: /[\\/]src[\\/]core[\\/]/,
          name: 'editor-core',
          priority: 10
        },
        // 将插件单独打包
        plugins: {
          test: /[\\/]src[\\/]plugins[\\/]/,
          name: 'editor-plugins',
          priority: 5
        }
      }
    }
  }
}
```

## 预设配置

### 轻量级配置

最小化配置，优先性能：

```typescript
import { lightweightConfig } from '@ldesign/editor/config'

const editor = new Editor(lightweightConfig)
```

特点：
- 只启用核心插件
- 其他功能懒加载
- 紧凑工具栏
- 启用虚拟滚动

### 功能完整配置

完整功能，适合高配设备：

```typescript
import { fullFeaturedConfig } from '@ldesign/editor/config'

const editor = new Editor(fullFeaturedConfig)
```

特点：
- 启用所有插件
- 显示所有工具栏项
- 完整的AI功能
- 协作功能

## 性能优化清单

### 初始加载优化

- [x] 使用代码分割
- [x] 启用插件懒加载
- [x] 启用工具栏懒加载
- [x] 压缩和缓存资源
- [x] 使用CDN

### 运行时优化

- [x] 使用防抖和节流
- [x] 启用图标缓存
- [x] 优化事件监听器
- [x] 定期清理内存
- [x] 监控性能指标

### 大文档优化

- [x] 启用虚拟滚动
- [x] 分批渲染
- [x] 延迟加载图片
- [x] 限制历史记录
- [x] 使用Web Worker

## 性能基准

### 目标指标

| 指标 | 目标 | 良好 | 需要优化 |
|------|------|------|----------|
| 首次加载 | < 1s | < 2s | > 3s |
| FPS | 60 | > 50 | < 40 |
| 内存使用 | < 50MB | < 100MB | > 150MB |
| 输入延迟 | < 50ms | < 100ms | > 150ms |

### 测试工具

```typescript
import { getPerformanceMonitor } from '@ldesign/editor'

const monitor = getPerformanceMonitor()

// 运行测试
async function runBenchmark() {
  monitor.clear()
  
  // 测试加载时间
  monitor.start('load')
  await editor.init()
  monitor.end('load')
  
  // 测试渲染时间
  for (let i = 0; i < 100; i++) {
    monitor.start('render')
    editor.render()
    monitor.end('render')
  }
  
  // 生成报告
  console.log(monitor.generateReport())
}
```

## 故障排除

### FPS过低

1. 检查是否启用了虚拟滚动
2. 减少DOM操作
3. 使用requestAnimationFrame
4. 优化CSS动画

### 内存泄漏

1. 检查事件监听器是否正确移除
2. 使用性能监控工具分析
3. 定期调用optimize()
4. 限制缓存大小

### 加载缓慢

1. 启用代码分割
2. 启用懒加载
3. 使用CDN
4. 压缩资源

## 相关资源

- [插件开发指南](./plugin-development.md)
- [配置参考](./configuration.md)
- [API文档](../api/editor.md)
- [性能测试工具](../../tests/performance-test.html)






