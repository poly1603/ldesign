<template>
  <div class="container">
    <h1>@ldesign/chart - Vue 3 示例</h1>

    <div class="controls">
      <button @click="toggleDarkMode">
        {{ darkMode ? '切换到亮色模式' : '切换到暗色模式' }}
      </button>
      <button @click="increaseFontSize">增大字体</button>
      <button @click="decreaseFontSize">减小字体</button>
      <button @click="refreshData">刷新数据</button>
    </div>

    <div class="chart-grid">
      <!-- 折线图 -->
      <div class="chart-card">
        <h2>折线图 - 简单数组</h2>
        <Chart 
          type="line" 
          :data="lineData" 
          title="月度销售趋势"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>

      <!-- 柱状图 -->
      <div class="chart-card">
        <h2>柱状图 - 带标签</h2>
        <Chart 
          type="bar" 
          :data="barData" 
          title="季度销售额"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>

      <!-- 饼图 -->
      <div class="chart-card">
        <h2>饼图</h2>
        <Chart 
          type="pie" 
          :data="pieData" 
          title="产品占比"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>

      <!-- 多系列折线图 -->
      <div class="chart-card">
        <h2>多系列折线图</h2>
        <Chart 
          type="line" 
          :data="multiLineData" 
          title="销售额 vs 利润"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>

      <!-- 散点图 -->
      <div class="chart-card">
        <h2>散点图</h2>
        <Chart 
          type="scatter" 
          :data="scatterData" 
          title="数据分布"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>

      <!-- 雷达图 -->
      <div class="chart-card">
        <h2>雷达图</h2>
        <Chart 
          type="radar" 
          :data="radarData" 
          title="综合评分"
          :dark-mode="darkMode"
          :font-size="fontSize"
          :height="300"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Chart } from '@ldesign/chart/vue'

// 状态
const darkMode = ref(false)
const fontSize = ref(12)

// 折线图数据
const lineData = ref([120, 200, 150, 80, 70, 110, 130])

// 柱状图数据
const barData = ref({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { name: '销售额', data: [100, 200, 150, 300] }
  ]
})

// 饼图数据
const pieData = ref({
  labels: ['产品A', '产品B', '产品C', '产品D'],
  datasets: [
    { data: [30, 25, 25, 20] }
  ]
})

// 多系列折线图数据
const multiLineData = ref({
  labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
  datasets: [
    { name: '销售额', data: [100, 200, 300, 250, 280, 350] },
    { name: '利润', data: [50, 80, 120, 100, 110, 140] }
  ]
})

// 散点图数据
const scatterData = ref({
  labels: [],
  datasets: [
    { 
      name: '数据点', 
      data: Array.from({ length: 50 }, () => [
        Math.random() * 100,
        Math.random() * 100
      ])
    }
  ]
})

// 雷达图数据
const radarData = ref({
  labels: ['质量', '服务', '价格', '速度', '创新'],
  datasets: [
    { name: '产品A', data: [80, 90, 70, 85, 75] },
    { name: '产品B', data: [70, 85, 80, 75, 80] }
  ]
})

// 方法
const toggleDarkMode = () => {
  darkMode.value = !darkMode.value
}

const increaseFontSize = () => {
  fontSize.value = Math.min(fontSize.value + 2, 24)
}

const decreaseFontSize = () => {
  fontSize.value = Math.max(fontSize.value - 2, 8)
}

const refreshData = () => {
  // 刷新折线图数据
  lineData.value = Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50)
  
  // 刷新柱状图数据
  barData.value = {
    ...barData.value,
    datasets: [
      { name: '销售额', data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 300) + 50) }
    ]
  }
  
  // 刷新饼图数据
  pieData.value = {
    ...pieData.value,
    datasets: [
      { data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 40) + 10) }
    ]
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  color: #333;
}

.controls {
  text-align: center;
  margin: 20px 0;
}

button {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 4px;
  background: #1890ff;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #40a9ff;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.chart-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.chart-card h2 {
  margin-top: 0;
  color: #666;
  font-size: 18px;
}
</style>

