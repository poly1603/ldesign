# 🚀 LDesign Engine 演示应用

> 一个生动有趣的演示应用，全面展示 LDesign Engine 的强大功能！

[![Vue 3](https://img.shields.io/badge/Vue-3.5+-4FC08D?style=flat-square&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

## ✨ 特性亮点

🎯 **完整功能演示** - 涵盖 LDesign Engine 的所有核心功能  
🎨 **现代化界面** - 基于 Vue 3 + TypeScript + TSX + Less 构建  
🔧 **交互式体验** - 实时代码编辑和执行结果展示  
📱 **响应式设计** - 完美适配桌面端和移动端  
🧪 **完整测试** - 单元测试 + E2E 测试全覆盖  
📚 **详细文档** - 从入门到精通的完整指南

## 🎪 功能演示

### 🏠 功能概览

- 引擎状态监控
- 功能模块导航
- 快速开始指南

### 🔌 插件系统

- 插件注册与卸载
- 生命周期管理
- 动态代码执行

### ⚡ 中间件支持

- 中间件链执行
- 优先级管理
- 拦截处理演示

### 📦 状态管理

- 响应式状态
- 数据持久化
- 状态订阅

### 📡 事件系统

- 发布订阅模式
- 事件监听管理
- 实时通信

### 📝 日志系统

- 多级别日志
- 格式化输出
- 日志过滤

### 🔔 通知系统

- 多类型通知
- 自定义样式
- 交互管理

### 🎯 指令管理

- 自定义指令
- 生命周期钩子
- DOM 操作

### 💾 缓存管理

- 智能缓存策略
- 生命周期控制
- 性能优化

### 📊 性能监控

- 实时性能指标
- 内存使用监控
- 性能分析工具

### 🔒 安全管理

- XSS 防护
- 输入验证
- 内容清理

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install

# 或者只安装 app 包的依赖
cd packages/app
pnpm install
```

### 启动开发服务器

```bash
# 启动演示应用
pnpm dev

# 应用将在 http://localhost:3000 启动
```

### 构建生产版本

```bash
# 构建应用
pnpm build

# 预览构建结果
pnpm preview
```

## 🧪 测试

### 运行单元测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 启动测试 UI
pnpm test:ui
```

### 运行 E2E 测试

```bash
# 运行 E2E 测试
pnpm test:e2e

# 启动 E2E 测试 UI
pnpm test:e2e:ui

# 以有头模式运行测试
pnpm test:e2e:headed
```

## 📚 文档

### 在线文档

```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览文档
pnpm docs:preview
```

### 文档结构

- **指南** - 详细的使用教程和最佳实践
- **示例** - 丰富的代码示例和演示
- **API** - 完整的 API 参考文档
- **最佳实践** - 开发建议和性能优化

## 🏗️ 项目结构

```
packages/app/
├── src/                    # 源代码
│   ├── components/         # Vue 组件
│   │   ├── demos/         # 演示组件
│   │   ├── Layout.tsx     # 布局组件
│   │   ├── Header.tsx     # 头部组件
│   │   ├── Sidebar.tsx    # 侧边栏组件
│   │   └── MainContent.tsx # 主内容组件
│   ├── styles/            # 样式文件
│   │   ├── index.less     # 主样式
│   │   ├── variables.less # 变量定义
│   │   └── components/    # 组件样式
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 根组件
│   └── main.ts            # 应用入口
├── tests/                 # 测试文件
│   ├── unit/              # 单元测试
│   ├── e2e/               # E2E 测试
│   └── setup.ts           # 测试配置
├── docs/                  # VitePress 文档
├── summary/               # 项目总结文档
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── vitest.config.ts       # Vitest 配置
├── playwright.config.ts   # Playwright 配置
└── README.md              # 项目说明
```

## 🎨 技术栈

- **框架**: Vue 3.5+ with Composition API
- **语言**: TypeScript 5.6+
- **构建**: Vite 5.0+
- **样式**: Less with CSS Variables
- **组件**: TSX (TypeScript JSX)
- **测试**: Vitest + Playwright
- **文档**: VitePress
- **代码质量**: ESLint + Prettier

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 配置
- 编写测试用例
- 更新相关文档

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

感谢所有为 LDesign Engine 项目做出贡献的开发者！

---

<div align="center">

**[🏠 首页](../../README.md)** • **[📚 文档](./docs/)** •
**[🐛 问题反馈](https://github.com/ldesign/ldesign/issues)** •
**[💬 讨论](https://github.com/ldesign/ldesign/discussions)**

Made with ❤️ by LDesign Team

</div>
