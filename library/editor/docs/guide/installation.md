# 安装

## 包管理器

我们推荐使用包管理器安装 @ldesign/editor。

::: code-group

```bash [npm]
npm install @ldesign/editor lucide
```

```bash [yarn]
yarn add @ldesign/editor lucide
```

```bash [pnpm]
pnpm add @ldesign/editor lucide
```

:::

## CDN

如果你不想使用构建工具，也可以通过 CDN 引入：

```html
<!-- 引入样式 -->
<link rel="stylesheet" href="https://unpkg.com/@ldesign/editor/dist/style.css">

<!-- 引入脚本 -->
<script src="https://unpkg.com/@ldesign/editor/dist/index.js"></script>
<script src="https://unpkg.com/lucide/dist/umd/lucide.js"></script>

<script>
  // 使用全局变量
  const { Editor } = LDesignEditor

  const editor = new Editor({
    element: '#editor',
    content: '<p>Hello World!</p>'
  })
</script>
```

## 环境要求

### Node.js 版本

- Node.js >= 16.0.0

### 浏览器支持

@ldesign/editor 支持所有现代浏览器：

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

::: warning
不支持 IE 浏览器。
:::

## 框架版本要求

如果你使用框架适配器，需要满足以下版本要求：

### Vue

```json
{
  "vue": "^3.0.0"
}
```

### React

```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

## TypeScript 支持

@ldesign/editor 使用 TypeScript 编写，提供了完整的类型定义。

如果你使用 TypeScript，需要确保 `tsconfig.json` 中包含以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

## 引入样式

@ldesign/editor 需要引入样式文件才能正常显示：

```typescript
import '@ldesign/editor/style.css'
```

如果你使用了自定义主题，可以覆盖默认样式：

```css
/* 自定义主题 */
.ldesign-editor {
  --editor-border-color: #e5e7eb;
  --editor-bg-color: #fff;
  --editor-text-color: #1f2937;
  --editor-toolbar-bg: #f9fafb;
}
```

## 开发模式

如果你想本地开发 @ldesign/editor：

```bash
# 克隆仓库
git clone https://github.com/ldesign/editor.git

# 进入目录
cd editor

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

## 验证安装

创建一个简单的示例来验证安装是否成功：

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/style.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>如果你能看到这段文字，说明安装成功！</p>'
})

console.log('编辑器版本:', editor.constructor.name)
```

## 故障排除

### 样式不生效

确保你已经引入了样式文件：

```typescript
import '@ldesign/editor/style.css'
```

### TypeScript 类型错误

确保你的 `tsconfig.json` 配置正确，并且安装了最新版本的 @ldesign/editor。

### 图标不显示

编辑器已内置所有图标，无需额外安装。如果图标不显示，请检查样式文件是否正确引入。

## 下一步

- [快速开始](/guide/getting-started) - 开始使用编辑器
- [配置](/guide/configuration) - 了解配置选项
