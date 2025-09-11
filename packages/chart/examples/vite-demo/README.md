# @ldesign/chart Vite Demo

这是一个基于 Vite + JavaScript 的完整示例项目，展示了 `@ldesign/chart` 图表库的所有功能和特性。

## 🚀 快速开始

### 安装依赖

```bash
cd packages/chart/examples/vite-demo
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000 查看示例。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📊 功能展示

### 1. 概览页面
- 快速开始示例
- 功能特性介绍
- 基本使用方法

### 2. 折线图示例
- **基础折线图**: 最简单的折线图实现
- **平滑折线图**: 使用平滑曲线的折线图
- **多系列折线图**: 展示多个数据系列的对比
- **时间序列折线图**: 基于时间轴的数据展示

### 3. 柱状图示例
- **基础柱状图**: 垂直柱状图
- **水平柱状图**: 横向显示的柱状图
- **堆叠柱状图**: 多个数据系列堆叠显示
- **分组柱状图**: 多个数据系列分组对比

### 4. 饼图示例
- **基础饼图**: 展示数据的占比关系
- **环形图**: 中心空心的饼图

### 5. 散点图示例
- **基础散点图**: 展示两个变量之间的关系
- **气泡图**: 三维数据的可视化展示

### 6. 面积图示例
- **基础面积图**: 强调数据的累积效果
- **堆叠面积图**: 多个数据系列的累积展示

### 7. 高级功能
- **交互式图表**: 支持点击事件和动态数据更新
- **动画图表**: 自动切换数据的动画效果

### 8. 性能测试
- **大数据量测试**: 测试图表在大数据量下的渲染性能
- **实时数据更新**: 模拟实时数据流的更新性能

## 🎨 主题系统

示例支持三种主题：

- **浅色主题 (light)**: 默认的浅色主题
- **深色主题 (dark)**: 适合暗色环境的深色主题
- **彩色主题 (colorful)**: 更加丰富的彩色主题

可以通过页面顶部的主题切换器实时切换主题。

## 🔧 技术特性

### 框架无关
- 使用原生 JavaScript 实现
- 可以轻松集成到任何前端框架中

### 数据驱动
- 简化的 API 设计
- 用户只需提供数据和基本配置

### 响应式设计
- 自动适应容器大小变化
- 支持移动端和桌面端

### 高性能
- 支持大数据量渲染
- 优化的内存使用
- 流畅的动画效果

## 📝 代码示例

### 基础用法

```javascript
import { Chart } from '@ldesign/chart'

// 准备数据
const data = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
]

// 创建图表
const chart = new Chart(container, {
  type: 'line',
  data,
  title: '月度销售趋势',
  theme: 'light'
})
```

### 主题切换

```javascript
// 切换到深色主题
chart.setTheme('dark')

// 切换到彩色主题
chart.setTheme('colorful')
```

### 事件处理

```javascript
// 监听点击事件
chart.on('click', (params) => {
  console.log('点击了:', params.name, params.value)
})

// 监听悬停事件
chart.on('mouseover', (params) => {
  console.log('悬停在:', params.name)
})
```

### 动态数据更新

```javascript
// 更新数据
chart.updateData(newData)

// 添加数据点
chart.addData({ name: '新数据', value: 100 })

// 删除数据点
chart.removeData(index)
```

## 🏗️ 项目结构

```
vite-demo/
├── src/
│   ├── main.js              # 主入口文件
│   ├── styles/
│   │   └── main.css         # 主样式文件
│   └── charts/
│       ├── overview.js      # 概览页面
│       ├── line-charts.js   # 折线图示例
│       ├── bar-charts.js    # 柱状图示例
│       ├── pie-charts.js    # 饼图示例
│       ├── scatter-charts.js # 散点图示例
│       ├── area-charts.js   # 面积图示例
│       ├── advanced-charts.js # 高级功能
│       └── performance-charts.js # 性能测试
├── index.html               # 主 HTML 文件
├── vite.config.js          # Vite 配置
├── package.json            # 项目配置
└── README.md               # 项目说明
```

## 🌟 特色功能

1. **完整的图表类型支持**: 涵盖常用的所有图表类型
2. **实时主题切换**: 无需刷新页面即可切换主题
3. **交互式演示**: 每个示例都包含可操作的控件
4. **性能监控**: 实时显示渲染性能数据
5. **代码展示**: 每个示例都包含对应的代码
6. **响应式布局**: 适配各种屏幕尺寸

## 📱 移动端支持

示例完全支持移动端访问，包括：
- 触摸交互
- 响应式布局
- 移动端优化的控件

## 🔗 相关链接

- [@ldesign/chart 文档](../../docs/)
- [ECharts 官方文档](https://echarts.apache.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 📄 许可证

MIT License
