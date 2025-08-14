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
- **🔧 基础集成**: Engine + Router + Template + HTTP + i18n + Device

### 📦 集成的包

- **@ldesign/engine**: 应用引擎核心
- **@ldesign/router**: 路由管理
- **@ldesign/template**: 模板系统
- **@ldesign/http**: HTTP 请求管理
- **@ldesign/i18n**: 国际化支持
- **@ldesign/device**: 设备检测

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
# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint
```

### 构建

```bash
# 构建包
pnpm build

# 预览构建结果
pnpm preview
```

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
