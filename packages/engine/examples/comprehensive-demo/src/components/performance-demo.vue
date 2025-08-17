<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const memoryUsage = ref('0 MB')
const memoryPercentage = ref(0)
const cpuUsage = ref('0%')
const cpuPercentage = ref(0)
const fps = ref('60')
const fpsPercentage = ref(100)
const isMonitoring = ref(false)

const testType = ref('cpu')
const testIntensity = ref(5)
const isTestRunning = ref(false)
const testResult = ref<any>(null)

const optimizationSuggestions = reactive<any[]>([])
const performanceHistory = reactive<any[]>([])

const chartCanvas = ref<HTMLCanvasElement>()

let monitoringInterval: number | null = null
let testAbortController: AbortController | null = null

// 方法
function toggleMonitoring() {
  if (isMonitoring.value) {
    stopMonitoring()
  }
  else {
    startMonitoring()
  }
}

function startMonitoring() {
  isMonitoring.value = true

  monitoringInterval = window.setInterval(() => {
    updateMetrics()
  }, 1000)

  emit('log', 'info', '开始性能监控')
}

function stopMonitoring() {
  isMonitoring.value = false

  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }

  emit('log', 'info', '停止性能监控')
}

function updateMetrics() {
  // 内存使用情况
  if ('memory' in performance) {
    const memory = (performance as any).memory
    const usedMB = memory.usedJSHeapSize / 1024 / 1024
    const totalMB = memory.totalJSHeapSize / 1024 / 1024
    memoryUsage.value = `${usedMB.toFixed(2)} MB`
    memoryPercentage.value = Math.min((usedMB / totalMB) * 100, 100)
  }

  // CPU 使用情况 (模拟)
  const cpuValue = Math.floor(Math.random() * 30) + 10
  cpuUsage.value = `${cpuValue}%`
  cpuPercentage.value = cpuValue

  // FPS 计算
  let frameCount = 0
  const startTime = performance.now()

  const countFrames = () => {
    frameCount++
    if (performance.now() - startTime < 100) {
      requestAnimationFrame(countFrames)
    }
    else {
      const currentFps = Math.floor(frameCount * 10)
      fps.value = currentFps.toString()
      fpsPercentage.value = Math.min((currentFps / 60) * 100, 100)
    }
  }

  requestAnimationFrame(countFrames)

  // 记录历史
  const record = {
    timestamp: Date.now(),
    memory: memoryUsage.value,
    cpu: cpuUsage.value,
    fps: fps.value,
  }

  performanceHistory.push(record)

  // 限制历史记录数量
  if (performanceHistory.length > 50) {
    performanceHistory.shift()
  }

  // 更新图表
  updateChart()
}

function refreshMetrics() {
  updateMetrics()
  emit('log', 'info', '性能指标已刷新')
}

async function runPerformanceTest() {
  isTestRunning.value = true
  testAbortController = new AbortController()

  try {
    const startTime = performance.now()
    let operations = 0

    emit('log', 'info', `开始${testType.value}性能测试`)

    switch (testType.value) {
      case 'cpu':
        operations = await runCPUTest()
        break
      case 'memory':
        operations = await runMemoryTest()
        break
      case 'dom':
        operations = await runDOMTest()
        break
      case 'animation':
        operations = await runAnimationTest()
        break
      case 'network':
        operations = await runNetworkTest()
        break
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    testResult.value = {
      duration: Math.round(duration),
      operations,
      averageTime: (duration / operations).toFixed(2),
      score: calculateScore(duration, operations),
    }

    emit('log', 'success', '性能测试完成', testResult.value)
  }
  catch (error: any) {
    if (error.name !== 'AbortError') {
      emit('log', 'error', '性能测试失败', error)
    }
  }
  finally {
    isTestRunning.value = false
    testAbortController = null
  }
}

async function runCPUTest(): Promise<number> {
  const iterations = testIntensity.value * 100000
  let operations = 0

  for (let i = 0; i < iterations; i++) {
    if (testAbortController?.signal.aborted) {
      throw new Error('Test aborted')
    }

    Math.sqrt(Math.random() * 1000)
    operations++

    // 每1000次操作让出控制权
    if (i % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  return operations
}

async function runMemoryTest(): Promise<number> {
  const arrays: any[] = []
  const iterations = testIntensity.value * 1000
  let operations = 0

  for (let i = 0; i < iterations; i++) {
    if (testAbortController?.signal.aborted) {
      throw new Error('Test aborted')
    }

    arrays.push(Array.from({ length: 1000 }).fill(Math.random()))
    operations++

    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  // 清理内存
  arrays.length = 0

  return operations
}

async function runDOMTest(): Promise<number> {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const iterations = testIntensity.value * 100
  let operations = 0

  for (let i = 0; i < iterations; i++) {
    if (testAbortController?.signal.aborted) {
      throw new Error('Test aborted')
    }

    const element = document.createElement('div')
    element.textContent = `Element ${i}`
    element.style.background = `hsl(${i % 360}, 50%, 50%)`
    container.appendChild(element)
    operations++

    if (i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  // 清理DOM
  document.body.removeChild(container)

  return operations
}

async function runAnimationTest(): Promise<number> {
  const element = document.createElement('div')
  element.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    width: 50px;
    height: 50px;
    background: red;
    transform: translate(-50%, -50%);
  `
  document.body.appendChild(element)

  const iterations = testIntensity.value * 100
  let operations = 0

  for (let i = 0; i < iterations; i++) {
    if (testAbortController?.signal.aborted) {
      throw new Error('Test aborted')
    }

    element.style.transform = `translate(-50%, -50%) rotate(${i}deg) scale(${1 + Math.sin(i / 10) * 0.5})`
    operations++

    await new Promise(resolve => requestAnimationFrame(resolve))
  }

  // 清理元素
  document.body.removeChild(element)

  return operations
}

async function runNetworkTest(): Promise<number> {
  const iterations = testIntensity.value * 5
  let operations = 0

  const promises = []

  for (let i = 0; i < iterations; i++) {
    if (testAbortController?.signal.aborted) {
      throw new Error('Test aborted')
    }

    // 模拟网络请求
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(`Response ${i}`)
        operations++
      }, Math.random() * 100)
    })

    promises.push(promise)
  }

  await Promise.all(promises)

  return operations
}

function stopTest() {
  if (testAbortController) {
    testAbortController.abort()
    emit('log', 'warning', '性能测试已停止')
  }
}

function calculateScore(duration: number, operations: number): number {
  const opsPerMs = operations / duration
  const baseScore = Math.min(opsPerMs * 1000, 100)
  return Math.round(baseScore)
}

function getScoreClass(score: number): string {
  if (score >= 80)
    return 'excellent'
  if (score >= 60)
    return 'good'
  if (score >= 40)
    return 'fair'
  return 'poor'
}

function generateOptimizationSuggestions() {
  optimizationSuggestions.splice(0, optimizationSuggestions.length)

  const suggestions = [
    {
      title: '启用图片懒加载',
      description: '对于大量图片的页面，启用懒加载可以显著提升初始加载性能',
      priority: 'high',
      actions: [
        { name: '启用懒加载', action: () => emit('log', 'info', '已启用图片懒加载') },
      ],
    },
    {
      title: '优化DOM操作',
      description: '减少频繁的DOM查询和修改，使用文档片段批量操作',
      priority: 'medium',
      actions: [
        { name: '应用优化', action: () => emit('log', 'info', '已应用DOM优化') },
      ],
    },
    {
      title: '启用缓存策略',
      description: '对静态资源和API响应启用适当的缓存策略',
      priority: 'high',
      actions: [
        { name: '配置缓存', action: () => emit('log', 'info', '已配置缓存策略') },
      ],
    },
    {
      title: '减少内存泄漏',
      description: '及时清理事件监听器和定时器，避免内存泄漏',
      priority: 'medium',
      actions: [
        { name: '检查泄漏', action: () => emit('log', 'info', '已检查内存泄漏') },
      ],
    },
  ]

  // 根据当前性能状况筛选建议
  if (memoryPercentage.value > 70) {
    optimizationSuggestions.push(suggestions[3])
  }

  if (cpuPercentage.value > 50) {
    optimizationSuggestions.push(suggestions[1])
  }

  if (Number.parseInt(fps.value) < 30) {
    optimizationSuggestions.push(suggestions[0])
  }

  optimizationSuggestions.push(suggestions[2])

  emit('log', 'info', '已生成优化建议', optimizationSuggestions)
}

function applySuggestion(action: any) {
  action.action()
}

function clearHistory() {
  performanceHistory.splice(0, performanceHistory.length)
  updateChart()
  emit('log', 'info', '已清空性能历史')
}

function updateChart() {
  if (!chartCanvas.value)
    return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx)
    return

  const width = chartCanvas.value.width
  const height = chartCanvas.value.height

  // 清空画布
  ctx.clearRect(0, 0, width, height)

  if (performanceHistory.length === 0)
    return

  // 绘制网格
  ctx.strokeStyle = '#e0e0e0'
  ctx.lineWidth = 1

  for (let i = 0; i <= 10; i++) {
    const y = (height / 10) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // 绘制FPS曲线
  ctx.strokeStyle = '#007bff'
  ctx.lineWidth = 2
  ctx.beginPath()

  performanceHistory.forEach((record, index) => {
    const x = (width / (performanceHistory.length - 1)) * index
    const fpsValue = Number.parseInt(record.fps)
    const y = height - (fpsValue / 60) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    }
    else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  updateMetrics()
  nextTick(() => {
    updateChart()
  })
  emit('log', 'info', '性能管理器演示已加载')
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
  if (testAbortController) {
    testAbortController.abort()
  }
})
</script>

<template>
  <div class="performance-demo">
    <div class="demo-header">
      <h2>⚡ 性能管理器演示</h2>
      <p>PerformanceManager 提供了全面的性能监控和优化功能，包括内存监控、性能分析、优化建议等。</p>
    </div>

    <div class="demo-grid">
      <!-- 性能监控 -->
      <div class="card">
        <div class="card-header">
          <h3>性能监控</h3>
        </div>
        <div class="card-body">
          <div class="performance-metrics">
            <div class="metric-card">
              <h4>内存使用</h4>
              <div class="metric-value">
                {{ memoryUsage }}
              </div>
              <div class="metric-progress">
                <div class="progress-bar" :style="{ width: `${memoryPercentage}%` }" />
              </div>
            </div>

            <div class="metric-card">
              <h4>CPU 使用</h4>
              <div class="metric-value">
                {{ cpuUsage }}
              </div>
              <div class="metric-progress">
                <div class="progress-bar" :style="{ width: `${cpuPercentage}%` }" />
              </div>
            </div>

            <div class="metric-card">
              <h4>帧率 (FPS)</h4>
              <div class="metric-value">
                {{ fps }}
              </div>
              <div class="metric-progress">
                <div class="progress-bar" :style="{ width: `${fpsPercentage}%` }" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-primary"
                @click="toggleMonitoring"
              >
                {{ isMonitoring ? '停止监控' : '开始监控' }}
              </button>
              <button class="btn btn-secondary" @click="refreshMetrics">
                刷新指标
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能测试 -->
      <div class="card">
        <div class="card-header">
          <h3>性能测试</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>测试类型</label>
            <select v-model="testType">
              <option value="cpu">
                CPU 密集型测试
              </option>
              <option value="memory">
                内存分配测试
              </option>
              <option value="dom">
                DOM 操作测试
              </option>
              <option value="animation">
                动画性能测试
              </option>
              <option value="network">
                网络请求测试
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>测试强度</label>
            <input
              v-model.number="testIntensity"
              type="range"
              min="1"
              max="10"
              step="1"
            >
            <span>{{ testIntensity }}/10</span>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-primary"
                :disabled="isTestRunning"
                @click="runPerformanceTest"
              >
                {{ isTestRunning ? '测试中...' : '运行测试' }}
              </button>
              <button
                class="btn btn-warning"
                :disabled="!isTestRunning"
                @click="stopTest"
              >
                停止测试
              </button>
            </div>
          </div>

          <div v-if="testResult" class="test-result">
            <h4>测试结果</h4>
            <div class="result-item">
              <label>执行时间:</label>
              <span>{{ testResult.duration }}ms</span>
            </div>
            <div class="result-item">
              <label>操作数量:</label>
              <span>{{ testResult.operations }}</span>
            </div>
            <div class="result-item">
              <label>平均耗时:</label>
              <span>{{ testResult.averageTime }}ms</span>
            </div>
            <div class="result-item">
              <label>性能评分:</label>
              <span class="score" :class="getScoreClass(testResult.score)">
                {{ testResult.score }}/100
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 优化建议 -->
      <div class="card">
        <div class="card-header">
          <h3>优化建议</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <button class="btn btn-secondary" @click="generateOptimizationSuggestions">
              生成优化建议
            </button>
          </div>

          <div v-if="optimizationSuggestions.length" class="suggestions-list">
            <div
              v-for="(suggestion, index) in optimizationSuggestions"
              :key="index"
              class="suggestion-item"
              :class="suggestion.priority"
            >
              <div class="suggestion-header">
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <span class="suggestion-priority">{{ suggestion.priority }}</span>
              </div>
              <p class="suggestion-description">
                {{ suggestion.description }}
              </p>
              <div v-if="suggestion.actions" class="suggestion-actions">
                <button
                  v-for="action in suggestion.actions"
                  :key="action.name"
                  class="btn btn-sm btn-secondary"
                  @click="applySuggestion(action)"
                >
                  {{ action.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能历史 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>性能历史</h3>
          <button class="btn btn-secondary btn-sm" @click="clearHistory">
            清空历史
          </button>
        </div>
        <div class="card-body">
          <div class="performance-chart">
            <div class="chart-container">
              <canvas ref="chartCanvas" width="800" height="200" />
            </div>
          </div>

          <div class="performance-history">
            <div
              v-for="(record, index) in performanceHistory"
              :key="index"
              class="history-item"
            >
              <span class="history-time">{{ formatTime(record.timestamp) }}</span>
              <span class="history-memory">内存: {{ record.memory }}</span>
              <span class="history-cpu">CPU: {{ record.cpu }}</span>
              <span class="history-fps">FPS: {{ record.fps }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.performance-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .performance-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);

    .metric-card {
      text-align: center;

      h4 {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 14px;
        color: var(--text-secondary);
      }

      .metric-value {
        font-size: 24px;
        font-weight: bold;
        color: var(--primary-color);
        margin-bottom: var(--spacing-sm);
      }

      .metric-progress {
        height: 4px;
        background: var(--bg-secondary);
        border-radius: 2px;
        overflow: hidden;

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--success-color), var(--warning-color), var(--error-color));
          transition: width 0.3s ease;
        }
      }
    }
  }

  .test-result {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);

      label {
        font-weight: 500;
      }

      .score {
        font-weight: bold;

        &.excellent {
          color: var(--success-color);
        }

        &.good {
          color: var(--info-color);
        }

        &.fair {
          color: var(--warning-color);
        }

        &.poor {
          color: var(--error-color);
        }
      }
    }
  }

  .suggestions-list {
    .suggestion-item {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      border-radius: var(--border-radius);
      border-left: 4px solid;

      &.high {
        background: rgba(220, 53, 69, 0.1);
        border-left-color: var(--error-color);
      }

      &.medium {
        background: rgba(255, 193, 7, 0.1);
        border-left-color: var(--warning-color);
      }

      &.low {
        background: rgba(23, 162, 184, 0.1);
        border-left-color: var(--info-color);
      }

      .suggestion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: var(--spacing-sm);

        .suggestion-title {
          font-weight: 500;
          color: var(--text-primary);
        }

        .suggestion-priority {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--bg-primary);
          color: var(--text-secondary);
        }
      }

      .suggestion-description {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 14px;
        color: var(--text-secondary);
        line-height: 1.5;
      }

      .suggestion-actions {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }

  .performance-chart {
    margin-bottom: var(--spacing-md);

    .chart-container {
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      padding: var(--spacing-md);

      canvas {
        width: 100%;
        height: 200px;
      }
    }
  }

  .performance-history {
    max-height: 200px;
    overflow-y: auto;

    .history-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      .history-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .history-memory {
        color: var(--primary-color);
        min-width: 100px;
      }

      .history-cpu {
        color: var(--warning-color);
        min-width: 80px;
      }

      .history-fps {
        color: var(--success-color);
        min-width: 80px;
      }
    }
  }
}

@media (max-width: 768px) {
  .performance-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .performance-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
