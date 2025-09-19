# LDesign 设计系统样式规范

## 概述

LDesign 设计系统基于 TDesign 设计规范，提供了一套完整的设计令牌（Design Tokens）系统，确保组件库的视觉一致性和可维护性。

## 文件结构

```
src/styles/
├── design-tokens.less      # 设计令牌定义（CSS 变量）
├── variables.less          # LESS 变量映射（兼容性）
├── mixins.less            # 样式混入
├── themes.less            # 主题配置
├── utilities.less         # 工具类
├── index.less             # 样式入口文件
└── README.md              # 本文档
```

## 设计令牌系统

### 颜色系统

#### 基础色板
- **品牌色**：`--ldesign-brand-color-1` 到 `--ldesign-brand-color-10`
- **警告色**：`--ldesign-warning-color-1` 到 `--ldesign-warning-color-10`
- **成功色**：`--ldesign-success-color-1` 到 `--ldesign-success-color-10`
- **错误色**：`--ldesign-error-color-1` 到 `--ldesign-error-color-10`
- **中性色**：`--ldesign-gray-color-1` 到 `--ldesign-gray-color-14`

#### 语义化颜色
- **基础功能色**：`--ldesign-brand-color`、`--ldesign-warning-color` 等
- **交互状态色**：`--ldesign-brand-color-hover`、`--ldesign-brand-color-focus` 等
- **背景色**：`--ldesign-bg-color-page`、`--ldesign-bg-color-container` 等
- **文字色**：`--ldesign-text-color-primary`、`--ldesign-text-color-secondary` 等
- **边框色**：`--ldesign-border-color`、`--ldesign-border-color-hover` 等

### 字体系统

#### 字体族
- **无衬线字体**：`--ldesign-font-family`
- **等宽字体**：`--ldesign-font-family-mono`

#### 字体大小
- **基础尺寸**：`--ldesign-font-size-xs` (12px) 到 `--ldesign-font-size-xxl` (24px)
- **标题尺寸**：`--ldesign-font-size-h1` (32px) 到 `--ldesign-font-size-h6` (16px)

#### 行高
- **紧凑**：`--ldesign-line-height-xs` (1.2)
- **正常**：`--ldesign-line-height-base` (1.5)
- **宽松**：`--ldesign-line-height-xl` (1.8)

#### 字重
- **细体**：`--ldesign-font-weight-light` (300)
- **正常**：`--ldesign-font-weight-normal` (400)
- **中等**：`--ldesign-font-weight-medium` (500)
- **半粗**：`--ldesign-font-weight-semibold` (600)
- **粗体**：`--ldesign-font-weight-bold` (700)

### 间距系统

基于 8px 基准网格的间距系统：

- **超小**：`--ldesign-spacing-xs` (4px)
- **小**：`--ldesign-spacing-sm` (8px)
- **基础**：`--ldesign-spacing-base` (16px)
- **大**：`--ldesign-spacing-lg` (24px)
- **超大**：`--ldesign-spacing-xl` (32px)
- **特大**：`--ldesign-spacing-xxl` (48px)

### 尺寸系统

#### 组件高度
- **超小**：`--ldesign-height-xs` (24px)
- **小**：`--ldesign-height-sm` (32px)
- **基础**：`--ldesign-height-base` (40px)
- **大**：`--ldesign-height-lg` (48px)
- **超大**：`--ldesign-height-xl` (56px)

#### 圆角
- **无圆角**：`--ldesign-border-radius-none` (0)
- **超小**：`--ldesign-border-radius-xs` (2px)
- **小**：`--ldesign-border-radius-sm` (4px)
- **基础**：`--ldesign-border-radius-base` (6px)
- **大**：`--ldesign-border-radius-lg` (8px)
- **超大**：`--ldesign-border-radius-xl` (12px)
- **圆形**：`--ldesign-border-radius-full` (50%)

### 阴影系统

- **轻微**：`--ldesign-shadow-1` - 用于悬停状态
- **中等**：`--ldesign-shadow-2` - 用于下拉菜单
- **重度**：`--ldesign-shadow-3` - 用于弹窗
- **内阴影**：`--ldesign-shadow-inset` - 用于内嵌效果
- **表格**：`--ldesign-shadow-table` - 用于表格组件

### 动画系统

#### 过渡时长
- **快速**：`--ldesign-transition-fast` (0.1s)
- **基础**：`--ldesign-transition-base` (0.2s)
- **缓慢**：`--ldesign-transition-slow` (0.3s)

#### 缓动函数
- **线性**：`--ldesign-ease-linear`
- **缓入**：`--ldesign-ease-in`
- **缓出**：`--ldesign-ease-out`
- **缓入缓出**：`--ldesign-ease-in-out`

### 层级系统

- **下拉菜单**：`--ldesign-z-index-dropdown` (1000)
- **固定定位**：`--ldesign-z-index-sticky` (1020)
- **模态背景**：`--ldesign-z-index-modal-backdrop` (1040)
- **模态窗口**：`--ldesign-z-index-modal` (1050)
- **弹出框**：`--ldesign-z-index-popover` (1060)
- **工具提示**：`--ldesign-z-index-tooltip` (1070)
- **消息提示**：`--ldesign-z-index-toast` (1080)

## 使用方式

### 在 CSS 中使用

```css
.my-component {
  color: var(--ldesign-text-color-primary);
  background-color: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ldesign-border-radius-base);
  padding: var(--ldesign-spacing-base);
  font-size: var(--ldesign-font-size-base);
  transition: all var(--ldesign-transition-base) var(--ldesign-ease-out);
}
```

### 在 LESS 中使用

```less
.my-component {
  color: @text-color-primary;
  background-color: @bg-color-container;
  border: 1px solid @border-color;
  border-radius: @border-radius-base;
  padding: @spacing-base;
  font-size: @font-size-base;
  transition: all @transition-base ease-out;
}
```

## 主题定制

### 自定义主题

可以通过覆盖 CSS 变量来自定义主题：

```css
:root {
  --ldesign-brand-color-7: #1976d2; /* 自定义品牌色 */
  --ldesign-border-radius-base: 8px; /* 自定义圆角 */
}
```

### 暗色主题

```css
[data-theme="dark"] {
  --ldesign-bg-color-page: #1a1a1a;
  --ldesign-bg-color-container: #2a2a2a;
  --ldesign-text-color-primary: var(--ldesign-font-white-1);
  --ldesign-border-color: #404040;
}
```

## 最佳实践

1. **优先使用语义化变量**：使用 `--ldesign-text-color-primary` 而不是 `--ldesign-font-gray-1`
2. **保持一致性**：在同类组件中使用相同的设计令牌
3. **响应式设计**：利用间距和尺寸系统创建一致的响应式布局
4. **性能考虑**：CSS 变量支持运行时修改，但避免频繁更改
5. **可访问性**：确保颜色对比度符合 WCAG 标准

## 迁移指南

### 从旧版本迁移

如果你正在从旧版本的样式系统迁移，请参考以下映射：

```less
// 旧版本
@primary-color: #722ed1;
@text-color: #333;

// 新版本
@brand-color: var(--ldesign-brand-color);
@text-color-primary: var(--ldesign-text-color-primary);
```

### 渐进式迁移

1. 首先引入新的设计令牌文件
2. 逐步替换组件中的硬编码值
3. 更新主题配置
4. 移除旧的变量定义

## 参考资源

- [TDesign 设计规范](https://tdesign.tencent.com/)
- [CSS 自定义属性 (MDN)](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)
- [设计令牌最佳实践](https://spectrum.adobe.com/page/design-tokens/)
