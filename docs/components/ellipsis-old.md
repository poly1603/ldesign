# Ellipsis 文本省略

用于展示一段较长的文本：折叠时按指定行数显示，超出部分省略并在右下角显示“更多”，点击后展开全文；展开后若最后一行仍有空间，则“收起”按钮与文本同行显示在最右侧，否则另起一行右对齐显示“收起”。

- 适用于信息流摘要、卡片简介、评论等多端场景（PC / 移动端）
- 与主题变量集成，可通过 CSS 变量统一风格

## 基础用法

默认展示三行，超出则省略并显示“更多”。

<div class="demo-block">
  <ldesign-ellipsis
    content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。Ellipsis 组件用于多行文本省略与展开收起的交互，支持自定义行数与按钮文案，在展开时能够智能判断最后一行是否还有剩余空间，用以决定“收起”按钮是同行显示还是换行右对齐显示。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库……"
></ldesign-ellipsis>
```

## 指定行数

通过 `lines` 指定折叠时显示的行数。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    content="两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis lines="2" content="两行省略示例……"></ldesign-ellipsis>
```

## 自定义按钮文案

使用 `expand-text` 和 `collapse-text` 修改“更多/收起”的显示文本。

<div class="demo-block">
  <ldesign-ellipsis
    lines="3"
    expand-text="更多内容"
    collapse-text="收起内容"
    content="你可以根据产品语言自定义按钮文案，例如“展开详情/收起详情”，以贴合上下文。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  expand-text="更多内容"
  collapse-text="收起内容"
  content="……"
></ldesign-ellipsis>
```

## 直接书写文本

不传 `content` 时，组件会读取标签内的纯文本作为内容。

<div class="demo-block">
  <ldesign-ellipsis lines="3">
    你也可以把文本直接写在标签内容里，组件会自动读取并进行省略与展开处理。
  </ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis lines="3">
  直接写在标签内的纯文本也可以被读取并省略/展开。
</ldesign-ellipsis>
```

## 受控模式

通过 `expanded` 属性控制展开/收起，并监听 `ldesignToggle` 事件获取状态变化。

```html
<ldesign-ellipsis id="el1" content="可受控的省略文本" expanded="true"></ldesign-ellipsis>
<script>
  const el = document.getElementById('el1');
  el.addEventListener('ldesignToggle', (e) => {
    console.log('expanded =', e.detail.expanded);
    // 也可以根据业务逻辑再次设置 el.expanded 形成完全受控
  });
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| content | 要展示的纯文本内容；不传时将读取标签内的纯文本 | `string` | - |
| lines | 折叠时显示的行数 | `number` | `3` |
| expand-text | 折叠态右下角按钮文案 | `string` | `"更多"` |
| collapse-text | 展开态“收起”按钮文案 | `string` | `"收起"` |
| default-expanded | 是否默认展开（非受控初始态） | `boolean` | `false` |
| expanded | 当前是否展开（受控） | `boolean` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| ldesignToggle | 展开/收起状态变化时触发 | `detail: { expanded: boolean }` |

### CSS 变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| --ld-ellipsis-bg | “更多/收起”按钮背后的底色，用于遮住文本或渐变 | `var(--ldesign-bg-color, #fff)` |

示例：

```css
ldesign-ellipsis {
  --ld-ellipsis-bg: transparent; /* 根据容器背景调整，避免色差 */
}
```

## 交互与可访问性

- “更多/收起”按钮支持键盘聚焦与操作，并有可视化 focus 样式。
- 移动端点击热区已适配，默认按钮具备内边距，便于触摸操作。

## 使用建议

- 组件当前针对纯文本内容设计；如需支持富文本（带标签）的截断与同行“收起”放置，建议在具体场景下扩展测量逻辑后使用。
