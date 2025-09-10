# 安装

根据你的项目形态选择合适的安装方式。

## 使用包管理器（推荐）

::: code-group
```bash [pnpm]
pnpm add @ldesign/component
```

```bash [npm]
npm install @ldesign/component
```

```bash [yarn]
yarn add @ldesign/component
```
:::

安装后即可在任何支持自定义元素的环境中直接使用 `<ld-*>` 组件。

### 框架适配器（可选）

- Vue 3：
  ```bash
  npm install @ldesign/component-vue
  ```
- React：
  ```bash
  npm install @ldesign/component-react
  ```
- Angular：无需适配器，建议在模块中声明 `CUSTOM_ELEMENTS_SCHEMA` 以消除编译警告。

## 使用 CDN

无需安装，直接引入 ESM 包：

```html
<script type="module" src="https://unpkg.com/@ldesign/component/dist/ldesign/ldesign.esm.js"></script>
```

然后即可在页面中使用组件：

```html
<ld-button type="primary">Hello LDesign</ld-button>
```

## 环境要求

- 现代浏览器，支持自定义元素与 ES Modules
- Node.js >= 18（本地开发与构建）

## 下一步

- [快速开始](./getting-started)
- [主题定制](./theming)
- [框架集成](./framework-integration)

