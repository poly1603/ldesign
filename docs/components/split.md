# Split 面板分割

将一个区域分为可调整大小的两个面板，支持左右（vertical）和上下（horizontal）两种方向，可嵌套使用。

- 组件：`<ldesign-split>`
- 方向：`direction="vertical|horizontal"`，默认 `vertical`
- 比例：`value`（0~1），表示起始面板所占比例，拖拽时会自动更新为小数
- 约束：`firstMin` / `secondMin`（像素）用于限制两侧最小尺寸
- 分割条厚度：`splitterSize`（像素）
- 事件：`ldesignSplitStart`、`ldesignSplit`、`ldesignSplitEnd`

## 基本用法（左右分割）

<div class="demo-block" style="height: 280px;">
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

> 注意：上下分割需为容器设置明确高度。

<div class="demo-block" style="height: 280px;">
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

## 嵌套分割（套娃）

<div class="demo-block" style="height: 360px;">
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

## 最小尺寸与分割条大小

<div class="demo-block" style="height: 240px;">
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

```js
const split = document.querySelector('ldesign-split');
split?.addEventListener('ldesignSplit', (e) => {
  const { value, direction } = e.detail;
  console.log('resizing', value, direction);
});
```

## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 分割方向：`vertical=左右`，`horizontal=上下` | `'vertical' | 'horizontal'` | `vertical` |
| value | 起始面板比例（0~1），拖拽时实时回写 | `number` | `0.5` |
| firstMin | 起始面板最小尺寸（px） | `number` | `80` |
| secondMin | 末尾面板最小尺寸（px） | `number` | `80` |
| splitterSize | 分割条厚度（px） | `number` | `6` |
| disabled | 是否禁用拖拽 | `boolean` | `false` |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignSplitStart | 开始拖拽 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
| ldesignSplit | 拖拽中 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
| ldesignSplitEnd | 结束拖拽 | `{ value: number; direction: 'vertical' | 'horizontal' }` |
