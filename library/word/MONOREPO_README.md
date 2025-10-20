# Word Viewer - Monorepo 工作空间

一个功能强大的 Word 文档查看和编辑插件，采用 **Monorepo** 架构组织。

## 📦 包结构

本项目使用 npm workspaces 组织，包含以下子包：

### @word-viewer/core

核心库，包含所有基础功能，无框架依赖。

```bash
npm install @word-viewer/core
```

**功能：**
- 文档加载（File、URL、ArrayBuffer）
- 文档渲染（docx-preview + mammoth）
- 缩放、搜索、分页
- 文档编辑和格式化
- 多格式导出（PDF、HTML、DOCX）

### @word-viewer/vue

Vue 3 组件封装。

```bash
npm install @word-viewer/vue
```

**使用：**
```vue
<template>
  <WordViewer :source="file" :zoom="1.2" />
</template>

<script setup>
import { WordViewerComponent as WordViewer } from '@word-viewer/vue';
</script>
```

### @word-viewer/react

React 组件封装。

```bash
npm install @word-viewer/react
```

**使用：**
```tsx
import { WordViewerComponent } from '@word-viewer/react';

function App() {
  return <WordViewerComponent source={file} zoom={1.2} />;
}
```

### @word-viewer/lit

Lit Web Component。

```bash
npm install @word-viewer/lit
```

**使用：**
```html
<script type="module">
  import '@word-viewer/lit';
</script>

<word-viewer src="document.docx"></word-viewer>
```

## 🚀 快速开始

### 开发环境设置

1. **克隆仓库**

```bash
git clone https://github.com/your-username/word-viewer.git
cd word-viewer
```

2. **安装依赖**

```bash
npm install
```

这将自动安装所有子包的依赖。

3. **构建所有包**

```bash
npm run build
```

或单独构建：

```bash
npm run build:core   # 构建核心包
npm run build:vue    # 构建 Vue 包
npm run build:react  # 构建 React 包
npm run build:lit    # 构建 Lit 包
```

4. **开发模式**

```bash
npm run dev
```

这将监听所有包的文件变化并自动重新构建。

## 📂 项目结构

```
word-viewer/
├── packages/
│   ├── core/                   # @word-viewer/core
│   │   ├── src/
│   │   │   ├── core/          # 核心类和类型
│   │   │   ├── modules/       # 功能模块
│   │   │   ├── utils/         # 工具函数
│   │   │   ├── styles/        # 样式文件
│   │   │   └── index.ts       # 入口文件
│   │   ├── dist/              # 构建输出
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   ├── vue/                    # @word-viewer/vue
│   │   ├── src/
│   │   │   ├── WordViewer.vue
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   ├── react/                  # @word-viewer/react
│   │   ├── src/
│   │   │   ├── WordViewer.tsx
│   │   │   └── index.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   │
│   └── lit/                    # @word-viewer/lit
│       ├── src/
│       │   ├── word-viewer.ts
│       │   └── index.ts
│       ├── dist/
│       ├── package.json
│       ├── tsconfig.json
│       └── rollup.config.js
│
├── examples/                   # 示例项目
│   ├── vanilla/
│   ├── vue/
│   └── react/
│
├── docs/                       # 文档
├── package.json                # 根配置（workspaces）
├── tsconfig.json               # 根 TypeScript 配置
└── README.md
```

## 🔗 包依赖关系

```
@word-viewer/vue  ──┐
@word-viewer/react ──┼──> @word-viewer/core
@word-viewer/lit  ──┘
```

所有框架包都依赖核心包：

```json
{
  "dependencies": {
    "@word-viewer/core": "workspace:*"
  }
}
```

## 💻 开发工作流

### 添加新功能

1. 在对应的包目录下修改代码
2. 运行 `npm run dev` 监听变化
3. 在示例项目中测试

### 调试特定包

```bash
cd packages/core
npm run dev
```

### 运行测试

```bash
npm run test
```

## 📝 发布流程

### 发布单个包

```bash
cd packages/core
npm publish
```

### 发布所有包

建议使用 lerna 或 changesets 工具管理版本和发布。

```bash
# 使用 lerna
npx lerna publish

# 或手动发布
cd packages/core && npm publish
cd packages/vue && npm publish
cd packages/react && npm publish
cd packages/lit && npm publish
```

## 🎯 使用场景

### 只需要核心功能

```bash
npm install @word-viewer/core
```

```javascript
import { WordViewer } from '@word-viewer/core';

const viewer = new WordViewer('#container');
await viewer.loadFile(file);
```

### Vue 项目

```bash
npm install @word-viewer/vue
```

```vue
<WordViewer :source="file" />
```

### React 项目

```bash
npm install @word-viewer/react
```

```tsx
<WordViewerComponent source={file} />
```

### Lit / Web Components

```bash
npm install @word-viewer/lit
```

```html
<word-viewer src="doc.docx"></word-viewer>
```

## 🔧 包脚本

### 根目录

- `npm run build` - 构建所有包
- `npm run build:core` - 构建核心包
- `npm run build:vue` - 构建 Vue 包
- `npm run build:react` - 构建 React 包
- `npm run build:lit` - 构建 Lit 包
- `npm run dev` - 开发模式（所有包）
- `npm run clean` - 清理所有 dist 目录
- `npm run test` - 运行所有测试

### 单个包目录

- `npm run build` - 构建当前包
- `npm run dev` - 开发模式
- `npm run clean` - 清理 dist

## 🌟 优势

### 1. 按需安装

用户只需安装所需的包，减小依赖体积。

**只用核心功能：**
```bash
npm install @word-viewer/core  # 最小体积
```

**Vue 项目：**
```bash
npm install @word-viewer/vue  # 自动依赖 core
```

### 2. 独立版本管理

每个包可以独立升级版本，不影响其他包。

### 3. 清晰的依赖关系

- 核心包无框架依赖
- 框架包仅依赖核心包和对应框架
- 避免循环依赖

### 4. 更好的开发体验

- 工作空间自动链接本地包
- 无需手动 `npm link`
- 统一的依赖管理

### 5. 易于维护

- 每个包职责单一
- 代码组织清晰
- 便于团队协作

## 📚 文档

- [核心包 README](./packages/core/README.md)
- [Vue 包 README](./packages/vue/README.md)
- [React 包 README](./packages/react/README.md)
- [Lit 包 README](./packages/lit/README.md)
- [API 文档](./API.md)
- [迁移指南](./MIGRATION_GUIDE.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

MIT License

## ❓ 常见问题

### Q: 如何在本地测试包之间的依赖？

A: 使用 `workspace:*` 协议，npm 会自动链接本地包。

### Q: 构建顺序是什么？

A: 先构建 core，再构建其他包：

```bash
npm run build:core
npm run build:vue
npm run build:react
npm run build:lit
```

### Q: 如何添加新的框架支持？

A: 在 `packages/` 下创建新目录，参考现有包的结构。

### Q: TypeScript 类型如何共享？

A: 核心包导出所有类型，框架包重新导出：

```typescript
export type { ViewerOptions } from '@word-viewer/core';
```

## 🎉 开始使用

1. 安装依赖：`npm install`
2. 构建所有包：`npm run build`
3. 查看示例：打开 `examples/` 目录
4. 开始开发：`npm run dev`

祝你使用愉快！🚀


