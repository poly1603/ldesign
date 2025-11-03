# LDesign 项目架构说明

## 🎯 项目概述

LDesign 是一个基于 pnpm workspace 的 monorepo 项目，提供了一套完整的前端开发工具链和多框架应用引擎。

## 📦 核心组件

### 1. @ldesign/builder - 智能打包工具
位置：`tools/builder`

**功能：**
- 🚀 零配置打包，自动检测11种前端框架
- ⚡ 多引擎支持（esbuild/swc/rollup/rolldown）
- 📦 支持 ESM、CJS、UMD、DTS 多种格式
- 🎨 CSS/Less/Sass 预处理器支持
- 🔧 TypeScript 类型声明自动生成

**使用方式：**
```bash
# 在任何 package 中
pnpm build  # 使用 ldesign-builder build
```

### 2. @ldesign/launcher - 零配置启动器
位置：`tools/launcher`

**功能：**
- 🎯 零配置启动，自动检测13+框架
- 🔥 基于 Vite 5.0+，极速热更新
- 📱 支持 dev/build/preview 命令
- 🌐 多框架支持（Vue/React/Angular/Solid/Svelte等）

**使用方式：**
```bash
# 在 examples 中
launcher dev      # 启动开发服务器
launcher build    # 构建生产版本
launcher preview  # 预览构建结果
```

### 3. @ldesign/engine - 多框架应用引擎
位置：`packages/engine`

**架构设计：**

```
@ldesign/engine
├── packages/core          (@ldesign/engine-core)
│   ├── adapters/         # 适配器接口
│   ├── cache/            # 缓存系统
│   ├── config/           # 配置管理
│   ├── di/               # 依赖注入
│   ├── errors/           # 错误处理
│   ├── events/           # 事件系统
│   ├── lifecycle/        # 生命周期
│   ├── logger/           # 日志系统
│   ├── middleware/       # 中间件
│   ├── plugin/           # 插件系统
│   ├── state/            # 状态管理
│   └── utils/            # 工具函数
│
├── packages/vue          (@ldesign/engine-vue)
│   ├── adapter/          # Vue 适配器
│   ├── composables/      # Vue 组合式 API
│   └── directives/       # Vue 指令
│
├── packages/react        (@ldesign/engine-react)
│   ├── adapter/          # React 适配器
│   ├── hooks/            # React Hooks
│   └── components/       # React 组件
│
├── packages/angular      (@ldesign/engine-angular)
├── packages/solid        (@ldesign/engine-solid)
├── packages/svelte       (@ldesign/engine-svelte)
└── ...其他框架
```

## 🏗️ 包结构规范

### Packages 目录
`packages/*` - 所有功能包

**已实现的包：**
- ✅ `animation` - 动画系统
- ✅ `auth` - 认证授权
- ✅ `cache` - 缓存系统
- ✅ `color` - 颜色工具
- ✅ `crypto` - 加密工具
- ✅ `device` - 设备检测
- ✅ `engine` - 应用引擎
- ✅ `file` - 文件处理
- ✅ `http` - HTTP 请求
- ✅ `i18n` - 国际化
- ✅ `icons` - 图标库
- ✅ `logger` - 日志系统
- ✅ `menu` - 菜单系统
- ✅ `notification` - 通知系统
- ✅ `permission` - 权限管理
- ✅ `router` - 路由系统
- ✅ `shared` - 共享工具
- ✅ `size` - 尺寸工具
- ✅ `storage` - 存储抽象
- ✅ `store` - 状态管理
- ✅ `tabs` - 标签页系统
- ✅ `template` - 模板引擎
- ✅ `validator` - 验证库
- ✅ `websocket` - WebSocket 客户端

**所有包都使用 `@ldesign/builder` 进行打包！**

### Examples 目录
`examples/*` - 示例项目

**已配置的示例：**
- ✅ `vue` - Vue 3 示例（端口: 3001）
- ✅ `react` - React 18 示例（端口: 3000）
- ✅ `solid` - Solid.js 示例（端口: 3002）
- ✅ `svelte` - Svelte 示例（端口: 3003）
- ✅ `angular` - Angular 示例（端口: 3004）

**所有示例都使用 `@ldesign/launcher` 启动！**

## 🔧 开发流程

### 1. 开发新包

```bash
# 1. 创建新包目录
mkdir packages/your-package

# 2. 初始化 package.json
# 参考其他包的配置

# 3. 添加构建脚本
"scripts": {
  "build": "ldesign-builder build",
  "dev": "ldesign-builder build --watch"
}

# 4. 开发依赖
"devDependencies": {
  "@ldesign/builder": "workspace:*"
}
```

### 2. 创建示例项目

```bash
# 1. 创建示例目录
mkdir examples/your-framework

# 2. 配置 launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3005,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})

# 3. 添加启动脚本
"scripts": {
  "dev": "launcher dev",
  "build": "launcher build",
  "preview": "launcher preview"
}

# 4. 添加依赖
"dependencies": {
  "@ldesign/launcher": "workspace:*"
}
```

## 📊 架构优势

### 1. 统一的构建体验
- 所有 packages 使用相同的 builder
- 一致的配置方式
- 统一的输出格式

### 2. 框架无关的核心
- `@ldesign/engine-core` 不依赖任何框架
- 框架适配器独立维护
- 易于扩展新框架

### 3. 零配置开发
- launcher 自动检测框架
- builder 自动生成类型
- 最小化配置文件

### 4. 一致的用法
所有框架使用相同的 API：

```typescript
// Vue 示例
import { createEngine } from '@ldesign/engine-vue'
const engine = createEngine({ /* config */ })

// React 示例
import { createEngine } from '@ldesign/engine-react'
const engine = createEngine({ /* config */ })

// Solid 示例
import { createEngine } from '@ldesign/engine-solid'
const engine = createEngine({ /* config */ })
```

## 🚀 快速开始

### 构建所有包
```bash
pnpm build:all
```

### 运行示例
```bash
# Vue 示例
cd examples/vue
pnpm dev

# React 示例
cd examples/react
pnpm dev

# Solid 示例
cd examples/solid
pnpm dev
```

### 开发模式
```bash
# 在包目录中
pnpm dev  # 使用 builder watch 模式

# 在示例目录中
pnpm dev  # 使用 launcher 启动
```

## 📝 最佳实践

### 1. 包命名规范
- 核心包：`@ldesign/package-name`
- 框架适配器：`@ldesign/engine-framework`
- 工具包：`@ldesign/tool-name`

### 2. 目录结构
```
packages/your-package/
├── src/              # 源代码
│   ├── core/        # 核心功能
│   ├── types/       # 类型定义
│   └── index.ts     # 入口文件
├── package.json     # 包配置
├── builder.config.ts # 构建配置（可选）
└── README.md        # 文档
```

### 3. 依赖管理
- 使用 `workspace:*` 引用本地包
- 外部化 peer dependencies
- 最小化依赖

### 4. 导出规范
```json
{
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  }
}
```

## 🎯 总结

✅ **@ldesign/builder** - 所有 packages 使用统一的打包工具  
✅ **@ldesign/launcher** - 所有 examples 使用统一的启动器  
✅ **@ldesign/engine-core** - 框架无关的核心引擎  
✅ **多框架适配器** - Vue/React/Angular/Solid/Svelte 等  
✅ **一致的用法** - 所有框架使用相同的 API  

这个架构确保了：
- 🔧 开发体验一致
- 📦 构建流程统一
- 🎨 代码复用最大化
- 🚀 易于维护和扩展
