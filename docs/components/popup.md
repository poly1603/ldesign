# Popup 弹出层

用于在目标元素旁边显示气泡信息或浮层内容。默认不遮挡触发元素，基于 `@floating-ui/dom` 进行定位。

## 基础用法

<div class="demo-block">
  <ldesign-popup placement="top" content="这是一个弹出层">
    <ldesign-button slot="trigger" type="primary">悬停显示</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup placement="top" content="这是一个弹出层">
  <ldesign-button slot="trigger" type="primary">悬停显示</ldesign-button>
</ldesign-popup>
```

## 距离（offset-distance）

- 组件不会遮挡触发元素。
- `offset-distance` 用于设置“触发元素与弹层之间的距离”。
  - 当 `arrow=true`（默认）时，它表示“触发元素到箭头尖端”的间隙。
  - 当 `arrow=false` 时，它表示“触发元素到弹层边缘”的间隙。
- 默认值为 `8`。

> 提示：在模板中使用短横线写法 `offset-distance`，在 JS/TS 中对应属性名为 `offsetDistance`。

### 示例：不同的间距

<div class="demo-block">
  <ldesign-popup placement="top" offset-distance="4" content="距离 4px">
    <ldesign-button slot="trigger">距离 4px</ldesign-button>
  </ldesign-popup>
  
  <span style="display:inline-block; width: 12px;"></span>

  <ldesign-popup placement="top" offset-distance="16" content="距离 16px">
    <ldesign-button slot="trigger">距离 16px</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup placement="top" offset-distance="4" content="距离 4px">
  <ldesign-button slot="trigger">距离 4px</ldesign-button>
</ldesign-popup>

<ldesign-popup placement="top" offset-distance="16" content="距离 16px">
  <ldesign-button slot="trigger">距离 16px</ldesign-button>
</ldesign-popup>
```

### 示例：不显示箭头也能精确控制间距

<div class="demo-block">
  <ldesign-popup placement="top" arrow="false" offset-distance="12" content="无箭头，距离 12px">
    <ldesign-button slot="trigger" type="secondary">无箭头 12px</ldesign-button>
  </ldesign-popup>
</div>

```html
<ldesign-popup placement="top" arrow="false" offset-distance="12" content="无箭头，距离 12px">
  <ldesign-button slot="trigger" type="secondary">无箭头 12px</ldesign-button>
</ldesign-popup>
```

## 触发方式

支持 `hover`、`click`、`focus`、`contextmenu` 和 `manual`。

```html
<ldesign-popup trigger="click" placement="bottom" content="点击触发">
  <ldesign-button slot="trigger">点击显示</ldesign-button>
</ldesign-popup>
```

## 常用属性摘要

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| placement | 出现位置 | `'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end'` | `'bottom'` |
| trigger | 触发方式 | `'hover' | 'click' | 'focus' | 'manual' | 'contextmenu'` | `'hover'` |
| arrow | 是否显示箭头 | `boolean` | `true` |
| offset-distance | 与触发元素的距离（启用箭头时为“到箭头尖端”的距离） | `number` | `8` |
| theme | 主题风格 | `'light' | 'dark'` | `'light'` |
| show-delay | 显示延迟（毫秒） | `number` | `0` |
| hide-delay | 隐藏延迟（毫秒） | `number` | `0` |

> 更多属性与事件请参考组件 API 或源码注释。
