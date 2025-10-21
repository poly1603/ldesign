# 快速开始

@ldesign/chart 是一个基于 Apache ECharts 的企业级智能图表插件，支持 Vue 3、React 和 Lit 框架。

## 安装

```bash
npm install @ldesign/chart echarts
# 或
yarn add @ldesign/chart echarts
# 或
pnpm add @ldesign/chart echarts
```

## 基础用法

### Vue 3

```vue
<template>
  <div>
    <!-- 最简单的用法 -->
    <Chart type="line" :data="[1, 2, 3, 4, 5]" />

    <!-- 带配置 -->
    <Chart 
      type="bar"
      :data="{
        labels: ['周一', '周二', '周三', '周四', '周五'],
        datasets: [
          { name: '销售额', data: [120, 200, 150, 80, 70] }
        ]
      }"
      title="每周销售统计"
      :fontSize="14"
    />

    <!-- 暗黑模式 -->
    <Chart type="pie" :data="pieData" dark-mode />
  </div>
</template>

<script setup>
import { Chart } from '@ldesign/chart/vue'
import { ref } from 'vue'

const pieData = ref({
  labels: ['产品A', '产品B', '产品C'],
  datasets: [{ data: [30, 40, 30] }]
})
</script>
```

### React

```jsx
import { Chart } from '@ldesign/chart/react'

function App() {
  return (
    <div>
      {/* 最简单的用法 */}
      <Chart type="line" data={[1, 2, 3, 4, 5]} />

      {/* 带配置 */}
      <Chart 
        type="bar"
        data={{
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          datasets: [
            { name: 'Revenue', data: [100, 200, 150, 300] }
          ]
        }}
        title="Quarterly Revenue"
        fontSize={14}
      />

      {/* 暗黑模式 */}
      <Chart type="pie" data={pieData} darkMode={true} />
    </div>
  )
}
```

### Lit / Web Components

```html
<script type="module">
  import '@ldesign/chart/lit'
</script>

<!-- 最简单的用法 -->
<ldesign-chart type="line" .data="${[1, 2, 3, 4, 5]}"></ldesign-chart>

<!-- 带配置 -->
<ldesign-chart 
  type="bar"
  .data="${{
    labels: ['Mon', 'Tue', 'Wed'],
    datasets: [{ data: [120, 200, 150] }]
  }}"
  title="Weekly Stats"
  dark-mode>
</ldesign-chart>
```

## 数据格式

### 简单数组
```javascript
<Chart type="line" :data="[1, 2, 3, 4, 5]" />
```

### 带标签
```javascript
<Chart 
  type="bar"
  :data="{
    labels: ['A', 'B', 'C', 'D'],
    datasets: [{ data: [10, 20, 15, 25] }]
  }"
/>
```

### 多系列
```javascript
<Chart 
  type="line"
  :data="{
    labels: ['1月', '2月', '3月'],
    datasets: [
      { name: '销售额', data: [100, 200, 300] },
      { name: '利润', data: [50, 80, 120] }
    ]
  }"
/>
```

## 主题和样式

### 暗黑模式
```javascript
<Chart type="line" :data="data" dark-mode />
```

### 自定义主题
```javascript
<Chart type="line" :data="data" theme="blue" />
```

### 字体大小
```javascript
<Chart type="line" :data="data" :font-size="16" />
```

## 性能优化

### 大数据集虚拟渲染
```javascript
<Chart type="scatter" :data="largeData" virtual />
```

### 使用 Web Worker
```javascript
<Chart type="line" :data="hugeData" worker />
```

### 启用缓存
```javascript
<Chart type="bar" :data="data" cache />
```

## 高级用法

### 使用完整 ECharts 配置
```javascript
<Chart 
  type="line" 
  :data="data"
  :echarts="{
    xAxis: { 
      type: 'time',
      axisLabel: { formatter: '{yyyy}-{MM}-{dd}' }
    },
    yAxis: { 
      type: 'log'
    },
    dataZoom: [
      { type: 'inside' },
      { type: 'slider' }
    ]
  }"
/>
```

### 使用组合式函数 (Vue)
```vue
<script setup>
import { useChart } from '@ldesign/chart/vue'
import { ref } from 'vue'

const config = ref({
  type: 'line',
  data: [1, 2, 3, 4, 5]
})

const { chartRef, instance } = useChart(config)

// 手动更新数据
const updateData = () => {
  instance.value?.updateData([2, 3, 4, 5, 6])
}
</script>

<template>
  <div ref="chartRef"></div>
  <button @click="updateData">更新数据</button>
</template>
```

### 使用 Hooks (React)
```jsx
import { useChart } from '@ldesign/chart/react'

function MyChart() {
  const { chartRef, instance, updateData } = useChart({
    type: 'line',
    data: [1, 2, 3, 4, 5]
  })

  return (
    <>
      <div ref={chartRef} />
      <button onClick={() => updateData([2, 3, 4, 5, 6])}>
        更新数据
      </button>
    </>
  )
}
```

## 下一步

- [API 参考](./api-reference.md)
- [更多示例](./examples.md)
- [主题定制](./theming.md)
- [性能优化](./performance.md)

