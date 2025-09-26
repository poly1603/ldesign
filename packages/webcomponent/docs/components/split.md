# Split 面板分割

将一个区域分为两个可调整大小的面板，支持左右（vertical）和上下（horizontal）方向，支持嵌套使用。

- 组件：`<ldesign-split>`
- 方向：`direction="vertical|horizontal"`，默认 `vertical`
- 比例：`value`（0~1），表示起始面板所占比例；拖拽中会自动更新
- 约束：`firstMin`、`secondMin`（像素）限制两侧最小尺寸
- 分割条厚度：`splitterSize`（像素）
- 事件：`ldesignSplitStart`、`ldesignSplit`、`ldesignSplitEnd`

## 基础用法（左右分割）

<div class="demo-container" style="height: 280px;">
  <ldesign-split value="0.33">
    <div slot="start" style="padding:12px;">Left</div>
    <div slot="end" style="padding:12px;">Right</div>
  </ldesign-split>
</div>

```html
<ldesign-split style="width:100%;height:280px;" value="0.33">
  <div slot="start">Left</div>
  <div slot="end">Right</div>
</ldesign-split>
```

## 上下分割

> 注意：上下分割需要给容器设置明确高度。

<div class="demo-container" style="height: 280px;">
  <ldesign-split direction="horizontal" value="0.5">
    <div slot="start" style="padding:12px;">Top</div>
    <div slot="end" style="padding:12px;">Bottom</div>
  </ldesign-split>
</div>

```html
<ldesign-split direction="horizontal" style="width:100%;height:280px;" value="0.5">
  <div slot="start">Top</div>
  <div slot="end">Bottom</div>
</ldesign-split>
```

## 嵌套分割

<div class="demo-container" style="height: 360px;">
  <ldesign-split value="0.4">
    <div slot="start" style="padding:12px;">Left</div>
    <ldesign-split slot="end" direction="horizontal" value="0.6">
      <div slot="start" style="padding:12px;">Top</div>
      <div slot="end" style="padding:12px;">Bottom</div>
    </ldesign-split>
  </ldesign-split>
</div>

```html
<ldesign-split style="width:100%;height:360px;" value="0.4">
  <div slot="start">Left</div>
  <ldesign-split slot="end" direction="horizontal" value="0.6">
    <div slot="start">Top</div>
    <div slot="end">Bottom</div>
  </ldesign-split>
</ldesign-split>
```

## 可折叠

配置 collapsible 提供快捷收缩能力。可用 collapsedSize 设置收起后的保留尺寸（像素）。

<div class="demo-container" style="height: 240px;">
  <ldesign-split value="0.5" collapsible collapsedSize="0">
    <div slot="start" style="padding:12px;">First</div>
    <div slot="end" style="padding:12px;">Second</div>
  </ldesign-split>
</div>

```html
<ldesign-split style="width:100%;height:240px;" value="0.5" collapsible collapsedSize="0">
  <div slot="start">First</div>
  <div slot="end">Second</div>
</ldesign-split>
```

> 如果希望折叠后只能通过按钮恢复，不允许拖拽展开，可设置 `allowDragExpandWhenCollapsed="false"`。

## 最小尺寸与分割条大小

<div class="demo-container" style="height: 240px;">
  <ldesign-split value="0.5" firstMin="160" secondMin="160" splitterSize="8">
    <div slot="start" style="padding:12px;">最小 160px</div>
    <div slot="end" style="padding:12px;">最小 160px，分割条 8px</div>
  </ldesign-split>
</div>

```html
<ldesign-split style="width:100%;height:240px;" value="0.5" firstMin="160" secondMin="160" splitterSize="8">
  <div slot="start">最小 160px</div>
  <div slot="end">最小 160px，分割条 8px</div>
</ldesign-split>
```

## 事件

```html
<ldesign-split id="split-demo" style="width:100%;height:200px;" value="0.5">
  <div slot="start" style="padding:12px;">A</div>
  <div slot="end" style="padding:12px;">B</div>
</ldesign-split>
<div id="split-log" style="margin-top:8px;color:#6b7280;font-size:13px;"></div>
<script>
  const sp = document.getElementById('split-demo');
  const log = document.getElementById('split-log');
  sp?.addEventListener('ldesignSplit', (e) => {
    const { value, direction } = e.detail || {};
    if (log) log.textContent = `resizing: ${value} (${direction})`;
  });
</script>
```

## 主题与暗色示例

Split 使用一组 CSS 变量来控制分割条样式，你可以在容器上覆盖这些变量以定制主题。

- --ld-splitter-size：分割条厚度
- --ld-splitter-bg：分割条背景
- --ld-splitter-bg-active：拖拽时背景
- --ld-splitter-border：分割条内边线颜色（生成两侧/上下细线）
- --ld-splitter-handle：中间点阵把手颜色

### 暗色主题演示（含自定义变量）

<div class="demo-block split-demo-dark" style="height: 260px; border-radius: 8px; overflow: hidden;">
  <ldesign-split value="0.5">
    <div slot="start" style="padding:12px;">Left</div>
    <div slot="end" style="padding:12px;">Right</div>
  </ldesign-split>
</div>

```css
/* 给容器设置一组变量即可改变 Split 的样式 */
.split-demo-dark {
  background: #1e1f25;
  color: #e5e7eb;
  /* 轨道与边线 */
  --ld-splitter-bg: #2a2e36;
  --ld-splitter-bg-active: #323743;
  --ld-splitter-border: #3c414b;
  /* 中央点阵把手颜色 */
  --ld-splitter-handle: #e5e7eb;
  /* 也可以调整厚度 */
  --ld-splitter-size: 8px;
}
```

<style>
.split-demo-dark {
  background: #1e1f25;
  color: #e5e7eb;
  --ld-splitter-bg: #2a2e36;
  --ld-splitter-bg-active: #323743;
  --ld-splitter-border: #3c414b;
  --ld-splitter-handle: #e5e7eb;
  --ld-splitter-size: 8px;
}
</style>

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 分割方向：`vertical=左右`，`horizontal=上下` | `'vertical' \| 'horizontal'` | `vertical` |
| value | 起始面板比例（0~1），拖拽时实时回写 | `number` | `0.5` |
| firstMin | 起始面板最小尺寸（px） | `number` | `80` |
| secondMin | 末尾面板最小尺寸（px） | `number` | `80` |
| splitterSize | 分割条厚度（px） | `number` | `6` |
| disabled | 是否禁用拖拽 | `boolean` | `false` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignSplitStart | 开始拖拽 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
| ldesignSplit | 拖拽中 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
| ldesignSplitEnd | 结束拖拽 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
