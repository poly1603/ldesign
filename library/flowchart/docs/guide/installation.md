# 安装

## 环境要求

- Node.js >= 16.0.0
- 支持 ES2020+ 的现代浏览器

## 包管理器安装

使用你喜欢的包管理器安装 ApprovalFlow：

::: code-group

```bash [npm]
npm install @ldesign/approval-flow @logicflow/core
```

```bash [yarn]
yarn add @ldesign/approval-flow @logicflow/core
```

```bash [pnpm]
pnpm add @ldesign/approval-flow @logicflow/core
```

:::

## 依赖说明

### 核心依赖

- **@logicflow/core** - LogicFlow 核心库，提供流程图编辑的底层能力

### 框架依赖（可选）

如果你使用 Vue 或 React，需要确保已安装相应的框架：

#### Vue 3

```bash
npm install vue@^3.0.0
```

#### React

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

## CDN 引入

你也可以通过 CDN 直接在 HTML 中引入：

```html
<!-- 引入 LogicFlow -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/style/index.css" />
<script src="https://cdn.jsdelivr.net/npm/@logicflow/core/dist/logic-flow.js"></script>

<!-- 引入 ApprovalFlow -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/approval-flow/dist/index.umd.js"></script>

<script>
  const editor = new ApprovalFlow.ApprovalFlowEditor({
    container: '#editor',
    width: '100%',
    height: '600px',
  });
</script>
```

## TypeScript 支持

ApprovalFlow 使用 TypeScript 编写，提供了完整的类型定义。如果你使用 TypeScript，无需额外安装类型定义包。

```typescript
import { ApprovalFlowEditor, FlowChartData, NodeData } from '@ldesign/approval-flow';

const editor: ApprovalFlowEditor = new ApprovalFlowEditor({
  container: '#editor',
  width: '100%',
  height: '600px',
});

const data: FlowChartData = {
  nodes: [],
  edges: [],
};
```

## 样式引入

### 方式一：在 JavaScript 中引入

```js
import '@logicflow/core/dist/style/index.css';
```

### 方式二：在 HTML 中引入

```html
<link rel="stylesheet" href="node_modules/@logicflow/core/dist/style/index.css" />
```

### 方式三：在 CSS 中引入

```css
@import '@logicflow/core/dist/style/index.css';
```

## 验证安装

创建一个简单的示例来验证安装是否成功：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ApprovalFlow 测试</title>
  <link rel="stylesheet" href="node_modules/@logicflow/core/dist/style/index.css">
  <style>
    #editor { width: 100%; height: 600px; }
  </style>
</head>
<body>
  <div id="editor"></div>

  <script type="module">
    import { ApprovalFlowEditor } from '@ldesign/approval-flow';

    const editor = new ApprovalFlowEditor({
      container: '#editor',
      width: '100%',
      height: '600px',
    });

    editor.setData({
      nodes: [
        { id: '1', type: 'start', name: '开始' },
        { id: '2', type: 'end', name: '结束' },
      ],
      edges: [
        { id: 'e1', sourceNodeId: '1', targetNodeId: '2' },
      ],
    });

    console.log('ApprovalFlow 安装成功！');
  </script>
</body>
</html>
```

如果看到流程图正常显示，说明安装成功！

## 下一步

- [快速开始](/guide/getting-started) - 开始使用 ApprovalFlow
- [配置选项](/guide/configuration) - 了解所有配置选项
