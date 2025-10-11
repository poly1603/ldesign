# 安装

## 包管理器安装

使用你喜欢的包管理器安装 @ldesign/pdf-viewer：

::: code-group
```bash [pnpm]
pnpm add @ldesign/pdf-viewer
```

```bash [npm]
npm install @ldesign/pdf-viewer
```

```bash [yarn]
yarn add @ldesign/pdf-viewer
```
:::

## Worker文件

PDF.js 需要一个 worker 文件来处理PDF文档。你需要将 worker 文件复制到你的公共目录。

### 自动复制（推荐）

在项目根目录创建一个脚本文件 `scripts/copy-worker.js`：

```javascript
import { copyFileSync } from 'fs'
import { resolve } from 'path'

const workerSrc = resolve('node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const workerDest = resolve('public/pdf.worker.min.mjs')

copyFileSync(workerSrc, workerDest)
console.log('✓ Worker file copied')
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "postinstall": "node scripts/copy-worker.js"
  }
}
```

### 手动复制

从 `node_modules/pdfjs-dist/build/pdf.worker.min.mjs` 复制文件到你的公共目录（通常是 `public/`）。

## CDN

你也可以通过CDN直接使用（不推荐用于生产环境）：

```html
<script type="module">
  import { PDFViewer } from 'https://cdn.jsdelivr.net/npm/@ldesign/pdf-viewer/+esm'
</script>
```

## TypeScript支持

库自带TypeScript类型定义，无需额外安装。

```typescript
import { PDFViewer, type PDFViewerConfig } from '@ldesign/pdf-viewer'
```

## 浏览器兼容性

确保你的目标浏览器支持以下特性：

- ES2020+
- ES Modules
- Canvas API
- Promises
- Async/Await

### 最低版本要求

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 下一步

继续阅读 [快速开始](./quick-start) 了解如何使用库。
