# @ldesign/chart 高级功能指南

## 📊 高级图表类型

### 热力图 (HeatmapChart)

热力图用于展示二维数据的密度分布，适用于数据可视化和热点分析。

```typescript
import { ChartFactory } from '@ldesign/chart'

// 创建热力图
const heatmapChart = ChartFactory.createHeatmapChart('#heatmap-container', {
  categories: ['周一', '周二', '周三', '周四', '周五'],
  series: [
    {
      name: '上午',
      data: [
        [0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0],
        [1, 0, 1], [1, 1, 3], [1, 2, 0], [1, 3, 0], [1, 4, 1]
      ]
    }
  ]
}, {
  visualMap: {
    min: 0,
    max: 10,
    calculable: true,
    orient: 'horizontal',
    left: 'center',
    bottom: '15%'
  }
})
```

### 雷达图 (RadarChart)

雷达图用于多维数据对比和分析，展示多个指标的综合表现。

```typescript
// 创建雷达图
const radarChart = ChartFactory.createRadarChart('#radar-container', {
  categories: ['销售', '管理', '信息技术', '客服', '研发', '市场'],
  series: [
    {
      name: '预算分配',
      data: [4300, 10000, 28000, 35000, 50000, 19000]
    },
    {
      name: '实际开销',
      data: [5000, 14000, 28000, 31000, 42000, 21000]
    }
  ]
}, {
  radar: {
    indicator: [
      { name: '销售', max: 60000 },
      { name: '管理', max: 16000 },
      { name: '信息技术', max: 30000 },
      { name: '客服', max: 38000 },
      { name: '研发', max: 52000 },
      { name: '市场', max: 25000 }
    ]
  }
})
```

### 漏斗图 (FunnelChart)

漏斗图用于展示转化率和流程分析，常用于销售漏斗和用户转化分析。

```typescript
// 创建漏斗图
const funnelChart = ChartFactory.createFunnelChart('#funnel-container', {
  series: [
    {
      name: '漏斗图',
      data: [
        { value: 60, name: '访问' },
        { value: 40, name: '咨询' },
        { value: 20, name: '订单' },
        { value: 80, name: '点击' },
        { value: 100, name: '展现' }
      ]
    }
  ]
}, {
  sort: 'descending',
  gap: 2,
  label: {
    show: true,
    position: 'inside'
  }
})
```

### 仪表盘 (GaugeChart)

仪表盘用于实时数据监控和指标展示，适用于 KPI 监控和进度展示。

```typescript
// 创建仪表盘
const gaugeChart = ChartFactory.createGaugeChart('#gauge-container', {
  series: [
    {
      name: '业务指标',
      data: [{ value: 75, name: '完成率' }]
    }
  ]
}, {
  startAngle: 180,
  endAngle: 0,
  min: 0,
  max: 100,
  splitNumber: 10,
  axisLine: {
    lineStyle: {
      width: 6,
      color: [
        [0.3, '#67e0e3'],
        [0.7, '#37a2da'],
        [1, '#fd666d']
      ]
    }
  }
})
```

## 🚀 性能优化功能

### 性能管理器 (PerformanceManager)

性能管理器提供 FPS 监控、内存使用监控和大数据优化功能。

```typescript
import { Chart } from '@ldesign/chart'

// 创建带性能监控的图表
const chart = new Chart('#container', data, {
  performance: {
    enableMonitoring: true,           // 启用性能监控
    largeDataThreshold: 10000,        // 大数据阈值
    enableDataSampling: true,         // 启用数据采样
    enableVirtualScrolling: true,     // 启用虚拟滚动
    enableProgressiveRendering: true  // 启用渐进式渲染
  }
})

// 获取性能指标
const metrics = chart.getPerformanceMetrics()
console.log('FPS:', metrics.fps)
console.log('渲染时间:', metrics.renderTime)
console.log('内存使用:', metrics.memoryUsage)
```

### 内存管理器 (MemoryManager)

内存管理器提供图表实例缓存、自动清理和内存泄漏检测。

```typescript
// 配置内存管理
const chart = new Chart('#container', data, {
  memory: {
    maxCacheSize: 50,                 // 最大缓存数量
    memoryWarningThreshold: 100,      // 内存警告阈值 (MB)
    enableAutoCleanup: true,          // 启用自动清理
    enableMemoryMonitoring: true      // 启用内存监控
  }
})

// 手动触发内存清理
chart.clearMemoryCache()

// 检查内存使用情况
const memoryInfo = chart.getMemoryInfo()
console.log('缓存大小:', memoryInfo.cacheSize)
console.log('内存使用:', memoryInfo.memoryUsage)
```

## 🎯 交互功能增强

### 交互管理器 (InteractionManager)

交互管理器提供缩放、拖拽、刷选和数据筛选功能。

```typescript
// 启用交互功能
chart.enableZoom({
  type: 'inside',     // 内部缩放
  xAxisIndex: [0],    // X轴索引
  yAxisIndex: [0]     // Y轴索引
})

chart.enableBrush({
  toolbox: ['rect', 'polygon', 'lineX', 'lineY', 'keep', 'clear'],
  xAxisIndex: 'all',
  yAxisIndex: 'all'
})

// 数据筛选
chart.enableDataFilter({
  dimension: 'category',
  filterType: 'include',
  values: ['A', 'B', 'C']
})

// 监听交互事件
chart.on('brushSelected', (params) => {
  console.log('刷选数据:', params.batch[0].selected)
})

chart.on('dataZoom', (params) => {
  console.log('缩放范围:', params.start, params.end)
})
```

## 🎨 动画系统

### 动画管理器 (AnimationManager)

动画管理器提供进入、退出和更新动画效果。

```typescript
// 配置动画
const chart = new Chart('#container', data, {
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0
  }
})

// 自定义动画序列
chart.playAnimation('fadeIn', {
  duration: 800,
  easing: 'elasticOut'
})

// 数据更新动画
chart.updateData(newData, {
  animation: {
    duration: 600,
    easing: 'bounceOut'
  }
})
```

## 🔄 生命周期管理

### 生命周期管理器 (LifecycleManager)

生命周期管理器提供状态化图表管理和懒加载功能。

```typescript
// 监听生命周期事件
chart.on('stateChange', (state) => {
  console.log('图表状态变更:', state)
  // UNINITIALIZED → INITIALIZING → INITIALIZED → RENDERING → RENDERED
})

// 暂停和恢复图表
chart.pause()   // 暂停渲染
chart.resume()  // 恢复渲染

// 懒加载配置
const chart = new Chart('#container', data, {
  lifecycle: {
    enableLazyLoading: true,      // 启用懒加载
    enableVisibilityDetection: true  // 启用可见性检测
  }
})
```

## 📤 导出功能

### 导出管理器 (ExportManager)

导出管理器支持多种格式的图表和数据导出。

```typescript
// 导出图片
await chart.exportImage('png', {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff'
})

// 导出 PDF
await chart.exportPDF({
  filename: 'chart.pdf',
  format: 'A4',
  orientation: 'landscape'
})

// 导出数据
await chart.exportData('excel', {
  filename: 'chart-data.xlsx',
  sheetName: '图表数据'
})

// 导出 SVG
const svgString = await chart.exportSVG({
  width: 800,
  height: 600
})
```

## 🎨 主题系统

### 主题管理器 (ThemeManager)

主题管理器提供动态主题切换和自定义主题创建。

```typescript
import { ThemeManager } from '@ldesign/chart'

// 切换预设主题
ThemeManager.setTheme('dark')
ThemeManager.setTheme('light')

// 创建自定义主题
ThemeManager.createCustomTheme('myTheme', 'light', {
  primaryColor: '#722ED1',
  backgroundColor: '#f5f5f5',
  textColor: '#333333'
})

// 应用自定义主题
ThemeManager.setTheme('myTheme')

// 从 CSS 变量创建主题
const cssTheme = ThemeManager.createThemeFromCSS()
ThemeManager.registerTheme('cssTheme', cssTheme)
```

## 🔧 配置选项

### 完整配置示例

```typescript
const chart = new Chart('#container', data, {
  // 基础配置
  type: 'line',
  theme: 'light',
  
  // 响应式配置
  responsive: {
    enabled: true,
    breakpoints: {
      mobile: 768,
      tablet: 1024
    }
  },
  
  // 性能配置
  performance: {
    enableMonitoring: true,
    largeDataThreshold: 10000,
    enableDataSampling: true,
    enableVirtualScrolling: true,
    enableProgressiveRendering: true
  },
  
  // 内存配置
  memory: {
    maxCacheSize: 50,
    memoryWarningThreshold: 100,
    enableAutoCleanup: true,
    enableMemoryMonitoring: true
  },
  
  // 生命周期配置
  lifecycle: {
    enableLazyLoading: true,
    enableVisibilityDetection: true
  },
  
  // 动画配置
  animation: {
    enabled: true,
    duration: 1000,
    easing: 'cubicOut',
    delay: 0
  }
})
```

这个高级功能指南涵盖了 @ldesign/chart 的所有新增功能和高级特性，为开发者提供了完整的使用参考。
