# Button 按钮

按钮用于开始一个即时操作。

## 何时使用

标记了一个（或封装一组）操作命令，响应用户点击行为，触发相应的业务逻辑。

在 Ldesign 中我们提供了五种按钮。

- 主按钮：用于主行动点，一个操作区域只能有一个主按钮。
- 默认按钮：用于没有主次之分的一组行动点。
- 虚线按钮：常用于添加操作。
- 文本按钮：用于最次级的行动点。
- 链接按钮：一般用于链接，即导航至某位置。

以及四种状态属性与上面配合使用。

- 危险：删除/移动/修改权限等危险操作，一般需要二次确认。
- 幽灵：用于背景色比较复杂的地方，常用在首页/产品页等展示场景。
- 禁用：行动点不可用的时候，一般需要文案解释。
- 加载中：用于异步操作等待反馈的时候，也可以避免多次提交。

## 代码演示

### 按钮类型

按钮有五种类型：主按钮、次按钮、虚线按钮、文本按钮和链接按钮。主按钮在同一个操作区域最多出现一次。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Primary Button</ldesign-button>
    <ldesign-button>Default Button</ldesign-button>
    <ldesign-button type="dashed">Dashed Button</ldesign-button>
    <ldesign-button type="text">Text Button</ldesign-button>
    <ldesign-button type="link">Link Button</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary">Primary Button</ldesign-button>
<ldesign-button>Default Button</ldesign-button>
<ldesign-button type="dashed">Dashed Button</ldesign-button>
<ldesign-button type="text">Text Button</ldesign-button>
<ldesign-button type="link">Link Button</ldesign-button>
```

### 颜色与变体

通过设置 `variant` 和 `color` 来使用不同的按钮样式。当设置 `variant` 与 `color` 时优先级高于 `type`。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">Solid 变体：</span>
    <ldesign-button variant="solid" color="primary">Primary</ldesign-button>
    <ldesign-button variant="solid" color="danger">Danger</ldesign-button>
    <ldesign-button variant="solid" color="green">Success</ldesign-button>
    <ldesign-button variant="solid" color="orange">Warning</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">Outlined 变体：</span>
    <ldesign-button variant="outlined" color="default">Default</ldesign-button>
    <ldesign-button variant="outlined" color="primary">Primary</ldesign-button>
    <ldesign-button variant="outlined" color="danger">Danger</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">Dashed 变体：</span>
    <ldesign-button variant="dashed" color="default">Default</ldesign-button>
    <ldesign-button variant="dashed" color="primary">Primary</ldesign-button>
    <ldesign-button variant="dashed" color="danger">Danger</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">Filled 变体：</span>
    <ldesign-button variant="filled" color="default">Default</ldesign-button>
    <ldesign-button variant="filled" color="primary">Primary</ldesign-button>
    <ldesign-button variant="filled" color="danger">Danger</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">Text 变体：</span>
    <ldesign-button variant="text" color="default">Default</ldesign-button>
    <ldesign-button variant="text" color="primary">Primary</ldesign-button>
    <ldesign-button variant="text" color="danger">Danger</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">Link 变体：</span>
    <ldesign-button variant="link" color="default">Default</ldesign-button>
    <ldesign-button variant="link" color="primary">Primary</ldesign-button>
    <ldesign-button variant="link" color="danger">Danger</ldesign-button>
  </div>
</div>

#### 预设颜色

支持 Ant Design 的 13 种预设颜色：

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">实心按钮：</span>
    <ldesign-button variant="solid" color="blue">Blue</ldesign-button>
    <ldesign-button variant="solid" color="purple">Purple</ldesign-button>
    <ldesign-button variant="solid" color="cyan">Cyan</ldesign-button>
    <ldesign-button variant="solid" color="green">Green</ldesign-button>
    <ldesign-button variant="solid" color="magenta">Magenta</ldesign-button>
    <ldesign-button variant="solid" color="pink">Pink</ldesign-button>
    <ldesign-button variant="solid" color="red">Red</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">更多颜色：</span>
    <ldesign-button variant="solid" color="orange">Orange</ldesign-button>
    <ldesign-button variant="solid" color="yellow">Yellow</ldesign-button>
    <ldesign-button variant="solid" color="volcano">Volcano</ldesign-button>
    <ldesign-button variant="solid" color="geekblue">Geekblue</ldesign-button>
    <ldesign-button variant="solid" color="lime">Lime</ldesign-button>
    <ldesign-button variant="solid" color="gold">Gold</ldesign-button>
  </div>
</div>

```html
<!-- Solid 变体 -->
<ldesign-button variant="solid" color="primary">Primary</ldesign-button>
<ldesign-button variant="solid" color="danger">Danger</ldesign-button>

<!-- Outlined 变体 -->
<ldesign-button variant="outlined" color="primary">Primary</ldesign-button>
<ldesign-button variant="outlined" color="danger">Danger</ldesign-button>

<!-- Filled 变体 -->
<ldesign-button variant="filled" color="primary">Primary</ldesign-button>

<!-- Text 变体 -->
<ldesign-button variant="text" color="primary">Primary</ldesign-button>
```

### 按钮图标

当需要在 `Button` 内嵌入 `Icon` 时，可以设置 `icon` 属性，或者直接在 `Button` 内使用 `Icon` 组件。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" shape="circle" icon="search"></ldesign-button>
    <ldesign-button type="primary" icon="search">Search</ldesign-button>
    <ldesign-button shape="circle" icon="search"></ldesign-button>
    <ldesign-button icon="search">Search</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" icon="cloud">左侧图标</ldesign-button>
    <ldesign-button type="primary" icon="arrow-right" icon-position="end">右侧图标</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" shape="circle" icon="search"></ldesign-button>
<ldesign-button type="primary" icon="search">Search</ldesign-button>
<ldesign-button type="primary" icon="cloud">左侧图标</ldesign-button>
<ldesign-button type="primary" icon="arrow-right" icon-position="end">右侧图标</ldesign-button>
```

### 按钮尺寸

按钮有大、中、小三种尺寸。

通过设置 `size` 为 `large` `small` 分别把按钮设为大、小尺寸。若不设置 `size`，则尺寸为中。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" size="large">Large</ldesign-button>
    <ldesign-button type="primary">Middle</ldesign-button>
    <ldesign-button type="primary" size="small">Small</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" size="large" shape="round">Large</ldesign-button>
    <ldesign-button type="primary" shape="round">Middle</ldesign-button>
    <ldesign-button type="primary" size="small" shape="round">Small</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" size="large" icon="download">Download</ldesign-button>
    <ldesign-button type="primary" icon="download">Download</ldesign-button>
    <ldesign-button type="primary" size="small" icon="download">Download</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" size="large">Large</ldesign-button>
<ldesign-button type="primary">Middle</ldesign-button>
<ldesign-button type="primary" size="small">Small</ldesign-button>
```

### 不可用状态

添加 `disabled` 属性即可让按钮处于不可用状态，同时按钮样式也会改变。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button type="primary" disabled>Primary(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button>Default</ldesign-button>
    <ldesign-button disabled>Default(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="dashed">Dashed</ldesign-button>
    <ldesign-button type="dashed" disabled>Dashed(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="text">Text</ldesign-button>
    <ldesign-button type="text" disabled>Text(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="link">Link</ldesign-button>
    <ldesign-button type="link" disabled>Link(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button danger>Danger Default</ldesign-button>
    <ldesign-button danger disabled>Danger Default(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" danger>Danger Primary</ldesign-button>
    <ldesign-button type="primary" danger disabled>Danger Primary(disabled)</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="text" danger>Danger Text</ldesign-button>
    <ldesign-button type="text" danger disabled>Danger Text(disabled)</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" disabled>Primary(disabled)</ldesign-button>
<ldesign-button disabled>Default(disabled)</ldesign-button>
```

### 加载中状态

添加 `loading` 属性即可让按钮处于加载状态，最后两个按钮演示点击后进入加载状态。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" loading>Loading</ldesign-button>
    <ldesign-button type="primary" size="small" loading>Loading</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" loading>Click me!</ldesign-button>
    <ldesign-button type="primary" icon="power-off" loading>Click me!</ldesign-button>
    <ldesign-button type="primary" loading loading-icon="loader">自定义图标</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" loading>Loading</ldesign-button>
<ldesign-button type="primary" icon="power-off" loading>Click me!</ldesign-button>
```

### 多个按钮组合

按钮组合使用时，推荐使用 1 个主操作 + n 个次操作，3 个以上操作时把更多操作放到下拉菜单中组合使用。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button>secondary</ldesign-button>
    <ldesign-button type="dashed">Dashed</ldesign-button>
  </div>
</div>

### 幽灵按钮

幽灵按钮将按钮的内容反色，背景变为透明，常用在有色背景上。

<div class="demo-container" style="background: rgb(190, 200, 200); padding: 16px;">
  <div class="demo-row">
    <ldesign-button type="primary" ghost>Primary</ldesign-button>
    <ldesign-button ghost>Default</ldesign-button>
    <ldesign-button type="dashed" ghost>Dashed</ldesign-button>
    <ldesign-button type="primary" danger ghost>Danger</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" ghost>Primary</ldesign-button>
<ldesign-button ghost>Default</ldesign-button>
<ldesign-button type="dashed" ghost>Dashed</ldesign-button>
<ldesign-button type="primary" danger ghost>Danger</ldesign-button>
```

### 危险按钮

在这四种按钮之外，我们还需要一种危险按钮。通过设置 `danger` 属性即可。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" danger>Primary</ldesign-button>
    <ldesign-button danger>Default</ldesign-button>
    <ldesign-button type="dashed" danger>Dashed</ldesign-button>
    <ldesign-button type="text" danger>Text</ldesign-button>
    <ldesign-button type="link" danger>Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" danger>Primary</ldesign-button>
<ldesign-button danger>Default</ldesign-button>
<ldesign-button type="dashed" danger>Dashed</ldesign-button>
<ldesign-button type="text" danger>Text</ldesign-button>
<ldesign-button type="link" danger>Link</ldesign-button>
```

### Block 按钮

`block` 属性将使按钮适合其父宽度。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" block>Primary</ldesign-button>
    <ldesign-button block>Default</ldesign-button>
    <ldesign-button type="dashed" block>Dashed</ldesign-button>
    <ldesign-button danger block>Danger</ldesign-button>
    <ldesign-button type="link" block>Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" block>Primary</ldesign-button>
<ldesign-button block>Default</ldesign-button>
```

### 渐变按钮

自定义为渐变背景按钮。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="gradient">Gradient</ldesign-button>
    <ldesign-button type="gradient" shape="round">Round Gradient</ldesign-button>
    <ldesign-button type="gradient" shape="circle" icon="star"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="gradient">Gradient</ldesign-button>
<ldesign-button type="gradient" shape="round">Round Gradient</ldesign-button>
```

## API

通用属性参考：[通用属性](#)

通过设置 Button 的属性来产生不同的按钮样式，推荐顺序为：`type` -> `shape` -> `size` -> `loading` -> `disabled`。

按钮的属性说明如下：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
|------|------|------|--------|------|
| autoInsertSpace | 我们默认提供两个汉字之间的空格，可以设置为 `false` 关闭 | boolean | true | 5.17.0 |
| block | 将按钮宽度调整为其父宽度的选项 | boolean | false | |
| color | 设置按钮的颜色 | `default` \| `primary` \| `danger` \| PresetColors | - | 5.21.0 |
| danger | 设置危险按钮 | boolean | false | |
| disabled | 设置按钮失效状态 | boolean | false | |
| ghost | 幽灵属性，使按钮背景透明 | boolean | false | |
| href | 点击跳转的地址，指定此属性 button 的行为和 a 链接一致 | string | - | |
| htmlType | 设置 `button` 原生的 `type` 值，可选值请参考 HTML 标准 | `submit` \| `reset` \| `button` | `button` | |
| icon | 设置按钮的图标组件 | string | - | |
| iconPosition | 设置按钮图标组件的位置 | `start` \| `end` | `start` | 5.17.0 |
| loading | 设置按钮载入状态 | boolean | false | |
| loadingDelay | 加载延迟时间（毫秒） | number | - | |
| loadingIcon | 自定义加载图标 | string | - | |
| shape | 设置按钮形状 | `default` \| `circle` \| `round` | `default` | |
| size | 设置按钮大小 | `large` \| `middle` \| `small` | `middle` | |
| target | 相当于 a 链接的 target 属性，href 存在时生效 | string | - | |
| type | 设置按钮类型 | `primary` \| `dashed` \| `link` \| `text` \| `default` | `default` | |
| variant | 设置按钮的变体 | `outlined` \| `dashed` \| `solid` \| `filled` \| `text` \| `link` | - | 5.21.0 |
| onClick | 点击按钮时的回调 | (event: MouseEvent) => void | - | |

支持原生 button 的其他所有属性。

### PresetColors

```typescript
type PresetColors = 
  | 'blue' 
  | 'purple' 
  | 'cyan' 
  | 'green' 
  | 'magenta' 
  | 'pink' 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'volcano' 
  | 'geekblue' 
  | 'lime' 
  | 'gold';
```

## 主题变量（Design Token）

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| --ld-color-primary | #1677ff | 主色 |
| --ld-color-primary-hover | #4096ff | 主色悬停态 |
| --ld-color-primary-active | #0958d9 | 主色激活态 |
| --ld-color-error | #ff4d4f | 错误色 |
| --ld-color-error-hover | #ff7875 | 错误色悬停态 |
| --ld-color-error-active | #d9363e | 错误色激活态 |

## FAQ

### 如何选择类型和颜色与变体？

- **语法糖方式（推荐新手）**：使用 `type` 和 `danger` 的组合
  - `type="primary"` - 主按钮
  - `type="default"` - 默认按钮
  - `danger` - 危险按钮

- **精确控制（推荐进阶）**：使用 `variant` 和 `color` 的组合
  - `variant="solid" color="primary"` - 实心主色按钮
  - `variant="outlined" color="danger"` - 描边危险按钮
  - `variant="text" color="primary"` - 文本主色按钮

### 如何关闭点击波纹效果？

设置 `ripple` 属性为 `false`：

```html
<ldesign-button ripple="false">No Ripple</ldesign-button>
```

## 设计指引

- 一个页面中应仅有一个主要按钮（Primary）
- 破坏性操作使用 Danger，且必要时配合确认
- 使用图标需确保含义明确，避免仅图标无文本的可用性问题
- 圆形/方形图标按钮建议添加 `aria-label` 以提升可访问性