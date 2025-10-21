# DatePicker 日期选择器

用于选择或输入日期。

## 基础用法

基本单日期选择器，值为 Date 类型。

::: code-group

```vue [Vue]
<template>
  <DatePicker v-model="date" placeholder="选择日期" />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);
</script>
```

```tsx [React]
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';

function App() {
  const [date, setDate] = useState(null);
  return <DatePicker value={date} onChange={setDate} placeholder="选择日期" />;
}
```

:::

## 选择模式

通过 `type` 属性可以设置不同的选择模式。

### 日期选择

```vue
<DatePicker v-model="date" type="date" />
```

### 多个日期

```vue
<DatePicker v-model="dates" type="dates" />
```

### 星期选择

```vue
<DatePicker v-model="week" type="week" />
```

### 月份选择

```vue
<DatePicker v-model="month" type="month" />
```

### 年份选择

```vue
<DatePicker v-model="year" type="year" />
```

### 季度选择

```vue
<DatePicker v-model="quarter" type="quarter" />
```

### 日期时间选择

```vue
<DatePicker v-model="datetime" type="datetime" />
```

### 时间选择

```vue
<DatePicker v-model="time" type="time" />
```

## 日期范围

选择日期范围。

```vue
<template>
  <DatePicker
    v-model="dateRange"
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
  />
</template>

<script setup>
import { ref } from 'vue';

const dateRange = ref([null, null]);
</script>
```

### 月份范围

```vue
<DatePicker
  v-model="monthRange"
  type="monthrange"
  start-placeholder="开始月份"
  end-placeholder="结束月份"
/>
```

### 年份范围

```vue
<DatePicker
  v-model="yearRange"
  type="yearrange"
  start-placeholder="开始年份"
  end-placeholder="结束年份"
/>
```

### 日期时间范围

```vue
<DatePicker
  v-model="datetimeRange"
  type="datetimerange"
  start-placeholder="开始时间"
  end-placeholder="结束时间"
/>
```

## 日期格式

使用 `format` 属性可以设置输入框中的格式。

```vue
<template>
  <DatePicker v-model="date" format="YYYY年MM月DD日" />
</template>
```

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

## 禁用日期

使用 `disabled-date` 可以禁用某些日期。

```vue
<template>
  <DatePicker v-model="date" :disabled-date="disabledDate" />
</template>

<script setup>
import { ref } from 'vue';

const date = ref(null);

// 禁用今天之前的日期
const disabledDate = (date) => {
  return date < new Date();
};
</script>
```

### 常见禁用场景

```vue
<script setup>
// 禁用周末
const disableWeekends = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// 禁用特定日期
const disableSpecificDates = (date) => {
  const disabledDates = [
    new Date(2024, 0, 1),
    new Date(2024, 11, 25),
  ];
  return disabledDates.some(d => 
    d.toDateString() === date.toDateString()
  );
};

// 禁用日期范围
const disableDateRange = (date) => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2024, 0, 31);
  return date >= start && date <= end;
};
</script>
```

## 快捷选项

使用 `shortcuts` 属性可以设置快捷选项。

```vue
<template>
  <DatePicker
    v-model="dateRange"
    type="daterange"
    :shortcuts="shortcuts"
  />
</template>

<script setup>
import { ref } from 'vue';

const dateRange = ref([null, null]);

const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      return [start, end];
    }
  },
  {
    text: '最近三月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 3);
      return [start, end];
    }
  }
];
</script>
```

### 预设快捷选项

可以使用内置的快捷选项：

```vue
<script setup>
import { createShortcuts } from '@ldesign/datepicker-shared';

const presets = createShortcuts();

const shortcuts = [
  presets.today,
  presets.yesterday,
  presets.last7Days,
  presets.last30Days,
  presets.thisMonth,
  presets.lastMonth,
];
</script>
```

## 清空和重置

### 可清空

通过 `clearable` 属性设置是否显示清空按钮。

```vue
<DatePicker v-model="date" clearable />
```

### 禁用清空

```vue
<DatePicker v-model="date" :clearable="false" />
```

## 禁用状态

```vue
<DatePicker v-model="date" disabled />
```

## 只读

```vue
<DatePicker v-model="date" :editable="false" />
```

## 尺寸

通过设置 CSS 变量来调整尺寸：

```css
.small-picker {
  --ldate-cell-size: 28px;
  --ldate-font-size: 12px;
}

.large-picker {
  --ldate-cell-size: 40px;
  --ldate-font-size: 16px;
}
```

## 自定义样式

通过 CSS 变量自定义主题：

```css
.custom-picker {
  --ldate-primary-color: #f56c6c;
  --ldate-border-radius: 8px;
  --ldate-cell-size: 40px;
}
```

## 事件

```vue
<template>
  <DatePicker
    v-model="date"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @clear="handleClear"
    @visible-change="handleVisibleChange"
  />
</template>

<script setup>
const handleChange = (value) => {
  console.log('值改变:', value);
};

const handleFocus = () => {
  console.log('聚焦');
};

const handleBlur = () => {
  console.log('失焦');
};

const handleClear = () => {
  console.log('清空');
};

const handleVisibleChange = (visible) => {
  console.log('面板显示状态:', visible);
};
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue / value | 绑定值 | Date / Date[] / [Date, Date] | - |
| type | 选择器类型 | PickerType | 'date' |
| format | 显示格式 | string | 'YYYY-MM-DD' |
| placeholder | 占位内容 | string | '选择日期' |
| start-placeholder | 范围选择开始占位内容 | string | '开始日期' |
| end-placeholder | 范围选择结束占位内容 | string | '结束日期' |
| range-separator | 范围分隔符 | string | '至' |
| clearable | 是否显示清空按钮 | boolean | true |
| editable | 是否可输入 | boolean | true |
| disabled | 是否禁用 | boolean | false |
| disabled-date | 禁用日期函数 | (date: Date) => boolean | - |
| shortcuts | 快捷选项 | Shortcut[] | [] |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 值改变时触发 | (value: PickerValue) => void |
| focus | 聚焦时触发 | () => void |
| blur | 失焦时触发 | () => void |
| clear | 清空时触发 | () => void |
| visible-change | 面板显示/隐藏时触发 | (visible: boolean) => void |




