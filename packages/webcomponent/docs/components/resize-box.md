# ResizeBox 伸缩框

可通过拖拽容器的边或角来改变大小，常用于可调整区域（如侧栏、面板、编辑区）

## 基础用法

默认允许从右侧与底部拖拽，同时开启右下角把手。

<div class="demo-container">
  <ldesign-resize-box width="420" height="160">
    <div style="height:100%;display:flex;align-items:center;justify-content:center;background:#f9fafb;border:1px dashed var(--ldesign-border-color);border-radius:8px;">拖拽底部或右下角</div>
  </ldesign-resize-box>
</div>

```html
<ldesign-resize-box width="420" height="160">
  <div>拖拽底部或右下角</div>
</ldesign-resize-box>
```

## 指定方向与角落

- `directions`：允许拖拽的边，取值 `top|right|bottom|left`
- `corners`：开启的角把手，取值 `top-left|top-right|bottom-right|bottom-left`

<div class="demo-container" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
  <ldesign-resize-box directions="right,bottom" corners="bottom-right" width="320" height="140">
    <div class="box">right / bottom / bottom-right</div>
  </ldesign-resize-box>
  <ldesign-resize-box directions="top,right,bottom,left" corners="top-left,top-right,bottom-left,bottom-right" width="320" height="140">
    <div class="box">四边+四角</div>
  </ldesign-resize-box>
</div>

```html
<ldesign-resize-box directions="right,bottom" corners="bottom-right"></ldesign-resize-box>
<ldesign-resize-box directions="top,right,bottom,left" corners="top-left,top-right,bottom-left,bottom-right"></ldesign-resize-box>
```

## 限制尺寸 + 吸附步进

通过 `minWidth / minHeight / maxWidth / maxHeight` 限制范围；设置 `snap` 后尺寸会对齐到该步进的整数倍。

<div class="demo-container" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
  <ldesign-resize-box minWidth="200" minHeight="100" maxWidth="600" maxHeight="240" snap="10" width="260" height="120">
    <div class="box">限制 + 吸附 10px</div>
  </ldesign-resize-box>
  <ldesign-resize-box size="large" width="420" height="180">
    <div class="box">大尺寸样式</div>
  </ldesign-resize-box>
</div>

```html
<ldesign-resize-box minWidth="200" minHeight="100" maxWidth="600" maxHeight="240" snap="10"></ldesign-resize-box>
```

## 受控模式

受控模式下组件不会直接修改 `width/height`，而是通过事件将新尺寸抛出，由外部决定是否更新。

<div class="demo-container">
  <ldesign-resize-box id="rz-ctrl" controlled width="360" height="140" corners="bottom-right"></ldesign-resize-box>
</div>

```html
<ldesign-resize-box id="rz-ctrl" controlled width="360" height="140"></ldesign-resize-box>
<script>
  const el = document.getElementById('rz-ctrl');
  el.addEventListener('ldesignResize', (e) => {
    const { width, height } = e.detail;
    // 由外部写回
    el.width = width;
    el.height = height;
  });
</script>
```

## 事件

- `ldesignResizeStart`：开始拖拽，detail: `{ width, height, edge }`
- `ldesignResize`：拖拽中持续触发，detail: `{ width, height, edge }`
- `ldesignResizeEnd`：结束拖拽，detail: `{ width, height, edge }`

## API

### 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| width | number \| string | 360 | 初始宽度。拖拽后内部按 px 显示 |
| height | number \| string | 200 | 初始高度。拖拽后内部按 px 显示 |
| directions | string \| ( 'top'\|'right'\|'bottom'\|'left')[] | 'right,bottom' | 允许拖拽的边 |
| corners | string \| ('top-left'\|'top-right'\|'bottom-right'\|'bottom-left')[] | 'bottom-right' | 角把手 |
| minWidth | number | 80 | 最小宽度 |
| minHeight | number | 60 | 最小高度 |
| maxWidth | number | - | 最大宽度 |
| maxHeight | number | - | 最大高度 |
| snap | number | 0 | 吸附步进（px），0 表示不吸附 |
| size | 'small'\|'medium'\|'large' | 'medium' | 样式尺寸 |
| disabled | boolean | false | 是否禁用 |
| controlled | boolean | false | 受控模式（不修改 props） |

<style>
.box{height:100%;display:flex;align-items:center;justify-content:center;background:#f9fafb;border:1px dashed var(--ldesign-border-color);border-radius:8px;color:#6b7280}
</style>
