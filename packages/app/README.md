# 🚀 LDesign App - 完整应用模板

> 基于 Vue 3 + TypeScript + LDesign 生态系统的现代化应用开发模板

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Rollup](https://img.shields.io/badge/Rollup-4.0+-EC4A3F?style=flat-square&logo=rollup.js)](https://rollupjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## ✨ 功能特性

### 🎯 开箱即用的应用模板

- **🚀 快速启动**: 一键创建完整的 Vue 3 应用
- **📦 双模式构建**: 支持 Vite 开发 + Rollup 发布
- **🎨 现代化设计**: 精美的 UI 界面和交互体验
- **🔧 完整集成**: Engine + Router + Template 生态系统
- **📱 响应式布局**: 适配桌面端和移动端
- **🧪 测试就绪**: 内置单元测试和 E2E 测试配置

### 🛣️ 路由系统

- **编程式导航**: 支持 `push`、`replace`、`go`、`back`、`forward`
- **声明式导航**: 使用 `RouterLink` 组件进行导航
- **路由守卫**: 全局前置守卫、后置守卫、错误处理
- **懒加载**: 路由级别的代码分割和懒加载
- **预加载**: 智能路由预加载，提升用户体验
- **缓存管理**: 路由组件缓存控制

### 🔧 Engine 集成

- **状态管理**: 响应式状态管理和数据流
- **事件系统**: 全局事件总线和组件通信
- **日志系统**: 完整的日志记录和调试支持
- **通知系统**: 优雅的消息提示和用户反馈
- **错误管理**: 统一的错误处理和异常捕获

### 🎨 模板系统

- **多设备支持**: 桌面端、平板、移动端自适应
- **主题定制**: 灵活的主题配置和样式定制
- **组件库**: 丰富的可复用组件和工具函数
- **设计系统**: 统一的设计语言和视觉规范

### 📄 示例页面

- **登录页面** (`/login`): 现代化登录界面，支持多种认证方式
- **首页** (`/`): 应用概览和功能展示
- **仪表板** (`/dashboard`): 数据可视化和管理界面
- **产品管理** (`/products`): CRUD 操作和数据管理
- **设置页面** (`/settings`): 应用配置和用户偏好
- **个人资料** (`/profile`): 用户信息管理
- **帮助中心** (`/help`): 文档和支持信息

## 🚀 快速开始

### 方式一：作为应用模板使用

```bash
# 克隆项目
git clone <repository-url>
cd ldesign/packages/app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build:vite
```

### 方式二：作为 npm 包使用

```bash
# 安装包
npm install @ldesign/app

# 或使用 pnpm
pnpm add @ldesign/app
```

```typescript
// 在你的项目中使用
import { createApp, App, Login, theme } from '@ldesign/app'

// 创建应用实例
const app = await createApp({
  name: 'My App',
  version: '1.0.0',
  debug: false,
})

// 或直接使用组件
import { Login } from '@ldesign/app'
```

### 开发模式

```bash
# 启动开发服务器（Vite）
pnpm dev

# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint
```

### 构建和发布

```bash
# 构建用于发布的包（Rollup）
pnpm build

# 构建 Vite 应用
pnpm build:vite

# 预览构建结果
pnpm preview
```

## 🔑 使用说明

### 作为应用模板

1. **克隆并启动**

   ```bash
   git clone <repository-url>
   cd ldesign/packages/app
   pnpm install && pnpm dev
   ```

2. **访问应用**

   - 打开 http://localhost:3000
   - 使用演示账号登录：`admin` / `admin`

3. **开始开发**
   - 修改 `src/` 目录下的文件
   - 添加新的页面和组件
   - 自定义主题和样式

### 作为 npm 包

```typescript
// 1. 创建应用实例
import { createApp } from '@ldesign/app'

const app = await createApp({
  name: 'My Application',
  debug: process.env.NODE_ENV === 'development',
})

// 2. 使用单独的组件
import { Login, Dashboard } from '@ldesign/app'

// 3. 使用工具函数
import { formatDate, debounce, theme } from '@ldesign/app'

// 4. 使用路由配置
import { routes } from '@ldesign/app'
```

### 功能演示

- **🔐 登录系统**: 现代化登录界面，支持记住密码
- **🏠 首页展示**: 应用概览和功能介绍
- **📊 仪表板**: 数据可视化和管理界面
- **🛍️ 产品管理**: 完整的 CRUD 操作演示
- **⚙️ 设置页面**: 应用配置和用户偏好
- **👤 个人资料**: 用户信息管理
- **❓ 帮助中心**: 文档和支持信息
- **🔔 通知系统**: 优雅的消息提示
- **📝 日志记录**: 完整的操作日志

## 🏗️ 项目结构

```
packages/app/
├── src/
│   ├── components/        # 可复用组件
│   ├── router/           # 路由配置
│   │   └── routes.ts     # 路由定义
│   ├── styles/           # 样式和主题
│   │   └── index.ts      # 主题配置
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── Login.tsx     # 登录页面
│   │   ├── Home.tsx      # 首页
│   │   ├── Dashboard.tsx # 仪表板
│   │   └── ...           # 其他页面
│   ├── App.tsx           # 根组件
│   ├── main.ts           # 应用启动函数
│   └── index.ts          # 主入口文件
├── es/                   # ES 模块构建输出
├── lib/                  # CommonJS 构建输出
├── types/                # TypeScript 声明文件
├── dist/                 # Vite 构建输出
├── docs/                 # 文档
├── tests/                # 测试文件
├── package.json          # 包配置
├── vite.config.ts        # Vite 配置
├── rollup.config.js      # Rollup 配置
└── README.md             # 项目文档
```

## 🔧 技术栈

### 核心框架

- **Vue 3.5+**: 渐进式 JavaScript 框架
- **TypeScript 5.6+**: 类型安全的 JavaScript
- **TSX**: Vue 的 JSX 语法支持

### LDesign 生态系统

- **@ldesign/engine**: 应用引擎和状态管理
- **@ldesign/router**: 高性能 Vue 路由器
- **@ldesign/template**: 多设备模板系统

### 构建工具

- **Vite 5.0+**: 现代化开发服务器
- **Rollup 4.0+**: 生产环境打包工具
- **ESBuild**: 快速的 TypeScript 编译器

### 开发工具

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Vitest**: 单元测试框架
- **Playwright**: E2E 测试框架
- **VitePress**: 文档生成工具

## 📦 API 参考

### createApp(config?)

创建 LDesign 应用实例。

```typescript
import { createApp } from '@ldesign/app'

const app = await createApp({
  name: 'My App', // 应用名称
  version: '1.0.0', // 应用版本
  debug: true, // 调试模式
  theme: {
    // 主题配置
    primaryColor: '#667eea',
    darkMode: false,
  },
})
```

### 组件导出

```typescript
// 页面组件
import {
  App, // 根组件
  Login, // 登录页面
  Home, // 首页
  Dashboard, // 仪表板
  Products, // 产品管理
  Settings, // 设置页面
  Profile, // 个人资料
  Help, // 帮助中心
} from '@ldesign/app'

// 工具函数
import {
  formatDate, // 日期格式化
  debounce, // 防抖函数
  throttle, // 节流函数
  deepClone, // 深拷贝
  generateId, // 生成唯一ID
  isEmpty, // 空值检查
} from '@ldesign/app'

// 主题和样式
import { theme, cssVariables } from '@ldesign/app'

// 路由配置
import { routes } from '@ldesign/app'
```

## 🧪 测试

```bash
# 运行单元测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行 E2E 测试
pnpm test:e2e

# 在 UI 模式下运行测试
pnpm test:ui
```

## 📚 文档

```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建的文档
pnpm docs:preview
```

## 🤝 贡献

欢迎贡献代码！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

---

## 🔗 相关链接

- [LDesign Engine](../engine) - 应用引擎和状态管理
- [LDesign Router](../router) - 高性能 Vue 路由器
- [LDesign Template](../template) - 多设备模板系统
- [文档站点](./docs) - 完整的使用文档
- [示例项目](./examples) - 更多使用示例
