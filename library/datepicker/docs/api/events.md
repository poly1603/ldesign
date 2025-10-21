# Events API

DatePicker 组件的所有事件说明。

## change

值改变时触发。

- **参数**: `(value: PickerValue) => void`
- **触发时机**: 用户选择日期后，值发生变化时

**示例**:

```vue
<template>
  <DatePicker v-model="date" @change="handleChange" />
</template>

<script setup>
const handleChange = (value) => {
  console.log('新值:', value);
  console.log('类型:', typeof value);
  
  if (value instanceof Date) {
    console.log('选中日期:', value.toLocaleDateString());
  }
};
</script>
```

## input

输入框值改变时触发（实时触发）。

- **参数**: `(value: PickerValue) => void`
- **触发时机**: 值变化时立即触发，包括输入过程中

**示例**:

```vue
<DatePicker v-model="date" @input="handleInput" />

<script setup>
const handleInput = (value) => {
  console.log('输入值:', value);
};
</script>
```

## focus

输入框获得焦点时触发。

- **参数**: `() => void`
- **触发时机**: 输入框聚焦时

**示例**:

```vue
<DatePicker @focus="handleFocus" />

<script setup>
const handleFocus = () => {
  console.log('输入框获得焦点');
};
</script>
```

## blur

输入框失去焦点时触发。

- **参数**: `() => void`
- **触发时机**: 输入框失焦时

**示例**:

```vue
<DatePicker @blur="handleBlur" />

<script setup>
const handleBlur = () => {
  console.log('输入框失去焦点');
};
</script>
```

## clear

清空按钮点击时触发。

- **参数**: `() => void`
- **触发时机**: 点击清空按钮后

**示例**:

```vue
<DatePicker v-model="date" clearable @clear="handleClear" />

<script setup>
const handleClear = () => {
  console.log('已清空');
  // 执行清空后的逻辑
};
</script>
```

## visible-change

下拉面板显示/隐藏时触发。

- **参数**: `(visible: boolean) => void`
- **触发时机**: 面板展开或收起时

**示例**:

```vue
<DatePicker @visible-change="handleVisibleChange" />

<script setup>
const handleVisibleChange = (visible) => {
  if (visible) {
    console.log('面板打开');
  } else {
    console.log('面板关闭');
  }
};
</script>
```

## panel-change

面板日期改变时触发。

- **参数**: `(date: Date, mode: ViewType) => void`
- **触发时机**: 切换年/月时触发

**示例**:

```vue
<DatePicker @panel-change="handlePanelChange" />

<script setup>
const handlePanelChange = (date, mode) => {
  console.log('当前面板日期:', date);
  console.log('当前视图模式:', mode); // 'date' | 'month' | 'year'
};
</script>
```

## calendar-change

日历面板选择范围内的日期后触发（仅范围选择器）。

- **参数**: `(value: [Date | null, Date | null]) => void`
- **触发时机**: 范围选择时，选中第一个日期后

**示例**:

```vue
<DatePicker
  type="daterange"
  @calendar-change="handleCalendarChange"
/>

<script setup>
const handleCalendarChange = (value) => {
  console.log('已选范围:', value);
  const [start, end] = value;
  if (start && !end) {
    console.log('已选开始日期，等待选择结束日期');
  }
};
</script>
```

## 完整示例

```vue
<template>
  <div>
    <DatePicker
      v-model="date"
      type="daterange"
      @change="handleChange"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @clear="handleClear"
      @visible-change="handleVisibleChange"
      @panel-change="handlePanelChange"
      @calendar-change="handleCalendarChange"
    />
    
    <div class="event-log">
      <h3>事件日志：</h3>
      <ul>
        <li v-for="(log, index) in logs" :key="index">
          {{ log }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);
const logs = ref([]);

const addLog = (message) => {
  logs.value.unshift(`${new Date().toLocaleTimeString()}: ${message}`);
  if (logs.value.length > 10) logs.value.pop();
};

const handleChange = (value) => {
  addLog(`change 事件: ${value}`);
};

const handleInput = (value) => {
  addLog(`input 事件: ${value}`);
};

const handleFocus = () => {
  addLog('focus 事件触发');
};

const handleBlur = () => {
  addLog('blur 事件触发');
};

const handleClear = () => {
  addLog('clear 事件触发');
};

const handleVisibleChange = (visible) => {
  addLog(`visible-change 事件: ${visible ? '打开' : '关闭'}`);
};

const handlePanelChange = (date, mode) => {
  addLog(`panel-change 事件: ${date.toLocaleDateString()}, 模式: ${mode}`);
};

const handleCalendarChange = (value) => {
  addLog(`calendar-change 事件: ${value}`);
};
</script>

<style scoped>
.event-log {
  margin-top: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 4px;
}

.event-log ul {
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.event-log li {
  padding: 5px 0;
  font-size: 14px;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.event-log li:last-child {
  border-bottom: none;
}
</style>
```

## React 用法

```tsx
import { DatePicker } from '@ldesign/datepicker-react';

function App() {
  const [date, setDate] = useState(null);
  
  return (
    <DatePicker
      value={date}
      onChange={(value) => {
        console.log('change:', value);
        setDate(value);
      }}
      onFocus={() => console.log('focus')}
      onBlur={() => console.log('blur')}
      onClear={() => console.log('clear')}
      onVisibleChange={(visible) => console.log('visible:', visible)}
    />
  );
}
```

## Web Components 用法

```html
<ldate-picker id="picker"></ldate-picker>

<script>
  const picker = document.getElementById('picker');
  
  picker.addEventListener('change', (e) => {
    console.log('change:', e.detail);
  });
  
  picker.addEventListener('focus', () => {
    console.log('focus');
  });
  
  picker.addEventListener('clear', () => {
    console.log('clear');
  });
  
  picker.addEventListener('visible-change', (e) => {
    console.log('visible:', e.detail);
  });
</script>
```




