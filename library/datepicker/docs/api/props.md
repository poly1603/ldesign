# Props API

DatePicker 组件的所有属性说明。

## 基础属性

### modelValue / value

- **类型**: `Date | Date[] | [Date, Date] | null`
- **默认值**: `null`
- **说明**: 绑定值

不同 `type` 对应不同的值类型：

| type | 值类型 |
|------|--------|
| date / month / year / quarter / datetime / time | Date \| null |
| dates | Date[] |
| daterange / datetimerange / monthrange / yearrange | [Date \| null, Date \| null] |

**示例**:

```vue
<!-- Vue -->
<DatePicker v-model="date" />

<!-- React -->
<DatePicker value={date} onChange={setDate} />
```

### type

- **类型**: `PickerType`
- **默认值**: `'date'`
- **说明**: 选择器类型

可选值：

- `'date'` - 日期选择
- `'dates'` - 多个日期
- `'week'` - 星期选择
- `'month'` - 月份选择
- `'year'` - 年份选择
- `'quarter'` - 季度选择
- `'datetime'` - 日期时间
- `'time'` - 时间选择
- `'daterange'` - 日期范围
- `'datetimerange'` - 日期时间范围
- `'monthrange'` - 月份范围
- `'yearrange'` - 年份范围

**示例**:

```vue
<DatePicker type="daterange" />
```

## 格式化属性

### format

- **类型**: `string`
- **默认值**: 根据 `type` 自动设置
- **说明**: 显示在输入框中的格式

默认格式：

| type | 默认格式 |
|------|----------|
| date / dates | YYYY-MM-DD |
| month | YYYY-MM |
| year | YYYY |
| quarter | YYYY-[Q]Q |
| datetime | YYYY-MM-DD HH:mm:ss |
| time | HH:mm:ss |

支持的格式标记：

- `YYYY` - 四位年份
- `YY` - 两位年份
- `MM` - 月份（补零）
- `M` - 月份
- `DD` - 日期（补零）
- `D` - 日期
- `HH` - 小时（24小时制，补零）
- `H` - 小时（24小时制）
- `hh` - 小时（12小时制，补零）
- `h` - 小时（12小时制）
- `mm` - 分钟（补零）
- `m` - 分钟
- `ss` - 秒（补零）
- `s` - 秒
- `A` - AM/PM
- `a` - am/pm

**示例**:

```vue
<DatePicker format="YYYY年MM月DD日" />
<DatePicker format="MM/DD/YYYY" />
<DatePicker format="YYYY-MM-DD HH:mm" />
```

### valueFormat

- **类型**: `string`
- **默认值**: `'YYYY-MM-DD HH:mm:ss'`
- **说明**: 绑定值的格式（用于字符串类型绑定值）

## 占位符属性

### placeholder

- **类型**: `string`
- **默认值**: `'选择日期'`
- **说明**: 非范围选择时的占位内容

### startPlaceholder

- **类型**: `string`
- **默认值**: `'开始日期'`
- **说明**: 范围选择时开始日期的占位内容

### endPlaceholder

- **类型**: `string`
- **默认值**: `'结束日期'`
- **说明**: 范围选择时结束日期的占位内容

### rangeSeparator

- **类型**: `string`
- **默认值**: `'至'`
- **说明**: 范围选择时的分隔符

**示例**:

```vue
<DatePicker
  type="daterange"
  start-placeholder="开始时间"
  end-placeholder="结束时间"
  range-separator="→"
/>
```

## 功能属性

### clearable

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否显示清空按钮

### editable

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否可手动输入

### disabled

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否禁用

### readonly

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否只读

## 高级属性

### disabledDate

- **类型**: `(date: Date) => boolean`
- **默认值**: `undefined`
- **说明**: 禁用日期的函数，返回 true 表示禁用该日期

**示例**:

```ts
// 禁用今天之前的日期
const disabledDate = (date: Date) => {
  return date < new Date();
};

// 禁用周末
const disableWeekends = (date: Date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};
```

### disabledTime

- **类型**: `(date: Date) => { disabledHours?: number[], disabledMinutes?: number[], disabledSeconds?: number[] }`
- **默认值**: `undefined`
- **说明**: 禁用时间的函数

**示例**:

```ts
const disabledTime = (date: Date) => {
  return {
    disabledHours: [0, 1, 2, 3, 4, 5], // 禁用 0-5 点
    disabledMinutes: [0, 30], // 禁用 0 分和 30 分
  };
};
```

### shortcuts

- **类型**: `Shortcut[]`
- **默认值**: `[]`
- **说明**: 快捷选项配置

```ts
interface Shortcut {
  text: string;
  value: Date | [Date, Date] | (() => Date | [Date, Date]);
}
```

**示例**:

```ts
const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    },
  },
];
```

### defaultValue

- **类型**: `Date | [Date, Date]`
- **默认值**: `undefined`
- **说明**: 默认显示的日期

### defaultTime

- **类型**: `Date | [Date, Date]`
- **默认值**: `undefined`
- **说明**: 范围选择时，选中日期后的默认具体时刻

## 国际化属性

### locale

- **类型**: `Locale`
- **默认值**: 系统默认（中文）
- **说明**: 语言配置对象

**示例**:

```vue
<script setup>
import { enUS, zhCN } from '@ldesign/datepicker-shared';

// 使用英文
<DatePicker :locale="enUS" />

// 使用中文
<DatePicker :locale="zhCN" />
</script>
```

### weekStartsOn

- **类型**: `0 | 1 | 2 | 3 | 4 | 5 | 6`
- **默认值**: `1` (周一)
- **说明**: 周起始日，0 表示周日

### use12Hours

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否使用 12 小时制

### showWeekNumber

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否显示周数

## 样式属性

### prefixIcon

- **类型**: `string`
- **默认值**: `undefined`
- **说明**: 自定义前缀图标

### clearIcon

- **类型**: `string`
- **默认值**: `undefined`
- **说明**: 自定义清空图标

### cellClassName

- **类型**: `(date: Date) => string`
- **默认值**: `undefined`
- **说明**: 自定义日期单元格的类名

## 面板属性

### unlinkPanels

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 在范围选择器里取消两个日期面板之间的联动

### validateEvent

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否触发表单验证




