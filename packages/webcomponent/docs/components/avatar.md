# Avatar 头像

在不同场景中展示用户或对象的头像。支持图片、图标与字符三种类型，提供尺寸、形状、徽标、组合与响应式等能力。

## 代码演示

### 基本

头像有三种尺寸、两种形状可选。

<div class="demo-container" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
  <div style="display:flex;gap:12px;align-items:center;">
    <ldesign-avatar size="large" src="https://i.pravatar.cc/120?img=1"></ldesign-avatar>
    <ldesign-avatar size="medium" src="https://i.pravatar.cc/100?img=2"></ldesign-avatar>
    <ldesign-avatar size="small" src="https://i.pravatar.cc/80?img=3"></ldesign-avatar>
  </div>
  <div style="display:flex;gap:12px;align-items:center;">
    <ldesign-avatar shape="square" size="large" src="https://i.pravatar.cc/120?img=4"></ldesign-avatar>
    <ldesign-avatar shape="square" size="medium" src="https://i.pravatar.cc/100?img=5"></ldesign-avatar>
    <ldesign-avatar shape="square" size="small" src="https://i.pravatar.cc/80?img=6"></ldesign-avatar>
  </div>
</div>

```html
<ldesign-avatar size="large" src="..."></ldesign-avatar>
<ldesign-avatar size="medium" src="..."></ldesign-avatar>
<ldesign-avatar size="small" src="..."></ldesign-avatar>

<ldesign-avatar shape="square" size="large" src="..."></ldesign-avatar>
```

### 类型

支持三种类型：图片、图标、字符。其中图标和字符支持自定义前景色与背景色。

<div class="demo-container" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
  <ldesign-avatar src="https://i.pravatar.cc/100?img=7"></ldesign-avatar>
  <ldesign-avatar icon="user" background="#efefef" color="#666"></ldesign-avatar>
  <ldesign-avatar text="USER" background="#1677ff"></ldesign-avatar>
  <ldesign-avatar text="U" background="#fa8c16"></ldesign-avatar>
  <ldesign-avatar text="K" background="#ff7875"></ldesign-avatar>
</div>

```html
<ldesign-avatar src="/path/to/avatar.jpg"></ldesign-avatar>
<ldesign-avatar icon="user" background="#efefef" color="#666"></ldesign-avatar>
<ldesign-avatar text="USER" background="#1677ff"></ldesign-avatar>
```

### 带徽标的头像

用于提醒或消息数量提示。

<div class="demo-container" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
  <ldesign-avatar icon="user" badge></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=8" badge></ldesign-avatar>
  <ldesign-avatar text="U" background="#722ed1" badge-value="1"></ldesign-avatar>
</div>

```html
<ldesign-avatar icon="user" badge></ldesign-avatar>
<ldesign-avatar src="..." badge></ldesign-avatar>
<ldesign-avatar text="U" badge-value="1"></ldesign-avatar>
```

### 自动调整字符大小

对于字符型的头像，当字符串较长时，字体大小会根据头像宽度自动调整。也可使用 `gap` 来设置字符串左右边界单位像素。

<div class="demo-container" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
  <ldesign-avatar id="avatar-auto-text" text="U" background="#fa8c16"></ldesign-avatar>
  <ldesign-button id="avatar-change-user">ChangeUser</ldesign-button>
  <ldesign-button id="avatar-change-gap">changeGap</ldesign-button>
</div>

```html
<ldesign-avatar id="avatar-auto-text" text="U" background="#fa8c16"></ldesign-avatar>
<ldesign-button id="avatar-change-user">ChangeUser</ldesign-button>
<ldesign-button id="avatar-change-gap">changeGap</ldesign-button>

<script>
  const el = document.getElementById('avatar-auto-text')
  const users = ['U','USER','K','KAREN','KAREN KING']
  let i = 0
  document.getElementById('avatar-change-user').addEventListener('click', () => {
    i = (i + 1) % users.length
    el.text = users[i]
  })
  document.getElementById('avatar-change-gap').addEventListener('click', () => {
    el.gap = (el.gap || 4) + 2
    if (el.gap > 12) el.gap = 2
  })
</script>
```

### Avatar.Group

头像组合展现。支持叠加间距与最大显示数量，超出部分以 `+N` 的方式折叠。

<div class="demo-container" style="display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap;">
  <ldesign-avatar-group size="small" gap="8">
    <ldesign-avatar src="https://i.pravatar.cc/100?img=11"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=12"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=13"></ldesign-avatar>
    <ldesign-avatar text="K" background="#ffb199"></ldesign-avatar>
    <ldesign-avatar text="U" background="#87e8de"></ldesign-avatar>
  </ldesign-avatar-group>

  <ldesign-avatar-group max="3" size="small" gap="10">
    <ldesign-avatar src="https://i.pravatar.cc/100?img=17"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=18"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=19"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=20"></ldesign-avatar>
    <ldesign-avatar src="https://i.pravatar.cc/100?img=21"></ldesign-avatar>
  </ldesign-avatar-group>
</div>

```html
<ldesign-avatar-group size="small" gap="8">
  <ldesign-avatar src="..."></ldesign-avatar>
  <ldesign-avatar text="K" background="#ffb199"></ldesign-avatar>
</ldesign-avatar-group>

<ldesign-avatar-group max="3" size="small" gap="10">
  <ldesign-avatar src="..."></ldesign-avatar>
  ...
</ldesign-avatar-group>
```

### 响应式尺寸

头像大小可以根据屏幕大小自动调整。

<div class="demo-container" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
  <ldesign-avatar responsive responsive-min="32" responsive-mid="12vw" responsive-max="72" icon="user"></ldesign-avatar>
</div>

```html
<ldesign-avatar responsive responsive-min="32" responsive-mid="12vw" responsive-max="72" icon="user"></ldesign-avatar>
```

## API

### ldesign-avatar

- 类型：图片优先级最高，其次为 `icon`，最后为 `text`/插槽文本

属性：

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| `src` | 图片地址 | `string` | - |
| `srcset` | 响应式图片 srcset | `string` | - |
| `sizes` | 响应式图片 sizes | `string` | - |
| `fit` | 图片 object-fit | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` |
| `alt` | 替代文本 | `string` | - |
| `icon` | 图标名（Lucide） | `string` | - |
| `text` | 字符串内容 | `string` | - |
| `gap` | 文本左右间距（px） | `number` | `4` |
| `autosize` | 文本是否自动缩放 | `boolean` | `true` |
| `size` | 头像尺寸 | `'small'\|'middle'\|'medium'\|'large'\|number` | `'medium'` |
| `shape` | 形状 | `'circle'\|'square'` | `'circle'` |
| `color` | 前景色 | `string` | - |
| `background` | 背景色 | `string` | - |
| `badge` | 是否显示红点 | `boolean` | `false` |
| `badge-value` | 徽标数字（优先） | `string \| number` | - |
| `badge-color` | 徽标颜色 | `string` | `#ff4d4f` |
| `responsive` | 是否响应式尺寸 | `boolean` | `false` |
| `responsive-min` | clamp 最小像素 | `number` | `28` |
| `responsive-mid` | clamp 中间表达式 | `string` | `10vw` |
| `responsive-max` | clamp 最大像素 | `number` | `64` |

事件：

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignLoad` | 图片加载成功 | `{ width:number; height:number; src:string }` |
| `ldesignError` | 图片加载失败 | `{ src?:string; error:string }` |
| `ldesignClick` | 点击 | `MouseEvent` |

### ldesign-avatar-group

属性：

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| `max` | 最大显示数，超出折叠为 +N | `number` | `-` |
| `size` | 统一子项尺寸（子项未显式指定时生效） | `'small'\|'middle'\|'medium'\|'large'\|number` | `-` |
| `shape` | 统一子项形状（子项未显式指定时生效） | `'circle'\|'square'` | `-` |
| `gap` | 重叠间距（正值，px） | `number` | `8` |
| `border-color` | 叠加描边颜色 | `string` | `#fff` |

使用建议：
- 为了获得清晰的叠加边界，Group 内部通过 box-shadow 模拟描边，可根据背景调整 `border-color`。
- 如果子项数量会变动，请确保在 DOM 更新后 Group 会自动计算并隐藏超出项。
