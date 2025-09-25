# ColorPicker 颜色选择器

可视化选择颜色的组件，支持 HEX/RGB/HSL/HSV，多格式输入与透明度，可与 Popup 组合使用为下拉式颜色选择。

## 基础用法

<div class="demo-container">
  <ldesign-color-picker value="#1677ff"></ldesign-color-picker>
</div>

```html
<ldesign-color-picker value="#1677ff"></ldesign-color-picker>
```

## 下拉选择（内置 Popup）

现在 `<ldesign-color-picker>` 已内置弹出层，直接使用即可：

<div class="demo-container" style="display:flex; align-items:center; gap:12px;">
  <ldesign-color-picker value="#1677ff" show-alpha popup-width="360"></ldesign-color-picker>
</div>

```html
<ldesign-color-picker value="#1677ff" show-alpha popup-width="360"></ldesign-color-picker>
```

> 选择后会自动关闭弹层（`hide-on-select=true`），可通过属性关闭该行为。

## 透明度

设置 `show-alpha` 显示并可控制透明度。

<div class="demo-container">
  <ldesign-color-picker value="#1677ff" show-alpha></ldesign-color-picker>
</div>

```html
<ldesign-color-picker value="#1677ff" show-alpha></ldesign-color-picker>
```

## 自定义触发器

你可以通过具名插槽自定义触发按钮或输入框：

```html
<ldesign-color-picker value="#1677ff" custom-trigger>
  <ldesign-button slot="trigger" type="outline">选择颜色</ldesign-button>
</ldesign-color-picker>
```

也可以传入任意元素作为触发器，例如输入框：

```html
<ldesign-color-picker value="#1677ff" custom-trigger>
  <input slot="trigger" value="#1677ff" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;width:140px;" readonly />
</ldesign-color-picker>
```

## 事件

- `ldesignInput`：拖动或输入实时触发，回调参数为格式化后的颜色字符串
- `ldesignChange`：选择完成时触发（拖动结束或输入确定），回调参数为格式化后的颜色字符串

```html
<ldesign-color-picker id="cp-evt" value="#1677ff"></ldesign-color-picker>
<script>
  const el = document.getElementById('cp-evt');
  el.addEventListener('ldesignInput', (e) => console.log('input:', e.detail));
  el.addEventListener('ldesignChange', (e) => console.log('change:', e.detail));
</script>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `#1677ff` | 当前值，支持 `#RRGGBB/#RRGGBBAA`、`rgb()/rgba()`、`hsl()/hsla()`、`hsv()` |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'hsv'` | `'hex'` | 默认显示/输出格式（传递给面板） |
| `show-alpha` | `boolean` | `true` | 是否显示透明度（传递给面板） |
| `show-preset` | `boolean` | `true` | 是否显示系统预设颜色区（传递给面板） |
| `show-history` | `boolean` | `true` | 是否显示最近使用（传递给面板，面板无历史则不展示） |
| `presets` | `string[]` | - | 预设颜色集合（传递给面板） |
| `recent-max` | `number` | `12` | 最近颜色最大记录数（传递给面板） |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 触发器尺寸与面板尺寸 |
| `disabled` | `boolean` | `false` | 禁用触发器 |
| `hide-on-select` | `boolean` | `true` | 选择颜色后自动关闭弹层 |
| `placement` | `PopupPlacement` | `'bottom-start'` | 弹出位置 |
| `popup-width` | `number \| string` | - | 弹层宽度，面板将铺满该宽度 |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldesignInput` | 实时变更 | `string`（当前格式化颜色） |
| `ldesignChange` | 确认变更 | `string`（当前格式化颜色） |
