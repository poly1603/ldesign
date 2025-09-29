# Less 样式库示例

这是一个使用 `@ldesign/builder` 构建的 Less 样式库示例，展示了如何创建、配置和打包一个完整的 CSS 样式库，包含设计系统、组件样式、工具类和主题支持。

## 📦 功能特性

- 🎨 **完整设计系统** - 颜色、字体、间距、阴影等完整的设计规范
- 📝 **Less 预处理器** - 使用 Less 编写样式，支持变量、混合器、嵌套等特性
- 🎯 **组件样式** - 按钮、输入框、卡片、模态框等常用组件样式
- 🛠️ **工具类** - 丰富的工具类，支持快速布局和样式调整
- 🌓 **主题支持** - 内置浅色和深色主题，支持主题切换
- 📱 **响应式设计** - 支持移动端、平板和桌面端的响应式适配
- ♿ **无障碍支持** - 遵循 WCAG 规范，支持屏幕阅读器和键盘导航
- 🎭 **CSS 变量** - 导出 CSS 变量，便于 JavaScript 访问和动态修改
- 📦 **多格式输出** - 支持压缩和未压缩版本，便于开发和生产使用

## 🚀 安装

```bash
# 使用 npm
npm install @ldesign/less-styles-example

# 使用 pnpm
pnpm add @ldesign/less-styles-example

# 使用 yarn
yarn add @ldesign/less-styles-example
```

## 📖 使用方法

### 完整引入

```css
/* 引入完整样式库 */
@import '@ldesign/less-styles-example';

/* 或者在 HTML 中引入 */
<link rel="stylesheet" href="node_modules/@ldesign/less-styles-example/dist/index.css">
```

### 按需引入

```less
// 只引入变量
@import '@ldesign/less-styles-example/src/variables/index.less';

// 只引入混合器
@import '@ldesign/less-styles-example/src/mixins/index.less';

// 只引入组件样式
@import '@ldesign/less-styles-example/src/components/button.less';
@import '@ldesign/less-styles-example/src/components/input.less';

// 只引入工具类
@import '@ldesign/less-styles-example/src/utilities/index.less';

// 只引入主题
@import '@ldesign/less-styles-example/src/themes/light.less';
```

### 在 JavaScript 中使用

```javascript
// 引入完整样式
import '@ldesign/less-styles-example/dist/index.css'

// 或者按需引入
import '@ldesign/less-styles-example/dist/components.css'
import '@ldesign/less-styles-example/dist/utilities.css'
```

## 🎨 设计系统

### 颜色系统

```html
<!-- 主色系 -->
<div class="bg-primary text-white p-md">主色</div>
<div class="bg-success text-white p-md">成功色</div>
<div class="bg-warning text-white p-md">警告色</div>
<div class="bg-error text-white p-md">错误色</div>
<div class="bg-info text-white p-md">信息色</div>

<!-- 中性色 -->
<div class="bg-gray-1 p-md">浅灰色</div>
<div class="bg-gray-5 text-white p-md">中灰色</div>
<div class="bg-gray-9 text-white p-md">深灰色</div>
```

### 间距系统

```html
<!-- 外边距 -->
<div class="m-xs">超小外边距</div>
<div class="m-sm">小外边距</div>
<div class="m-base">基础外边距</div>
<div class="m-lg">大外边距</div>

<!-- 内边距 -->
<div class="p-xs">超小内边距</div>
<div class="p-sm">小内边距</div>
<div class="p-base">基础内边距</div>
<div class="p-lg">大内边距</div>
```

### 字体系统

```html
<!-- 字体大小 -->
<div class="text-xs">超小文本</div>
<div class="text-sm">小文本</div>
<div class="text-base">基础文本</div>
<div class="text-lg">大文本</div>
<div class="text-xl">超大文本</div>

<!-- 字体重量 -->
<div class="font-light">细体</div>
<div class="font-normal">正常</div>
<div class="font-medium">中等</div>
<div class="font-bold">粗体</div>
```

## 🧩 组件样式

### 按钮

```html
<!-- 基础按钮 -->
<button class="l-button">默认按钮</button>
<button class="l-button l-button--primary">主要按钮</button>
<button class="l-button l-button--secondary">次要按钮</button>
<button class="l-button l-button--success">成功按钮</button>
<button class="l-button l-button--warning">警告按钮</button>
<button class="l-button l-button--error">错误按钮</button>

<!-- 不同尺寸 -->
<button class="l-button l-button--small">小按钮</button>
<button class="l-button l-button--medium">中按钮</button>
<button class="l-button l-button--large">大按钮</button>

<!-- 特殊状态 -->
<button class="l-button" disabled>禁用按钮</button>
<button class="l-button l-button--loading">加载中</button>
<button class="l-button l-button--block">块级按钮</button>
<button class="l-button l-button--round">圆形按钮</button>
<button class="l-button l-button--circle">圆角按钮</button>
```

### 输入框

```html
<!-- 基础输入框 -->
<div class="l-input">
  <label class="l-input__label">用户名</label>
  <div class="l-input__wrapper">
    <input class="l-input__inner" type="text" placeholder="请输入用户名">
  </div>
</div>

<!-- 带图标的输入框 -->
<div class="l-input">
  <label class="l-input__label">搜索</label>
  <div class="l-input__wrapper">
    <span class="l-input__prefix">🔍</span>
    <input class="l-input__inner" type="text" placeholder="搜索内容">
    <span class="l-input__suffix">
      <span class="l-input__clear">✕</span>
    </span>
  </div>
</div>

<!-- 不同尺寸 -->
<div class="l-input l-input--small">
  <div class="l-input__wrapper">
    <input class="l-input__inner" type="text" placeholder="小尺寸">
  </div>
</div>

<!-- 错误状态 -->
<div class="l-input l-input--error">
  <label class="l-input__label">邮箱</label>
  <div class="l-input__wrapper l-input__wrapper--error">
    <input class="l-input__inner" type="email" placeholder="请输入邮箱">
  </div>
  <div class="l-input__error">请输入有效的邮箱地址</div>
</div>
```

### 卡片

```html
<!-- 基础卡片 -->
<div class="l-card">
  <div class="l-card__header">
    <h3 class="l-card__title">卡片标题</h3>
    <span class="l-card__extra">额外内容</span>
  </div>
  <div class="l-card__body">
    <p>这是卡片的内容区域。</p>
  </div>
  <div class="l-card__footer">
    <small>卡片底部信息</small>
  </div>
</div>

<!-- 可悬停卡片 -->
<div class="l-card l-card--hoverable">
  <div class="l-card__body">
    <p>悬停时会有阴影效果的卡片。</p>
  </div>
</div>

<!-- 无边框卡片 -->
<div class="l-card l-card--borderless">
  <div class="l-card__body">
    <p>无边框的卡片样式。</p>
  </div>
</div>
```

### 模态框

```html
<!-- 模态框结构 -->
<div class="l-modal__mask">
  <div class="l-modal__dialog">
    <div class="l-modal__header">
      <h3 class="l-modal__title">模态框标题</h3>
      <button class="l-modal__close">✕</button>
    </div>
    <div class="l-modal__body">
      <p>这是模态框的内容。</p>
    </div>
    <div class="l-modal__footer">
      <button class="l-button">取消</button>
      <button class="l-button l-button--primary">确定</button>
    </div>
  </div>
</div>

<!-- 不同尺寸的模态框 -->
<div class="l-modal__dialog l-modal__dialog--small">小模态框</div>
<div class="l-modal__dialog l-modal__dialog--large">大模态框</div>
<div class="l-modal__dialog l-modal__dialog--fullscreen">全屏模态框</div>
```

## 🛠️ 工具类

### 布局工具类

```html
<!-- Flex 布局 -->
<div class="d-flex justify-center items-center">
  <div>居中内容</div>
</div>

<div class="d-flex justify-between items-start">
  <div>左侧内容</div>
  <div>右侧内容</div>
</div>

<!-- 网格布局 -->
<div class="d-grid">
  <div>网格项目</div>
</div>

<!-- 位置 -->
<div class="position-relative">
  <div class="position-absolute">绝对定位</div>
</div>
```

### 间距工具类

```html
<!-- 外边距 -->
<div class="m-0">无外边距</div>
<div class="mt-lg">顶部大外边距</div>
<div class="mx-auto">水平居中</div>

<!-- 内边距 -->
<div class="p-md">中等内边距</div>
<div class="px-lg py-sm">水平大内边距，垂直小内边距</div>
```

### 文本工具类

```html
<!-- 文本对齐 -->
<div class="text-left">左对齐</div>
<div class="text-center">居中对齐</div>
<div class="text-right">右对齐</div>

<!-- 文本颜色 -->
<div class="text-primary">主色文本</div>
<div class="text-success">成功色文本</div>
<div class="text-error">错误色文本</div>

<!-- 文本大小和重量 -->
<div class="text-lg font-bold">大号粗体文本</div>
<div class="text-sm font-light">小号细体文本</div>

<!-- 文本省略 -->
<div class="text-ellipsis">这是一段很长的文本，会被省略显示</div>
<div class="text-ellipsis-2">这是一段很长的文本，最多显示两行，超出部分会被省略</div>
```

## 🌓 主题支持

### 主题切换

```html
<!-- 浅色主题（默认） -->
<html data-theme="light">
  <!-- 页面内容 -->
</html>

<!-- 深色主题 -->
<html data-theme="dark">
  <!-- 页面内容 -->
</html>

<!-- 自动跟随系统主题 -->
<html>
  <!-- 不设置 data-theme 属性，会根据用户系统偏好自动选择 -->
</html>
```

### JavaScript 主题切换

```javascript
// 切换到深色主题
document.documentElement.setAttribute('data-theme', 'dark')

// 切换到浅色主题
document.documentElement.setAttribute('data-theme', 'light')

// 移除主题设置，跟随系统偏好
document.documentElement.removeAttribute('data-theme')

// 检测当前主题
const currentTheme = document.documentElement.getAttribute('data-theme')

// 检测系统偏好
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
```

### 自定义主题

```less
// 创建自定义主题
[data-theme="custom"] {
  --ldesign-primary-color: #ff6b6b;
  --ldesign-success-color: #51cf66;
  --ldesign-warning-color: #ffd43b;
  --ldesign-error-color: #ff6b6b;
  
  --ldesign-bg-color-page: #f8f9fa;
  --ldesign-bg-color-container: #ffffff;
  --ldesign-text-color-primary: #212529;
}
```

## 🔧 开发

### 构建

```bash
# 构建所有样式
npm run build

# 监听模式构建
npm run dev

# 清理构建产物
npm run clean
```

### 测试

```bash
# 运行测试
npm test

# 运行测试（单次）
npm run test:run
```

## 📁 项目结构

```
less-styles/
├── src/                          # 源代码目录
│   ├── variables/               # 变量定义
│   │   ├── colors.less         # 颜色变量
│   │   ├── typography.less     # 字体变量
│   │   ├── spacing.less        # 间距变量
│   │   └── index.less          # 变量入口
│   ├── mixins/                 # 混合器定义
│   │   └── index.less          # 混合器入口
│   ├── components/             # 组件样式
│   │   ├── button.less         # 按钮样式
│   │   ├── input.less          # 输入框样式
│   │   └── index.less          # 组件样式入口
│   ├── utilities/              # 工具类样式
│   │   └── index.less          # 工具类入口
│   ├── themes/                 # 主题样式
│   │   ├── light.less          # 浅色主题
│   │   ├── dark.less           # 深色主题
│   │   └── index.less          # 主题入口
│   └── index.less              # 主入口文件
├── .ldesign/                   # 构建配置
│   └── builder.config.ts       # @ldesign/builder 配置
├── dist/                       # 构建输出目录
│   ├── index.css              # 完整样式文件
│   ├── index.min.css          # 压缩样式文件
│   ├── variables.css          # 变量样式文件
│   ├── components.css         # 组件样式文件
│   ├── utilities.css          # 工具类样式文件
│   └── themes/                # 主题样式文件
│       ├── light.css          # 浅色主题
│       └── dark.css           # 深色主题
├── package.json               # 项目配置
└── README.md                  # 项目文档
```

## 🛠️ 构建配置

本项目使用 `@ldesign/builder` 进行构建，配置文件位于 `.ldesign/builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    format: ['css'],
    sourcemap: true,
    fileName: '[name].css'
  },
  libraryType: 'css',
  bundler: 'rollup',
  css: {
    extract: true,
    preprocessor: 'less',
    postcss: {
      plugins: ['autoprefixer', 'cssnano']
    }
  },
  less: {
    math: 'always',
    javascriptEnabled: true,
    globalVars: {
      'primary-color': '#722ED1'
    }
  },
  clean: true
})
```

## 🎯 最佳实践

### 1. 变量使用

```less
// 推荐：使用语义化变量名
.my-component {
  color: @text-color-primary;
  background-color: @bg-color-container;
  border: 1px solid @border-color-base;
}

// 不推荐：直接使用颜色值
.my-component {
  color: #000000;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
}
```

### 2. 混合器使用

```less
// 推荐：使用预定义的混合器
.my-button {
  .button-base();
  .button-variant(@text-color-white-primary, @primary-color, @primary-color);
}

// 推荐：使用工具混合器
.my-card {
  .card-base();
  .card-hover();
}
```

### 3. 响应式设计

```less
// 推荐：使用响应式混合器
.my-component {
  padding: @padding-md;
  
  .mobile-only({
    padding: @padding-sm;
  });
  
  .desktop-up({
    padding: @padding-lg;
  });
}
```

### 4. 主题适配

```less
// 推荐：使用 CSS 变量进行主题适配
.my-component {
  background-color: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 官网：https://ldesign.dev
- GitHub：https://github.com/ldesign/ldesign
