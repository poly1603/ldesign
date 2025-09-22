# Popup 弹出层

弹出层组件，基于 @floating-ui/dom 实现，提供灵活的定位和丰富的交互方式。

## 基础用法

最简单的用法，通过 `content` 属性设置弹出内容。

<div class="demo-container">
  <ldesign-popup content="这是一个弹出层" placement="top">
    <ldesign-button slot="trigger">悬停显示</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup content="这是一个弹出层" placement="top">
  <ldesign-button slot="trigger">悬停显示</ldesign-button>
</ldesign-popup>
```

## 触发方式

支持多种触发方式：`hover`、`click`、`focus`、`manual`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-popup content="悬停触发" trigger="hover">
      <ldesign-button slot="trigger">悬停触发</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="点击触发" trigger="click">
      <ldesign-button slot="trigger">点击触发</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="聚焦触发" trigger="focus">
      <ldesign-button slot="trigger">聚焦触发</ldesign-button>
    </ldesign-popup>
  </div>
</div>

```html
<ldesign-popup content="悬停触发" trigger="hover">
  <ldesign-button slot="trigger">悬停触发</ldesign-button>
</ldesign-popup>

<ldesign-popup content="点击触发" trigger="click">
  <ldesign-button slot="trigger">点击触发</ldesign-button>
</ldesign-popup>

<ldesign-popup content="聚焦触发" trigger="focus">
  <ldesign-button slot="trigger">聚焦触发</ldesign-button>
</ldesign-popup>
```

## 弹出位置

支持 12 个方向的弹出位置。

<div class="demo-container">
  <div class="demo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
    <ldesign-popup content="Top Left" placement="top-start">
      <ldesign-button slot="trigger">TL</ldesign-button>
    </ldesign-popup>
    <ldesign-popup content="Top" placement="top">
      <ldesign-button slot="trigger">Top</ldesign-button>
    </ldesign-popup>
    <ldesign-popup content="Top Right" placement="top-end">
      <ldesign-button slot="trigger">TR</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="Left Top" placement="left-start">
      <ldesign-button slot="trigger">LT</ldesign-button>
    </ldesign-popup>
    <div></div>
    <ldesign-popup content="Right Top" placement="right-start">
      <ldesign-button slot="trigger">RT</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="Left" placement="left">
      <ldesign-button slot="trigger">Left</ldesign-button>
    </ldesign-popup>
    <div></div>
    <ldesign-popup content="Right" placement="right">
      <ldesign-button slot="trigger">Right</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="Left Bottom" placement="left-end">
      <ldesign-button slot="trigger">LB</ldesign-button>
    </ldesign-popup>
    <div></div>
    <ldesign-popup content="Right Bottom" placement="right-end">
      <ldesign-button slot="trigger">RB</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="Bottom Left" placement="bottom-start">
      <ldesign-button slot="trigger">BL</ldesign-button>
    </ldesign-popup>
    <ldesign-popup content="Bottom" placement="bottom">
      <ldesign-button slot="trigger">Bottom</ldesign-button>
    </ldesign-popup>
    <ldesign-popup content="Bottom Right" placement="bottom-end">
      <ldesign-button slot="trigger">BR</ldesign-button>
    </ldesign-popup>
  </div>
</div>

## 带标题的弹出层

通过 `title` 属性设置弹出层标题。

<div class="demo-container">
  <ldesign-popup title="提示标题" content="这里是弹出层的详细内容，可以包含更多信息。">
    <ldesign-button slot="trigger">带标题</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup title="提示标题" content="这里是弹出层的详细内容，可以包含更多信息。">
  <ldesign-button slot="trigger">带标题</ldesign-button>
</ldesign-popup>
```

## 自定义内容

使用默认插槽可以自定义弹出层内容。

<div class="demo-container">
  <ldesign-popup trigger="click">
    <ldesign-button slot="trigger">自定义内容</ldesign-button>
    <div style="padding: 8px;">
      <h4 style="margin: 0 0 8px 0;">自定义标题</h4>
      <p style="margin: 0 0 12px 0;">这是自定义的弹出层内容，可以包含任何HTML元素。</p>
      <div style="display: flex; gap: 8px;">
        <ldesign-button size="small">操作1</ldesign-button>
        <ldesign-button size="small" type="outline">操作2</ldesign-button>
      </div>
    </div>
  </ldesign-popup>
</div>

```html
<ldesign-popup trigger="click">
  <ldesign-button slot="trigger">自定义内容</ldesign-button>
  <div style="padding: 8px;">
    <h4>自定义标题</h4>
    <p>这是自定义的弹出层内容，可以包含任何HTML元素。</p>
    <div>
      <ldesign-button size="small">操作1</ldesign-button>
      <ldesign-button size="small" type="outline">操作2</ldesign-button>
    </div>
  </div>
</ldesign-popup>
```

## 延迟显示/隐藏

通过 `show-delay` 和 `hide-delay` 属性设置延迟时间。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-popup content="延迟500ms显示" show-delay="500">
      <ldesign-button slot="trigger">延迟显示</ldesign-button>
    </ldesign-popup>
    
    <ldesign-popup content="延迟1000ms隐藏" hide-delay="1000">
      <ldesign-button slot="trigger">延迟隐藏</ldesign-button>
    </ldesign-popup>
  </div>
</div>

```html
<ldesign-popup content="延迟500ms显示" show-delay="500">
  <ldesign-button slot="trigger">延迟显示</ldesign-button>
</ldesign-popup>

<ldesign-popup content="延迟1000ms隐藏" hide-delay="1000">
  <ldesign-button slot="trigger">延迟隐藏</ldesign-button>
</ldesign-popup>
```

## 禁用状态

通过 `disabled` 属性禁用弹出层。

<div class="demo-container">
  <ldesign-popup content="这个弹出层被禁用了" disabled>
    <ldesign-button slot="trigger" disabled>禁用状态</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup content="这个弹出层被禁用了" disabled>
  <ldesign-button slot="trigger" disabled>禁用状态</ldesign-button>
</ldesign-popup>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示弹出层 |
| `placement` | `PopupPlacement` | `'bottom'` | 弹出位置 |
| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual'` | `'hover'` | 触发方式 |
| `content` | `string` | - | 弹出层内容 |
| `title` | `string` | - | 弹出层标题 |
| `offset-distance` | `number` | `8` | 偏移距离 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `arrow` | `boolean` | `true` | 是否显示箭头 |
| `width` | `number \| string` | - | 弹出层宽度 |
| `max-width` | `number \| string` | - | 最大宽度 |
| `show-delay` | `number` | `0` | 延迟显示时间（毫秒） |
| `hide-delay` | `number` | `0` | 延迟隐藏时间（毫秒） |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignVisibleChange` | 显示状态变化时触发 | `(visible: boolean)` |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `trigger` | 触发器内容 |
| `default` | 弹出层内容（当未设置 content 属性时使用） |

### 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `show()` | 显示弹出层 | - |
| `hide()` | 隐藏弹出层 | - |
| `toggle()` | 切换显示状态 | - |

## 设计指南

### 何时使用

- 需要在页面上显示额外信息或操作时
- 需要确认用户操作时
- 需要显示复杂的提示内容时

### 最佳实践

1. **合理选择触发方式**：根据使用场景选择合适的触发方式
2. **控制内容长度**：避免弹出层内容过长，影响用户体验
3. **注意位置选择**：根据触发元素位置选择合适的弹出方向
4. **保持一致性**：在同一应用中保持弹出层样式的一致性

### 无障碍

- 支持键盘导航
- 提供适当的 ARIA 属性
- 支持屏幕阅读器
