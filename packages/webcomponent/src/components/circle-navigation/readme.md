# ldesign-circle-navigation

圆形导航组件。将子元素均匀分布在一个圆周上，可通过 `width` / `height` 设置圆形容器的尺寸。

- 自动测量子项尺寸，避免贴边重叠
- 支持起始角度与顺/逆时针排列
- 提供中心槽位 `slot="center"`

## 基础用法

```html path=null start=null
<ldesign-circle-navigation width="300" height="300" start-angle="-90" padding="12">
  <button class="as-dot">A</button>
  <button class="as-dot">B</button>
  <button class="as-dot">C</button>
  <button class="as-dot">D</button>
  <div slot="center" class="as-dot">+</div>
</ldesign-circle-navigation>
```

提示：`.as-dot` 是在组件样式中提供的演示类名（圆形按钮外观），可按需移除或自定义。

## 属性 (Props)

- `width: number | string` 圆形容器宽度。数字按 px 处理，也可传 `px/%/rem` 等字符串。默认 `240`。
- `height?: number | string` 圆形容器高度。未传时与 `width` 相同。
- `startAngle: number` 起始角（度）。默认 `-90`（第一个元素在正上方）。
- `clockwise: boolean` 是否顺时针排列。默认 `true`。
- `padding: number` 与圆边缘的内边距（px）。默认 `8`。

> HTML 中的属性使用小写短横线：`start-angle`、`clockwise`、`padding` 等。

## 槽位 (Slots)

- 默认槽位：用于放置将被均匀分布在圆周上的子元素。
- `center`：放置圆心内容，例如主按钮或头像。

## 无障碍 (A11y)

该组件根节点为 `<nav role="navigation">`，可按需通过 `aria-label` 指定名称：

```html path=null start=null
<ldesign-circle-navigation aria-label="Circular actions">
  ...
</ldesign-circle-navigation>
```

## 提示

- 子元素会被绝对定位（absolute），如果需要交互阴影/hover 效果，请直接在子元素上编写样式。
- 组件会在窗口尺寸变化与内容变化（slotchange）时自动重新布局。
