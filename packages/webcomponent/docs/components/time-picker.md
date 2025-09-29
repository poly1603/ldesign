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
  <ldesign-time-picker output-format="12h" placeholder="选择时间"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker output-format="12h" placeholder="选择时间"></ldesign-time-picker>
```

## 12 小时制不显示秒

<div class="demo-container">
  <ldesign-time-picker output-format="12h" show-seconds="false" placeholder="12h HH:mm"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker output-format="12h" show-seconds="false" placeholder="12h HH:mm"></ldesign-time-picker>
```

## 时间步进设置

设置小时、分钟、秒的步进间隔，让用户只能选择特定的时间点。

<div class="demo-container">
  <ldesign-time-picker
    hour-step="2"
    minute-step="15"
    second-step="30"
    placeholder="步进: 时2 分15 秒30"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  hour-step="2"
  minute-step="15" 
  second-step="30"
  placeholder="步进: 时2 分15 秒30"
></ldesign-time-picker>
```

## 范围限制

通过 `min-time` 和 `max-time` 限制可选时间范围。

<div class="demo-container">
  <ldesign-time-picker
    min-time="09:30:00"
    max-time="18:00:00"
    placeholder="09:30 - 18:00"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  min-time="09:30:00"
  max-time="18:00:00"
  placeholder="09:30 - 18:00"
></ldesign-time-picker>
```

## 禁用特定时间

可以禁用特定的小时、分钟或秒数。

<div class="demo-container">
  <ldesign-time-picker
    disabled-hours='[0,1,2,22,23]'
    disabled-minutes='[0,15,30,45]'
    placeholder="部分时间已禁用"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  disabled-hours='[0,1,2,22,23]'
  disabled-minutes='[0,15,30,45]'
  placeholder="部分时间已禁用"
></ldesign-time-picker>
```

## 组合使用：范围+禁用+步进

<div class="demo-container">
  <ldesign-time-picker
    min-time="09:00:00"
    max-time="18:00:00"
    disabled-hours='[12,13]'
    minute-step="5"
    show-seconds="false"
    placeholder="工作时间选择"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker
  min-time="09:00:00"
  max-time="18:00:00"
  disabled-hours='[12,13]'
  minute-step="5"
  show-seconds="false"
  placeholder="工作时间选择"
></ldesign-time-picker>
```

## 预设时间

提供常用时间选项，方便快速选择。

<div class="demo-container">
  <ldesign-time-picker 
    id="tp-presets"
    placeholder="选择或使用预设时间"
  ></ldesign-time-picker>
</div>

```html
<ldesign-time-picker 
  id="tp-presets"
  placeholder="选择或使用预设时间"
></ldesign-time-picker>
<script>
  const picker = document.getElementById('tp-presets');
  picker.presets = [
    { label: '早上9点', value: '09:00:00' },
    { label: '中午12点', value: '12:00:00' },
    { label: '下午6点', value: '18:00:00' },
    { label: '晚上9点', value: '21:00:00' }
  ];
</script>
```

## 内联模式

不使用弹层，直接显示时间选择面板。

<div class="demo-container">
  <ldesign-time-picker inline="true" show-seconds="false"></ldesign-time-picker>
</div>

```html
<ldesign-time-picker inline="true" show-seconds="false"></ldesign-time-picker>
```

## 事件

<div class="demo-container">
  <ldesign-time-picker id="tp-event" clearable confirm="false"></ldesign-time-picker>
  <div id="tp-event-log" style="margin-top:8px;color:#666;font-size:13px;">等待选择...</div>
</div>

```html
<ldesign-time-picker id="tp-event" clearable confirm="false"></ldesign-time-picker>
<div id="tp-event-log">等待选择...</div>
<script>
  const el = document.getElementById('tp-event');
  const log = document.getElementById('tp-event-log');
  el.addEventListener('ldesignChange', (e) => {
    log.textContent = 'change: ' + (e.detail ?? 'undefined');
  });
  el.addEventListener('ldesignPick', (e) => {
    console.log('pick:', e.detail);
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
| placeholder | 占位文案 | `string` | `选择时间` |
| disabled | 是否禁用 | `boolean` | `false` |
| readonly | 是否只读 | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| clearable | 是否可清空 | `boolean` | `false` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |

#### 时间格式

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| output-format | 输出格式 | `'24h' \| '12h'` | `'24h'` |
| show-seconds | 是否显示秒 | `boolean` | `true` |
| show-now | 是否显示"此刻"按钮 | `boolean` | `true` |

#### 时间步进

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| hour-step | 小时步进（1-12） | `number` | `1` |
| minute-step | 分钟步进（1-30） | `number` | `1` |
| second-step | 秒步进（1-30） | `number` | `1` |
| steps | 步进数组 [时,分,秒]（已废弃，请使用独立属性） | `number[]` | `[1,1,1]` |

#### 范围与限制

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| min-time | 最小时间（含），格式："HH:mm:ss" | `string` | - |
| max-time | 最大时间（含），格式："HH:mm:ss" | `string` | - |
| disabled-hours | 禁用的小时数组 | `number[] \| string` | - |
| disabled-minutes | 禁用的分钟数组 | `number[] \| string` | - |
| disabled-seconds | 禁用的秒数数组 | `number[] \| string` | - |

#### 交互模式

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| confirm | 是否需要点击"确定"确认 | `boolean` | `true` |
| inline | 内联模式（直接显示面板） | `boolean` | `false` |
| trigger | 触发方式 | `'click' \| 'focus' \| 'manual'` | `'click'` |
| placement | 弹层位置 | `Placement` | `'bottom-start'` |
| visible | 手动控制显示（trigger='manual'时） | `boolean` | `false` |

#### 其他配置

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| presets | 预设时间选项 | `TimePreset[]` | - |
| locale | 国际化配置 | `TimePickerLocale` | - |
| panel-height | 面板高度 | `number` | - |
| visible-items | 可见选项数 | `number` | `5` |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值改变时触发 | `(value?: string)` |
| ldesignPick | 选择时间时触发 | `{ value: string; context: { trigger: string } }` |
| ldesignVisibleChange | 弹层可见性变化 | `(visible: boolean)` |
| ldesignOpen | 打开时触发 | `void` |
| ldesignClose | 关闭时触发 | `void` |

### 类型定义

```typescript
interface TimePreset {
  label: string;    // 显示文本
  value: string;    // 时间值，格式："HH:mm:ss"
  icon?: string;    // 图标名称（可选）
}

interface TimePickerLocale {
  placeholder?: string;  // 占位符文本
  now?: string;         // "此刻"按钮文本
  confirm?: string;     // "确定"按钮文本
  clear?: string;       // "清除"按钮文本
  am?: string;         // AM 显示文本
  pm?: string;         // PM 显示文本
}
```

### 使用示例

#### 基础用法

```javascript
// 获取组件实例
const picker = document.querySelector('ldesign-time-picker');

// 设置值
picker.value = '14:30:00';

// 监听变化
picker.addEventListener('ldesignChange', (e) => {
  console.log('新时间:', e.detail);
});

// 设置预设选项
picker.presets = [
  { label: '上班时间', value: '09:00:00', icon: 'work' },
  { label: '午餐时间', value: '12:00:00', icon: 'food' },
  { label: '下班时间', value: '18:00:00', icon: 'home' }
];

// 国际化
picker.locale = {
  placeholder: 'Select time',
  now: 'Now',
  confirm: 'OK',
  clear: 'Clear',
  am: 'AM',
  pm: 'PM'
};
```

### 注意事项

1. **时间格式**：
   - 24小时制：`"HH:mm:ss"` 或 `"HH:mm"`
   - 12小时制：`"HH:mm:ss AM/PM"` 或 `"HH:mm AM/PM"`

2. **步进设置**：
   - 步进值必须能被60整除（对于分钟和秒）
   - 步进值必须能被24整除（对于24小时制的小时）
   - 步进值必须能被12整除（对于12小时制的小时）

3. **范围限制**：
   - `min-time` 和 `max-time` 使用24小时制格式
   - 超出范围的时间会自动调整到最近的有效时间

4. **即时生效模式**：
   - 设置 `confirm="false"` 时，选择立即生效
   - 适用于不需要用户确认的场景

5. **禁用时间**：
   - 禁用的时间在选择器中会显示但不可选
   - 可以组合使用范围限制和禁用列表
