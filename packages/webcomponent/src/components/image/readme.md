# ldesign-image

一个支持懒加载、占位/回退、响应式与预览的图片组件。

## 使用示例

- 基础用法
```html path=null start=null
<ldesign-image src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=600" width="320" height="200" fit="cover" radius="8"></ldesign-image>
```

- 懒加载 + 骨架
```html path=null start=null
<ldesign-image
  src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=1200"
  width="100%"
  height="200"
  lazy
  fit="cover"
></ldesign-image>
```

- 自定义占位图与回退图
```html path=null start=null
<ldesign-image
  src="https://invalid.domain/not-found.jpg"
  placeholder="/assets/placeholder.jpg"
  fallback="/assets/fallback.jpg"
  width="280"
  height="180"
  fit="contain"
></ldesign-image>
```

- 响应式图片（srcset / sizes）
```html path=null start=null
<ldesign-image
  src="/assets/hero-1200.jpg"
  srcset="/assets/hero-480.jpg 480w, /assets/hero-800.jpg 800w, /assets/hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  width="100%"
  height="240"
  fit="cover"
></ldesign-image>
```

- 预览（点击放大，滚轮缩放，拖拽移动，ESC 关闭）
```html path=null start=null
<ldesign-image
  src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200"
  width="260"
  height="180"
  radius="6"
  fit="cover"
  preview
></ldesign-image>
```

> 下方为自动生成的属性与事件文档，构建后会自动更新。

<!-- Auto Generated Below -->


## Overview

ImageGroup 图集容器
- 使用 CSS Grid 布局
- 支持列数与间距
- 可给子项（ldesign-image）注入默认形状（若子项未手动指定）

## Properties

| Property  | Attribute | Description              | Type                                | Default     |
| --------- | --------- | ------------------------ | ----------------------------------- | ----------- |
| `columns` | `columns` | 列数                       | `number`                            | `3`         |
| `gap`     | `gap`     | 间距（px）                   | `number`                            | `8`         |
| `shape`   | `shape`   | 统一子项形状（子项已设置 shape 时不覆盖） | `"circle" \| "rounded" \| "square"` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
