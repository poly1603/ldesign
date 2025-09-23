# Notification 通知提醒

用于页面角落的全局通知，常用于系统级提示。支持标题、描述、操作按钮和自动关闭。

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

function openNotification({ type = 'info', title, description, duration = 4500, closable = true, showIcon = true, placement = 'top-right' } = {}) {
  const el = document.createElement('ldesign-notification')
  el.type = type
  if (title) el.notificationTitle = title
  if (description) el.description = description
  el.duration = duration
  el.closable = closable
  el.showIcon = showIcon
  el.placement = placement
  document.body.appendChild(el)
  return el
}

onMounted(() => {
  cleanup()
  // 基础用法
  addListener(document.getElementById('ntf-info'), 'click', () => openNotification({ type: 'info', title: '通知', description: '这是一条信息通知。' }))
  addListener(document.getElementById('ntf-success'), 'click', () => openNotification({ type: 'success', title: '操作成功', description: '您的操作已成功完成。' }))
  addListener(document.getElementById('ntf-warning'), 'click', () => openNotification({ type: 'warning', title: '警告', description: '请注意当前操作可能带来风险。' }))
  addListener(document.getElementById('ntf-error'), 'click', () => openNotification({ type: 'error', title: '错误', description: '操作失败，请重试或联系管理员。' }))

  // 位置
  addListener(document.getElementById('ntf-top-left'), 'click', () => openNotification({ placement: 'top-left', title: '左上角', description: '出现在左上角' }))
  addListener(document.getElementById('ntf-top-right'), 'click', () => openNotification({ placement: 'top-right', title: '右上角', description: '出现在右上角' }))
  addListener(document.getElementById('ntf-bottom-right'), 'click', () => openNotification({ placement: 'bottom-right', title: '右下角', description: '出现在右下角' }))
  addListener(document.getElementById('ntf-bottom-left'), 'click', () => openNotification({ placement: 'bottom-left', title: '左下角', description: '出现在左下角' }))

  // 可关闭 & 时长
  addListener(document.getElementById('ntf-closable'), 'click', () => openNotification({ title: '手动关闭', description: '这条通知可以手动关闭', closable: true, duration: 0 }))
  addListener(document.getElementById('ntf-duration-short'), 'click', () => openNotification({ title: '1 秒关闭', description: '1 秒后自动关闭', duration: 1000 }))
  addListener(document.getElementById('ntf-duration-long'), 'click', () => openNotification({ title: '5 秒关闭', description: '5 秒后自动关闭', duration: 5000 }))

  // 带操作
  addListener(document.getElementById('ntf-actions'), 'click', () => {
    const n = openNotification({ title: '网络异常', description: '请求超时，请检查网络连接。', type: 'warning' })
    // 添加操作按钮
    const btn = document.createElement('ldesign-button')
    btn.setAttribute('type', 'primary')
    btn.textContent = '重试'
    btn.addEventListener('click', () => {
      n.close()
      openNotification({ type: 'info', title: '已重试', description: '正在重新发起请求…' })
    })
    btn.slot = 'actions'
    n.appendChild(btn)
  })
})

onUnmounted(() => cleanup())
</script>

## 基础用法

点击按钮在页面右上角显示通知。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="ntf-info">Info</ldesign-button>
    <ldesign-button id="ntf-success" type="primary">Success</ldesign-button>
    <ldesign-button id="ntf-warning" type="outline">Warning</ldesign-button>
    <ldesign-button id="ntf-error" type="danger">Error</ldesign-button>
  </div>
</div>

```html
<script>
function openNotification({ type = 'info', title, description, duration = 4500, closable = true, placement = 'top-right' } = {}) {
  const el = document.createElement('ldesign-notification')
  el.type = type
  el.notificationTitle = title
  el.description = description
  el.duration = duration
  el.closable = closable
  el.placement = placement
  document.body.appendChild(el)
  return el
}
</script>
```

## 四个方向

通过 `placement` 控制显示位置：`top-right`（默认）、`top-left`、`bottom-right`、`bottom-left`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="ntf-top-left">左上角</ldesign-button>
    <ldesign-button id="ntf-top-right">右上角</ldesign-button>
    <ldesign-button id="ntf-bottom-right">右下角</ldesign-button>
    <ldesign-button id="ntf-bottom-left">左下角</ldesign-button>
  </div>
</div>

## 可关闭与时长

- `closable` 显示关闭按钮。
- `duration` 控制自动关闭时间（毫秒），设为 0 不自动关闭。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="ntf-closable" type="secondary">可手动关闭</ldesign-button>
    <ldesign-button id="ntf-duration-short">1 秒自动关闭</ldesign-button>
    <ldesign-button id="ntf-duration-long">5 秒自动关闭</ldesign-button>
  </div>
</div>

## 带操作区

通过 `actions` 插槽放置按钮等交互元素。

```html
<ldesign-notification notification-title="网络异常" description="请求超时，请检查网络连接。">
  <ldesign-button type="primary" slot="actions">重试</ldesign-button>
</ldesign-notification>
```

## 无障碍

- 默认设置 `role="alert"` 与 `aria-live="polite"`，确保读屏器能及时播报。
- 键盘可聚焦关闭按钮，按下回车即可关闭。

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `type` | `'info' | 'success' | 'warning' | 'error'` | `'info'` | 通知类型 |
| `notificationTitle` | `string` | - | 标题文本 |
| `description` | `string` | - | 描述文本（也可用默认 slot） |
| `duration` | `number` | `4500` | 自动关闭时长（毫秒），`0` 表示不自动关闭 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `showIcon` | `boolean` | `true` | 是否显示图标 |
| `pauseOnHover` | `boolean` | `true` | 鼠标悬浮时是否暂停倒计时 |
| `placement` | `'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'` | `'top-right'` | 出现位置 |

### 方法

| 方法名 | 说明 | 签名 |
|---|---|---|
| `close()` | 手动关闭通知 | `() => Promise<void>` |

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignClose` | 关闭后触发 | `() => void` |

### 插槽

| 插槽名 | 说明 |
|---|---|
| 默认 | 描述区域自定义内容 |
| `actions` | 操作区（放置按钮等） |
