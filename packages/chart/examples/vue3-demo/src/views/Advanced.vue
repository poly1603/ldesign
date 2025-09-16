<template>
  <div class="page">
    <h1 class="page-title">高级功能示例</h1>
    <p class="page-description">
      展示 @ldesign/chart 的高级功能，包括主题切换、事件交互、响应式数据、
      多系列图表、自定义配置等复杂场景的使用方法。
    </p>

    <!-- 主题切换演示 -->
    <div class="section">
      <h2 class="section-title">主题系统</h2>
      <div class="chart-container">
        <h3 class="chart-title">动态主题切换</h3>
        <p class="chart-description">
          演示如何在运行时动态切换图表主题，支持亮色、暗色和自定义主题。
        </p>
        <div class="controls">
          <button 
            v-for="theme in themes" 
            :key="theme.value"
            class="btn"
            :class="{ 'btn-secondary': currentTheme !== theme.value }"
            @click="switchTheme(theme.value)"
          >
            {{ theme.label }}
          </button>
        </div>
        <div class="theme-info">
          <span>当前主题: {{ themes.find(t => t.value === currentTheme)?.label }}</span>
        </div>
        <LChart
          :type="'line'"
          :data="themeData"
          :theme="currentTheme"
          :config="{ title: '主题切换演示' }"
          width="100%"
          height="350px"
        />
      </div>
    </div>

    <!-- 多系列数据演示 -->
    <div class="section">
      <h2 class="section-title">多系列数据图表</h2>
      <div class="chart-container">
        <h3 class="chart-title">销售数据对比</h3>
        <p class="chart-description">
          展示如何处理多系列数据，包括多条折线、分组柱状图等。
        </p>
        <div class="controls">
          <button class="btn" @click="addSeries">添加系列</button>
          <button class="btn btn-secondary" @click="removeSeries">删除系列</button>
          <button class="btn btn-secondary" @click="toggleSeriesType">切换图表类型</button>
        </div>
        <div class="series-info">
          <span>系列数量: {{ multiSeriesData.series.length }}</span>
          <span>图表类型: {{ seriesChartType }}</span>
        </div>
        <LChart
          :type="seriesChartType"
          :data="multiSeriesData"
          :config="{ 
            title: '多系列数据演示',
            legend: { show: true }
          }"
          width="100%"
          height="400px"
        />
      </div>
    </div>

    <!-- 实时数据更新 -->
    <div class="section">
      <h2 class="section-title">实时数据更新</h2>
      <div class="chart-container">
        <h3 class="chart-title">模拟实时监控</h3>
        <p class="chart-description">
          模拟实时数据流，演示图表的动态更新能力和性能表现。
        </p>
        <div class="controls">
          <button class="btn" @click="toggleRealtime">
            {{ isRealtime ? '停止' : '开始' }}实时更新
          </button>
          <button class="btn btn-secondary" @click="clearRealtimeData">清空数据</button>
          <label class="control-label">
            更新间隔:
            <select v-model="realtimeInterval" @change="restartRealtime">
              <option value="500">500ms</option>
              <option value="1000">1s</option>
              <option value="2000">2s</option>
            </select>
          </label>
        </div>
        <div class="realtime-info">
          <span>状态: {{ isRealtime ? '运行中' : '已停止' }}</span>
          <span>数据点数: {{ realtimeData.length }}</span>
          <span>最后更新: {{ lastUpdateTime }}</span>
        </div>
        <LLineChart
          :data="realtimeData"
          :smooth="true"
          :config="{ 
            title: '实时数据监控',
            animation: { duration: 300 }
          }"
          width="100%"
          height="350px"
        />
      </div>
    </div>

    <!-- 事件交互演示 -->
    <div class="section">
      <h2 class="section-title">事件交互</h2>
      <div class="chart-container">
        <h3 class="chart-title">图表联动</h3>
        <p class="chart-description">
          演示图表之间的联动效果，点击一个图表会影响另一个图表的显示。
        </p>
        <div class="interaction-container">
          <div class="chart-half">
            <h4>主图表（点击数据项）</h4>
            <LBarChart
              :data="interactionData"
              :config="{ 
                title: '产品销量',
                onClick: handleChartClick
              }"
              width="100%"
              height="300px"
            />
          </div>
          <div class="chart-half">
            <h4>详情图表（显示选中项的详细数据）</h4>
            <LPieChart
              :data="selectedItemDetail"
              :config="{ 
                title: selectedItem ? `${selectedItem}详细分析` : '请选择数据项'
              }"
              width="100%"
              height="300px"
            />
          </div>
        </div>
        <div class="interaction-info">
          <span>选中项: {{ selectedItem || '无' }}</span>
          <span>点击次数: {{ clickCount }}</span>
        </div>
      </div>
    </div>

    <!-- 响应式布局演示 -->
    <div class="section">
      <h2 class="section-title">响应式布局</h2>
      <div class="chart-container">
        <h3 class="chart-title">自适应图表</h3>
        <p class="chart-description">
          演示图表如何响应容器大小变化，支持移动端和桌面端的自适应显示。
        </p>
        <div class="controls">
          <button class="btn" @click="setContainerSize('small')">小尺寸</button>
          <button class="btn btn-secondary" @click="setContainerSize('medium')">中等尺寸</button>
          <button class="btn btn-secondary" @click="setContainerSize('large')">大尺寸</button>
          <button class="btn btn-secondary" @click="setContainerSize('full')">全尺寸</button>
        </div>
        <div class="responsive-info">
          <span>当前尺寸: {{ containerSize }}</span>
          <span>容器宽度: {{ containerWidth }}px</span>
        </div>
        <div 
          class="responsive-container"
          :class="`size-${containerSize}`"
          ref="responsiveContainer"
        >
          <LChart
            :type="'bar'"
            :data="responsiveData"
            :config="{ 
              title: '响应式图表',
              responsive: true
            }"
            width="100%"
            height="300px"
            :auto-resize="true"
          />
        </div>
      </div>
    </div>

    <!-- 自定义配置演示 -->
    <div class="section">
      <h2 class="section-title">自定义配置</h2>
      <div class="chart-container">
        <h3 class="chart-title">高级配置选项</h3>
        <p class="chart-description">
          展示如何使用高级配置选项来定制图表的外观和行为。
        </p>
        <div class="config-controls">
          <div class="config-group">
            <label>
              <input type="checkbox" v-model="customConfig.showGrid"> 显示网格
            </label>
            <label>
              <input type="checkbox" v-model="customConfig.showLegend"> 显示图例
            </label>
            <label>
              <input type="checkbox" v-model="customConfig.showTooltip"> 显示提示框
            </label>
          </div>
          <div class="config-group">
            <label>
              动画时长:
              <input 
                type="range" 
                min="0" 
                max="2000" 
                v-model="customConfig.animationDuration"
              >
              {{ customConfig.animationDuration }}ms
            </label>
          </div>
        </div>
        <LChart
          :type="'line'"
          :data="configData"
          :config="computedCustomConfig"
          width="100%"
          height="350px"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 主题切换
const themes = [
  { label: '亮色主题', value: 'light' },
  { label: '暗色主题', value: 'dark' },
  { label: '蓝色主题', value: 'blue' },
  { label: '绿色主题', value: 'green' }
]

const currentTheme = ref('light')
const themeData = ref([
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 }
])

const switchTheme = (theme: string) => {
  currentTheme.value = theme
}

// 多系列数据
const seriesChartType = ref('line')
const multiSeriesData = ref({
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    { name: '销售额', data: [120, 200, 150, 300, 250] },
    { name: '利润', data: [30, 60, 45, 90, 75] }
  ]
})

const addSeries = () => {
  const index = multiSeriesData.value.series.length + 1
  const newSeries = {
    name: `系列${index}`,
    data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 200) + 50)
  }
  multiSeriesData.value.series.push(newSeries)
}

const removeSeries = () => {
  if (multiSeriesData.value.series.length > 1) {
    multiSeriesData.value.series.pop()
  }
}

const toggleSeriesType = () => {
  seriesChartType.value = seriesChartType.value === 'line' ? 'bar' : 'line'
}

// 实时数据更新
const isRealtime = ref(false)
const realtimeInterval = ref('1000')
const realtimeData = ref([
  { name: '0s', value: 100 }
])
const lastUpdateTime = ref('')
let realtimeTimer: number | null = null

const toggleRealtime = () => {
  isRealtime.value = !isRealtime.value
  if (isRealtime.value) {
    startRealtime()
  } else {
    stopRealtime()
  }
}

const startRealtime = () => {
  realtimeTimer = setInterval(() => {
    const time = new Date().toLocaleTimeString()
    const value = Math.floor(Math.random() * 200) + 50
    
    realtimeData.value.push({
      name: time,
      value
    })
    
    // 保持最多50个数据点
    if (realtimeData.value.length > 50) {
      realtimeData.value.shift()
    }
    
    lastUpdateTime.value = time
  }, parseInt(realtimeInterval.value))
}

const stopRealtime = () => {
  if (realtimeTimer) {
    clearInterval(realtimeTimer)
    realtimeTimer = null
  }
}

const restartRealtime = () => {
  if (isRealtime.value) {
    stopRealtime()
    startRealtime()
  }
}

const clearRealtimeData = () => {
  realtimeData.value = [{ name: '0s', value: 100 }]
  lastUpdateTime.value = ''
}

// 事件交互
const interactionData = ref([
  { name: '产品A', value: 320 },
  { name: '产品B', value: 240 },
  { name: '产品C', value: 180 },
  { name: '产品D', value: 290 }
])

const selectedItem = ref('')
const clickCount = ref(0)

const selectedItemDetail = computed(() => {
  if (!selectedItem.value) return []
  
  // 模拟详细数据
  return [
    { name: '线上销售', value: Math.floor(Math.random() * 100) + 50 },
    { name: '线下销售', value: Math.floor(Math.random() * 100) + 30 },
    { name: '批发销售', value: Math.floor(Math.random() * 100) + 20 }
  ]
})

const handleChartClick = (params: any) => {
  selectedItem.value = params.name
  clickCount.value++
}

// 响应式布局
const containerSize = ref('full')
const containerWidth = ref(800)
const responsiveContainer = ref<HTMLElement>()

const responsiveData = ref([
  { name: '移动端', value: 45 },
  { name: '桌面端', value: 35 },
  { name: '平板端', value: 20 }
])

const setContainerSize = (size: string) => {
  containerSize.value = size
  
  // 模拟容器宽度变化
  const widths = {
    small: 300,
    medium: 500,
    large: 700,
    full: 800
  }
  containerWidth.value = widths[size as keyof typeof widths]
}

// 自定义配置
const customConfig = ref({
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  animationDuration: 1000
})

const configData = ref([
  { name: '配置项1', value: 100 },
  { name: '配置项2', value: 200 },
  { name: '配置项3', value: 150 },
  { name: '配置项4', value: 300 }
])

const computedCustomConfig = computed(() => ({
  title: '自定义配置演示',
  grid: { show: customConfig.value.showGrid },
  legend: { show: customConfig.value.showLegend },
  tooltip: { show: customConfig.value.showTooltip },
  animation: { duration: customConfig.value.animationDuration }
}))

// 生命周期
onMounted(() => {
  // 初始化响应式容器宽度
  if (responsiveContainer.value) {
    containerWidth.value = responsiveContainer.value.offsetWidth
  }
})

onUnmounted(() => {
  stopRealtime()
})
</script>

<style scoped>
.theme-info,
.series-info,
.realtime-info,
.interaction-info,
.responsive-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.theme-info span,
.series-info span,
.realtime-info span,
.interaction-info span,
.responsive-info span {
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border-radius: 4px;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.control-label select {
  padding: 0.25rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.interaction-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
}

.chart-half h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
}

.responsive-container {
  transition: all 0.3s ease;
  border: 2px dashed #ddd;
  padding: 1rem;
  margin: 1rem 0;
}

.responsive-container.size-small {
  max-width: 300px;
}

.responsive-container.size-medium {
  max-width: 500px;
}

.responsive-container.size-large {
  max-width: 700px;
}

.responsive-container.size-full {
  max-width: 100%;
}

.config-controls {
  margin-bottom: 1rem;
}

.config-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.config-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.config-group input[type="checkbox"] {
  margin: 0;
}

.config-group input[type="range"] {
  margin: 0 0.5rem;
}

@media (max-width: 768px) {
  .interaction-container {
    grid-template-columns: 1fr;
  }
  
  .config-group {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
