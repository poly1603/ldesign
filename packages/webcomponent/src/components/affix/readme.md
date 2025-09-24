# ldesign-affix

Affix 固钉组件，将元素固定在页面（或指定滚动容器）顶部，常用于吸顶工具条、操作条等场景。

- 支持 offset 触发阈值
- 支持 target 指定滚动容器（CSS 选择器）
- 自动占位（固定到视口时），避免布局抖动；容器内部吸附时使用 sticky，无需占位
- 提供 ldesignAffixChange 事件；支持 within-target 吸附到滚动容器内部

## 基础用法

```html path=null start=null
<!-- 吸顶偏移 0，默认随窗口滚动吸顶 -->
<ldesign-affix>
  <ldesign-button type="primary">固定在顶部</ldesign-button>
</ldesign-affix>
```

## 自定义偏移

```html path=null start=null
<!-- 当内容到达距离顶端 80px 时开始吸顶 -->
<ldesign-affix offset="80">
  <div style="background:#fff;padding:8px 16px;border:1px solid #eee;">吸顶条（80px）</div>
</ldesign-affix>
```

## 指定滚动容器

```html path=null start=null
<div id="scroll-area" style="height:240px; overflow:auto; border:1px solid #ddd;">
  <div style="height:1000px; padding:12px;">
    <ldesign-affix target="#scroll-area" offset="12">
      <ldesign-button type="secondary">跟随容器吸顶</ldesign-button>
    </ldesign-affix>

    <p>容器内的长内容……</p>
  </div>
</div>
```

## 监听状态变化

```html path=null start=null
<ldesign-affix id="affix" offset="0">
  <ldesign-button>工具条</ldesign-button>
</ldesign-affix>

<script>
  const el = document.getElementById('affix');
  el.addEventListener('ldesignAffixChange', (e) => {
    console.log('affixed:', e.detail);
  });
</script>
```

## 与按钮组合

```html path=null start=null
<ldesign-affix offset="0">
  <div style="display:flex; gap:8px; background:#fff; border:1px solid #eee; padding:8px 12px;">
    <ldesign-button type="primary">保存</ldesign-button>
    <ldesign-button type="secondary">取消</ldesign-button>
  </div>
</ldesign-affix>
```

> 说明
> - 组件会在吸附时为内部内容设置 position: fixed，并自动为占位元素赋予等高高度，避免页面跳动。
> - target 仅支持 CSS 选择器，未匹配到则回退到 window。
> - 如容器或页面尺寸变化，会自动重新计算位置与宽度。

---

<!-- Auto Generated Below -->


## Overview

Affix 固钉组件
- 将元素固定在页面（或指定滚动容器）顶部
- 默认基于窗口滚动容器，支持设置 offsetTop、target(container) 与 zIndex

## Properties

| Property       | Attribute       | Description                                                               | Type      | Default     |
| -------------- | --------------- | ------------------------------------------------------------------------- | --------- | ----------- |
| `disabled`     | `disabled`      | 是否禁用                                                                      | `boolean` | `false`     |
| `offset`       | `offset`        | 距离顶部的偏移量（触发吸顶的阈值）                                                         | `number`  | `0`         |
| `target`       | `target`        | 指定滚动容器（CSS 选择器）。默认为 window 例如：'#scrollable' 或 '.scroll-area'              | `string`  | `undefined` |
| `withinTarget` | `within-target` | 是否在指定滚动容器内部吸附（使用 position: sticky 策略） 仅当设置了 target 且 target 不是 window 时生效 | `boolean` | `false`     |
| `zIndex`       | `z-index`       | 自定义层级                                                                     | `number`  | `1000`      |


## Events

| Event                | Description | Type                   |
| -------------------- | ----------- | ---------------------- |
| `ldesignAffixChange` | 吸附状态变化事件    | `CustomEvent<boolean>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
