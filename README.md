# 🚀 LDesign - 现代化的 Vue3 组件库和工具集

<div align="center">

![LDesign Logo](https://via.placeholder.com/200x80/1890ff/ffffff?text=LDesign)

**高性能 · 易用 · 可扩展的前端开发解决方案**

[![npm version](https://img.shields.io/npm/v/@ldesign/engine.svg)](https://www.npmjs.com/package/@ldesign/engine)
[![license](https://img.shields.io/npm/l/@ldesign/engine.svg)](https://github.com/poly1603/ldesign/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/@ldesign/engine.svg)](https://www.npmjs.com/package/@ldesign/engine)

[📖 文档](https://ldesign.dev) · [🎮 演示](https://ldesign.dev/demo) · [🐛 报告问题](https://github.com/poly1603/ldesign/issues)

</div>

## ✨ 特性

- 🚀 **现代化架构** - 基于 Vue 3 Composition API 和 TypeScript
- 🎨 **智能主题系统** - 基于色彩科学的主题生成器，支持深色模式
- 🧭 **企业级路由** - 集成权限管理、缓存策略、面包屑导航
- 📦 **增强状态管理** - 基于 Pinia 的装饰器和插件系统
- 🌍 **国际化支持** - 内置多语言支持，自动检测浏览器语言
- 🔐 **安全加密** - 提供完整的加密算法解决方案
- 📱 **设备检测** - 智能设备检测和特性检测
- ⚡ **高性能** - 优化的构建配置和运行时性能
- 🔧 **开发友好** - 完善的 TypeScript 支持和开发工具

## 📦 生态系统

| 包名                                 | 描述               |
| ------------------------------------ | ------------------ |
| [@ldesign/engine](./packages/engine) | 核心引擎和插件系统 |
| [@ldesign/router](./packages/router) | 企业级路由管理     |
| [@ldesign/store](./packages/store)   | 增强状态管理       |
| [@ldesign/color](./packages/color)   | 智能主题生成器     |
| [@ldesign/crypto](./packages/crypto) | 安全加密工具       |
| [@ldesign/device](./packages/device) | 设备检测工具       |
| [@ldesign/http](./packages/http)     | HTTP 请求库        |

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/engine @ldesign/router

# 使用 npm
npm install @ldesign/engine @ldesign/router

# 使用 yarn
yarn add @ldesign/engine @ldesign/router
```

### 基础使用

```typescript
// main.ts
import { createApp } from 'vue'
import { createEngine } from '@ldesign/engine'
import { createLDesignRouter } from '@ldesign/router'
import App from './App.vue'

// 创建引擎实例
const engine = createEngine({
  name: 'my-app',
  version: '1.0.0',
})

// 创建路由器
const router = createLDesignRouter({
  history: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue'),
    },
  ],
  // 启用主题管理
  themeManager: { enabled: true },
  // 启用国际化
  i18nManager: { enabled: true },
})

const app = createApp(App)
app.use(router)
app.provide('engine', engine)
app.mount('#app')
```

## 🏗️ 项目结构

经过优化的项目结构，更加清晰和易于维护：

```
ldesign/
├── packages/                 # 核心包
│   ├── engine/              # 核心引擎
│   ├── router/              # 路由管理
│   ├── store/               # 状态管理
│   ├── color/               # 主题系统
│   ├── crypto/              # 加密工具
│   ├── device/              # 设备检测
│   └── http/                # HTTP 请求
├── app/                     # 演示应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   │   ├── common/      # 通用组件
│   │   │   ├── layout/      # 布局组件
│   │   │   └── business/    # 业务组件
│   │   ├── views/           # 页面视图
│   │   ├── router/          # 路由配置
│   │   ├── composables/     # 组合式函数
│   │   ├── utils/           # 工具函数
│   │   ├── types/           # 类型定义
│   │   └── assets/          # 静态资源
│   └── package.json
├── docs/                    # VitePress 文档
├── tests/                   # 测试
└── scripts/                 # 构建脚本
```

## 📚 文档

- [快速开始](https://ldesign.dev/guide/getting-started) - 5分钟上手指南
- [路由管理](https://ldesign.dev/guide/router) - 企业级路由功能
- [状态管理](https://ldesign.dev/guide/store) - 装饰器和插件系统
- [主题系统](https://ldesign.dev/guide/theme) - 智能主题生成
- [API 参考](https://ldesign.dev/api) - 完整的 API 文档

## 🎮 演示

- [在线演示](https://ldesign.dev/demo) - 体验完整功能
- [演示应用源码](./app) - 查看实现细节

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行演示应用测试
pnpm --filter @ldesign/app test

# 生成测试覆盖率报告
pnpm test:coverage
```

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/poly1603/ldesign.git

# 安装依赖
cd ldesign
pnpm install

# 启动演示应用
pnpm --filter @ldesign/app dev

# 启动文档服务器
pnpm docs:dev

# 构建所有包
pnpm build
```

## 🎯 重构亮点

本次重构带来了以下改进：

### 🗂️ 目录结构优化

- 重新组织 `app/src` 目录，采用现代 Vue 项目最佳实践
- 清晰的组件分层：`common`、`layout`、`business`
- 合理的功能模块划分：`composables`、`utils`、`types`

### 🧭 路由系统升级

- 集成 `@ldesign/router` 企业级路由管理
- 支持主题管理、国际化、权限控制
- 智能的设备适配和缓存策略

### 🎨 主题管理

- 基于 CSS 变量的主题系统
- 支持亮色/暗色主题无缝切换
- 持久化主题设置

### 🌍 国际化支持

- 内置中英文双语支持
- 自动检测浏览器语言
- 动态语言切换

### 🧹 代码清理

- 删除冗余的空包：`i18n`、`size`、`template`、`error`、`logger`
- 保留有实际功能的核心包
- 优化依赖关系

### 📝 文档完善

- 详细的 VitePress 文档
- 生动活泼的使用指南
- 完整的 API 参考

## 🤝 贡献

我们欢迎所有形式的贡献！请阅读 [贡献指南](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

[MIT License](./LICENSE) © 2024 LDesign Team

---

<div align="center">

**[⬆ 回到顶部](#-ldesign---现代化的-vue3-组件库和工具集)**

Made with ❤️ by [LDesign Team](https://github.com/poly1603)

</div>
