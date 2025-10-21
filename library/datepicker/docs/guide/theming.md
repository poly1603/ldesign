# 主题定制

LDesign DatePicker 使用 CSS Variables（CSS 自定义属性）实现主题定制，让你可以轻松定制组件外观。

## 基础用法

通过覆盖 CSS Variables 来定制主题：

```css
:root {
  /* 主色调 */
  --ldate-primary-color: #f56c6c;
  
  /* 圆角 */
  --ldate-border-radius: 8px;
  
  /* 单元格大小 */
  --ldate-cell-size: 40px;
  
  /* 字体大小 */
  --ldate-font-size: 16px;
}
```

## 完整变量列表

### 颜色变量

```css
:root {
  /* 主要颜色 */
  --ldate-primary-color: #409eff;
  --ldate-primary-hover-color: #66b1ff;
  --ldate-primary-active-color: #3a8ee6;
  
  /* 功能颜色 */
  --ldate-success-color: #67c23a;
  --ldate-warning-color: #e6a23c;
  --ldate-danger-color: #f56c6c;
  --ldate-info-color: #909399;
  
  /* 背景色 */
  --ldate-bg-color: #ffffff;
  --ldate-bg-hover-color: #f5f7fa;
  --ldate-bg-selected-color: #f0f9ff;
  --ldate-bg-disabled-color: #f5f7fa;
  
  /* 文本颜色 */
  --ldate-text-color: #606266;
  --ldate-text-primary-color: #303133;
  --ldate-text-secondary-color: #909399;
  --ldate-text-placeholder-color: #c0c4cc;
  --ldate-text-disabled-color: #c0c4cc;
  --ldate-text-inverse-color: #ffffff;
  
  /* 边框颜色 */
  --ldate-border-color: #dcdfe6;
  --ldate-border-hover-color: #c0c4cc;
  --ldate-border-focus-color: var(--ldate-primary-color);
}
```

### 尺寸变量

```css
:root {
  /* 边框圆角 */
  --ldate-border-radius: 4px;
  --ldate-border-radius-small: 2px;
  
  /* 单元格尺寸 */
  --ldate-cell-size: 36px;
  --ldate-cell-size-small: 28px;
  --ldate-cell-size-large: 40px;
  
  /* 字体大小 */
  --ldate-font-size: 14px;
  --ldate-font-size-small: 12px;
  --ldate-font-size-large: 16px;
  --ldate-line-height: 1.5;
  
  /* 间距 */
  --ldate-spacing-xs: 4px;
  --ldate-spacing-sm: 8px;
  --ldate-spacing-md: 12px;
  --ldate-spacing-lg: 16px;
  --ldate-spacing-xl: 20px;
}
```

### 效果变量

```css
:root {
  /* 阴影 */
  --ldate-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --ldate-shadow-light: 0 0 6px 0 rgba(0, 0, 0, 0.04);
  
  /* 过渡 */
  --ldate-transition-duration: 0.3s;
  --ldate-transition-function: cubic-bezier(0.645, 0.045, 0.355, 1);
  
  /* 层级 */
  --ldate-z-index-popper: 2000;
}
```

## 预设主题

### 暗色主题

```css
[data-theme="dark"] {
  --ldate-primary-color: #409eff;
  --ldate-primary-hover-color: #66b1ff;
  
  --ldate-bg-color: #1a1a1a;
  --ldate-bg-hover-color: #2a2a2a;
  --ldate-bg-selected-color: #1e3a5f;
  --ldate-bg-disabled-color: #2a2a2a;
  
  --ldate-text-color: #e0e0e0;
  --ldate-text-primary-color: #f0f0f0;
  --ldate-text-secondary-color: #a0a0a0;
  --ldate-text-placeholder-color: #606060;
  --ldate-text-disabled-color: #606060;
  
  --ldate-border-color: #3a3a3a;
  --ldate-border-hover-color: #4a4a4a;
  
  --ldate-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
}
```

使用暗色主题：

```html
<body data-theme="dark">
  <DatePicker />
</body>
```

或者通过 JavaScript 切换：

```js
document.documentElement.setAttribute('data-theme', 'dark');
```

### 自定义主题示例

#### 粉色主题

```css
.pink-theme {
  --ldate-primary-color: #ec4899;
  --ldate-primary-hover-color: #f472b6;
  --ldate-primary-active-color: #db2777;
  --ldate-bg-selected-color: #fce7f3;
}
```

#### 绿色主题

```css
.green-theme {
  --ldate-primary-color: #10b981;
  --ldate-primary-hover-color: #34d399;
  --ldate-primary-active-color: #059669;
  --ldate-bg-selected-color: #d1fae5;
}
```

#### 紫色主题

```css
.purple-theme {
  --ldate-primary-color: #8b5cf6;
  --ldate-primary-hover-color: #a78bfa;
  --ldate-primary-active-color: #7c3aed;
  --ldate-bg-selected-color: #ede9fe;
}
```

## 响应式主题

根据屏幕尺寸调整：

```css
/* 移动端 */
@media (max-width: 768px) {
  :root {
    --ldate-cell-size: 32px;
    --ldate-font-size: 12px;
    --ldate-spacing-md: 8px;
  }
}

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) {
  :root {
    --ldate-cell-size: 36px;
    --ldate-font-size: 14px;
  }
}

/* 桌面 */
@media (min-width: 1025px) {
  :root {
    --ldate-cell-size: 40px;
    --ldate-font-size: 16px;
  }
}
```

## 组件级主题

为单个组件定制主题：

```vue
<template>
  <div class="custom-datepicker">
    <DatePicker v-model="date" />
  </div>
</template>

<style scoped>
.custom-datepicker {
  --ldate-primary-color: #f56c6c;
  --ldate-border-radius: 12px;
  --ldate-cell-size: 44px;
  --ldate-font-size: 16px;
}
</style>
```

## 主题生成器

你可以使用在线主题生成器快速生成主题（即将推出）：

```js
import { generateTheme } from '@ldesign/datepicker-theme-generator';

const myTheme = generateTheme({
  primaryColor: '#f56c6c',
  borderRadius: 8,
  cellSize: 40,
});

// 应用主题
document.documentElement.style.cssText = myTheme;
```

## 最佳实践

### 1. 使用 CSS 变量层叠

```css
/* 全局默认 */
:root {
  --ldate-primary-color: #409eff;
}

/* 特定页面覆盖 */
.settings-page {
  --ldate-primary-color: #67c23a;
}

/* 特定组件覆盖 */
.special-picker {
  --ldate-primary-color: #f56c6c;
}
```

### 2. 保持一致性

确保你的主题颜色与整体设计系统保持一致：

```css
:root {
  /* 使用设计系统的颜色变量 */
  --ldate-primary-color: var(--app-primary-color);
  --ldate-text-color: var(--app-text-color);
  --ldate-border-color: var(--app-border-color);
}
```

### 3. 提供主题切换

```vue
<template>
  <div>
    <button @click="toggleTheme">
      {{ theme === 'light' ? '🌙 暗色' : '☀️ 亮色' }}
    </button>
    <DatePicker v-model="date" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const theme = ref('light');

const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

watch(theme, (newTheme) => {
  document.documentElement.setAttribute('data-theme', newTheme);
});
</script>
```

## 调试工具

使用浏览器开发者工具查看和调试 CSS 变量：

```js
// 获取当前主题色
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--ldate-primary-color');

console.log('当前主题色:', primaryColor);

// 动态修改主题色
document.documentElement.style.setProperty('--ldate-primary-color', '#f56c6c');
```




