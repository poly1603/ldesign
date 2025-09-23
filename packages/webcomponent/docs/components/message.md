# Message 全局提示

用于页面操作反馈的轻量级提示，常用于顶部居中的信息展示，数秒后自动消失。

<script setup>
import { onMounted, onUnmounted } from 'vue'

let listeners = []

function addListener(el, event, handler) {
  if (el) {
    el.addEventListener(event, handler)
    listeners.push({ el, event, handler })
  }
}

function cleanup() {
  listeners.forEach(({ el, event, handler }) => el.removeEventListener(event, handler))
  listeners = []
}

function openMessage({ type = 'info', message, duration = 3000, closable = false, showIcon = true, placement = 'top' } = {}) {
  const el = document.createElement('ldesign-message')
  el.type = type
  el.duration = duration
  el.message = message
  el.closable = closable
  el.showIcon = showIcon
  el.placement = placement
  document.body.appendChild(el)
  return el
}

onMounted(() => {
  cleanup()
  // 基础用法
  addListener(document.getElementById('msg-info'), 'click', () => openMessage({ type: 'info', message: '这是一条普通消息' }))
  addListener(document.getElementById('msg-success'), 'click', () => openMessage({ type: 'success', message: '操作成功！' }))
  addListener(document.getElementById('msg-warning'), 'click', () => openMessage({ type: 'warning', message: '请注意当前操作' }))
  addListener(document.getElementById('msg-error'), 'click', () => openMessage({ type: 'error', message: '操作失败，请重试' }))

  // 可关闭
  addListener(document.getElementById('msg-closable'), 'click', () => openMessage({ type: 'info', message: '这条消息可以手动关闭', closable: true, duration: 0 }))

  // 时长与位置
  addListener(document.getElementById('msg-duration-short'), 'click', () => openMessage({ message: '1 秒后关闭', duration: 1000 }))
  addListener(document.getElementById('msg-duration-long'), 'click', () => openMessage({ message: '5 秒后关闭', duration: 5000 }))
  addListener(document.getElementById('msg-bottom'), 'click', () => openMessage({ message: '出现在底部', placement: 'bottom' }))

  // 无图标
  addListener(document.getElementById('msg-no-icon'), 'click', () => openMessage({ message: '纯文本消息', showIcon: false }))
})

onUnmounted(() => cleanup())
</script>

## 基础用法

点击按钮在页面顶部居中显示一条消息。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="msg-info">Info</ldesign-button>
    <ldesign-button id="msg-success" type="primary">Success</ldesign-button>
    <ldesign-button id="msg-warning" type="outline">Warning</ldesign-button>
    <ldesign-button id="msg-error" type="danger">Error</ldesign-button>
  </div>
</div>

```html
<!-- 通过脚本动态创建（示例） -->
<ldesign-button id="msg-info">Info</ldesign-button>
<ldesign-button id="msg-success" type="primary">Success</ldesign-button>
<ldesign-button id="msg-warning" type="outline">Warning</ldesign-button>
<ldesign-button id="msg-error" type="danger">Error</ldesign-button>

<script>
function openMessage({ type = 'info', message, duration = 3000, closable = false }) {
  const el = document.createElement('ldesign-message')
  el.type = type
  el.duration = duration
  el.message = message
  el.closable = closable
  document.body.appendChild(el)
  return el
}
</script>
```

## 可关闭

设置 `closable` 显示关闭按钮。

<div class="demo-container">
  <ldesign-button id="msg-closable" type="secondary">可关闭消息</ldesign-button>
</div>

```html
<ldesign-button id="msg-closable" type="secondary">可关闭消息</ldesign-button>
<script>
openMessage({ type: 'info', message: '这条消息可以手动关闭', closable: true, duration: 0 })
</script>
```

## 自定义时长与位置

- `duration` 控制自动关闭时间（毫秒），设为 0 不自动关闭。
- `placement` 支持 `top`（默认）与 `bottom`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="msg-duration-short">1 秒自动关闭</ldesign-button>
    <ldesign-button id="msg-duration-long">5 秒自动关闭</ldesign-button>
    <ldesign-button id="msg-bottom">底部提示</ldesign-button>
  </div>
</div>

```html
<ldesign-button id="msg-duration-short">1 秒自动关闭</ldesign-button>
<ldesign-button id="msg-duration-long">5 秒自动关闭</ldesign-button>
<ldesign-button id="msg-bottom">底部提示</ldesign-button>
```

## 隐藏图标

通过 `showIcon=false` 隐藏图标。

<div class="demo-container">
  <ldesign-button id="msg-no-icon">无图标消息</ldesign-button>
</div>

```html
<ldesign-button id="msg-no-icon">无图标消息</ldesign-button>
```

## 无障碍

- 默认设置 `role="alert"` 与 `aria-live="polite"`，确保读屏器能及时播报。
- 键盘可聚焦关闭按钮，按下回车即可关闭。

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | 提示类型 |
| `duration` | `number` | `3000` | 自动关闭时长（毫秒），`0` 表示不自动关闭 |
| `closable` | `boolean` | `false` | 是否显示关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否显示图标 |
| `message` | `string` | - | 简单文本内容（也可用 slot） |
| `pauseOnHover` | `boolean` | `true` | 鼠标悬浮时是否暂停倒计时 |
| `placement` | `'top' \| 'bottom'` | `'top'` | 出现位置 |

### 方法

| 方法名 | 说明 | 签名 |
|---|---|---|
| `close()` | 手动关闭消息 | `() => Promise<void>` |

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignClose` | 关闭后触发 | `() => void` |

### 样式变量

| 变量名 | 默认值 | 说明 |
|---|---|---|
| `--ls-border-radius-base` | `6px` | 圆角 |
| `--ldesign-border-color` | `#e5e5e5` | 边框色 |
| `--ldesign-shadow-1` | `0 1px 10px rgba(0,0,0,5%)` | 阴影 |
| `--ldesign-brand-color` | - | 信息色（info）左侧色条 |
| `--ldesign-success-color` | - | 成功色左侧色条 |
| `--ldesign-warning-color` | - | 警告色左侧色条 |
| `--ldesign-error-color` | - | 失败色左侧色条 |
