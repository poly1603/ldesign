# @ldesign/chart

基于 ECharts 的通用图表组件库，采用数据驱动的设计理念，提供简化的 API 接口。

## ✨ 特性

### 🎯 核心功能
- **数据驱动** - 只需提供数据和基本配置，无需深入了解 ECharts 复杂配置项
- **框架无关** - 可在 React、Vue、原生 JavaScript 等任意框架中使用
- **TypeScript** - 完整的类型定义，提供优秀的开发体验

### 📊 图表类型
- **基础图表** - 折线图、柱状图、饼图、散点图、面积图
- **高级图表** - 热力图、雷达图、漏斗图、仪表盘
- **组合图表** - 多轴图表、混合图表类型

### 🎨 主题和样式
- **主题系统** - 内置多种主题，支持自定义主题和运行时切换
- **响应式设计** - 自动适应容器大小变化，完美支持移动端
- **动画效果** - 丰富的进入、退出和更新动画

### ⚡ 性能优化
- **高性能渲染** - 优化的渲染性能，支持大数据量和实时更新
- **内存管理** - 智能缓存和自动清理，防止内存泄漏
- **懒加载** - 可见性检测和按需渲染

### 🎯 交互功能
- **缩放拖拽** - 支持图表缩放、拖拽和平移
- **数据筛选** - 刷选、高亮和数据过滤
- **事件系统** - 完整的事件监听和回调机制

### 📤 导出功能
- **图片导出** - PNG、SVG、PDF 格式导出
- **数据导出** - Excel、CSV、JSON 格式导出
- **自定义配置** - 灵活的导出参数配置

## 📦 安装

```bash
# 使用 npm
npm install @ldesign/chart echarts

# 使用 pnpm
pnpm add @ldesign/chart echarts

# 使用 yarn
yarn add @ldesign/chart echarts
```

## 🚀 快速开始

### 基础用法

```typescript
import { Chart } from '@ldesign/chart'

// 创建图表
const chart = new Chart(container, {
  type: 'line',
  data: [
    { name: '1月', value: 100 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 }
  ],
  title: '月度销售额',
  theme: 'light'
})
```

### 多系列数据

```typescript
const chart = new Chart(container, {
  type: 'bar',
  data: {
    categories: ['1月', '2月', '3月'],
    series: [
      { name: '销售额', data: [100, 200, 150] },
      { name: '利润', data: [30, 60, 45] }
    ]
  },
  title: '销售数据对比'
})
```

### 便捷创建函数

```typescript
import { createLineChart, createBarChart, createPieChart } from '@ldesign/chart'

// 创建折线图
const lineChart = createLineChart('#line-chart', data, {
  title: '趋势图',
  smooth: true
})

// 创建柱状图
const barChart = createBarChart('#bar-chart', data, {
  title: '对比图',
  stack: true
})

// 创建饼图
const pieChart = createPieChart('#pie-chart', data, {
  title: '占比图',
  donut: true
})
```

## 📊 支持的图表类型

- **折线图** (`line`) - 展示数据趋势
- **柱状图** (`bar`) - 比较不同类别的数据
- **饼图** (`pie`) - 展示数据占比
- **散点图** (`scatter`) - 展示数据分布
- **面积图** (`area`) - 强调数据量级

## 🎨 主题系统

### 使用预设主题

```typescript
const chart = new Chart(container, {
  type: 'line',
  data: myData,
  theme: 'dark' // 'light' | 'dark' | 'colorful'
})
```

### 自定义主题

```typescript
const customTheme = {
  name: 'custom',
  colors: {
    primary: '#722ED1',
    background: '#ffffff',
    text: '#333333',
    palette: ['#722ED1', '#1890FF', '#52C41A']
  }
}

chart.setTheme(customTheme)
```

### 运行时切换主题

```typescript
// 切换到深色主题
chart.setTheme('dark')

// 切换到自定义主题
chart.setTheme(customTheme)
```

## 📱 响应式设计

图表会自动监听容器大小变化并调整尺寸：

```typescript
const chart = new Chart(container, {
  type: 'line',
  data: myData,
  responsive: true // 默认为 true
})

// 手动调整大小
chart.resize({ width: 800, height: 400 })
```

## 🎯 事件处理

```typescript
// 监听点击事件
chart.on('click', (params) => {
  console.log('点击了:', params)
})

// 监听图例选择事件
chart.on('legendselectchanged', (params) => {
  console.log('图例选择变化:', params)
})

// 移除事件监听
chart.off('click', handler)
```

## 🔧 高级配置

### 自定义 ECharts 配置

```typescript
const chart = new Chart(container, {
  type: 'line',
  data: myData,
  echartsOption: {
    // 直接传递 ECharts 配置
    grid: {
      left: '5%',
      right: '5%'
    },
    xAxis: {
      axisLabel: {
        rotate: 45
      }
    }
  }
})
```

### 数据更新

```typescript
// 更新数据
chart.updateData(newData)

// 更新配置
chart.updateConfig({
  title: '新标题',
  theme: 'dark'
})
```

### 加载状态

```typescript
// 显示加载动画
chart.showLoading('数据加载中...')

// 隐藏加载动画
chart.hideLoading()
```

## 🛠️ API 参考

### Chart 类

#### 构造函数

```typescript
new Chart(container: HTMLElement | string, config: ChartConfig)
```

#### 实例方法

- `updateData(data: ChartData): void` - 更新图表数据
- `updateConfig(config: Partial<ChartConfig>): void` - 更新图表配置
- `setTheme(theme: string | ThemeConfig): void` - 设置主题
- `resize(size?: ChartSize): void` - 调整图表大小
- `showLoading(text?: string): void` - 显示加载动画
- `hideLoading(): void` - 隐藏加载动画
- `clear(): void` - 清空图表
- `dispose(): void` - 销毁图表
- `on(eventType: ChartEventType, handler: EventHandler): void` - 注册事件
- `off(eventType: ChartEventType, handler?: EventHandler): void` - 注销事件

#### 属性

- `echarts: ECharts` - ECharts 实例（只读）
- `config: ChartConfig` - 图表配置（只读）
- `container: HTMLElement` - 容器元素（只读）

## 🚀 高级功能

### 高级图表类型

```typescript
import { ChartFactory } from '@ldesign/chart'

// 热力图
const heatmap = ChartFactory.createHeatmapChart('#container', data, options)

// 雷达图
const radar = ChartFactory.createRadarChart('#container', data, options)

// 漏斗图
const funnel = ChartFactory.createFunnelChart('#container', data, options)

// 仪表盘
const gauge = ChartFactory.createGaugeChart('#container', data, options)
```

### 性能优化

```typescript
const chart = new Chart('#container', data, {
  performance: {
    enableMonitoring: true,           // 启用性能监控
    largeDataThreshold: 10000,        // 大数据阈值
    enableDataSampling: true,         // 启用数据采样
    enableVirtualScrolling: true,     // 启用虚拟滚动
    enableProgressiveRendering: true  // 启用渐进式渲染
  },
  memory: {
    maxCacheSize: 50,                 // 最大缓存数量
    enableAutoCleanup: true,          // 启用自动清理
    enableMemoryMonitoring: true      // 启用内存监控
  }
})
```

### 交互功能

```typescript
// 启用缩放和刷选
chart.enableZoom({ type: 'inside' })
chart.enableBrush({ toolbox: ['rect', 'polygon'] })
chart.enableDataFilter({ dimension: 'category' })

// 监听交互事件
chart.on('brushSelected', (params) => {
  console.log('刷选数据:', params)
})
```

### 导出功能

```typescript
// 导出图片
await chart.exportImage('png', { width: 800, height: 600 })

// 导出 PDF
await chart.exportPDF({ filename: 'chart.pdf' })

// 导出数据
await chart.exportData('excel', { filename: 'data.xlsx' })
```

## 📚 更多文档

- [高级功能指南](./ADVANCED_FEATURES_GUIDE.md)
- [完整 API 文档](./docs/api/)
- [使用指南](./docs/guide/)
- [示例代码](./docs/examples/)

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

## 📄 许可证

[MIT License](./LICENSE) © 2024 ldesign

## 🔗 相关链接

- [ECharts 官网](https://echarts.apache.org/)
- [ldesign 设计系统](https://github.com/ldesign)
- [问题反馈](https://github.com/ldesign/chart/issues)

---

如果这个项目对你有帮助，请给我们一个 ⭐️！
