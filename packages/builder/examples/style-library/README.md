# CSS/Less 样式库示例

这是一个使用 @ldesign/builder 构建的 CSS/Less 样式库示例，展示了如何构建完整的设计系统和样式库。

## 📁 项目结构

```
style-library/
├── src/
│   ├── variables.less       # 设计系统变量
│   ├── mixins.less         # 通用 Mixins
│   ├── utilities.less      # 工具类样式
│   ├── components/
│   │   ├── button.less     # 按钮组件样式
│   │   └── input.less      # 输入框组件样式
│   └── index.less          # 主入口文件
├── .ldesign/
│   └── builder.config.ts   # 构建配置
├── package.json            # 项目配置
└── README.md              # 项目说明
```

## 🚀 特性展示

### 1. 设计系统
- **完整的变量系统**: 颜色、尺寸、间距、字体等
- **响应式断点**: 移动端到桌面端的完整适配
- **主题支持**: 通过 CSS 变量实现主题切换

### 2. 组件样式
- **按钮组件**: 多种类型、尺寸和状态
- **输入框组件**: 完整的表单元素样式
- **卡片组件**: 灵活的布局容器

### 3. 工具类系统
- **间距工具类**: margin、padding 的原子化类
- **布局工具类**: flexbox、grid 布局辅助
- **文本工具类**: 字体、颜色、对齐等

### 4. Mixins 库
- **布局 Mixins**: 居中、清除浮动等
- **动画 Mixins**: 常用动画效果
- **响应式 Mixins**: 媒体查询封装

## 🛠️ 构建命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式（监听文件变化）
pnpm dev

# 清理输出目录
pnpm clean

# 分析构建结果
pnpm analyze
```

## 📦 构建输出

构建完成后，将在 `dist` 目录生成以下文件：

```
dist/
├── index.css         # 完整样式库
├── components.css    # 仅组件样式
├── utilities.css     # 仅工具类
├── variables.css     # 仅变量定义
└── index.css.map     # CSS Source Map
```

## 📖 使用示例

### 完整导入

```html
<!DOCTYPE html>
<html>
<head>
  <!-- 导入完整样式库 -->
  <link rel="stylesheet" href="@example/style-library">
</head>
<body>
  <!-- 使用组件样式 -->
  <button class="ld-btn ld-btn--primary ld-btn--large">
    主要按钮
  </button>
  
  <!-- 使用工具类 -->
  <div class="d-flex justify-center items-center p-lg">
    <div class="text-center">
      <h1 class="text-xl font-bold mb-base">标题</h1>
      <p class="text-muted">描述文本</p>
    </div>
  </div>
</body>
</html>
```

### 按需导入

```css
/* 仅导入需要的部分 */
@import '@example/style-library/variables';
@import '@example/style-library/components';

/* 或者在 Less 中使用 */
@import '@example/style-library/src/variables.less';
@import '@example/style-library/src/mixins.less';

.my-component {
  .btn-base();
  .btn-variant(@primary-color);
}
```

### 自定义主题

```css
/* 通过 CSS 变量自定义主题 */
:root {
  --ld-color-primary: #ff6b6b;
  --ld-color-primary-hover: #ff5252;
  --ld-border-radius: 12px;
  --ld-font-size-base: 18px;
}

/* 暗色主题 */
[data-theme="dark"] {
  --ld-color-bg: #1a1a1a;
  --ld-color-text: #ffffff;
  --ld-color-border: #333333;
}
```

### 在 Vue 中使用

```vue
<template>
  <div class="container">
    <!-- 使用组件样式 -->
    <button class="ld-btn ld-btn--primary" @click="handleClick">
      Vue 按钮
    </button>
    
    <!-- 使用工具类 -->
    <div class="mt-lg p-base border rounded">
      <h2 class="text-lg font-semibold mb-sm">卡片标题</h2>
      <p class="text-muted">卡片内容</p>
    </div>
  </div>
</template>

<style>
/* 导入样式库 */
@import '@example/style-library';

/* 自定义样式 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
</style>
```

### 在 React 中使用

```tsx
import React from 'react'
import '@example/style-library'

function App() {
  return (
    <div className="container mx-auto p-lg">
      {/* 使用组件样式 */}
      <button className="ld-btn ld-btn--primary ld-btn--large">
        React 按钮
      </button>
      
      {/* 使用工具类 */}
      <div className="mt-lg p-base border rounded shadow">
        <h2 className="text-lg font-semibold mb-sm">卡片标题</h2>
        <p className="text-muted">卡片内容</p>
      </div>
      
      {/* 使用布局工具类 */}
      <div className="d-flex justify-between items-center mt-xl">
        <span className="text-sm text-muted">左侧文本</span>
        <button className="ld-btn ld-btn--secondary ld-btn--small">
          右侧按钮
        </button>
      </div>
    </div>
  )
}

export default App
```

## ⚙️ 配置说明

### .ldesign/builder.config.ts

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.less',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['css'],       // 样式库只输出 CSS
    sourcemap: true
  },
  
  // 库类型（样式库）
  libraryType: 'style',
  
  // 样式配置
  style: {
    extract: true,        // 提取 CSS 到单独文件
    minimize: true,       // 压缩 CSS
    autoprefixer: true,   // 自动添加浏览器前缀
    preprocessor: {
      less: {
        enabled: true,
        options: {
          javascriptEnabled: true
        }
      }
    },
    // 浏览器兼容性
    browserslist: [
      '> 1%',
      'last 2 versions',
      'not dead',
      'not ie 11'
    ]
  }
})
```

## 🎨 设计系统

### 颜色系统

```less
// 主色调
@primary-color: #722ed1;
@primary-color-hover: #5e2aa7;
@primary-color-light: #d8c8ee;

// 功能色
@success-color: #52c41a;
@warning-color: #faad14;
@danger-color: #ff4d4f;
@info-color: #1890ff;

// 中性色
@text-color: #333333;
@text-color-secondary: #666666;
@bg-color: #ffffff;
@border-color: #d9d9d9;
```

### 尺寸系统

```less
// 字体大小
@font-size-xs: 12px;
@font-size-sm: 14px;
@font-size-base: 16px;
@font-size-lg: 18px;
@font-size-xl: 20px;

// 间距
@spacing-xs: 4px;
@spacing-sm: 8px;
@spacing-base: 16px;
@spacing-lg: 24px;
@spacing-xl: 32px;

// 组件尺寸
@btn-height-sm: 28px;
@btn-height-base: 36px;
@btn-height-lg: 44px;
```

### 响应式断点

```less
@screen-xs: 480px;   // 手机
@screen-sm: 768px;   // 平板
@screen-md: 992px;   // 小桌面
@screen-lg: 1200px;  // 大桌面
@screen-xl: 1600px;  // 超大屏
```

## 🛠️ Mixins 使用

### 布局 Mixins

```less
// 使用居中 Mixin
.my-component {
  .flex-center();  // 等同于 display: flex; align-items: center; justify-content: center;
}

// 使用清除浮动
.clearfix-container {
  .clearfix();
}

// 使用文本省略
.text-overflow {
  .text-ellipsis();
}
```

### 按钮 Mixins

```less
// 创建自定义按钮
.my-custom-btn {
  .btn-base();
  .btn-variant(#ff6b6b, #ff6b6b, #fff);
  .btn-size(40px, 16px, 14px);
}
```

### 响应式 Mixins

```less
// 响应式设计
.responsive-component {
  padding: 16px;
  
  .media-sm({
    padding: 24px;
  });
  
  .media-lg({
    padding: 32px;
  });
}
```

## 🎯 最佳实践

### 1. 变量命名
- 使用语义化命名：`@primary-color` 而不是 `@blue`
- 保持一致的命名规范
- 使用层级结构组织变量

### 2. Mixins 设计
- 保持 Mixins 的单一职责
- 提供合理的默认参数
- 考虑浏览器兼容性

### 3. 工具类设计
- 遵循原子化设计原则
- 提供一致的命名规范
- 避免过度抽象

### 4. 组件样式
- 使用 BEM 命名规范
- 避免深层嵌套
- 考虑样式隔离

## 🔧 开发技巧

### 1. 调试
- 使用浏览器开发者工具
- 利用 Source Map 定位源码
- 在开发模式下使用 `pnpm dev` 监听变化

### 2. 优化
- 使用 CSS 变量减少重复
- 合理使用 Mixins 避免代码重复
- 考虑 CSS 文件大小

### 3. 维护
- 定期清理未使用的样式
- 保持文档更新
- 使用版本控制管理变更

## 📚 扩展功能

基于这个示例，你可以：

1. **添加更多组件样式**：表格、表单、导航等
2. **集成图标字体**：Font Awesome、Iconfont 等
3. **动画库**：添加常用动画效果
4. **主题系统**：完整的多主题支持
5. **打印样式**：优化打印显示效果
6. **RTL 支持**：右到左语言支持

这个示例展示了使用 @ldesign/builder 构建样式库的完整流程和最佳实践。
