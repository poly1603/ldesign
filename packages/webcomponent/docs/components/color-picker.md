# ColorPicker 颜色选择器

可视化选择颜色的组件，支持 HEX/RGB/HSL/HSV，多格式输入与透明度，可与 Popup 组合使用为下拉式颜色选择。

## 基础用法

<div class="demo-container">
  <ldesign-color-picker value="#1677ff"></ldesign-color-picker>
</div>

```html
<ldesign-color-picker value="#1677ff"></ldesign-color-picker>
```

## 在 Popup 中使用（下拉颜色选择）

点击触发器弹出颜色选择面板，选择后自动关闭弹层并同步显示。

<div class="demo-container" style="display:flex; align-items:center; gap:12px;">
  <ldesign-popup id="cp-popup" trigger="click" placement="bottom-start" interactive hide-delay="0" :arrow="true">
    <div slot="trigger" id="cp-trigger" style="display:inline-flex; align-items:center; gap:8px; padding:4px 8px; border:1px solid #e5e5e5; border-radius:6px; cursor:pointer;">
      <span id="cp-swatch" style="width:16px;height:16px;border-radius:4px;background:#1677ff;border:1px solid rgba(0,0,0,.1);"></span>
      <span id="cp-text" style="font-size:12px; color:#333;">#1677ff</span>
    </div>
    <div style="padding: 8px;">
      <ldesign-color-picker id="cp-inside" value="#1677ff" show-alpha></ldesign-color-picker>
    </div>
  </ldesign-popup>
</div>

```html
<ldesign-popup id="cp-popup" trigger="click" placement="bottom-start" interactive hide-delay="0">
  <div slot="trigger" id="cp-trigger" class="color-trigger">
    <span id="cp-swatch" class="swatch"></span>
    <span id="cp-text" class="text">#1677ff</span>
  </div>
  <ldesign-color-picker id="cp-inside" value="#1677ff" show-alpha></ldesign-color-picker>
</ldesign-popup>

<script>
  const popup = document.getElementById('cp-popup');
  const picker = document.getElementById('cp-inside');
  const swatch = document.getElementById('cp-swatch');
  const text = document.getElementById('cp-text');
  picker?.addEventListener('ldesignChange', (e) => {
    const color = e.detail; // 字符串（与当前格式一致）
    if (text) text.textContent = color;
    if (swatch) swatch.style.background = color;
    popup?.hide?.(); // 选择后关闭弹窗
  });
</script>
```

<script setup>
import { onMounted, onUnmounted } from 'vue'
let cleanupFns = []
function bind(el, evt, fn){ el && el.addEventListener(evt, fn); cleanupFns.push(()=> el?.removeEventListener(evt, fn)) }
onMounted(()=>{
  const popup = document.getElementById('cp-popup')
  const picker = document.getElementById('cp-inside')
  const swatch = document.getElementById('cp-swatch')
  const text = document.getElementById('cp-text')
  bind(picker, 'ldesignChange', (e)=>{
    const color = e.detail
    if (text) text.textContent = color
    if (swatch) swatch.style.background = color
    popup?.hide?.()
  })
})
onUnmounted(()=> cleanupFns.forEach(fn=>fn()))
</script>

## 透明度

设置 `show-alpha` 显示并可控制透明度。

<div class="demo-container">
  <ldesign-color-picker value="#1677ff" show-alpha></ldesign-color-picker>
</div>

```html
<ldesign-color-picker value="#1677ff" show-alpha></ldesign-color-picker>
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
| `value` | `string` | `#3498db` | 当前值，支持 `#RRGGBB/#RRGGBBAA`、`rgb()/rgba()`、`hsl()/hsla()`、`hsv()` |
| `format` | `'hex' \| 'rgb' \| 'hsl' \| 'hsv'` | `'hex'` | 默认显示/输出格式 |
| `show-alpha` | `boolean` | `true` | 是否显示透明度滑条与输入 |
| `show-preset` | `boolean` | `true` | 是否显示系统预设颜色区 |
| `show-history` | `boolean` | `true` | 是否显示最近使用颜色区（在选择时自动记录） |
| `presets` | `string[]` | 见源码默认 | 预设颜色集合 |
| `recent-max` | `number` | `12` | 最近颜色最大记录数 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldesignInput` | 实时变更 | `string`（当前格式化颜色） |
| `ldesignChange` | 确认变更 | `string`（当前格式化颜色） |

> 提示：和 `<ldesign-popup>` 一起用时，建议设置 `trigger="click"` 与 `interactive`（默认 true），并在 `ldesignChange` 时调用 `popup.hide()` 以便选择后自动关闭。