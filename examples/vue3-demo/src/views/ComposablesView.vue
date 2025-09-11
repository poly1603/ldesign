<!--
  Composables 视图 - 展示如何使用 Composition API
-->

<template>
  <div class="composables-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>🔧 Composables 用法</h1>
      <p>使用 Vue 3 Composition API 创建响应式图表</p>
    </div>

    <!-- useChart 基础用法 -->
    <section class="demo-section">
      <h2 class="section-title">useChart 基础用法</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div ref="chartContainer" class="chart-container"></div>
        </div>
        
        <div class="demo-card__controls">
          <div class="control-group">
            <label>图表类型:</label>
            <select v-model="chartType" @change="updateChartType">
              <option value="line">折线图</option>
              <option value="bar">柱状图</option>
              <option value="pie">饼图</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>主题:</label>
            <select v-model="chartTheme" @change="updateChartTheme">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
          
          <div class="control-group">
            <button class="btn btn--primary" @click="updateData">
              🔄 更新数据
            </button>
            <button class="btn btn--secondary" @click="exportChart">
              📥 导出图片
            </button>
          </div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(useChartCode)">复制</button>
            </div>
            <pre><code>{{ useChartCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- useLineChart 专用 Composable -->
    <section class="demo-section">
      <h2 class="section-title">useLineChart 专用 Composable</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div ref="lineChartContainer" class="chart-container"></div>
        </div>
        
        <div class="demo-card__controls">
          <div class="control-group">
            <label>
              <input type="checkbox" v-model="lineOptions.smooth" @change="updateLineChart">
              平滑曲线
            </label>
          </div>
          
          <div class="control-group">
            <label>
              <input type="checkbox" v-model="lineOptions.area" @change="updateLineChart">
              面积填充
            </label>
          </div>
          
          <div class="control-group">
            <label>
              <input type="checkbox" v-model="lineOptions.showSymbol" @change="updateLineChart">
              显示数据点
            </label>
          </div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(useLineChartCode)">复制</button>
            </div>
            <pre><code>{{ useLineChartCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 响应式数据绑定 -->
    <section class="demo-section">
      <h2 class="section-title">响应式数据绑定</h2>
      
      <div class="demo-card">
        <div class="demo-card__preview">
          <div ref="reactiveChartContainer" class="chart-container"></div>
        </div>
        
        <div class="demo-card__controls">
          <div class="control-group">
            <label>数据值:</label>
            <input 
              v-for="(item, index) in reactiveData" 
              :key="index"
              type="range" 
              :min="0" 
              :max="500"
              v-model.number="item.value"
              class="range-input"
            >
          </div>
          
          <div class="data-display">
            <div v-for="(item, index) in reactiveData" :key="index" class="data-item">
              <span class="data-label">{{ item.name }}:</span>
              <span class="data-value">{{ item.value }}</span>
            </div>
          </div>
        </div>
        
        <div class="demo-card__code">
          <div class="code-block">
            <div class="code-block__header">
              <span class="language">vue</span>
              <button class="copy-btn" @click="copyCode(reactiveDataCode)">复制</button>
            </div>
            <pre><code>{{ reactiveDataCode }}</code></pre>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useChart, useLineChart } from '@ldesign/chart/vue'

/**
 * 基础 useChart 示例
 */
const chartContainer = ref<HTMLElement>()
const chartType = ref<'line' | 'bar' | 'pie'>('line')
const chartTheme = ref<'light' | 'dark'>('light')

const basicData = ref([
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 },
  { name: 'D', value: 300 },
  { name: 'E', value: 250 }
])

const { 
  chartInstance: basicChart,
  updateData: updateBasicData,
  setTheme: setBasicTheme,
  exportImage: exportBasicImage
} = useChart({
  type: chartType.value,
  data: basicData.value,
  config: { title: 'useChart 基础示例' }
})

// 更新图表类型
const updateChartType = () => {
  // 重新初始化图表
  console.log('更新图表类型:', chartType.value)
}

// 更新主题
const updateChartTheme = () => {
  setBasicTheme(chartTheme.value)
}

// 更新数据
const updateData = () => {
  basicData.value = basicData.value.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 400) + 50
  }))
  updateBasicData(basicData.value)
}

// 导出图表
const exportChart = async () => {
  try {
    const blob = await exportBasicImage('png')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart.png'
    a.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出失败:', error)
  }
}

/**
 * useLineChart 专用示例
 */
const lineChartContainer = ref<HTMLElement>()
const lineOptions = reactive({
  smooth: false,
  area: false,
  showSymbol: true
})

const lineData = ref([
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
  { name: '6月', value: 400 }
])

const { updateConfig: updateLineConfig } = useLineChart(lineData.value, {
  ...lineOptions,
  config: { title: 'useLineChart 专用示例' }
})

// 更新折线图配置
const updateLineChart = () => {
  updateLineConfig({
    title: 'useLineChart 专用示例',
    ...lineOptions
  })
}

/**
 * 响应式数据绑定示例
 */
const reactiveChartContainer = ref<HTMLElement>()
const reactiveData = ref([
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 },
  { name: '产品D', value: 400 }
])

const { chartInstance: reactiveChart } = useChart({
  type: 'bar',
  data: reactiveData.value,
  config: { title: '响应式数据绑定示例' }
})

// 监听数据变化，自动更新图表
watch(reactiveData, (newData) => {
  console.log('数据已更新:', newData)
}, { deep: true })

/**
 * 代码示例
 */
const useChartCode = `<template>
  <div ref="chartContainer"></div>
  <button @click="updateData">更新数据</button>
</template>

<script setup>
import { ref } from 'vue'
import { useChart } from '@ldesign/chart/vue'

const chartContainer = ref()
const data = ref([
  { name: 'A', value: 100 },
  { name: 'B', value: 200 },
  { name: 'C', value: 150 }
])

const { 
  chartInstance,
  updateData: updateChartData,
  exportImage 
} = useChart({
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

<style lang="less" scoped>
.composables-view {
  padding: var(--ls-padding-base) 0;
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    font-size: var(--ls-font-size-h1);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

/* 演示区域 */
.demo-section {
  margin-bottom: var(--ls-margin-xl);

  .section-title {
    font-size: var(--ls-font-size-h2);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-lg);
    padding-bottom: var(--ls-padding-sm);
    border-bottom: 2px solid var(--ldesign-brand-color);
    display: inline-block;
  }
}

/* 演示卡片 */
.demo-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  &__preview {
    padding: var(--ls-padding-lg);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    .chart-container {
      width: 100%;
      height: 300px;
      background: var(--ldesign-bg-color-container);
      border-radius: var(--ls-border-radius-base);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ldesign-text-color-placeholder);
    }
  }

  &__controls {
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-base);
    align-items: center;

    .control-group {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        white-space: nowrap;
      }

      select {
        padding: var(--ls-padding-xs) var(--ls-padding-sm);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-sm);
        background: var(--ldesign-bg-color-component);
        color: var(--ldesign-text-color-primary);
      }

      input[type="checkbox"] {
        margin-right: var(--ls-spacing-xs);
      }

      .range-input {
        width: 120px;
        margin: var(--ls-margin-xs) 0;
      }
    }

    .data-display {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ls-spacing-base);
      margin-top: var(--ls-margin-sm);
      width: 100%;

      .data-item {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-xs);
        padding: var(--ls-padding-xs) var(--ls-padding-sm);
        background: var(--ldesign-bg-color-component);
        border-radius: var(--ls-border-radius-sm);
        font-size: var(--ls-font-size-sm);

        .data-label {
          color: var(--ldesign-text-color-secondary);
        }

        .data-value {
          color: var(--ldesign-brand-color);
          font-weight: 500;
        }
      }
    }
  }

  &__code {
    background: var(--ldesign-bg-color-component);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-card {
    &__controls {
      flex-direction: column;
      align-items: stretch;

      .control-group {
        justify-content: space-between;
      }
    }
  }
}
</style>`

const useLineChartCode = `<template>
  <div ref="lineContainer"></div>
  <label>
    <input type="checkbox" v-model="smooth">
    平滑曲线
  </label>
</template>

<script setup>
import { ref } from 'vue'
import { useLineChart } from '@ldesign/chart/vue'

const lineContainer = ref()
const smooth = ref(false)
const data = ref([
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 }
])

const { updateConfig } = useLineChart(data.value, {
  smooth: smooth.value,
  config: { title: '折线图示例' }
})

watch(smooth, (newSmooth) => {
  updateConfig({ smooth: newSmooth })
})
</script>`

const reactiveDataCode = `<template>
  <div ref="chartContainer"></div>
  <input 
    v-for="item in data" 
    :key="item.name"
    type="range" 
    v-model.number="item.value"
  >
</template>

<script setup>
import { ref, watch } from 'vue'
import { useChart } from '@ldesign/chart/vue'

const chartContainer = ref()
const data = ref([
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 }
])

const { updateData } = useChart({
  type: 'bar',
  data: data.value,
  config: { title: '响应式图表' }
})

// 自动响应数据变化
watch(data, (newData) => {
  updateData(newData)
}, { deep: true })
</script>`

/**
 * 复制代码
 */
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    console.log('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
  }
}

/**
 * 生命周期
 */
onMounted(() => {
  // 设置图表容器
  if (chartContainer.value) {
    // basicChart 的容器设置逻辑
  }
})
</script>
