# 🎯 跨框架 Picker 组件

一个高性能、功能丰富的跨框架滚轮选择器组件，支持原生JavaScript、Vue3和React。

## ✨ 特性

- 🚀 **高性能** - 使用 transform3d 和 requestAnimationFrame 优化渲染
- 🎨 **3D效果** - 可选的iOS风格3D透视效果
- 🔍 **搜索功能** - 内置搜索、筛选和快速定位
- 📱 **移动优化** - 支持触摸手势、惯性滚动、橡皮筋效果
- ♿ **无障碍** - 完整的键盘导航和ARIA支持
- 🎭 **主题定制** - 内置明暗主题，支持CSS变量定制
- 📳 **触觉反馈** - 移动端振动反馈（需浏览器支持）
- 🔊 **音效支持** - 可配置的滚动音效
- 🌊 **渐变遮罩** - 美观的顶部/底部渐变效果
- 🔗 **多列联动** - 支持级联选择和多列协作

## 📦 安装

```bash
npm install @ldesign/picker
# 或
yarn add @ldesign/picker
# 或
pnpm add @ldesign/picker
```

## 🚀 快速开始

### 原生 JavaScript

```javascript
import { Picker } from '@ldesign/picker';

const picker = new Picker(document.getElementById('picker'), {
  options: [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橘子' }
  ],
  defaultValue: 'apple',
  onChange: (value, option) => {
    console.log('选中:', value, option);
  }
});
```

### Vue 3

#### 组件方式

```vue
<template>
  <PickerComponent
    v-model="selectedValue"
    :options="options"
    :searchable="true"
    :enable3d="true"
    @change="handleChange"
    @pick="handlePick"
  />
</template>

<script setup>
import { ref } from 'vue';
import { PickerComponent } from '@ldesign/picker/vue';

const selectedValue = ref('apple');
const options = ref([
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橘子' }
]);

const handleChange = (value, option) => {
  console.log('选中:', value, option);
};

const handlePick = (value, option, trigger) => {
  console.log('选择中:', value, trigger);
};
</script>
```

#### Hook 方式

```vue
<template>
  <div ref="pickerContainer"></div>
  <div>当前值: {{ value }}</div>
</template>

<script setup>
import { ref } from 'vue';
import { usePicker } from '@ldesign/picker/vue';

const pickerContainer = ref();

const { value, setValue, scrollToIndex } = usePicker({
  container: pickerContainer,
  options: [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' }
  ],
  defaultValue: 'apple'
});

// 程序控制
setTimeout(() => {
  setValue('banana', true); // 动画切换到香蕉
}, 2000);
</script>
```

### React

#### 组件方式

```jsx
import React, { useRef, useState } from 'react';
import PickerComponent from '@ldesign/picker/react';

function App() {
  const [value, setValue] = useState('apple');
  const pickerRef = useRef();
  
  const options = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橘子' }
  ];
  
  return (
    <PickerComponent
      ref={pickerRef}
      value={value}
      options={options}
      searchable
      enable3d
      onChange={(val, option) => {
        setValue(val);
        console.log('选中:', val, option);
      }}
      onPick={(val, option, trigger) => {
        console.log('选择中:', val, trigger);
      }}
    />
  );
}
```

#### Hook 方式

```jsx
import React, { useRef } from 'react';
import { usePicker } from '@ldesign/picker/react';

function App() {
  const containerRef = useRef();
  
  const {
    value,
    currentOption,
    setValue,
    scrollToIndex
  } = usePicker({
    container: containerRef,
    options: [
      { value: 'apple', label: '苹果' },
      { value: 'banana', label: '香蕉' }
    ],
    defaultValue: 'apple'
  });
  
  return (
    <div>
      <div ref={containerRef}></div>
      <div>当前值: {currentOption?.label}</div>
      <button onClick={() => setValue('banana', true)}>
        选择香蕉
      </button>
    </div>
  );
}
```

## 🎮 多列联动

### 日期选择器示例

```javascript
// Vue 3
import { useMultiPicker } from '@ldesign/picker/vue';

const { values, setColumnValue, setColumnOptions } = useMultiPicker({
  container: pickerContainer,
  columns: [
    {
      key: 'year',
      options: generateYears(),
      value: 2024
    },
    {
      key: 'month',
      options: generateMonths(),
      value: 1
    },
    {
      key: 'day',
      options: generateDays(2024, 1),
      value: 1
    }
  ],
  onChange: (values) => {
    // 月份改变时更新日期选项
    if (values.year && values.month) {
      const days = generateDays(values.year, values.month);
      setColumnOptions('day', days);
    }
  }
});
```

### 省市区级联

```javascript
const provincePicker = new Picker(provinceEl, {
  options: provinces,
  onChange: (value) => {
    // 更新城市选项
    const cities = getCitiesByProvince(value);
    cityPicker.setOptions(cities);
  }
});

const cityPicker = new Picker(cityEl, {
  options: [],
  onChange: (value) => {
    // 更新区县选项
    const districts = getDistrictsByCity(value);
    districtPicker.setOptions(districts);
  }
});

const districtPicker = new Picker(districtEl, {
  options: []
});
```

## ⚙️ 配置选项

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| **基础配置** |
| options | PickerOption[] | [] | 选项列表 |
| value | string \| number | - | 当前值（受控） |
| defaultValue | string \| number | - | 默认值（非受控） |
| disabled | boolean | false | 是否禁用 |
| **外观配置** |
| visibleItems | number | 5 | 可视条目数 |
| itemHeight | number | 36 | 行高（px） |
| panelHeight | number | - | 容器高度（px） |
| theme | 'light' \| 'dark' | 'light' | 主题模式 |
| enable3d | boolean | false | 启用3D效果 |
| showMask | boolean | true | 显示渐变遮罩 |
| **交互配置** |
| momentum | boolean | true | 启用惯性 |
| friction | number | 0.92 | 摩擦系数(0-1) |
| snapDuration | number | 300 | 吸附动画时长(ms) |
| resistance | number | 0.3 | 边界阻力(0-1) |
| maxOverscroll | number | - | 最大越界距离(px) |
| **搜索配置** |
| searchable | boolean | false | 启用搜索 |
| searchPlaceholder | string | 'Search...' | 搜索框占位符 |
| searchDebounce | number | 300 | 搜索防抖(ms) |
| highlightMatch | boolean | true | 高亮匹配文本 |
| **体验优化** |
| hapticFeedback | boolean | false | 触觉反馈 |
| hapticIntensity | number | 5 | 振动强度(ms) |
| soundEffects | boolean | false | 音效 |
| soundVolume | number | 0.3 | 音量(0-1) |

## 🎯 API 方法

### Picker 实例方法

```javascript
// 滚动到指定索引
picker.scrollToIndex(3, animate = true);

// 滚动到指定值
picker.scrollToValue('banana', animate = true);

// 获取当前值
const value = picker.getValue();

// 设置值
picker.setValue('orange', animate = true);

// 更新选项
picker.setOptions(newOptions);

// 禁用/启用
picker.setDisabled(true);

// 销毁实例
picker.destroy();
```

### Vue/React 组件方法

通过 ref 访问组件实例方法：

```vue
<!-- Vue 3 -->
<PickerComponent ref="pickerRef" />

<script setup>
const pickerRef = ref();

// 使用方法
pickerRef.value.scrollToIndex(3);
</script>
```

```jsx
// React
const pickerRef = useRef();

<PickerComponent ref={pickerRef} />

// 使用方法
pickerRef.current.scrollToIndex(3);
```

## 🎨 主题定制

通过 CSS 变量自定义样式：

```css
.picker {
  /* 主色调 */
  --picker-bg: #fff;
  --picker-border: #e5e7eb;
  --picker-text: #111827;
  --picker-text-secondary: #9ca3af;
  
  /* 激活状态 */
  --picker-active-color: #1d4ed8;
  --picker-active-bg: rgba(29, 78, 216, 0.06);
  
  /* 3D效果 */
  --picker-3d-perspective: 1000px;
  --picker-3d-rotate: 25deg;
  --picker-3d-radius: 120px;
}
```

## 📱 移动端优化

```javascript
const picker = new Picker(element, {
  // 触摸优化
  hapticFeedback: true,      // 振动反馈
  friction: 0.95,            // 更长的惯性
  resistance: 0.2,           // 更小的边界阻力
  
  // 响应式设计
  itemHeight: 44,            // 更大的触摸目标
  visibleItems: 5,           // 合适的可视项数
  
  // 性能优化
  searchDebounce: 500,       // 更长的搜索防抖
  enable3d: false           // 移动端可选择关闭3D
});
```

## ⌨️ 键盘快捷键

- `↑` / `↓` - 上下选择
- `Home` / `End` - 跳到首尾
- `PageUp` / `PageDown` - 翻页
- `Enter` / `Space` - 确认选择
- `Escape` - 退出搜索
- 字母键 - 快速跳转到对应项

## 🔧 浏览器兼容性

- Chrome 61+
- Firefox 60+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 61+

需要的浏览器特性：
- Pointer Events
- CSS Transform 3D
- RequestAnimationFrame
- CSS Variables

## 📈 性能优化建议

1. **大数据量**：启用搜索功能，减少DOM节点
2. **移动端**：考虑关闭3D效果，调整摩擦系数
3. **多列联动**：使用防抖处理频繁更新
4. **内存管理**：及时调用destroy()方法

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License