<template>
  <div class="page">
    <h1 class="page-title">Composables 示例</h1>
    <p class="page-description">
      展示 @ldesign/chart 提供的 Composables API 的使用方法。
      Composables 提供了更灵活的图表控制能力，适合复杂的交互场景。
    </p>

    <!-- useChart 基础用法 -->
    <div class="section">
      <h2 class="section-title">useChart - 通用图表 Hook</h2>
      <div class="chart-container">
        <h3 class="chart-title">基础用法演示</h3>
        <p class="chart-description">
          useChart 是最基础的 composable，提供图表的完整控制能力。
        </p>
        <div class="controls">
          <button class="btn" @click="updateChartData">更新数据</button>
          <button class="btn btn-secondary" @click="changeChartTheme">切换主题</button>
          <button class="btn btn-secondary" @click="exportChartImage">导出图片</button>
          <button class="btn btn-secondary" @click="toggleLoading">切换加载状态</button>
        </div>
        <div class="status-info">
          <span>加载状态: {{ loading ? '加载中' : '已完成' }}</span>
          <span>错误信息: {{ error || '无' }}</span>
          <span>图表就绪: {{ ready ? '是' : '否' }}</span>
        </div>
        <div ref="chartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </div>

    <!-- useLineChart 专用 Hook -->
    <div class="section">
      <h2 class="section-title">useLineChart - 折线图专用 Hook</h2>
      <div class="chart-container">
        <h3 class="chart-title">折线图高级控制</h3>
        <p class="chart-description">
          useLineChart 专门为折线图优化，提供更多折线图特有的功能。
        </p>
        <div class="controls">
          <button class="btn" @click="addLineData">添加数据点</button>
          <button class="btn btn-secondary" @click="toggleSmooth">切换平滑</button>
          <button class="btn btn-secondary" @click="toggleArea">切换面积图</button>
        </div>
        <div class="status-info">
          <span>平滑模式: {{ lineOptions.smooth ? '开启' : '关闭' }}</span>
          <span>面积图: {{ lineOptions.area ? '开启' : '关闭' }}</span>
          <span>数据点数: {{ lineChartData.length }}</span>
        </div>
        <div ref="lineChartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </div>

    <!-- useBarChart 专用 Hook -->
    <div class="section">
      <h2 class="section-title">useBarChart - 柱状图专用 Hook</h2>
      <div class="chart-container">
        <h3 class="chart-title">柱状图高级控制</h3>
        <p class="chart-description">
          useBarChart 专门为柱状图设计，支持堆叠、分组等高级功能。
        </p>
        <div class="controls">
          <button class="btn" @click="addBarData">添加数据</button>
          <button class="btn btn-secondary" @click="toggleStack">切换堆叠</button>
          <button class="btn btn-secondary" @click="toggleHorizontal">切换方向</button>
        </div>
        <div class="status-info">
          <span>堆叠模式: {{ barOptions.stack ? '开启' : '关闭' }}</span>
          <span>水平模式: {{ barOptions.horizontal ? '开启' : '关闭' }}</span>
          <span>数据项数: {{ barChartData.length }}</span>
        </div>
        <div ref="barChartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </div>

    <!-- usePieChart 专用 Hook -->
    <div class="section">
      <h2 class="section-title">usePieChart - 饼图专用 Hook</h2>
      <div class="chart-container">
        <h3 class="chart-title">饼图高级控制</h3>
        <p class="chart-description">
          usePieChart 提供饼图的专门控制，支持环形图、玫瑰图等变体。
        </p>
        <div class="controls">
          <button class="btn" @click="addPieData">添加数据</button>
          <button class="btn btn-secondary" @click="toggleDonut">切换环形</button>
          <button class="btn btn-secondary" @click="toggleRose">切换玫瑰图</button>
        </div>
        <div class="status-info">
          <span>环形模式: {{ pieOptions.donut ? '开启' : '关闭' }}</span>
          <span>玫瑰图: {{ pieOptions.rose ? '开启' : '关闭' }}</span>
          <span>数据项数: {{ pieChartData.length }}</span>
        </div>
        <div ref="pieChartRef" style="width: 100%; height: 400px;"></div>
      </div>
    </div>

    <!-- 事件处理演示 -->
    <div class="section">
      <h2 class="section-title">事件处理演示</h2>
      <div class="chart-container">
        <h3 class="chart-title">图表交互事件</h3>
        <p class="chart-description">
          演示如何使用 Composables 处理图表的各种交互事件。
        </p>
        <div class="controls">
          <button class="btn" @click="clearEventLog">清空事件日志</button>
        </div>
        <div class="event-log">
          <h4>事件日志:</h4>
          <div class="log-content">
            <div v-for="(event, index) in eventLog" :key="index" class="log-item">
              {{ event }}
            </div>
          </div>
        </div>
        <div ref="eventChartRef" style="width: 100%; height: 300px;"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  useChart, 
  useLineChart, 
  useBarChart, 
  usePieChart 
} from '@ldesign/chart/vue'

// 基础图表数据和状态
const chartRef = ref<HTMLElement>()
const currentTheme = ref('light')

// useChart 基础演示
const {
  chartInstance,
  loading,
  error,
  ready,
  updateData,
  setTheme,
  exportImage,
  showLoading,
  hideLoading
} = useChart({
  type: 'line',
  data: [
    { name: '1月', value: 100 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 }
  ],
  config: { title: 'useChart 演示' }
})

// 折线图数据和选项
const lineChartRef = ref<HTMLElement>()
const lineChartData = ref([
  { name: '数据1', value: 100 },
  { name: '数据2', value: 200 },
  { name: '数据3', value: 150 }
])
const lineOptions = ref({
  smooth: false,
  area: false
})

const lineChart = useLineChart(lineChartData, {
  ...lineOptions.value,
  config: { title: 'useLineChart 演示' }
})

// 柱状图数据和选项
const barChartRef = ref<HTMLElement>()
const barChartData = ref([
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 }
])
const barOptions = ref({
  stack: false,
  horizontal: false
})

const barChart = useBarChart(barChartData, {
  ...barOptions.value,
  config: { title: 'useBarChart 演示' }
})

// 饼图数据和选项
const pieChartRef = ref<HTMLElement>()
const pieChartData = ref([
  { name: '类型A', value: 335 },
  { name: '类型B', value: 310 },
  { name: '类型C', value: 234 }
])
const pieOptions = ref({
  donut: false,
  rose: false
})

const pieChart = usePieChart(pieChartData, {
  ...pieOptions.value,
  config: { title: 'usePieChart 演示' }
})

// 事件处理演示
const eventChartRef = ref<HTMLElement>()
const eventLog = ref<string[]>([])

const eventChart = useChart({
  type: 'bar',
  data: [
    { name: '点击我', value: 100 },
    { name: '悬停我', value: 200 },
    { name: '选择我', value: 150 }
  ],
  config: { title: '点击或悬停图表元素' }
})

// 方法实现
const updateChartData = () => {
  const newData = [
    { name: '1月', value: Math.floor(Math.random() * 300) + 50 },
    { name: '2月', value: Math.floor(Math.random() * 300) + 50 },
    { name: '3月', value: Math.floor(Math.random() * 300) + 50 },
    { name: '4月', value: Math.floor(Math.random() * 300) + 50 }
  ]
  updateData(newData)
}

const changeChartTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  setTheme(currentTheme.value)
}

const exportChartImage = async () => {
  try {
    const blob = await exportImage('png')
    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'chart.png'
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('导出失败:', err)
  }
}

const toggleLoading = () => {
  if (loading.value) {
    hideLoading()
  } else {
    showLoading()
  }
}

// 折线图方法
const addLineData = () => {
  const index = lineChartData.value.length + 1
  lineChartData.value.push({
    name: `数据${index}`,
    value: Math.floor(Math.random() * 300) + 50
  })
}

const toggleSmooth = () => {
  lineOptions.value.smooth = !lineOptions.value.smooth
  // 重新初始化图表以应用新选项
  // 在实际实现中，这应该通过 updateConfig 方法来实现
}

const toggleArea = () => {
  lineOptions.value.area = !lineOptions.value.area
}

// 柱状图方法
const addBarData = () => {
  const index = barChartData.value.length + 1
  barChartData.value.push({
    name: `产品${String.fromCharCode(65 + index - 1)}`,
    value: Math.floor(Math.random() * 400) + 100
  })
}

const toggleStack = () => {
  barOptions.value.stack = !barOptions.value.stack
}

const toggleHorizontal = () => {
  barOptions.value.horizontal = !barOptions.value.horizontal
}

// 饼图方法
const addPieData = () => {
  const index = pieChartData.value.length + 1
  pieChartData.value.push({
    name: `类型${String.fromCharCode(65 + index - 1)}`,
    value: Math.floor(Math.random() * 200) + 50
  })
}

const toggleDonut = () => {
  pieOptions.value.donut = !pieOptions.value.donut
}

const toggleRose = () => {
  pieOptions.value.rose = !pieOptions.value.rose
}

// 事件日志
const addEventLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  eventLog.value.unshift(`[${timestamp}] ${message}`)
  if (eventLog.value.length > 10) {
    eventLog.value = eventLog.value.slice(0, 10)
  }
}

const clearEventLog = () => {
  eventLog.value = []
}

// 组件挂载后设置图表容器引用
onMounted(() => {
  if (chartRef.value) {
    // 在实际实现中，这里应该设置图表容器引用
    // chartInstance.value = new Chart(chartRef.value, options)
  }
  
  // 设置事件监听器
  if (eventChart.chartInstance.value) {
    eventChart.on('click', (params: any) => {
      addEventLog(`点击了: ${params.name}`)
    })
    
    eventChart.on('mouseover', (params: any) => {
      addEventLog(`悬停: ${params.name}`)
    })
  }
})
</script>

<style scoped>
.status-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.status-info span {
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.event-log {
  margin-bottom: 1rem;
}

.event-log h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.log-content {
  max-height: 150px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  padding: 0.5rem;
}

.log-item {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.25rem;
  font-family: monospace;
}

.log-item:last-child {
  margin-bottom: 0;
}
</style>
