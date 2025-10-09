# l-dropdown-panel

移动端下拉面板组件，从触发元素的上方或下方滑出面板，带有部分遮罩效果。

## 使用示例

### 基础用法

```html
<l-dropdown-panel>
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
    <div>选项 3</div>
  </div>
</l-dropdown-panel>
```

### 从上方滑出

```html
<l-dropdown-panel placement="top">
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
    <div>选项 3</div>
  </div>
</l-dropdown-panel>
```

### 自定义样式

```html
<l-dropdown-panel 
  mask-background="rgba(0, 0, 0, 0.5)" 
  max-height="50vh"
  duration="500"
>
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>
    <div>选项 1</div>
    <div>选项 2</div>
    <div>选项 3</div>
  </div>
</l-dropdown-panel>
```

### 控制面板显示

```html
<l-dropdown-panel id="myPanel">
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>

<script>
  const panel = document.getElementById('myPanel');
  
  // 显示面板
  panel.show();
  
  // 隐藏面板
  panel.hide();
  
  // 切换面板
  panel.toggle();
</script>
```

### 监听状态变化

```html
<l-dropdown-panel id="myPanel">
  <div slot="trigger">
    <button>点击展开</button>
  </div>
  <div>面板内容</div>
</l-dropdown-panel>

<script>
  const panel = document.getElementById('myPanel');
  
  panel.addEventListener('visibleChange', (e) => {
    console.log('面板状态:', e.detail ? '显示' : '隐藏');
  });
</script>
```

## Properties

| Property | Attribute | Description | Type | Default |
| --- | --- | --- | --- | --- |
| `duration` | `duration` | 动画持续时间（毫秒） | `number` | `300` |
| `maskBackground` | `mask-background` | 遮罩层背景色 | `string` | `'rgba(0, 0, 0, 0.3)'` |
| `maskClosable` | `mask-closable` | 点击遮罩层是否关闭 | `boolean` | `true` |
| `maxHeight` | `max-height` | 面板最大高度 | `string` | `'60vh'` |
| `placement` | `placement` | 面板弹出位置，'top' 或 'bottom' | `'bottom' \| 'top'` | `'bottom'` |
| `visible` | `visible` | 面板是否可见 | `boolean` | `false` |

## Events

| Event | Description | Type |
| --- | --- | --- |
| `visibleChange` | 面板显示/隐藏时触发 | `CustomEvent<boolean>` |

## Methods

### `hide() => Promise<void>`

隐藏面板

#### Returns

Type: `Promise<void>`

### `show() => Promise<void>`

显示面板

#### Returns

Type: `Promise<void>`

### `toggle() => Promise<void>`

切换面板显示状态

#### Returns

Type: `Promise<void>`

## Slots

| Slot | Description |
| --- | --- |
| `"default"` | 面板内容 |
| `"trigger"` | 触发器内容 |

## CSS 自定义

可以通过 CSS 变量或覆盖类名来自定义样式：

```css
/* 自定义触发器样式 */
.l-dropdown-panel__trigger {
  /* 你的样式 */
}

/* 自定义面板样式 */
.l-dropdown-panel__panel {
  /* 你的样式 */
}

/* 自定义遮罩样式 */
.l-dropdown-panel__mask {
  /* 你的样式 */
}
```

## 注意事项

1. 该组件主要为移动端设计，建议在移动设备或移动端视口下使用
2. 面板打开时会锁定 body 滚动，关闭时会恢复
3. 面板会自动跟随触发器位置，即使页面滚动也会保持正确位置
4. 支持触摸滚动，面板内容超出时可以滚动查看

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
