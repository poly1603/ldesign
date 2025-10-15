# 新架构说明

## 📊 架构概览

新架构采用**分层设计**，职责清晰，易于维护和扩展。

```
src/
├── core/         # 🔧 核心层（零依赖）
│  ├── registry.ts    # 统一模板注册中心
│  ├── cache.ts     # LRU缓存管理
│  ├── loader.ts     # 模板加载器
│  ├── device.ts     # 设备检测器
│  └── index.ts     # 核心层导出
│
├── runtime/        # ⚡ 运行时层
│  ├── manager.ts    # 模板管理器（整合core）
│  ├── lifecycle.ts   # 生命周期管理
│  └── index.ts     # 运行时层导出
│
├── vue/          # 🎯 Vue集成层
│  ├── composables/   # 组合式函数
│  │  ├── useDevice.ts
│  │  ├── useTemplateManager.ts
│  │  ├── useTemplate.ts
│  │  └── index.ts
│  ├── components/    # Vue组件
│  │  ├── TemplateRenderer.vue
│  │  └── index.ts
│  ├── plugin.ts     # Vue插件
│  └── index.ts     # Vue层导出
│
├── plugins/        # 🔌 可选插件
│  ├── animation.ts   # 动画插件
│  ├── preload.ts    # 预加载插件
│  └── index.ts     # 插件导出
│
├── types/         # 📝 类型定义
│  ├── core.ts      # 核心类型
│  ├── template.ts    # 模板类型
│  ├── plugin.ts     # 插件类型
│  └── index.ts     # 类型导出
│
├── utils/         # 🛠️ 工具函数
│  ├── helpers.ts    # 辅助函数
│  └── index.ts     # 工具导出
│
├── templates/       # 📦 内置模板库（保留）
│
└── index.ts        # 📌 统一入口
```

## ✨ 核心改进

### 1. 架构优化
- ✅ **三层架构**：Core → Runtime → Vue，职责清晰
- ✅ **单一数据源**：TemplateRegistry 统一管理所有模板
- ✅ **零依赖核心**：Core层无任何外部依赖
- ✅ **插件化设计**：可选功能按需加载

### 2. 代码精简
- **文件数量**：从 94 个减少到 ~25 个（减少 73%）
- **代码重复**：消除了 3 个 scanner 实现的重复
- **配置简化**：统一的 SystemConfig
- **API 统一**：一致的使用方式

### 3. 性能提升
- **LRU 缓存**：智能缓存策略，自动淘汰
- **懒加载**：按需加载模板组件
- **单例模式**：核心服务单例，避免重复创建
- **设备检测优化**：使用 MediaQueryList 和 ResizeObserver

### 4. 类型安全
- **完整类型定义**：所有 API 都有类型定义
- **泛型支持**：灵活的类型约束
- **工具类型**：提供常用的类型工具

## 🚀 快速开始

### 1. 基础用法 - 组件方式

```vue
<template>
 <TemplateRenderer
  category="login"
  device="desktop"
  name="default"
  :template-props="{ title: '欢迎登录' }"
 />
</template>

<script setup>
import { TemplateRenderer } from '@ldesign/template'
</script>
```

### 2. 高级用法 - Hook方式

```vue
<template>
 <div>
  <button @click="switchTemplate('modern')">切换到现代模板</button>
  <component v-if="component" :is="component" />
 </div>
</template>

<script setup>
import { useTemplate } from '@ldesign/template'

const { component, switchTemplate, loading, error } = useTemplate({
 category: 'login',
 device: 'desktop',
 name: 'default',
})
</script>
```

### 3. 插件方式

```typescript
import { createApp } from 'vue'
import { createTemplatePlugin } from '@ldesign/template'

const app = createApp(App)

app.use(createTemplatePlugin({
 cache: {
  enabled: true,
  strategy: 'lru',
  maxSize: 50,
 },
 device: {
  enableResponsive: true,
 },
 debug: true,
}))
```

### 4. 底层API - 管理器方式

```typescript
import { createTemplateManager } from '@ldesign/template'

// 创建管理器
const manager = createTemplateManager({
 debug: true,
})

// 注册模板
manager.register('login', 'desktop', 'custom', {
 displayName: '自定义登录',
 description: '我的自定义模板',
 version: '1.0.0',
}, () => import('./MyTemplate.vue'))

// 加载模板
const result = await manager.load('login', 'desktop', 'custom')
console.log(result.component)

// 切换模板
await manager.switch('login', 'desktop', 'modern')

// 查询模板
const templates = manager.query({ category: 'login' })
```

## 📦 导出清单

### 核心层
- `TemplateRegistry` - 模板注册中心
- `CacheManager` - 缓存管理器
- `TemplateLoader` - 模板加载器
- `DeviceDetector` - 设备检测器

### 运行时层
- `TemplateManager` - 模板管理器
- `LifecycleManager` - 生命周期管理

### Vue 集成
- `useTemplate` - 模板 Hook（推荐）
- `useDevice` - 设备检测 Hook
- `useTemplateManager` - 管理器 Hook
- `TemplateRenderer` - 渲染器组件
- `createTemplatePlugin` - 创建 Vue 插件

### 工具函数
- `buildTemplateId` - 构建模板ID
- `parseTemplateId` - 解析模板ID
- `delay` / `debounce` / `throttle` - 常用工具

## 🔄 迁移指南

### 旧 API → 新 API

```typescript
// ❌ 旧方式（已废弃）
import { simpleTemplateScanner } from '@ldesign/template'
const templates = await simpleTemplateScanner.getTemplates('login', 'desktop')

// ✅ 新方式（推荐）
import { useTemplateManager } from '@ldesign/template'
const { query } = useTemplateManager()
const templates = query({ category: 'login', device: 'desktop' })
```

```typescript
// ❌ 旧方式
import { useDeviceDetection } from '@ldesign/template'
const { deviceType } = useDeviceDetection()

// ✅ 新方式
import { useDevice } from '@ldesign/template'
const { device } = useDevice()
```

## 🎯 最佳实践

1. **优先使用 Hook**：`useTemplate` 是最简单的使用方式
2. **组件复用**：`TemplateRenderer` 适合声明式使用
3. **底层控制**：需要精细控制时使用 `TemplateManager`
4. **插件扩展**：使用插件系统添加可选功能
5. **类型安全**：充分利用 TypeScript 类型定义

## 📈 性能对比

| 指标 | 旧架构 | 新架构 | 提升 |
|---------|---------|---------|---------|
| 文件数量 | 94 | 25 | ⬇️ 73% |
| 代码重复 | 高 | 低 | ⬆️ 显著 |
| 包大小 | ~55KB | ~30KB* | ⬇️ 45%* |
| 加载速度 | 中等 | 快 | ⬆️ 30%* |
| 内存占用 | 高 | 低 | ⬇️ 40%* |

*预估值，实际需构建后测试

## 🔧 开发建议

1. **核心层**：保持零依赖，纯 TypeScript 实现
2. **运行时层**：整合核心功能，提供统一接口
3. **Vue 层**：专注 Vue 集成，不包含业务逻辑
4. **插件**：独立实现，按需加载
5. **测试**：每层都应有完整的单元测试

---

**Made with ❤️ by LDesign Team**
