# 示例项目

这里包含了@ldesign/pdf的多个示例项目，演示了不同的使用方式。

## 📁 项目列表

### Vue 3 示例 (vue3-demo)

完整的Vue 3示例应用，展示了所有功能。

**运行方式：**
```bash
cd vue3-demo
pnpm install
pnpm dev
```

**包含示例：**
- 基础示例 - 最简单的使用方式
- 高级功能 - 展示搜索、缩放等高级功能
- Composable示例 - 使用usePDFViewer
- 自定义工具栏 - 完全自定义的UI

### 原生 JS 示例 (vanilla-demo)

纯JavaScript示例，不依赖任何框架。

**运行方式：**
```bash
cd vanilla-demo
pnpm install
pnpm dev
```

**包含示例：**
- 基础示例 - 核心API使用
- 高级功能 - 搜索和设置
- 事件系统 - 事件监听和处理
- 插件系统 - 自定义插件

## 🚀 快速开始

### 从根目录运行

```bash
# 运行Vue3示例
pnpm dev:vue3

# 运行原生JS示例
pnpm dev:vanilla
```

### 从示例目录运行

```bash
# 进入示例目录
cd examples/vue3-demo

# 安装依赖（首次）
pnpm install

# 启动开发服务器
pnpm dev
```

## 📦 构建示例

```bash
# 从根目录构建所有示例
pnpm build:all

# 或单独构建
cd examples/vue3-demo
pnpm build
```

## 📖 学习资源

- [快速开始](../QUICKSTART.md)
- [完整文档](../docs/)
- [API参考](../docs/api/)

## 💡 提示

### 上传本地PDF

所有示例都支持上传本地PDF文件：

1. 点击"上传PDF"按钮
2. 选择本地PDF文件
3. 文件将自动加载到查看器中

### Worker配置

所有示例都使用CDN的worker文件：

```javascript
workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
```

如果需要使用本地worker，可以：

1. 从`node_modules/pdfjs-dist/build/`复制`pdf.worker.min.js`到`public`目录
2. 修改`workerSrc`为`'/pdf.worker.min.js'`

## 🔧 故障排除

### Worker加载失败

**错误**: "Setting up fake worker failed"

**解决方案**: 检查workerSrc路径是否正确

### PDF加载失败

**错误**: CORS或网络错误

**解决方案**:
- 使用支持CORS的PDF URL
- 或上传本地PDF文件

### 依赖安装失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📝 示例代码

### 最简单的用法 (Vue)

```vue
<template>
  <PDFViewer :source="pdfUrl" :workerSrc="workerSrc" />
</template>

<script setup>
import { PDFViewerComponent as PDFViewer } from '@ldesign/pdf/vue';

const pdfUrl = 'https://example.com/sample.pdf';
const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
</script>
```

### 最简单的用法 (原生JS)

```javascript
import { PDFViewer } from '@ldesign/pdf';

const viewer = new PDFViewer({
  container: '#pdf-container',
  workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js',
});

viewer.load('https://example.com/sample.pdf');
```

## 🤝 贡献

欢迎提交新的示例！请查看[贡献指南](../CONTRIBUTING.md)。

## 📄 许可证

MIT License
