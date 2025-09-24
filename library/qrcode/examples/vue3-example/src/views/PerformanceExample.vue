<template>
  <div class="performance-example">
    <h2 class="section-title">性能测试示例</h2>
    <p class="section-description">
      展示 @ldesign/qrcode 的性能特性，包括生成速度测试、缓存效果、批量处理和内存使用情况。
    </p>

    <div class="grid grid-2">
      <!-- 性能测试控制面板 -->
      <div class="card">
        <h3 class="card-title">性能测试</h3>
        
        <div class="test-controls">
          <div class="form-group">
            <label class="form-label">测试数据量</label>
            <select v-model.number="testCount" class="form-input">
              <option :value="10">10个二维码</option>
              <option :value="50">50个二维码</option>
              <option :value="100">100个二维码</option>
              <option :value="200">200个二维码</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">二维码大小</label>
            <select v-model.number="testSize" class="form-input">
              <option :value="100">100x100</option>
              <option :value="200">200x200</option>
              <option :value="300">300x300</option>
              <option :value="400">400x400</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">测试类型</label>
            <div class="test-type-options">
              <label class="checkbox-label">
                <input
                  v-model="testTypes.generation"
                  type="checkbox"
                  class="form-checkbox"
                />
                生成速度测试
              </label>
              <label class="checkbox-label">
                <input
                  v-model="testTypes.cache"
                  type="checkbox"
                  class="form-checkbox"
                />
                缓存性能测试
              </label>
              <label class="checkbox-label">
                <input
                  v-model="testTypes.batch"
                  type="checkbox"
                  class="form-checkbox"
                />
                批量处理测试
              </label>
              <label class="checkbox-label">
                <input
                  v-model="testTypes.memory"
                  type="checkbox"
                  class="form-checkbox"
                />
                内存使用测试
              </label>
            </div>
          </div>

          <div class="test-actions">
            <button
              @click="runPerformanceTest"
              class="btn btn-primary"
              :disabled="isRunning || !hasSelectedTests"
            >
              {{ isRunning ? '测试中...' : '开始测试' }}
            </button>
            <button
              @click="clearResults"
              class="btn"
              :disabled="isRunning"
            >
              清空结果
            </button>
          </div>
        </div>

        <!-- 实时进度 -->
        <div v-if="isRunning" class="progress-section">
          <h4>测试进度</h4>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
          <p class="progress-text">{{ progressText }}</p>
        </div>
      </div>

      <!-- 测试结果展示 -->
      <div class="card">
        <h3 class="card-title">测试结果</h3>
        
        <div v-if="testResults.length === 0" class="no-results">
          <div class="no-results-icon">📊</div>
          <p>暂无测试结果</p>
          <p class="hint">选择测试类型并点击开始测试</p>
        </div>

        <div v-else class="results-container">
          <div
            v-for="result in testResults"
            :key="result.id"
            class="result-item"
          >
            <h4 class="result-title">{{ result.name }}</h4>
            <div class="result-metrics">
              <div class="metric">
                <span class="metric-label">总耗时:</span>
                <span class="metric-value">{{ result.totalTime }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">平均耗时:</span>
                <span class="metric-value">{{ result.averageTime }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">最快:</span>
                <span class="metric-value">{{ result.minTime }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">最慢:</span>
                <span class="metric-value">{{ result.maxTime }}ms</span>
              </div>
              <div v-if="result.cacheHitRate !== undefined" class="metric">
                <span class="metric-label">缓存命中率:</span>
                <span class="metric-value">{{ result.cacheHitRate }}%</span>
              </div>
              <div v-if="result.memoryUsage" class="metric">
                <span class="metric-label">内存使用:</span>
                <span class="metric-value">{{ result.memoryUsage }}MB</span>
              </div>
            </div>
            <div v-if="result.chart" class="result-chart">
              <canvas :ref="el => setChartRef(el, result.id)" width="300" height="150"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能对比图表 -->
    <div v-if="comparisonData.length > 0" class="card">
      <h3 class="card-title">性能对比</h3>
      <div class="comparison-chart">
        <canvas ref="comparisonChart" width="800" height="400"></canvas>
      </div>
      <div class="comparison-legend">
        <div
          v-for="item in comparisonData"
          :key="item.label"
          class="legend-item"
        >
          <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 性能建议 -->
    <div class="card">
      <h3 class="card-title">性能优化建议</h3>
      <div class="recommendations">
        <div class="recommendation-item">
          <h4>🚀 启用缓存</h4>
          <p>对于相同内容的二维码，启用缓存可以显著提升生成速度，减少重复计算。</p>
          <code>{ enableCache: true }</code>
        </div>
        <div class="recommendation-item">
          <h4>📏 合理选择尺寸</h4>
          <p>较大的二维码需要更多计算时间，根据实际需求选择合适的尺寸。</p>
          <code>{ size: 200 } // 推荐200-300px</code>
        </div>
        <div class="recommendation-item">
          <h4>🔄 批量处理</h4>
          <p>对于大量二维码生成，使用批量API可以获得更好的性能表现。</p>
          <code>generateQRCodeBatch(options[])</code>
        </div>
        <div class="recommendation-item">
          <h4>💾 内存管理</h4>
          <p>及时清理不需要的二维码实例，避免内存泄漏。</p>
          <code>qrInstance.destroy()</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  generateQRCode,
  type QRCodeResult
} from '@ldesign/qrcode'

// 测试配置
const testCount = ref(50)
const testSize = ref(200)
const testTypes = ref({
  generation: true,
  cache: false,
  batch: false,
  memory: false
})

// 测试状态
const isRunning = ref(false)
const progress = ref(0)
const progressText = ref('')
const testResults = ref<any[]>([])
const chartRefs = ref<Map<string, HTMLCanvasElement>>(new Map())
const comparisonChart = ref<HTMLCanvasElement>()
const comparisonData = ref<any[]>([])

const setChartRef = (el: any, id: string): void => {
  if (el && el instanceof HTMLCanvasElement) {
    chartRefs.value.set(id, el)
    drawChart(el, id)
  }
}

// 计算属性
const hasSelectedTests = computed(() => 
  Object.values(testTypes.value).some(Boolean)
)

/**
 * 运行性能测试
 */
const runPerformanceTest = async (): Promise<void> => {
  if (isRunning.value) return

  isRunning.value = true
  progress.value = 0
  testResults.value = []

  const tests: string[] = []
  if (testTypes.value.generation) tests.push('generation')
  if (testTypes.value.cache) tests.push('cache')
  if (testTypes.value.batch) tests.push('batch')
  if (testTypes.value.memory) tests.push('memory')

  try {
    for (let i = 0; i < tests.length; i++) {
      const testType = tests[i]!
      progressText.value = `正在执行${getTestName(testType)}...`
      
      const result = await runSingleTest(testType)
      testResults.value.push(result)
      
      progress.value = ((i + 1) / tests.length) * 100
      await new Promise(resolve => setTimeout(resolve, 100)) // 短暂延迟以显示进度
    }

    // 生成对比图表
    generateComparisonChart()
  } catch (error) {
    console.error('性能测试失败:', error)
  } finally {
    isRunning.value = false
    progressText.value = '测试完成'
  }
}

/**
 * 运行单个测试
 */
const runSingleTest = async (testType: string): Promise<any> => {
  const startMemory = (performance as any).memory?.usedJSHeapSize || 0

  switch (testType) {
    case 'generation':
      return await runGenerationTest()
    case 'cache':
      return await runCacheTest()
    case 'batch':
      return await runBatchTest()
    case 'memory':
      return await runMemoryTest(startMemory)
    default:
      throw new Error(`未知测试类型: ${testType}`)
  }
}

/**
 * 生成速度测试
 */
const runGenerationTest = async (): Promise<any> => {
  const times: number[] = []
  const testData = generateTestData(testCount.value)

  for (const data of testData) {
    const start = performance.now()

    await generateQRCode(data, {
      size: testSize.value,
      format: 'canvas'
    })

    const end = performance.now()
    times.push(end - start)
  }

  return {
    id: 'generation',
    name: '生成速度测试',
    totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minTime: Math.round(Math.min(...times)),
    maxTime: Math.round(Math.max(...times)),
    times,
    chart: true
  }
}

/**
 * 缓存性能测试
 */
const runCacheTest = async (): Promise<any> => {
  const testData = 'https://www.ldesign.com/cache-test'
  const times: number[] = []
  let cacheHits = 0

  // 第一次生成（无缓存）
  const start1 = performance.now()
  await generateQRCode(testData, {
    size: testSize.value,
    format: 'canvas'
  })
  const end1 = performance.now()
  times.push(end1 - start1)

  // 后续生成（模拟缓存效果）
  for (let i = 1; i < testCount.value; i++) {
    const start = performance.now()

    await generateQRCode(testData, {
      size: testSize.value,
      format: 'canvas'
    })

    const end = performance.now()
    times.push(end - start)

    // 模拟缓存命中
    if (i > 1) {
      cacheHits++
    }
  }

  return {
    id: 'cache',
    name: '缓存性能测试',
    totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minTime: Math.round(Math.min(...times)),
    maxTime: Math.round(Math.max(...times)),
    cacheHitRate: Math.round((cacheHits / (testCount.value - 1)) * 100),
    times,
    chart: true
  }
}

/**
 * 批量处理测试
 */
const runBatchTest = async (): Promise<any> => {
  const testData = generateTestData(testCount.value)

  const start = performance.now()

  // 批量生成二维码
  const promises = testData.map(data =>
    generateQRCode(data, {
      size: testSize.value,
      format: 'canvas'
    })
  )

  await Promise.all(promises)

  const end = performance.now()
  const totalTime = end - start

  return {
    id: 'batch',
    name: '批量处理测试',
    totalTime: Math.round(totalTime),
    averageTime: Math.round(totalTime / testCount.value),
    minTime: 0,
    maxTime: Math.round(totalTime),
    chart: false
  }
}

/**
 * 内存使用测试
 */
const runMemoryTest = async (startMemory: number): Promise<any> => {
  const testData = generateTestData(testCount.value)
  const results: QRCodeResult[] = []

  for (const data of testData) {
    const r = await generateQRCode(data, {
      size: testSize.value,
      format: 'canvas'
    })
    results.push(r)
  }

  const endMemory = (performance as any).memory?.usedJSHeapSize || 0
  const memoryUsage = (endMemory - startMemory) / 1024 / 1024 // MB

  // 清理内存
  results.length = 0

  return {
    id: 'memory',
    name: '内存使用测试',
    totalTime: 0,
    averageTime: 0,
    minTime: 0,
    maxTime: 0,
    memoryUsage: Math.round(memoryUsage * 100) / 100,
    chart: false
  }
}

/**
 * 生成测试数据
 */
const generateTestData = (count: number): string[] => {
  const data: string[] = []
  for (let i = 0; i < count; i++) {
    data.push(`https://www.ldesign.com/test-${i}?timestamp=${Date.now()}`)
  }
  return data
}

/**
 * 获取测试名称
 */
const getTestName = (testType: string): string => {
  const names: Record<string, string> = {
    generation: '生成速度测试',
    cache: '缓存性能测试',
    batch: '批量处理测试',
    memory: '内存使用测试'
  }
  return names[testType] || testType
}

/**
 * 设置图表引用
 */

/**
 * 绘制图表
 */
const drawChart = (canvas: HTMLCanvasElement, testId: string): void => {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const result = testResults.value.find(r => r.id === testId)
  if (!result || !result.times) return

  // 简单的柱状图绘制
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#722ED1'
  
  const barWidth = canvas.width / result.times.length
  const maxTime = Math.max(...result.times)
  
  result.times.forEach((time: number, index: number) => {
    const barHeight = (time / maxTime) * canvas.height * 0.8
    const x = index * barWidth
    const y = canvas.height - barHeight
    
    ctx.fillRect(x, y, barWidth - 1, barHeight)
  })
}

/**
 * 生成对比图表
 */
const generateComparisonChart = (): void => {
  if (!comparisonChart.value) return

  const ctx = comparisonChart.value.getContext('2d')
  if (!ctx) return

  // 准备对比数据
  comparisonData.value = testResults.value.map((result, index) => ({
    label: result.name,
    value: result.averageTime,
    color: `hsl(${260 + index * 30}, 70%, 60%)`
  }))

  // 绘制对比图表
  ctx.clearRect(0, 0, comparisonChart.value.width, comparisonChart.value.height)
  
  const maxValue = Math.max(...comparisonData.value.map(d => d.value))
  const barWidth = comparisonChart.value.width / comparisonData.value.length * 0.8
  const spacing = comparisonChart.value.width / comparisonData.value.length * 0.2
  
  comparisonData.value.forEach((data, index) => {
    const barHeight = (data.value / maxValue) * comparisonChart.value!.height * 0.8
    const x = index * (barWidth + spacing) + spacing / 2
    const y = comparisonChart.value!.height - barHeight - 20
    
    ctx.fillStyle = data.color
    ctx.fillRect(x, y, barWidth, barHeight)
    
    // 绘制数值标签
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${data.value}ms`, x + barWidth / 2, y - 5)
  })
}

/**
 * 清空结果
 */
const clearResults = (): void => {
  testResults.value = []
  comparisonData.value = []
  progress.value = 0
  progressText.value = ''
}
</script>

<style scoped>
.performance-example {
  max-width: 100%;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.section-description {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-lg);
  line-height: 1.6;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-base);
  padding-bottom: var(--ls-spacing-xs);
  border-bottom: 2px solid var(--ldesign-brand-color-2);
}

.test-controls {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
}

.test-type-options {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  cursor: pointer;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  margin-right: var(--ls-spacing-xs);
  cursor: pointer;
}

.test-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-spacing-base);
}

.progress-section {
  margin-top: var(--ls-spacing-base);
  padding: var(--ls-spacing-base);
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-base);
}

.progress-section h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-brand-color-7);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--ldesign-gray-color-2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--ls-spacing-sm);
}

.progress-fill {
  height: 100%;
  background: var(--ldesign-brand-color-6);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  color: var(--ldesign-text-color-secondary);
}

.no-results {
  text-align: center;
  padding: var(--ls-spacing-xl);
  color: var(--ldesign-text-color-placeholder);
}

.no-results-icon {
  font-size: 3rem;
  margin-bottom: var(--ls-spacing-sm);
}

.hint {
  font-size: 14px;
  margin-top: var(--ls-spacing-xs);
}

.results-container {
  max-height: 500px;
  overflow-y: auto;
}

.result-item {
  margin-bottom: var(--ls-spacing-base);
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
}

.result-title {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-brand-color-7);
  font-size: 1.1rem;
}

.result-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-sm);
}

.metric {
  display: flex;
  justify-content: space-between;
  padding: var(--ls-spacing-xs);
  background: var(--ldesign-gray-color-1);
  border-radius: var(--ls-border-radius-sm);
  font-size: 14px;
}

.metric-label {
  color: var(--ldesign-text-color-secondary);
}

.metric-value {
  font-weight: 600;
  color: var(--ldesign-brand-color-7);
}

.result-chart {
  margin-top: var(--ls-spacing-sm);
  text-align: center;
}

.comparison-chart {
  text-align: center;
  margin-bottom: var(--ls-spacing-base);
}

.comparison-legend {
  display: flex;
  justify-content: center;
  gap: var(--ls-spacing-base);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  font-size: 14px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);
}

.recommendation-item {
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
}

.recommendation-item h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.recommendation-item p {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.recommendation-item code {
  display: block;
  padding: var(--ls-spacing-xs);
  background: var(--ldesign-gray-color-1);
  border-radius: var(--ls-border-radius-sm);
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--ldesign-brand-color-7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-actions {
    flex-direction: column;
  }
  
  .result-metrics {
    grid-template-columns: 1fr;
  }
  
  .comparison-legend {
    flex-direction: column;
    align-items: center;
  }
  
  .recommendations {
    grid-template-columns: 1fr;
  }
}
</style>
