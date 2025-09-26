# Alert 警告信息

用于在页面中展示重要的操作提示或状态说明。支持四种类型、标题/描述、可关闭与操作区等能力。

## 基础用法

通过 `type` 指定不同语义：`info`、`success`、`warning`、`error`。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success">Success Text</ldesign-alert>
    <ldesign-alert type="info">Informational Notes</ldesign-alert>
    <ldesign-alert type="warning">Warning Text</ldesign-alert>
    <ldesign-alert type="error">Error Text</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="success">Success Text</ldesign-alert>
<ldesign-alert type="info">Informational Notes</ldesign-alert>
<ldesign-alert type="warning">Warning Text</ldesign-alert>
<ldesign-alert type="error">Error Text</ldesign-alert>
```

## 标题与描述

使用 `alertTitle` 指定标题；描述内容可直接放在默认插槽（或使用 `description` 属性）。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success" alert-title="Success Tips">Detailed description and advice about successful copywriting.</ldesign-alert>
    <ldesign-alert type="info" alert-title="Informational Notes">Additional description and information about copywriting.</ldesign-alert>
    <ldesign-alert type="warning" alert-title="Warning">This is a warning notice about copywriting.</ldesign-alert>
    <ldesign-alert type="error" alert-title="Error">This is an error message about copywriting.</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="success" alert-title="Success Tips">Detailed description...</ldesign-alert>
<ldesign-alert type="info" alert-title="Informational Notes">Additional description...</ldesign-alert>
<ldesign-alert type="warning" alert-title="Warning">This is a warning notice...</ldesign-alert>
<ldesign-alert type="error" alert-title="Error">This is an error message...</ldesign-alert>
```

## 可关闭

设置 `closable` 显示关闭按钮，调用内置过渡将平滑收起。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="error" alert-title="Error Text" closable>
      Error Description Error Description Error Description Error Description Error Description
    </ldesign-alert>
    <ldesign-alert type="error" alert-title="Error Text" closable>
      Error Description Error Description Error Description Error Description Error Description
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="error" alert-title="Error Text" closable>
  Error Description Error Description Error Description
</ldesign-alert>
```

## 隐藏图标

通过 `showIcon=false` 关闭左侧图标。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="warning" show-icon="false" alert-title="Warning Text">Warning Text Warning Text Warning Text</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="warning" show-icon="false" alert-title="Warning Text">Warning Text...</ldesign-alert>
```

## 带操作区

通过 `actions` 插槽放置操作按钮。

<div class="demo-container">
  <ldesign-alert type="info" alert-title="Info Text">
    Info Description Info Description Info Description
    <div slot="actions">
      <ldesign-button type="primary" size="small">Accept</ldesign-button>
      <ldesign-button size="small">Decline</ldesign-button>
    </div>
  </ldesign-alert>
</div>

```html
<ldesign-alert type="info" alert-title="Info Text">
  Info Description...
  <div slot="actions">
    <ldesign-button type="primary" size="small">Accept</ldesign-button>
    <ldesign-button size="small">Decline</ldesign-button>
  </div>
</ldesign-alert>
```

## 轮播公告（Marquee）

用于页面顶部的滚动公告。开启 `marquee` 后会自动无缝滚动，默认向左移动，支持悬停暂停。

<div class="demo-container">
  <ldesign-alert type="warning" banner marquee alert-title="轮播的公告">
    React components, or just some text. I can be a React component, multiple components, or just some text.
  </ldesign-alert>
</div>

```html
<ldesign-alert type="warning" banner marquee alert-title="轮播的公告">
  这是一条可以循环滚动的公告文本……
</ldesign-alert>
```

### 可配置项
- `marqueeSpeed`：滚动速度（px/s），默认 60
- `marqueePauseOnHover`：悬停是否暂停，默认 true
- `marqueeDirection`：`left | right`，默认 left
- `marqueeGap`：两段文本间距（px），默认 24

## 横幅 Banner

在页面顶部显示一条横幅提示，使用 `banner` 属性即可。

<div class="demo-container">
  <ldesign-alert type="success" banner>Success Tips</ldesign-alert>
</div>

```html
<ldesign-alert type="success" banner>Success Tips</ldesign-alert>
```

## 无障碍

- 组件默认包含 `role="alert"` 与 `aria-live="polite"`，读屏器可以及时播报。
- 关闭按钮可聚焦，键盘回车可关闭。

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' | 'success' | 'warning' | 'error'` | `'info'` | 警告类型 |
| `alertTitle` | `string` | - | 标题文本 |
| `description` | `string` | - | 描述文本（也可使用默认 slot） |
| `closable` | `boolean` | `false` | 是否显示关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否显示左侧图标 |
| `banner` | `boolean` | `false` | 横幅样式（占据整行、无圆角） |

### 方法

| 方法名 | 说明 | 签名 |
|---|---|---|
| `close()` | 手动关闭并触发收起动画 | `() => Promise<void>` |

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignClose` | 关闭后触发 | `() => void` |
