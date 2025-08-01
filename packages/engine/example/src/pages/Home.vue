<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{
  navigate: [page: string]
}>()
const engine = inject<Engine>('engine')!
// 响应式数据
const performanceData = ref({
  memoryUsage: 0,
  maxMemory: 100,
  avgEventTime: 0,
  totalEventTriggers: 0,
  stateChanges: 0,
  stateWatchers: 0,
})

const updateInterval = ref<number>()

// 计算属性
const engineVersion = computed(() => engine.config.version || '1.0.0')
const pluginCount = computed(() => engine.plugins.getAll().length)
const eventCount = computed(() => {
  const events = engine.events.eventNames()
  return events.reduce((total, eventName) => {
    return total + engine.events.listenerCount(eventName)
  }, 0)
})
const stateCount = computed(() => engine.state.keys().length)
const middlewareCount = computed(() => engine.middleware.size())
const logCount = computed(() => engine.logger.getLogs().length)

const memoryUsage = computed(() => {
  return `${performanceData.value.memoryUsage.toFixed(1)}MB`
})

const maxMemory = computed(() => {
  return `${performanceData.value.maxMemory}MB`
})

const memoryPercentage = computed(() => {
  return Math.min((performanceData.value.memoryUsage / performanceData.value.maxMemory) * 100, 100)
})

const avgEventTime = computed(() => performanceData.value.avgEventTime.toFixed(2))
const totalEventTriggers = computed(() => performanceData.value.totalEventTriggers)
const stateChanges = computed(() => performanceData.value.stateChanges)
const stateWatchers = computed(() => performanceData.value.stateWatchers)

// 方法
function navigateTo(page: string) {
  emit('navigate', page)
}

function updatePerformanceData() {
  // 模拟内存使用计算
  const stateSize = JSON.stringify(engine.state.keys().map(key => ({ [key]: engine.state.get(key) }))).length
  const logSize = JSON.stringify(engine.logger.getLogs()).length
  const totalSize = stateSize + logSize

  performanceData.value.memoryUsage = totalSize / 1024 / 1024 // 转换为MB
  performanceData.value.maxMemory = 100 // 假设最大100MB

  // 更新其他性能指标
  performanceData.value.stateWatchers = eventCount.value
}

async function runPerformanceTest() {
  engine.notifications.show({
    type: 'info',
    title: '性能测试',
    message: '开始性能测试...',
    duration: 2000,
  })

  const startTime = performance.now()

  // 模拟大量操作
  for (let i = 0; i < 1000; i++) {
    engine.events.emit('perf:test', { iteration: i })
    engine.state.set(`perf.test.${i}`, { value: Math.random() })
  }

  const endTime = performance.now()
  const duration = endTime - startTime

  performanceData.value.avgEventTime = duration / 1000
  performanceData.value.totalEventTriggers += 1000
  performanceData.value.stateChanges += 1000

  engine.notifications.show({
    type: 'success',
    title: '性能测试完成',
    message: `耗时: ${duration.toFixed(2)}ms`,
    duration: 3000,
  })

  // 清理测试数据
  setTimeout(() => {
    for (let i = 0; i < 1000; i++) {
      engine.state.remove(`perf.test.${i}`)
    }
  }, 5000)
}

function clearAllData() {
  engine.state.clear()
  engine.logger.clear()
  performanceData.value.stateChanges = 0
  performanceData.value.totalEventTriggers = 0

  engine.notifications.show({
    type: 'warning',
    title: '数据清空',
    message: '所有数据已清空',
    duration: 2000,
  })
}

function exportData() {
  const data = {
    state: engine.state.keys().reduce((acc, key) => {
      acc[key] = engine.state.get(key)
      return acc
    }, {} as any),
    logs: engine.logger.getLogs(),
    plugins: engine.plugins.getAll().map(p => ({ name: p.name, version: p.version })),
    performance: performanceData.value,
    timestamp: Date.now(),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `engine-data-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '数据已导出到文件',
    duration: 2000,
  })
}

function showSystemInfo() {
  const info = {
    engine: {
      version: engineVersion.value,
      debug: engine.config.debug,
      appName: engine.config.appName,
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    },
    performance: performanceData.value,
  }

  engine.logger.info('系统信息:', info)

  engine.notifications.show({
    type: 'info',
    title: '系统信息',
    message: '详细信息已输出到控制台',
    duration: 3000,
  })
}

onMounted(() => {
  // 初始化性能数据
  updatePerformanceData()

  // 定期更新性能数据
  updateInterval.value = setInterval(updatePerformanceData, 2000)

  // 监听性能相关事件
  engine.events.on('perf:test', () => {
    // 性能测试事件处理
  })

  // 记录初始日志
  engine.logger.info('Vue3 Engine 主页已加载')
})

onUnmounted(() => {
  if (updateInterval.value) {
    clearInterval(updateInterval.value)
  }
})
</script>

<template>
  <div class="home-page">
    <header class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          🚀 Vue3 Engine
        </h1>
        <p class="hero-subtitle">
          强大的Vue3应用引擎 - 插件化、中间件、全局管理
        </p>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-value">{{ engineVersion }}</span>
            <span class="stat-label">引擎版本</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ pluginCount }}</span>
            <span class="stat-label">已加载插件</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ memoryUsage }}</span>
            <span class="stat-label">内存使用</span>
          </div>
        </div>
      </div>
    </header>

    <section class="features-section">
      <div class="container">
        <h2 class="section-title">
          核心功能
        </h2>
        <div class="features-grid">
          <div class="feature-card" @click="navigateTo('plugin')">
            <div class="feature-icon">
              🔌
            </div>
            <h3 class="feature-title">
              插件系统
            </h3>
            <p class="feature-description">
              灵活的插件架构，支持依赖管理和生命周期控制
            </p>
            <div class="feature-stats">
              <span>{{ pluginCount }} 个插件</span>
            </div>
          </div>

          <div class="feature-card" @click="navigateTo('event')">
            <div class="feature-icon">
              📡
            </div>
            <h3 class="feature-title">
              事件系统
            </h3>
            <p class="feature-description">
              高效的事件管理，支持优先级和命名空间
            </p>
            <div class="feature-stats">
              <span>{{ eventCount }} 个监听器</span>
            </div>
          </div>

          <div class="feature-card" @click="navigateTo('state')">
            <div class="feature-icon">
              💾
            </div>
            <h3 class="feature-title">
              状态管理
            </h3>
            <p class="feature-description">
              响应式状态管理，支持嵌套路径和命名空间
            </p>
            <div class="feature-stats">
              <span>{{ stateCount }} 个状态</span>
            </div>
          </div>

          <div class="feature-card" @click="navigateTo('middleware')">
            <div class="feature-icon">
              ⚡
            </div>
            <h3 class="feature-title">
              中间件
            </h3>
            <p class="feature-description">
              强大的中间件系统，支持请求/响应处理
            </p>
            <div class="feature-stats">
              <span>{{ middlewareCount }} 个中间件</span>
            </div>
          </div>

          <div class="feature-card" @click="navigateTo('logger')">
            <div class="feature-icon">
              📝
            </div>
            <h3 class="feature-title">
              日志系统
            </h3>
            <p class="feature-description">
              完整的日志管理，支持多级别和格式化
            </p>
            <div class="feature-stats">
              <span>{{ logCount }} 条日志</span>
            </div>
          </div>

          <div class="feature-card" @click="navigateTo('notification')">
            <div class="feature-icon">
              🔔
            </div>
            <h3 class="feature-title">
              通知系统
            </h3>
            <p class="feature-description">
              美观的通知提示，支持多种类型
            </p>
            <div class="feature-stats">
              <span>实时通知</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="performance-section">
      <div class="container">
        <h2 class="section-title">
          性能监控
        </h2>
        <div class="performance-grid">
          <div class="performance-card">
            <h3>内存使用情况</h3>
            <div class="memory-chart">
              <div class="memory-bar">
                <div
                  class="memory-fill"
                  :style="{ width: `${memoryPercentage}%` }"
                />
              </div>
              <div class="memory-info">
                <span>{{ memoryUsage }} / {{ maxMemory }}</span>
                <span class="memory-percentage">{{ memoryPercentage }}%</span>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h3>事件性能</h3>
            <div class="performance-metrics">
              <div class="metric">
                <span class="metric-label">平均响应时间</span>
                <span class="metric-value">{{ avgEventTime }}ms</span>
              </div>
              <div class="metric">
                <span class="metric-label">事件触发次数</span>
                <span class="metric-value">{{ totalEventTriggers }}</span>
              </div>
            </div>
          </div>

          <div class="performance-card">
            <h3>状态性能</h3>
            <div class="performance-metrics">
              <div class="metric">
                <span class="metric-label">状态变更次数</span>
                <span class="metric-value">{{ stateChanges }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">监听器数量</span>
                <span class="metric-value">{{ stateWatchers }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="quick-actions-section">
      <div class="container">
        <h2 class="section-title">
          快速操作
        </h2>
        <div class="actions-grid">
          <button class="action-btn primary" @click="runPerformanceTest">
            <span class="action-icon">⚡</span>
            <span class="action-text">性能测试</span>
          </button>

          <button class="action-btn secondary" @click="clearAllData">
            <span class="action-icon">🗑️</span>
            <span class="action-text">清空数据</span>
          </button>

          <button class="action-btn success" @click="exportData">
            <span class="action-icon">📤</span>
            <span class="action-text">导出数据</span>
          </button>

          <button class="action-btn info" @click="showSystemInfo">
            <span class="action-icon">ℹ️</span>
            <span class="action-text">系统信息</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero-section {
  padding: 4rem 2rem;
  text-align: center;
  color: white;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 3rem;
  opacity: 0.9;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.features-section,
.performance-section,
.quick-actions-section {
  padding: 4rem 2rem;
  background: white;
}

.performance-section {
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: #2c3e50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-description {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.feature-stats {
  font-size: 0.875rem;
  color: #3498db;
  font-weight: 500;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.performance-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.performance-card h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.memory-chart {
  margin-bottom: 1rem;
}

.memory-bar {
  width: 100%;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.memory-fill {
  height: 100%;
  background: linear-gradient(90deg, #27ae60, #f39c12, #e74c3c);
  transition: width 0.3s ease;
}

.memory-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #7f8c8d;
}

.memory-percentage {
  font-weight: 500;
  color: #2c3e50;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.metric-label {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.metric-value {
  font-weight: 500;
  color: #2c3e50;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2rem;
}

.action-text {
  font-weight: 500;
}

.action-btn.primary {
  background: #3498db;
  color: white;
}

.action-btn.primary:hover {
  background: #2980b9;
}

.action-btn.secondary {
  background: #95a5a6;
  color: white;
}

.action-btn.secondary:hover {
  background: #7f8c8d;
}

.action-btn.success {
  background: #27ae60;
  color: white;
}

.action-btn.success:hover {
  background: #229954;
}

.action-btn.info {
  background: #17a2b8;
  color: white;
}

.action-btn.info:hover {
  background: #138496;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .hero-stats {
    gap: 1.5rem;
  }

  .features-grid,
  .performance-grid,
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
