# 双面板日期范围选择器指南

## 概述

参考 TDesign 的设计，我们实现了两个日历面板并排显示的日期范围选择器。这种设计提供了更好的用户体验，让用户可以同时看到两个月份的日期，更方便地选择日期范围。

## 功能特性

### ✨ 主要特点

1. **双面板并排显示** - 左右两个日历面板同时显示相邻的两个月份
2. **联动导航** - 左侧控制前一个月，右侧控制后一个月，保持两个面板始终相邻
3. **范围高亮** - 选中的日期范围在两个面板中都有视觉高亮
4. **悬停预览** - 鼠标悬停时显示临时范围预览
5. **优雅动效** - 范围选择有平滑的过渡效果

### 🎨 视觉设计

- **开始日期**: 蓝色背景圆形标记
- **结束日期**: 蓝色背景圆形标记
- **范围内日期**: 浅蓝色背景高亮，连续显示
- **悬停效果**: 鼠标悬停时显示浅色背景

## 使用方法

### 基础用法

```vue
<template>
  <DatePicker 
    v-model="dateRange" 
    type="daterange"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    range-separator="至"
  />
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const dateRange = ref([null, null]);
</script>
```

### 完整示例

```vue
<template>
  <div class="demo">
    <h3>日期范围选择（双面板）</h3>
    
    <!-- 基础范围选择 -->
    <DatePicker 
      v-model="values.basic" 
      type="daterange"
      placeholder="选择日期范围"
      @change="handleChange"
    />
    
    <!-- 带快捷选项 -->
    <DatePicker 
      v-model="values.shortcuts" 
      type="daterange"
      :shortcuts="shortcuts"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
    />
    
    <!-- 禁用日期 -->
    <DatePicker 
      v-model="values.disabled" 
      type="daterange"
      :disabled-date="disabledDate"
      start-placeholder="开始"
      end-placeholder="结束"
    />
    
    <div class="output">
      选中范围：{{ formatRange(values.basic) }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import { createShortcuts } from '@ldesign/datepicker-shared';

const values = ref({
  basic: [null, null],
  shortcuts: [null, null],
  disabled: [null, null],
});

// 快捷选项
const shortcutsPresets = createShortcuts();
const shortcuts = [
  shortcutsPresets.today,
  shortcutsPresets.last7Days,
  shortcutsPresets.last30Days,
  shortcutsPresets.thisMonth,
];

// 禁用日期
const disabledDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today; // 禁用过去的日期
};

const formatRange = (value) => {
  if (!value || !Array.isArray(value)) return '未选择';
  const [start, end] = value;
  if (!start || !end) return '未选择';
  return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
};

const handleChange = (value) => {
  console.log('Range changed:', value);
};
</script>
```

## 技术实现

### 组件结构

```
DatePicker (主组件)
  └── DateRangePanel (双面板组件)
        ├── 左侧面板
        │     ├── 头部（年/月导航）
        │     ├── 星期标题
        │     └── 日期网格
        └── 右侧面板
              ├── 头部（年/月导航）
              ├── 星期标题
              └── 日期网格
```

### 核心代码

**DateRangePanel.vue** - 双面板组件

```vue
<template>
  <div class="ldate-range-panel">
    <!-- 左侧面板：当前月 -->
    <div class="ldate-range-panel__left">
      <div class="ldate-panel ldate-date-panel">
        <div class="ldate-panel__header">
          <span @click="handlePrevYear">«</span>
          <span @click="handlePrevMonth">‹</span>
          <span class="label">{{ leftHeaderLabel }}</span>
          <!-- 隐藏的箭头占位 -->
          <span class="hidden">›</span>
          <span class="hidden">»</span>
        </div>
        <!-- 日期网格 -->
      </div>
    </div>

    <!-- 右侧面板：下个月 -->
    <div class="ldate-range-panel__right">
      <div class="ldate-panel ldate-date-panel">
        <div class="ldate-panel__header">
          <!-- 隐藏的箭头占位 -->
          <span class="hidden">«</span>
          <span class="hidden">‹</span>
          <span class="label">{{ rightHeaderLabel }}</span>
          <span @click="handleNextMonth">›</span>
          <span @click="handleNextYear">»</span>
        </div>
        <!-- 日期网格 -->
      </div>
    </div>
  </div>
</template>
```

### 样式设计

```css
/* 双面板容器 */
.ldate-range-panel {
  display: flex;
  gap: 0;
}

.ldate-range-panel__left,
.ldate-range-panel__right {
  flex: 1;
  min-width: 280px;
}

/* 左侧面板分隔线 */
.ldate-range-panel__left {
  border-right: 1px solid var(--ldate-border-color);
}

/* 范围高亮效果 */
.ldate-cell--in-range {
  position: relative;
  background-color: var(--ldate-bg-selected-color);
}

/* 范围连续效果 */
.ldate-cell--in-range::before {
  content: '';
  position: absolute;
  top: 0;
  left: -2px;
  right: -2px;
  bottom: 0;
  background-color: var(--ldate-bg-selected-color);
  z-index: -1;
}

/* 开始/结束日期标记 */
.ldate-cell--range-start,
.ldate-cell--range-end {
  color: white;
  background-color: var(--ldate-primary-color);
  border-radius: 50%;
  z-index: 1;
}
```

## 交互逻辑

### 选择流程

1. **第一次点击** - 选择开始日期，高亮显示
2. **悬停移动** - 显示临时范围预览（浅色背景）
3. **第二次点击** - 选择结束日期，确定范围
4. **范围高亮** - 开始到结束之间的所有日期都有背景色

### 导航控制

- **左侧箭头** (« ‹) - 控制左面板向前翻月/年，右面板同步
- **右侧箭头** (› ») - 控制右面板向后翻月/年，左面板同步
- **月份标题** - 点击可切换到月份选择视图（可选功能）

### 键盘支持

- `Tab` - 在开始/结束输入框间切换
- `Esc` - 关闭选择面板
- `Enter` - 确认选择
- `方向键` - 在日期间导航（计划中）

## 配置选项

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `string` | `'daterange'` | 设置为 daterange 启用双面板 |
| `start-placeholder` | `string` | `'开始日期'` | 开始日期占位符 |
| `end-placeholder` | `string` | `'结束日期'` | 结束日期占位符 |
| `range-separator` | `string` | `'至'` | 范围分隔符 |
| `disabled-date` | `function` | - | 禁用日期函数 |
| `shortcuts` | `array` | - | 快捷选项配置 |
| `clearable` | `boolean` | `true` | 是否显示清空按钮 |
| `format` | `string` | `'YYYY-MM-DD'` | 日期格式 |

### Events

| 事件 | 参数 | 说明 |
|------|------|------|
| `change` | `[Date, Date]` | 范围改变时触发 |
| `focus` | - | 获得焦点 |
| `blur` | - | 失去焦点 |
| `clear` | - | 清空时触发 |

## 最佳实践

### 1. 合理使用快捷选项

```javascript
import { createShortcuts } from '@ldesign/datepicker-shared';

const shortcuts = [
  createShortcuts().today,        // 今天
  createShortcuts().last7Days,    // 最近7天
  createShortcuts().last30Days,   // 最近30天
  createShortcuts().thisMonth,    // 本月
  createShortcuts().lastMonth,    // 上月
];
```

### 2. 禁用不合理的日期

```javascript
// 只允许选择未来的日期
const disabledDate = (date) => {
  return date < new Date().setHours(0, 0, 0, 0);
};

// 限制日期范围（最近90天）
const disabledDate = (date) => {
  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  return date < ninetyDaysAgo || date > today;
};
```

### 3. 自定义样式

```css
/* 自定义主色调 */
:root {
  --ldate-primary-color: #1890ff;
  --ldate-bg-selected-color: #e6f7ff;
}

/* 暗色主题 */
[data-theme="dark"] {
  --ldate-primary-color: #177ddc;
  --ldate-bg-selected-color: #111d2c;
}

/* 自定义单元格大小 */
:root {
  --ldate-cell-size: 40px;
}
```

## 对比单面板

### 双面板优势

✅ **更好的视觉效果** - 同时看到两个月，选择更直观  
✅ **减少操作** - 减少月份切换次数  
✅ **更快的选择** - 适合跨月范围选择  
✅ **更好的 UX** - 符合现代设计规范

### 单面板适用场景

- 空间受限的移动端
- 同月内的范围选择
- 简单的日期选择场景

## 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 性能优化

1. **虚拟滚动** - 大量日期时自动启用
2. **懒加载** - 按需生成日期网格
3. **事件节流** - 悬停事件防抖处理
4. **CSS 优化** - 使用 GPU 加速的动画

## 未来计划

- [ ] 支持时间范围选择（datetime + 双面板）
- [ ] 月份范围双面板支持
- [ ] 年份范围双面板支持
- [ ] 自定义面板数量（3个或更多）
- [ ] 移动端自适应（自动切换单/双面板）

## 相关文档

- [快速开始](./GETTING_STARTED.md)
- [完整示例](./EXAMPLES_GUIDE.md)
- [API 文档](./PROJECT_SUMMARY.md)
- [主题定制](./CONTRIBUTING.md)

## 反馈与支持

如有问题或建议，欢迎提交 Issue 或 PR！

---

**LDesign DatePicker** - 让日期范围选择更优雅！ 🎉








