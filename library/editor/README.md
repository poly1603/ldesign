# @ldesign/editor

<div align="center">

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)

**功能强大、高度可定制、性能卓越的富文本编辑器**

支持 Vue、React 和原生 JavaScript

[快速开始](#快速开始) · [文档](#文档) · [示例](#示例) · [更新日志](./CHANGELOG.md)

</div>

---

## ✨ 特性

### 🚀 性能卓越
- ⚡ **初始加载时间 < 1秒** - 代码分割和按需加载
- 🎯 **FPS 55-60** - 流畅的编辑体验
- 💾 **内存占用 < 60MB** - 优化的事件系统和缓存
- 📦 **包体积 350KB** - Tree-shaking优化

### 🎨 高度可定制
- 🎨 **3种图标集** - Lucide / Feather / Material
- 🌈 **3种内置主题** - 浅色 / 深色 / 高对比度
- 🌍 **3种语言** - 中文 / 英文 / 日文
- 🔧 **完整配置系统** - 每个功能都可配置

### 🧩 插件系统
- 📦 **按需加载** - 只加载需要的插件
- ⚙️ **插件配置** - 启用/禁用/配置每个插件
- 🔌 **依赖管理** - 自动处理插件依赖
- 🎯 **优先级控制** - 控制加载顺序

### 🤖 AI功能
- 🧠 **多AI提供商** - OpenAI / Claude / DeepSeek
- ✍️ **智能写作** - 纠错 / 续写 / 重写 / 建议
- 🔄 **流式响应** - 实时显示AI生成内容

### 🛠️ 开发友好
- 📝 **TypeScript** - 完整的类型定义
- 📚 **丰富文档** - 详细的API和示例
- 🔍 **性能监控** - 实时性能分析
- 🛡️ **错误边界** - 优雅的错误处理

---

## 📦 安装

```bash
npm install @ldesign/editor
```

---

## 🚀 快速开始

### 最简单的方式

```typescript
import { Editor } from '@ldesign/editor'
import '@ldesign/editor/dist/editor.css'

const editor = new Editor({
  element: '#editor',
  content: '<p>Hello World!</p>'
})
```

### 使用预设配置（推荐）

```typescript
import { Editor, lightweightConfig } from '@ldesign/editor'

// 轻量级配置（性能优先）
const editor = new Editor(lightweightConfig)

// 或功能完整配置（功能优先）
import { fullFeaturedConfig } from '@ldesign/editor'
const editor = new Editor(fullFeaturedConfig)
```

### 完整配置示例

```typescript
import { 
  Editor,
  getConfigManager,
  getPluginRegistry,
  ToolbarManager,
  showSettingsPanel
} from '@ldesign/editor'

// 1. 配置管理
const config = getConfigManager({
  icons: { defaultSet: 'lucide', enableCache: true },
  theme: { defaultTheme: 'light', followSystem: true },
  i18n: { defaultLocale: 'zh-CN' }
})

// 2. 插件配置
const registry = getPluginRegistry()
registry.register('image', imageLoader, {}, {
  enabled: true,
  lazy: true,
  config: { maxSize: 5 * 1024 * 1024 }
})

// 3. 创建编辑器
const editor = new Editor({
  element: '#editor'
})

// 4. 工具栏配置
const toolbar = new ToolbarManager(editor, {
  lazyLoad: true,
  groups: [
    {
      name: 'format',
      items: ['bold', 'italic', 'underline'],
      visible: true
    }
  ]
})

// 5. 添加设置按钮
const settingsBtn = createIconButton('settings', {
  title: '设置',
  onClick: () => showSettingsPanel()
})
```

---

## 📚 文档

### 快速入门
- [快速开始](./docs/guide/quick-start-optimized.md)
- [定制化功能](./README-定制化功能.md)
- [快速参考](./📖-优化功能快速参考.md)

### 详细指南
- [定制化指南](./docs/guide/customization.md)
- [性能优化指南](./docs/guide/performance-optimization.md)
- [API文档](./docs/api/editor.md)

### 示例代码
- [定制化示例](./docs/examples/customization-example.md)
- [10个完整示例](./docs/examples/customization-example.md#示例列表)

---

## 🎮 演示

在浏览器中打开以下文件体验：

- **定制化演示**: `examples/customization-demo.html`
  - 主题切换
  - 图标集切换
  - 语言切换
  - 配置管理

- **性能演示**: `examples/performance-demo.html`
  - 实时性能监控
  - 配置对比
  - 性能优化

---

## 🎯 核心API

### 配置管理
```typescript
const config = getConfigManager()
config.setTheme('dark')
config.setIconSet('material')
await config.setLocale('en-US')
```

### 插件管理
```typescript
const registry = getPluginRegistry()
await registry.load('image')
await registry.disable('ai')
```

### 性能监控
```typescript
const monitor = getPerformanceMonitor()
console.log(monitor.generateReport())
```

### UI组件
```typescript
const btn = createButton({ label: '保存', type: 'primary' })
const input = createInput({ placeholder: '输入...' })
```

### AI功能
```typescript
const ai = getAIService()
ai.setProvider('openai')
const result = await ai.correct('文本')
```

---

## 📊 性能指标

| 指标 | 数值 | 评级 |
|------|------|------|
| 初始加载 | < 800ms | ⭐⭐⭐⭐⭐ |
| FPS | 55-60 | ⭐⭐⭐⭐⭐ |
| 内存使用 | < 60MB | ⭐⭐⭐⭐⭐ |
| 事件响应 | < 50ms | ⭐⭐⭐⭐⭐ |
| 代码复用 | 90%+ | ⭐⭐⭐⭐⭐ |

---

## 🛠️ 开发

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build

# 运行文档
npm run docs:dev
```

### 测试

```bash
# 打开测试页面
open tests/全面功能验证指南.md

# 运行自动化测试
open tests/自动化测试脚本.html
```

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

---

## 📄 许可证

MIT © LDesign

---

## 🔗 相关资源

- [完整优化报告](./✨-全面优化完成报告.md)
- [性能优化总结](./🚀-性能优化完成总结.md)
- [更新日志](./CHANGELOG.md)
- [功能测试清单](./tests/功能测试清单.md)
- [调试指南](./tests/调试指南.md)

---

<div align="center">

**Made with ❤️ by LDesign Team**

[⬆ 回到顶部](#ldesigneditor)

</div>
