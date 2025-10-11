# @ldesign/code-editor

> 基于 Monaco Editor 的高性能、框架无关的代码编辑器组件

## ✨ 新功能

- 🚀 **友好的 Loading 提示** - 解决首次加载慢的问题，显示加载进度
- ⚡ **性能优化** - 自动配置 Monaco Editor Workers，显著提升加载速度
- 🎨 **Vue 代码高亮** - 完整支持 Vue 单文件组件语法
- ⚛️ **TSX/JSX 支持** - React 开发友好，自动配置 TypeScript
- ✨ **Emmet 代码补全** - HTML/CSS 快速编写，支持常用缩写
- 🔌 **插件系统** - 动态加载功能模块，按需使用
- 📦 **代码片段** - 内置常用代码片段补全

查看详细更新：[PERFORMANCE.md](./PERFORMANCE.md)

## 特性

- 🚀 **高性能**: 基于 Monaco Editor，提供流畅的编辑体验
- 🎨 **框架无关**: 核心库可在任意框架中使用
- 🔧 **配置丰富**: 提供丰富的配置选项和 API
- 💡 **TypeScript 支持**: 完整的类型定义
- 🎯 **易于使用**: 简洁的 API 设计，开箱即用
- 📦 **体积优化**: 支持按需加载，减小打包体积
- 🌈 **主题支持**: 内置多种主题，支持自定义
- 🔌 **多框架适配**: 提供 Vue 3 适配器，后续支持更多框架

## 安装

```bash
# 使用 npm
npm install @ldesign/code-editor monaco-editor

# 使用 yarn
yarn add @ldesign/code-editor monaco-editor

# 使用 pnpm
pnpm add @ldesign/code-editor monaco-editor
```

## 快速开始

### Vanilla JavaScript / TypeScript

#### 基础编辑器

```typescript
import { createCodeEditor } from '@ldesign/code-editor'

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

#### 增强型编辑器（推荐）

```typescript
import { createEnhancedCodeEditor } from '@ldesign/code-editor'

const editor = createEnhancedCodeEditor('#editor', {
  value: 'console.log("Hello World!")',
  language: 'javascript',
  theme: 'vs-dark',

  // 显示友好的 Loading 动画
  showLoading: true,
  loadingText: '正在初始化编辑器...',

  // 启用插件
  plugins: {
    emmet: true,       // Emmet 补全
    snippets: true,    // 代码片段
  },

  // 监听加载状态
  onLoadingChange: (state) => {
    console.log(`${state.progress}%: ${state.message}`)
  },

  on: {
    change: (value) => {
      console.log('Code changed:', value)
    }
  }
})
```

### Vue 3

#### 组件方式

```vue
<template>
  <CodeEditor
    v-model="code"
    language="javascript"
    theme="vs-dark"
    height="400px"
    @change="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@ldesign/code-editor/vue'

const code = ref('console.log("Hello World!")')

const handleChange = (value: string) => {
  console.log('Code changed:', value)
}
</script>
```

#### Composable 方式

```vue
<template>
  <div ref="editorRef"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCodeEditor } from '@ldesign/code-editor/vue'

const editorRef = ref<HTMLElement>()

const { value, isReady, editorInstance } = useCodeEditor(editorRef, {
  value: 'console.log("Hello World!")',
  language: 'javascript',
  theme: 'vs-dark'
})
</script>
```

## 配置选项

### CodeEditorOptions

| 选项 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | `''` | 编辑器初始值 |
| `language` | `EditorLanguage` | `'javascript'` | 编辑器语言 |
| `theme` | `EditorTheme` | `'vs-dark'` | 编辑器主题 |
| `readOnly` | `boolean` | `false` | 是否只读 |
| `autoComplete` | `boolean` | `true` | 是否启用自动补全 |
| `folding` | `boolean` | `true` | 是否启用代码折叠 |
| `lineNumbers` | `'on' \| 'off' \| 'relative' \| 'interval'` | `'on'` | 行号显示方式 |
| `minimap` | `boolean` | `true` | 是否显示 minimap |
| `fontSize` | `number` | `14` | 字体大小 |
| `tabSize` | `number` | `2` | Tab 大小 |
| `insertSpaces` | `boolean` | `true` | 是否使用空格代替 Tab |
| `wordWrap` | `'on' \| 'off' \| 'wordWrapColumn' \| 'bounded'` | `'off'` | 是否自动换行 |
| `scrollbar` | `object` | `{}` | 滚动条配置 |
| `monacoOptions` | `object` | `{}` | Monaco Editor 原生选项 |

### 支持的语言

- JavaScript / TypeScript
- **Vue (SFC)** ⭐ 新增
- **JSX / TSX** ⭐ 新增
- HTML / CSS / SCSS / LESS
- JSON / YAML / XML
- Python / Java / Go / Rust
- C++ / C# / PHP / Ruby
- Swift / Kotlin / Dart
- Markdown / SQL / Shell / Dockerfile
- 更多...

### 支持的主题

- `vs` - Light Theme
- `vs-dark` - Dark Theme (默认)
- `hc-black` - High Contrast Black
- `hc-light` - High Contrast Light

## API

### 核心方法

```typescript
// 获取编辑器值
editor.getValue(): string

// 设置编辑器值
editor.setValue(value: string): void

// 获取选中的文本
editor.getSelection(): string

// 插入文本
editor.insertText(text: string, position?: IPosition): void

// 格式化代码
editor.format(): Promise<void>

// 设置语言
editor.setLanguage(language: EditorLanguage): void

// 设置主题
editor.setTheme(theme: EditorTheme): void

// 设置只读
editor.setReadOnly(readOnly: boolean): void

// 聚焦编辑器
editor.focus(): void

// 获取/设置光标位置
editor.getPosition(): Position | null
editor.setPosition(position: IPosition): void

// 撤销/重做
editor.undo(): void
editor.redo(): void

// 更新选项
editor.updateOptions(options: CodeEditorOptions): void

// 获取 Monaco 编辑器实例
editor.getEditor(): monaco.editor.IStandaloneCodeEditor

// 销毁编辑器
editor.dispose(): void
```

### 事件

```typescript
const editor = createCodeEditor('#editor', {
  on: {
    // 内容改变
    change: (value, event) => {},

    // 光标位置改变
    cursorChange: (position) => {},

    // 编辑器聚焦
    focus: () => {},

    // 编辑器失焦
    blur: () => {},

    // 编辑器就绪
    ready: (editor) => {},

    // 编辑器销毁
    dispose: () => {}
  }
})
```

## Vue 3 组件 Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | v-model 绑定值 |
| `language` | `EditorLanguage` | `'javascript'` | 编辑器语言 |
| `theme` | `EditorTheme` | `'vs-dark'` | 编辑器主题 |
| `readOnly` | `boolean` | `false` | 是否只读 |
| `autoComplete` | `boolean` | `true` | 是否启用自动补全 |
| `folding` | `boolean` | `true` | 是否启用代码折叠 |
| `lineNumbers` | `string` | `'on'` | 行号显示方式 |
| `minimap` | `boolean` | `true` | 是否显示 minimap |
| `fontSize` | `number` | `14` | 字体大小 |
| `tabSize` | `number` | `2` | Tab 大小 |
| `insertSpaces` | `boolean` | `true` | 是否使用空格代替 Tab |
| `wordWrap` | `string` | `'off'` | 是否自动换行 |
| `height` | `string \| number` | `'400px'` | 编辑器高度 |
| `width` | `string \| number` | `'100%'` | 编辑器宽度 |
| `customClass` | `string` | `''` | 自定义类名 |
| `customStyle` | `string \| object` | `''` | 自定义样式 |

## Vue 3 组件事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `(value: string)` | v-model 更新 |
| `change` | `(value: string, event)` | 内容改变 |
| `cursorChange` | `(position: Position)` | 光标位置改变 |
| `focus` | `()` | 编辑器聚焦 |
| `blur` | `()` | 编辑器失焦 |
| `ready` | `(editor)` | 编辑器就绪 |

## Vue 3 组件方法

```vue
<template>
  <CodeEditor ref="editorRef" v-model="code" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@ldesign/code-editor/vue'

const editorRef = ref()

// 使用编辑器方法
const handleClick = () => {
  editorRef.value?.format()
  editorRef.value?.focus()
  console.log(editorRef.value?.getValue())
}
</script>
```

## 示例

项目包含两个完整的示例：

### Vanilla JS 示例

```bash
cd examples/vanilla-demo
pnpm install
pnpm dev
```

访问 http://localhost:3000

### Vue 3 示例

```bash
cd examples/vue-demo
pnpm install
pnpm dev
```

访问 http://localhost:3001

## 开发

```bash
# 安装依赖
pnpm install

# 构建库
pnpm build

# 运行 Vanilla JS 示例
pnpm dev:vanilla

# 运行 Vue 3 示例
pnpm dev:vue
```

## 项目结构

```
code-editor/
├── src/                    # 源代码
│   ├── core/              # 核心编辑器实现
│   │   └── CodeEditor.ts  # 编辑器核心类
│   ├── adapters/          # 框架适配器
│   │   └── vue/           # Vue 3 适配器
│   │       ├── CodeEditor.vue      # Vue 组件
│   │       ├── useCodeEditor.ts    # Composable
│   │       └── index.ts            # 导出
│   ├── types/             # 类型定义
│   │   └── index.ts
│   └── index.ts           # 主入口
├── examples/              # 示例项目
│   ├── vanilla-demo/      # Vanilla JS 示例
│   └── vue-demo/          # Vue 3 示例
├── dist/                  # 构建输出
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 高级用法

### 自定义主题

```typescript
import * as monaco from 'monaco-editor'

// 定义自定义主题
monaco.editor.defineTheme('myTheme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' }
  ],
  colors: {
    'editor.background': '#1E1E1E'
  }
})

// 使用自定义主题
const editor = createCodeEditor('#editor', {
  theme: 'myTheme'
})
```

### 配置 Monaco Editor Workers

在 Vite 项目中使用 Monaco Editor 需要配置 workers：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['monaco-editor']
  }
})
```

### 动态加载语言

```typescript
// 动态导入语言支持
import 'monaco-editor/esm/vs/language/typescript/monaco.contribution'
import 'monaco-editor/esm/vs/language/json/monaco.contribution'
import 'monaco-editor/esm/vs/language/html/monaco.contribution'
```

## 性能优化建议

1. **按需加载语言**: 只导入需要的语言支持
2. **延迟初始化**: 在需要时再创建编辑器实例
3. **及时销毁**: 组件卸载时调用 `dispose()` 方法
4. **复用实例**: 避免频繁创建和销毁编辑器实例
5. **合理配置**: 根据需求关闭不必要的功能（如 minimap）

## 常见问题

### Q: 如何设置编辑器高度？

A: 使用 CSS 设置容器高度，或在 Vue 组件中使用 `height` prop。

### Q: 如何禁用特定功能？

A: 使用 `monacoOptions` 传递 Monaco Editor 的原生配置。

### Q: 如何处理大文件？

A: 考虑使用虚拟滚动或分页加载，Monaco Editor 对超大文件的支持有限。

### Q: 如何添加自定义语言支持？

A: 使用 Monaco Editor 的 `monaco.languages.register()` API 注册自定义语言。

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## License

MIT

## 贡献

欢迎提交 Issue 和 Pull Request!

## 相关链接

- [Monaco Editor 官方文档](https://microsoft.github.io/monaco-editor/)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
