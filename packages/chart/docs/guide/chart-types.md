# 图表类型

@ldesign/chart 支持多种常用的图表类型，每种类型都有其特定的配置选项和使用场景。

## 折线图 (Line Chart)

适用于展示数据随时间或类别的变化趋势。

### 基本折线图

```typescript
import { createLineChart } from '@ldesign/chart'

const data = [
  { name: '1月', value: 100 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
]

const chart = createLineChart(container, data, {
  title: '月度销售趋势',
  smooth: true, // 平滑曲线
  showSymbol: true, // 显示数据点
})
```

### 多系列折线图

```typescript
const multiSeriesData = {
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    { name: '产品A', data: [100, 200, 150, 300, 250] },
    { name: '产品B', data: [80, 180, 120, 280, 200] },
  ],
}

const chart = createLineChart(container, multiSeriesData, {
  title: '产品销售对比',
  smooth: false,
  lineWidth: 3,
})
```

### 面积图

```typescript
const chart = new Chart(container, {
  type: 'area',
  data,
  title: '销售面积图',
  areaOpacity: 0.3,
})
```

## 柱状图 (Bar Chart)

适用于比较不同类别的数据。

### 基本柱状图

```typescript
import { createBarChart } from '@ldesign/chart'

const chart = createBarChart(container, data, {
  title: '月度销售额',
  barWidth: '60%',
  showLabel: true,
})
```

### 堆叠柱状图

```typescript
const chart = createBarChart(container, multiSeriesData, {
  title: '产品销售堆叠图',
  stack: true,
  stackName: 'total',
})
```

### 水平柱状图

```typescript
const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '水平柱状图',
  horizontal: true,
})
```

## 饼图 (Pie Chart)

适用于展示数据的占比关系。

### 基本饼图

```typescript
import { createPieChart } from '@ldesign/chart'

const chart = createPieChart(container, data, {
  title: '市场份额分布',
  showLabel: true,
  labelPosition: 'outside',
})
```

### 环形图

```typescript
const chart = createPieChart(container, data, {
  title: '环形图',
  donut: true,
  innerRadius: '40%',
  outerRadius: '70%',
})
```

### 玫瑰图

```typescript
const chart = new Chart(container, {
  type: 'pie',
  data,
  title: '玫瑰图',
  roseType: 'radius',
})
```

## 散点图 (Scatter Chart)

适用于展示两个变量之间的关系。

### 基本散点图

```typescript
const scatterData = [
  { name: '点1', value: [10, 20] },
  { name: '点2', value: [15, 25] },
  { name: '点3', value: [20, 18] },
  { name: '点4', value: [25, 30] },
]

const chart = new Chart(container, {
  type: 'scatter',
  data: scatterData,
  title: '身高体重关系图',
  symbolSize: 8,
})
```

### 气泡图

```typescript
const bubbleData = [
  { name: '产品A', value: [100, 200, 50] }, // [x, y, size]
  { name: '产品B', value: [150, 180, 80] },
  { name: '产品C', value: [200, 220, 30] },
]

const chart = new Chart(container, {
  type: 'scatter',
  data: bubbleData,
  title: '产品销售气泡图',
  symbolSize: (value) => value[2], // 根据第三个值确定气泡大小
})
```

## 图表配置选项

### 通用配置

所有图表类型都支持以下通用配置：

```typescript
const commonConfig = {
  title: '图表标题',
  subtitle: '副标题',
  theme: 'light', // 主题
  responsive: true, // 响应式
  animation: true, // 动画
  size: { width: 800, height: 600 }, // 尺寸
  grid: { // 网格配置
    left: '10%',
    right: '10%',
    top: '15%',
    bottom: '10%',
  },
}
```

### 坐标轴配置

```typescript
const axisConfig = {
  xAxis: {
    name: 'X轴标题',
    type: 'category', // 'category' | 'value' | 'time'
    axisLabel: {
      rotate: 45, // 标签旋转角度
    },
  },
  yAxis: {
    name: 'Y轴标题',
    type: 'value',
    min: 0,
    max: 1000,
  },
}
```

### 图例配置

```typescript
const legendConfig = {
  legend: {
    show: true,
    position: 'top', // 'top' | 'bottom' | 'left' | 'right'
    orient: 'horizontal', // 'horizontal' | 'vertical'
  },
}
```

### 工具箱配置

```typescript
const toolboxConfig = {
  toolbox: {
    show: true,
    features: {
      saveAsImage: true, // 保存为图片
      dataZoom: true, // 数据缩放
      restore: true, // 重置
      magicType: ['line', 'bar'], // 图表类型切换
    },
  },
}
```

## 最佳实践

### 选择合适的图表类型

- **折线图**：展示趋势变化，适合时间序列数据
- **柱状图**：比较不同类别的数值，适合分类数据
- **饼图**：展示占比关系，适合部分与整体的关系
- **散点图**：展示两个变量的相关性

### 数据准备

确保数据格式正确，数值类型为 number：

```typescript
// ✅ 正确
const data = [
  { name: '类别1', value: 100 },
  { name: '类别2', value: 200 },
]

// ❌ 错误
const data = [
  { name: '类别1', value: '100' }, // 字符串类型
  { name: '类别2', value: null }, // null 值
]
```

### 性能优化

- 对于大数据量，考虑使用数据采样
- 合理设置动画效果，避免过度动画
- 及时销毁不需要的图表实例
