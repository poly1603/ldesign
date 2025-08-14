# 📦 LDesign 包结构标准

## 🎯 标准目录结构

每个包必须遵循以下统一的目录结构：

```
packages/[package-name]/
├── src/                        # 📝 源代码
│   ├── index.ts               # 主入口文件
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数
│   ├── core/                  # 核心功能
│   └── vue/                   # Vue集成（如果适用）
├── __tests__/                  # 🧪 单元测试（统一使用__tests__）
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── fixtures/              # 测试数据
├── e2e/                       # 🎭 E2E测试
│   ├── specs/                 # 测试规范
│   └── fixtures/              # 测试夹具
├── docs/                      # 📖 VitePress文档
│   ├── index.md              # 文档首页
│   ├── guide/                # 使用指南
│   ├── api/                  # API文档
│   └── examples/             # 示例代码
├── summary/                   # 📋 项目总结
│   ├── overview.md           # 项目概述
│   ├── architecture.md       # 架构设计
│   ├── implementation.md     # 实现细节
│   ├── usage.md              # 使用指南
│   ├── extensibility.md      # 扩展性设计
│   └── conclusion.md         # 项目总结
├── dist/                      # 📦 构建产物
├── es/                        # ES模块输出
├── lib/                       # CommonJS输出
├── types/                     # TypeScript声明文件
├── package.json               # 包配置
├── README.md                  # 包文档
├── CHANGELOG.md               # 变更日志
├── vite.config.ts             # Vite配置
├── vitest.config.ts           # 测试配置
├── playwright.config.ts       # E2E测试配置
└── tsconfig.json              # TypeScript配置
```

## 🔧 必需文件清单

### 1. **package.json 标准配置**

```json
{
  "name": "@ldesign/[package-name]",
  "type": "module",
  "version": "0.1.0",
  "description": "包描述",
  "author": "LDesign Team",
  "license": "MIT",
  "keywords": ["ldesign", "vue3", "typescript"],
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.js"
    }
  },
  "main": "./lib/index.js",
  "module": "./es/index.js",
  "types": "./types/index.d.ts",
  "files": ["dist", "es", "lib", "types", "README.md"],
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs"
  }
}
```

### 2. **README.md 标准模板**

每个包的 README 必须包含：

- 📖 包简介和特性
- 🚀 快速开始
- 📚 详细使用说明
- 🔧 API 文档链接
- 🧪 测试说明
- 📄 许可证信息

### 3. **summary/ 目录要求**

每个包必须创建 summary 目录，包含：

- **overview.md**: 项目主要功能和设计理念
- **architecture.md**: 架构设计和技术选型
- **implementation.md**: 核心实现细节
- **usage.md**: 详细使用指南和最佳实践
- **extensibility.md**: 扩展性设计和插件机制
- **conclusion.md**: 项目总结和未来规划

## 🎯 命名规范

### 文件命名

- 使用 kebab-case：`my-component.ts`
- 测试文件：`my-component.test.ts`
- 类型文件：`my-component.types.ts`

### 目录命名

- 使用 kebab-case：`my-feature/`
- 测试目录：统一使用`__tests__/`

### 导出命名

- 类：PascalCase `MyClass`
- 函数：camelCase `myFunction`
- 常量：UPPER_SNAKE_CASE `MY_CONSTANT`
- 类型：PascalCase `MyType`

## 🔄 标准化检查

使用以下命令检查包结构是否符合标准：

```bash
# 标准化所有包
pnpm tools:standardize

# 验证包结构
pnpm tools:verify-structure
```

## 📝 更新流程

当包结构发生变化时：

1. 更新此标准文档
2. 运行标准化工具
3. 更新相关文档
4. 通知团队成员
