# 快速开始

本指南将帮助您快速上手 LDesign，从安装到创建第一个应用。

## 环境要求

在开始之前，请确保您的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **Vue** >= 3.3.0
- **TypeScript** >= 5.0.0 (推荐)

## 安装

LDesign 采用模块化设计，您可以根据需要安装不同的包：

::: code-group

```bash [完整安装]
pnpm add @ldesign/engine @ldesign/router @ldesign/store @ldesign/color
```

```bash [最小安装]
pnpm add @ldesign/engine @ldesign/router
```

```bash [单独安装]
pnpm add @ldesign/engine
pnpm add @ldesign/router
pnpm add @ldesign/store
pnpm add @ldesign/color
```

:::

## 创建基础应用

### 1. 创建 Vue 应用

首先创建一个标准的 Vue 3 应用：

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')
```

### 2. 集成 LDesign Engine

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  name: 'my-app',
  version: '1.0.0',
  debug: true, // 开发环境启用调试
})

const app = createApp(App)

// 提供引擎实例给组件
app.provide('engine', engine)

app.mount('#app')
```

### 3. 添加路由管理

```typescript
// router/index.ts
import { createLDesignRouter } from '@ldesign/router'
import type { RouteConfig } from '@ldesign/router'

const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '首页',
      description: '应用首页',
    },
  },
]

export default createLDesignRouter({
  history: 'history',
  routes,

  // 启用主题管理
  themeManager: {
    enabled: true,
    defaultTheme: 'light',
    persistent: true,
  },

  // 启用国际化
  i18nManager: {
    enabled: true,
    defaultLocale: 'zh-CN',
    fallbackLocale: 'en-US',
  },
})
```

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import router from './router'
import App from './App.vue'

const engine = createEngine({
  name: 'my-app',
  version: '1.0.0',
})

const app = createApp(App)
app.use(router)
app.provide('engine', engine)
app.mount('#app')
```

## 项目结构

推荐的项目结构如下：

```
src/
├── components/          # 组件
│   ├── common/         # 通用组件
│   ├── layout/         # 布局组件
│   └── business/       # 业务组件
├── views/              # 页面视图
├── router/             # 路由配置
├── stores/             # 状态管理
├── composables/        # 组合式函数
├── utils/              # 工具函数
├── types/              # 类型定义
├── assets/             # 静态资源
└── main.ts             # 入口文件
```

## 下一步

现在您已经成功创建了一个基于 LDesign 的应用！接下来您可以：

- 📖 阅读 [路由管理指南](/guide/router) 了解更多路由功能
- 🎨 查看 [主题系统指南](/guide/theme) 学习主题定制
- 📦 探索 [状态管理指南](/guide/store) 管理应用状态
- 🌍 了解 [国际化指南](/guide/i18n) 支持多语言

## 常见问题

### TypeScript 支持

LDesign 完全支持 TypeScript，所有包都提供了完整的类型定义。确保在 `tsconfig.json` 中包含正确的类型：

```json
{
  "compilerOptions": {
    "types": ["@ldesign/engine", "@ldesign/router"]
  }
}
```

### Vite 配置

如果您使用 Vite，建议添加以下别名配置：

```typescript
// vite.config.ts
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### 样式配置

LDesign 使用 CSS 变量进行主题管理，您可以在全局样式中自定义这些变量：

```css
/* styles/global.css */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #f5222d;
}
```
