# Popconfirm 气泡确认框

用于在操作前进行二次确认。基于 Web Components，可在任意框架中直接使用。

## 基础用法

<div class="demo-block">
  <ldesign-popconfirm popconfirm-title="确定删除该条记录吗？" description="删除后无法恢复">
    <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
  </ldesign-popconfirm>
</div>

```html
<ldesign-popconfirm popconfirm-title="确定删除该条记录吗？" description="删除后无法恢复">
  <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
</ldesign-popconfirm>
```

## 自定义内容

<div class="demo-block">
  <ldesign-popconfirm popconfirm-title="发布到线上？" icon="send" ok-text="发布" cancel-text="稍后">
    <ldesign-button slot="trigger" type="primary">发布</ldesign-button>
  </ldesign-popconfirm>
</div>

```html
<ldesign-popconfirm popconfirm-title="发布到线上？" icon="send" ok-text="发布" cancel-text="稍后">
  <ldesign-button slot="trigger" type="primary">发布</ldesign-button>
</ldesign-popconfirm>
```

## 受控显示（manual）

```html
<ldesign-popconfirm id="pc" trigger="manual" visible popconfirm-title="危险操作">
  <ldesign-button slot="trigger">打开</ldesign-button>
  <span slot="title">危险操作</span>
  真的要这么做吗？
</ldesign-popconfirm>
<script>
  const pc = document.getElementById('pc');
  pc.addEventListener('ldesignConfirm', () => pc.visible = false);
  pc.addEventListener('ldesignCancel', () => pc.visible = false);
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
