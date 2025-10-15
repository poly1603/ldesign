# 🏗️ LDesign Template 新架构设计

## 📊 设计目标

1. **极致简洁**：核心代码减少50%，API更直观
2. **强大功能**：增强插件系统、性能监控、错误处理
3. **易于扩展**：清晰的分层、统一的接口、丰富的钩子
4. **类型安全**：完整的TypeScript支持
5. **零依赖核心**：Core层无任何外部依赖

## 🎯 核心改进

### 1. 精简的三层架构

```
src/
├── core/                    # 核心层（零依赖）
│   ├── registry.ts         # 模板注册中心（单一数据源）
│   ├── cache.ts            # LRU缓存管理器
│   ├── loader.ts           # 模板加载器
│   ├── device.ts           # 设备检测器
│   ├── events.ts           # 事件系统 ⭐新增
│   └── index.ts            # 导出
│
├── runtime/                # 运行时层
│   ├── manager.ts          # 模板管理器（整合core）
│   ├── lifecycle.ts        # 生命周期管理
│   ├── monitor.ts          # 性能监控 ⭐新增
│   └── index.ts            # 导出
│
├── vue/                    # Vue集成层
│   ├── composables/        # 组合式API
│   │   ├── useDevice.ts
│   │   ├── useTemplate.ts
│   │   ├── useTemplateManager.ts
│   │   └── index.ts
│   ├── components/         # Vue组件
│   │   ├── TemplateRenderer.vue
│   │   └── index.ts
│   ├── plugin.ts           # Vue插件
│   └── index.ts            # 导出
│
├── plugins/                # 插件系统
│   ├── preload.ts          # 预加载插件
│   ├── animation.ts        # 动画插件
│   ├── logger.ts           # 日志插件 ⭐新增
│   ├── devtools.ts         # 开发工具插件 ⭐新增
│   └── index.ts            # 导出
│
├── types/                  # 类型定义
│   ├── core.ts             # 核心类型
│   ├── template.ts         # 模板类型
│   ├── plugin.ts           # 插件类型
│   └── index.ts            # 导出
│
├── utils/                  # 工具函数（精简）
│   ├── helpers.ts          # 基础工具
│   ├── constants.ts        # 常量定义
│   └── index.ts            # 导出
│
├── templates/              # 示例模板（精简）
│   └── example/            # 只保留一个示例
│       ├── desktop/
│       ├── tablet/
│       └── mobile/
│
└── index.ts                # 统一入口
```

### 2. 新增特性

#### 📡 事件系统（Events）
```typescript
// 统一的事件发布订阅系统
const events = new EventEmitter()
events.on('template:loaded', (id) => {})
events.emit('template:loaded', templateId)
```

#### 📊 性能监控（Monitor）
```typescript
// 实时性能监控
const monitor = new PerformanceMonitor()
monitor.trackLoadTime(templateId, duration)
monitor.getMetrics() // 获取性能指标
```

#### 🔌 增强的插件系统
```typescript
// 插件接口标准化
interface Plugin {
  name: string
  version: string
  install: (manager: TemplateManager) => void
  uninstall?: () => void
}

// 使用插件
manager.use(preloadPlugin)
manager.use(animationPlugin)
```

#### 📝 日志系统（Logger Plugin）
```typescript
// 分级日志
const logger = createLogger({
  level: 'info',  // debug | info | warn | error
  prefix: '[Template]'
})
```

#### 🛠️ 开发工具（DevTools Plugin）
```typescript
// Vue DevTools集成
const devtools = createDevToolsPlugin()
// 可视化模板树、缓存状态、性能指标
```

### 3. API简化

#### 旧API vs 新API

```typescript
// ❌ 旧方式：复杂的导入
import { simpleTemplateScanner, TemplateManager } from '@ldesign/template'
const scanner = simpleTemplateScanner(config)
const manager = new TemplateManager(scanner)

// ✅ 新方式：一步到位
import { createTemplateManager } from '@ldesign/template'
const manager = createTemplateManager({
  cache: { enabled: true },
  device: { breakpoints: {...} }
})
```

```typescript
// ❌ 旧方式：多个Hook
import { useDeviceDetection, useTemplateScanner } from '@ldesign/template'

// ✅ 新方式：统一Hook
import { useTemplate } from '@ldesign/template'
const { device, templates, load, switch } = useTemplate()
```

### 4. 移除的功能

以下功能从核心包移除，但可作为独立包或插件提供：

1. **业务相关Composables**
   - useFormValidation
   - useLoginState  
   - usePasswordStrength
   
2. **过多的内置模板**
   - 只保留1个示例模板
   - 其他模板作为独立包发布

3. **复杂的Scanner系统**
   - 统一为Registry系统
   - 自动扫描作为可选插件

4. **样式管理**
   - 移到独立的样式包

### 5. 核心类改进

#### Registry（注册中心）
```typescript
// 更强大的查询能力
registry.query({
  category: 'login',
  device: 'desktop',
  tags: ['modern'],
  sort: 'lastModified'
})

// 批量操作
registry.registerBatch([...])
registry.unregisterBatch([...])

// 模板分组
registry.getGroup('auth')  // login + register + forgot-password
```

#### Cache（缓存）
```typescript
// 更智能的缓存策略
cache.setStrategy('lru')  // lru | lfu | fifo
cache.setTTL(60000)       // 自动过期
cache.onEvict((key) => {}) // 淘汰回调

// 缓存预热
cache.warmup(['template:login:desktop:default'])
```

#### Loader（加载器）
```typescript
// 更好的错误处理
const result = await loader.load(id, {
  timeout: 5000,      // 超时
  retries: 3,         // 重试
  fallback: 'default' // 降级
})

// 批量加载
await loader.loadBatch([id1, id2, id3])
```

#### Device（设备检测）
```typescript
// 更灵活的断点配置
device.setBreakpoints({
  mobile: [0, 768],
  tablet: [768, 1024],
  desktop: [1024, Infinity]
})

// 自定义检测器
device.useDetector((width, height) => {
  return width < 768 ? 'mobile' : 'desktop'
})
```

## 📦 包大小优化

| 目标 | 当前 | 新架构 | 改进 |
|------|------|--------|------|
| 核心层 | ~20KB | ~12KB | ⬇️ 40% |
| 运行时层 | ~15KB | ~10KB | ⬇️ 33% |
| Vue层 | ~20KB | ~15KB | ⬇️ 25% |
| 总计 | ~55KB | ~37KB | ⬇️ 33% |

## 🎯 使用示例

### 1. 基础用法
```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="default"
  />
</template>

<script setup>
import { TemplateRenderer } from '@ldesign/template'
</script>
```

### 2. 高级用法
```typescript
import { createTemplateManager, preloadPlugin, animationPlugin } from '@ldesign/template'

const manager = createTemplateManager({
  cache: { enabled: true, maxSize: 100 },
  device: { enableResponsive: true },
  debug: true
})

// 使用插件
manager.use(preloadPlugin({ priority: ['login', 'dashboard'] }))
manager.use(animationPlugin({ duration: 300 }))

// 注册模板
manager.register('login', 'desktop', 'custom', {
  displayName: '自定义登录',
  version: '1.0.0'
}, () => import('./MyTemplate.vue'))

// 加载模板
const result = await manager.load('login', 'desktop', 'custom')
```

### 3. Composable用法
```vue
<script setup>
import { useTemplate } from '@ldesign/template'

const {
  device,        // 当前设备
  templates,     // 可用模板
  current,       // 当前模板
  loading,       // 加载状态
  error,         // 错误信息
  load,          // 加载模板
  switch,        // 切换模板
  refresh        // 刷新列表
} = useTemplate({
  category: 'login',
  autoSwitch: true  // 自动跟随设备切换
})
</script>
```

## 🔄 迁移指南

### 从旧架构迁移

1. **更新导入**
```typescript
// 旧
import { simpleTemplateScanner, useDeviceDetection } from '@ldesign/template'

// 新
import { createTemplateManager, useDevice, useTemplate } from '@ldesign/template'
```

2. **更新配置**
```typescript
// 旧
const config = createTemplateConfig({...})

// 新
const manager = createTemplateManager({...})
```

3. **更新Hook**
```typescript
// 旧
const { deviceType } = useDeviceDetection()

// 新
const { device } = useDevice()
```

## ✅ 优势总结

1. **更简洁**：代码量减少50%，API更直观
2. **更强大**：新增事件系统、性能监控、开发工具
3. **更灵活**：增强的插件系统，易于扩展
4. **更安全**：完整的TypeScript支持和错误处理
5. **更快速**：优化的缓存和加载策略
6. **更易用**：统一的API设计，清晰的文档

---

**Made with ❤️ by LDesign Team**
