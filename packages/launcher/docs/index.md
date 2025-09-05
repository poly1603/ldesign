---
layout: home

hero:
  name: "@ldesign/launcher"
  text: "前端项目启动器"
  tagline: "基于 Vite JavaScript API 的统一开发、构建和预览解决方案"
  image:
    src: /logo.svg
    alt: LDesign Launcher
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/ldesign/launcher

features:
  - icon: 🚀
    title: 基于 Vite
    details: 利用 Vite 的强大功能和生态系统，提供极速的开发体验

  - icon: 🛠️
    title: 统一 API
    details: 提供一致的开发、构建和预览体验，简化前端工作流程

  - icon: 🔧
    title: 高度可配置
    details: 支持灵活的配置管理和扩展，满足各种项目需求

  - icon: 🔌
    title: 插件系统
    details: 支持插件扩展和自定义功能，构建强大的工具链

  - icon: 📊
    title: 性能监控
    details: 内置性能监控和优化建议，帮助提升开发效率

  - icon: 🎯
    title: TypeScript
    details: 完整的 TypeScript 支持，提供类型安全的开发体验

  - icon: 📱
    title: CLI 工具
    details: 提供友好的命令行界面，支持各种开发场景

  - icon: ⚡
    title: 高性能
    details: 基于 Vite 5.0+ 的高性能构建，快速启动和热更新

  - icon: 🔥
    title: 热更新
    details: 完整的 HMR 支持，实时预览代码变更
---

## 快速体验

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/launcher
```

```bash [npm]
npm install @ldesign/launcher
```

```bash [yarn]
yarn add @ldesign/launcher
```

:::

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

# 查看帮助
launcher --help
```

## 为什么选择 @ldesign/launcher？

### 🎯 专注开发体验

@ldesign/launcher 专注于提供最佳的前端开发体验。通过统一的 API 和配置，让开发者能够专注于业务逻辑，而不是工具配置。

### 🔧 灵活且强大

基于 Vite 的强大功能，同时提供了丰富的扩展能力。无论是简单的静态站点还是复杂的单页应用，都能轻松应对。

### 📊 性能优先

内置性能监控和优化建议，帮助开发者识别和解决性能问题，确保应用的最佳性能表现。

### 🌟 现代化工具链

采用最新的前端技术栈，支持 ES 模块、TypeScript、热更新等现代化特性，让开发更加高效。

## 生态系统

@ldesign/launcher 是 LDesign 生态系统的重要组成部分：

- **[@ldesign/kit](https://github.com/ldesign/kit)** - 核心工具库
- **[@ldesign/builder](https://github.com/ldesign/builder)** - 构建工具
- **[@ldesign/components](https://github.com/ldesign/components)** - 组件库

## 社区

- [GitHub 讨论](https://github.com/ldesign/launcher/discussions) - 提问和讨论
- [GitHub Issues](https://github.com/ldesign/launcher/issues) - 报告问题
- [贡献指南](https://github.com/ldesign/launcher/blob/main/CONTRIBUTING.md) - 参与贡献

## 许可证

[MIT](https://github.com/ldesign/launcher/blob/main/LICENSE) © LDesign Team
