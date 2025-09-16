<template>
  <div class="page">
    <h1 class="page-title">图表组件示例</h1>
    <p class="page-description">
      展示 @ldesign/chart 提供的各种 Vue 组件的使用方法。
      所有组件都支持响应式数据绑定和丰富的配置选项。
    </p>

    <!-- 通用图表组件 -->
    <div class="section">
      <h2 class="section-title">LChart - 通用图表组件</h2>
      <div class="chart-container">
        <h3 class="chart-title">动态图表类型切换</h3>
        <p class="chart-description">
          LChart 是最基础的图表组件，可以通过 type 属性切换不同的图表类型。
        </p>
        <div class="controls">
          <button 
            v-for="type in chartTypes" 
            :key="type.value"
            class="btn"
            :class="{ 'btn-secondary': currentChartType !== type.value }"
            @click="currentChartType = type.value"
          >
            {{ type.label }}
          </button>
        </div>
        <LChart
          :type="currentChartType"
          :data="dynamicData"
          :config="{ title: `${chartTypes.find(t => t.value === currentChartType)?.label}示例` }"
          width="100%"
          height="400px"
        />
      </div>
    </div>

    <!-- 折线图组件 -->
    <div class="section">
      <h2 class="section-title">LLineChart - 折线图组件</h2>
      <div class="grid">
        <div class="chart-container">
          <h3 class="chart-title">基础折线图</h3>
          <p class="chart-description">最简单的折线图，展示数据趋势。</p>
          <LLineChart
            :data="lineData"
            :config="{ title: '月度销售趋势' }"
            width="100%"
            height="300px"
          />
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">平滑折线图</h3>
          <p class="chart-description">启用平滑曲线，让线条更加流畅。</p>
          <LLineChart
            :data="lineData"
            :smooth="true"
            :config="{ title: '平滑销售趋势' }"
            width="100%"
            height="300px"
          />
        </div>
      </div>
    </div>

    <!-- 柱状图组件 -->
    <div class="section">
      <h2 class="section-title">LBarChart - 柱状图组件</h2>
      <div class="grid">
        <div class="chart-container">
          <h3 class="chart-title">基础柱状图</h3>
          <p class="chart-description">展示不同类别的数据对比。</p>
          <LBarChart
            :data="barData"
            :config="{ title: '产品销量对比' }"
            width="100%"
            height="300px"
          />
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">水平柱状图</h3>
          <p class="chart-description">水平方向的柱状图，适合长标签。</p>
          <LBarChart
            :data="barData"
            :horizontal="true"
            :config="{ title: '水平产品销量' }"
            width="100%"
            height="300px"
          />
        </div>
      </div>
    </div>

    <!-- 饼图组件 -->
    <div class="section">
      <h2 class="section-title">LPieChart - 饼图组件</h2>
      <div class="grid">
        <div class="chart-container">
          <h3 class="chart-title">基础饼图</h3>
          <p class="chart-description">展示数据的占比关系。</p>
          <LPieChart
            :data="pieData"
            :config="{ title: '市场份额分布' }"
            width="100%"
            height="300px"
          />
        </div>
        
        <div class="chart-container">
          <h3 class="chart-title">环形图</h3>
          <p class="chart-description">中间镂空的饼图，更加美观。</p>
          <LPieChart
            :data="pieData"
            :donut="true"
            :config="{ title: '环形市场份额' }"
            width="100%"
            height="300px"
          />
        </div>
      </div>
    </div>

    <!-- 散点图组件 -->
    <div class="section">
      <h2 class="section-title">LScatterChart - 散点图组件</h2>
      <div class="chart-container">
        <h3 class="chart-title">身高体重关系散点图</h3>
        <p class="chart-description">展示两个变量之间的关系。</p>
        <LScatterChart
          :data="scatterData"
          :config="{ 
            title: '身高体重关系',
            xAxis: { name: '身高(cm)' },
            yAxis: { name: '体重(kg)' }
          }"
          width="100%"
          height="400px"
        />
      </div>
    </div>

    <!-- 响应式数据演示 -->
    <div class="section">
      <h2 class="section-title">响应式数据演示</h2>
      <div class="chart-container">
        <h3 class="chart-title">实时数据更新</h3>
        <p class="chart-description">
          点击按钮动态更新数据，图表会自动响应变化。
        </p>
        <div class="controls">
          <button class="btn" @click="addRandomData">添加随机数据</button>
          <button class="btn btn-secondary" @click="removeLastData">删除最后一项</button>
          <button class="btn btn-secondary" @click="resetData">重置数据</button>
        </div>
        <LLineChart
          :data="reactiveData"
          :config="{ title: '实时数据更新演示' }"
          width="100%"
          height="300px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 图表类型选项
const chartTypes = [
  { label: '折线图', value: 'line' },
  { label: '柱状图', value: 'bar' },
  { label: '饼图', value: 'pie' },
  { label: '散点图', value: 'scatter' }
]

const currentChartType = ref('line')

// 基础示例数据
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

// 动态数据（根据图表类型切换）
const dynamicData = computed(() => {
  switch (currentChartType.value) {
    case 'line':
      return lineData.value
    case 'bar':
      return barData.value
    case 'pie':
      return pieData.value
    case 'scatter':
      return scatterData.value
    default:
      return lineData.value
  }
})

// 响应式数据演示
const reactiveData = ref([
  { name: '数据1', value: 100 },
  { name: '数据2', value: 200 },
  { name: '数据3', value: 150 }
])

// 添加随机数据
const addRandomData = () => {
  const index = reactiveData.value.length + 1
  const value = Math.floor(Math.random() * 300) + 50
  reactiveData.value.push({
    name: `数据${index}`,
    value
  })
}

// 删除最后一项数据
const removeLastData = () => {
  if (reactiveData.value.length > 1) {
    reactiveData.value.pop()
  }
}

// 重置数据
const resetData = () => {
  reactiveData.value = [
    { name: '数据1', value: 100 },
    { name: '数据2', value: 200 },
    { name: '数据3', value: 150 }
  ]
}
</script>
