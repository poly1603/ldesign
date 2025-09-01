# 模板路由

LDesign Router 与 @ldesign/template 包深度集成，提供基于设备类型的模板路由功能。这使得您可以为不同设备类型提供专门优化的页面模板。

## 概述

模板路由允许您：

- 🎯 **设备特定模板** - 为不同设备类型配置专门的模板
- 🔄 **自动回退机制** - 当特定设备模板不存在时自动回退
- 📁 **灵活的目录结构** - 支持多种模板组织方式
- ⚡ **性能优化** - 内置缓存和懒加载机制
- 🛠️ **开发友好** - 完整的 TypeScript 支持和错误处理

## 基础用法

### 配置模板路由

```typescript
import { createRouter } from '@ldesign/router'

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      // 指定模板名称
      template: 'home-page',
      // 模板分类
      templateCategory: 'pages',
      // 模板配置
      templateConfig: {
        templateRoot: 'src/templates',
        enableCache: true,
        autoScan: true,
        defaultDevice: 'desktop',
      },
    },
  },
  {
    path: '/product/:id',
    name: 'product',
    meta: {
      template: 'product-detail',
      templateCategory: 'products',
      templateConfig: {
        enableHMR: false,
        debug: false,
      },
    },
  },
]

const router = createRouter({
  routes,
  // 启用模板路由功能
  enableTemplateRoutes: true,
})
```

### 模板配置选项

```typescript
interface TemplateRouteConfig {
  /** 默认模板分类 */
  defaultCategory?: string
  /** 模板根目录 */
  templateRoot?: string
  /** 是否启用模板缓存 */
  enableCache?: boolean
  /** 模板加载超时时间 */
  timeout?: number
  /** 是否自动扫描模板 */
  autoScan?: boolean
  /** 是否启用热更新 */
  enableHMR?: boolean
  /** 默认设备类型 */
  defaultDevice?: 'mobile' | 'tablet' | 'desktop'
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
  /** 是否启用调试模式 */
  debug?: boolean
}
```

## 目录结构

### 推荐的目录结构

```
src/templates/
├── pages/                    # 页面模板
│   ├── mobile/
│   │   ├── home-page.vue
│   │   ├── about-page.vue
│   │   └── contact-page.vue
│   ├── tablet/
│   │   ├── home-page.vue
│   │   └── about-page.vue
│   └── desktop/
│       ├── home-page.vue
│       ├── about-page.vue
│       └── contact-page.vue
├── products/                 # 产品模板
│   ├── mobile/
│   │   └── product-detail.vue
│   └── desktop/
│       └── product-detail.vue
├── layouts/                  # 布局模板
│   ├── mobile/
│   │   └── main-layout.vue
│   └── desktop/
│       └── main-layout.vue
└── components/               # 组件模板
    ├── mobile/
    │   └── navigation.vue
    └── desktop/
        └── navigation.vue
```

### 模板文件命名规范

- 使用 kebab-case 命名：`home-page.vue`、`product-detail.vue`
- 设备类型作为目录名：`mobile/`、`tablet/`、`desktop/`
- 分类作为顶级目录：`pages/`、`products/`、`layouts/`

## 高级功能

### 动态模板配置

```typescript
// 根据路由参数动态配置模板
const routes = [
  {
    path: '/category/:type',
    name: 'category',
    meta: {
      template: (route) => `${route.params.type}-list`,
      templateCategory: 'categories',
    },
  },
]
```

### 条件模板加载

```typescript
// 根据用户权限或其他条件选择模板
const routes = [
  {
    path: '/dashboard',
    name: 'dashboard',
    meta: {
      template: (route, user) => {
        return user.isAdmin ? 'admin-dashboard' : 'user-dashboard'
      },
      templateCategory: 'dashboards',
    },
  },
]
```

### 模板预加载

```typescript
// 配置模板预加载策略
const templateConfig = {
  preloadStrategy: {
    enabled: true,
    mode: 'hover', // 'hover' | 'visible' | 'idle'
    priority: ['home-page', 'product-detail'],
  },
}
```

## 错误处理

### 模板加载失败处理

```typescript
// 自定义错误处理
const routes = [
  {
    path: '/error-prone',
    name: 'errorProne',
    meta: {
      template: 'complex-template',
      templateCategory: 'pages',
      onTemplateError: (error, fallback) => {
        console.error('模板加载失败:', error)
        // 返回自定义错误组件
        return () => import('@/components/TemplateError.vue')
      },
    },
  },
]
```

### 回退机制

当指定设备的模板不存在时，系统会按以下顺序尝试回退：

1. 当前设备类型的模板
2. 桌面版本的模板
3. 默认错误组件

```typescript
// 自动回退示例
// 请求: mobile/special-page.vue (不存在)
// 回退: desktop/special-page.vue
// 如果仍不存在: 显示错误组件
```

## 性能优化

### 缓存策略

```typescript
const templateConfig = {
  cache: {
    enabled: true,
    strategy: 'lru',
    maxSize: 50,
    ttl: 30 * 60 * 1000, // 30分钟
  },
}
```

### 懒加载

```typescript
// 模板会自动进行懒加载
// 只有在路由访问时才会加载对应的模板
const routes = [
  {
    path: '/lazy',
    meta: {
      template: 'lazy-page', // 懒加载
      templateCategory: 'pages',
    },
  },
]
```

## 调试和开发

### 开发模式配置

```typescript
const templateConfig = {
  debug: process.env.NODE_ENV === 'development',
  enableHMR: process.env.NODE_ENV === 'development',
  enablePerformanceMonitor: true,
}
```

### 调试信息

启用调试模式后，您可以在控制台看到：

- 模板加载时间
- 缓存命中率
- 回退机制触发情况
- 错误详细信息

## 最佳实践

1. **合理组织目录结构** - 按功能和设备类型分类
2. **使用缓存** - 启用模板缓存提高性能
3. **提供回退** - 确保桌面版本模板存在
4. **错误处理** - 实现自定义错误处理逻辑
5. **性能监控** - 在开发环境启用性能监控
6. **类型安全** - 使用 TypeScript 确保类型安全

## 下一步

- [模板解析器](./template-resolver.md) - 了解模板解析器的详细用法
- [设备模板](./device-templates.md) - 学习设备特定模板的最佳实践
