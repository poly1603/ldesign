# LDesign Vue引擎项目

基于Vue3的现代化前端开发引擎，提供完整的插件化架构和跨框架兼容性。

## 项目架构

这是一个monorepo项目，包含以下核心包：

- **@ldesign/engine** - 核心引擎，提供插件系统和基础架构
- **@ldesign/color** - 颜色处理工具包
- **@ldesign/crypto** - 加密解密工具包
- **@ldesign/device** - 设备检测和适配工具包
- **@ldesign/http** - HTTP请求处理工具包
- **@ldesign/i18n** - 国际化工具包
- **@ldesign/router** - 路由管理工具包
- **@ldesign/store** - 状态管理工具包
- **@ldesign/template** - 模板引擎工具包

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
# 启动所有包的开发模式
pnpm dev

# 构建所有包
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 启动文档开发服务器
pnpm docs:dev
```

## 包结构

每个包都遵循统一的目录结构：

```
packages/[package-name]/
├── src/                 # 源代码
├── examples/           # Vue3示例项目
├── docs/               # VitePress文档
├── tests/              # Vitest测试用例
├── e2e/                # Playwright E2E测试
├── benchmarks/         # 性能测试
├── es/                 # ESM构建产物
├── cjs/                # CJS构建产物
├── dist/               # UMD构建产物
├── types/              # TypeScript声明文件
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite + Rollup
- **测试**: Vitest + Playwright
- **文档**: VitePress
- **代码规范**: ESLint (@antfu/eslint-config)
- **包管理**: pnpm workspace
- **版本管理**: Changesets

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License