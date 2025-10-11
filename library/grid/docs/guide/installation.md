# 安装

## 包管理器

推荐使用 pnpm、npm 或 yarn 安装 @ldesign/gridstack。

::: code-group
```bash [pnpm]
pnpm add @ldesign/gridstack gridstack
```

```bash [npm]
npm install @ldesign/gridstack gridstack
```

```bash [yarn]
yarn add @ldesign/gridstack gridstack
```
:::

## CDN

如果你不使用包管理器，可以通过 CDN 使用：

```html
<!-- 引入 GridStack CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack.min.css" />

<!-- 引入自定义样式 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ldesign/gridstack@latest/dist/style.css" />

<!-- 引入 GridStack JS -->
<script src="https://cdn.jsdelivr.net/npm/gridstack@latest/dist/gridstack-all.js"></script>

<!-- 引入 @ldesign/gridstack -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/gridstack@latest/dist/index.umd.js"></script>
```

## 版本要求

### 框架版本

- **Vue**: >= 3.0.0
- **React**: >= 18.0.0
- **TypeScript**: >= 5.0.0 (推荐)

### 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

### Node.js

- Node.js >= 16.0.0

## 依赖

@ldesign/gridstack 依赖以下包：

- `gridstack`: ^10.3.1

对于特定框架：

- Vue: `vue` >= 3.0.0 (peer dependency)
- React: `react` >= 18.0.0, `react-dom` >= 18.0.0 (peer dependencies)

## TypeScript

@ldesign/gridstack 使用 TypeScript 编写，内置完整的类型定义。无需额外安装 @types 包。

```json
{
  "compilerOptions": {
    "types": ["@ldesign/gridstack"]
  }
}
```

## 开发环境

如果你想从源码构建或参与开发：

```bash
# 克隆仓库
git clone https://github.com/ldesign/gridstack.git

# 安装依赖
cd gridstack
pnpm install

# 构建
pnpm build

# 运行示例
cd examples/vue-demo
pnpm dev
```

## 下一步

- [快速开始](/guide/getting-started) - 创建你的第一个网格
- [Vanilla JS 指南](/guide/vanilla)
- [Vue 指南](/guide/vue)
- [React 指南](/guide/react)
