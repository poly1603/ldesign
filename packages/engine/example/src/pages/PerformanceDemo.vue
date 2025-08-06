<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const isMonitoring = ref(false)
const performanceData = ref<any>({})
const metrics = ref<any[]>([])
const updateInterval = ref<number>()
const testResults = ref<any[]>([])

// 计算属性
const hasMetrics = computed(() => metrics.value.length > 0)
const hasTestResults = computed(() => testResults.value.length > 0)
const currentMemoryUsage = computed(() => {
  if (performanceData.value.memory) {
    return `${(performanceData.value.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
  }
  return '0 MB'
})

const memoryLimit = computed(() => {
  if (performanceData.value.memory) {
    return `${(performanceData.value.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
  }
  return '0 MB'
})

const memoryUsagePercentage = computed(() => {
  if (performanceData.value.memory) {
    const used = performanceData.value.memory.usedJSHeapSize
    const limit = performanceData.value.memory.jsHeapSizeLimit
    return Math.round((used / limit) * 100)
  }
  return 0
})

// 方法
function startMonitoring() {
  isMonitoring.value = true

  updateInterval.value = setInterval(() => {
    updatePerformanceData()
  }, 1000)

  engine.logger.info('性能监控已启动')
  engine.notifications.show({
    type: 'info',
    title: '监控启动',
    message: '性能监控已开始',
    duration: 2000,
  })
}

function stopMonitoring() {
  isMonitoring.value = false

  if (updateInterval.value) {
    clearInterval(updateInterval.value)
    updateInterval.value = undefined
  }

  engine.logger.info('性能监控已停止')
  engine.notifications.show({
    type: 'info',
    title: '监控停止',
    message: '性能监控已停止',
    duration: 2000,
  })
}

function updatePerformanceData() {
  const now = performance.now()

  // 获取内存信息
  const memory = (performance as any).memory
    ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      }
    : null

  // 获取导航时间信息
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

  performanceData.value = {
    timestamp: now,
    memory,
    navigation: navigation
      ? {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive - navigation.navigationStart,
        }
      : null,
    timing: {
      now,
      timeOrigin: performance.timeOrigin,
    },
  }

  // 添加到历史记录
  metrics.value.push({
    timestamp: new Date().toLocaleTimeString(),
    memory: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
    memoryPercentage: memoryUsagePercentage.value,
  })

  // 只保留最近50条记录
  if (metrics.value.length > 50) {
    metrics.value = metrics.value.slice(-50)
  }
}

async function runPerformanceTest() {
  engine.logger.info('开始性能测试')

  const testName = `性能测试 ${new Date().toLocaleTimeString()}`
  const startTime = performance.now()
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0

  try {
    // 测试1: 大量DOM操作
    const domTestStart = performance.now()
    for (let i = 0; i < 1000; i++) {
      const div = document.createElement('div')
      div.textContent = `Test ${i}`
      document.body.appendChild(div)
      document.body.removeChild(div)
    }
    const domTestEnd = performance.now()

    // 测试2: 大量事件触发
    const eventTestStart = performance.now()
    for (let i = 0; i < 1000; i++) {
      engine.events.emit('perf:test', { iteration: i })
    }
    const eventTestEnd = performance.now()

    // 测试3: 大量状态操作
    const stateTestStart = performance.now()
    for (let i = 0; i < 1000; i++) {
      engine.state.set(`perf.test.${i}`, { value: Math.random() })
    }
    const stateTestEnd = performance.now()

    // 清理测试数据
    for (let i = 0; i < 1000; i++) {
      engine.state.remove(`perf.test.${i}`)
    }

    const endTime = performance.now()
    const endMemory = (performance as any).memory?.usedJSHeapSize || 0

    const result = {
      name: testName,
      totalTime: Math.round(endTime - startTime),
      domOperations: Math.round(domTestEnd - domTestStart),
      eventOperations: Math.round(eventTestEnd - eventTestStart),
      stateOperations: Math.round(stateTestEnd - stateTestStart),
      memoryDelta: Math.round((endMemory - startMemory) / 1024),
      timestamp: new Date().toLocaleString(),
    }

    testResults.value.unshift(result)

    engine.logger.info('性能测试完成', result)
    engine.notifications.show({
      type: 'success',
      title: '测试完成',
      message: `总耗时: ${result.totalTime}ms`,
      duration: 3000,
    })
  }
  catch (error) {
    engine.logger.error('性能测试失败', error)
    engine.notifications.show({
      type: 'error',
      title: '测试失败',
      message: `测试过程中发生错误: ${error}`,
      duration: 3000,
    })
  }
}

function clearMetrics() {
  metrics.value = []
  testResults.value = []

  engine.notifications.show({
    type: 'info',
    title: '已清空',
    message: '所有性能数据已清空',
    duration: 2000,
  })
}

function exportPerformanceData() {
  const data = {
    timestamp: new Date().toISOString(),
    currentData: performanceData.value,
    metrics: metrics.value,
    testResults: testResults.value,
    browser: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '性能数据已导出',
    duration: 2000,
  })
}

function measureCustomOperation() {
  const operationName = `自定义操作 ${Date.now()}`

  engine.performance.mark(`${operationName}-start`)

  // 模拟一些操作
  setTimeout(() => {
    let result = 0
    for (let i = 0; i < 10000; i++) {
      result += Math.random() * Math.random()
    }
    // 使用 result 避免优化
    void result

    engine.performance.mark(`${operationName}-end`)
    engine.performance.measure(operationName, `${operationName}-start`, `${operationName}-end`)

    const measures = engine.performance.getEntriesByName(operationName)
    if (measures.length > 0) {
      const duration = measures[0].duration

      engine.logger.info(`自定义操作完成: ${duration.toFixed(2)}ms`)
      engine.notifications.show({
        type: 'info',
        title: '操作完成',
        message: `耗时: ${duration.toFixed(2)}ms`,
        duration: 2000,
      })
    }
  }, 100)
}

// 生命周期
onMounted(() => {
  updatePerformanceData()

  // 监听性能相关事件
  engine.events.on('perf:test', () => {
    // 性能测试事件处理
  })

  engine.logger.info('性能监控页面已加载')
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<template>
  <div class="performance-demo">
    <header class="demo-header">
      <h1>⚡ 性能管理器演示</h1>
      <p>实时监控应用性能，包括内存使用、执行时间、DOM操作等指标</p>
    </header>

    <div class="demo-content">
      <!-- 控制面板 -->
      <section class="control-panel">
        <h2>控制面板</h2>
        <div class="controls">
          <button
            v-if="!isMonitoring"
            class="btn btn-success"
            @click="startMonitoring"
          >
            🟢 开始监控
          </button>
          <button
            v-else
            class="btn btn-warning"
            @click="stopMonitoring"
          >
            🔴 停止监控
          </button>

          <button class="btn btn-primary" @click="runPerformanceTest">
            🧪 运行性能测试
          </button>

          <button class="btn btn-info" @click="measureCustomOperation">
            📏 测量自定义操作
          </button>

          <button class="btn btn-success" @click="exportPerformanceData">
            📤 导出数据
          </button>

          <button class="btn btn-secondary" @click="clearMetrics">
            🗑️ 清空数据
          </button>
        </div>
      </section>

      <!-- 实时性能数据 -->
      <section class="current-metrics">
        <h2>实时性能指标</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>内存使用</h3>
            <div class="metric-value">
              {{ currentMemoryUsage }}
            </div>
            <div class="metric-detail">
              限制: {{ memoryLimit }}
            </div>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: `${memoryUsagePercentage}%` }"
                :class="{
                  'progress-normal': memoryUsagePercentage < 70,
                  'progress-warning': memoryUsagePercentage >= 70 && memoryUsagePercentage < 90,
                  'progress-danger': memoryUsagePercentage >= 90,
                }"
              />
            </div>
            <div class="metric-percentage">
              {{ memoryUsagePercentage }}%
            </div>
          </div>

          <div v-if="performanceData.navigation" class="metric-card">
            <h3>页面加载性能</h3>
            <div class="metric-list">
              <div class="metric-item">
                <span>DOM内容加载:</span>
                <span>{{ performanceData.navigation.domContentLoaded.toFixed(2) }}ms</span>
              </div>
              <div class="metric-item">
                <span>页面完全加载:</span>
                <span>{{ performanceData.navigation.loadComplete.toFixed(2) }}ms</span>
              </div>
              <div class="metric-item">
                <span>DOM可交互:</span>
                <span>{{ performanceData.navigation.domInteractive.toFixed(2) }}ms</span>
              </div>
            </div>
          </div>

          <div class="metric-card">
            <h3>引擎统计</h3>
            <div class="metric-list">
              <div class="metric-item">
                <span>插件数量:</span>
                <span>{{ engine.plugins.getAll().length }}</span>
              </div>
              <div class="metric-item">
                <span>事件监听器:</span>
                <span>{{ engine.events.eventNames().length }}</span>
              </div>
              <div class="metric-item">
                <span>状态数量:</span>
                <span>{{ engine.state.keys().length }}</span>
              </div>
              <div class="metric-item">
                <span>日志条数:</span>
                <span>{{ engine.logger.getLogs().length }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 历史数据图表 -->
      <section v-if="hasMetrics" class="metrics-history">
        <h2>内存使用历史</h2>
        <div class="chart-container">
          <div class="chart">
            <div
              v-for="(metric, index) in metrics.slice(-20)"
              :key="index"
              class="chart-bar"
              :style="{ height: `${metric.memoryPercentage}%` }"
              :title="`${metric.timestamp}: ${metric.memory}MB (${metric.memoryPercentage}%)`"
            />
          </div>
          <div class="chart-labels">
            <span v-for="(metric, index) in metrics.slice(-20)" :key="index" class="chart-label">
              {{ metric.timestamp.split(':').slice(-1)[0] }}
            </span>
          </div>
        </div>
      </section>

      <!-- 性能测试结果 -->
      <section v-if="hasTestResults" class="test-results">
        <h2>性能测试结果</h2>
        <div class="results-table">
          <div class="table-header">
            <div>测试名称</div>
            <div>总耗时</div>
            <div>DOM操作</div>
            <div>事件操作</div>
            <div>状态操作</div>
            <div>内存变化</div>
            <div>时间</div>
          </div>
          <div
            v-for="(result, index) in testResults"
            :key="index"
            class="table-row"
          >
            <div>{{ result.name }}</div>
            <div class="metric-value">
              {{ result.totalTime }}ms
            </div>
            <div>{{ result.domOperations }}ms</div>
            <div>{{ result.eventOperations }}ms</div>
            <div>{{ result.stateOperations }}ms</div>
            <div>{{ result.memoryDelta }}KB</div>
            <div class="timestamp">
              {{ result.timestamp }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.performance-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.control-panel,
.current-metrics,
.metrics-history,
.test-results {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.control-panel h2,
.current-metrics h2,
.metrics-history h2,
.test-results h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #3498db;
}

.metric-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.metric-detail {
  font-size: 0.875rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-normal {
  background: #27ae60;
}

.progress-warning {
  background: #f39c12;
}

.progress-danger {
  background: #e74c3c;
}

.metric-percentage {
  text-align: right;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2c3e50;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
  font-size: 0.875rem;
}

.metric-item span:first-child {
  color: #7f8c8d;
}

.metric-item span:last-child {
  font-weight: 500;
  color: #2c3e50;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
}

.chart {
  display: flex;
  align-items: end;
  gap: 2px;
  height: 200px;
  margin-bottom: 1rem;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, #27ae60, #f39c12, #e74c3c);
  border-radius: 2px 2px 0 0;
  min-height: 4px;
  transition: height 0.3s ease;
  cursor: pointer;
}

.chart-labels {
  display: flex;
  gap: 2px;
}

.chart-label {
  flex: 1;
  text-align: center;
  font-size: 0.75rem;
  color: #7f8c8d;
}

.results-table {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem;
  align-items: center;
}

.table-header {
  background: #e9ecef;
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.875rem;
}

.table-row {
  border-bottom: 1px solid #dee2e6;
  font-size: 0.875rem;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: white;
}

.timestamp {
  font-size: 0.75rem;
  color: #7f8c8d;
}

@media (max-width: 768px) {
  .performance-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .controls {
    flex-direction: column;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header div,
  .table-row div {
    padding: 0.25rem 0;
  }
}
</style>
