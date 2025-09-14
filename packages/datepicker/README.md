# @ldesign/datepicker

> 跨平台日期选择器组件库，支持 PC、平板、手机三端响应式适配，框架无关实现

## ✨ 特性

- 🌍 **跨平台支持** - 完美适配 PC、平板、手机三端
- 🎯 **框架无关** - 可在 Vue、React、Angular 等任何前端框架中使用
- 📅 **多种模式** - 支持年份、月份、日期、日期时间选择器
- 🎨 **多选支持** - 每种模式都支持单选、多选、范围选择
- 🎭 **主题定制** - 基于 CSS 变量的主题系统，支持深色/浅色模式
- 🌐 **国际化** - 内置多语言支持
- ⚡ **性能优化** - 虚拟滚动、事件委托等优化技术
- 🔧 **TypeScript** - 完整的类型定义，更好的开发体验
- 📱 **响应式设计** - 自动适配不同屏幕尺寸
- 🎪 **丰富配置** - 提供丰富的配置选项和简洁的 API

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/datepicker

# 使用 npm
npm install @ldesign/datepicker

# 使用 yarn
yarn add @ldesign/datepicker
```

## 🚀 快速开始

### 基础用法

```typescript
import { DatePicker } from '@ldesign/datepicker';
import '@ldesign/datepicker/styles';

// 创建日期选择器实例
const datePicker = new DatePicker({
  mode: 'date',
  selectionType: 'single',
  format: 'YYYY-MM-DD',
  locale: 'zh-CN'
});

// 挂载到 DOM 元素
const container = document.getElementById('datepicker-container');
datePicker.mount(container);

// 监听值变化
datePicker.on('change', (value) => {
  console.log('选中的日期:', value);
});
```

### 不同选择模式

```typescript
// 年份选择器
const yearPicker = new DatePicker({
  mode: 'year',
  selectionType: 'single'
});

// 月份选择器
const monthPicker = new DatePicker({
  mode: 'month',
  selectionType: 'range'
});

// 日期时间选择器
const datetimePicker = new DatePicker({
  mode: 'datetime',
  selectionType: 'multiple'
});
```

### 框架集成

#### Vue 3

```vue
<template>
  <div ref="datePickerRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { DatePicker } from '@ldesign/datepicker';

const datePickerRef = ref<HTMLElement>();
let datePicker: DatePicker;

onMounted(() => {
  datePicker = new DatePicker({
    mode: 'date',
    selectionType: 'single'
  });
  
  datePicker.mount(datePickerRef.value!);
});

onUnmounted(() => {
  datePicker?.destroy();
});
</script>
```

#### React

```tsx
import React, { useRef, useEffect } from 'react';
import { DatePicker } from '@ldesign/datepicker';

const DatePickerComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<DatePicker>();

  useEffect(() => {
    if (containerRef.current) {
      datePickerRef.current = new DatePicker({
        mode: 'date',
        selectionType: 'single'
      });
      
      datePickerRef.current.mount(containerRef.current);
    }

    return () => {
      datePickerRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} />;
};

export default DatePickerComponent;
```

## 📖 API 文档

### DatePicker 类

#### 构造函数

```typescript
new DatePicker(options: DatePickerOptions)
```

#### 方法

| 方法 | 描述 | 参数 | 返回值 |
|------|------|------|--------|
| `mount(element)` | 挂载到 DOM 元素 | `HTMLElement` | `void` |
| `unmount()` | 卸载组件 | - | `void` |
| `destroy()` | 销毁实例 | - | `void` |
| `getValue()` | 获取当前值 | - | `DateValue \| DateValue[] \| DateRange` |
| `setValue(value)` | 设置值 | `DateValue \| DateValue[] \| DateRange` | `void` |
| `clear()` | 清空值 | - | `void` |
| `show()` | 显示选择器 | - | `void` |
| `hide()` | 隐藏选择器 | - | `void` |
| `toggle()` | 切换显示状态 | - | `void` |

#### 配置选项

```typescript
interface DatePickerOptions {
  mode?: 'year' | 'month' | 'date' | 'datetime' | 'time';
  selectionType?: 'single' | 'multiple' | 'range';
  format?: string;
  locale?: string;
  theme?: 'light' | 'dark' | 'auto';
  responsive?: boolean;
  minDate?: DateValue;
  maxDate?: DateValue;
  disabledDates?: DateValue[];
  defaultValue?: DateValue | DateValue[] | DateRange;
  placeholder?: string;
  clearable?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  // ... 更多配置选项
}
```

## 🎨 主题定制

组件使用 CSS 变量系统，可以轻松定制主题：

```css
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-bg-color-component: #ffffff;
  --ldesign-border-color: #e5e5e5;
  /* 更多变量... */
}
```

## 🌐 国际化

内置支持多种语言：

```typescript
const datePicker = new DatePicker({
  locale: 'zh-CN', // 中文
  // locale: 'en-US', // 英文
  // locale: 'ja-JP', // 日文
  // locale: 'ko-KR', // 韩文
});
```

## 📱 响应式设计

组件会自动检测设备类型并应用相应的样式和交互：

- **PC 端**: 完整功能，悬浮面板
- **平板端**: 适中尺寸，触摸优化
- **手机端**: 全屏模式，大按钮，滑动操作

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 生成文档
pnpm docs:build
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请提交 [Issue](https://github.com/ldesign/ldesign/issues) 或联系我们。
