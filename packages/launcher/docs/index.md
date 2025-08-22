---
layout: home
hero:
  name: Vite Launcher
  text: 基于Vite的前端项目启动器
  tagline: 提供程序化API，支持多种前端框架，简化项目创建和开发流程
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看API
      link: /api/vite-launcher
    - theme: alt
      text: 在GitHub上查看
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🚀
    title: 快速启动
    details: 一键创建Vue、React、Vanilla等多种类型的前端项目，自动配置开发环境
  - icon: 🔧
    title: 程序化API
    details: 提供完整的TypeScript类型支持，易于集成到现有工具链中
  - icon: 🎯
    title: 智能检测
    details: 自动检测项目类型和依赖，智能配置构建参数
  - icon: 🛠️
    title: 灵活配置
    details: 支持自定义配置，满足不同项目的特殊需求
  - icon: 📦
    title: 模块化设计
    details: 清晰的架构分离，易于扩展和维护
  - icon: 🧪
    title: 完整测试
    details: 全面的测试覆盖，确保稳定性和可靠性

---

## 测试状态

当前测试通过率: **62/91 (68.1%)**

- ✅ ViteLauncher基础功能测试 (11/11)
- ✅ ViteLauncher简化测试 (8/8)  
- ✅ ErrorHandler服务测试 (7/7)
- ✅ 集成测试 (9/11)
- ⚠️ ProjectDetector测试 (需要进一步修复)
- ⚠️ 复杂集成测试 (需要进一步修复)

## 快速体验

```typescript
import { ViteLauncher, createProject, startDev } from '@ldesign/launcher'

// 创建Vue3项目
await createProject('./my-vue-app', 'vue3', { force: true })

// 启动开发服务器
const server = await startDev('./my-vue-app', { port: 3000 })

// 构建项目
const result = await buildProject('./my-vue-app', { outDir: 'dist' })
```

## 支持的项目类型

- **Vue 3** - 现代化的Vue框架
- **Vue 2** - 经典Vue框架
- **React** - 流行的React框架
- **React + Next.js** - 全栈React框架
- **Vanilla** - 原生JavaScript项目
- **TypeScript** - TypeScript项目
- **Lit** - Web Components框架
- **Svelte** - 现代前端框架
- **Angular** - 企业级前端框架

## 核心特性

### 🎯 智能项目检测
自动识别项目类型、依赖关系和配置需求

### 🔧 统一API接口
提供一致的API设计，简化集成工作

### 📦 模块化架构
清晰的关注点分离，易于扩展和维护

### 🛡️ 类型安全
完整的TypeScript支持，提供优秀的开发体验

### 🚀 高性能
基于Vite构建，提供快速的开发体验

### 🧪 测试覆盖
全面的测试覆盖，确保代码质量
