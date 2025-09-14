# 安装

## 包管理器安装

### npm

```bash
npm install @ldesign/tree
```

### yarn

```bash
yarn add @ldesign/tree
```

### pnpm

```bash
pnpm add @ldesign/tree
```

## CDN 引入

### jsDelivr

```html
<!-- 核心库 -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/tree@latest/dist/index.umd.js"></script>
<!-- 样式文件 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ldesign/tree@latest/dist/style.css">
```

### unpkg

```html
<!-- 核心库 -->
<script src="https://unpkg.com/@ldesign/tree@latest/dist/index.umd.js"></script>
<!-- 样式文件 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/tree@latest/dist/style.css">
```

## 框架特定安装

### Vue 3

```bash
npm install @ldesign/tree
```

```typescript
// main.ts
import { createApp } from 'vue'
import LDesignTree from '@ldesign/tree/vue'
import '@ldesign/tree/style.css'

const app = createApp(App)
app.use(LDesignTree)
```

### React

```bash
npm install @ldesign/tree react react-dom
```

```typescript
// App.tsx
import { LDesignTree } from '@ldesign/tree/react'
import '@ldesign/tree/style.css'
```

### Angular

```bash
npm install @ldesign/tree
```

```typescript
// app.module.ts
import { LDesignTreeModule } from '@ldesign/tree/angular'

@NgModule({
  imports: [LDesignTreeModule],
})
export class AppModule {}
```

## 样式引入

### 完整样式

```typescript
import '@ldesign/tree/style.css'
```

### 按需引入

```typescript
// 核心样式（必需）
import '@ldesign/tree/dist/core.css'

// 主题样式（可选）
import '@ldesign/tree/dist/themes/default.css'
// 或
import '@ldesign/tree/dist/themes/dark.css'
// 或
import '@ldesign/tree/dist/themes/compact.css'

// 插件样式（可选）
import '@ldesign/tree/dist/plugins/toolbar.css'
import '@ldesign/tree/dist/plugins/context-menu.css'
```

## TypeScript 支持

@ldesign/tree 使用 TypeScript 编写，提供完整的类型定义。

### 自动类型推导

```typescript
import Tree from '@ldesign/tree'

const tree = new Tree(container, {
  data: [], // 自动推导为 TreeNodeData[]
  selection: {
    mode: 'multiple', // 自动推导为 'single' | 'multiple' | 'cascade'
  },
})
```

### 手动类型导入

```typescript
import Tree, { 
  TreeOptions, 
  TreeNodeData, 
  SelectionMode 
} from '@ldesign/tree'

const options: TreeOptions = {
  selection: {
    mode: 'multiple' as SelectionMode,
  },
}

const data: TreeNodeData[] = [
  {
    id: '1',
    label: '节点1',
  },
]
```

## 环境要求

### Node.js 版本

- Node.js >= 16.0.0
- npm >= 7.0.0

### 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome | ≥ 88 |
| Firefox | ≥ 78 |
| Safari | ≥ 14 |
| Edge | ≥ 88 |

### 框架版本

| 框架 | 版本 |
|------|------|
| Vue | ≥ 3.0.0 |
| React | ≥ 17.0.0 |
| Angular | ≥ 12.0.0 |

## 构建工具配置

### Vite

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@ldesign/tree'],
  },
})
```

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@ldesign/tree': require.resolve('@ldesign/tree'),
    },
  },
}
```

### Rollup

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve'

export default {
  plugins: [
    resolve({
      preferBuiltins: false,
    }),
  ],
}
```

## 验证安装

创建一个简单的示例来验证安装是否成功：

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/@ldesign/tree@latest/dist/style.css">
</head>
<body>
  <div id="tree"></div>
  
  <script src="https://unpkg.com/@ldesign/tree@latest/dist/index.umd.js"></script>
  <script>
    const tree = new LDesignTree.Tree(document.getElementById('tree'), {
      data: [
        {
          id: '1',
          label: '根节点',
          children: [
            { id: '1-1', label: '子节点1' },
            { id: '1-2', label: '子节点2' },
          ],
        },
      ],
    })
    
    console.log('Tree 安装成功！', tree)
  </script>
</body>
</html>
```

## 常见问题

### Q: 为什么样式没有生效？

A: 请确保正确引入了样式文件：

```typescript
import '@ldesign/tree/style.css'
```

### Q: TypeScript 类型错误怎么解决？

A: 确保安装了最新版本，并检查 tsconfig.json 配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

### Q: 在 SSR 环境中如何使用？

A: 使用动态导入避免服务端渲染问题：

```typescript
// Vue
const LDesignTree = defineAsyncComponent(() => import('@ldesign/tree/vue'))

// React
const LDesignTree = lazy(() => import('@ldesign/tree/react'))
```

### Q: 如何减小打包体积？

A: 使用按需引入和 tree-shaking：

```typescript
// 只引入需要的功能
import { Tree } from '@ldesign/tree/core'
import { SelectionPlugin } from '@ldesign/tree/plugins'
```

## 下一步

安装完成后，你可以：

- [快速开始](./getting-started) - 创建你的第一个树形组件
- [数据结构](./data-structure) - 了解树形数据的组织方式
- [配置选项](../api/options) - 查看所有可用的配置选项
