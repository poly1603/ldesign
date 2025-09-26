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
    ['open-drawer-in-container', 'drawer-in-container'],
    ['open-drawer-level1', 'drawer-level1'],
    ['open-drawer-level2', 'drawer-level2'],
  ]

  pairs.forEach(([btnId, elId]) => {
    const btn = document.getElementById(btnId)
    const el = document.getElementById(elId)
    if (btn && el) {
      const handler = () => el.setAttribute('visible', '')
      btn.addEventListener('click', handler)
      // 兼容 ldesign-button 触发的自定义点击事件
      btn.addEventListener('ldesignClick', handler)
    }
  })

  // 确保容器模式在运行时生效：直接设置元素属性为 HTMLElement
  const container = document.getElementById('drawer-demo-container');
  const drawerInContainer = document.getElementById('drawer-in-container');
  if (container && drawerInContainer) {
    if (window.customElements && window.customElements.whenDefined) {
      window.customElements.whenDefined('ldesign-drawer').then(() => {
        // 组件升级完成后再设置，保证被内部 Watch 到
        drawerInContainer.getContainer = container;
      });
    } else {
      drawerInContainer.getContainer = container;
    }
  }
})
</script>

## 在指定容器中打开

<style scoped>
.drawer-container-box {
  position: relative;
  width: 520px;
  height: 280px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
</style>

通过 `getContainer` 属性可以将抽屉挂载到指定的容器元素内。建议为容器设置 `position: relative`，以便抽屉使用绝对定位正确铺满容器。

<div class="demo-container">
  <div class="drawer-container-box" id="drawer-demo-container">
    <span>容器区域（在这里打开抽屉）</span>
  </div>

  <div class="demo-row">
    <button id="open-drawer-in-container">在容器中打开抽屉</button>
  </div>

  <ldesign-drawer
    id="drawer-in-container"
    drawer-title="容器内抽屉"
    placement="right"
    get-container="#drawer-demo-container"
  >
    <p>此抽屉挂载在指定容器内，遮罩与面板均限定在容器区域内。</p>
  </ldesign-drawer>
</div>

```html
<div id="drawer-demo-container" style="position: relative; width: 520px; height: 280px; border: 1px dashed #d1d5db;"></div>

<button id="open-drawer-in-container">在容器中打开抽屉</button>

<ldesign-drawer
  id="drawer-in-container"
  drawer-title="容器内抽屉"
  get-container="#drawer-demo-container"
>
  <p>此抽屉挂载在指定容器内，遮罩与面板均限定在容器区域内。</p>
</ldesign-drawer>

<script>
  document.getElementById('open-drawer-in-container').addEventListener('click', () => {
    document.getElementById('drawer-in-container').setAttribute('visible', '')
  })
</script>
```

## 多层抽屉

多层抽屉默认按打开顺序自动叠加层级，仅栈顶抽屉响应 ESC 与遮罩点击关闭。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-level1">打开一级抽屉</button>
  </div>

  <ldesign-drawer id="drawer-level1" drawer-title="一级抽屉" placement="right">
    <p>这是一级抽屉内容。</p>

    <div class="demo-row">
      <ldesign-button id="open-drawer-level2" type="primary">打开二级抽屉</ldesign-button>
    </div>
  </ldesign-drawer>

  <ldesign-drawer id="drawer-level2" drawer-title="二级抽屉" placement="right">
    <p>这是二级抽屉内容。</p>
  </ldesign-drawer>
</div>

```html
<button id="open-drawer-level1">打开一级抽屉</button>

<ldesign-drawer id="drawer-level1" drawer-title="一级抽屉">
  <p>这是一级抽屉内容。</p>
  <ldesign-button id="open-drawer-level2" type="primary">打开二级抽屉</ldesign-button>
</ldesign-drawer>

<ldesign-drawer id="drawer-level2" drawer-title="二级抽屉">
  <p>这是二级抽屉内容。</p>
</ldesign-drawer>

<script>
  document.getElementById('open-drawer-level1').addEventListener('click', () => {
    document.getElementById('drawer-level1').setAttribute('visible', '')
  })
  document.getElementById('open-drawer-level2').addEventListener('click', () => {
    document.getElementById('drawer-level2').setAttribute('visible', '')
  })
</script>
```

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

## 样式变量（全局 Token）

Drawer 与 Modal / Popup 共享 Overlay 令牌，用于统一浮层体验：

- `--ld-overlay-z-index`：浮层层级（所有遮罩/浮层统一）
- `--ld-overlay-backdrop`：遮罩背景色（含透明度）
- `--ld-overlay-duration`、`--ld-overlay-ease`：遮罩与面板动效时长/缓动

系统开启“减少动态效果”时，会自动禁用相关过渡与动画（`@media (prefers-reduced-motion: reduce)`）。

示例（全局覆写）：

```css
:root {
  --ld-overlay-backdrop: rgba(0, 0, 0, 0.5);
  --ld-overlay-duration: 250ms;
  --ld-overlay-ease: cubic-bezier(.2,.8,.2,1);
}
```

更多可覆盖项与说明，参见“设计 / Tokens”文档。

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
