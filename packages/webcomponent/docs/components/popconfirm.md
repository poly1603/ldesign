# Popconfirm 气泡确认框

用于在操作前进行二次确认，常用于删除、危险操作等场景。基于最新的 Popup 组件封装，支持动画、尺寸、加载状态等丰富特性。

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

## 不同图标类型

支持多种预设图标类型：`info`、`success`、`warning`、`error`、`question`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-popconfirm popconfirm-title="信息提示" icon="info">
      <ldesign-button slot="trigger">Info</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="操作成功" icon="success">
      <ldesign-button slot="trigger" type="success">成功</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="警告信息" icon="warning">
      <ldesign-button slot="trigger" type="warning">警告</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="危险操作" icon="error">
      <ldesign-button slot="trigger" type="danger">错误</ldesign-button>
    </ldesign-popconfirm>
  </div>
</div>

```html
<ldesign-popconfirm popconfirm-title="信息提示" icon="info">
  <ldesign-button slot="trigger">Info</ldesign-button>
</ldesign-popconfirm>
```

## 尺寸变体

提供三种预设尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-popconfirm popconfirm-title="小尺寸确认框" size="small">
      <ldesign-button slot="trigger" size="small">Small</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="中等尺寸确认框" description="这是默认的中等尺寸" size="medium">
      <ldesign-button slot="trigger">Medium</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="大尺寸确认框" description="大尺寸适合显示更多内容，可以包含详细的说明信息" size="large">
      <ldesign-button slot="trigger" size="large">Large</ldesign-button>
    </ldesign-popconfirm>
  </div>
</div>

```html
<ldesign-popconfirm popconfirm-title="小尺寸确认框" size="small">
  <ldesign-button slot="trigger" size="small">Small</ldesign-button>
</ldesign-popconfirm>
```

## 动画效果

支持三种动画类型：`fade`、`scale`（默认）、`slide`。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-popconfirm popconfirm-title="淡入淡出效果" animation="fade">
      <ldesign-button slot="trigger">Fade</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="缩放效果" animation="scale">
      <ldesign-button slot="trigger">Scale</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="滑动效果" animation="slide">
      <ldesign-button slot="trigger">Slide</ldesign-button>
    </ldesign-popconfirm>
  </div>
</div>

```html
<ldesign-popconfirm popconfirm-title="淡入淡出效果" animation="fade">
  <ldesign-button slot="trigger">Fade</ldesign-button>
</ldesign-popconfirm>
```

## 加载状态

支持确认按钮加载状态和整体加载状态。

<div class="demo-container">
  <div class="demo-row" style="display:flex; gap:16px; flex-wrap:wrap;">
    <ldesign-popconfirm 
      id="pc-loading" 
      popconfirm-title="确定删除？" 
      description="点击确定后会显示加载状态"
      trigger="click">
      <ldesign-button slot="trigger" type="danger">模拟异步删除</ldesign-button>
    </ldesign-popconfirm>
    <ldesign-popconfirm popconfirm-title="正在加载..." loading>
      <ldesign-button slot="trigger">整体加载</ldesign-button>
    </ldesign-popconfirm>
  </div>
</div>

<script>
  // 模拟异步操作
  const pcLoading = document.getElementById('pc-loading');
  if (pcLoading) {
    pcLoading.addEventListener('ldesignConfirm', () => {
      pcLoading.confirmLoading = true;
      setTimeout(() => {
        pcLoading.confirmLoading = false;
        pcLoading.visible = false;
      }, 2000);
    });
  }
</script>

## 自动关闭

通过 `auto-close-delay` 属性设置自动关闭延迟。

<div class="demo-container">
  <ldesign-popconfirm 
    popconfirm-title="操作成功" 
    description="3秒后自动关闭"
    auto-close-delay="3000"
    icon="success">
    <ldesign-button slot="trigger" type="success">自动关闭</ldesign-button>
  </ldesign-popconfirm>
</div>

```html
<ldesign-popconfirm 
  popconfirm-title="操作成功" 
  auto-close-delay="3000"
  icon="success">
  <ldesign-button slot="trigger">自动关闭</ldesign-button>
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
| cancel-type | 取消按钮类型 | `'primary' \| 'secondary' \| 'outline' \| 'text' \| 'danger'` | `'outline'` |
| icon | 图标类型/名称 | `'info' \| 'success' \| 'warning' \| 'error' \| 'question' \| string` | `'question'` |
| show-icon | 是否显示图标 | `boolean` | `true` |
| animation | 动画类型 | `'fade' \| 'scale' \| 'slide'` | `'scale'` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| loading | 整体加载状态 | `boolean` | `false` |
| confirm-loading | 确认按钮加载状态 | `boolean` | `false` |
| auto-close-delay | 自动关闭延迟（毫秒） | `number` | `0` |
| offset-distance | 与触发元素的距离 | `number` | `8` |

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
