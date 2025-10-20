# 优化版编辑器快速开始

本指南介绍如何使用优化后的编辑器，充分利用新的性能和配置功能。

## 安装

```bash
npm install @ldesign/editor
```

## 基础使用

### 1. 最简单的方式

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/dist/editor.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>'
})
```

### 2. 使用预设配置（推荐）

```typescript
import { Editor, lightweightConfig } from '@ldesign/editor'

// 轻量级配置（快速加载）
const editor = new Editor(lightweightConfig)

// 或功能完整配置
import { fullFeaturedConfig } from '@ldesign/editor'
const editor = new Editor(fullFeaturedConfig)
```

## 按需加载

### 注册和加载插件

```typescript
import { 
  Editor,
  getPluginRegistry,
  PluginCategory 
} from '@ldesign/editor'

const registry = getPluginRegistry()

// 注册核心插件（立即加载）
registry.register('bold', () => import('./plugins/BoldPlugin'), {
  name: 'bold',
  category: PluginCategory.FORMAT
}, {
  enabled: true,
  lazy: false,
  priority: 100
})

// 注册高级功能（懒加载）
registry.register('table', () => import('./plugins/TablePlugin'), {
  name: 'table',
  category: PluginCategory.MEDIA
}, {
  enabled: true,
  lazy: true,  // 只在需要时加载
  priority: 50
})

// 创建编辑器
const editor = new Editor({
  element: '#editor'
})

// 手动加载插件
await registry.load('table')
```

## 插件配置

### 启用/禁用插件

```typescript
const registry = getPluginRegistry()

// 禁用不需要的功能
await registry.disable('ai')
await registry.disable('collaboration')

// 启用功能
await registry.enable('image')

// 检查状态
const isEnabled = registry.isEnabled('image')
const isLoaded = registry.isLoaded('image')
```

### 配置插件选项

```typescript
// 更新单个插件配置
registry.updateConfig('image', {
  enabled: true,
  lazy: true,
  config: {
    maxSize: 5 * 1024 * 1024,  // 5MB
    allowedFormats: ['jpg', 'png', 'webp'],
    enableResize: true
  }
})

// 批量配置
const pluginConfig = {
  'image': {
    enabled: true,
    config: { maxSize: 5 * 1024 * 1024 }
  },
  'video': {
    enabled: false  // 禁用视频功能
  },
  'ai': {
    enabled: true,
    lazy: true,
    config: {
      apiKey: 'your-api-key',
      model: 'deepseek-chat'
    }
  }
}

registry.importConfig(pluginConfig)
```

## 工具栏配置

### 基础配置

```typescript
import { ToolbarManager } from '@ldesign/editor'

const toolbar = new ToolbarManager(editor, {
  position: 'top',      // 位置：top, bottom, float
  sticky: true,         // 固定在顶部
  compact: false,       // 紧凑模式
  showLabels: false,    // 显示文字标签
  lazyLoad: true        // 启用懒加载
})

// 渲染工具栏
const toolbarElement = toolbar.render()
document.body.insertBefore(toolbarElement, editor.element)
```

### 工具栏分组

```typescript
const toolbar = new ToolbarManager(editor, {
  groups: [
    {
      name: 'format',
      label: '格式',
      items: ['bold', 'italic', 'underline'],
      visible: true,
      order: 1
    },
    {
      name: 'insert',
      label: '插入',
      items: ['image', 'table', 'link'],
      visible: true,
      order: 2
    },
    {
      name: 'advanced',
      label: '高级',
      items: ['ai', 'template'],
      visible: false,  // 默认隐藏
      order: 3
    }
  ]
})
```

### 动态控制

```typescript
// 显示/隐藏功能
toolbar.hideItem('video')
toolbar.showItem('image')

toolbar.hideGroup('advanced')
toolbar.showGroup('insert')

// 根据条件显示
if (user.isPremium) {
  toolbar.showGroup('advanced')
  toolbar.showItem('ai')
}

// 移动端优化
if (window.innerWidth < 768) {
  toolbar.updateConfig({
    compact: true,
    showLabels: false
  })
  toolbar.hideGroup('advanced')
}
```

## 性能监控

### 基础监控

```typescript
import { getPerformanceMonitor } from '@ldesign/editor'

const monitor = getPerformanceMonitor()

// 测量操作性能
monitor.start('render')
editor.render()
const duration = monitor.end('render')
console.log(`渲染耗时: ${duration.toFixed(2)}ms`)

// 获取性能指标
const metrics = monitor.getMetrics()
console.log({
  fps: metrics.fps,              // 帧率
  memory: metrics.memoryUsage,   // 内存(MB)
  loadTime: metrics.loadTime,    // 加载时间
  renderTime: metrics.renderTime // 渲染时间
})
```

### 性能报告

```typescript
// 生成完整报告
const report = monitor.generateReport()
console.log(report)

// 获取慢操作
const slowOps = monitor.getSlowOperations(100) // >100ms
slowOps.forEach(op => {
  console.warn(`慢操作: ${op.name} - ${op.duration.toFixed(2)}ms`)
})

// 获取统计信息
const stats = monitor.getStats('render')
console.log({
  count: stats.count,
  average: stats.average.toFixed(2),
  min: stats.min.toFixed(2),
  max: stats.max.toFixed(2)
})
```

### 性能优化建议

```typescript
// 定期检查性能
setInterval(() => {
  const metrics = monitor.getMetrics()
  
  // FPS过低
  if (metrics.fps < 40) {
    console.warn('FPS过低，建议：')
    console.log('- 启用虚拟滚动')
    console.log('- 禁用不必要的插件')
    console.log('- 减少DOM操作')
  }
  
  // 内存使用过高
  if (metrics.memoryUsage > 100) {
    console.warn('内存使用过高，建议：')
    console.log('- 清理事件监听器')
    console.log('- 限制历史记录')
    console.log('- 启用缓存限制')
  }
  
  // 加载时间过长
  if (metrics.loadTime > 2000) {
    console.warn('加载时间过长，建议：')
    console.log('- 启用代码分割')
    console.log('- 启用插件懒加载')
    console.log('- 使用预设配置')
  }
}, 30000) // 每30秒检查一次
```

## 完整示例

### 最佳实践配置

```typescript
import {
  Editor,
  getPluginRegistry,
  getConfigManager,
  getPerformanceMonitor,
  ToolbarManager,
  PluginCategory
} from '@ldesign/editor'

// 1. 配置管理器
const config = getConfigManager({
  icons: { defaultSet: 'lucide', enableCache: true },
  theme: { defaultTheme: 'light', followSystem: true },
  i18n: { defaultLocale: 'zh-CN' }
})

// 2. 插件注册
const registry = getPluginRegistry()

// 核心插件（立即加载）
const corePlugins = [
  { name: 'bold', loader: () => import('./plugins/BoldPlugin'), priority: 100 },
  { name: 'italic', loader: () => import('./plugins/ItalicPlugin'), priority: 99 },
  { name: 'underline', loader: () => import('./plugins/UnderlinePlugin'), priority: 98 }
]

corePlugins.forEach(({ name, loader, priority }) => {
  registry.register(name, loader, {
    name,
    category: PluginCategory.FORMAT
  }, {
    enabled: true,
    lazy: false,
    priority
  })
})

// 高级插件（懒加载）
const advancedPlugins = [
  { name: 'image', loader: () => import('./plugins/ImagePlugin'), priority: 50 },
  { name: 'table', loader: () => import('./plugins/TablePlugin'), priority: 49 },
  { name: 'ai', loader: () => import('./plugins/AIPlugin'), priority: 10 }
]

advancedPlugins.forEach(({ name, loader, priority }) => {
  registry.register(name, loader, {
    name,
    category: PluginCategory.MEDIA
  }, {
    enabled: true,
    lazy: true,
    priority
  })
})

// 3. 创建编辑器
const editor = new Editor({
  element: '#editor',
  content: '<p>开始编辑...</p>'
})

// 4. 配置工具栏
const toolbar = new ToolbarManager(editor, {
  lazyLoad: true,
  sticky: true,
  groups: [
    {
      name: 'format',
      items: ['bold', 'italic', 'underline'],
      visible: true,
      order: 1
    },
    {
      name: 'insert',
      items: ['image', 'table', 'link'],
      visible: true,
      order: 2
    }
  ]
})

document.body.insertBefore(toolbar.render(), editor.element)

// 5. 性能监控
const monitor = getPerformanceMonitor()

// 监控加载性能
monitor.start('init')
await editor.init()
const initTime = monitor.end('init')
console.log(`初始化耗时: ${initTime.toFixed(2)}ms`)

// 定期报告
setInterval(() => {
  console.log(monitor.generateReport())
}, 60000)

// 6. 配置持久化
const saveConfig = () => {
  const pluginConfig = registry.exportConfig()
  localStorage.setItem('editor-plugin-config', JSON.stringify(pluginConfig))
  localStorage.setItem('editor-config', config.exportConfig())
}

const loadConfig = () => {
  const pluginConfig = localStorage.getItem('editor-plugin-config')
  const editorConfig = localStorage.getItem('editor-config')
  
  if (pluginConfig) {
    registry.importConfig(JSON.parse(pluginConfig))
  }
  
  if (editorConfig) {
    config.importConfig(editorConfig)
  }
}

// 页面加载时恢复配置
loadConfig()

// 定期保存配置
setInterval(saveConfig, 30000)
```

## 移动端优化

```typescript
const isMobile = window.innerWidth < 768

const editor = new Editor({
  element: '#editor',
  // 移动端使用轻量级配置
  ...(isMobile ? lightweightConfig : fullFeaturedConfig)
})

const toolbar = new ToolbarManager(editor, {
  compact: isMobile,           // 移动端紧凑模式
  showLabels: !isMobile,       // 桌面端显示标签
  lazyLoad: true,
  groups: isMobile ? [
    // 移动端只显示基础功能
    {
      name: 'basic',
      items: ['bold', 'italic', 'link'],
      visible: true
    }
  ] : [
    // 桌面端显示完整功能
    // ... 完整分组配置
  ]
})

// 响应窗口大小变化
window.addEventListener('resize', () => {
  const nowMobile = window.innerWidth < 768
  if (nowMobile !== isMobile) {
    toolbar.updateConfig({
      compact: nowMobile,
      showLabels: !nowMobile
    })
  }
})
```

## 下一步

- [性能优化指南](./performance-optimization.md)
- [插件开发指南](./plugin-development.md)
- [配置参考](./configuration.md)
- [API文档](../api/editor.md)

## 故障排除

### 插件未加载

```typescript
// 检查插件状态
const registry = getPluginRegistry()
console.log('已注册:', registry.getRegistered())
console.log('已加载:', registry.getLoaded())
console.log('已启用:', registry.getEnabled())

// 手动加载
await registry.load('pluginName')

// 查看统计
console.log(registry.getStats())
```

### 性能问题

```typescript
// 生成性能报告
const monitor = getPerformanceMonitor()
console.log(monitor.generateReport())

// 查看慢操作
const slowOps = monitor.getSlowOperations()
console.log('慢操作:', slowOps)

// 检查内存
const metrics = monitor.getMetrics()
console.log('内存使用:', metrics.memoryUsage, 'MB')
```

### 配置问题

```typescript
// 导出配置检查
const config = getConfigManager()
console.log('当前配置:', config.exportConfig())

// 重置配置
config.reset()
registry.reset()
```

## 常见问题

**Q: 如何减少初始加载时间？**

A: 使用预设的 `lightweightConfig` 或启用插件懒加载：

```typescript
registry.register('pluginName', loader, metadata, {
  lazy: true  // 懒加载
})
```

**Q: 如何禁用不需要的功能？**

A: 使用插件注册中心：

```typescript
registry.disable('pluginName')
```

**Q: 如何监控性能？**

A: 使用性能监控器：

```typescript
const monitor = getPerformanceMonitor()
console.log(monitor.getMetrics())
console.log(monitor.generateReport())
```

**Q: 如何保存用户配置？**

A: 导出配置并保存到localStorage：

```typescript
const configJson = config.exportConfig()
localStorage.setItem('config', configJson)

// 恢复配置
const saved = localStorage.getItem('config')
config.importConfig(saved)
```






