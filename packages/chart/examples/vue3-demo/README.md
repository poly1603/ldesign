# @ldesign/chart Vue 3 示例项目

这是一个基于 Vite + Vue 3 的示例项目，展示了如何使用 @ldesign/chart 图表库。该项目完全使用内部提供的 Vue 组件和 Composables，不包含任何功能代码实现。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install

# 进入示例项目目录
cd packages/chart/examples/vue3-demo

# 安装示例项目依赖
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

## 📁 项目结构

```
vue3-demo/
├── src/
│   ├── views/              # 示例页面
│   │   ├── Home.vue        # 首页 - 快速预览
│   │   ├── Components.vue  # 组件示例
│   │   ├── Composables.vue # Composables 示例
│   │   └── Advanced.vue    # 高级功能示例
│   ├── router/             # 路由配置
│   │   └── index.ts
│   ├── App.vue             # 根组件
│   ├── main.ts             # 应用入口
│   └── style.css           # 全局样式
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎯 示例内容

### 1. 首页 (Home.vue)
- 快速预览各种图表类型
- 展示基本的组件使用方法
- 功能特性介绍

### 2. 组件示例 (Components.vue)
- **LChart** - 通用图表组件，支持动态类型切换
- **LLineChart** - 折线图组件，支持平滑曲线
- **LBarChart** - 柱状图组件，支持水平/垂直布局
- **LPieChart** - 饼图组件，支持环形图
- **LScatterChart** - 散点图组件
- **响应式数据演示** - 实时数据更新

### 3. Composables 示例 (Composables.vue)
- **useChart** - 通用图表 Hook，提供完整控制能力
- **useLineChart** - 折线图专用 Hook
- **useBarChart** - 柱状图专用 Hook
- **usePieChart** - 饼图专用 Hook
- **事件处理** - 图表交互事件监听

### 4. 高级功能 (Advanced.vue)
- **主题系统** - 动态主题切换
- **多系列数据** - 复杂数据结构处理
- **实时数据更新** - 模拟实时监控
- **事件交互** - 图表联动效果
- **响应式布局** - 自适应容器大小
- **自定义配置** - 高级配置选项

## 🔧 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **TypeScript** - 类型安全的 JavaScript
- **Vue Router** - Vue.js 官方路由
- **@ldesign/chart** - 基于 ECharts 的图表库

## 📖 使用方法

### 1. 安装图表库

```bash
npm install @ldesign/chart echarts
```

### 2. 在 Vue 应用中注册插件

```typescript
import { createApp } from 'vue'
import LDesignChart from '@ldesign/chart/vue'

const app = createApp(App)
app.use(LDesignChart)
```

### 3. 使用组件

```vue
<template>
  <LLineChart
    :data="chartData"
    :config="{ title: '销售趋势' }"
    width="100%"
    height="400px"
  />
</template>

<script setup>
import { ref } from 'vue'

const chartData = ref([
  { name: '1月', value: 100 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
])
</script>
```

### 4. 使用 Composables

```vue
<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref } from 'vue'
import { useChart } from '@ldesign/chart/vue'

const chartData = ref([...])

const {
  chartRef,
  chartInstance,
  updateData,
  loading,
  error
} = useChart({
  type: 'line',
  data: chartData.value,
  config: { title: '图表标题' }
})
</script>
```

## 🎨 主要特性

### 响应式数据绑定
- 自动监听数据变化
- 智能更新图表内容
- 支持深度响应式

### 类型安全
- 完整的 TypeScript 类型定义
- 智能代码提示
- 编译时错误检查

### 主题系统
- 内置多种主题
- 支持自定义主题
- 动态主题切换

### 事件系统
- 完整的图表事件支持
- Vue 风格的事件处理
- 支持事件修饰符

### 性能优化
- 防抖更新机制
- 智能重渲染
- 内存泄漏防护

## 🔗 相关链接

- [@ldesign/chart 文档](../../docs/index.md)
- [ECharts 官方文档](https://echarts.apache.org/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Vite 官方文档](https://vitejs.dev/)

## 🛠️ 开发说明

### 项目特点
- **零功能代码** - 完全使用 @ldesign/chart 提供的组件和 hooks
- **纯展示性质** - 专注于展示如何使用图表库
- **最佳实践** - 展示推荐的使用模式和代码结构
- **完整示例** - 覆盖常见使用场景和高级功能

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 Composition API 最佳实践
- 响应式数据管理
- 组件化开发

### 注意事项
- 本项目仅作为使用示例，不包含图表库的具体实现
- 所有图表功能都依赖于 @ldesign/chart 库
- 示例数据为模拟数据，实际使用时请替换为真实数据源

## 📄 许可证

MIT License
