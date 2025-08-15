# 🚀 LDesign App - 简化演示应用

> 基于 Vue 3 + TypeScript + LDesign 生态系统的简洁演示模板

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## ✨ 功能特性

### 🎯 简洁的演示应用

- **🚀 快速启动**: 最简化的 LDesign 生态系统集成演示
- **📦 包集成展示**: 展示各个 LDesign 包的基本使用
- **🎨 简洁设计**: 干净、简洁的界面，专注于功能展示
- **🔧 完整集成**: 集成了 LDesign 生态系统的所有核心包

### 📦 集成的包

- **💾 @ldesign/cache**: 缓存管理 - 多种存储引擎，智能缓存策略
- **🎨 @ldesign/color**: 颜色主题 - 智能颜色生成，主题管理
- **🔐 @ldesign/crypto**: 加密功能 - AES、RSA、哈希等加密算法
- **📱 @ldesign/device**: 设备检测 - 智能设备类型识别
- **⚙️ @ldesign/engine**: 应用引擎 - 插件化架构核心
- **🌐 @ldesign/http**: HTTP 请求 - 强大的 HTTP 客户端
- **🌍 @ldesign/i18n**: 国际化 - 多语言支持
- **🛣️ @ldesign/router**: 路由管理 - 灵活的路由系统
- **📏 @ldesign/size**: 尺寸缩放 - 响应式尺寸管理
- **🗃️ @ldesign/store**: 状态管理 - 基于 Pinia 的状态管理
- **🎭 @ldesign/template**: 模板系统 - 动态模板渲染

## 🚀 快速开始

### 安装依赖

```bash
# 进入应用目录
cd packages/app

# 安装依赖
pnpm install
```

### 开发模式

```bash
# 启动开发服务器（默认：构建产物模式）
pnpm dev

# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint
```

## 🔧 双环境开发支持

本项目支持两种不同的开发环境，方便开发者在不同场景下进行开发和测试：

### 环境 A：构建产物模式 (Built Mode)

- **端口**: 3001
- **用途**: 使用已构建的 `@ldesign/*` 包
- **适用场景**: 生产环境开发、性能测试、最终用户体验验证
- **特点**: 更接近生产环境，启动速度快

### 环境 B：源码模式 (Source Mode)

- **端口**: 3002
- **用途**: 直接引用 `@ldesign/*` 包的源码目录
- **适用场景**: 开发调试、源码修改实时预览、包开发和测试
- **特点**: 支持热更新，便于调试

### 开发命令

#### 基础开发命令

```bash
# 默认开发模式（构建产物模式）
pnpm run dev

# 构建产物模式 - 端口 3001
pnpm run dev:built

# 源码模式 - 端口 3002
pnpm run dev:source

# 同时启动两种模式进行对比
pnpm run dev:compare
```

#### 环境切换工具

```bash
# 交互式选择环境（推荐）
pnpm run env

# 显示所有可用环境
pnpm run env:list

# 启动构建模式
pnpm run env:built

# 启动源码模式
pnpm run env:source

# 启动对比模式
pnpm run env:compare
```

#### 智能批量构建

```bash
# 智能并行构建（推荐）
pnpm run build:all

# 不同构建模式
pnpm run build:all:smart      # 智能并行（按依赖层级）
pnpm run build:all:parallel   # 完全并行（最快）
pnpm run build:all:serial     # 串行构建（最安全）

# 显示构建帮助
pnpm run build:all --help
```

#### 构建命令

```bash
# 构建（Rollup）
pnpm run build

# 构建（Vite - 构建模式）
pnpm run build:vite:built

# 构建（Vite - 源码模式）
pnpm run build:vite:source

# 预览构建结果
pnpm run preview:built
pnpm run preview:source
```

## 🎯 核心特性

### 🔧 智能双环境开发

- **构建模式**: 使用已构建的包，接近生产环境
- **源码模式**: 直接引用源码，支持热更新调试
- **对比模式**: 同时启动两种模式进行对比测试
- **交互式切换**: 友好的环境选择界面

### 🚀 智能批量构建

- **依赖分析**: 自动分析包之间的依赖关系
- **层级构建**: 按依赖层级分组并行构建
- **错误容错**: 单个包失败不影响其他包构建
- **性能优化**: 比传统串行构建快 60-80%

### 📊 开发体验优化

- **实时反馈**: 清晰的状态显示和进度提示
- **智能提示**: 详细的使用说明和错误提示
- **快速切换**: 一键切换不同开发环境
- **热更新支持**: 源码模式下的实时代码更新

## 📖 详细文档

更多详细信息请查看：

- [双环境开发支持文档](./DUAL_ENV_DEVELOPMENT.md)
- [API 集成文档](./API_INTEGRATION.md)

````

### 构建

```bash
# 构建包
pnpm build

# 预览构建结果
pnpm preview
````

## 🔑 使用说明

### 启动应用

```bash
# 安装依赖并启动
pnpm install && pnpm dev
```

访问 http://localhost:3001 查看演示应用

### 基本使用

```typescript
// 创建应用实例
import { createLDesignApp } from '@ldesign/app'

const app = await createLDesignApp({
  name: 'My App',
  debug: true,
})
```

## 🏗️ 项目结构

```
packages/app/
├── src/
│   ├── router/           # 路由配置
│   ├── styles/           # 样式文件
│   ├── types/            # 类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── Home/         # 首页
│   │   └── Login.tsx     # 登录页
│   ├── App.tsx           # 根组件
│   ├── main.ts           # 应用启动函数
│   └── index.ts          # 主入口文件
├── package.json          # 包配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目文档
```

## 🔧 技术栈

- **Vue 3.5+**: 渐进式 JavaScript 框架
- **TypeScript 5.6+**: 类型安全的 JavaScript
- **Vite 5.0+**: 现代化开发服务器
- **LDesign 生态系统**: Engine + Router + Template + HTTP + i18n + Device

## 🧪 测试

```bash
# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e
```

## 📄 许可证

[MIT](./LICENSE) © LDesign Team
