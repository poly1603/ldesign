# LDesign Chart Vue3 示例项目

这是一个基于 Vue 3 的示例项目，展示了 `@ldesign/chart` 图表组件库的所有功能和用法。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 📊 功能展示

### 基础图表
- ✅ 折线图 (Line Chart)
- ✅ 柱状图 (Bar Chart)  
- ✅ 饼图 (Pie Chart)
- ✅ 散点图 (Scatter Chart)

### 高级功能
- ✅ Vue 3 Composition API 支持
- ✅ TypeScript 完整类型支持
- ✅ 响应式数据绑定
- ✅ 组件式用法
- ✅ Composables 用法
- ✅ 指令式用法 (v-chart)
- 🚧 主题定制 (开发中)
- 🚧 交互功能 (开发中)
- 🚧 导出功能 (开发中)
- 🚧 性能优化 (开发中)

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Vite** - 下一代前端构建工具
- **Vue Router** - Vue.js 官方路由
- **Less** - CSS 预处理器
- **ECharts** - 数据可视化图表库
- **@ldesign/chart** - 基于 ECharts 的 Vue 图表组件库

## 📁 项目结构

```
examples/vue3-demo/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   ├── views/             # 页面视图
│   │   ├── HomeView.vue           # 首页
│   │   ├── BasicChartsView.vue    # 基础图表
│   │   ├── AdvancedChartsView.vue # 高级图表
│   │   ├── ComposablesView.vue    # Composables 用法
│   │   ├── DirectivesView.vue     # 指令用法
│   │   ├── InteractiveView.vue    # 交互功能
│   │   ├── ThemesView.vue         # 主题定制
│   │   ├── PerformanceView.vue    # 性能优化
│   │   ├── ExportView.vue         # 导出功能
│   │   └── NotFoundView.vue       # 404 页面
│   ├── router/            # 路由配置
│   ├── styles/            # 样式文件
│   │   ├── index.less     # 样式入口
│   │   ├── variables.less # 变量定义
│   │   ├── themes.less    # 主题样式
│   │   ├── reset.less     # 重置样式
│   │   ├── global.less    # 全局样式
│   │   └── components.less # 组件样式
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
└── README.md              # 项目说明
```

## 🎯 使用示例

### 组件用法

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
import { LLineChart } from '@ldesign/chart/vue'

const chartData = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
]
</script>
```

### Composables 用法

```vue
<template>
  <div ref="chartContainer"></div>
  <button @click="updateData">更新数据</button>
</template>

<script setup>
import { ref } from 'vue'
import { useChart } from '@ldesign/chart/vue'

const chartContainer = ref()
const data = ref([
  { name: 'A', value: 100 },
  { name: 'B', value: 200 }
])

const { updateData: updateChartData } = useChart({
  type: 'line',
  data: data.value,
  config: { title: '我的图表' }
})

const updateData = () => {
  data.value = data.value.map(item => ({
    ...item,
    value: Math.random() * 300
  }))
  updateChartData(data.value)
}
</script>
```

### 指令用法

```vue
<template>
  <div 
    v-chart="chartOptions"
    style="width: 100%; height: 400px;"
  ></div>
</template>

<script setup>
const chartOptions = {
  type: 'bar',
  data: [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 240 }
  ],
  config: { title: '产品销量' }
}
</script>
```

## 🎨 主题定制

项目使用 LDesign 设计系统，支持浅色和深色主题切换。

```less
// 自定义主题变量
:root {
  --ldesign-brand-color: #722ED1;
  --ldesign-bg-color-page: #ffffff;
  --ldesign-text-color-primary: rgba(0, 0, 0, 90%);
}

[data-theme="dark"] {
  --ldesign-bg-color-page: #141414;
  --ldesign-text-color-primary: rgba(255, 255, 255, 90%);
}
```

## 📖 相关文档

- [Vue 3 官方文档](https://vuejs.org/)
- [ECharts 官方文档](https://echarts.apache.org/)
- [LDesign Chart 文档](../../packages/chart/README.md)
- [TypeScript 官方文档](https://www.typescriptlang.org/)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例项目。

## 📄 许可证

MIT License
