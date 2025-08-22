---
layout: home

hero:
  name: 'LDesign Festival Demo'
  text: '节日主题挂件系统'
  tagline: '为你的应用添加生动有趣的节日装饰效果'
  image:
    src: /logo.svg
    alt: LDesign Festival Demo
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 在线演示
      link: https://ldesign.github.io/festival-demo
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🎨
    title: 智能主题系统
    details: 根据当前日期自动推荐合适的节日主题，支持无缝切换和主题持久化
  - icon: 🎭
    title: 动态挂件系统
    details: 基于 SVG 的高质量矢量装饰，支持智能联动和灵活控制
  - icon: 📱
    title: 现代化体验
    details: 完全响应式设计，GPU 加速动画，60fps 流畅体验
  - icon: 🛠️
    title: 开发者友好
    details: TypeScript 全覆盖，组件化设计，完整测试覆盖
  - icon: ⚡
    title: 高性能
    details: 首屏加载 < 1.5s，主题切换 < 300ms，包体积 < 200KB
  - icon: 🎯
    title: 易于集成
    details: 简单的 API 设计，支持 Vue、React 等主流框架
---

## 🎉 什么是 Festival Demo？

Festival Demo 是 LDesign Theme 包的一个完整演示项目，展示了如何使用节日主题挂件系统为你的应用添加生
动有趣的节日装饰效果。

### 核心特性

- **🧧 春节主题** - 红灯笼、福字、烟花等传统中国元素
- **🎄 圣诞主题** - 圣诞树、雪花、礼物盒等西方节日元素
- **⚪ 默认主题** - 简洁优雅的日常使用主题
- **🔄 智能切换** - 根据日期自动推荐合适的主题
- **🎮 交互控制** - 实时控制挂件的显示和样式

## 🚀 快速体验

```bash
# 安装依赖
pnpm install

# 启动演示
pnpm dev

# 在浏览器中打开 http://localhost:5173
```

## 📖 使用示例

### 基础用法

```typescript
import { initializeWidgetSystem, switchTheme } from '@ldesign/theme'

// 初始化挂件系统
initializeWidgetSystem({
  theme: 'default',
  autoApply: true,
})

// 切换到春节主题
await switchTheme('spring-festival')
```

### 为元素添加挂件

```typescript
import { applyWidget } from '@ldesign/theme'

// 为按钮添加挂件
const button = document.querySelector('.my-button')
applyWidget(button, 'button')
```

### 创建主题切换器

```typescript
import { createThemeSwitcher } from '@ldesign/theme'

const themeSwitcher = createThemeSwitcher({
  autoSwitch: true,
  enableTransitions: true,
  onThemeChange: event => {
    console.log('主题已切换:', event.theme)
  },
})
```

## 🎨 主题预览

<div class="theme-preview">
  <div class="theme-card spring-festival">
    <h3>🧧 春节主题</h3>
    <p>传统中国新年元素，红金配色</p>
  </div>
  
  <div class="theme-card christmas">
    <h3>🎄 圣诞主题</h3>
    <p>温馨西方节日氛围，绿红金配色</p>
  </div>
  
  <div class="theme-card default">
    <h3>⚪ 默认主题</h3>
    <p>简洁优雅的日常主题</p>
  </div>
</div>

## 🛠️ 技术栈

- **Vue 3.4+** - 现代化的前端框架
- **TypeScript 5.3+** - 类型安全的开发体验
- **Vite 5.0+** - 快速的构建工具
- **@ldesign/theme** - 主题挂件系统
- **@ldesign/color** - 颜色管理系统

## 📊 性能指标

| 指标     | 数值              |
| -------- | ----------------- |
| 首屏加载 | < 1.5s            |
| 主题切换 | < 300ms           |
| 挂件渲染 | < 100ms           |
| 内存占用 | < 50MB            |
| 包体积   | < 200KB (gzipped) |

## 🤝 参与贡献

我们欢迎所有形式的贡献！无论是报告 bug、提出功能建议，还是提交代码改进。

- 🐛 [报告问题](https://github.com/ldesign/ldesign/issues)
- 💡 [功能建议](https://github.com/ldesign/ldesign/discussions)
- 🔧 [提交 PR](https://github.com/ldesign/ldesign/pulls)

## 📄 许可证

本项目基于 [MIT 许可证](https://github.com/ldesign/ldesign/blob/main/LICENSE) 开源。

<style>
.theme-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
}

.theme-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  transition: all 0.3s ease;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.theme-card.spring-festival {
  background: linear-gradient(135deg, #fef2f2 0%, #fff7ed 100%);
  border-color: #dc2626;
}

.theme-card.christmas {
  background: linear-gradient(135deg, #f0fdf4 0%, #fef2f2 100%);
  border-color: #16a34a;
}

.theme-card.default {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #1890ff;
}

.theme-card h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.theme-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
</style>
