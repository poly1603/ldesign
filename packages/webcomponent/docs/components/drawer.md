# Drawer 抽屉

抽屉用于在不打断当前流程的情况下，承载并展示额外内容（如导航、表单、详情等）。

## 基础用法

通过设置 `visible` 属性控制抽屉显示与隐藏。可以结合按钮事件来切换。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-basic">打开抽屉</button>
  </div>

  <ldesign-drawer id="drawer-basic" title="基础抽屉">
    <p>这里是抽屉的内容区域。可放置表单、文本、列表等。</p>
  </ldesign-drawer>
</div>

```html
<button id="open-drawer-basic">打开抽屉</button>

<ldesign-drawer id="drawer-basic" drawer-title="基础抽屉">
  <p>这里是抽屉的内容区域。可放置表单、文本、列表等。</p>
</ldesign-drawer>

<script>
  const openBtn = document.getElementById('open-drawer-basic')
  const drawer = document.getElementById('drawer-basic')
  openBtn.addEventListener('click', () => {
    drawer.setAttribute('visible', '') // 设置可见
  })
  drawer.addEventListener('ldesignClose', () => {
    console.log('抽屉关闭')
  })
</script>
```


## 位置 placement

通过 `placement` 指定抽屉出现的位置，支持 `left`、`right`、`top`、`bottom`。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-left">左侧</button>
    <button id="open-drawer-right">右侧</button>
    <button id="open-drawer-top">顶部</button>
    <button id="open-drawer-bottom">底部</button>
  </div>

  <ldesign-drawer id="drawer-left" placement="left" title="左侧抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-right" placement="right" title="右侧抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-top" placement="top" title="顶部抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-bottom" placement="bottom" title="底部抽屉"></ldesign-drawer>
</div>

```html
<button id="open-drawer-left">左侧</button>
<button id="open-drawer-right">右侧</button>
<button id="open-drawer-top">顶部</button>
<button id="open-drawer-bottom">底部</button>

<ldesign-drawer id="drawer-left" placement="left" drawer-title="左侧抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-right" placement="right" drawer-title="右侧抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-top" placement="top" drawer-title="顶部抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-bottom" placement="bottom" drawer-title="底部抽屉"></ldesign-drawer>

<script>
  const ids = ['left', 'right', 'top', 'bottom']
  ids.forEach((pos) => {
    const btn = document.getElementById(`open-drawer-${pos}`)
    const el = document.getElementById(`drawer-${pos}`)
    btn.addEventListener('click', () => el.setAttribute('visible', ''))
  })
</script>
```


## 尺寸 size

通过 `size` 属性设置抽屉面板的尺寸：
- 当 `placement` 为 `left`/`right` 时，`size` 表示宽度
- 当 `placement` 为 `top`/`bottom` 时，`size` 表示高度

支持数字（单位 px）或任意 CSS 长度（如 `50%`、`30rem`）。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-wide">宽 600px</button>
    <button id="open-drawer-half">宽 50%</button>
  </div>

  <ldesign-drawer id="drawer-wide" placement="right" size="600" title="600px 宽抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-half" placement="right" size="50%" title="50% 宽抽屉"></ldesign-drawer>
</div>

```html
<button id="open-drawer-wide">宽 600px</button>
<button id="open-drawer-half">宽 50%</button>

<ldesign-drawer id="drawer-wide" placement="right" size="600" drawer-title="600px 宽抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-half" placement="right" size="50%" drawer-title="50% 宽抽屉"></ldesign-drawer>

<script>
  document.getElementById('open-drawer-wide').addEventListener('click', () => {
    document.getElementById('drawer-wide').setAttribute('visible', '')
  })
  document.getElementById('open-drawer-half').addEventListener('click', () => {
    document.getElementById('drawer-half').setAttribute('visible', '')
  })
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const pairs = [
    ['open-drawer-basic', 'drawer-basic'],
    ['open-drawer-left', 'drawer-left'],
    ['open-drawer-right', 'drawer-right'],
    ['open-drawer-top', 'drawer-top'],
    ['open-drawer-bottom', 'drawer-bottom'],
    ['open-drawer-wide', 'drawer-wide'],
    ['open-drawer-half', 'drawer-half'],
  ]

  pairs.forEach(([btnId, elId]) => {
    const btn = document.getElementById(btnId)
    const el = document.getElementById(elId)
    if (btn && el) {
      btn.addEventListener('click', () => el.setAttribute('visible', ''))
    }
  })
})
</script>

## 遮罩与关闭

- 通过 `mask` 控制是否显示遮罩层（默认显示）
- 通过 `maskClosable` 控制是否允许点击遮罩关闭（默认允许）
- 通过 `closeOnEsc` 控制是否允许 ESC 键关闭（默认允许）
- 通过 `closable` 控制是否显示右上角关闭按钮（默认显示）

```html
<ldesign-drawer
  title="自定义关闭行为"
  :mask="false"
  :mask-closable="false"
  :close-on-esc="false"
  :closable="false"
></ldesign-drawer>
```

## 自定义头部与底部

- 通过 `slot="header"` 自定义头部内容
- 通过 `slot="footer"` 自定义底部内容

```html
<ldesign-drawer visible>
  <div slot="header">
    <strong>自定义标题</strong>
  </div>
  <div>主体内容</div>
  <div slot="footer">
    <ldesign-button type="primary">确定</ldesign-button>
  </div>
</ldesign-drawer>
```

## 事件

- `ldesignVisibleChange`: 抽屉显示状态变化时触发，回调参数为 `boolean`
- `ldesignClose`: 调用关闭行为时触发

```html
<ldesign-drawer id="drawer-events" drawer-title="事件示例"></ldesign-drawer>

<script>
  const el = document.getElementById('drawer-events')
  el.addEventListener('ldesignVisibleChange', (e) => {
    console.log('visible:', e.detail)
  })
  el.addEventListener('ldesignClose', () => {
    console.log('closed')
  })
</script>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `visible` | `boolean` | `false` | 是否显示抽屉 |
| `placement` | `'left' | 'right' | 'top' | 'bottom'` | `'right'` | 抽屉出现位置 |
| `size` | `number | string` | `360` | 面板尺寸：left/right 对应宽度，top/bottom 对应高度；数字为 px |
| `mask` | `boolean` | `true` | 是否显示遮罩层 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `closeOnEsc` | `boolean` | `true` | 是否允许 ESC 关闭 |
| `closable` | `boolean` | `true` | 是否显示右上角关闭按钮 |
| `drawerTitle` | `string` | `-` | 标题文本（可用 header 插槽自定义） |
| `zIndex` | `number` | `1000` | 层级 |

### 事件

| 事件名 | 说明 | 回调参数 |
|------|------|------|
| `ldesignVisibleChange` | 抽屉显示状态变化 | `(visible: boolean)` |
| `ldesignClose` | 关闭时触发 | `()` |
