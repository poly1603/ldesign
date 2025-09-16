<template>
  <div class="page">
    <h1 class="page-title">@ldesign/chart Vue 3 示例</h1>
    <p class="page-description">
      这是一个基于 Vite + Vue 3 的示例项目，展示了如何使用 @ldesign/chart 图表库。
      该项目不包含任何功能代码，完全使用内部提供的 Vue 组件和 Composables。
    </p>

    <div class="section">
      <h2 class="section-title">快速预览</h2>
      <div class="grid">
        <!-- 折线图预览 -->
        <div class="chart-container">
          <h3 class="chart-title">折线图示例</h3>
          <LLineChart
            :data="lineData"
            :config="{ title: '月度销售趋势' }"
            width="100%"
            height="300px"
          />
        </div>

        <!-- 柱状图预览 -->
        <div class="chart-container">
          <h3 class="chart-title">柱状图示例</h3>
          <LBarChart
            :data="barData"
            :config="{ title: '产品销量对比' }"
            width="100%"
            height="300px"
          />
        </div>

        <!-- 饼图预览 -->
        <div class="chart-container">
          <h3 class="chart-title">饼图示例</h3>
          <LPieChart
            :data="pieData"
            :config="{ title: '市场份额分布' }"
            width="100%"
            height="300px"
          />
        </div>

        <!-- 散点图预览 -->
        <div class="chart-container">
          <h3 class="chart-title">散点图示例</h3>
          <LScatterChart
            :data="scatterData"
            :config="{ title: '身高体重关系' }"
            width="100%"
            height="300px"
          />
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">功能特性</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div class="feature-card">
          <h3>Vue 3 组件</h3>
          <p>提供开箱即用的图表组件，支持响应式数据绑定</p>
        </div>
        <div class="feature-card">
          <h3>Composables API</h3>
          <p>基于 Composition API 的 hooks，提供更灵活的使用方式</p>
        </div>
        <div class="feature-card">
          <h3>TypeScript 支持</h3>
          <p>完整的类型定义，提供更好的开发体验</p>
        </div>
        <div class="feature-card">
          <h3>主题系统</h3>
          <p>支持多种主题和自定义主题，适应不同设计需求</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 示例数据 - 这些数据在实际项目中会来自 API 或其他数据源
const lineData = ref([
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
  { name: '6月', value: 400 }
])

const barData = ref([
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 },
  { name: '产品D', value: 290 },
  { name: '产品E', value: 350 }
])

const pieData = ref([
  { name: '直接访问', value: 335 },
  { name: '邮件营销', value: 310 },
  { name: '联盟广告', value: 234 },
  { name: '视频广告', value: 135 },
  { name: '搜索引擎', value: 1548 }
])

const scatterData = ref([
  { name: '数据点1', value: [161.2, 51.6] },
  { name: '数据点2', value: [167.5, 59.0] },
  { name: '数据点3', value: [159.5, 49.2] },
  { name: '数据点4', value: [157.0, 63.0] },
  { name: '数据点5', value: [155.8, 53.6] },
  { name: '数据点6', value: [170.0, 59.0] },
  { name: '数据点7', value: [159.1, 47.6] },
  { name: '数据点8', value: [166.0, 69.8] },
  { name: '数据点9', value: [176.2, 66.8] },
  { name: '数据点10', value: [160.2, 75.2] }
])
</script>

<style scoped>
.feature-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.feature-card h3 {
  margin-top: 0;
  color: #409eff;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}
</style>
