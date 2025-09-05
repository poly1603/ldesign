# @ldesign/launcher

[![NPM version](https://img.shields.io/npm/v/@ldesign/launcher.svg)](https://www.npmjs.com/package/@ldesign/launcher)
[![Build Status](https://github.com/ldesign/launcher/workflows/CI/badge.svg)](https://github.com/ldesign/launcher/actions)
[![Coverage Status](https://coveralls.io/repos/github/ldesign/launcher/badge.svg?branch=main)](https://coveralls.io/github/ldesign/launcher?branch=main)
[![License](https://img.shields.io/npm/l/@ldesign/launcher.svg)](https://github.com/ldesign/launcher/blob/main/LICENSE)

基于 Vite JavaScript API 的前端项目启动器，提供统一的开发服务器、构建工具和预览服务。

## ✨ 特性

- 🚀 **基于 Vite** - 利用 Vite 5.0+ 的强大功能和生态系统
- 🛠️ **统一 API** - 提供一致的开发、构建和预览体验
- 🔧 **高度可配置** - 支持灵活的配置管理和扩展
- 🔌 **插件系统** - 支持插件扩展和自定义功能
- 📊 **性能监控** - 内置性能监控和优化建议
- 🎯 **TypeScript** - 完整的 TypeScript 支持
- 📱 **CLI 工具** - 提供友好的命令行界面
- ⚡ **高性能** - 快速启动和热更新

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/launcher

# 使用 npm
npm install @ldesign/launcher

# 使用 yarn
yarn add @ldesign/launcher
```

## 🚀 快速开始

### 编程式 API

```typescript
import { ViteLauncher } from '@ldesign/launcher'

// 创建启动器实例
const launcher = new ViteLauncher({
  cwd: process.cwd(),
  config: {
    server: {
      port: 3000,
      host: 'localhost'
    }
  }
})

// 启动开发服务器
await launcher.startDev()

// 执行构建
await launcher.build()

// 启动预览服务器
await launcher.preview()
```

### CLI 工具

```bash
# 启动开发服务器
launcher dev

# 执行生产构建
launcher build

# 预览构建结果
launcher preview

# 查看配置
launcher config list

# 查看帮助
launcher --help
```

### 配置文件

创建 `launcher.config.ts` 或 `launcher.config.js`：

```typescript
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },
  
  launcher: {
    autoRestart: true,
    hooks: {
      beforeStart: () => {
        console.log('🚀 启动前钩子')
      },
      afterStart: () => {
        console.log('✅ 启动完成')
      }
    }
  }
})
```

## 📚 文档

- [快速开始](./docs/guide/getting-started.md)
- [配置参考](./docs/config/README.md)
- [API 参考](./docs/api/README.md)
- [CLI 参考](./docs/cli/README.md)
- [插件开发](./docs/plugins/README.md)
- [示例](./docs/examples/README.md)

## 🛠️ 支持的框架

@ldesign/launcher 通过智能检测自动支持以下框架：

- ✅ Vue 2.x
- ✅ Vue 3.x
- ✅ React
- ✅ Svelte
- ✅ Vanilla JavaScript/TypeScript

## 📋 系统要求

- Node.js >= 16.0.0
- 支持现代浏览器

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](./CONTRIBUTING.md)。

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

## 🔗 相关链接

- [GitHub](https://github.com/ldesign/launcher)
- [NPM](https://www.npmjs.com/package/@ldesign/launcher)
- [文档](https://ldesign.github.io/launcher/)
- [讨论](https://github.com/ldesign/launcher/discussions)
- [问题反馈](https://github.com/ldesign/launcher/issues)
