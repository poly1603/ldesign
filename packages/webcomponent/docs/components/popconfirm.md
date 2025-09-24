# Popconfirm 气泡确认框

用于在操作前进行二次确认，常用于删除、危险操作等场景。基于 Popup 封装，支持多种触发方式与主题。

## 基础用法

<div class="demo-container">
  <ldesign-popconfirm popconfirm-title="确定删除该条记录吗？" description="删除后不可恢复">
    <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
  </ldesign-popconfirm>
</div>

```html
<ldesign-popconfirm popconfirm-title="确定删除该条记录吗？" description="删除后不可恢复">
  <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
</ldesign-popconfirm>
```

## 自定义内容与按钮

<div class="demo-container">
  <ldesign-popconfirm popconfirm-title="发布到线上？" icon="send" ok-text="发布" cancel-text="稍后">
    <ldesign-button slot="trigger" type="primary">发布</ldesign-button>
  </ldesign-popconfirm>
</div>

```html
<ldesign-popconfirm popconfirm-title="发布到线上？" icon="send" ok-text="发布" cancel-text="稍后">
  <ldesign-button slot="trigger" type="primary">发布</ldesign-button>
</ldesign-popconfirm>
```

## 触发方式

支持 `click`、`hover`、`focus`、`contextmenu` 与 `manual`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-popconfirm popconfirm-title="确定？" trigger="click">
      <ldesign-button slot="trigger">点击</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="确定？" trigger="hover">
      <ldesign-button slot="trigger">悬停</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="确定？" trigger="focus">
      <ldesign-button slot="trigger">聚焦</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="确定？" trigger="contextmenu">
      <div slot="trigger" style="padding:8px 12px;border:1px dashed #ccc;display:inline-block;">右键这里</div>
    </ldesign-popconfirm>
  </div>
</div>

```html
<ldesign-popconfirm popconfirm-title="确定？" trigger="click">
  <ldesign-button slot="trigger">点击</ldesign-button>
</ldesign-popconfirm>
```

## 受控显示（manual）

<div class="demo-container">
  <ldesign-button id="pc-open" style="margin-right:8px;">打开</ldesign-button>
  <ldesign-button id="pc-close" type="outline">关闭</ldesign-button>
  <ldesign-popconfirm id="pc-manual" trigger="manual" popconfirm-title="危险操作">
    <ldesign-button slot="trigger">受控触发器</ldesign-button>
    操作会带来不可逆影响，是否继续？
  </ldesign-popconfirm>
</div>

<script setup>
import { onMounted, onUnmounted } from 'vue'
let listeners = []
function bind(el, evt, fn){ if(el){ el.addEventListener(evt, fn); listeners.push(()=>el.removeEventListener(evt, fn))}}
onMounted(()=>{
  listeners.forEach(off=>off()); listeners=[]
  const p = document.getElementById('pc-manual')
  bind(document.getElementById('pc-open'), 'click', ()=> p.visible = true)
  bind(document.getElementById('pc-close'), 'click', ()=> p.visible = false)
})
onUnmounted(()=>{ listeners.forEach(off=>off()) })
</script>

```html
<ldesign-popconfirm id="pc" trigger="manual" visible popconfirm-title="危险操作">
  <ldesign-button slot="trigger">打开</ldesign-button>
  操作会带来不可逆影响，是否继续？
</ldesign-popconfirm>
<script>
  const pc = document.getElementById('pc');
  pc.addEventListener('ldesignConfirm', () => pc.visible = false)
  pc.addEventListener('ldesignCancel', () => pc.visible = false)
</script>
```

## 位置与主题

<div class="demo-container">
  <div class="demo-row">
    <ldesign-popconfirm popconfirm-title="确定？" placement="top">
      <ldesign-button slot="trigger">Top</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="确定？" placement="right" theme="dark">
      <ldesign-button slot="trigger">Right Dark</ldesign-button>
    </ldesign-popconfirm>
  </div>
</div>

## 事件

```html
<ldesign-popconfirm id="pc-evt" popconfirm-title="确定删除？">
  <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
</ldesign-popconfirm>
<script>
  const inst = document.getElementById('pc-evt');
  inst.addEventListener('ldesignConfirm', () => console.log('confirm'))
  inst.addEventListener('ldesignCancel', () => console.log('cancel'))
  inst.addEventListener('ldesignVisibleChange', (e) => console.log('visible:', e.detail))
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| popconfirm-title | 标题（也可用 slot="title" 覆盖） | `string` | `确定要执行该操作吗？` |
| description | 描述文案（默认插槽也可覆盖） | `string` | - |
| placement | 出现位置（同 Popup） | `'top' \| 'top-start' \| 'top-end' \| 'right' ...` | `'top'` |
| trigger | 触发方式 | `'click' \| 'hover' \| 'manual' \| 'focus' \| 'contextmenu'` | `'click'` |
| theme | 主题 | `'light' \| 'dark'` | `'light'` |
| arrow | 是否显示箭头 | `boolean` | `true` |
| visible | 受控可见（仅 manual 时生效） | `boolean` | `false` |
| close-on-outside | 点击外部是否关闭 | `boolean` | `true` |
| show-delay | 显示延迟（毫秒） | `number` | `0` |
| hide-delay | 隐藏延迟（毫秒） | `number` | `0` |
| ok-text | 确认按钮文案 | `string` | `确定` |
| cancel-text | 取消按钮文案 | `string` | `取消` |
| ok-type | 确认按钮类型 | `'primary' \| 'secondary' \| 'outline' \| 'text' \| 'danger'` | `'primary'` |
| icon | 左侧图标 | `string` | `help-circle` |

### Events

| 事件 | 说明 | 回调参数 |
|---|---|---|
| ldesignConfirm | 点击确定触发 | `()` |
| ldesignCancel | 点击取消触发 | `()` |
| ldesignVisibleChange | 可见性变化（转发自 Popup） | `(visible: boolean)` |

### Slots

| 插槽 | 说明 |
|---|---|
| trigger | 触发器内容 |
| title | 自定义标题 |
| default | 自定义描述内容 |
| icon | 自定义左侧图标 |
