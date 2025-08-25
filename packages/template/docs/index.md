# @ldesign/template

> 🎨 强大的模板管理系统 - 让你的应用界面千变万化！

## 🚀 特性

- 📱 **多设备适配** - 自动检测设备类型，提供最佳用户体验
- 🔄 **动态切换** - 运行时无缝切换模板，无需重启应用
- 💾 **智能缓存** - 高效的缓存机制，提升加载性能
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🔧 **易于集成** - 简单的 API，快速集成到现有项目
- 🎭 **Vue 友好** - 专为 Vue 3 优化的组合式 API

## 🎪 快速体验

想象一下，你的应用可以像变魔术一样瞬间改变外观！

```typescript
import { TemplateManager } from '@ldesign/template'

// 创建模板管理器
const manager = new TemplateManager()

// 扫描可用模板
await manager.scanTemplates()

// 渲染登录页面 - 桌面端经典风格
const loginTemplate = await manager.render({
  category: 'login',
  device: 'desktop',
  template: 'classic'
})

// 一键切换到现代风格！
await manager.switchTemplate('login', 'desktop', 'modern')
```

## 🎨 Vue 集成示例

在 Vue 应用中使用更加简单：

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'

const { currentTemplate, switchTemplate } = useTemplate()

function switchToModern() {
  switchTemplate('login', 'desktop', 'modern')
}
</script>

<template>
  <div>
    <button @click="switchToModern">
      切换到现代风格
    </button>
    <component :is="currentTemplate?.component" />
  </div>
</template>
```

## 📱 设备自适应

模板系统会自动检测用户设备，提供最佳体验：

- 🖥️ **桌面端** - 大屏幕优化，丰富的交互元素
- 📱 **移动端** - 触摸友好，简洁高效
- 📟 **平板端** - 平衡体验，适中的信息密度

## 🎭 模板类型

支持多种应用场景的模板：

- 🔐 **登录模板** - 经典、现代、极简等多种风格
- 📊 **仪表板模板** - 管理员、分析师、用户等不同角色
- 📄 **内容模板** - 文章、产品、新闻等展示页面
- 🛒 **电商模板** - 商品列表、详情页、购物车等

## 🚀 开始使用

```bash
# 安装
pnpm add @ldesign/template

# Vue 项目还需要安装 Vue 集成包
pnpm add @ldesign/template-vue
```

立即查看 [快速开始指南](/guide/getting-started) 开始你的模板之旅！

## 🎪 在线演示

想看看实际效果？访问我们的 [在线演示](https://template.ldesign.dev) 体验模板切换的魅力！

## 🤝 贡献

我们欢迎所有形式的贡献！无论是：

- 🐛 报告 Bug
- 💡 提出新功能
- 📝 改进文档
- 🎨 贡献模板

都可以通过 [GitHub](https://github.com/ldesign/template) 参与进来。

## 📄 许可证

MIT © [LDesign](https://github.com/ldesign)
