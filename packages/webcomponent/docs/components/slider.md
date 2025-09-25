# Slider 滑块

通过拖动滑块在一定数值区间内进行选择。

## 基础用法

<div class="demo-container">
  <ldesign-slider></ldesign-slider>
  <ldesign-slider value="30"></ldesign-slider>
</div>

```html
<ldesign-slider></ldesign-slider>
<ldesign-slider value="30"></ldesign-slider>
```

## 范围与步长

通过 `min`、`max`、`step` 控制取值范围与步长，值会自动对齐到最接近的步长。

<div class="demo-container">
  <ldesign-slider min="-50" max="50" step="5" value="5"></ldesign-slider>
  <ldesign-slider min="0" max="1" step="0.1" value="0.3" show-tooltip></ldesign-slider>
</div>

```html
<ldesign-slider min="-50" max="50" step="5" value="5"></ldesign-slider>
<ldesign-slider min="0" max="1" step="0.1" value="0.3" show-tooltip></ldesign-slider>
```

## 禁用

<div class="demo-container">
  <ldesign-slider disabled value="40"></ldesign-slider>
</div>

```html
<ldesign-slider disabled value="40"></ldesign-slider>
```

## 尺寸

使用 `size` 改变拇指与轨道尺寸。

<div class="demo-container">
  <ldesign-slider size="large" value="70"></ldesign-slider>
  <ldesign-slider size="medium" value="50"></ldesign-slider>
  <ldesign-slider size="small" value="30"></ldesign-slider>
</div>

```html
<ldesign-slider size="large" value="70"></ldesign-slider>
<ldesign-slider size="medium" value="50"></ldesign-slider>
<ldesign-slider size="small" value="30"></ldesign-slider>
```

## 垂直方向

设置 `vertical` 以启用垂直模式。可通过样式控制高度。

<div class="demo-container" style="display: flex; gap: 40px; align-items: flex-end;">
  <ldesign-slider vertical style="height: 200px;"></ldesign-slider>
  <ldesign-slider vertical style="height: 200px;" value="70" show-tooltip></ldesign-slider>
</div>

```html
<ldesign-slider vertical style="height: 200px;"></ldesign-slider>
<ldesign-slider vertical style="height: 200px;" value="70" show-tooltip></ldesign-slider>
```

## 显示数值提示

设置 `show-tooltip` 在拇指上方显示当前数值。

<div class="demo-container">
  <ldesign-slider value="80" show-tooltip></ldesign-slider>
</div>

```html
<ldesign-slider value="80" show-tooltip></ldesign-slider>
```

## 事件

- `ldesignInput`: 拖动过程中实时触发，参数为 `number`
- `ldesignChange`: 释放拖动/键盘/点击轨道完成变更后触发，参数为 `number`

简单演示：

<div class="demo-container" style="flex-direction: column; align-items: stretch; gap: 8px;">
  <ldesign-slider id="slider-live" value="20"></ldesign-slider>
  <div>input: <span id="slider-oninput">20</span></div>
  <div>change: <span id="slider-onchange">-</span></div>
</div>

```html
<ldesign-slider id="slider-live" value="20"></ldesign-slider>
<div>input: <span id="slider-oninput">20</span></div>
<div>change: <span id="slider-onchange">-</span></div>

<script>
  const s = document.getElementById('slider-live');
  const i = document.getElementById('slider-oninput');
  const c = document.getElementById('slider-onchange');
  s?.addEventListener('ldesignInput', (e) => i && (i.textContent = String(e.detail)) );
  s?.addEventListener('ldesignChange', (e) => c && (c.textContent = String(e.detail)) );
</script>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | `0` | 当前值（将对齐到步长并限制在范围内） |
| `min` | `number` | `0` | 最小值 |
| `max` | `number` | `100` | 最大值 |
| `step` | `number` | `1` | 步长，需大于 0，支持小数 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `size` | `'small' \| 'medium' \| 'large'` | `medium` | 尺寸 |
| `vertical` | `boolean` | `false` | 是否垂直方向 |
| `show-tooltip` | `boolean` | `false` | 是否显示数值提示 |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldesignInput` | 拖动过程中持续触发 | `(event: CustomEvent<number>) => void` |
| `ldesignChange` | 值变更完成后触发 | `(event: CustomEvent<number>) => void` |

## 无障碍

- 支持键盘：←/→/↑/↓ 调整步长，PageUp/PageDown 调整 10 倍步长，Home/End 移动到最小/最大
- ARIA：role="slider"，并提供 `aria-valuemin` / `aria-valuemax` / `aria-valuenow` 与 `aria-orientation`，禁用时含 `aria-disabled`
