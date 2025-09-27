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

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 选中日期变化 | `detail: string` （格式化日期） |
| ldesignEventClick | 点击日程项 | `detail: { event: CalendarEvent }` |
| ldesignEventCreate | 新增日程（右键/双击） | `detail: CreateEventDetail` |
| ldesignEventEdit | 编辑日程（双击/右键） | `detail: { event: CalendarEvent }` |
| ldesignEventDelete | 删除日程（右键） | `detail: { event: CalendarEvent }` |
| ldesignBeforeDrop | 拖拽释放前（可取消） | `detail: DropEventDetail` |
| ldesignBeforeResize | 缩放释放前（可取消） | `detail: ResizeEventDetail` |
| ldesignEventDrop | 拖拽释放后 | `detail: DropEventDetail` |
| ldesignEventResize | 缩放释放后 | `detail: ResizeEventDetail` |

#### 事件详情类型

```typescript
interface CalendarEvent {
  id?: string;
  title: string;
  date?: string;        // YYYY-MM-DD（月视图简化时使用）
  start?: string;       // ISO 字符串，例如 2025-09-02T09:00:00
  end?: string;         // ISO 字符串
  allDay?: boolean;     // 是否全天事件
  color?: string;       // CSS 颜色
  type?: 'dot' | 'bg';  // 渲染风格（预留）
}

interface CreateEventDetail {
  date?: string;        // YYYY-MM-DD（月视图）
  start?: string;       // ISO 字符串（周/日视图）
  end?: string;         // ISO 字符串（周/日视图）
  allDay?: boolean;     // 是否全天事件
  x?: number;           // 鼠标X坐标
  y?: number;           // 鼠标Y坐标
}

interface DropEventDetail {
  id?: string;
  title: string;
  oldStart?: string;
  oldEnd?: string;
  newStart: string;
  newEnd: string;
  allDay?: boolean;
}

interface ResizeEventDetail {
  id?: string;
  title: string;
  oldStart: string;
  oldEnd: string;
  newStart: string;
  newEnd: string;
}
```

#### 拦截事件示例

```javascript
// 拦截拖拽：禁止移动到周末
const cal = document.querySelector('ldesign-calendar');
cal.addEventListener('ldesignBeforeDrop', (e) => {
  const newStart = new Date(e.detail.newStart);
  if (newStart.getDay() === 0 || newStart.getDay() === 6) {
    e.preventDefault(); // 取消拖拽
  }
});

// 拦截缩放：限制最大时长为 4 小时
cal.addEventListener('ldesignBeforeResize', (e) => {
  const start = new Date(e.detail.newStart);
  const end = new Date(e.detail.newEnd);
  const hours = (end - start) / (1000 * 60 * 60);
  if (hours > 4) {
    e.preventDefault(); // 取消缩放
  }
});
```

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

## 约束与拦截（高级）

- 吸附与时长
  - snap-to-grid: 是否按步长吸附（默认 true）
  - min-duration: 最小时长（分钟，默认 15）
  - max-duration: 最大时长（分钟，可选）
- 跨周
  - allow-cross-week: 周/日视图拖拽/Resize 是否允许跨周（预留，默认 true）
  - allow-month-cross-week: 月视图跨日条拖拽/Resize 是否允许跨周（当前默认 true；如设为 false，会限制在同周行内）
- 拦截事件（可取消）
  - ldesignBeforeDrop/ldesignBeforeResize：在 drop/resize 前触发；在监听器里 event.preventDefault() 可阻止本次变更

```html
<ldesign-calendar
  view="week"
  draggable-events
  resizable-events
  min-duration="30"
  max-duration="240"
  snap-to-grid>
</ldesign-calendar>
<script>
  const cal = document.querySelector('ldesign-calendar');
  cal.addEventListener('ldesignBeforeDrop', (e) => {
    // 例如：不允许 22:00 以后
    const end = new Date(e.detail.newEnd);
    if (end.getHours() >= 22) e.preventDefault();
  });
</script>
```

## API

### 属性（Props）

#### 基础属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| value | 当前值（受控） | `string` | - |
| default-value | 默认值（非受控） | `string` | - |
| format | 展示/输出格式 | `string` | `YYYY-MM-DD` |
| view | 视图 | `'month' │ 'year' │ 'week' │ 'day'` | `'month'` |
| first-day-of-week | 一周起始日（0-周日，1-周一...6-周六） | `0-6` | `1` |
| show-week-numbers | 是否显示周序号 | `boolean` | `false` |
| min-date | 最小日期（含） | `string` | - |
| max-date | 最大日期（含） | `string` | - |

#### 农历相关

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| show-lunar | 是否显示农历 | `boolean` | `false` |
| lunar-formatter | 自定义农历格式化函数（JS 设置） | `(d: Date) => string` | - |

#### 事件/日程相关

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| events | 日程数据（JSON 字符串） | `string` | - |
| events-data | 日程数据（JS 设置） | `CalendarEvent[]` | - |
| max-events-per-cell | 单元格最多显示数 | `number` | `3` |
| max-all-day-rows | 全天区域最多显示行数 | `number` | `3` |

#### 周/日视图相关

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| hour-start | 起始小时 | `number` | `8` |
| hour-end | 结束小时 | `number` | `20` |
| step-minutes | 时间步长（分钟） | `number` | `30` |
| show-all-day | 是否显示全天区域 | `boolean` | `true` |

#### 交互与约束

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| draggable-events | 启用事件拖拽 | `boolean` | `false` |
| resizable-events | 启用事件缩放 | `boolean` | `false` |
| min-duration | 最小时长（分钟） | `number` | `15` |
| max-duration | 最大时长（分钟） | `number` | - |
| snap-to-grid | 吸附到网格 | `boolean` | `true` |
| allow-cross-week | 周/日视图允许跨周 | `boolean` | `true` |
| allow-month-cross-week | 月视图允许跨周 | `boolean` | `true` |

#### CRUD 相关

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| enable-crud | 启用内置 CRUD 功能 | `boolean` | `true` |
| event-create-handler | 自定义新增处理器 | `Function` | - |
| event-edit-handler | 自定义编辑处理器 | `Function` | - |
| event-delete-handler | 自定义删除处理器 | `Function` | - |

> **注意**：
> - 需要按逻辑禁用日期时，请通过设置元素实例的 `disabledDate: (date: Date) => boolean` 属性实现。
> - 月视图中，拖拽/缩放时 `min-duration` 和 `max-duration` 会按天数进行转换：minDays = ceil(minDuration/1440)，maxDays = floor(maxDuration/1440)。

## 内置日程管理（CRUD）

日历组件内置了完整的日程管理功能，包括：
- **内置 Modal 表单**：自动弹出美观的表单弹窗进行新增/编辑
- **内部状态管理**：组件内部维护日程列表，无需外部处理
- **自定义处理器**：支持覆盖默认行为，与后端集成

### 基本用法（内置功能）

```html
<!-- 默认启用内置 CRUD 功能 -->
<ldesign-calendar 
  enable-crud="true"
  events-data='[]'>
</ldesign-calendar>
```

### 自定义处理器

```html
<ldesign-calendar id="cal-custom">
</ldesign-calendar>

<script>
  const cal = document.getElementById('cal-custom');
  
  // 自定义新增处理
  cal.eventCreateHandler = async (detail) => {
    // 调用后端 API
    const response = await fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify(detail)
    });
    
    if (response.ok) {
      const newEvent = await response.json();
      // 更新日程列表
      cal.eventsData = [...cal.eventsData, newEvent];
      return true; // 成功
    }
    return false; // 失败
  };
  
  // 自定义编辑处理
  cal.eventEditHandler = async (event) => {
    // 显示自定义弹窗或调用 API
    const response = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      body: JSON.stringify(event)
    });
    return response.ok;
  };
  
  // 自定义删除处理
  cal.eventDeleteHandler = async (event) => {
    if (confirm(`确认删除 ${event.title}?`)) {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE'
      });
      return response.ok;
    }
    return false;
  };
</script>
```

### 仅事件模式（禁用内置功能）

```html
<!-- 禁用内置 CRUD，仅触发事件 -->
<ldesign-calendar 
  enable-crud="false"
  id="cal-events-only">
</ldesign-calendar>

<script>
  const cal = document.getElementById('cal-events-only');
  
  // 监听事件自行处理
  cal.addEventListener('ldesignEventCreate', (e) => {
    // 显示自定义弹窗
    openCustomModal(e.detail);
  });
</script>
```

## 右键菜单与日程 CRUD

日历组件内置了右键菜单功能，支持新增、编辑、删除日程操作：

### 交互方式

1. **新增日程**
   - 右键点击空白区域，选择“新增日程”
   - 双击空白区域
   - 触发 `ldesignEventCreate` 事件

2. **编辑日程**
   - 双击日程项
   - 右键点击日程，选择“编辑”
   - 触发 `ldesignEventEdit` 事件

3. **删除日程**
   - 右键点击日程，选择“删除”
   - 触发 `ldesignEventDelete` 事件

### 示例

```html
<ldesign-calendar 
  id="cal-crud"
  events='[
    {"id":"1","date":"2025-09-27","title":"会议","color":"#1677ff"}
  ]'>
</ldesign-calendar>

<script>
  const cal = document.getElementById('cal-crud');
  
  // 处理新增日程
  cal.addEventListener('ldesignEventCreate', (e) => {
    console.log('新增日程', e.detail);
    // 显示新增弹窗，并使用 e.detail.date 或 e.detail.start/end
    // 完成后更新 events-data
  });
  
  // 处理编辑日程
  cal.addEventListener('ldesignEventEdit', (e) => {
    console.log('编辑日程', e.detail.event);
    // 显示编辑弹窗，加载 e.detail.event 数据
    // 完成后更新 events-data
  });
  
  // 处理删除日程
  cal.addEventListener('ldesignEventDelete', (e) => {
    if (confirm('确认删除该日程吗？')) {
      console.log('删除日程', e.detail.event);
      // 从 events-data 中移除该日程
    }
  });
</script>
```

## 高级交互与事件（补充）

- 视图：除 `'month'｜'year'` 外，组件还支持 `'week'｜'day'`。
- 月视图跨周拖拽 / 缩放：开启 `draggable-events` / `resizable-events` 后，
  - 拖拽条形可改变起始日期（保持时长不变）。
  - 通过条首/条尾手柄分别仅调整开始/结束日期。
  - `allow-month-cross-week` 控制是否允许跨周（默认 true）。
  - 拖拽/缩放过程中带有半透明“ghost 预览”，跨多周时按周行拆分显示。
- 约束：
  - `min-duration`（分钟）会按天数向上取整为 `minDays=ceil(minDuration/1440)`，至少 1 天；
  - `max-duration`（分钟）若设置，会按天数向下取整为 `maxDays=floor(maxDuration/1440)`；
  - 自动避免起止反转，并将超出范围夹取到合法区间。
- 相关事件：
  - `ldesignBeforeDrop(detail)` / `ldesignBeforeResize(detail)`：释放前触发，支持 `event.preventDefault()` 取消。
  - `ldesignEventDrop(detail)` / `ldesignEventResize(detail)`：释放后触发，返回变更后的起止时间。

示例：

```html
<ldesign-calendar
  view="month"
  draggable-events
  resizable-events
  allow-month-cross-week
  min-duration="1440"  <!-- 至少 1 天 -->
  max-duration="10080" <!-- 最多 7 天 -->
  events='[
    {"title":"跨日任务","start":"2025-09-02T00:00:00","end":"2025-09-05T23:59:59","allDay":true,"color":"#1677ff"}
  ]'>
</ldesign-calendar>
<script>
  const cal = document.querySelector('ldesign-calendar');
  cal.addEventListener('ldesignBeforeResize', (e) => {
    const s = new Date(e.detail.newStart);
    const t = new Date(e.detail.newEnd);
    const days = Math.floor((+new Date(t.getFullYear(), t.getMonth(), t.getDate()) - +new Date(s.getFullYear(), s.getMonth(), s.getDate()))/86400000) + 1;
    if (days < 1) e.preventDefault();
  });
  cal.addEventListener('ldesignEventDrop', (e) => {
    console.log('drop', e.detail);
  });
  cal.addEventListener('ldesignEventResize', (e) => {
    console.log('resize', e.detail);
  });
</script>
```
