# 主题定制

LDesign Component 提供了完整的主题定制能力，支持亮色、暗色主题以及自定义主题配置。

## 设计令牌

组件库基于设计令牌（Design Tokens）系统构建，所有的颜色、字体、间距等样式都通过 CSS 变量定义。

### 颜色系统

#### 品牌色

```css
:root {
  --ldesign-brand-color-1: #f1ecf9;
  --ldesign-brand-color-2: #d8c8ee;
  --ldesign-brand-color-3: #bfa4e5;
  --ldesign-brand-color-4: #a67fdb;
  --ldesign-brand-color-5: #8c5ad3;
  --ldesign-brand-color-6: #7334cb;
  --ldesign-brand-color-7: #5e2aa7; /* 主品牌色 */
  --ldesign-brand-color-8: #491f84;
  --ldesign-brand-color-9: #35165f;
  --ldesign-brand-color-10: #200d3b;
}
```

#### 功能色

```css
:root {
  /* 成功色 */
  --ldesign-success-color: #52c41a;
  --ldesign-success-color-hover: #73d13d;
  --ldesign-success-color-active: #389e0d;
  
  /* 警告色 */
  --ldesign-warning-color: #faad14;
  --ldesign-warning-color-hover: #ffc53d;
  --ldesign-warning-color-active: #d48806;
  
  /* 错误色 */
  --ldesign-error-color: #ff4d4f;
  --ldesign-error-color-hover: #ff7875;
  --ldesign-error-color-active: #d9363e;
}
```

#### 中性色

```css
:root {
  /* 文本色 */
  --ldesign-text-color-primary: #262626;
  --ldesign-text-color-secondary: #595959;
  --ldesign-text-color-placeholder: #bfbfbf;
  --ldesign-text-color-disabled: #d9d9d9;
  
  /* 背景色 */
  --ldesign-bg-color-page: #ffffff;
  --ldesign-bg-color-container: #fafafa;
  --ldesign-bg-color-component: #ffffff;
  
  /* 边框色 */
  --ldesign-border-level-1-color: #e5e5e5;
  --ldesign-border-level-2-color: #d9d9d9;
  --ldesign-border-level-3-color: #cccccc;
}
```

### 字体系统

```css
:root {
  /* 字体大小 */
  --ldesign-font-size-xs: 12px;
  --ldesign-font-size-sm: 14px;
  --ldesign-font-size-base: 16px;
  --ldesign-font-size-lg: 18px;
  --ldesign-font-size-xl: 20px;
  --ldesign-font-size-xxl: 24px;
  
  /* 字体粗细 */
  --ldesign-font-weight-light: 300;
  --ldesign-font-weight-normal: 400;
  --ldesign-font-weight-medium: 500;
  --ldesign-font-weight-semibold: 600;
  --ldesign-font-weight-bold: 700;
  
  /* 行高 */
  --ldesign-line-height-tight: 1.25;
  --ldesign-line-height-normal: 1.5;
  --ldesign-line-height-relaxed: 1.75;
}
```

### 间距系统

```css
:root {
  --ldesign-spacing-xs: 4px;
  --ldesign-spacing-sm: 8px;
  --ldesign-spacing-base: 16px;
  --ldesign-spacing-lg: 24px;
  --ldesign-spacing-xl: 32px;
  --ldesign-spacing-xxl: 48px;
}
```

## 主题切换

### 亮色主题（默认）

```css
:root,
[data-theme="light"] {
  --ldesign-brand-color: var(--ldesign-brand-color-7);
  --ldesign-text-color-primary: #262626;
  --ldesign-bg-color-page: #ffffff;
  /* ... 其他变量 */
}
```

### 暗色主题

```css
[data-theme="dark"] {
  --ldesign-brand-color: var(--ldesign-brand-color-5);
  --ldesign-text-color-primary: #ffffff;
  --ldesign-bg-color-page: #1a1a1a;
  /* ... 其他变量 */
}
```

### 高对比度主题

```css
[data-theme="high-contrast"] {
  --ldesign-brand-color: #0066cc;
  --ldesign-text-color-primary: #000000;
  --ldesign-bg-color-page: #ffffff;
  /* ... 其他变量 */
}
```

## 自定义主题

### 方法一：覆盖 CSS 变量

最简单的方式是直接覆盖 CSS 变量：

```css
:root {
  /* 自定义品牌色 */
  --ldesign-brand-color: #1890ff;
  --ldesign-brand-color-hover: #40a9ff;
  --ldesign-brand-color-active: #096dd9;
  
  /* 自定义圆角 */
  --ldesign-border-radius-base: 8px;
  
  /* 自定义字体 */
  --ldesign-font-size-base: 14px;
}
```

### 方法二：使用 LESS 变量

如果你使用 LESS，可以在构建时覆盖变量：

```less
// 自定义主题变量
@brand-color: #1890ff;
@border-radius-base: 8px;
@font-size-base: 14px;

// 导入组件样式
@import '@ldesign/component/styles';
```

### 方法三：动态主题切换

通过 JavaScript 动态切换主题：

```javascript
// 切换到暗色主题
document.documentElement.setAttribute('data-theme', 'dark')

// 切换到亮色主题
document.documentElement.setAttribute('data-theme', 'light')

// 切换到高对比度主题
document.documentElement.setAttribute('data-theme', 'high-contrast')

// 移除主题属性（使用默认主题）
document.documentElement.removeAttribute('data-theme')
```

### 方法四：自定义主题类

创建自定义主题类：

```css
.my-custom-theme {
  --ldesign-brand-color: #722ed1;
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
  --ldesign-error-color: #ff4d4f;
  
  --ldesign-border-radius-base: 6px;
  --ldesign-font-size-base: 15px;
}
```

然后在应用中使用：

```html
<div class="my-custom-theme">
  <l-button type="primary">自定义主题按钮</l-button>
</div>
```

## 主题工具

### 主题生成器

我们提供了主题生成器工具，可以快速生成自定义主题：

```javascript
import { generateTheme } from '@ldesign/component/theme'

const customTheme = generateTheme({
  primaryColor: '#1890ff',
  borderRadius: 8,
  fontSize: 14
})

// 应用主题
document.documentElement.style.cssText = customTheme
```

### 主题检测

检测当前系统主题偏好：

```javascript
// 检测系统主题偏好
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

// 监听主题变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (e.matches) {
    // 切换到暗色主题
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    // 切换到亮色主题
    document.documentElement.setAttribute('data-theme', 'light')
  }
})
```

## 最佳实践

### 1. 保持一致性

确保自定义主题在所有组件中保持一致的视觉效果。

### 2. 考虑无障碍性

- 确保颜色对比度符合 WCAG 2.1 AA 标准
- 不要仅依赖颜色传达信息
- 提供高对比度主题选项

### 3. 测试多种场景

在不同的主题下测试所有组件，确保视觉效果符合预期。

### 4. 渐进增强

为不支持 CSS 变量的浏览器提供降级方案。

## 常见问题

### Q: 如何确保自定义主题在所有组件中生效？

A: 确保 CSS 变量定义在 `:root` 或更高层级的选择器中，这样所有子元素都能继承这些变量。

### Q: 可以同时使用多个主题吗？

A: 可以，通过不同的 CSS 类或属性选择器，可以在同一页面中使用多个主题。

### Q: 如何调试主题变量？

A: 使用浏览器开发者工具的 "Computed" 面板，可以查看当前元素使用的 CSS 变量值。
