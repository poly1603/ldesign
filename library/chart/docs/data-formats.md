# 数据格式指南

@ldesign/chart 支持多种数据格式，让您可以用最简单的方式传入数据。

## 简单数组

最简单的数据格式，直接传入数字数组。

```javascript
<Chart type="line" :data="[1, 2, 3, 4, 5]" />
```

**说明：**
- 横坐标自动生成为 0, 1, 2, 3, 4...
- 数据作为单个系列显示

## 对象数组

传入对象数组，自动识别字段。

```javascript
const data = [
  { date: '2024-01', sales: 100, profit: 50 },
  { date: '2024-02', sales: 200, profit: 80 },
  { date: '2024-03', sales: 150, profit: 60 }
]

<Chart type="line" :data="data" />
```

**自动识别规则：**
1. 自动识别 X 轴字段（常见的有：`x`, `date`, `time`, `name`, `label`, `category`）
2. 其他数字字段作为 Y 轴数据
3. 每个数字字段生成一个系列

## 标准格式

推荐使用的标准格式，明确指定标签和系列。

```javascript
const data = {
  labels: ['周一', '周二', '周三', '周四', '周五'],
  datasets: [
    {
      name: '销售额',
      data: [120, 200, 150, 80, 70]
    }
  ]
}

<Chart type="bar" :data="data" />
```

### 多系列

```javascript
const data = {
  labels: ['1月', '2月', '3月', '4月'],
  datasets: [
    {
      name: '销售额',
      data: [100, 200, 300, 400]
    },
    {
      name: '利润',
      data: [50, 80, 120, 180]
    }
  ]
}

<Chart type="line" :data="data" />
```

### 带样式配置

datasets 中可以包含 ECharts 系列的任何配置：

```javascript
const data = {
  labels: ['A', 'B', 'C', 'D'],
  datasets: [
    {
      name: '系列1',
      data: [10, 20, 30, 40],
      color: '#5470c6',  // 自定义颜色
      smooth: true,      // 平滑曲线（折线图）
      stack: 'total',    // 堆叠
      areaStyle: {},     // 填充区域
      lineStyle: {
        width: 3,
        type: 'dashed'
      }
    }
  ]
}
```

## 特定图表类型

### 饼图

```javascript
const data = {
  labels: ['产品A', '产品B', '产品C'],
  datasets: [
    {
      data: [30, 40, 30]
    }
  ]
}

<Chart type="pie" :data="data" />
```

### 散点图

散点图需要 [x, y] 格式的数据：

```javascript
const data = {
  labels: [],
  datasets: [
    {
      name: '数据点',
      data: [
        [10, 20],
        [15, 25],
        [20, 18],
        [25, 30]
      ]
    }
  ]
}

<Chart type="scatter" :data="data" />
```

### 雷达图

```javascript
const data = {
  labels: ['质量', '服务', '价格', '速度', '创新'],
  datasets: [
    {
      name: '产品A',
      data: [80, 90, 70, 85, 75]
    },
    {
      name: '产品B',
      data: [70, 85, 80, 75, 80]
    }
  ]
}

<Chart type="radar" :data="data" />
```

### K线图

K线图需要 [open, close, lowest, highest] 格式：

```javascript
const data = {
  labels: ['2024-01', '2024-02', '2024-03'],
  datasets: [
    {
      data: [
        [20, 34, 10, 38],  // [开, 收, 最低, 最高]
        [40, 35, 30, 50],
        [31, 38, 33, 44]
      ]
    }
  ]
}

<Chart type="candlestick" :data="data" />
```

### 热力图

```javascript
const data = {
  labels: ['Mon', 'Tue', 'Wed'],
  datasets: [
    {
      data: [
        [0, 0, 5], [0, 1, 10], [0, 2, 15],
        [1, 0, 8], [1, 1, 12], [1, 2, 20],
        [2, 0, 6], [2, 1, 14], [2, 2, 18]
      ],
      yLabels: ['Morning', 'Afternoon', 'Evening']
    }
  ]
}

<Chart type="heatmap" :data="data" />
```

### 混合图表

混合图表需要为每个系列指定 type：

```javascript
const data = {
  labels: ['1月', '2月', '3月', '4月'],
  datasets: [
    {
      name: '销售额',
      type: 'bar',
      data: [100, 200, 300, 400]
    },
    {
      name: '增长率',
      type: 'line',
      data: [10, 15, 20, 25],
      yAxisIndex: 1  // 使用右侧Y轴
    }
  ]
}

<Chart type="mixed" :data="data" />
```

## 时间序列数据

对于时间序列数据，会自动识别并使用时间轴：

```javascript
const data = {
  labels: [
    '2024-01-01',
    '2024-01-02',
    '2024-01-03'
  ],
  datasets: [
    {
      data: [100, 120, 150]
    }
  ]
}

<Chart type="line" :data="data" />
```

**自动识别规则：**
- 如果 labels 是日期字符串或 Date 对象
- 如果 labels 是时间戳（大于 1000000000）
- 自动使用时间轴 (type: 'time')

## 数据验证

使用 DataParser 验证数据：

```javascript
import { DataParser } from '@ldesign/chart'

const parser = new DataParser()
const result = parser.validate(data)

if (!result.valid) {
  console.error('数据验证失败:', result.errors)
}
```

## 数据统计

获取数据统计信息：

```javascript
import { DataParser } from '@ldesign/chart'

const parser = new DataParser()
const stats = parser.getDataStats(data)

console.log(stats)
// {
//   min: 10,
//   max: 400,
//   avg: 125,
//   total: 1000,
//   count: 8
// }
```

## 最佳实践

1. **小数据集**：直接使用简单数组
2. **中等数据集**：使用标准格式，便于维护
3. **大数据集**：启用虚拟渲染和缓存
4. **动态数据**：使用响应式数据，自动更新图表
5. **复杂场景**：结合 ECharts 原生配置

## 示例

### 完整示例

```vue
<template>
  <div>
    <!-- 简单数组 -->
    <Chart type="line" :data="simple" />

    <!-- 标准格式 -->
    <Chart type="bar" :data="standard" />

    <!-- 带配置 -->
    <Chart type="line" :data="advanced" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Chart } from '@ldesign/chart/vue'

// 简单数组
const simple = ref([1, 2, 3, 4, 5])

// 标准格式
const standard = ref({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { name: 'Revenue', data: [100, 200, 150, 300] }
  ]
})

// 带配置
const advanced = ref({
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      name: 'Sales',
      data: [100, 200, 300],
      smooth: true,
      areaStyle: {},
      color: '#5470c6'
    }
  ]
})
</script>
```

