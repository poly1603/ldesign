# ldesign-tag-group

TagGroup 标签组，提供两类溢出表现：
- overflow="scroll": 横向滚动，可选左右箭头
- overflow="more": 折叠多余项为“+N”，点击弹出层展示其余标签文本

## 用法

```html
<ldesign-tag-group overflow="scroll" show-arrows>
  <ldesign-tag color="primary">Primary</ldesign-tag>
  <ldesign-tag color="success">Success</ldesign-tag>
  <ldesign-tag color="warning">Warning</ldesign-tag>
  <ldesign-tag color="danger">Danger</ldesign-tag>
  <ldesign-tag>Default</ldesign-tag>
</ldesign-tag-group>

<ldesign-tag-group overflow="more" max-visible="3">
  <ldesign-tag color="primary">Primary</ldesign-tag>
  <ldesign-tag color="success">Success</ldesign-tag>
  <ldesign-tag color="warning">Warning</ldesign-tag>
  <ldesign-tag color="danger">Danger</ldesign-tag>
  <ldesign-tag>Default</ldesign-tag>
</ldesign-tag-group>
```

## 属性
- overflow: 'scroll' | 'more'（默认 'scroll'）
- maxVisible: number（more 模式下可见数量，默认 5）
- morePrefix: string（默认 '+'）
- showArrows: boolean（scroll 模式显示左右箭头，默认 true）
- scrollStep: number（箭头点击滚动步长，默认 120）

> 提示：more 模式下会读取 slotted 标签的 innerText 作为弹层列表项，仅用于“快速总览”。如果需要在弹层内展示完整可交互的 Tag，请考虑自定义一个弹层并将多余标签放入其中。