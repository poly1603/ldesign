# 核心概念

本文档介绍 `@ldesign/template` 的核心概念和设计理念，帮助你更好地理解和使用这个模板管理系统。

## 🎯 设计理念

### 响应式优先
`@ldesign/template` 采用响应式优先的设计理念，根据不同设备类型自动选择最适合的模板版本，确保在任何设备上都能提供最佳的用户体验。

### 性能至上
系统内置多层缓存机制、懒加载和预加载策略，确保模板加载速度和运行性能达到最优。

### 开发友好
提供完整的 TypeScript 支持、丰富的 API 和详细的错误信息，让开发者能够快速上手并高效开发。

## 🏗️ 核心架构

### 分层架构

```
┌─────────────────────────────────────┐
│           Vue 集成层                │  ← 组件、指令、组合式API
├─────────────────────────────────────┤
│           核心管理层                │  ← TemplateManager
├─────────────────────────────────────┤
│           服务层                    │  ← Scanner、Loader、Cache
├─────────────────────────────────────┤
│           适配层                    │  ← DeviceAdapter、Storage
└─────────────────────────────────────┘
```

### 模块职责

- **Vue 集成层**：提供 Vue3 组件、指令和组合式 API
- **核心管理层**：统一管理模板的生命周期和状态
- **服务层**：提供模板扫描、加载、缓存等核心服务
- **适配层**：处理设备检测、存储适配等底层功能

## 📁 模板组织

### 目录结构

```
src/templates/
├── login/                    # 登录模板分类
│   ├── desktop/             # 桌面端版本
│   │   └── LoginForm.vue
│   ├── tablet/              # 平板端版本
│   │   └── LoginForm.vue
│   └── mobile/              # 移动端版本
│       └── LoginForm.vue
├── dashboard/               # 仪表板模板分类
│   ├── desktop/
│   │   └── Dashboard.vue
│   ├── tablet/
│   │   └── Dashboard.vue
│   └── mobile/
│       └── Dashboard.vue
└── common/                  # 通用组件
    ├── header/
    ├── footer/
    └── sidebar/
```

### 命名规范

1. **分类名称**：使用小写字母和连字符，如 `user-profile`、`order-list`
2. **设备类型**：固定为 `desktop`、`tablet`、`mobile`
3. **组件文件**：使用 PascalCase，如 `LoginForm.vue`、`Dashboard.vue`

### 元数据配置

每个模板可以包含元数据配置文件：

```typescript
// templates/login/meta.json
{
  "name": "登录表单",
  "description": "用户登录界面模板",
  "category": "auth",
  "tags": ["form", "authentication"],
  "priority": "high",
  "preload": true,
  "fallback": {
    "mobile": "tablet",
    "tablet": "desktop"
  }
}
```

## 🔄 模板生命周期

### 1. 扫描阶段
```typescript
// 系统启动时自动扫描模板目录
const scanner = new TemplateScanner({
  scanPaths: ['src/templates/**/*.vue'],
  enableCache: true
})

const templates = await scanner.scan()
```

### 2. 注册阶段
```typescript
// 将扫描到的模板注册到管理器
manager.registerTemplates(templates)
```

### 3. 加载阶段
```typescript
// 根据需要动态加载模板
const component = await manager.loadTemplate('login', 'desktop')
```

### 4. 缓存阶段
```typescript
// 加载后的模板自动缓存
const cached = manager.getFromCache('login', 'desktop')
```

### 5. 销毁阶段
```typescript
// 不再需要时清理缓存
manager.clearCache('login', 'desktop')
```

## 📱 设备适配

### 设备类型检测

系统支持多种设备检测方式：

```typescript
// 1. 基于屏幕宽度的简单检测
function detectDevice() {
  const width = window.innerWidth
  if (width <= 768)
    return 'mobile'
  if (width <= 1024)
    return 'tablet'
  return 'desktop'
}

// 2. 基于 User Agent 的检测
function detectDeviceByUA() {
  const ua = navigator.userAgent
  if (/Mobile|Android|iPhone|iPad/.test(ua)) {
    return /iPad/.test(ua) ? 'tablet' : 'mobile'
  }
  return 'desktop'
}

// 3. 自定义检测逻辑
function customDetector() {
  const width = window.innerWidth
  const height = window.innerHeight
  const ratio = width / height
  const touchSupport = 'ontouchstart' in window

  // 综合判断设备类型
  if (touchSupport && width <= 480)
    return 'mobile'
  if (touchSupport && width <= 1024)
    return 'tablet'
  return 'desktop'
}
```

### 响应式切换

```typescript
// 监听设备变化
manager.on('device:changed', (oldDevice, newDevice) => {
  console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)

  // 自动重新加载当前模板的新设备版本
  manager.reloadCurrentTemplate(newDevice)
})

// 手动触发设备检测
window.addEventListener('resize', () => {
  manager.updateDeviceType()
})
```

### 优雅降级

当目标设备的模板不存在时，系统会按照预设的降级策略选择替代模板：

```typescript
// 降级策略配置
const fallbackStrategy = {
  mobile: ['tablet', 'desktop'], // 移动端优先使用平板端，再使用桌面端
  tablet: ['desktop', 'mobile'], // 平板端优先使用桌面端，再使用移动端
  desktop: ['tablet', 'mobile'] // 桌面端优先使用平板端，再使用移动端
}
```

## 🚀 性能优化

### 缓存策略

#### 1. 内存缓存
```typescript
// LRU 缓存配置
const cacheConfig = {
  strategy: 'lru', // 最近最少使用
  maxSize: 50, // 最大缓存50个模板
  ttl: 30 * 60 * 1000 // 30分钟过期
}
```

#### 2. 持久化缓存
```typescript
// 浏览器存储缓存
const storageConfig = {
  enabled: true,
  storage: 'localStorage', // 或 'sessionStorage'
  prefix: 'template_cache_',
  compression: true // 启用压缩
}
```

### 预加载策略

#### 1. 关键路径预加载
```typescript
// 预加载关键模板
const criticalTemplates = [
  { category: 'login', deviceType: 'desktop' },
  { category: 'dashboard', deviceType: 'desktop' }
]

await manager.preloadTemplates(criticalTemplates)
```

#### 2. 智能预加载
```typescript
// 基于用户行为的智能预加载
manager.enableSmartPreload({
  userBehaviorTracking: true,
  predictiveLoading: true,
  maxPredictions: 3
})
```

### 懒加载

```typescript
// 组件级懒加载
<template>
  <TemplateRenderer
    template="dashboard"
    :lazy="true"
    :loading-threshold="200"
  />
</template>

// 指令级懒加载
<div v-template-lazy="{ template: 'profile', deviceType: 'mobile' }"></div>
```

## 🔧 扩展机制

### 自定义适配器

```typescript
// 自定义设备检测适配器
class CustomDeviceAdapter extends DeviceAdapter {
  detectDevice(): DeviceType {
    // 自定义检测逻辑
    const customLogic = this.getCustomDetectionLogic()
    return customLogic()
  }
}

// 注册自定义适配器
manager.setDeviceAdapter(new CustomDeviceAdapter())
```

### 插件系统

```typescript
// 创建插件
class AnalyticsPlugin {
  install(manager: TemplateManager) {
    manager.on('template:loaded', (data) => {
      // 发送分析数据
      analytics.track('template_loaded', data)
    })
  }
}

// 使用插件
manager.use(new AnalyticsPlugin())
```

### 中间件

```typescript
// 加载中间件
manager.addLoadMiddleware(async (context, next) => {
  console.log('开始加载模板:', context.template)
  const startTime = Date.now()

  await next()

  const duration = Date.now() - startTime
  console.log('模板加载完成，耗时:', duration, 'ms')
})
```

## 🛡️ 错误处理

### 错误类型

1. **TemplateNotFoundError** - 模板不存在
2. **TemplateLoadError** - 模板加载失败
3. **DeviceDetectionError** - 设备检测失败
4. **CacheError** - 缓存操作失败

### 错误恢复

```typescript
// 全局错误处理
manager.on('error', (error) => {
  switch (error.type) {
    case 'TemplateNotFoundError':
      // 尝试加载默认模板
      manager.loadTemplate('default', error.deviceType)
      break
    case 'TemplateLoadError':
      // 清除缓存并重试
      manager.clearCache(error.template, error.deviceType)
      manager.loadTemplate(error.template, error.deviceType)
      break
  }
})
```

## 📊 监控和调试

### 性能监控

```typescript
// 启用性能监控
const config = {
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% 采样率
    reportInterval: 60000 // 每分钟报告一次
  }
}

// 监听性能报告
manager.on('performance:report', (report) => {
  console.log('性能报告:', {
    averageLoadTime: report.averageLoadTime,
    cacheHitRate: report.cacheHitRate,
    memoryUsage: report.memoryUsage
  })
})
```

### 调试模式

```typescript
// 开发环境启用调试
const manager = new TemplateManager({
  debug: process.env.NODE_ENV === 'development',
  verbose: true // 详细日志
})
```

## 🎨 最佳实践

### 1. 模板设计原则
- **一致性**：保持不同设备版本的功能一致性
- **适配性**：针对设备特点优化交互和布局
- **可维护性**：使用组件化和模块化设计

### 2. 性能优化建议
- 合理配置缓存大小和过期时间
- 使用预加载提升关键路径性能
- 启用压缩减少传输大小

### 3. 错误处理策略
- 设置合适的降级策略
- 实现全局错误监控
- 提供用户友好的错误提示

### 4. 监控和维护
- 定期分析性能报告
- 监控缓存命中率
- 跟踪用户设备分布

## 下一步

- 查看 [安装指南](./installation.md)
- 学习 [快速开始](./getting-started.md)
- 了解 [自定义模板](./custom-templates.md)
- 参考 [API 文档](/api/index.md)
