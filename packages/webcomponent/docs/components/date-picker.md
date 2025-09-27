# DatePicker 日期选择器

基于 `<ldesign-popup>` 的日期选择组件，支持 年/季/月/周/日 等多种选择模式，支持最小/最大日期、禁用日期、周起始日与显示周序号等配置。

- 组件标签：`<ldesign-date-picker>`
- 依赖：`<ldesign-popup>`

## 基础用法

<div class="demo-container">
  <ldesign-date-picker placeholder="请选择日期"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker placeholder="请选择日期"></ldesign-date-picker>
```

## 选择模式（年/季/月/周/日/日期时间）

通过 `mode` 指定选择维度：`date | week | month | quarter | year | datetime`。

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
  <ldesign-date-picker mode="date" placeholder="日"></ldesign-date-picker>
  <ldesign-date-picker mode="week" placeholder="周" show-week-numbers></ldesign-date-picker>
  <ldesign-date-picker mode="month" placeholder="月"></ldesign-date-picker>
  <ldesign-date-picker mode="quarter" placeholder="季"></ldesign-date-picker>
  <ldesign-date-picker mode="year" placeholder="年"></ldesign-date-picker>
  <ldesign-date-picker mode="datetime" placeholder="日期时间"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker mode="date" placeholder="日" />
<ldesign-date-picker mode="week" placeholder="周" show-week-numbers />
<ldesign-date-picker mode="month" placeholder="月" />
<ldesign-date-picker mode="quarter" placeholder="季" />
<ldesign-date-picker mode="year" placeholder="年" />
<ldesign-date-picker mode="datetime" placeholder="日期时间" />
```

## 范围选择（Range）

通过 `range` 开启范围选择：
- `value` / `default-value` 支持字符串（推荐分隔符为 `->`，也支持 `,`、`~`、`至`、`-`、`—` 等）或字符串数组（通过 JS 赋值）。
- `ldesignChange` 事件在范围模式下的 `detail` 为 `[start, end]` 字符串数组，格式与当前 `mode/format` 一致：
  - date: `YYYY-MM-DD`
  - datetime: 默认 `YYYY-MM-DD HH:mm:ss`（可用 `format` 覆盖）
  - week: `YYYY-WW周`（如 `2025-13周`）
  - month: `YYYY-MM`
  - quarter: `YYYY-QN`（如 `2025-Q2`）
  - year: `YYYY`
- 在 `date`/`datetime` 范围下为双月面板；`datetime` 下右侧时间面板会绑定到当前活动端（开始或结束）。

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
  <ldesign-date-picker range placeholder="日期范围"></ldesign-date-picker>
  <ldesign-date-picker range placeholder="字符串默认值" default-value="2025-01-01 -> 2025-01-10"></ldesign-date-picker>
  <ldesign-date-picker range mode="week" show-week-numbers placeholder="周范围"></ldesign-date-picker>
  <ldesign-date-picker range mode="month" placeholder="月份范围"></ldesign-date-picker>
  <ldesign-date-picker range mode="quarter" placeholder="季度范围"></ldesign-date-picker>
  <ldesign-date-picker range mode="year" placeholder="年份范围"></ldesign-date-picker>
</div>

```html
<!-- 开启范围选择 -->
<ldesign-date-picker range placeholder="日期范围"></ldesign-date-picker>

<!-- 字符串默认值，分隔符可为 -> / , / ~ / 至 / - / — -->
<ldesign-date-picker range placeholder="字符串默认值" default-value="2025-01-01 -> 2025-01-10"></ldesign-date-picker>

<!-- 其他模式：week / month / quarter / year -->
<ldesign-date-picker range mode="week" show-week-numbers placeholder="周范围"></ldesign-date-picker>
<ldesign-date-picker range mode="month" placeholder="月份范围"></ldesign-date-picker>
<ldesign-date-picker range mode="quarter" placeholder="季度范围"></ldesign-date-picker>
<ldesign-date-picker range mode="year" placeholder="年份范围"></ldesign-date-picker>
```

### 日期时间范围

<div class="demo-container">
  <ldesign-date-picker range mode="datetime" placeholder="日期时间范围"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker range mode="datetime" placeholder="日期时间范围"></ldesign-date-picker>
```

### 通过 JS 设置数组值并监听变化

<div class="demo-container">
  <ldesign-date-picker id="dp-date-range-doc" range></ldesign-date-picker>
  <div id="dp-date-range-doc-log" style="margin-top:8px;color:#666;font-size:13px;"></div>
</div>

```html
<ldesign-date-picker id="dp-date-range-doc" range></ldesign-date-picker>
<div id="dp-date-range-doc-log"></div>
<script>
  const el = document.getElementById('dp-date-range-doc');
  el.value = ['2025-02-01', '2025-02-07'];
  el.addEventListener('ldesignChange', (e) => {
    const [start, end] = e.detail || [];
    document.getElementById('dp-date-range-doc-log').textContent = 'range: ' + start + ' -> ' + end;
  });
</script>
```

> 提示：需要按逻辑禁用日期时，通过 JS 设置元素实例的 `disabledDate(date: Date): boolean` 属性，而不是使用 attribute。

## 日期时间模式

在 `mode="datetime"` 下，日期选择器会在弹层中联动显示时间选择器：
- 默认输出格式为 `YYYY-MM-DD HH:mm:ss`，可通过 `format` 覆盖；
- 通过 `time-show-seconds` 控制是否显示秒；
- 通过 `time-steps="[h, m, s]"` 设置小时/分钟/秒的步长，例如 `time-steps="[1, 15, 1]"` 表示分钟每 15 递增；
- 选中后会触发 `ldesignChange`，`detail` 为格式化后的完整日期时间字符串。

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
  <ldesign-date-picker mode="datetime" placeholder="默认（含秒）"></ldesign-date-picker>
  <ldesign-date-picker mode="datetime" placeholder="每 15 分钟" time-show-seconds="false" time-steps="[1,15,1]"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker mode="datetime" placeholder="默认（含秒）" />
<ldesign-date-picker mode="datetime" placeholder="每 15 分钟" time-show-seconds="false" time-steps="[1,15,1]" />
```

## 显示周序号与自定义一周起始日

- `show-week-numbers` 打开左侧周序号列（ISO 周）。
- `first-day-of-week` 设置一周起始日（0-周日，1-周一 ... 6-周六）。

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
  <ldesign-date-picker mode="date" show-week-numbers first-day-of-week="1" placeholder="周一为首日"></ldesign-date-picker>
  <ldesign-date-picker mode="week" show-week-numbers first-day-of-week="0" placeholder="周日为首日"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker mode="date" show-week-numbers first-day-of-week="1" />
<ldesign-date-picker mode="week" show-week-numbers first-day-of-week="0" />
```

## 最小/最大日期与禁用日期

- 使用 `min-date`、`max-date` 限制可选范围（含边界）。
- 如需按逻辑禁用日期，可在脚本里设置元素的 `disabledDate` 属性为一个函数。

<div class="demo-container">
  <ldesign-date-picker
    id="dp-range"
    min-date="2020-01-01"
    max-date="2029-12-31"
    placeholder="限制 2020-2029 年"
  ></ldesign-date-picker>
</div>

```html
<ldesign-date-picker id="dp-range" min-date="2020-01-01" max-date="2029-12-31" />
<script>
  // 禁用周末示例：通过设置 Web Component 的 prop（而不是 attribute）传入函数
  const el = document.getElementById('dp-range');
  el.disabledDate = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 周日或周六禁用
  };
</script>
```

## 占位、禁用、可清空与格式化

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
  <ldesign-date-picker placeholder="自定义占位"></ldesign-date-picker>
  <ldesign-date-picker disabled placeholder="禁用"></ldesign-date-picker>
  <ldesign-date-picker clearable placeholder="可清除"></ldesign-date-picker>
  <ldesign-date-picker format="YYYY-MM" mode="month" placeholder="YYYY-MM"></ldesign-date-picker>
</div>

```html
<ldesign-date-picker placeholder="自定义占位" />
<ldesign-date-picker disabled />
<ldesign-date-picker clearable />
<ldesign-date-picker format="YYYY-MM" mode="month" />
```

## 事件

- `ldesignChange`: 选中值变化时触发，`detail` 为格式化后的值或与 `mode` 对应的结构。
- `ldesignVisibleChange`: 弹层可见性变化。

<div class="demo-container">
  <ldesign-date-picker id="dp-event" clearable></ldesign-date-picker>
  <div id="dp-event-log" style="margin-top:8px;color:#666;font-size:13px;"></div>
</div>

```html
<ldesign-date-picker id="dp-event" clearable></ldesign-date-picker>
<div id="dp-event-log"></div>
<script>
  const el = document.getElementById('dp-event');
  const log = document.getElementById('dp-event-log');
  el.addEventListener('ldesignChange', (e) => {
    log.textContent = 'change: ' + JSON.stringify(e.detail);
  });
</script>
```

## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控） | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| placeholder | 占位文案 | `string` | `请选择日期` |
| disabled | 是否禁用 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `true` |
| format | 展示/输出格式 | `string` | `YYYY-MM-DD` |
| mode | 选择模式 | `'date'|'week'|'month'|'quarter'|'year'` | `'date'` |
| show-week-numbers | 是否显示周序号 | `boolean` | `false` |
| first-day-of-week | 一周起始日（0-周日，1-周一 ... 6-周六） | `0-6` | `1` |
| min-date | 最小日期（含） | `string` | - |
| max-date | 最大日期（含） | `string` | - |

> 注：在 `datetime` 模式下，若未设置 `format`，默认使用 `YYYY-MM-DD HH:mm:ss`。
> 注：需要按逻辑禁用日期时，请通过设置元素实例的 `disabledDate: (date: Date)=>boolean` 属性实现。

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值改变时触发 | `(value: string | { weekNumber:number; startDate:string; endDate:string })` |
| ldesignVisibleChange | 弹层可见性变化 | `(visible: boolean)` |
