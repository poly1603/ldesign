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

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;">
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

<div class="demo-container" style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
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

## 事件

- `ldesignChange`：选中日期时触发，`detail` 为格式化字符串（默认 `YYYY-MM-DD`）。

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
| first-day-of-week | 一周起始日（0-周日，1-周一 ... 6-周六） | `0-6` | `1` |
| show-week-numbers | 是否显示周序号 | `boolean` | `false` |
| min-date | 最小日期（含） | `string` | - |
| max-date | 最大日期（含） | `string` | - |

> 注：需要按逻辑禁用日期时，请通过设置元素实例的 `disabledDate: (date: Date) => boolean` 属性实现。
