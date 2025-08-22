# 🚀 快速开始

欢迎来到 **@ldesign/pdf** 的世界！在这里，PDF预览不再是痛苦的体验，而是一场视觉盛宴。让我们一步步搭建你的第一个PDF预览应用吧！ 🎉

## 📦 安装

首先，我们需要把这个强大的工具装进你的项目里：

::: code-group

```bash [npm]
npm install @ldesign/pdf pdfjs-dist
```

```bash [yarn]
yarn add @ldesign/pdf pdfjs-dist
```

```bash [pnpm]
pnpm add @ldesign/pdf pdfjs-dist
```

:::

::: tip 为什么需要 pdfjs-dist？
`pdfjs-dist` 是Mozilla开发的PDF.js库，我们的引擎基于它构建。就像超级英雄需要超能力一样，我们需要它来解析PDF文件！ 🦸‍♂️
:::

## 🎯 基础用法

让我们从最简单的例子开始：

```typescript
import { createPdfEngine } from '@ldesign/pdf'
import * as pdfjs from 'pdfjs-dist'

// 1. 创建PDF引擎实例
const engine = createPdfEngine({
  enablePerformanceMonitoring: true, // 开启性能监控 📊
  debug: process.env.NODE_ENV === 'development', // 开发环境开启调试
})

// 2. 初始化引擎
await engine.initialize(pdfjs)

// 3. 加载PDF文档
const document = await engine.loadDocument('/path/to/your/awesome.pdf')

// 4. 获取第一页
const page = await document.getPage(1)

// 5. 创建Canvas并渲染
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')!

// 6. 设置视口和渲染
const viewport = page.getViewport({ scale: 1.0 })
canvas.width = viewport.width
canvas.height = viewport.height

await page.render({
  canvasContext: context,
  viewport
})

// 7. 将Canvas添加到页面
document.body.appendChild(canvas)
```

恭喜！🎊 你已经成功渲染了第一个PDF页面！

## 🔥 进阶用法

当然，我们的库不止于此。让我们看看一些更酷的功能：

### 📄 多页面渲染

```typescript
// 渲染所有页面
for (let i = 1; i <= document.numPages; i++) {
  const page = await document.getPage(i)
  const canvas = createCanvasForPage(i)
  
  await page.render({
    canvasContext: canvas.getContext('2d')!,
    viewport: page.getViewport({ scale: 1.5 })
  })
}
```

### 🔍 缩放和旋转

```typescript
// 放大150%并旋转90度
const viewport = page.getViewport({ 
  scale: 1.5, 
  rotation: 90 
})

await page.render({
  canvasContext: context,
  viewport,
  background: '#f0f0f0' // 自定义背景色
})
```

### 📝 提取文本内容

```typescript
const textContent = await page.getTextContent()
const pageText = textContent.items
  .map(item => item.str)
  .join(' ')

console.log('页面文本：', pageText)
```

### 📌 获取注释

```typescript
const annotations = await page.getAnnotations()
annotations.forEach(annotation => {
  console.log('注释类型：', annotation.subtype)
  console.log('注释内容：', annotation.contents)
})
```

## 🎭 框架集成

### Vue 3 中使用

```vue
<template>
  <div>
    <canvas ref="pdfCanvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { createPdfEngine } from '@ldesign/pdf'
import * as pdfjs from 'pdfjs-dist'

const pdfCanvas = ref<HTMLCanvasElement>()

onMounted(async () => {
  if (!pdfCanvas.value) return
  
  const engine = createPdfEngine()
  await engine.initialize(pdfjs)
  
  const document = await engine.loadDocument('/sample.pdf')
  const page = await document.getPage(1)
  
  const context = pdfCanvas.value.getContext('2d')!
  const viewport = page.getViewport({ scale: 1.0 })
  
  pdfCanvas.value.width = viewport.width
  pdfCanvas.value.height = viewport.height
  
  await page.render({
    canvasContext: context,
    viewport
  })
})
</script>
```

### React 中使用

```tsx
import React, { useRef, useEffect } from 'react'
import { createPdfEngine } from '@ldesign/pdf'
import * as pdfjs from 'pdfjs-dist'

const PdfViewer: React.FC<{ pdfUrl: string }> = ({ pdfUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const renderPdf = async () => {
      if (!canvasRef.current) return
      
      const engine = createPdfEngine()
      await engine.initialize(pdfjs)
      
      const document = await engine.loadDocument(pdfUrl)
      const page = await document.getPage(1)
      
      const context = canvasRef.current.getContext('2d')!
      const viewport = page.getViewport({ scale: 1.0 })
      
      canvasRef.current.width = viewport.width
      canvasRef.current.height = viewport.height
      
      await page.render({
        canvasContext: context,
        viewport
      })
    }
    
    renderPdf().catch(console.error)
  }, [pdfUrl])
  
  return <canvas ref={canvasRef} />
}
```

## 🛠️ 配置选项

我们提供了丰富的配置选项来满足你的需求：

```typescript
const engine = createPdfEngine({
  // 性能相关
  enablePerformanceMonitoring: true, // 性能监控
  maxConcurrentDocuments: 5,         // 最大并发文档数
  pageCacheSize: 50,                 // 页面缓存大小
  
  // 调试相关
  debug: true,                       // 调试模式
  
  // Worker相关
  workerSrc: '/pdf.worker.js',       // Worker脚本路径
  
  // 错误处理
  maxRetries: 3,                     // 最大重试次数
  timeout: 30000,                    // 超时时间（毫秒）
})
```

## 🎊 恭喜！

你已经掌握了 **@ldesign/pdf** 的基础用法！现在你可以：

- ✅ 渲染PDF页面
- ✅ 提取文本内容  
- ✅ 获取页面注释
- ✅ 在Vue/React中集成
- ✅ 自定义配置选项

## 🔥 接下来做什么？

- 📖 查看 [API 文档](/api/) 了解更多功能
- 💡 浏览 [示例页面](/examples/) 获取更多灵感
- 🏗️ 阅读 [高级指南](/guide/advanced) 掌握进阶技巧
- 🤝 加入我们的 [社区讨论](https://github.com/ldesign-team/ldesign/discussions)

现在就开始构建你的PDF预览应用吧！记住，如果遇到任何问题，我们的社区随时准备帮助你。💪

---

::: tip 💡 小贴士
记得在生产环境中关闭调试模式，这样可以获得更好的性能！
:::

::: warning ⚠️ 注意
确保你的PDF文件可以被浏览器访问，跨域问题可能会导致加载失败。
:::