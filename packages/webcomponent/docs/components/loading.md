# Loading 加载

用于展示页面/区域的加载状态，提供 spinner 与 dots 两种形态，支持不同尺寸与说明文字。

## 基础用法

<ldesign-loading></ldesign-loading>

```html
<ldesign-loading></ldesign-loading>
```

## 带文字提示

<ldesign-loading tip="加载中..."></ldesign-loading>

```html
<ldesign-loading tip="加载中..."></ldesign-loading>
```

## 插入自定义内容（默认插槽）

<ldesign-loading>
  <div style="font-size:12px; color: var(--ldesign-text-color-secondary)">正在加载数据，请稍候…</div>
</ldesign-loading>

```html
<ldesign-loading>
  <div>正在加载数据，请稍候…</div>
</ldesign-loading>
```

## 尺寸

<div class="demo-container">
  <div class="demo-row">
    <ldesign-loading size="small" tip="small" />
    <ldesign-loading size="medium" tip="medium" />
    <ldesign-loading size="large" tip="large" />
  </div>
</div>

```html
<ldesign-loading size="small" tip="small" />
<ldesign-loading size="medium" tip="medium" />
<ldesign-loading size="large" tip="large" />
```

## 形态：spinner 与 dots

<div class="demo-container">
  <div class="demo-row">
    <ldesign-loading type="spinner" tip="spinner" />
    <ldesign-loading type="dots" tip="dots" />
  </div>
</div>

```html
<ldesign-loading type="spinner" tip="spinner" />
<ldesign-loading type="dots" tip="dots" />
```

## 垂直布局

<ldesign-loading vertical tip="加载中"></ldesign-loading>

```html
<ldesign-loading vertical tip="加载中"></ldesign-loading>
```

## 受控开关

通过 `spinning` 控制显示/隐藏。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="loading-toggle" type="primary">切换加载</ldesign-button>
    <ldesign-loading id="loading-demo" tip="加载中..." />
  </div>
</div>

```html
<ldesign-button id="loading-toggle" type="primary">切换加载</ldesign-button>
<ldesign-loading id="loading-demo" tip="加载中..." />

<script>
const btn = document.getElementById('loading-toggle')
const ld = document.getElementById('loading-demo')
btn.addEventListener('click', () => {
  ld.spinning = !ld.spinning
})
</script>
```

## 全屏 Loading（可选遮罩与锁定滚动）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="open-fs" type="primary">打开全屏 Loading</ldesign-button>
    <ldesign-button id="close-fs" type="secondary">关闭</ldesign-button>
  </div>
</div>

```html
<ldesign-button id="open-fs" type="primary">打开全屏 Loading</ldesign-button>
<ldesign-button id="close-fs" type="secondary">关闭</ldesign-button>

<script>
const openBtn = document.getElementById('open-fs')
const closeBtn = document.getElementById('close-fs')
let fs
openBtn.addEventListener('ldesignClick', () => {
  // 打开后 3 秒自动关闭
  setTimeout(() => {
    if (fs) {
      fs.remove()
      fs = null
    }
  }, 3000)
  if (!fs) {
    fs = document.createElement('ldesign-loading')
    fs.fullscreen = true
    fs.mask = true
    fs.tip = '全屏加载中...'
    fs.spinning = true
    document.body.appendChild(fs)
  } else {
    fs.spinning = true
  }
})
closeBtn.addEventListener('ldesignClick', () => {
  if (fs) {
    fs.remove() // 移除时会自动解除滚动锁
    fs = null
  }
})
</script>
```

<script setup>
import { onMounted, onUnmounted } from 'vue'
let openH, closeH, fs, toggleH
onMounted(() => {
  // 受控开关示例绑定
  const toggleBtn = document.getElementById('loading-toggle')
  const ld = document.getElementById('loading-demo')
  toggleH = () => { if (ld) ld.spinning = !ld.spinning }
  toggleBtn && toggleBtn.addEventListener('click', toggleH)
  const openBtn = document.getElementById('open-fs')
  const closeBtn = document.getElementById('close-fs')
  openH = () => {
    // 打开后 3 秒自动关闭
    setTimeout(() => {
      if (fs) { fs.remove(); fs = null }
    }, 3000)
    if (!fs) {
      fs = document.createElement('ldesign-loading')
      fs.fullscreen = true
      fs.mask = true
      fs.tip = '全屏加载中...'
      fs.spinning = true
      document.body.appendChild(fs)
    } else {
      fs.spinning = true
    }
  }
  closeH = () => {
    if (fs) {
      fs.remove() // 移除时会自动解除滚动锁
      fs = null
    }
  }
  openBtn && openBtn.addEventListener('ldesignClick', openH)
  // 打开后 3 秒自动关闭
  //（同代码块演示保持一致）
  closeBtn && closeBtn.addEventListener('ldesignClick', closeH)
})
onUnmounted(() => {
  const openBtn = document.getElementById('open-fs')
  const closeBtn = document.getElementById('close-fs')
  openBtn && openH && openBtn.removeEventListener('ldesignClick', openH)
  // 移除受控开关绑定
  const toggleBtn = document.getElementById('loading-toggle')
  toggleBtn && toggleH && toggleBtn.removeEventListener('click', toggleH)
  closeBtn && closeH && closeBtn.removeEventListener('ldesignClick', closeH)
  if (fs) { fs.remove(); fs = null }
})
</script>

## 无障碍

- 组件带有 `role="status"` 与 `aria-live="polite"`，读屏器可播报状态变化
- 未设置 `tip` 时，会渲染屏幕阅读器可见的隐藏文本（“Loading”）

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `spinning` | `boolean` | `true` | 是否处于加载中 |
| `type` | `'spinner' \| 'dots'` | `'spinner'` | 指示器形态 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `tip` | `string` | `-` | 说明文字 |
| `vertical` | `boolean` | `false` | 是否垂直布局 |
| `fullscreen` | `boolean` | `false` | 全屏显示（覆盖整个视口） |
| `mask` | `boolean` | `true` | 全屏时是否显示半透明遮罩背景 |
| `zIndex` | `number` | `-` | 全屏时的层级（默认 1000，可通过此属性或 CSS 变量覆盖） |
| `lockScroll` | `boolean` | `true` | 全屏并显示时是否锁定页面滚动 |
