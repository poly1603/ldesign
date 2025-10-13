# Alert 警告信息

用于在页面中展示重要的操作提示或状态说明。支持多种类型、丰富的样式变体、尺寸、动画效果、标题/描述、可关闭与操作区等能力。

## 基础用法

通过 `type` 指定不同语义：`info`、`success`、`warning`、`error`、`custom`。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success">Success Text</ldesign-alert>
    <ldesign-alert type="info">Informational Notes</ldesign-alert>
    <ldesign-alert type="warning">Warning Text</ldesign-alert>
    <ldesign-alert type="error">Error Text</ldesign-alert>
    <ldesign-alert type="custom" color="#7334cb">Custom Color Alert</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="success">Success Text</ldesign-alert>
<ldesign-alert type="info">Informational Notes</ldesign-alert>
<ldesign-alert type="warning">Warning Text</ldesign-alert>
<ldesign-alert type="error">Error Text</ldesign-alert>
<ldesign-alert type="custom" color="#7334cb">Custom Color Alert</ldesign-alert>
```

## 样式变体

支持四种样式变体：`light`（默认）、`filled`、`outlined`、`gradient`。

### Light 变体（默认）

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success" variant="light">Light Success Alert</ldesign-alert>
    <ldesign-alert type="info" variant="light">Light Info Alert</ldesign-alert>
    <ldesign-alert type="warning" variant="light">Light Warning Alert</ldesign-alert>
    <ldesign-alert type="error" variant="light">Light Error Alert</ldesign-alert>
  </div>
</div>

### Filled 变体

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success" variant="filled">Filled Success Alert</ldesign-alert>
    <ldesign-alert type="info" variant="filled">Filled Info Alert</ldesign-alert>
    <ldesign-alert type="warning" variant="filled">Filled Warning Alert</ldesign-alert>
    <ldesign-alert type="error" variant="filled">Filled Error Alert</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="success" variant="filled">Filled Success Alert</ldesign-alert>
```

### Outlined 变体

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success" variant="outlined">Outlined Success Alert</ldesign-alert>
    <ldesign-alert type="info" variant="outlined">Outlined Info Alert</ldesign-alert>
    <ldesign-alert type="warning" variant="outlined">Outlined Warning Alert</ldesign-alert>
    <ldesign-alert type="error" variant="outlined">Outlined Error Alert</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="warning" variant="outlined">Outlined Warning Alert</ldesign-alert>
```

### Gradient 变体

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="success" variant="gradient">Gradient Success Alert</ldesign-alert>
    <ldesign-alert type="info" variant="gradient">Gradient Info Alert</ldesign-alert>
    <ldesign-alert type="warning" variant="gradient">Gradient Warning Alert</ldesign-alert>
    <ldesign-alert type="error" variant="gradient">Gradient Error Alert</ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" variant="gradient">Gradient Info Alert</ldesign-alert>
```

## 尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" size="small" alert-title="Small Alert">
      This is a small size alert with less padding and smaller font.
    </ldesign-alert>
    <ldesign-alert type="info" size="medium" alert-title="Medium Alert">
      This is the default medium size alert.
    </ldesign-alert>
    <ldesign-alert type="info" size="large" alert-title="Large Alert">
      This is a large size alert with more padding and larger font.
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" size="small">Small Size</ldesign-alert>
<ldesign-alert type="info" size="medium">Medium Size</ldesign-alert>
<ldesign-alert type="info" size="large">Large Size</ldesign-alert>
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

## 特殊效果

### 阴影效果

使用 `shadow` 属性添加阴影效果，鼠标悬停时会有浮起效果。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" shadow alert-title="Shadow Alert">
      This alert has a shadow effect and will elevate on hover.
    </ldesign-alert>
    <ldesign-alert type="success" variant="gradient" shadow alert-title="Gradient with Shadow">
      Combining gradient variant with shadow effect.
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" shadow>Shadow Alert</ldesign-alert>
```

### 动画效果

默认启用 `animated` 属性，警告会以滑入动画显示。

<div class="demo-container">
  <ldesign-alert type="success" animated alert-title="Animated Alert">
    This alert slides in with animation when it appears.
  </ldesign-alert>
</div>

```html
<ldesign-alert type="success" animated>Animated Alert</ldesign-alert>
```

### 紧凑模式

使用 `compact` 属性减少内边距和间距。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" compact>Compact mode with less padding</ldesign-alert>
    <ldesign-alert type="warning" compact alert-title="Compact Title">
      Compact mode is useful when space is limited.
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" compact>Compact Alert</ldesign-alert>
```

### 自定义图标

使用 `iconName` 属性自定义图标。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" icon-name="star" alert-title="Featured">
      Alert with custom star icon.
    </ldesign-alert>
    <ldesign-alert type="success" icon-name="heart" alert-title="Favorite">
      Alert with custom heart icon.
    </ldesign-alert>
    <ldesign-alert type="custom" color="#ff1493" icon-name="zap" alert-title="Power Alert">
      Custom colored alert with lightning icon.
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" icon-name="star">Custom Icon Alert</ldesign-alert>
```

### 自定义边框宽度

使用 `borderWidth` 属性设置边框宽度。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" variant="outlined" border-width="3">
      Alert with 3px border width
    </ldesign-alert>
    <ldesign-alert type="warning" variant="outlined" border-width="4">
      Alert with 4px border width
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" variant="outlined" border-width="3">Thick Border</ldesign-alert>
```

### 无圆角

使用 `rounded="false"` 移除圆角。

<div class="demo-container">
  <div class="demo-row" style="flex-direction:column;align-items:stretch">
    <ldesign-alert type="info" rounded="false">
      Alert without rounded corners
    </ldesign-alert>
    <ldesign-alert type="error" variant="filled" rounded="false">
      Filled alert without rounded corners
    </ldesign-alert>
  </div>
</div>

```html
<ldesign-alert type="info" rounded="false">No Rounded Corners</ldesign-alert>
```

## 横幅 Banner

在页面顶部显示一条横幅提示，使用 `banner` 属性即可。

<div class="demo-container">
  <ldesign-alert type="success" banner>Success Tips</ldesign-alert>
  <ldesign-alert type="info" variant="filled" banner>Important announcement for all users</ldesign-alert>
</div>

```html
<ldesign-alert type="success" banner>Success Tips</ldesign-alert>
<ldesign-alert type="info" variant="filled" banner>Important announcement</ldesign-alert>
```

## 无障碍

- 组件默认包含 `role="alert"` 与 `aria-live="polite"`，读屏器可以及时播报。
- 关闭按钮可聚焦，键盘回车可关闭。

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' \| 'success' \| 'warning' \| 'error' \| 'custom'` | `'info'` | 警告类型 |
| `variant` | `'light' \| 'filled' \| 'outlined' \| 'gradient'` | `'light'` | 样式变体 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸大小 |
| `alertTitle` | `string` | - | 标题文本 |
| `description` | `string` | - | 描述文本（也可使用默认 slot） |
| `closable` | `boolean` | `false` | 是否显示关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否显示左侧图标 |
| `iconName` | `string` | - | 自定义图标名称 |
| `color` | `string` | - | 自定义颜色（仅在 type 为 custom 时生效） |
| `banner` | `boolean` | `false` | 横幅样式（占据整行、无圆角） |
| `shadow` | `boolean` | `false` | 是否带有阴影效果 |
| `animated` | `boolean` | `true` | 是否启用动画效果 |
| `compact` | `boolean` | `false` | 是否为紧凑模式 |
| `rounded` | `boolean` | `true` | 是否显示圆角 |
| `borderWidth` | `number` | `1` | 边框宽度（px） |
| `marquee` | `boolean` | `false` | 是否启用滚动公告 |
| `marqueeSpeed` | `number` | `60` | 滚动速度（px/s） |
| `marqueePauseOnHover` | `boolean` | `true` | 悬停时是否暂停滚动 |
| `marqueeDirection` | `'left' \| 'right'` | `'left'` | 滚动方向 |
| `marqueeGap` | `number` | `24` | 两段文本间距（px） |

### 方法

| 方法名 | 说明 | 签名 |
|---|---|---|
| `close()` | 手动关闭并触发收起动画 | `() => Promise<void>` |

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignClose` | 关闭后触发 | `() => void` |
