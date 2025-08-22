---
layout: home

hero:
  name: "@ldesign/pdf"
  text: "PDF预览新体验"
  tagline: 🎭 让PDF预览变得优雅而高效的TypeScript库
  image:
    src: /logo.svg
    alt: LDesign PDF
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /guide/
    - theme: alt
      text: 👀 查看示例
      link: /examples/
    - theme: alt
      text: 📖 API 文档
      link: /api/

features:
  - icon: ⚡
    title: 高性能渲染
    details: 基于 PDF.js 的优化引擎，支持 WebWorker 和 OffscreenCanvas，让PDF渲染飞起来！
  - icon: 🎯
    title: 类型安全
    details: 100% TypeScript 编写，完整的类型定义，让你的代码更加可靠和智能。
  - icon: 🔄
    title: 智能缓存
    details: LRU 缓存策略，自动内存管理，让你的应用运行更加流畅。
  - icon: 🌐
    title: 跨框架支持
    details: 支持 Vue 3、React 和原生 JavaScript，一个库满足所有需求。
  - icon: 🛠️
    title: 插件化架构
    details: 模块化设计，支持自定义扩展，让你可以根据需求灵活配置。
  - icon: 📱
    title: 响应式设计
    details: 完美适配移动端和桌面端，让PDF预览在任何设备上都表现出色。
---

## 🎉 为什么选择 @ldesign/pdf？

在这个信息爆炸的时代，PDF文档无处不在。但是传统的PDF预览方案要么功能单一，要么性能糟糕，要么难以集成。😢

**@ldesign/pdf** 的诞生就是为了解决这些痛点！我们用现代化的技术栈，打造了一个既强大又易用的PDF预览解决方案。

### 🎯 核心特性

- **🚀 极致性能**：WebWorker + OffscreenCanvas 双重加速
- **🧠 智能缓存**：LRU算法 + 内存管理，告别卡顿
- **🎨 优雅API**：Promise-based 设计，链式调用爽到飞起
- **🔧 类型安全**：TypeScript 全覆盖，IDE 智能提示
- **🌈 框架无关**：Vue、React、原生JS 随你挑选

### 💡 快速体验

```typescript
import { createPdfEngine } from '@ldesign/pdf'

// 创建PDF引擎（就像组装一台超级跑车 🏎️）
const engine = createPdfEngine({
  enablePerformanceMonitoring: true, // 性能监控开起来！
  debug: true, // 调试模式，方便问题定位
})

// 初始化引擎（给跑车加满油 ⛽）
await engine.initialize(pdfjs)

// 加载PDF文档（上路！🛣️）
const document = await engine.loadDocument('path/to/awesome.pdf')

// 获取第一页（看看风景 🏞️）
const page = await document.getPage(1)

// 渲染到Canvas（享受视觉盛宴 🎨）
const canvas = document.getElementById('pdf-canvas')
const context = canvas.getContext('2d')
await page.render({
  canvasContext: context,
  viewport: page.getViewport({ scale: 1.5 })
})
```

### 🎮 实用场景

无论你是在构建：

- 📄 **文档管理系统**：让用户快速预览PDF文档
- 📚 **在线阅读器**：提供流畅的阅读体验  
- 🏢 **企业应用**：集成PDF预览到你的业务系统
- 📱 **移动应用**：在手机上也能完美显示PDF

**@ldesign/pdf** 都能让你事半功倍！

### 🤝 社区驱动

我们相信好的软件是社区共同创造的。欢迎：

- 🐛 [报告问题](https://github.com/ldesign-team/ldesign/issues)
- 💡 [提出建议](https://github.com/ldesign-team/ldesign/discussions)
- 🔧 [贡献代码](https://github.com/ldesign-team/ldesign/pulls)
- ⭐ [点个星星](https://github.com/ldesign-team/ldesign)

让我们一起让PDF预览变得更加美好！ 🌟

---

<div style="text-align: center; margin: 2rem 0;">
  <strong>准备好开始你的PDF预览之旅了吗？</strong><br>
  点击下面的按钮，让我们开始吧！ 🎊
</div>