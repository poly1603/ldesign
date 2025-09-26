# Tag 标签

用于标记和分类的组件，提供不同语义颜色与外观，支持可关闭、尺寸与形状自定义。

## 基础用法

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag>默认</ldesign-tag>
    <ldesign-tag color="primary">Primary</ldesign-tag>
    <ldesign-tag color="success">Success</ldesign-tag>
    <ldesign-tag color="warning">Warning</ldesign-tag>
    <ldesign-tag color="danger">Danger</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag>默认</ldesign-tag>
<ldesign-tag color="primary">Primary</ldesign-tag>
<ldesign-tag color="success">Success</ldesign-tag>
<ldesign-tag color="warning">Warning</ldesign-tag>
<ldesign-tag color="danger">Danger</ldesign-tag>
```

## 外观（variant）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag color="primary" variant="light">Light</ldesign-tag>
    <ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
    <ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag color="primary" variant="light">Light</ldesign-tag>
<ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
<ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
```

## 可关闭

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag closable>默认</ldesign-tag>
    <ldesign-tag color="primary" closable>Primary</ldesign-tag>
    <ldesign-tag color="success" closable>Success</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag closable>默认</ldesign-tag>
<ldesign-tag color="primary" closable>Primary</ldesign-tag>
<ldesign-tag color="success" closable>Success</ldesign-tag>
```

## 尺寸与形状

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">尺寸:</span>
    <ldesign-tag size="small">Small</ldesign-tag>
    <ldesign-tag size="middle">Middle</ldesign-tag>
    <ldesign-tag size="large">Large</ldesign-tag>
  </div>
  <div class="demo-row">
    <span class="demo-label">形状:</span>
    <ldesign-tag shape="rectangle">Rectangle</ldesign-tag>
    <ldesign-tag shape="round">Round</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag size="small">Small</ldesign-tag>
<ldesign-tag size="middle">Middle</ldesign-tag>
<ldesign-tag size="large">Large</ldesign-tag>

<ldesign-tag shape="rectangle">Rectangle</ldesign-tag>
<ldesign-tag shape="round">Round</ldesign-tag>
```

## 带图标

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag icon="tag">标签</ldesign-tag>
    <ldesign-tag icon="check" color="success">完成</ldesign-tag>
    <ldesign-tag icon="alert-triangle" color="warning">警告</ldesign-tag>
    <ldesign-tag icon="x-circle" color="danger">错误</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag icon="tag">标签</ldesign-tag>
<ldesign-tag icon="check" color="success">完成</ldesign-tag>
<ldesign-tag icon="alert-triangle" color="warning">警告</ldesign-tag>
<ldesign-tag icon="x-circle" color="danger">错误</ldesign-tag>
```

## 事件

可关闭标签会触发 `ldesignClose` 事件：

```html
<ldesign-tag id="closable" color="primary" closable>可关闭</ldesign-tag>
<script>
  const el = document.getElementById('closable')
  el.addEventListener('ldesignClose', () => {
    console.log('Tag closed')
  })
</script>
```

## API

### 属性（Props）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `variant` | `'light' \| 'solid' \| 'outline'` | `'light'` | 外观风格 |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 语义颜色 |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | 尺寸 |
| `shape` | `'rectangle' \| 'round'` | `'rectangle'` | 形状 |
| `closable` | `boolean` | `false` | 是否可关闭 |
| `icon` | `string` | - | 左侧图标名称 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignClose` | 点击关闭时触发 | `(event: MouseEvent)` |
