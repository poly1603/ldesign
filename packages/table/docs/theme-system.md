# 主题系统文档

## 概述

LDESIGN Table 提供了强大而灵活的主题系统，支持多种预设主题、自定义主题、响应式适配和无障碍功能。

## 核心特性

### 🎨 预设主题
- **明亮主题 (light)**: 默认的明亮主题，适合大多数场景
- **暗黑主题 (dark)**: 深色背景主题，减少眼部疲劳
- **紧凑主题 (compact)**: 紧凑的行间距，适合数据密集型场景
- **舒适主题 (comfortable)**: 宽松的行间距，提供更好的可读性
- **极简主题 (minimal)**: 简洁的边框和样式，突出内容
- **卡片主题 (card)**: 卡片式布局，适合移动端展示
- **边框主题 (bordered)**: 完整的边框样式
- **条纹主题 (striped)**: 斑马纹行背景
- **无边框主题 (borderless)**: 无边框的简洁样式
- **圆角主题 (rounded)**: 圆角边框样式

### 📱 响应式模式
- **自动响应 (auto)**: 根据屏幕尺寸自动切换
- **桌面模式 (desktop)**: 固定为桌面端样式
- **平板模式 (tablet)**: 固定为平板端样式
- **移动模式 (mobile)**: 固定为移动端样式
- **卡片模式 (card)**: 移动端卡片布局

### ⚡ 特性开关
- **动画效果**: 控制过渡动画的启用/禁用
- **阴影效果**: 控制阴影样式的显示/隐藏
- **圆角效果**: 控制边框圆角的启用/禁用

### ♿ 无障碍支持
- **减少动画偏好**: 自动检测用户的动画偏好设置
- **高对比度模式**: 支持高对比度显示
- **深色主题偏好**: 自动检测系统深色主题偏好

## 使用方法

### 基础用法

```typescript
import { Table } from '@ldesign/table'

const table = new Table({
  container: '#table-container',
  columns: columns,
  data: data
})

// 设置主题
table.setTheme({
  type: 'dark',
  responsive: 'auto',
  animations: true,
  shadows: true,
  rounded: true
})
```

### 主题切换

```typescript
// 切换明亮/暗黑主题
table.toggleTheme()

// 切换响应式模式
table.toggleResponsiveMode()

// 获取当前主题
const currentTheme = table.getTheme()
console.log(currentTheme)
```

### 自定义主题

```typescript
// 使用自定义CSS变量
table.setTheme({
  type: 'custom',
  customVars: {
    '--ldesign-brand-color': '#ff6b6b',
    '--ldesign-bg-color-container': '#f8f9fa',
    '--ldesign-text-color-primary': '#2d3748'
  }
})
```

### 特性开关

```typescript
// 禁用动画
table.setTheme({ animations: false })

// 禁用阴影
table.setTheme({ shadows: false })

// 禁用圆角
table.setTheme({ rounded: false })
```

## 主题配置接口

```typescript
interface ThemeConfig {
  /** 主题类型 */
  type: 'light' | 'dark' | 'compact' | 'comfortable' | 'minimal' | 'card' | 'bordered' | 'striped' | 'borderless' | 'rounded' | 'custom'
  
  /** 响应式模式 */
  responsive: 'auto' | 'desktop' | 'tablet' | 'mobile' | 'card'
  
  /** 自定义CSS变量 */
  customVars?: Record<string, string>
  
  /** 是否启用动画 */
  animations?: boolean
  
  /** 是否启用阴影 */
  shadows?: boolean
  
  /** 是否启用圆角 */
  rounded?: boolean
}
```

## 事件系统

```typescript
// 监听主题变更事件
table.on('theme-change', (data) => {
  console.log('主题已变更:', data.oldTheme, '→', data.newTheme)
})
```

## CSS 变量系统

### 主要颜色变量

```css
/* 品牌色 */
--ldesign-brand-color: #722ED1;
--ldesign-brand-color-hover: #9254DE;
--ldesign-brand-color-active: #531DAB;

/* 背景色 */
--ldesign-bg-color-container: #ffffff;
--ldesign-bg-color-component: #fafafa;

/* 文字色 */
--ldesign-text-color-primary: rgba(0, 0, 0, 90%);
--ldesign-text-color-secondary: rgba(0, 0, 0, 70%);

/* 边框色 */
--ldesign-border-color: #e5e5e5;
--ldesign-border-color-hover: #d9d9d9;
```

### 尺寸变量

```css
/* 字体大小 */
--ls-font-size-xs: 14px;
--ls-font-size-sm: 16px;
--ls-font-size-base: 18px;

/* 间距 */
--ls-spacing-xs: 6px;
--ls-spacing-sm: 12px;
--ls-spacing-base: 20px;

/* 圆角 */
--ls-border-radius-sm: 3px;
--ls-border-radius-base: 6px;
--ls-border-radius-lg: 12px;
```

## 响应式断点

```css
/* 移动端 */
@media (max-width: 767px) { }

/* 平板端 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面端 */
@media (min-width: 1024px) { }

/* 大屏幕 */
@media (min-width: 1440px) { }
```

## 最佳实践

### 1. 主题选择建议

- **数据密集型应用**: 使用 `compact` 主题
- **阅读型应用**: 使用 `comfortable` 主题
- **移动端应用**: 使用 `card` 主题或响应式模式
- **暗色环境**: 使用 `dark` 主题

### 2. 性能优化

```typescript
// 批量设置主题配置，避免多次重绘
table.setTheme({
  type: 'dark',
  animations: false,
  shadows: false,
  responsive: 'mobile'
})
```

### 3. 无障碍考虑

```typescript
// 检测用户偏好并自动调整
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  table.setTheme({ animations: false })
}

if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  table.setTheme({ type: 'dark' })
}
```

### 4. 自定义主题开发

```css
/* 创建自定义主题 */
.my-custom-theme {
  --ldesign-brand-color: #your-brand-color;
  --ldesign-bg-color-container: #your-bg-color;
  /* 其他自定义变量 */
}
```

```typescript
// 应用自定义主题
table.setTheme({
  type: 'custom',
  customVars: {
    '--ldesign-brand-color': '#your-brand-color'
  }
})
```

## 故障排除

### 常见问题

1. **主题切换不生效**
   - 检查CSS文件是否正确加载
   - 确认主题配置是否正确传递

2. **响应式模式异常**
   - 检查容器元素的尺寸设置
   - 确认媒体查询是否被其他CSS覆盖

3. **自定义变量不生效**
   - 检查CSS变量名称是否正确
   - 确认变量作用域是否正确

### 调试技巧

```typescript
// 获取当前主题状态
console.log('当前主题:', table.getTheme())

// 获取主题管理器实例
const themeManager = table.getThemeManager()
console.log('主题管理器:', themeManager)
```

## 示例代码

完整的主题系统使用示例请参考：
- [基础主题示例](../examples/theme.html)
- [响应式主题示例](../examples/responsive.html)
- [自定义主题示例](../examples/custom-theme.html)
