# LDesign Editor - Vite + TypeScript 演示项目

🚀 这是一个使用 Vite + TypeScript 构建的 LDesign Editor 富文本编辑器演示项目。

## ✨ 特点

- **零配置**: 无需指定插件，所有功能默认内置
- **开箱即用**: 只需三行代码即可创建功能完整的编辑器
- **完整功能**: 包含文本格式化、表格、媒体、代码块等所有功能

## 📦 项目特性

- ⚡️ **Vite** - 快速的开发服务器和构建工具
- 🔷 **TypeScript** - 类型安全的开发体验
- 🎨 **完整功能** - 展示编辑器的所有核心功能
- 📝 **源码导入** - 直接从 `src` 目录导入编辑器类
- 🎯 **路径别名** - 使用 `@/` 别名简化导入路径

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或者
pnpm install
# 或者
yarn install
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动，并自动在浏览器中打开。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
vite-demo/
├── src/
│   ├── main.ts          # 主入口文件，初始化编辑器
│   └── style.css        # 样式文件
├── index.html           # HTML 入口
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── tsconfig.node.json   # Node 环境的 TypeScript 配置
├── vite.config.ts       # Vite 配置
└── README.md           # 项目说明
```

## 🎯 功能展示

### 编辑器初始化

```typescript
import { Editor } from '@/core/Editor'
import { Toolbar } from '@/ui/Toolbar'

const editor = new Editor({
  element: '#editor',
  content: '<h1>Hello World!</h1>',
  plugins: [
    BoldPlugin,
    ItalicPlugin,
    // ... 更多插件
  ],
  autofocus: true,
  placeholder: '开始输入内容...',
})
```

### 工具栏配置

```typescript
const toolbar = new Toolbar({
  element: '#toolbar',
  editor: editor,
  items: [
    { type: 'button', command: 'bold', icon: 'bold', tooltip: '加粗' },
    { type: 'separator' },
    { type: 'dropdown', label: '标题', items: [...] },
    // ... 更多工具
  ],
})
```

### 事件监听

```typescript
editor.on('update', () => {
  console.log('内容已更新')
})

editor.on('selectionUpdate', () => {
  console.log('选区已更新')
})
```

## 🔧 配置说明

### Vite 配置

`vite.config.ts` 配置了路径别名和开发服务器：

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```

### TypeScript 配置

`tsconfig.json` 配置了编译选项和路径映射：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "paths": {
      "@/*": ["../../src/*"]
    }
  }
}
```

## 📝 支持的插件

该演示项目包含以下插件：

### 文本标记
- ✅ **Bold** - 加粗
- ✅ **Italic** - 斜体
- ✅ **Underline** - 下划线
- ✅ **Strikethrough** - 删除线
- ✅ **Code** - 行内代码
- ✅ **Highlight** - 高亮

### 块级元素
- ✅ **Heading** - 标题（H1-H6）
- ✅ **Paragraph** - 段落
- ✅ **Blockquote** - 引用
- ✅ **CodeBlock** - 代码块
- ✅ **List** - 列表（有序/无序）
- ✅ **HorizontalRule** - 分隔线

### 节点元素
- ✅ **Link** - 超链接
- ✅ **Image** - 图片
- ✅ **Table** - 表格

### 功能插件
- ✅ **History** - 撤销/重做
- ✅ **FindReplace** - 查找替换

## ⌨️ 快捷键

- `Ctrl+B` / `Cmd+B` - 加粗
- `Ctrl+I` / `Cmd+I` - 斜体
- `Ctrl+U` / `Cmd+U` - 下划线
- `Ctrl+Z` / `Cmd+Z` - 撤销
- `Ctrl+Y` / `Cmd+Y` - 重做
- `Ctrl+F` / `Cmd+F` - 查找替换

## 🐛 调试

编辑器实例被暴露到全局对象 `window` 上，方便在浏览器控制台调试：

```javascript
// 访问编辑器实例
window.editor

// 访问工具栏实例
window.toolbar

// 获取编辑器内容
window.editor.getHTML()

// 设置编辑器内容
window.editor.setHTML('<h1>新内容</h1>')

// 执行命令
window.editor.commands.bold()
```

## 📚 更多资源

- [LDesign Editor 文档](../../README.md)
- [插件开发指南](../../docs/plugins.md)
- [API 参考](../../docs/api.md)

## 📄 许可证

本项目遵循 MIT 许可证。

---

**提示**: 这是一个演示项目，用于展示如何在 Vite + TypeScript 环境中使用 LDesign Editor。你可以将此项目作为模板，快速开始自己的项目开发。
