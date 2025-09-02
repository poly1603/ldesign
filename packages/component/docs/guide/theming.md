# 主题定制

LDesign 提供了灵活的主题定制系统，基于 CSS 变量实现，支持亮色/暗色模式切换和完全自定义的主题配置。

## 设计令牌

LDesign 使用设计令牌（Design Tokens）来管理设计系统中的视觉属性，包括颜色、字体、间距、阴影等。

### 颜色系统

#### 主色调

```css
:root {
  /* 主色调 */
  --ld-color-primary: #1976d2;
  --ld-color-primary-hover: #1565c0;
  --ld-color-primary-active: #0d47a1;
  --ld-color-primary-light: #e3f2fd;
  --ld-color-primary-lighter: #f3f9ff;
}
```

#### 功能色彩

```css
:root {
  /* 成功色 */
  --ld-color-success: #4caf50;
  --ld-color-success-hover: #43a047;
  --ld-color-success-active: #388e3c;
  --ld-color-success-light: #e8f5e8;
  
  /* 警告色 */
  --ld-color-warning: #ff9800;
  --ld-color-warning-hover: #f57c00;
  --ld-color-warning-active: #ef6c00;
  --ld-color-warning-light: #fff3e0;
  
  /* 错误色 */
  --ld-color-error: #f44336;
  --ld-color-error-hover: #e53935;
  --ld-color-error-active: #d32f2f;
  --ld-color-error-light: #ffebee;
  
  /* 信息色 */
  --ld-color-info: #2196f3;
  --ld-color-info-hover: #1e88e5;
  --ld-color-info-active: #1976d2;
  --ld-color-info-light: #e3f2fd;
}
```

#### 中性色彩

```css
:root {
  /* 文本色 */
  --ld-color-text-primary: rgba(0, 0, 0, 0.87);
  --ld-color-text-secondary: rgba(0, 0, 0, 0.6);
  --ld-color-text-disabled: rgba(0, 0, 0, 0.38);
  
  /* 背景色 */
  --ld-color-bg-primary: #ffffff;
  --ld-color-bg-secondary: #fafafa;
  --ld-color-bg-disabled: #f5f5f5;
  
  /* 边框色 */
  --ld-color-border-primary: #e0e0e0;
  --ld-color-border-secondary: #f0f0f0;
  --ld-color-border-disabled: #f5f5f5;
}
```

### 字体系统

```css
:root {
  /* 字体族 */
  --ld-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --ld-font-family-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  
  /* 字体大小 */
  --ld-font-size-xs: 12px;
  --ld-font-size-sm: 14px;
  --ld-font-size-md: 16px;
  --ld-font-size-lg: 18px;
  --ld-font-size-xl: 20px;
  --ld-font-size-2xl: 24px;
  --ld-font-size-3xl: 30px;
  
  /* 字体粗细 */
  --ld-font-weight-normal: 400;
  --ld-font-weight-medium: 500;
  --ld-font-weight-semibold: 600;
  --ld-font-weight-bold: 700;
  
  /* 行高 */
  --ld-line-height-tight: 1.25;
  --ld-line-height-normal: 1.5;
  --ld-line-height-relaxed: 1.75;
}
```

### 间距系统

```css
:root {
  /* 间距 */
  --ld-spacing-xs: 4px;
  --ld-spacing-sm: 8px;
  --ld-spacing-md: 16px;
  --ld-spacing-lg: 24px;
  --ld-spacing-xl: 32px;
  --ld-spacing-2xl: 48px;
  --ld-spacing-3xl: 64px;
  
  /* 圆角 */
  --ld-border-radius-sm: 2px;
  --ld-border-radius-md: 4px;
  --ld-border-radius-lg: 8px;
  --ld-border-radius-xl: 12px;
  --ld-border-radius-2xl: 16px;
  --ld-border-radius-full: 9999px;
}
```

### 阴影系统

```css
:root {
  /* 阴影 */
  --ld-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --ld-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --ld-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --ld-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* 动画 */
  --ld-transition-fast: 0.15s ease-out;
  --ld-transition-normal: 0.3s ease-out;
  --ld-transition-slow: 0.5s ease-out;
}
```

## 暗色模式

LDesign 内置了完整的暗色模式支持。

### 自动切换

```css
/* 自动根据系统偏好切换 */
@media (prefers-color-scheme: dark) {
  :root {
    --ld-color-text-primary: rgba(255, 255, 255, 0.87);
    --ld-color-text-secondary: rgba(255, 255, 255, 0.6);
    --ld-color-text-disabled: rgba(255, 255, 255, 0.38);
    
    --ld-color-bg-primary: #121212;
    --ld-color-bg-secondary: #1e1e1e;
    --ld-color-bg-disabled: #2c2c2c;
    
    --ld-color-border-primary: #333333;
    --ld-color-border-secondary: #2c2c2c;
    --ld-color-border-disabled: #404040;
  }
}
```

### 手动切换

```css
/* 暗色模式类 */
.dark {
  --ld-color-text-primary: rgba(255, 255, 255, 0.87);
  --ld-color-text-secondary: rgba(255, 255, 255, 0.6);
  --ld-color-text-disabled: rgba(255, 255, 255, 0.38);
  
  --ld-color-bg-primary: #121212;
  --ld-color-bg-secondary: #1e1e1e;
  --ld-color-bg-disabled: #2c2c2c;
  
  --ld-color-border-primary: #333333;
  --ld-color-border-secondary: #2c2c2c;
  --ld-color-border-disabled: #404040;
}
```

```javascript
// JavaScript 切换暗色模式
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  
  // 保存用户偏好
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 初始化主题
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    document.documentElement.classList.add('dark');
  }
}

// 页面加载时初始化
initTheme();
```

## 自定义主题

### 创建自定义主题

你可以通过覆盖 CSS 变量来创建自定义主题：

```css
/* 自定义蓝色主题 */
.theme-blue {
  --ld-color-primary: #2196f3;
  --ld-color-primary-hover: #1976d2;
  --ld-color-primary-active: #1565c0;
  --ld-color-primary-light: #e3f2fd;
  --ld-color-primary-lighter: #f3f9ff;
}

/* 自定义绿色主题 */
.theme-green {
  --ld-color-primary: #4caf50;
  --ld-color-primary-hover: #43a047;
  --ld-color-primary-active: #388e3c;
  --ld-color-primary-light: #e8f5e8;
  --ld-color-primary-lighter: #f1f8e9;
}

/* 自定义紫色主题 */
.theme-purple {
  --ld-color-primary: #9c27b0;
  --ld-color-primary-hover: #8e24aa;
  --ld-color-primary-active: #7b1fa2;
  --ld-color-primary-light: #f3e5f5;
  --ld-color-primary-lighter: #fce4ec;
}
```

### 应用自定义主题

```html
<!-- 应用蓝色主题 -->
<div class="theme-blue">
  <ld-button type="primary">蓝色主题按钮</ld-button>
</div>

<!-- 应用绿色主题 -->
<div class="theme-green">
  <ld-button type="primary">绿色主题按钮</ld-button>
</div>
```

### 动态切换主题

```javascript
// 主题切换器
class ThemeManager {
  constructor() {
    this.themes = ['default', 'blue', 'green', 'purple'];
    this.currentTheme = 'default';
  }
  
  setTheme(themeName) {
    // 移除之前的主题类
    this.themes.forEach(theme => {
      if (theme !== 'default') {
        document.documentElement.classList.remove(`theme-${theme}`);
      }
    });
    
    // 应用新主题
    if (themeName !== 'default') {
      document.documentElement.classList.add(`theme-${themeName}`);
    }
    
    this.currentTheme = themeName;
    localStorage.setItem('ld-theme', themeName);
  }
  
  getTheme() {
    return this.currentTheme;
  }
  
  initTheme() {
    const savedTheme = localStorage.getItem('ld-theme') || 'default';
    this.setTheme(savedTheme);
  }
}

// 使用示例
const themeManager = new ThemeManager();
themeManager.initTheme();

// 切换到蓝色主题
themeManager.setTheme('blue');
```

## 组件级定制

### 按钮组件定制

```css
/* 自定义按钮样式 */
ld-button {
  --ld-button-height: 40px;
  --ld-button-padding: 0 20px;
  --ld-button-border-radius: 8px;
  --ld-button-font-size: 16px;
  --ld-button-font-weight: 500;
}

/* 自定义主要按钮 */
ld-button[type="primary"] {
  --ld-button-primary-bg: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --ld-button-primary-border: transparent;
  --ld-button-primary-color: #ffffff;
}

/* 自定义按钮尺寸 */
ld-button[size="large"] {
  --ld-button-height: 48px;
  --ld-button-padding: 0 24px;
  --ld-button-font-size: 18px;
}

ld-button[size="small"] {
  --ld-button-height: 32px;
  --ld-button-padding: 0 16px;
  --ld-button-font-size: 14px;
}
```

### 输入框组件定制

```css
/* 自定义输入框样式 */
ld-input {
  --ld-input-height: 40px;
  --ld-input-padding: 0 12px;
  --ld-input-border-radius: 6px;
  --ld-input-border-width: 1px;
  --ld-input-font-size: 16px;
}

/* 自定义聚焦状态 */
ld-input:focus-within {
  --ld-input-border-color: var(--ld-color-primary);
  --ld-input-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}
```

### 卡片组件定制

```css
/* 自定义卡片样式 */
ld-card {
  --ld-card-border-radius: 12px;
  --ld-card-padding: 24px;
  --ld-card-shadow: var(--ld-shadow-lg);
  --ld-card-border: 1px solid var(--ld-color-border-secondary);
}

/* 自定义卡片标题 */
ld-card .ld-card__title {
  --ld-card-title-font-size: 20px;
  --ld-card-title-font-weight: 600;
  --ld-card-title-color: var(--ld-color-text-primary);
}
```

## 响应式主题

LDesign 支持响应式主题配置：

```css
/* 移动端主题调整 */
@media (max-width: 768px) {
  :root {
    --ld-font-size-md: 14px;
    --ld-spacing-md: 12px;
    --ld-spacing-lg: 16px;
  }
  
  ld-button {
    --ld-button-height: 44px; /* 移动端更大的触摸目标 */
    --ld-button-font-size: 16px;
  }
  
  ld-input {
    --ld-input-height: 44px;
    --ld-input-font-size: 16px; /* 防止 iOS 缩放 */
  }
}

/* 平板端主题调整 */
@media (min-width: 769px) and (max-width: 1024px) {
  :root {
    --ld-spacing-lg: 20px;
    --ld-spacing-xl: 28px;
  }
}
```

## 主题工具

### 主题生成器

你可以使用以下工具函数生成主题：

```javascript
// 主题生成器
function generateTheme(primaryColor) {
  // 这里可以使用颜色库（如 chroma.js）来生成色彩变化
  const colors = {
    primary: primaryColor,
    primaryHover: darken(primaryColor, 0.1),
    primaryActive: darken(primaryColor, 0.2),
    primaryLight: lighten(primaryColor, 0.4),
    primaryLighter: lighten(primaryColor, 0.6),
  };
  
  return {
    '--ld-color-primary': colors.primary,
    '--ld-color-primary-hover': colors.primaryHover,
    '--ld-color-primary-active': colors.primaryActive,
    '--ld-color-primary-light': colors.primaryLight,
    '--ld-color-primary-lighter': colors.primaryLighter,
  };
}

// 应用生成的主题
function applyTheme(theme) {
  Object.entries(theme).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });
}

// 使用示例
const customTheme = generateTheme('#e91e63');
applyTheme(customTheme);
```

### 主题预览

```html
<!-- 主题预览组件 -->
<div class="theme-preview">
  <div class="theme-preview__colors">
    <div class="color-item" style="background: var(--ld-color-primary)">Primary</div>
    <div class="color-item" style="background: var(--ld-color-success)">Success</div>
    <div class="color-item" style="background: var(--ld-color-warning)">Warning</div>
    <div class="color-item" style="background: var(--ld-color-error)">Error</div>
  </div>
  
  <div class="theme-preview__components">
    <ld-button type="primary">Primary Button</ld-button>
    <ld-button type="default">Default Button</ld-button>
    <ld-input placeholder="Input Field"></ld-input>
    <ld-card card-title="Card Title">
      <p>Card content goes here.</p>
    </ld-card>
  </div>
</div>
```

## 最佳实践

1. **使用 CSS 变量**: 优先使用 CSS 变量而不是直接覆盖样式
2. **保持一致性**: 确保自定义主题在所有组件中保持一致
3. **测试可访问性**: 确保自定义颜色满足对比度要求
4. **响应式考虑**: 在不同屏幕尺寸下测试主题效果
5. **性能优化**: 避免过度使用复杂的 CSS 选择器

## 下一步

- [国际化](/guide/i18n) - 了解如何配置多语言支持
- [最佳实践](/guide/best-practices) - 学习使用 LDesign 的最佳实践
