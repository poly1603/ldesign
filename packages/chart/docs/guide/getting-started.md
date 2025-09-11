# 快速开始

## 安装

```bash
npm install @ldesign/chart
# 或
yarn add @ldesign/chart
# 或
pnpm add @ldesign/chart
```

## 基本使用

### 创建简单图表

```typescript
import { Chart } from '@ldesign/chart'

// 创建图表容器
const container = document.getElementById('chart-container')

// 准备数据
const data = [
  { name: '1月', value: 100 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
]

// 创建图表
const chart = new Chart(container, {
  type: 'line',
  data,
  title: '销售趋势图',
})
```

### 使用便捷函数

```typescript
import { createLineChart, createBarChart, createPieChart } from '@ldesign/chart'

// 创建折线图
const lineChart = createLineChart(container, data, {
  title: '销售趋势',
  smooth: true,
})

// 创建柱状图
const barChart = createBarChart(container, data, {
  title: '销售对比',
  stack: true,
})

// 创建饼图
const pieChart = createPieChart(container, data, {
  title: '市场份额',
  donut: true,
})
```

## 数据格式

### 简单数据格式

适用于单系列图表：

```typescript
const simpleData = [
  { name: '分类1', value: 100 },
  { name: '分类2', value: 200 },
  { name: '分类3', value: 150 },
]
```

### 复杂数据格式

适用于多系列图表：

```typescript
const complexData = {
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    {
      name: '销售额',
      data: [100, 200, 150, 300, 250],
    },
    {
      name: '利润',
      data: [30, 60, 45, 90, 75],
    },
  ],
}
```

## 主题配置

### 使用预设主题

```typescript
const chart = new Chart(container, {
  type: 'line',
  data,
  theme: 'dark', // 'light' | 'dark' | 'colorful'
})
```

### 自定义主题

```typescript
const customTheme = {
  name: 'custom',
  colors: {
    primary: '#ff6b6b',
    background: '#ffffff',
    text: '#333333',
    palette: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  },
  font: {
    family: 'Arial, sans-serif',
    size: 14,
  },
}

const chart = new Chart(container, {
  type: 'line',
  data,
  theme: customTheme,
})
```

## 响应式设计

图表默认支持响应式设计，会自动适应容器大小变化：

```typescript
const chart = new Chart(container, {
  type: 'line',
  data,
  responsive: true, // 默认为 true
})

// 手动调整大小
chart.resize({ width: 800, height: 600 })
```

## 事件处理

```typescript
// 注册事件监听器
chart.on('click', (params) => {
  console.log('点击了数据点:', params)
})

chart.on('mouseover', (params) => {
  console.log('鼠标悬停:', params)
})

// 注销事件监听器
chart.off('click', clickHandler)
```

## 图表操作

```typescript
// 更新数据
chart.updateData(newData)

// 更新配置
chart.updateConfig({ title: '新标题' })

// 显示加载动画
chart.showLoading('加载中...')

// 隐藏加载动画
chart.hideLoading()

// 清空图表
chart.clear()

// 销毁图表
chart.dispose()
```

## 下一步

- [图表类型](./chart-types.md) - 了解支持的图表类型
- [配置选项](./configuration.md) - 详细的配置选项
- [主题系统](./themes.md) - 主题定制指南
- [事件系统](./events.md) - 事件处理详解
- [API 参考](../api/) - 完整的 API 文档
