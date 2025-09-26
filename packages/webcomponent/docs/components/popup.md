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
  <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
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

## 距离（offset-distance）

组件不会遮挡触发元素。通过 `offset-distance` 可以控制两者之间的间距：

- 当 `arrow=true`（默认）时，`offset-distance` 表示“触发元素到箭头尖端”的距离。
- 当 `arrow=false` 时，`offset-distance` 表示“触发元素到弹层边缘”的距离。
- 默认值为 `8`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
    <ldesign-popup placement="top" offset-distance="4" content="距离 4px">
      <ldesign-button slot="trigger">距离 4px</ldesign-button>
    </ldesign-popup>
    <ldesign-popup placement="top" offset-distance="16" content="距离 16px">
      <ldesign-button slot="trigger">距离 16px</ldesign-button>
    </ldesign-popup>
    <ldesign-popup placement="top" arrow="false" offset-distance="12" content="无箭头，距离 12px">
      <ldesign-button slot="trigger" type="outline">无箭头 12px</ldesign-button>
    </ldesign-popup>
  </div>
</div>

```html
<!-- 不同间距 -->
<ldesign-popup placement="top" offset-distance="4" content="距离 4px">
  <ldesign-button slot="trigger">距离 4px</ldesign-button>
</ldesign-popup>

<ldesign-popup placement="top" offset-distance="16" content="距离 16px">
  <ldesign-button slot="trigger">距离 16px</ldesign-button>
</ldesign-popup>

<!-- 无箭头也能精确控制间距 -->
<ldesign-popup placement="top" arrow="false" offset-distance="12" content="无箭头，距离 12px">
  <ldesign-button slot="trigger" type="outline">无箭头 12px</ldesign-button>
</ldesign-popup>
```

## 弹出位置

支持 12 个方向的弹出位置。

<div class="demo-container">
  <div class="placement-sandbox" style="padding: 60px 120px; display: flex; justify-content: center;">
    <div class="demo-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;">
      <div><ldesign-popup content="Top Left" placement="top-start"><button style="background: red;padding: 0 8px;border-radius: 4px;" slot="trigger">TL</button></ldesign-popup></div>
      <div><ldesign-popup content="Top" placement="top"><ldesign-button slot="trigger">Top</ldesign-button></ldesign-popup></div>
      <div><ldesign-popup content="Top Right" placement="top-end"><button style="background: red;padding: 0 8px;border-radius: 4px;" slot="trigger">TR</button></ldesign-popup></div>
      <div><ldesign-popup content="Left Top" placement="left-start"><ldesign-button slot="trigger">LT</ldesign-button></ldesign-popup></div>
      <div></div>
      <div><ldesign-popup content="Right Top" placement="right-start"><button style="background: red;padding: 0 8px;border-radius: 4px;" slot="trigger">RT</button></ldesign-popup></div>
      <div><ldesign-popup content="Left" placement="left"><button style="background: red;padding: 0 8px;border-radius: 4px;" slot="trigger">Left</button></ldesign-popup></div>
      <div></div>
      <div><ldesign-popup content="Right" placement="right"><ldesign-button slot="trigger">Right</ldesign-button></ldesign-popup></div>
      <div><ldesign-popup content="Left Bottom" placement="left-end"><ldesign-button slot="trigger">LB</ldesign-button></ldesign-popup></div>
      <div></div>
      <div><ldesign-popup content="Right Bottom" placement="right-end"><ldesign-button slot="trigger">RB</ldesign-button></ldesign-popup></div>
      <div><ldesign-popup content="Bottom Left" placement="bottom-start"><ldesign-button slot="trigger">BL</ldesign-button></ldesign-popup></div>
      <div><ldesign-popup content="Bottom" placement="bottom"><ldesign-button slot="trigger">Bottom</ldesign-button></ldesign-popup></div>
      <div><ldesign-popup content="Bottom Right" placement="bottom-end"><ldesign-button slot="trigger">BR</ldesign-button></ldesign-popup></div>
</div>
  </div>
</div>

## 带标题的弹出层

通过 `popup-title` 属性设置弹出层标题。

<div class="demo-container">
  <ldesign-popup popup-title="提示标题" content="这里是弹出层的详细内容，可以包含更多信息。">
    <ldesign-button slot="trigger">带标题</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup popup-title="提示标题" content="这里是弹出层的详细内容，可以包含更多信息。">
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

## 交互内容（可悬停在浮层上）

默认情况下，hover 模式可以把鼠标移入弹出层继续交互（interactive=true）。为了更平滑地从触发器移动到浮层，建议设置一个小的 `hide-delay`（150–300ms）。

<div class="demo-container">
  <ldesign-popup popup-title="可交互" content="把鼠标移到浮层上可继续操作" interactive hide-delay="200">
    <ldesign-button slot="trigger">可交互浮层</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup popup-title="可交互" content="把鼠标移到浮层上可继续操作" interactive hide-delay="200">
  <ldesign-button slot="trigger">可交互浮层</ldesign-button>
</ldesign-popup>
```

如果你希望 hover 离开触发器后立刻关闭，可设置 `interactive="false"` 或将 `hide-delay` 设为 `0`。

## 右键（contextmenu）触发

通过 `trigger="contextmenu"` 可以用鼠标右键打开弹出层。

<div class="demo-container">
  <ldesign-popup trigger="contextmenu" content="右键打开，点击外部或 Esc 关闭">
    <div slot="trigger" style="padding:8px 12px;border:1px dashed #ccc;display:inline-block;">在此处右键试试</div>
  </ldesign-popup>
</div>

```html
<ldesign-popup trigger="contextmenu" content="右键打开，点击外部或 Esc 关闭">
  <div slot="trigger" style="padding:8px 12px;border:1px dashed #ccc;display:inline-block;">在此处右键试试</div>
</ldesign-popup>
```

## 主题（浅色/深色）

Popup 支持内置的浅色（默认）与深色主题，通过 `theme` 设置。

<div class="demo-container">
  <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
    <ldesign-popup content="Light" placement="top">
      <ldesign-button slot="trigger">Light</ldesign-button>
    </ldesign-popup>
    <ldesign-popup content="Dark" placement="top" theme="dark">
      <ldesign-button slot="trigger">Dark</ldesign-button>
    </ldesign-popup>
  </div>
</div>

```html
<ldesign-popup content="Light" placement="top">
  <ldesign-button slot="trigger">Light</ldesign-button>
</ldesign-popup>

<ldesign-popup content="Dark" placement="top" theme="dark">
  <ldesign-button slot="trigger">Dark</ldesign-button>
</ldesign-popup>
```

## 手动控制显示（manual）

通过 `trigger="manual"` 与 `visible` 属性，可以完全由代码控制显示/隐藏。

<div class="demo-container">
  <ldesign-button id="btn-open" style="margin-right: 8px;">打开</ldesign-button>
  <ldesign-button id="btn-close" type="outline">关闭</ldesign-button>
  <ldesign-popup id="popup-manual" trigger="manual" content="由代码控制的弹出层">
    <ldesign-button slot="trigger">手动控制</ldesign-button>
  </ldesign-popup>
</div>

<script setup>
import { onMounted, onUnmounted } from 'vue'

let eventListeners = []

function addEventListenerSafe(el, evt, handler) {
  if (el) {
    el.addEventListener(evt, handler)
    eventListeners.push({ el, evt, handler })
  }
}

function cleanup() {
  eventListeners.forEach(({ el, evt, handler }) => el.removeEventListener(evt, handler))
  eventListeners = []
}

onMounted(() => {
  cleanup()
  const popup = document.getElementById('popup-manual')
  const openBtn = document.getElementById('btn-open')
  const closeBtn = document.getElementById('btn-close')

  if (openBtn && popup) addEventListenerSafe(openBtn, 'click', () => { popup.visible = true })
  if (closeBtn && popup) addEventListenerSafe(closeBtn, 'click', () => { popup.visible = false })
})

onUnmounted(() => cleanup())
</script>

```html
<ldesign-popup id="popup-manual" trigger="manual" content="由代码控制的弹出层">
  <ldesign-button slot="trigger">手动控制</ldesign-button>
</ldesign-popup>

<script>
  const p = document.getElementById('popup-manual');
  document.getElementById('btn-open').onclick = () => p.visible = true;
  document.getElementById('btn-close').onclick = () => p.visible = false;
</script>
```

## 键盘与外部点击关闭

- 按下 Esc 会关闭弹出层（`close-on-esc`，默认开启）
- 点击浮层外会关闭（`close-on-outside`，默认开启）

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

## 滚动时保持位置

当点击打开弹层后，有时希望滚动页面时弹层仍固定在打开时的视口位置，不随触发元素移动。可开启：

<div class="demo-container">
  <ldesign-popup trigger="click" lock-on-scroll content="滚动页面时我不会跟随触发元素移动">
    <ldesign-button slot="trigger">点击后滚动页面</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup trigger="click" lock-on-scroll content="滚动页面时我不会跟随触发元素移动">
  <ldesign-button slot="trigger">点击后滚动页面</ldesign-button>
</ldesign-popup>
```

> 说明：开启后仅禁用“滚动导致的自动重定位”，仍会在窗口尺寸变化/元素尺寸变化时保持正确位置。

## 样式变量（全局 Token）

Popup 与 Modal / Drawer 共享 Overlay 令牌中的层级控制，默认使用：

- `--ld-overlay-z-index`：浮层层级（内容容器 z-index）

组件同时支持“减少动态效果”系统偏好（`@media (prefers-reduced-motion: reduce)`），在该模式下会禁用过渡与动画，避免眩晕。

示例（全局覆写）：

```css
:root {
  /* 调整所有浮层的层级，确保在特定布局中位于更上层 */
  --ld-overlay-z-index: 1200;
}
```

更多可覆盖项与说明，参见“设计 / Tokens”文档。

## API

### 属性

||| 属性名 | 类型 | 默认值 | 说明 |
|||--------|------|--------|------|
||| `visible` | `boolean` | `false` | 是否显示弹出层 |
||| `placement` | `PopupPlacement` | `'bottom'` | 弹出位置 |
||| `trigger` | `'hover' \| 'click' \| 'focus' \| 'manual' \| 'contextmenu'` | `'hover'` | 触发方式 |
||| `interactive` | `boolean` | `true` | hover 触发时，鼠标移入弹出层是否保持打开 |
||| `close-on-outside` | `boolean` | `true` | 是否点击浮层外关闭（常用于 click 触发） |
||| `close-on-esc` | `boolean` | `true` | 是否支持 Esc 键关闭 |
||| `content` | `string` | - | 弹出层内容 |
||| `popup-title` | `string` | - | 弹出层标题 |
||| `offset-distance` | `number` | `8` | 与触发元素的距离；当 `arrow=true` 时表示“到箭头尖端”的距离，`arrow=false` 时表示“到弹层边缘”的距离 |
||| `disabled` | `boolean` | `false` | 是否禁用 |
||| `arrow` | `boolean` | `true` | 是否显示箭头 |
||| `lock-on-scroll` | `boolean` | `false` | 滚动时锁定位置（不随滚动重新定位） |
||| `width` | `number \\| string` | - | 弹出层宽度 |
||| `max-width` | `number \| string` | - | 最大宽度 |
||| `theme` | `'light' \| 'dark'` | `'light'` | 主题风格（浅色/深色） |
||| `show-delay` | `number` | `0` | 延迟显示时间（毫秒） |
||| `hide-delay` | `number` | `0` | 延迟隐藏时间（毫秒） |

### 事件

|| 事件名 | 说明 | 回调参数 |
||--------|------|----------|
|| `ldesignVisibleChange` | 显示状态变化时触发 | `(visible: boolean)` |

### 插槽

|| 插槽名 | 说明 |
||--------|------|
|| `trigger` | 触发器内容 |
|| `default` | 弹出层内容（当未设置 content 属性时使用） |

### 方法

|| 方法名 | 说明 | 参数 |
||--------|------|------|
|| `show()` | 显示弹出层 | - |
|| `hide()` | 隐藏弹出层 | - |
|| `toggle()` | 切换显示状态 | - |

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
