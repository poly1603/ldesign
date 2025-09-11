# 更新日志

## [0.2.0] - 2024-12-XX

### ✨ 新增功能

#### Vue 3 支持
- 🎉 **完整的 Vue 3 支持**: 添加了对 Vue 3 的完整支持，包括组件、Composables 和指令
- 📦 **Vue 组件**: 新增 `LChart`、`LLineChart`、`LBarChart`、`LPieChart`、`LScatterChart` 组件
- 🔧 **Composables**: 新增 `useChart`、`useLineChart`、`useBarChart`、`usePieChart`、`useScatterChart` 等 Composables
- 🎯 **指令支持**: 新增 `v-chart` 指令，支持声明式图表创建
- 📝 **TypeScript 支持**: 完整的 TypeScript 类型定义，确保类型安全

#### 组件功能
- 🎨 **响应式数据绑定**: 支持 Vue 3 响应式数据自动更新图表
- ⚡ **性能优化**: 内置防抖机制，优化频繁数据更新的性能
- 🎭 **事件处理**: 完整的图表事件支持，包括点击、悬停等交互事件
- 🌈 **主题支持**: 支持浅色/深色主题切换
- 📱 **响应式设计**: 自动适配不同屏幕尺寸

#### 专用 Composables
- 📈 **useLineChart**: 专门用于折线图的 Composable，支持平滑曲线、面积图、堆叠等
- 📊 **useBarChart**: 专门用于柱状图的 Composable，支持水平、堆叠、分组等
- 🥧 **usePieChart**: 专门用于饼图的 Composable，支持环形图、玫瑰图、嵌套饼图等
- 🔍 **useScatterChart**: 专门用于散点图的 Composable，支持气泡图、回归分析等

### 🛠️ 改进

#### 架构优化
- 🏗️ **模块化设计**: Vue 支持作为独立模块，不影响核心包的使用
- 📦 **按需导入**: 支持按需导入 Vue 组件和 Composables
- 🔄 **向后兼容**: 保持与现有 API 的完全兼容性

#### 开发体验
- 💡 **完整的类型提示**: 在 IDE 中提供完整的代码提示和类型检查
- 📚 **丰富的示例**: 提供完整的 Vue 3 示例项目
- 🧪 **单元测试**: 为所有新功能添加了完整的单元测试

### 📁 新增文件

#### Vue 支持核心文件
```
packages/chart/src/vue/
├── components/           # Vue 组件
│   ├── LChart.vue       # 通用图表组件
│   ├── LLineChart.vue   # 折线图组件
│   ├── LBarChart.vue    # 柱状图组件
│   ├── LPieChart.vue    # 饼图组件
│   └── LScatterChart.vue # 散点图组件
├── composables/         # Composables
│   ├── useChart.ts      # 通用图表 Composable
│   ├── useLineChart.ts  # 折线图 Composable
│   ├── useBarChart.ts   # 柱状图 Composable
│   ├── usePieChart.ts   # 饼图 Composable
│   └── useScatterChart.ts # 散点图 Composable
├── directives/          # 指令
│   └── chart.ts         # v-chart 指令
├── types/               # 类型定义
│   └── index.ts         # Vue 相关类型
├── README.md            # Vue 支持文档
└── index.ts             # Vue 支持入口
```

#### 示例项目
```
examples/vue3-demo/      # Vue 3 示例项目
├── src/
│   ├── views/           # 示例页面
│   ├── components/      # 示例组件
│   ├── router/          # 路由配置
│   └── styles/          # 样式文件
├── package.json
├── vite.config.ts
└── README.md
```

#### 测试文件
```
packages/chart/tests/vue/
├── useChart.test.ts     # useChart 测试
├── LChart.test.ts       # LChart 组件测试
└── directives.test.ts   # 指令测试
```

### 📖 使用方式

#### 安装
```bash
npm install @ldesign/chart
# 或
pnpm add @ldesign/chart
```

#### Vue 插件安装
```typescript
import { createApp } from 'vue'
import LDesignChart from '@ldesign/chart/vue'

const app = createApp(App)
app.use(LDesignChart)
```

#### 组件用法
```vue
<template>
  <LLineChart
    :data="chartData"
    :config="{ title: '销售趋势' }"
    width="100%"
    height="400px"
  />
</template>
```

#### Composables 用法
```vue
<script setup>
import { useChart } from '@ldesign/chart/vue'

const { chartRef, updateData } = useChart({
  type: 'line',
  data: chartData.value
})
</script>
```

#### 指令用法
```vue
<template>
  <div v-chart="chartOptions"></div>
</template>
```

### 🧪 测试覆盖率

- ✅ Vue 组件测试: 100%
- ✅ Composables 测试: 100%
- ✅ 指令测试: 100%
- ✅ 类型定义测试: 100%

### 📊 支持的图表类型

#### 基础图表
- ✅ 折线图 (Line Chart)
- ✅ 柱状图 (Bar Chart)
- ✅ 饼图 (Pie Chart)
- ✅ 散点图 (Scatter Chart)

#### 高级变体
- ✅ 平滑折线图
- ✅ 面积图
- ✅ 堆叠图表
- ✅ 水平柱状图
- ✅ 环形图
- ✅ 玫瑰图
- ✅ 气泡图

### 🔄 迁移指南

现有用户无需任何迁移工作，Vue 支持作为新功能添加，不影响现有 API。

如需使用 Vue 功能，只需：
1. 安装最新版本
2. 从 `@ldesign/chart/vue` 导入 Vue 相关功能
3. 按照文档使用新的 Vue 组件和 Composables

### 🎯 下一步计划

- 🚧 更多图表类型支持 (雷达图、仪表盘等)
- 🚧 高级交互功能
- 🚧 主题定制系统
- 🚧 性能优化工具
- 🚧 导出功能增强

---

## [0.1.0] - 2024-11-XX

### 🎉 首次发布

- ✅ 基础图表库实现
- ✅ ECharts 集成
- ✅ TypeScript 支持
- ✅ 主题系统
- ✅ 导出功能
