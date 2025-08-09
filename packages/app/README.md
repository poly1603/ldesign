# 🚀 LDesign Engine Router 集成演示

> 展示 `@ldesign/router` 与 `@ldesign/engine` **简化集成**的演示应用

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## ✨ 功能特性

### 🎯 简化集成（新特性）

- **插件化路由**: 使用 `routerPlugin` 一键集成路由功能
- **零配置适配器**: 无需手动创建复杂的适配器文件
- **标准插件接口**: 使用 `engine.use()` 统一插件管理
- **配置即用**: 路由配置通过插件参数直接传入

### 🛣️ 路由功能

- **编程式导航**: 支持 `push`、`replace`、`go`、`back`、`forward`
- **声明式导航**: 使用 `RouterLink` 组件进行导航
- **路由守卫**: 全局前置守卫、后置守卫、错误处理
- **懒加载**: 路由级别的代码分割和懒加载
- **预加载**: 智能路由预加载，提升用户体验
- **缓存管理**: 路由组件缓存控制

### 🔧 Engine 集成

- **状态管理**: 路由状态自动同步到 Engine 状态系统
- **事件系统**: 路由变化触发 Engine 事件
- **日志系统**: 路由操作自动记录到 Engine 日志
- **通知系统**: 路由操作触发用户通知
- **错误管理**: 路由错误集成到 Engine 错误处理

### 🎨 示例页面

- **登录页面** (`/login`): 演示身份验证和路由跳转
- **首页** (`/`): 展示集成功能和用户信息
- **仪表板** (`/dashboard`): 需要认证的受保护页面
- **404 页面**: 友好的错误页面

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 🔑 使用说明

### 登录演示

1. 访问 http://localhost:3000
2. 点击"立即登录"或直接访问 `/login`
3. 使用演示账号：
   - 用户名: `admin`
   - 密码: `admin`
4. 登录成功后自动跳转到首页

### 功能演示

- **路由导航**: 使用导航栏在不同页面间切换
- **状态管理**: 登录状态在页面间保持
- **权限控制**: 未登录时无法访问仪表板
- **预加载**: 点击"预加载仪表板"体验预加载功能
- **缓存管理**: 点击"清理缓存"清理路由缓存
- **通知系统**: 各种操作会显示相应通知
- **日志记录**: 打开浏览器控制台查看详细日志

## 🔄 简化集成对比

### 新方式（简化）

```typescript
// main.ts
import { createApp } from '@ldesign/engine'
import { routerPlugin } from '@ldesign/router'
import { routes } from './router/routes'

const engine = createApp(App)

// 一行代码集成路由
await engine.use(
  routerPlugin({
    routes,
    mode: 'history',
    base: '/',
  })
)

engine.mount('#app')
```

### 旧方式（复杂）

```typescript
// 需要创建适配器文件 router/adapter.ts
import { createRouterAdapter } from './router/adapter'

const routerAdapter = createRouterAdapter()
const engine = createApp(App, {
  router: routerAdapter, // 通过配置传入
})
```

## 🏗️ 项目结构（简化后）

```
src/
├── router/                 # 路由配置
│   └── routes.ts          # 路由定义（简化）
├── views/                 # 页面组件
│   ├── Login.tsx          # 登录页面
│   ├── Home.tsx           # 首页
│   └── ...                # 其他页面
├── components/            # 公共组件
│   └── Navigation.tsx     # 导航组件
├── App.tsx                # 根组件
└── main.ts                # 应用入口
```

## 🔧 技术栈

- **Vue 3**: 渐进式 JavaScript 框架
- **TypeScript**: 类型安全的 JavaScript
- **TSX**: Vue 的 JSX 语法支持
- **@ldesign/engine**: 应用引擎和状态管理
- **@ldesign/router**: 高性能 Vue 路由器
- **Vite**: 现代化构建工具

## 📚 集成方案

### RouterAdapter 模式

采用适配器模式将 `@ldesign/router` 集成到 `@ldesign/engine` 中：

```typescript
// 创建路由适配器
const routerAdapter = createLDesignRouterAdapter(routes)

// 集成到 Engine
const engine = createEngine({
  router: routerAdapter,
  // ... 其他配置
})
```

### 深度集成特性

1. **状态同步**: 路由状态自动同步到 Engine
2. **事件集成**: 路由变化触发 Engine 事件
3. **生命周期**: 完整的路由生命周期管理
4. **错误处理**: 统一的错误处理机制

## 🎯 核心优势

### 1. 架构清晰

- 采用适配器模式，保持组件间的解耦
- 清晰的职责分离和接口设计
- 易于测试和维护

### 2. 类型安全

- 完整的 TypeScript 类型支持
- 编译时类型检查
- 优秀的开发体验

### 3. 性能优秀

- 路由级别的代码分割
- 智能预加载策略
- 高效的缓存管理

### 4. 功能丰富

- 完整的路由功能
- 深度的 Engine 集成
- 丰富的开发工具

## 📖 详细文档

- [集成方案详解](./docs/router-integration.md)
- [API 文档](./docs/api.md)
- [最佳实践](./docs/best-practices.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
