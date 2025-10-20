# Monorepo 迁移指南

本项目现已重构为 **Monorepo 工作空间** 架构。

## 📦 新的项目结构

```
word-viewer/
├── packages/
│   ├── core/                      # @word-viewer/core - 核心包
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── WordViewer.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── constants.ts
│   │   │   ├── modules/
│   │   │   │   ├── viewer.ts
│   │   │   │   ├── editor.ts
│   │   │   │   ├── parser.ts
│   │   │   │   └── exporter.ts
│   │   │   ├── utils/
│   │   │   │   ├── dom.ts
│   │   │   │   ├── event.ts
│   │   │   │   └── file.ts
│   │   │   ├── styles/
│   │   │   │   └── default.css
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   ├── vue/                       # @word-viewer/vue - Vue 组件
│   │   ├── src/
│   │   │   ├── WordViewer.vue
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   ├── react/                     # @word-viewer/react - React 组件
│   │   ├── src/
│   │   │   ├── WordViewer.tsx
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   └── lit/                       # @word-viewer/lit - Lit 组件
│       ├── src/
│       │   ├── word-viewer.ts
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── rollup.config.js
│
├── examples/                      # 示例项目
│   ├── vanilla/
│   ├── vue/
│   └── react/
├── docs/                          # 文档
├── package.json                   # 根 package.json (workspace 配置)
└── README.md
```

## 🔄 文件迁移

### 第一步：将核心代码移动到 packages/core

```bash
# 创建 packages/core 目录结构
mkdir -p packages/core/src

# 移动核心文件
cp -r src/core packages/core/src/
cp -r src/modules packages/core/src/
cp -r src/utils packages/core/src/
cp -r src/styles packages/core/src/
cp src/index.ts packages/core/src/
```

### 第二步：将 Vue 组件移动到 packages/vue

```bash
# 创建 packages/vue 目录结构
mkdir -p packages/vue/src

# 移动 Vue 组件
cp -r src/components/vue/* packages/vue/src/
```

### 第三步：将 React 组件移动到 packages/react

```bash
# 创建 packages/react 目录结构
mkdir -p packages/react/src

# 移动 React 组件
cp -r src/components/react/* packages/react/src/
```

### 第四步：将 Lit 组件移动到 packages/lit

```bash
# 创建 packages/lit 目录结构
mkdir -p packages/lit/src

# 移动 Lit 组件
cp -r src/components/lit/* packages/lit/src/
```

## 📝 包依赖关系

```
@word-viewer/vue    ──┐
@word-viewer/react  ──┼──> @word-viewer/core
@word-viewer/lit    ──┘
```

所有框架包都依赖核心包：

```json
{
  "dependencies": {
    "@word-viewer/core": "workspace:*"
  }
}
```

## 🚀 使用 Workspace

### 安装依赖

```bash
# 在根目录安装所有依赖
npm install
```

### 构建所有包

```bash
# 构建所有包
npm run build

# 或单独构建
npm run build:core
npm run build:vue
npm run build:react
npm run build:lit
```

### 开发模式

```bash
# 监听所有包的变化
npm run dev
```

### 发布包

```bash
# 发布到 npm (在各个包目录中)
cd packages/core && npm publish
cd packages/vue && npm publish
cd packages/react && npm publish
cd packages/lit && npm publish
```

## 🔧 包之间的引用

### 在 Vue 包中使用 Core

```typescript
// packages/vue/src/index.ts
import { WordViewer } from '@word-viewer/core';
```

### 在用户项目中使用

```bash
# 只需要核心功能
npm install @word-viewer/core

# Vue 项目
npm install @word-viewer/vue

# React 项目
npm install @word-viewer/react

# Lit 项目
npm install @word-viewer/lit
```

## 📦 各包说明

### @word-viewer/core

核心库，包含所有基础功能：
- WordViewer 核心类
- 文档加载、渲染、编辑
- 导出功能
- 工具函数

**不包含任何框架依赖**，可以在任何项目中使用。

### @word-viewer/vue

Vue 3 组件封装：
- `<WordViewer />` 组件
- Composition API
- 响应式属性
- 依赖 `@word-viewer/core` 和 `vue`

### @word-viewer/react

React 组件封装：
- `<WordViewerComponent />` 组件
- Hooks
- TypeScript 类型
- 依赖 `@word-viewer/core` 和 `react`

### @word-viewer/lit

Lit Web Component：
- `<word-viewer>` 自定义元素
- Shadow DOM
- 依赖 `@word-viewer/core` 和 `lit`

## 🎯 优势

### 1. 按需安装
用户只需安装所需的包，减小依赖体积。

### 2. 独立发布
每个包可以独立版本控制和发布。

### 3. 清晰的依赖关系
框架包明确依赖核心包。

### 4. 更好的代码组织
每个包职责单一，易于维护。

### 5. 开发体验
工作空间自动链接包，无需 npm link。

## 🔍 常见问题

### Q: 如何在本地开发时测试包之间的依赖？

A: 使用 `workspace:*` 协议，npm 会自动链接本地包：

```json
{
  "dependencies": {
    "@word-viewer/core": "workspace:*"
  }
}
```

### Q: 构建顺序是什么？

A: 先构建 core，再构建其他包：

```bash
npm run build:core
npm run build:vue
npm run build:react
npm run build:lit
```

### Q: 如何调试某个包？

A: 在对应的包目录下运行：

```bash
cd packages/core
npm run dev
```

### Q: TypeScript 如何处理包引用？

A: 使用 tsconfig 的 paths 配置：

```json
{
  "compilerOptions": {
    "paths": {
      "@word-viewer/core": ["./packages/core/src"]
    }
  }
}
```

## 📚 下一步

1. 运行迁移脚本移动文件
2. 安装依赖：`npm install`
3. 构建所有包：`npm run build`
4. 测试各个包的功能
5. 更新文档和示例

迁移完成后，项目将拥有更清晰的结构和更好的可维护性！



