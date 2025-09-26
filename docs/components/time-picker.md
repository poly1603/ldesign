# TimePicker 时间选择器

用于选择具体时间，支持小时/分钟/秒三列选择，支持 12 小时制、步进、最小/最大时间及禁用时间等。

## 基础用法

<div class="demo-block">
  <ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
```

## 不显示秒

<div class="demo-block">
  <ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
```

## 即时生效（无需点击“确定”）

<div class="demo-block">
  <ldesign-time-picker confirm="false"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker confirm="false"></ldesign-time-picker>
```

## 步进

<div class="demo-block">
  <ldesign-time-picker minute-step="5" second-step="10"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker minute-step="5" second-step="10"></ldesign-time-picker>
```

## 最小/最大时间与禁用时间

<div class="demo-block">
  <ldesign-time-picker min-time="09:30:00" max-time="18:00:00" disabled-hours='[0,1,2,22,23]'></ldesign-time-picker>
</div>

```html
<ldesign-time-picker 
  min-time="09:30:00"
  max-time="18:00:00"
  disabled-hours='[0,1,2,22,23]'
></ldesign-time-picker>
```

## 12 小时制与 AM/PM

<div class="demo-block">
  <!-- UI 使用 AM/PM 列；输出为 12 小时制字符串（含 AM/PM） -->
  <ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
```

## 受控用法

```html
<ldesign-time-picker id="tp" value="12:00:00" clearable></ldesign-time-picker>
<script>
  const tp = document.getElementById('tp');
  tp.addEventListener('ldesignChange', (e) => {
    console.log('time changed:', e.detail);
  });
</script>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控），支持 `HH:mm[:ss]` 或 `hh:mm[:ss] AM/PM` | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| placeholder | 占位文案 | `string` | `选择时间` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否显示清空按钮 | `boolean` | `false` |
| show-seconds | 是否显示秒 | `boolean` | `true` |
| hour-step | 小时步进 | `number` | `1` |
| minute-step | 分钟步进 | `number` | `1` |
| second-step | 秒步进 | `number` | `1` |
| min-time | 最小时间（含） | `string` | - |
| max-time | 最大时间（含） | `string` | - |
| disabled-hours | 禁用小时集合（数组或 JSON 字符串） | `number[] | string` | - |
| disabled-minutes | 禁用分钟集合 | `number[] | string` | - |
| disabled-seconds | 禁用秒集合 | `number[] | string` | - |
| use-12-hours | 是否显示 12 小时制 AM/PM 列 | `boolean` | `false` |
| output-format | 输出格式：`'24'` 或 `'12'` | `'24' | '12'` | `'24'` |
| confirm | 是否需要点击“确定”确认 | `boolean` | `true` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值改变时触发 | `(value?: string)` |
| ldesignVisibleChange | 弹层可见性变化 | `(visible: boolean)` |
