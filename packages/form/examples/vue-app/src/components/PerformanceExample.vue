<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'

// 性能指标
const metrics = reactive({
  renderCount: 0,
  avgRenderTime: 0,
  formCount: 0,
  memoryUsage: 0,
  eventCount: 0,
  validationCount: 0,
})

// 测试配置
const renderTestConfig = reactive({
  itemCount: 50,
  iterations: 5,
})

const memoryTestConfig = reactive({
  instanceCount: 20,
})

const eventTestConfig = reactive({
  eventCount: 500,
})

const stressTestConfig = reactive({
  intensity: 'medium',
})

// 测试状态
const testRunning = ref(false)
const currentTest = ref('')
const testProgress = ref(0)
const progressDetails = ref('')

// 测试结果
const renderTestResult = ref(null)
const memoryTestResult = ref(null)
const eventTestResult = ref(null)
const stressTestResult = ref(null)

// 测试历史
const testHistory = ref([])

// 模拟表单管理器
class MockFormManager {
  constructor(itemCount) {
    this.itemCount = itemCount
    this.values = {}
    this.eventListeners = new Map()
    this.renderTime = 0
  }

  render() {
    const startTime = performance.now()

    // 模拟渲染过程
    for (let i = 0; i < this.itemCount; i++) {
      // 模拟DOM操作
      const element = document.createElement('div')
      element.innerHTML = `<input type="text" name="field${i}" />`
    }

    const endTime = performance.now()
    this.renderTime = endTime - startTime

    metrics.renderCount++
    return this.renderTime
  }

  setValue(key, value) {
    this.values[key] = value
    this.emit('change', { key, value })
    metrics.eventCount++
  }

  validate() {
    const startTime = performance.now()

    // 模拟验证过程
    const errors = []
    Object.keys(this.values).forEach((key) => {
      if (!this.values[key]) {
        errors.push(`${key} is required`)
      }
    })

    const endTime = performance.now()
    metrics.validationCount++

    return {
      valid: errors.length === 0,
      errors,
      time: endTime - startTime,
    }
  }

  on(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event).add(handler)
  }

  emit(event, data) {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => handler(data))
    }
  }

  destroy() {
    this.eventListeners.clear()
    this.values = {}
  }
}

// 性能测试方法
async function runRenderTest() {
  testRunning.value = true
  currentTest.value = '渲染性能测试'
  testProgress.value = 0

  const times = []
  const { itemCount, iterations } = renderTestConfig

  try {
    for (let i = 0; i < iterations; i++) {
      progressDetails.value = `正在进行第 ${i + 1}/${iterations} 次测试...`
      testProgress.value = Math.round((i / iterations) * 100)

      const form = new MockFormManager(itemCount)
      const renderTime = form.render()
      times.push(renderTime)
      form.destroy()

      // 短暂延迟以显示进度
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length * 100) / 100
    const minTime = Math.round(Math.min(...times) * 100) / 100
    const maxTime = Math.round(Math.max(...times) * 100) / 100
    const totalTime = Math.round(times.reduce((a, b) => a + b, 0) * 100) / 100

    renderTestResult.value = {
      avgTime,
      minTime,
      maxTime,
      totalTime,
    }

    // 更新全局指标
    metrics.avgRenderTime = avgTime

    // 添加到历史记录
    addToHistory('渲染性能测试', renderTestResult.value)
  }
  finally {
    testRunning.value = false
    testProgress.value = 100
  }
}

async function runMemoryTest() {
  testRunning.value = true
  currentTest.value = '内存性能测试'
  testProgress.value = 0

  const { instanceCount } = memoryTestConfig
  const forms = []

  try {
    // 记录初始内存
    const initialMemory = getMemoryUsage()
    let peakMemory = initialMemory

    // 创建表单实例
    for (let i = 0; i < instanceCount; i++) {
      progressDetails.value = `正在创建第 ${i + 1}/${instanceCount} 个表单实例...`
      testProgress.value = Math.round((i / instanceCount) * 50)

      const form = new MockFormManager(20)
      form.render()
      forms.push(form)

      const currentMemory = getMemoryUsage()
      if (currentMemory > peakMemory) {
        peakMemory = currentMemory
      }

      await new Promise(resolve => setTimeout(resolve, 50))
    }

    // 销毁表单实例
    for (let i = 0; i < forms.length; i++) {
      progressDetails.value = `正在销毁第 ${i + 1}/${forms.length} 个表单实例...`
      testProgress.value = Math.round(50 + (i / forms.length) * 50)

      forms[i].destroy()
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    // 强制垃圾回收（如果支持）
    if (window.gc) {
      window.gc()
    }

    const finalMemory = getMemoryUsage()
    const memoryGrowth = Math.round((finalMemory - initialMemory) * 100) / 100

    memoryTestResult.value = {
      initialMemory: Math.round(initialMemory * 100) / 100,
      peakMemory: Math.round(peakMemory * 100) / 100,
      finalMemory: Math.round(finalMemory * 100) / 100,
      memoryGrowth,
    }

    // 更新全局指标
    metrics.formCount = 0
    metrics.memoryUsage = finalMemory

    // 添加到历史记录
    addToHistory('内存性能测试', memoryTestResult.value)
  }
  finally {
    testRunning.value = false
    testProgress.value = 100
  }
}

async function runEventTest() {
  testRunning.value = true
  currentTest.value = '事件性能测试'
  testProgress.value = 0

  const { eventCount } = eventTestConfig
  const form = new MockFormManager(10)

  try {
    const startTime = performance.now()

    // 设置事件监听器
    let eventProcessed = 0
    form.on('change', () => {
      eventProcessed++
    })

    // 触发大量事件
    for (let i = 0; i < eventCount; i++) {
      progressDetails.value = `正在触发第 ${i + 1}/${eventCount} 个事件...`
      testProgress.value = Math.round((i / eventCount) * 100)

      form.setValue(`field${i % 10}`, `value${i}`)

      // 每100个事件暂停一下
      if (i % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }

    const endTime = performance.now()
    const totalTime = Math.round((endTime - startTime) * 100) / 100
    const avgTime = Math.round((totalTime / eventCount) * 10000) / 10000
    const eventsPerSecond = Math.round((eventCount / totalTime) * 1000)

    eventTestResult.value = {
      totalTime,
      avgTime,
      eventsPerSecond,
    }

    // 添加到历史记录
    addToHistory('事件性能测试', eventTestResult.value)

    form.destroy()
  }
  finally {
    testRunning.value = false
    testProgress.value = 100
  }
}

async function runStressTest() {
  testRunning.value = true
  currentTest.value = '综合压力测试'
  testProgress.value = 0

  const { intensity } = stressTestConfig
  const intensityConfig = {
    light: { forms: 5, operations: 50, duration: 2000 },
    medium: { forms: 10, operations: 100, duration: 5000 },
    heavy: { forms: 20, operations: 200, duration: 10000 },
    extreme: { forms: 50, operations: 500, duration: 20000 },
  }

  const config = intensityConfig[intensity]
  const forms = []
  const operations = []

  try {
    const startTime = performance.now()

    // 创建表单实例
    for (let i = 0; i < config.forms; i++) {
      const form = new MockFormManager(Math.floor(Math.random() * 20) + 10)
      form.render()
      forms.push(form)
    }

    // 执行随机操作
    let successCount = 0
    const responseTimes = []

    for (let i = 0; i < config.operations; i++) {
      progressDetails.value = `正在执行第 ${i + 1}/${config.operations} 个操作...`
      testProgress.value = Math.round((i / config.operations) * 100)

      const operationStart = performance.now()

      try {
        const form = forms[Math.floor(Math.random() * forms.length)]
        const operation = Math.floor(Math.random() * 4)

        switch (operation) {
          case 0: // 设置值
            form.setValue(`field${Math.floor(Math.random() * 10)}`, `value${i}`)
            break
          case 1: // 验证
            form.validate()
            break
          case 2: // 重新渲染
            form.render()
            break
          case 3: // 批量设置值
            for (let j = 0; j < 5; j++) {
              form.setValue(`field${j}`, `batch${i}_${j}`)
            }
            break
        }

        successCount++
      }
      catch (error) {
        console.error('操作失败:', error)
      }

      const operationEnd = performance.now()
      responseTimes.push(operationEnd - operationStart)

      // 控制测试节奏
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }

    const endTime = performance.now()
    const duration = Math.round(endTime - startTime)
    const successRate = Math.round((successCount / config.operations) * 100)
    const avgResponseTime = Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 100) / 100

    stressTestResult.value = {
      duration,
      totalOperations: config.operations,
      successRate,
      avgResponseTime,
    }

    // 清理
    forms.forEach(form => form.destroy())

    // 添加到历史记录
    addToHistory('综合压力测试', stressTestResult.value)
  }
  finally {
    testRunning.value = false
    testProgress.value = 100
  }
}

// 工具函数
function getMemoryUsage() {
  if (performance.memory) {
    return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100
  }
  return Math.random() * 50 + 10 // 模拟值
}

function updateMetrics() {
  metrics.memoryUsage = getMemoryUsage()

  // 模拟其他指标更新
  if (metrics.renderCount > 0) {
    metrics.avgRenderTime = Math.round(Math.random() * 50 + 10)
  }
}

function clearMetrics() {
  Object.keys(metrics).forEach((key) => {
    metrics[key] = 0
  })
}

function exportMetrics() {
  const data = {
    timestamp: new Date().toISOString(),
    metrics: { ...metrics },
    testResults: {
      render: renderTestResult.value,
      memory: memoryTestResult.value,
      event: eventTestResult.value,
      stress: stressTestResult.value,
    },
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-metrics-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function addToHistory(type, result) {
  testHistory.value.unshift({
    id: Date.now(),
    type,
    result,
    timestamp: Date.now(),
  })

  // 限制历史记录数量
  if (testHistory.value.length > 20) {
    testHistory.value = testHistory.value.slice(0, 20)
  }
}

function clearHistory() {
  testHistory.value = []
}

function exportHistory() {
  const data = {
    exportTime: new Date().toISOString(),
    history: testHistory.value,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `test-history-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}

// 定期更新指标
let metricsInterval
onMounted(() => {
  updateMetrics()
  metricsInterval = setInterval(updateMetrics, 3000)
})

onUnmounted(() => {
  if (metricsInterval) {
    clearInterval(metricsInterval)
  }
})
</script>

<template>
  <div class="example">
    <div class="example-header">
      <h2>⚡ 性能测试示例</h2>
      <p>测试表单系统在各种场景下的性能表现</p>
    </div>

    <div class="example-content">
      <!-- 性能指标面板 -->
      <div class="metrics-panel">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">
              🎯
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.renderCount }}
              </div>
              <div class="metric-label">
                渲染次数
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              ⏱️
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.avgRenderTime }}ms
              </div>
              <div class="metric-label">
                平均渲染时间
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              📊
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.formCount }}
              </div>
              <div class="metric-label">
                表单实例数
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              💾
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.memoryUsage }}MB
              </div>
              <div class="metric-label">
                内存使用
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              🔄
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.eventCount }}
              </div>
              <div class="metric-label">
                事件触发数
              </div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-icon">
              ✅
            </div>
            <div class="metric-content">
              <div class="metric-value">
                {{ metrics.validationCount }}
              </div>
              <div class="metric-label">
                验证次数
              </div>
            </div>
          </div>
        </div>

        <div class="metrics-controls">
          <button class="btn btn-secondary" @click="updateMetrics">
            🔄 更新指标
          </button>
          <button class="btn btn-secondary" @click="clearMetrics">
            🗑️ 清空指标
          </button>
          <button class="btn btn-info" @click="exportMetrics">
            📤 导出数据
          </button>
        </div>
      </div>

      <!-- 性能测试区域 -->
      <div class="test-section">
        <h3>性能测试</h3>
        <div class="test-grid">
          <!-- 渲染性能测试 -->
          <div class="test-card">
            <div class="test-header">
              <h4>🎨 渲染性能测试</h4>
              <p>测试大量表单项的渲染性能</p>
            </div>
            <div class="test-content">
              <div class="test-controls">
                <label>
                  表单项数量: {{ renderTestConfig.itemCount }}
                  <input
                    v-model.number="renderTestConfig.itemCount"
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                  >
                </label>
                <label>
                  测试次数: {{ renderTestConfig.iterations }}
                  <input
                    v-model.number="renderTestConfig.iterations"
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                  >
                </label>
              </div>

              <button
                :disabled="testRunning"
                class="btn btn-primary test-btn"
                @click="runRenderTest"
              >
                {{ testRunning ? '测试中...' : '🚀 开始渲染测试' }}
              </button>

              <div v-if="renderTestResult" class="test-result">
                <div class="result-item">
                  <span>平均渲染时间:</span>
                  <span class="result-value">{{ renderTestResult.avgTime }}ms</span>
                </div>
                <div class="result-item">
                  <span>最快渲染:</span>
                  <span class="result-value">{{ renderTestResult.minTime }}ms</span>
                </div>
                <div class="result-item">
                  <span>最慢渲染:</span>
                  <span class="result-value">{{ renderTestResult.maxTime }}ms</span>
                </div>
                <div class="result-item">
                  <span>总耗时:</span>
                  <span class="result-value">{{ renderTestResult.totalTime }}ms</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 内存性能测试 -->
          <div class="test-card">
            <div class="test-header">
              <h4>💾 内存性能测试</h4>
              <p>测试表单创建和销毁的内存使用</p>
            </div>
            <div class="test-content">
              <div class="test-controls">
                <label>
                  实例数量: {{ memoryTestConfig.instanceCount }}
                  <input
                    v-model.number="memoryTestConfig.instanceCount"
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                  >
                </label>
              </div>

              <button
                :disabled="testRunning"
                class="btn btn-success test-btn"
                @click="runMemoryTest"
              >
                {{ testRunning ? '测试中...' : '🧠 开始内存测试' }}
              </button>

              <div v-if="memoryTestResult" class="test-result">
                <div class="result-item">
                  <span>初始内存:</span>
                  <span class="result-value">{{ memoryTestResult.initialMemory }}MB</span>
                </div>
                <div class="result-item">
                  <span>峰值内存:</span>
                  <span class="result-value">{{ memoryTestResult.peakMemory }}MB</span>
                </div>
                <div class="result-item">
                  <span>最终内存:</span>
                  <span class="result-value">{{ memoryTestResult.finalMemory }}MB</span>
                </div>
                <div class="result-item">
                  <span>内存增长:</span>
                  <span class="result-value">{{ memoryTestResult.memoryGrowth }}MB</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 事件性能测试 -->
          <div class="test-card">
            <div class="test-header">
              <h4>⚡ 事件性能测试</h4>
              <p>测试大量事件触发的处理性能</p>
            </div>
            <div class="test-content">
              <div class="test-controls">
                <label>
                  事件数量: {{ eventTestConfig.eventCount }}
                  <input
                    v-model.number="eventTestConfig.eventCount"
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                  >
                </label>
              </div>

              <button
                :disabled="testRunning"
                class="btn btn-warning test-btn"
                @click="runEventTest"
              >
                {{ testRunning ? '测试中...' : '⚡ 开始事件测试' }}
              </button>

              <div v-if="eventTestResult" class="test-result">
                <div class="result-item">
                  <span>总处理时间:</span>
                  <span class="result-value">{{ eventTestResult.totalTime }}ms</span>
                </div>
                <div class="result-item">
                  <span>平均处理时间:</span>
                  <span class="result-value">{{ eventTestResult.avgTime }}ms</span>
                </div>
                <div class="result-item">
                  <span>事件处理率:</span>
                  <span class="result-value">{{ eventTestResult.eventsPerSecond }}/s</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 综合压力测试 -->
          <div class="test-card">
            <div class="test-header">
              <h4>🔥 综合压力测试</h4>
              <p>模拟真实使用场景的综合测试</p>
            </div>
            <div class="test-content">
              <div class="test-controls">
                <label>
                  测试强度: {{ stressTestConfig.intensity }}
                  <select v-model="stressTestConfig.intensity">
                    <option value="light">轻度</option>
                    <option value="medium">中度</option>
                    <option value="heavy">重度</option>
                    <option value="extreme">极限</option>
                  </select>
                </label>
              </div>

              <button
                :disabled="testRunning"
                class="btn btn-danger test-btn"
                @click="runStressTest"
              >
                {{ testRunning ? '测试中...' : '🔥 开始压力测试' }}
              </button>

              <div v-if="stressTestResult" class="test-result">
                <div class="result-item">
                  <span>测试时长:</span>
                  <span class="result-value">{{ stressTestResult.duration }}ms</span>
                </div>
                <div class="result-item">
                  <span>操作总数:</span>
                  <span class="result-value">{{ stressTestResult.totalOperations }}</span>
                </div>
                <div class="result-item">
                  <span>成功率:</span>
                  <span class="result-value">{{ stressTestResult.successRate }}%</span>
                </div>
                <div class="result-item">
                  <span>平均响应时间:</span>
                  <span class="result-value">{{ stressTestResult.avgResponseTime }}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 测试进度 -->
      <div v-if="testRunning" class="progress-section">
        <div class="progress-header">
          <h4>{{ currentTest }} 进行中...</h4>
          <span>{{ testProgress }}%</span>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${testProgress}%` }"
          />
        </div>
        <div class="progress-details">
          {{ progressDetails }}
        </div>
      </div>

      <!-- 历史记录 -->
      <div class="history-section">
        <h3>测试历史</h3>
        <div class="history-controls">
          <button class="btn btn-secondary" @click="clearHistory">
            🗑️ 清空历史
          </button>
          <button class="btn btn-info" @click="exportHistory">
            📤 导出历史
          </button>
        </div>

        <div class="history-list">
          <div
            v-for="record in testHistory"
            :key="record.id"
            class="history-item"
          >
            <div class="history-header">
              <span class="history-type">{{ record.type }}</span>
              <span class="history-time">{{ formatTime(record.timestamp) }}</span>
            </div>
            <div class="history-details">
              <span v-for="(value, key) in record.result" :key="key">
                {{ key }}: {{ value }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example {
  padding: 2rem;
}

.example-header {
  text-align: center;
  margin-bottom: 2rem;
}

.example-header h2 {
  color: #333;
  margin-bottom: 0.5rem;
}

.example-header p {
  color: #666;
}

.metrics-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2rem;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.metric-label {
  font-size: 0.875rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metrics-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.test-section h3 {
  color: #333;
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.test-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.test-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
}

.test-header h4 {
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.test-header p {
  opacity: 0.9;
  font-size: 0.9rem;
}

.test-content {
  padding: 1.5rem;
}

.test-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.test-controls label {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-weight: 500;
  color: #333;
}

.test-controls input,
.test-controls select {
  padding: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 0.875rem;
}

.test-btn {
  width: 100%;
  padding: 0.75rem;
  font-weight: 600;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover:not(:disabled) {
  background: #e9ecef;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
}

.test-result {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.875rem;
}

.result-item:last-child {
  border-bottom: none;
}

.result-value {
  font-weight: 600;
  color: #667eea;
}

.progress-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.progress-header h4 {
  color: #333;
  margin: 0;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.progress-details {
  color: #6c757d;
  font-size: 0.875rem;
}

.history-section h3 {
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #667eea;
}

.history-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 1rem;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-type {
  font-weight: 600;
  color: #333;
}

.history-time {
  font-size: 0.875rem;
  color: #6c757d;
}

.history-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #495057;
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }

  .test-grid {
    grid-template-columns: 1fr;
  }

  .history-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
