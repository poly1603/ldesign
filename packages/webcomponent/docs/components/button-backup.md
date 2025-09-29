# Button 按钮

对齐 Ant Design v5 的按钮体系：提供 default/primary/dashed/link/text 五种主要形态，支持 danger、ghost、size、shape、icon 等能力；并保留 Gradient 作为扩展样式。

## 基础类型（Types）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="default">Default</ldesign-button>
    <ldesign-button type="primary">Primary</ldesign-button>
    <ldesign-button type="dashed">Dashed</ldesign-button>
    <ldesign-button type="text">Text</ldesign-button>
    <ldesign-button type="link">Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="default">Default</ldesign-button>
<ldesign-button type="primary">Primary</ldesign-button>
<ldesign-button type="dashed">Dashed</ldesign-button>
<ldesign-button type="text">Text</ldesign-button>
<ldesign-button type="link">Link</ldesign-button>
```

## 危险态（Danger）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="default" danger>Default</ldesign-button>
    <ldesign-button type="primary" danger>Primary</ldesign-button>
    <ldesign-button type="dashed" danger>Dashed</ldesign-button>
    <ldesign-button type="text" danger>Text</ldesign-button>
    <ldesign-button type="link" danger>Link</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="default" danger>Default</ldesign-button>
<ldesign-button type="primary" danger>Primary</ldesign-button>
<ldesign-button type="dashed" danger>Dashed</ldesign-button>
<ldesign-button type="text" danger>Text</ldesign-button>
<ldesign-button type="link" danger>Link</ldesign-button>
```

## 幽灵（Ghost）

适合深色背景：

<div class="demo-container" style="background:#121212;padding:16px;border-radius:8px;">
  <div class="demo-row">
    <ldesign-button type="default" ghost>Ghost</ldesign-button>
    <ldesign-button type="primary" ghost>Ghost</ldesign-button>
    <ldesign-button type="dashed" ghost>Ghost</ldesign-button>
    <ldesign-button type="default" ghost danger>Danger Ghost</ldesign-button>
  </div>
</div>

```html
<div style="background:#121212;padding:16px;border-radius:8px;">
  <ldesign-button type="default" ghost>Ghost</ldesign-button>
  <ldesign-button type="primary" ghost>Ghost</ldesign-button>
  <ldesign-button type="dashed" ghost>Ghost</ldesign-button>
  <ldesign-button type="default" ghost danger>Danger Ghost</ldesign-button>
</div>
```

## 尺寸与形状（Size & Shape）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" size="small">Small</ldesign-button>
    <ldesign-button type="primary" size="middle">Middle</ldesign-button>
    <ldesign-button type="primary" size="large">Large</ldesign-button>
  </div>
  <div class="demo-row">
    <ldesign-button type="primary" shape="default">Default</ldesign-button>
    <ldesign-button type="primary" shape="round">Round</ldesign-button>
    <ldesign-button type="primary" shape="circle" icon="heart" aria-label="喜欢"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" size="small">Small</ldesign-button>
<ldesign-button type="primary" size="middle">Middle</ldesign-button>
<ldesign-button type="primary" size="large">Large</ldesign-button>

<ldesign-button type="primary" shape="default">Default</ldesign-button>
<ldesign-button type="primary" shape="round">Round</ldesign-button>
<ldesign-button type="primary" shape="circle" icon="heart" aria-label="喜欢"></ldesign-button>
```

## 图标与位置（Icon）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" icon="download">下载</ldesign-button>
    <ldesign-button type="default" icon="search">搜索</ldesign-button>
    <ldesign-button type="text" icon="heart">收藏</ldesign-button>
    <ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" icon="download">下载</ldesign-button>
<ldesign-button type="default" icon="search">搜索</ldesign-button>
<ldesign-button type="text" icon="heart">收藏</ldesign-button>
<ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
```

## 状态（Loading & Disabled）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" loading>加载中</ldesign-button>
    <ldesign-button type="default" disabled>禁用</ldesign-button>
    <ldesign-button type="dashed" disabled>禁用</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" loading>加载中</ldesign-button>
<ldesign-button type="default" disabled>禁用</ldesign-button>
<ldesign-button type="dashed" disabled>禁用</ldesign-button>
```

## 原生类型与块级（HtmlType & Block）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" html-type="submit">提交</ldesign-button>
    <ldesign-button type="default" html-type="reset">重置</ldesign-button>
  </div>
  <ldesign-button type="primary" block style="margin-top: 12px;">块级按钮</ldesign-button>
</div>

```html
<form>
  <ldesign-button type="primary" html-type="submit">提交</ldesign-button>
  <ldesign-button type="default" html-type="reset">重置</ldesign-button>
</form>
<ldesign-button type="primary" block>块级按钮</ldesign-button>
```

## 扩展：渐变（Gradient）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="gradient">Gradient</ldesign-button>
    <ldesign-button type="gradient" shape="round">Round</ldesign-button>
    <ldesign-button type="gradient" shape="circle" icon="star" aria-label="收藏"></ldesign-button>
  </div>
</div>

```html
<ldesign-button type="gradient">Gradient</ldesign-button>
<ldesign-button type="gradient" shape="round">Round</ldesign-button>
<ldesign-button type="gradient" shape="circle" icon="star" aria-label="收藏"></ldesign-button>
```

## 图标与位置（Icon & Position）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" icon="download">下载</ldesign-button>
    <ldesign-button type="secondary" icon="search">搜索</ldesign-button>
    <ldesign-button type="outline" icon="plus">添加</ldesign-button>
    <ldesign-button type="text" icon="heart">收藏</ldesign-button>
    <ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" icon="download">下载</ldesign-button>
<ldesign-button type="secondary" icon="search">搜索</ldesign-button>
<ldesign-button type="outline" icon="plus">添加</ldesign-button>
<ldesign-button type="text" icon="heart">收藏</ldesign-button>
<ldesign-button type="primary" icon="arrow-right" icon-position="right">下一步</ldesign-button>
```

## 状态（State）

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">禁用:</span>
    <ldesign-button type="primary" disabled>Primary</ldesign-button>
    <ldesign-button type="secondary" disabled>Secondary</ldesign-button>
    <ldesign-button type="outline" disabled>Outline</ldesign-button>
    <ldesign-button type="dashed" disabled color="primary">Dashed</ldesign-button>
    <ldesign-button type="text" disabled color="default">Text</ldesign-button>
  </div>
  <div class="demo-row">
    <span class="demo-label">加载:</span>
    <ldesign-button type="primary" loading>加载中</ldesign-button>
    <ldesign-button type="secondary" loading>加载中</ldesign-button>
    <ldesign-button type="outline" loading color="primary">加载中</ldesign-button>
  </div>
</div>

```html
<ldesign-button type="primary" disabled>Primary</ldesign-button>
<ldesign-button type="secondary" disabled>Secondary</ldesign-button>
<ldesign-button type="outline" disabled>Outline</ldesign-button>
<ldesign-button type="dashed" disabled color="primary">Dashed</ldesign-button>
<ldesign-button type="text" disabled color="default">Text</ldesign-button>

<ldesign-button type="primary" loading>加载中</ldesign-button>
<ldesign-button type="secondary" loading>加载中</ldesign-button>
<ldesign-button type="outline" loading color="primary">加载中</ldesign-button>
```

## 原生类型与块级（Native & Block）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button type="primary" native-type="submit">提交</ldesign-button>
    <ldesign-button type="secondary" native-type="reset">重置</ldesign-button>
  </div>
  <ldesign-button type="primary" block style="margin-top: 12px;">块级按钮</ldesign-button>
</div>

```html
<form>
  <ldesign-button type="primary" native-type="submit">提交</ldesign-button>
  <ldesign-button type="secondary" native-type="reset">重置</ldesign-button>
</form>
<ldesign-button type="primary" block>块级按钮</ldesign-button>
```

## 事件处理

组件会触发 `ldesignClick` 事件。

<div class="demo-container">
  <ldesign-button type="primary" id="event-demo">点击我</ldesign-button>
  <p id="event-result">点击次数: 0</p>
</div>

```html
<ldesign-button type="primary" id="event-demo">点击我</ldesign-button>
<script>
let count = 0
const btn = document.getElementById('event-demo')
btn.addEventListener('ldesignClick', () => {
  count++
  console.log(`按钮被点击了 ${count} 次`)
})
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  let count = 0
  const button = document.getElementById('event-demo')
  const result = document.getElementById('event-result')
  if (button && result) {
    button.addEventListener('ldesignClick', () => {
      count++
      result.textContent = `点击次数: ${count}`
    })
  }
})
</script>

## API

### 属性（Props）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `type` | `'default' \| 'primary' \| 'dashed' \| 'link' \| 'text' \| 'gradient'` | `'default'` | 按钮类型（外观）。`gradient` 为扩展样式 |
| `danger` | `boolean` | `false` | 危险态（红色语义），可与 `type` 组合 |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | 按钮尺寸（兼容 `medium`，不再文档展示） |
| `shape` | `'rectangle' \| 'round' \| 'circle' \| 'square'` | `'rectangle'` | 按钮形状（变形） |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否加载中（展示内置 loading 图标） |
| `icon` | `string` | - | 图标名称 |
| `icon-position` | `'left' \| 'right'` | `'left'` | 图标位置 |
| `block` | `boolean` | `false` | 是否为块级按钮 |
| `ghost` | `boolean` | `false` | 幽灵按钮（深色背景） |
| `html-type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生按钮类型（推荐）。兼容 `native-type` |

### 兼容与迁移

- `type=secondary` 等同于 `type=default`（保留兼容，后续移除）
- `type=outline` 不再推荐（保留兼容），建议使用 `type=text` 或 `type=default` 场景替代
- `type=danger` 已废弃，请改用 `danger` 布尔属性
- `size=medium` 更名为 `middle`
- `native-type` 更名为 `html-type`

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignClick` | 点击时触发 | `(event: MouseEvent)` |

### CSS 变量（部分）

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `--ls-button-height-small` | `40px` | 小按钮高度 |
| `--ls-button-height-medium` | `44px` | 中按钮高度 |
| `--ls-button-height-large` | `48px` | 大按钮高度 |
| `--ls-border-radius-base` | `6px` | 基础圆角 |
| `--ls-border-radius-xl` | `16px` | 大圆角 |

## 无障碍（A11y）

- 支持键盘操作（Enter / Space）
- `aria-disabled` 表示禁用，`aria-busy` 表示加载
- 焦点可见样式与语义色联动

## 设计建议（Guidelines）

- 页面中应仅有一个主要按钮（Primary）
- 破坏性操作使用 Danger，且必要时配合确认
- 使用图标需确保含义明确，避免仅图标无文本的可用性问题（圆形/方形图标按钮建议添加 `aria-label`）
