# Vue 支持架构设计

## 概述

为 @ldesign/chart 添加 Vue 3 支持，提供声明式的图表组件和响应式的 Composables API。

## 设计原则

1. **Vue 3 优先** - 充分利用 Vue 3 的 Composition API 和响应式系统
2. **类型安全** - 完整的 TypeScript 类型定义
3. **响应式** - 数据变化自动更新图表
4. **易用性** - 简单直观的 API 设计
5. **性能优化** - 避免不必要的重渲染和内存泄漏

## API 设计

### 1. Vue 组件

#### LChart 组件
```vue
<template>
  <LChart
    :type="chartType"
    :data="chartData"
    :config="chartConfig"
    :theme="theme"
    @click="handleClick"
    @legend-select="handleLegendSelect"
  />
</template>
```

#### 特定图表组件
```vue
<!-- 折线图 -->
<LLineChart :data="lineData" :smooth="true" />

<!-- 柱状图 -->
<LBarChart :data="barData" :stack="true" />

<!-- 饼图 -->
<LPieChart :data="pieData" :donut="true" />

<!-- 散点图 -->
<LScatterChart :data="scatterData" :regression="true" />
```

### 2. Composables API

#### useChart
```typescript
const {
  chartRef,
  chartInstance,
  updateData,
  updateConfig,
  setTheme,
  exportImage,
  loading,
  error
} = useChart(options)
```

#### 特定图表 Composables
```typescript
// 折线图
const lineChart = useLineChart(data, options)

// 柱状图
const barChart = useBarChart(data, options)

// 饼图
const pieChart = usePieChart(data, options)
```

### 3. 指令支持

```vue
<div v-chart="{ type: 'line', data: chartData }"></div>
```

## 文件结构

```
src/vue/
├── components/           # Vue 组件
│   ├── LChart.vue       # 通用图表组件
│   ├── LLineChart.vue   # 折线图组件
│   ├── LBarChart.vue    # 柱状图组件
│   ├── LPieChart.vue    # 饼图组件
│   └── LScatterChart.vue # 散点图组件
├── composables/         # Composables
│   ├── useChart.ts      # 通用图表 hook
│   ├── useLineChart.ts  # 折线图 hook
│   ├── useBarChart.ts   # 柱状图 hook
│   ├── usePieChart.ts   # 饼图 hook
│   └── useScatterChart.ts # 散点图 hook
├── directives/          # 指令
│   └── chart.ts         # v-chart 指令
├── types/               # Vue 相关类型定义
│   ├── components.ts    # 组件类型
│   ├── composables.ts   # Composables 类型
│   └── index.ts         # 导出所有类型
├── utils/               # Vue 工具函数
│   ├── reactivity.ts    # 响应式工具
│   └── lifecycle.ts     # 生命周期工具
└── index.ts             # Vue 支持入口文件
```

## 核心特性

### 1. 响应式数据绑定
- 自动监听 props 变化
- 智能 diff 算法，只更新变化的部分
- 支持深度监听复杂数据结构

### 2. 生命周期管理
- 组件挂载时初始化图表
- 组件卸载时自动清理资源
- 支持 keep-alive 缓存

### 3. 事件系统
- 完整的图表事件支持
- Vue 风格的事件命名
- 支持事件修饰符

### 4. 主题系统集成
- 响应式主题切换
- 支持 CSS 变量
- 暗色模式支持

### 5. 性能优化
- 防抖更新机制
- 虚拟滚动支持
- 懒加载和按需渲染

## 使用示例

### 基础用法
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LChart } from '@ldesign/chart/vue'

const data = ref([
  { name: '1月', value: 100 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
])

const config = {
  title: '月度销售额',
  theme: 'light'
}
</script>

<template>
  <LChart type="line" :data="data" :config="config" />
</template>
```

### Composables 用法
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useLineChart } from '@ldesign/chart/vue'

const data = ref([...])
const options = { smooth: true, area: true }

const {
  chartRef,
  chartInstance,
  loading,
  error,
  updateData,
  exportImage
} = useLineChart(data, options)

// 动态更新数据
const addData = () => {
  data.value.push({ name: '4月', value: 300 })
}

// 导出图片
const handleExport = async () => {
  const blob = await exportImage('png')
  // 处理导出的图片
}
</script>

<template>
  <div>
    <div ref="chartRef" />
    <button @click="addData">添加数据</button>
    <button @click="handleExport">导出图片</button>
  </div>
</template>
```

## 下一步实现计划

1. 创建基础的 Vue 组件和 Composables
2. 实现响应式数据绑定机制
3. 添加完整的 TypeScript 类型定义
4. 编写单元测试和组件测试
5. 创建示例项目和文档
