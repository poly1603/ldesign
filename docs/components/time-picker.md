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

## 步进控制

### 统一步进
使用 `steps` 属性可以分别设置时、分、秒的步长。格式为 `[小时步长, 分钟步长, 秒步长]`。

<div class="demo-block">
  <ldesign-time-picker steps="[1, 15, 30]" placeholder="时:15分钟间隔:30秒间隔"></ldesign-time-picker>
</div>

```html
<!-- 小时步长为1，分钟步长为15，秒步长为30 -->
<ldesign-time-picker steps="[1, 15, 30]" placeholder="时:15分钟间隔:30秒间隔"></ldesign-time-picker>
```

### 常用步进示例

<div class="demo-block">
  <p>每5分钟：</p>
  <ldesign-time-picker steps="[1, 5, 1]" show-seconds="false"></ldesign-time-picker>
  
  <p style="margin-top: 10px;">每30分钟：</p>
  <ldesign-time-picker steps="[1, 30, 1]" show-seconds="false"></ldesign-time-picker>
  
  <p style="margin-top: 10px;">每2小时：</p>
  <ldesign-time-picker steps="[2, 1, 1]" show-seconds="false"></ldesign-time-picker>
</div>

```html
<!-- 每5分钟 -->
<ldesign-time-picker steps="[1, 5, 1]" show-seconds="false"></ldesign-time-picker>

<!-- 每30分钟 -->
<ldesign-time-picker steps="[1, 30, 1]" show-seconds="false"></ldesign-time-picker>

<!-- 每2小时 -->
<ldesign-time-picker steps="[2, 1, 1]" show-seconds="false"></ldesign-time-picker>
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

## 12 小时制

<div class="demo-block">
  <!-- 输出为 12 小时制字符串（含 AM/PM） -->
  <ldesign-time-picker output-format="12h" value="14:30:00"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker output-format="12h" value="14:30:00"></ldesign-time-picker>
<!-- 输出: 02:30:00 PM -->
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
| steps | 时分秒的步长设置 | `number[]` | `[1, 1, 1]` |
| min-time | 最小时间（含） | `string` | - |
| max-time | 最大时间（含） | `string` | - |
| disabled-hours | 禁用小时集合（数组或 JSON 字符串） | `number[] | string` | - |
| disabled-minutes | 禁用分钟集合 | `number[] | string` | - |
| disabled-seconds | 禁用秒集合 | `number[] \| string` | - |
| output-format | 输出格式：12小时制或24小时制 | `'12h' \| '24h'` | `'24h'` |
| confirm | 是否需要点击“确定”确认 | `boolean` | `true` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值改变时触发 | `(value?: string)` |
| ldesignVisibleChange | 弹层可见性变化 | `(visible: boolean)` |
