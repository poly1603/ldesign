# 快速开始

本指南将帮助你在 5 分钟内快速上手 LDesign DatePicker。

## 安装

::: code-group

```bash [pnpm]
# Vue 3
pnpm add @ldesign/datepicker-vue

# React
pnpm add @ldesign/datepicker-react

# Lit/Web Components
pnpm add @ldesign/datepicker-lit
```

```bash [npm]
# Vue 3
npm install @ldesign/datepicker-vue

# React
npm install @ldesign/datepicker-react

# Lit/Web Components
npm install @ldesign/datepicker-lit
```

```bash [yarn]
# Vue 3
yarn add @ldesign/datepicker-vue

# React
yarn add @ldesign/datepicker-react

# Lit/Web Components
yarn add @ldesign/datepicker-lit
```

:::

## 基础用法

### Vue 3

```vue
<template>
  <div>
    <DatePicker v-model="date" type="date" placeholder="选择日期" />
    <p>选中的日期：{{ date }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import '@ldesign/datepicker-vue/style.css';

const date = ref<Date | null>(null);
</script>
```

### React

```tsx
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';
import '@ldesign/datepicker-react/style.css';

function App() {
  const [date, setDate] = useState<Date | null>(null);
  
  return (
    <div>
      <DatePicker 
        value={date} 
        onChange={setDate} 
        type="date" 
        placeholder="选择日期" 
      />
      <p>选中的日期：{date?.toLocaleDateString()}</p>
    </div>
  );
}
```

### Lit/Web Components

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/@ldesign/datepicker-lit/style.css">
</head>
<body>
  <ldate-picker type="date" placeholder="选择日期"></ldate-picker>
  
  <script type="module">
    import '@ldesign/datepicker-lit';
    
    const picker = document.querySelector('ldate-picker');
    picker.addEventListener('change', (e) => {
      console.log('选中的日期：', e.detail);
    });
  </script>
</body>
</html>
```

## 日期范围选择

::: code-group

```vue [Vue]
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
import { DatePicker } from '@ldesign/datepicker-vue';

const dateRange = ref([null, null]);
</script>
```

```tsx [React]
import { DatePicker } from '@ldesign/datepicker-react';

function App() {
  const [range, setRange] = useState([null, null]);
  
  return (
    <DatePicker
      value={range}
      onChange={setRange}
      type="daterange"
      startPlaceholder="开始日期"
      endPlaceholder="结束日期"
    />
  );
}
```

:::

## 禁用日期

```vue
<template>
  <DatePicker
    v-model="date"
    :disabled-date="disabledDate"
  />
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

## 快捷选项

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

## 下一步

- [查看所有选择模式](/components/datepicker)
- [了解国际化](/guide/i18n)
- [主题定制](/guide/theming)
- [API 文档](/api/props)





