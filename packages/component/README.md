# LDesign 组件库

🎨 一个现代化、高性能的 Web Components 组件库，基于 Stencil 构建，支持所有主流前端框架。

## ✨ 特性

- 🚀 **高性能**: 基于 Stencil 编译器，生成优化的原生 Web Components
- 🎯 **框架无关**: 支持 React、Vue、Angular 等所有主流框架
- 💪 **TypeScript**: 完整的 TypeScript 支持，提供优秀的开发体验
- 🎨 **主题定制**: 支持 CSS 变量，轻松定制主题
- 📱 **响应式**: 移动端友好，支持各种屏幕尺寸
- ♿ **无障碍**: 遵循 WCAG 2.1 标准，支持键盘导航和屏幕阅读器
- 🌙 **暗色模式**: 内置暗色主题支持
- 📦 **按需加载**: 支持 Tree Shaking，只打包使用的组件

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/components

# 使用 yarn
yarn add @ldesign/components

# 使用 pnpm
pnpm add @ldesign/components
```

## 🚀 快速开始

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/components/dist/ldesign/ldesign.esm.js"></script>
</head>
<body>
  <ld-button type="primary">Hello LDesign!</ld-button>
</body>
</html>
```

### 在 React 中使用

```tsx
import React from 'react';
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

function App() {
  return (
    <div>
      <ld-button type="primary" onClick={() => console.log('clicked')}>
        点击我
      </ld-button>
    </div>
  );
}

export default App;
```

### 在 Vue 中使用

```vue
<template>
  <div>
    <ld-button type="primary" @ldClick="handleClick">
      点击我
    </ld-button>
  </div>
</template>

<script>
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

export default {
  methods: {
    handleClick() {
      console.log('clicked');
    }
  }
}
</script>
```

### 在 Angular 中使用

```typescript
// app.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { defineCustomElements } from '@ldesign/components/loader';

// 注册组件
defineCustomElements();

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule { }
```

```html
<!-- app.component.html -->
<ld-button type="primary" (ldClick)="handleClick()">
  点击我
</ld-button>
```

## 🧩 组件列表

### 基础组件

- **Button** - 按钮组件，支持多种类型和尺寸
- **Input** - 输入框组件，支持各种输入类型
- **Card** - 卡片容器组件

### 高级组件

- **Modal** - 模态框组件，支持自定义内容和动画
- **Table** - 表格组件，支持排序、筛选、分页等功能
- **Form** - 表单组件，支持验证和多种布局
- **FormItem** - 表单项组件，配合 Form 使用

### 工具组件

- **Tooltip** - 提示框组件，支持多种触发方式和位置

## 🎨 主题定制

LDesign 使用 CSS 变量来支持主题定制，你可以通过覆盖这些变量来自定义主题：

```css
:root {
  /* 主色调 */
  --ld-color-primary: #1976d2;
  --ld-color-primary-hover: #1565c0;
  --ld-color-primary-active: #0d47a1;
  
  /* 字体 */
  --ld-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --ld-font-size-base: 14px;
  
  /* 间距 */
  --ld-spacing-xs: 4px;
  --ld-spacing-sm: 8px;
  --ld-spacing-base: 16px;
  --ld-spacing-lg: 24px;
  
  /* 圆角 */
  --ld-border-radius-base: 6px;
  --ld-border-radius-sm: 4px;
  --ld-border-radius-lg: 8px;
}
```

### 暗色主题

```css
[data-theme="dark"] {
  --ld-color-bg-primary: #1f1f1f;
  --ld-color-text-primary: rgba(255, 255, 255, 0.85);
  --ld-color-border-primary: #303030;
}
```

## 📖 文档

详细的组件文档和示例请访问：[LDesign 文档站点](https://ldesign.dev)

## 🤝 贡献

我们欢迎所有形式的贡献！请阅读 [贡献指南](./CONTRIBUTING.md) 了解如何参与项目开发。

### 开发环境设置

```bash
# 克隆项目
git clone https://github.com/your-org/ldesign.git
cd ldesign

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run start

# 运行测试
pnpm run test

# 构建项目
pnpm run build
```

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

感谢所有为 LDesign 做出贡献的开发者们！

---

如果你觉得 LDesign 对你有帮助，请给我们一个 ⭐️ 支持！
