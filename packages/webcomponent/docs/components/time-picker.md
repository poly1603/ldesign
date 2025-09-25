# TimePicker 时间选择器

基于 `<ldesign-popup>` 实现的时间选择组件，支持小时/分钟/秒选择、步进、最小/最大时间、禁用时间以及 12 小时制 AM/PM。

- 组件标签：`<ldesign-time-picker>`
- 依赖：`<ldesign-popup>`

## 基础用法

<div class="demo-container">
  <ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
```

## 不显示秒（HH:mm）

<div class="demo-container">
  <ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker show-seconds="false" placeholder="HH:mm"></ldesign-time-picker>
```

## 即时生效（不需要点击“确定”）

<div class="demo-container">
  <ldesign-time-picker confirm="false"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker confirm="false"></ldesign-time-picker>
```

## 12 小时制 + AM/PM（输出 12h 文本）

<div class="demo-container">
  <ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker use-12-hours output-format="12"></ldesign-time-picker>
```

## 范围与禁用

<div class="demo-container">
  <ldesign-time-picker
    min-time="09:30:00"
    max-time="18:00:00"
    disabled-hours='[0,1,2,22,23]'
    minute-step="5"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  min-time="09:30:00"
  max-time="18:00:00"
  disabled-hours='[0,1,2,22,23]'
  minute-step="5"
></ldesign-time-picker>
```

## 事件

<div class="demo-container">
  <ldesign-time-picker id="tp-event" clearable></ldesign-time-picker>
  <div id="tp-event-log" style="margin-top:8px;color:#666;font-size:13px;"></div>
</div>

```html
<ldesign-time-picker id="tp-event" clearable></ldesign-time-picker>
<div id="tp-event-log"></div>
<script>
  const el = document.getElementById('tp-event');
  const log = document.getElementById('tp-event-log');
  el.addEventListener('ldesignChange', (e) => {
    log.textContent = 'change: ' + (e.detail ?? 'undefined');
  });
</script>
```

## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控） | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| placeholder | 占位文案 | `string` | `选择时间` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| show-seconds | 是否显示秒 | `boolean` | `true` |
| hour-step | 小时步进 | `number` | `1` |
| minute-step | 分钟步进 | `number` | `1` |
| second-step | 秒步进 | `number` | `1` |
| min-time | 最小时间（含） | `string` | - |
| max-time | 最大时间（含） | `string` | - |
| disabled-hours | 禁用小时集合（数组或 JSON 字符串） | `number[] | string` | - |
| disabled-minutes | 禁用分钟集合 | `number[] | string` | - |
| disabled-seconds | 禁用秒集合 | `number[] | string` | - |
| use-12-hours | 是否显示 AM/PM 列（12 小时制显示） | `boolean` | `false` |
| output-format | 输出格式：'24' 或 '12' | `'24' | '12'` | `'24'` |
| confirm | 是否需要点击“确定”确认 | `boolean` | `true` |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值改变时触发 | `(value?: string)` |
| ldesignVisibleChange | 弹层可见性变化 | `(visible: boolean)` |
