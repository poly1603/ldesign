# ColorInput 颜色输入

内置 Popup + ColorPicker 的颜色选择输入框。点击触发器弹出面板，选择颜色后自动写回并可自动关闭弹层。

## 基础用法

<div class="demo-container">
  <ldesign-color-input value="#1677ff" show-alpha></ldesign-color-input>
</div>

```html
<ldesign-color-input value="#1677ff" show-alpha></ldesign-color-input>
```

## 受控与事件

<div class="demo-container" style="display:flex;gap:12px;align-items:center;">
  <ldesign-color-input id="ci" value="#40a9ff" show-alpha></ldesign-color-input>
  <span id="ci-out">#40a9ff</span>
</div>

```html
<ldesign-color-input id="ci" value="#40a9ff" show-alpha></ldesign-color-input>
<span id="ci-out">#40a9ff</span>

<script>
  const el = document.getElementById('ci');
  const out = document.getElementById('ci-out');
  el.addEventListener('ldesignInput', (e) => out.textContent = e.detail);
  el.addEventListener('ldesignChange', (e) => console.log('change', e.detail));
</script>
```

## 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | `#1677ff` | 当前颜色（字符串） |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'hsv'` | `'hex'` | 传递给内部 ColorPicker 的默认格式 |
| `show-alpha` | `boolean` | `true` | 是否显示透明度 |
| `show-preset` | `boolean` | `true` | 是否显示系统预设颜色区 |
| `show-history` | `boolean` | `true` | 是否显示最近使用 |
| `presets` | `string[]` | - | 预设颜色集合 |
| `recent-max` | `number` | `12` | 最近颜色最大条数 |
| `disabled` | `boolean` | `false` | 禁用 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 触发器尺寸 |
| `hide-on-select` | `boolean` | `true` | 选择颜色后自动关闭弹层 |
| `placement` | `PopupPlacement` | `'bottom-start'` | 弹出位置 |
| `placeholder` | `string` | `''` | 输入占位符（只读显示） |
| `clearable` | `boolean` | `true` | 是否允许清空 |

## 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldesignInput` | 选择过程中实时触发 | `string` |
| `ldesignChange` | 选择完成时触发 | `string` |
