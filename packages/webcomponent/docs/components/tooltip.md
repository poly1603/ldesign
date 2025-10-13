# Tooltip 工具提示

简洁的文字提示气泡框，基于最新的 Popup 组件封装，支持丰富的交互和样式特性。

## 基础用法

最简单的用法，鼠标悬停时显示提示信息。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tooltip content="这是一个提示">
      <ldesign-button>悬停显示提示</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="这是一个较长的提示信息，用来演示文本换行效">
      <span style="text-decoration: underline; cursor: help;">长文本提示</span>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="这是一个提示">
  <ldesign-button>悬停显示提示</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="这是一个较长的提示信息，用来演示文本换行效果">
  <span>长文本提示</span>
</ldesign-tooltip>
```

## 弹出位置

支持 12 个方向的弹出位置。

<div class="demo-container">
  <div class="demo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
    <ldesign-tooltip content="Top Left" placement="top-start">
      <ldesign-button>TL</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Top" placement="top">
      <ldesign-button>Top</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Top Right" placement="top-end">
      <ldesign-button>TR</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Left Top" placement="left-start">
      <ldesign-button>LT</ldesign-button>
    </ldesign-tooltip>
    <div></div>
    <ldesign-tooltip content="Right Top" placement="right-start">
      <ldesign-button>RT</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Left" placement="left">
      <ldesign-button>Left</ldesign-button>
    </ldesign-tooltip>
    <div></div>
    <ldesign-tooltip content="Right" placement="right">
      <ldesign-button>Right</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Left Bottom" placement="left-end">
      <ldesign-button>LB</ldesign-button>
    </ldesign-tooltip>
    <div></div>
    <ldesign-tooltip content="Right Bottom" placement="right-end">
      <ldesign-button>RB</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Bottom Left" placement="bottom-start">
      <ldesign-button>BL</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Bottom" placement="bottom">
      <ldesign-button>Bottom</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="Bottom Right" placement="bottom-end">
      <ldesign-button>BR</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

## 主题样式

支持深色和浅色两种主题。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tooltip content="深色主题（默认）" theme="dark">
      <ldesign-button>深色主题</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="浅色主题" theme="light">
      <ldesign-button>浅色主题</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="深色主题（默认）" theme="dark">
  <ldesign-button>深色主题</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="浅色主题" theme="light">
  <ldesign-button>浅色主题</ldesign-button>
</ldesign-tooltip>
```

## 延迟显示/隐藏

通过 `show-delay` 和 `hide-delay` 属性设置延迟时间。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tooltip content="延迟500ms显示" show-delay="500">
      <ldesign-button>延迟显示</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="延迟1000ms隐藏" hide-delay="1000">
      <ldesign-button>延迟隐藏</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="无延迟" show-delay="0" hide-delay="0">
      <ldesign-button>无延迟</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="延迟500ms显示" show-delay="500">
  <ldesign-button>延迟显示</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="延迟1000ms隐藏" hide-delay="1000">
  <ldesign-button>延迟隐藏</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="无延迟" show-delay="0" hide-delay="0">
  <ldesign-button>无延迟</ldesign-button>
</ldesign-tooltip>
```

## 自定义最大宽度

通过 `max-width` 属性控制提示框的最大宽度。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tooltip content="这是一个很长很长很长很长很长很长的提示信息" max-width="150">
      <ldesign-button>最大宽度150px</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="这是一个很长很长很长很长很长很长的提示信息" max-width="300">
      <ldesign-button>最大宽度300px</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="这是一个很长很长很长很长很长很长的提示信息" max-width="150">
  <ldesign-button>最大宽度150px</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="这是一个很长很长很长很长很长很长的提示信息" max-width="300">
  <ldesign-button>最大宽度300px</ldesign-button>
</ldesign-tooltip>
```

## 禁用箭头

通过 `arrow` 属性控制是否显示箭头。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tooltip content="显示箭头（默认）" arrow="true">
      <ldesign-button>显示箭头</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="隐藏箭头" arrow="false">
      <ldesign-button>隐藏箭头</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="显示箭头（默认）" arrow="true">
  <ldesign-button>显示箭头</ldesign-button>
</ldesign-tooltip>

<ldesign-tooltip content="隐藏箭头" arrow="false">
  <ldesign-button>隐藏箭头</ldesign-button>
</ldesign-tooltip>
```

## 禁用状态

通过 `disabled` 属性禁用提示。

<div class="demo-container">
  <ldesign-tooltip content="这个提示被禁用了" disabled>
    <ldesign-button>禁用提示</ldesign-button>
  </ldesign-tooltip>
</div>

```html
<ldesign-tooltip content="这个提示被禁用了" disabled>
  <ldesign-button>禁用提示</ldesign-button>
</ldesign-tooltip>
```

## 尺寸变体

提供三种预设尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-tooltip content="小尺寸" size="small">
      <ldesign-button size="small">Small</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="中等尺寸，适合大多数场景" size="medium">
      <ldesign-button>Medium</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="大尺寸，适合显示较多内容" size="large">
      <ldesign-button size="large">Large</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

```html
<ldesign-tooltip content="小尺寸" size="small">
  <ldesign-button>Small</ldesign-button>
</ldesign-tooltip>
```

## 动画效果

支持三种动画类型：`fade`、`scale`（默认）、`slide`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-tooltip content="淡入淡出" animation="fade">
      <ldesign-button>Fade</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="缩放效果" animation="scale">
      <ldesign-button>Scale</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="滑动效果" animation="slide">
      <ldesign-button>Slide</ldesign-button>
    </ldesign-tooltip>
  </div>
</div>

## 触发方式

支持 `hover`、`click`、`focus`、`manual` 四种触发方式。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-tooltip content="悬停显示" trigger="hover">
      <ldesign-button>Hover</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="点击显示" trigger="click" closable>
      <ldesign-button>Click</ldesign-button>
    </ldesign-tooltip>
    <ldesign-tooltip content="聚焦显示" trigger="focus">
      <input placeholder="Focus me" style="padding:8px;border:1px solid #ddd;border-radius:4px;" />
    </ldesign-tooltip>
  </div>
</div>

## 可交互提示

通过 `interactive` 允许鼠标移入提示内容。

<div class="demo-container">
  <ldesign-tooltip content="鼠标可以移入提示框" interactive hide-delay="200">
    <ldesign-button>可交互</ldesign-button>
  </ldesign-tooltip>
</div>

## 带标题的提示

通过 `tooltip-title` 添加标题。

<div class="demo-container">
  <ldesign-tooltip tooltip-title="标题" content="这是详细内容" size="large">
    <ldesign-button>带标题</ldesign-button>
  </ldesign-tooltip>
</div>

## 在文本中使用

Tooltip 可以与文本内容结合使用（为避免 HTML 块级元素嵌套问题，示例中不再使用 p 包裹，自定义元素用 span 包裹）。

<div class="demo-container">
  <div style="line-height: 1.7;">
    <span>这是一段包含 </span>
    <ldesign-tooltip content="这是一个行内提示">
      <span style="color: #3b82f6; text-decoration: underline; cursor: help;">提示文字</span>
    </ldesign-tooltip>
    <span> 的文本内容。你可以将鼠标悬停在 </span>
    <ldesign-tooltip content="另一个提示信息" theme="light">
      <strong style="cursor: help;">重要文字</strong>
    </ldesign-tooltip>
    <span> 上查看提示。</span>
  </div>
</div>

```html
<div>
  <span>这是一段包含 </span>
  <ldesign-tooltip content="这是一个行内提示">
    <span>提示文字</span>
  </ldesign-tooltip>
  <span> 的文本内容。你可以将鼠标悬停在 </span>
  <ldesign-tooltip content="另一个提示信息" theme="light">
    <strong>重要文字</strong>
  </ldesign-tooltip>
  <span> 上查看提示。</span>
</div>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `content` | `string` | - | 提示内容（必填） |
| `placement` | `TooltipPlacement` | `'top'` | 提示位置 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `arrow` | `boolean` | `true` | 是否显示箭头 |
| `show-delay` | `number` | `100` | 延迟显示时间（毫秒） |
| `hide-delay` | `number` | `100` | 延迟隐藏时间（毫秒） |
| `max-width` | `number \| string` | `250` | 最大宽度 |
| `width` | `number \| string` | - | 宽度（覆盖maxWidth） |
| `theme` | `'dark' \| 'light'` | `'dark'` | 主题样式 |
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | 触发方式 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `animation` | `'fade' \| 'scale' \| 'slide'` | `'scale'` | 动画类型 |
| `interactive` | `boolean` | `false` | 是否可交互 |
| `auto-close-delay` | `number` | `0` | 自动关闭延迟 |
| `closable` | `boolean` | `false` | 显示关闭按钮 |
| `tooltip-class` | `string` | - | 自定义类名 |
| `visible` | `boolean` | `false` | 受控显示状态 |
| `tooltip-title` | `string` | - | 标题 |
| `offset-distance` | `number \| string` | `8` | 与触发元素距离 |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `default` | 触发提示的元素 |

## 设计指南

### 何时使用

- 需要为用户提供简短的帮助信息时
- 需要解释某个功能或术语时
- 需要显示完整的文本内容（如截断的文本）时

### 何时不使用

- 提示内容过长或包含复杂格式时，建议使用 Popup 组件
- 需要用户交互的内容，建议使用 Popup 组件
- 在移动设备上，由于没有悬停状态，建议使用其他方式

### 最佳实践

1. **保持简洁**：提示内容应该简短明了，通常不超过一句话
2. **及时显示**：设置合适的延迟时间，避免过于敏感或迟钝
3. **位置合理**：根据触发元素的位置选择合适的弹出方向
4. **主题一致**：在同一应用中保持主题样式的一致性

### 无障碍

- 支持键盘导航（聚焦时显示）
- 提供适当的 ARIA 属性
- 支持屏幕阅读器
