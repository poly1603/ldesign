<template>
  <div class="performance-test-page">
    <div class="demo-section">
      <h2>📊 性能测试</h2>
      <p>测试编辑器的性能表现，包括渲染速度、内存使用、响应时间等。</p>
    </div>

    <div class="demo-grid">
      <div class="demo-card">
        <h3>实时性能监控</h3>
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-label">FPS</div>
            <div class="metric-value" :class="getFpsClass()">{{ currentFps }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">内存使用</div>
            <div class="metric-value">{{ memoryUsage }} MB</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">响应时间</div>
            <div class="metric-value">{{ responseTime }} ms</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">DOM 节点</div>
            <div class="metric-value">{{ domNodes }}</div>
          </div>
        </div>
        
        <div class="btn-group">
          <button 
            class="btn primary" 
            @click="toggleMonitoring"
          >
            {{ isMonitoring ? '⏸️ 停止监控' : '▶️ 开始监控' }}
          </button>
          <button class="btn" @click="clearMetrics">🗑️ 清空数据</button>
        </div>
      </div>

      <div class="demo-card">
        <h3>性能测试套件</h3>
        <div class="test-suite">
          <div 
            v-for="test in performanceTests" 
            :key="test.name"
            class="test-item"
            :class="{ running: test.running, completed: test.completed }"
          >
            <div class="test-info">
              <div class="test-name">{{ test.displayName }}</div>
              <div class="test-description">{{ test.description }}</div>
              <div v-if="test.result" class="test-result">
                结果: {{ test.result }}
              </div>
            </div>
            <button 
              class="test-btn"
              @click="runTest(test.name)"
              :disabled="test.running"
            >
              {{ test.running ? '运行中...' : '运行测试' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>📈 性能图表</h2>
      <div class="demo-card">
        <h3>FPS 历史记录</h3>
        <div class="chart-container">
          <canvas ref="fpsChartRef" width="800" height="200"></canvas>
        </div>
        
        <div class="chart-controls">
          <button class="btn" @click="exportChart">📤 导出图表</button>
          <button class="btn" @click="clearChart">🗑️ 清空图表</button>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>🧪 压力测试</h2>
      <div class="demo-card">
        <h3>大文档编辑测试</h3>
        <div class="stress-test-controls">
          <div class="form-group">
            <label>文档大小:</label>
            <select v-model="stressTestSize">
              <option value="small">小型 (1KB)</option>
              <option value="medium">中型 (10KB)</option>
              <option value="large">大型 (100KB)</option>
              <option value="huge">超大 (1MB)</option>
            </select>
          </div>
          
          <div class="btn-group">
            <button class="btn primary" @click="runStressTest">🚀 开始压力测试</button>
            <button class="btn danger" @click="stopStressTest">⏹️ 停止测试</button>
          </div>
        </div>
        
        <div v-if="stressTestRunning" class="stress-test-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: stressTestProgress + '%' }"
            ></div>
          </div>
          <div class="progress-text">{{ stressTestProgress }}% 完成</div>
        </div>
        
        <div 
          ref="stressEditorRef" 
          class="stress-editor"
          contenteditable="true"
          @input="handleStressInput"
        >
          <p>压力测试编辑器 - 点击上方按钮开始测试</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'

const fpsChartRef = ref<HTMLCanvasElement>()
const stressEditorRef = ref<HTMLElement>()

// 性能监控状态
const isMonitoring = ref(false)
const currentFps = ref(0)
const memoryUsage = ref(0)
const responseTime = ref(0)
const domNodes = ref(0)

// FPS 历史数据
const fpsHistory = ref<number[]>([])
const maxHistoryLength = 100

// 性能测试套件
const performanceTests = reactive([
  {
    name: 'typing',
    displayName: '打字性能测试',
    description: '测试连续输入文字时的性能表现',
    running: false,
    completed: false,
    result: ''
  },
  {
    name: 'formatting',
    displayName: '格式化性能测试',
    description: '测试文本格式化操作的性能',
    running: false,
    completed: false,
    result: ''
  },
  {
    name: 'large-content',
    displayName: '大内容渲染测试',
    description: '测试大量内容的渲染性能',
    running: false,
    completed: false,
    result: ''
  },
  {
    name: 'memory-leak',
    displayName: '内存泄漏测试',
    description: '检测是否存在内存泄漏问题',
    running: false,
    completed: false,
    result: ''
  }
])

// 压力测试
const stressTestSize = ref('medium')
const stressTestRunning = ref(false)
const stressTestProgress = ref(0)

// 监控定时器
let monitoringTimer: number | null = null
let fpsTimer: number | null = null
let frameCount = 0
let lastTime = performance.now()

// 获取FPS等级样式
const getFpsClass = () => {
  if (currentFps.value >= 50) return 'excellent'
  if (currentFps.value >= 30) return 'good'
  if (currentFps.value >= 20) return 'fair'
  return 'poor'
}

// 开始/停止性能监控
const toggleMonitoring = () => {
  if (isMonitoring.value) {
    stopMonitoring()
  } else {
    startMonitoring()
  }
}

const startMonitoring = () => {
  isMonitoring.value = true
  
  // FPS 监控
  const measureFps = () => {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      currentFps.value = Math.round((frameCount * 1000) / (currentTime - lastTime))
      fpsHistory.value.push(currentFps.value)
      
      if (fpsHistory.value.length > maxHistoryLength) {
        fpsHistory.value.shift()
      }
      
      frameCount = 0
      lastTime = currentTime
      
      updateChart()
    }
    
    if (isMonitoring.value) {
      requestAnimationFrame(measureFps)
    }
  }
  
  requestAnimationFrame(measureFps)
  
  // 其他性能指标监控
  monitoringTimer = window.setInterval(() => {
    updatePerformanceMetrics()
  }, 1000)
}

const stopMonitoring = () => {
  isMonitoring.value = false
  
  if (monitoringTimer) {
    clearInterval(monitoringTimer)
    monitoringTimer = null
  }
}

const updatePerformanceMetrics = () => {
  // 内存使用 (如果支持)
  if ('memory' in performance) {
    const memory = (performance as any).memory
    memoryUsage.value = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }
  
  // 响应时间测试
  const start = performance.now()
  setTimeout(() => {
    responseTime.value = Math.round(performance.now() - start)
  }, 0)
  
  // DOM 节点数量
  domNodes.value = document.querySelectorAll('*').length
}

// 运行性能测试
const runTest = async (testName: string) => {
  const test = performanceTests.find(t => t.name === testName)
  if (!test || test.running) return
  
  test.running = true
  test.completed = false
  test.result = ''
  
  try {
    switch (testName) {
      case 'typing':
        test.result = await runTypingTest()
        break
      case 'formatting':
        test.result = await runFormattingTest()
        break
      case 'large-content':
        test.result = await runLargeContentTest()
        break
      case 'memory-leak':
        test.result = await runMemoryLeakTest()
        break
    }
    
    test.completed = true
  } catch (error) {
    test.result = `测试失败: ${error}`
  } finally {
    test.running = false
  }
}

const runTypingTest = async (): Promise<string> => {
  const testText = 'Hello World! '.repeat(100)
  const iterations = 50
  const times: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    
    // 模拟打字
    await new Promise(resolve => {
      setTimeout(() => {
        const event = new InputEvent('input', { data: testText[i % testText.length] })
        document.dispatchEvent(event)
        resolve(void 0)
      }, 1)
    })
    
    times.push(performance.now() - start)
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  return `平均响应时间: ${avgTime.toFixed(2)}ms`
}

const runFormattingTest = async (): Promise<string> => {
  const iterations = 100
  const times: number[] = []
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now()
    
    // 模拟格式化操作
    document.execCommand('bold')
    document.execCommand('italic')
    document.execCommand('underline')
    
    times.push(performance.now() - start)
    
    await new Promise(resolve => setTimeout(resolve, 1))
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  return `平均格式化时间: ${avgTime.toFixed(2)}ms`
}

const runLargeContentTest = async (): Promise<string> => {
  const largeContent = '<p>' + 'Large content test. '.repeat(1000) + '</p>'
  
  const start = performance.now()
  
  // 创建临时编辑器测试大内容
  const tempEditor = document.createElement('div')
  tempEditor.contentEditable = 'true'
  tempEditor.innerHTML = largeContent
  document.body.appendChild(tempEditor)
  
  await nextTick()
  
  const renderTime = performance.now() - start
  
  document.body.removeChild(tempEditor)
  
  return `大内容渲染时间: ${renderTime.toFixed(2)}ms`
}

const runMemoryLeakTest = async (): Promise<string> => {
  const initialMemory = 'memory' in performance ? (performance as any).memory.usedJSHeapSize : 0
  
  // 创建和销毁大量DOM元素
  for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div')
    div.innerHTML = 'Memory test content'
    document.body.appendChild(div)
    document.body.removeChild(div)
  }
  
  // 强制垃圾回收 (如果支持)
  if ('gc' in window) {
    (window as any).gc()
  }
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const finalMemory = 'memory' in performance ? (performance as any).memory.usedJSHeapSize : 0
  const memoryDiff = finalMemory - initialMemory
  
  return `内存变化: ${(memoryDiff / 1024 / 1024).toFixed(2)}MB`
}

// 压力测试
const runStressTest = async () => {
  if (!stressEditorRef.value) return
  
  stressTestRunning.value = true
  stressTestProgress.value = 0
  
  const sizes = {
    small: 1000,
    medium: 10000,
    large: 100000,
    huge: 1000000
  }
  
  const contentSize = sizes[stressTestSize.value as keyof typeof sizes]
  const content = 'Stress test content. '.repeat(contentSize / 20)
  
  try {
    // 分批插入内容
    const batchSize = Math.max(1000, contentSize / 100)
    let inserted = 0
    
    while (inserted < content.length && stressTestRunning.value) {
      const batch = content.slice(inserted, inserted + batchSize)
      stressEditorRef.value.innerHTML += batch
      
      inserted += batchSize
      stressTestProgress.value = Math.round((inserted / content.length) * 100)
      
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    if (stressTestRunning.value) {
      stressTestProgress.value = 100
    }
  } catch (error) {
    console.error('压力测试失败:', error)
  } finally {
    setTimeout(() => {
      stressTestRunning.value = false
    }, 1000)
  }
}

const stopStressTest = () => {
  stressTestRunning.value = false
  stressTestProgress.value = 0
  
  if (stressEditorRef.value) {
    stressEditorRef.value.innerHTML = '<p>压力测试已停止</p>'
  }
}

const handleStressInput = () => {
  // 处理压力测试编辑器输入
}

// 图表相关
const updateChart = () => {
  if (!fpsChartRef.value) return
  
  const canvas = fpsChartRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制网格
  ctx.strokeStyle = '#e5e5e5'
  ctx.lineWidth = 1
  
  for (let i = 0; i <= 10; i++) {
    const y = (canvas.height / 10) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  
  // 绘制FPS曲线
  if (fpsHistory.value.length > 1) {
    ctx.strokeStyle = '#722ED1'
    ctx.lineWidth = 2
    ctx.beginPath()
    
    fpsHistory.value.forEach((fps, index) => {
      const x = (canvas.width / maxHistoryLength) * index
      const y = canvas.height - (fps / 60) * canvas.height
      
      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    
    ctx.stroke()
  }
}

const exportChart = () => {
  if (!fpsChartRef.value) return
  
  const link = document.createElement('a')
  link.download = 'fps-chart.png'
  link.href = fpsChartRef.value.toDataURL()
  link.click()
}

const clearChart = () => {
  fpsHistory.value = []
  updateChart()
}

const clearMetrics = () => {
  currentFps.value = 0
  memoryUsage.value = 0
  responseTime.value = 0
  domNodes.value = 0
  fpsHistory.value = []
  updateChart()
}

onMounted(() => {
  updateChart()
  console.log('📊 性能测试页面已加载')
})

onUnmounted(() => {
  stopMonitoring()
})
</script>

<style scoped lang="less">
.performance-test-page {
  max-width: 1200px;
  margin: 0 auto;
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-item {
  text-align: center;
  padding: 1.5rem 1rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 8px;
  border: 1px solid var(--ldesign-border-level-1-color);

  .metric-label {
    font-size: 0.85rem;
    color: var(--ldesign-text-color-secondary);
    margin-bottom: 0.5rem;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    
    &.excellent { color: var(--ldesign-success-color); }
    &.good { color: var(--ldesign-brand-color); }
    &.fair { color: var(--ldesign-warning-color); }
    &.poor { color: var(--ldesign-error-color); }
  }
}

.test-suite {
  display: grid;
  gap: 1rem;
}

.test-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  transition: all 0.2s ease;

  &.running {
    border-color: var(--ldesign-warning-color);
    background: var(--ldesign-warning-color-1);
  }

  &.completed {
    border-color: var(--ldesign-success-color);
    background: var(--ldesign-success-color-1);
  }
}

.test-info {
  flex: 1;
  
  .test-name {
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    margin-bottom: 0.25rem;
  }

  .test-description {
    font-size: 0.85rem;
    color: var(--ldesign-text-color-secondary);
    margin-bottom: 0.25rem;
  }

  .test-result {
    font-size: 0.85rem;
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }
}

.test-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 4px;
  background: var(--ldesign-brand-color);
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;

  &:hover:not(:disabled) {
    background: var(--ldesign-brand-color-hover);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.chart-container {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;

  canvas {
    max-width: 100%;
    height: auto;
  }
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.stress-test-controls {
  margin-bottom: 1.5rem;

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    select {
      width: 200px;
      padding: 0.5rem;
      border: 1px solid var(--ldesign-border-level-1-color);
      border-radius: 4px;
      background: var(--ldesign-bg-color-container);
    }
  }
}

.stress-test-progress {
  margin-bottom: 1rem;

  .progress-bar {
    width: 100%;
    height: 20px;
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 0.5rem;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ldesign-brand-color), var(--ldesign-brand-color-hover));
      transition: width 0.3s ease;
    }
  }

  .progress-text {
    text-align: center;
    font-size: 0.9rem;
    color: var(--ldesign-text-color-secondary);
  }
}

.stress-editor {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  padding: 1rem;
  background: var(--ldesign-bg-color-container);
  outline: none;

  &:focus {
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
  }
}

@media (max-width: 768px) {
  .performance-metrics {
    grid-template-columns: repeat(2, 1fr);
  }

  .metric-item {
    padding: 1rem 0.5rem;

    .metric-value {
      font-size: 1.5rem;
    }
  }

  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .test-btn {
    align-self: flex-end;
  }

  .chart-container {
    padding: 0.5rem;
  }

  .stress-test-controls .form-group select {
    width: 100%;
  }
}
</style>
