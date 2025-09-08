---
layout: home

hero:
  name: "@ldesign/git"
  text: "Git 操作封装库"
  tagline: 功能完整、类型安全、易于使用的 Git 操作库
  image:
    src: /logo.svg
    alt: ldesign git
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/ldesign/git

features:
  - icon: 🚀
    title: 完整的 Git 功能
    details: 支持所有常用的 Git 操作，包括仓库管理、分支操作、状态查询等
  - icon: 🎯
    title: 面向对象设计
    details: 清晰的类结构和 API 接口，高内聚、低耦合的设计原则
  - icon: 📝
    title: TypeScript 支持
    details: 完整的类型定义，提供优秀的开发体验和代码提示
  - icon: 🛡️
    title: 错误处理
    details: 统一的错误处理机制和详细的错误信息，便于调试
  - icon: 🎪
    title: 事件系统
    details: 支持事件监听，便于集成和调试，实时监控操作状态
  - icon: ⚡
    title: CLI 工具
    details: 提供命令行接口，支持直接使用，无需编程即可操作 Git
  - icon: 📦
    title: ESM 支持
    details: 使用现代 ES 模块语法，支持 Tree Shaking 和按需加载
  - icon: ✅
    title: 完整测试
    details: 96/97 测试通过，确保代码质量和功能稳定性
---

## 快速开始

### 安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/git
```

```bash [npm]
npm install @ldesign/git
```

```bash [yarn]
yarn add @ldesign/git
```

:::

### 基础用法

```typescript
import { Git } from '@ldesign/git'

// 创建 Git 实例
const git = Git.create('./my-project')

// 初始化仓库
await git.init()

// 添加文件
await git.add('.')

// 提交更改
await git.commit('Initial commit')

// 推送到远程仓库
await git.push('origin', 'main')
```

### CLI 工具

```bash
# 初始化仓库
ldesign-git init

# 添加文件
ldesign-git add .

# 提交更改
ldesign-git commit "Initial commit"

# 推送到远程
ldesign-git push origin main
```

## 快速链接

- 指南
  - [快速开始](/guide/getting-started)
  - [安装配置](/guide/installation)
  - [仓库操作](/guide/repository) · [分支管理](/guide/branches) · [状态查询](/guide/status)
- CLI
  - [命令概览](/cli/commands) · [远程仓库](/cli/remote)
- 高级
  - [代码可视化](/guide/visualization)
  - [智能命令推荐](/guide/recommendations)
  - [智能同步 API](/api/smart-sync)
  - [批量操作](/guide/batch-ops) · [钩子模板](/guide/hooks) · [团队协作](/guide/team) · [插件系统](/guide/plugins)
- 其他
  - [FAQ](/faq) · [故障排查](/troubleshooting)

## 为什么选择 @ldesign/git？

- **🎯 专业级功能** - 涵盖所有常用 Git 操作，满足各种开发需求
- **💡 易于使用** - 简洁的 API 设计，降低学习成本
- **🔒 类型安全** - 完整的 TypeScript 支持，减少运行时错误
- **⚡ 高性能** - 基于 simple-git 构建，性能优异
- **🛠️ 灵活配置** - 丰富的配置选项，适应不同使用场景
- **📚 完善文档** - 详细的文档和示例，快速上手

## 社区

- [GitHub Issues](https://github.com/ldesign/git/issues) - 报告问题和建议
- [GitHub Discussions](https://github.com/ldesign/git/discussions) - 社区讨论
- [更新日志](https://github.com/ldesign/git/releases) - 查看版本更新

## 许可证

[MIT License](https://github.com/ldesign/git/blob/main/LICENSE) © 2024 ldesign
