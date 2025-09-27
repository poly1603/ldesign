# Calendar 日历

基于月视图的基础日历组件，内联显示，不包含弹层。支持显示周序号、自定义一周起始日、最小/最大日期、按逻辑禁用日期、受控与非受控等能力。

- 组件标签：`<ldesign-calendar>`
- 适用场景：展示日期、进行内联日期选择

## 基础用法

<div class="demo-container">
  <ldesign-calendar></ldesign-calendar>
</div>

```html
<ldesign-calendar></ldesign-calendar>
```

## 显示周序号与自定义一周起始日

- `show-week-numbers`：在左侧显示 ISO 周序号。
- `first-day-of-week`：设置一周起始日（0-周日，1-周一 ... 6-周六）。

<div class="demo-container" style="display:flex;flex-direction:column;gap:16px;flex-wrap:wrap;width: 100%;">
  <ldesign-calendar show-week-numbers first-day-of-week="1"></ldesign-calendar>
  <ldesign-calendar show-week-numbers first-day-of-week="0"></ldesign-calendar>
</div>

```html
<ldesign-calendar show-week-numbers first-day-of-week="1"></ldesign-calendar>
<ldesign-calendar show-week-numbers first-day-of-week="0"></ldesign-calendar>
```

## 最小/最大日期与禁用日期

- `min-date`、`max-date`：限制可选范围（含边界）。
- 如需按逻辑禁用日期，请在脚本中为元素实例设置 `disabledDate: (d: Date) => boolean`。

<div class="demo-container">
  <ldesign-calendar id="cal-range" min-date="2024-01-01" max-date="2026-12-31"></ldesign-calendar>
</div>

```html
<ldesign-calendar id="cal-range" min-date="2024-01-01" max-date="2026-12-31"></ldesign-calendar>
<script>
  const el = document.getElementById('cal-range');
  // 禁用周末示例
  el.disabledDate = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };
</script>
```

## 受控与非受控

- 非受控：不设置 `value`，可选中后组件内部会更新自身状态，同时触发 `ldesignChange`。
- 受控：设置了 `value` attribute 时，组件不会内部改写值，需要外部在 `ldesignChange` 中回写 `value` 以驱动视图。

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;flex-direction: column;">
  <div>
    <div style="margin-bottom:8px;color:#666;">非受控（default-value）</div>
    <ldesign-calendar default-value="2025-09-27"></ldesign-calendar>
  </div>
  <div>
    <div style="margin-bottom:8px;color:#666;">受控（value + 回写）</div>
    <ldesign-calendar id="cal-ctrl" value="2025-09-27"></ldesign-calendar>
    <div id="cal-ctrl-log" style="margin-top:8px;color:#666;font-size:13px;"></div>
  </div>
</div>

```html
<ldesign-calendar default-value="2025-09-27"></ldesign-calendar>

<ldesign-calendar id="cal-ctrl" value="2025-09-27"></ldesign-calendar>
<div id="cal-ctrl-log"></div>
<script>
  const c = document.getElementById('cal-ctrl');
  const log = document.getElementById('cal-ctrl-log');
  c.addEventListener('ldesignChange', (e) => {
    // 受控：外部回写 value，保持 UI 与值一致
    c.value = e.detail;
    log.textContent = 'value = ' + e.detail;
  });
</script>
```

## 日程（Events）

通过 `events`（JSON 字符串）或 `eventsData`（JS 设置）传入当天日程；每格最多显示 `max-events-per-cell` 条，多余会以 `+N` 表示。

<div class="demo-container">
  <ldesign-calendar id="cal-events" style="max-width: 920px; display:block;"
    first-day-of-week="1"
    events='[
      {"date":"2025-09-02","title":"产品评审","color":"#1677ff"},
      {"date":"2025-09-02","title":"UI 联调","color":"#52c41a"},
      {"date":"2025-09-02","title":"数据同步","color":"#faad14"},
      {"date":"2025-09-27","title":"版本发布","color":"#1677ff"}
    ]'>
  </ldesign-calendar>
</div>

```html
<ldesign-calendar
  events='[
    {"date":"2025-09-02","title":"产品评审","color":"#1677ff"},
    {"date":"2025-09-02","title":"UI 联调","color":"#52c41a"},
    {"date":"2025-09-02","title":"数据同步","color":"#faad14"}
  ]'
  max-events-per-cell="3">
</ldesign-calendar>
```

> 也可以通过 JS 直接设置 `eventsData: CalendarEvent[]`，并监听 `ldesignEventClick` 获取被点击的日程项。

## 周 / 日视图

- 设置 view="week" 或 view="day"，可渲染时间网格（默认 8:00 - 20:00，30 分钟步长，可配置）。
- 通过 events / events-data 传入带时间的事件：{ title, start, end, allDay?, color? }。

<div class="demo-container" style="max-width: 980px;">
  <ldesign-calendar
    id="cal-week"
    view="week"
    first-day-of-week="1"
    hour-start="8"
    hour-end="20"
    step-minutes="30"
    events='[
      {"title":"需求评审","start":"2025-09-01T09:00:00","end":"2025-09-01T10:30:00","color":"#1677ff"},
      {"title":"代码走查","start":"2025-09-01T09:30:00","end":"2025-09-01T11:00:00","color":"#52c41a"},
      {"title":"设计联调","start":"2025-09-03T14:00:00","end":"2025-09-03T15:00:00","color":"#faad14"}
    ]'>
  </ldesign-calendar>
</div>

```html
<ldesign-calendar
  view="week"
  hour-start="8"
  hour-end="20"
  step-minutes="30"
  events='[
    {"title":"需求评审","start":"2025-09-01T09:00:00","end":"2025-09-01T10:30:00"}
  ]'>
</ldesign-calendar>
```

> 新增：基础“全天条”和每列的“+N”更多按钮（周视图）。跨日条在月视图、拖拽和更丰富弹层即将继续补充。

## 农历（Lunar）

开启 `show-lunar` 可在单元格右上角展示农历日期。组件会优先使用 `lunarFormatter`（若提供），否则在支持的浏览器中使用 `Intl` 的 Chinese Calendar 获取农历日。

<div class="demo-container">
  <ldesign-calendar show-lunar first-day-of-week="1"></ldesign-calendar>
</div>

```html
<ldesign-calendar show-lunar first-day-of-week="1"></ldesign-calendar>

<!-- 自定义农历格式化： -->
<script>
  const c = document.querySelector('ldesign-calendar');
  c.lunarFormatter = (d) => {
    // 返回任意字符串作为展示
    return '初' + String((d.getDate() % 10) || 10);
  };
</script>
```

## 事件（Events）

- `ldesignChange`：选中日期时触发，`detail` 为格式化字符串（默认 `YYYY-MM-DD`）。
- `ldesignEventClick`：点击某条日程时触发，`detail.event` 为被点击的事件对象。

<div class="demo-container">
  <ldesign-calendar id="cal-evt"></ldesign-calendar>
  <div id="cal-evt-log" style="margin-top:8px;color:#666;font-size:13px;"></div>
</div>

```html
<ldesign-calendar id="cal-evt"></ldesign-calendar>
<div id="cal-evt-log"></div>
<script>
  const el = document.getElementById('cal-evt');
  const log = document.getElementById('cal-evt-log');
  el.addEventListener('ldesignChange', (e) => {
    log.textContent = 'change: ' + e.detail;
  });
</script>
```

## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控） | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| format | 展示/输出格式 | `string` | `YYYY-MM-DD` |
| view | 视图 | `'month'｜'year'` | `'month'` |
| first-day-of-week | 一周起始日（0-周日，1-周一 ... 6-周六） | `0-6` | `1` |
| show-week-numbers | 是否显示周序号 | `boolean` | `false` |
| show-lunar | 是否显示农历 | `boolean` | `false` |
| lunar-formatter | 自定义农历格式化函数（JS 设置） | `(d: Date)=>string` | - |
| events | 日程（JSON 字符串） | `string` | - |
| events-data | 日程（JS 设置） | `Array<{ date:string; title:string; color?:string; type?:'dot'|'bg' }>` | - |
| max-events-per-cell | 单元格最多展示的日程数 | `number` | `3` |
| min-date | 最小日期（含） | `string` | - |
| max-date | 最大日期（含） | `string` | - |

> 注：需要按逻辑禁用日期时，请通过设置元素实例的 `disabledDate: (date: Date) => boolean` 属性实现。
