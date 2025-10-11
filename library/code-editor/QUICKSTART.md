# 快速开始指南

## 安装依赖

首先，在项目根目录安装所有依赖：

```bash
pnpm install
```

## 构建库

```bash
pnpm build
```

构建完成后，会在 `dist/` 目录下生成以下文件：

- `code-editor.es.js` - ES Module 格式
- `code-editor.umd.js` - UMD 格式
- `vue.es.js` - Vue 适配器 ES Module 格式
- `vue.umd.js` - Vue 适配器 UMD 格式
- `style.css` - 样式文件
- `*.d.ts` - TypeScript 类型定义文件

## 运行示例

### Vanilla JavaScript 示例

```bash
# 在项目根目录运行
pnpm dev:vanilla

# 或者进入示例目录
cd examples/vanilla-demo
pnpm install
pnpm dev
```

然后访问 http://localhost:3000

该示例展示了：
- 基础编辑器用法
- 主题和语言切换
- 只读模式
- 自定义配置
- 事件监听

### Vue 3 示例

```bash
# 在项目根目录运行
pnpm dev:vue

# 或者进入示例目录
cd examples/vue-demo
pnpm install
pnpm dev
```

然后访问 http://localhost:3001

该示例展示了：
- Vue 组件用法
- v-model 双向绑定
- Props 和事件
- Composable API
- 多编辑器联动

## 在新项目中使用

### 1. 创建新的 Vite + TypeScript 项目

```bash
npm create vite@latest my-editor-app -- --template vanilla-ts
cd my-editor-app
npm install
```

### 2. 安装依赖

```bash
npm install @ldesign/code-editor monaco-editor
```

### 3. 使用编辑器

编辑 `src/main.ts`:

```typescript
import { createCodeEditor } from '@ldesign/code-editor'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <div>
    <h1>My Code Editor</h1>
    <div id="editor" style="height: 500px; border: 1px solid #ccc;"></div>
  </div>
`

const editor = createCodeEditor('#editor', {
  value: 'console.log("Hello World!")',
  language: 'javascript',
  theme: 'vs-dark',
  on: {
    change: (value) => {
      console.log('Code changed:', value)
    }
  }
})
```

### 4. 运行项目

```bash
npm run dev
```

## 在 Vue 3 项目中使用

### 1. 创建新的 Vue 3 项目

```bash
npm create vite@latest my-vue-editor -- --template vue-ts
cd my-vue-editor
npm install
```

### 2. 安装依赖

```bash
npm install @ldesign/code-editor monaco-editor
```

### 3. 使用组件

编辑 `src/App.vue`:

```vue
<template>
  <div class="app">
    <h1>My Vue Code Editor</h1>
    <CodeEditor
      v-model="code"
      language="javascript"
      theme="vs-dark"
      height="500px"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@ldesign/code-editor/vue'

const code = ref('console.log("Hello Vue!")')

const handleChange = (value: string) => {
  console.log('Code changed:', value)
}
</script>

<style scoped>
.app {
  padding: 20px;
}
</style>
```

### 4. 运行项目

```bash
npm run dev
```

## 配置 Monaco Editor Workers (可选)

如果遇到 Monaco Editor 相关的警告，可以配置 workers：

### Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor']
  }
})
```

## 常用配置示例

### 代码格式化

```typescript
const editor = createCodeEditor('#editor', {
  value: 'const x=1;const y=2;',
  language: 'javascript',
  theme: 'vs-dark'
})

// 格式化代码
await editor.format()
```

### 设置只读模式

```typescript
const editor = createCodeEditor('#editor', {
  value: 'const x = 1;',
  language: 'javascript',
  readOnly: true
})

// 动态切换只读模式
editor.setReadOnly(false)
```

### 监听光标位置

```typescript
const editor = createCodeEditor('#editor', {
  on: {
    cursorChange: (position) => {
      console.log(`Line: ${position.lineNumber}, Column: ${position.column}`)
    }
  }
})
```

### 插入文本

```typescript
// 在当前光标位置插入
editor.insertText('// New comment\n')

// 在指定位置插入
editor.insertText('// Line 1 comment\n', { lineNumber: 1, column: 1 })
```

### 获取选中文本

```typescript
const selectedText = editor.getSelection()
console.log('Selected:', selectedText)
```

## 性能优化

### 按需加载语言

只导入需要的语言支持以减小打包体积：

```typescript
// 仅导入 JavaScript/TypeScript 支持
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'

// 仅导入 JSON 支持
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
```

### 延迟初始化

```typescript
// 在用户交互后再初始化编辑器
button.addEventListener('click', () => {
  const editor = createCodeEditor('#editor', config)
})
```

### 及时清理

```typescript
// 组件卸载或不再需要时
editor.dispose()
```

## 故障排查

### 编辑器不显示

1. 确保容器元素有明确的高度
2. 检查 Monaco Editor 是否正确安装
3. 查看浏览器控制台是否有错误信息

### 类型检查错误

确保安装了 `@types/node`:

```bash
npm install -D @types/node
```

### Workers 警告

在 Vite 项目中，Monaco Editor 的 workers 可能会有警告。这通常不影响功能，但如果需要消除警告，可以配置 Vite 的 `optimizeDeps`。

## 下一步

- 查看完整的 [API 文档](./README.md#api)
- 探索 [示例项目](./examples)
- 了解 [高级用法](./README.md#高级用法)

## 获取帮助

如果遇到问题，可以：

1. 查看 [README](./README.md) 中的常见问题
2. 查看示例项目的完整代码
3. 提交 Issue 到项目仓库
