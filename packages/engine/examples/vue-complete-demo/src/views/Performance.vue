<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 使用引擎组合式API
const { engine } = useEngine()

// 性能指标数据
const performanceMetrics = ref({
  cpu: 0,
  memory: 0,
  network: 0,
  fps: 60,
  loadTime: 0,
  responseTime: 0,
  throughput: 0,
  errorRate: 0,
})

// 历史性能数据（用于图表）
const performanceHistory = ref([])

// 性能警告
const performanceAlerts = ref([
  {
    id: 1,
    type: 'warning',
    metric: 'memory',
    message: '内存使用率超过80%',
    timestamp: new Date(Date.now() - 300000).toLocaleString(),
    resolved: false,
  },
  {
    id: 2,
    type: 'info',
    metric: 'responseTime',
    message: '响应时间改善15%',
    timestamp: new Date(Date.now() - 600000).toLocaleString(),
    resolved: true,
  },
])

// 性能测试结果
const performanceTests = ref([
  {
    id: 1,
    name: '组件渲染性能',
    status: 'completed',
    score: 92,
    duration: '2.3s',
    timestamp: new Date().toLocaleString(),
    details: {
      firstPaint: '320ms',
      firstContentfulPaint: '580ms',
      largestContentfulPaint: '890ms',
      cumulativeLayoutShift: '0.02',
    },
  },
  {
    id: 2,
    name: 'API响应性能',
    status: 'running',
    score: 0,
    duration: '0s',
    timestamp: new Date().toLocaleString(),
    details: {},
  },
])

// 性能优化建议
const optimizationSuggestions = ref([
  {
    id: 1,
    category: 'memory',
    title: '减少内存占用',
    description: '清理未使用的组件引用和事件监听器',
    priority: 'high',
    impact: '+15% 性能提升',
    implemented: false,
  },
  {
    id: 2,
    category: 'network',
    title: '启用资源压缩',
    description: '对静态资源启用Gzip压缩',
    priority: 'medium',
    impact: '+20% 加载速度',
    implemented: true,
  },
  {
    id: 3,
    category: 'rendering',
    title: '使用虚拟滚动',
    description: '对长列表使用虚拟滚动优化渲染性能',
    priority: 'low',
    impact: '+8% 渲染性能',
    implemented: false,
  },
])

// 定时器
let performanceTimer = null

// 计算属性
const overallScore = computed(() => {
  const metrics = performanceMetrics.value
  const cpuScore = Math.max(0, 100 - metrics.cpu)
  const memoryScore = Math.max(0, 100 - metrics.memory)
  const networkScore = Math.max(0, 100 - metrics.network)
  const fpsScore = Math.min(100, (metrics.fps / 60) * 100)
  
  return Math.round((cpuScore + memoryScore + networkScore + fpsScore) / 4)
})

const activeAlerts = computed(() => {
  return performanceAlerts.value.filter(alert => !alert.resolved)
})

const criticalMetrics = computed(() => {
  const critical = []
  const metrics = performanceMetrics.value
  
  if (metrics.cpu > 80) critical.push('CPU')
  if (metrics.memory > 85) critical.push('内存')
  if (metrics.responseTime > 2000) critical.push('响应时间')
  if (metrics.errorRate > 5) critical.push('错误率')
  
  return critical
})

// 模拟性能数据更新
function updatePerformanceMetrics() {
  // 模拟真实的性能指标变化
  performanceMetrics.value = {
    cpu: Math.max(0, Math.min(100, performanceMetrics.value.cpu + (Math.random() - 0.5) * 10)),
    memory: Math.max(0, Math.min(100, performanceMetrics.value.memory + (Math.random() - 0.5) * 8)),
    network: Math.max(0, Math.min(100, performanceMetrics.value.network + (Math.random() - 0.5) * 15)),
    fps: Math.max(30, Math.min(60, performanceMetrics.value.fps + (Math.random() - 0.5) * 5)),
    loadTime: Math.max(100, performanceMetrics.value.loadTime + (Math.random() - 0.5) * 200),
    responseTime: Math.max(50, performanceMetrics.value.responseTime + (Math.random() - 0.5) * 300),
    throughput: Math.max(0, performanceMetrics.value.throughput + (Math.random() - 0.5) * 50),
    errorRate: Math.max(0, Math.min(10, performanceMetrics.value.errorRate + (Math.random() - 0.5) * 2)),
  }
  
  // 添加到历史记录
  performanceHistory.value.push({
    timestamp: Date.now(),
    ...performanceMetrics.value,
  })
  
  // 只保留最近50条记录
  if (performanceHistory.value.length > 50) {
    performanceHistory.value = performanceHistory.value.slice(-50)
  }
  
  // 检查是否需要发出警告
  checkPerformanceAlerts()
}

// 检查性能警告
function checkPerformanceAlerts() {
  const metrics = performanceMetrics.value
  
  // CPU警告
  if (metrics.cpu > 90 && !hasActiveAlert('cpu')) {
    addAlert('error', 'cpu', 'CPU使用率过高，可能影响应用性能')
  }
  
  // 内存警告
  if (metrics.memory > 85 && !hasActiveAlert('memory')) {
    addAlert('warning', 'memory', '内存使用率过高，建议清理缓存')
  }
  
  // 响应时间警告
  if (metrics.responseTime > 2000 && !hasActiveAlert('responseTime')) {
    addAlert('warning', 'responseTime', '响应时间过长，用户体验可能受影响')
  }
}

// 检查是否已有活跃警告
function hasActiveAlert(metric: string): boolean {
  return performanceAlerts.value.some(alert => 
    alert.metric === metric && !alert.resolved
  )
}

// 添加警告
function addAlert(type: string, metric: string, message: string) {
  const alert = {
    id: Date.now(),
    type,
    metric,
    message,
    timestamp: new Date().toLocaleString(),
    resolved: false,
  }
  
  performanceAlerts.value.unshift(alert)
  
  // 显示通知
  engine.value?.notifications.show({
    title: `⚠️ 性能警告`,
    message,
    type: type === 'error' ? 'error' : 'warning',
    duration: 5000,
  })
}

// 解决警告
function resolveAlert(alertId: number) {
  const alert = performanceAlerts.value.find(a => a.id === alertId)
  if (alert) {
    alert.resolved = true
    
    engine.value?.notifications.show({
      title: '✅ 警告已处理',
      message: '性能警告已标记为已解决',
      type: 'success',
    })
  }
}

// 运行性能测试
function runPerformanceTest(testName: string) {
  const test = performanceTests.value.find(t => t.name === testName)
  if (test && test.status !== 'running') {
    test.status = 'running'
    test.score = 0
    test.duration = '0s'
    
    engine.value?.notifications.show({
      title: '🧪 性能测试开始',
      message: `正在运行 ${testName}...`,
      type: 'info',
    })
    
    // 模拟测试过程
    setTimeout(() => {
      test.status = 'completed'
      test.score = Math.floor(Math.random() * 30) + 70 // 70-100分
      test.duration = `${(Math.random() * 3 + 1).toFixed(1)}s`
      test.timestamp = new Date().toLocaleString()
      
      // 更新测试详情
      if (testName === '组件渲染性能') {
        test.details = {
          firstPaint: `${Math.floor(Math.random() * 200) + 200}ms`,
          firstContentfulPaint: `${Math.floor(Math.random() * 300) + 400}ms`,
          largestContentfulPaint: `${Math.floor(Math.random() * 500) + 600}ms`,
          cumulativeLayoutShift: (Math.random() * 0.1).toFixed(3),
        }
      }
      
      engine.value?.notifications.show({
        title: '✅ 性能测试完成',
        message: `${testName} 得分: ${test.score}`,
        type: 'success',
      })
    }, 3000)
  }
}

// 实施优化建议
function implementSuggestion(suggestionId: number) {
  const suggestion = optimizationSuggestions.value.find(s => s.id === suggestionId)
  if (suggestion && !suggestion.implemented) {
    suggestion.implemented = true
    
    // 模拟性能改善
    const improvement = Math.random() * 10 + 5
    performanceMetrics.value.cpu = Math.max(0, performanceMetrics.value.cpu - improvement)
    performanceMetrics.value.memory = Math.max(0, performanceMetrics.value.memory - improvement)
    
    engine.value?.notifications.show({
      title: '🚀 优化已实施',
      message: `${suggestion.title} - ${suggestion.impact}`,
      type: 'success',
    })
  }
}

// 清除所有警告
function clearAllAlerts() {
  performanceAlerts.value.forEach(alert => {
    alert.resolved = true
  })
  
  engine.value?.notifications.show({
    title: '🧹 警告已清除',
    message: '所有性能警告已清除',
    type: 'info',
  })
}

// 导出性能报告
function exportPerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    overallScore: overallScore.value,
    metrics: performanceMetrics.value,
    history: performanceHistory.value,
    alerts: performanceAlerts.value,
    tests: performanceTests.value,
    suggestions: optimizationSuggestions.value,
  }
  
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `performance-report-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
  
  engine.value?.notifications.show({
    title: '📊 报告导出成功',
    message: '性能报告已导出到文件',
    type: 'success',
  })
}

// 获取指标状态
function getMetricStatus(value: number, thresholds: { warning: number; critical: number }): string {
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'good'
}

// 组件挂载
onMounted(() => {
  // 初始化性能指标
  performanceMetrics.value = {
    cpu: Math.random() * 60 + 20,
    memory: Math.random() * 50 + 30,
    network: Math.random() * 40 + 10,
    fps: Math.random() * 10 + 50,
    loadTime: Math.random() * 500 + 500,
    responseTime: Math.random() * 800 + 200,
    throughput: Math.random() * 100 + 50,
    errorRate: Math.random() * 3,
  }
  
  // 启动性能监控
  performanceTimer = setInterval(updatePerformanceMetrics, 2000)
  
  engine.value?.logger.info('性能监控页面已加载')
})

// 组件卸载
onUnmounted(() => {
  if (performanceTimer) {
    clearInterval(performanceTimer)
  }
})
</script>

<template>
  <div class="performance">
    <div class="page-header">
      <h1>⚡ 性能监控</h1>
      <p>实时监控应用性能，提供优化建议和性能分析</p>
    </div>

    <!-- 性能概览 -->
    <div class="performance-overview">
      <div class="overall-score">
        <div class="score-circle">
          <div class="score-value">{{ overallScore }}</div>
          <div class="score-label">综合评分</div>
        </div>
      </div>
      
      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-icon">🚨</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeAlerts.length }}</div>
            <div class="stat-label">活跃警告</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">⚠️</div>
          <div class="stat-content">
            <div class="stat-value">{{ criticalMetrics.length }}</div>
            <div class="stat-label">关键指标</div>
          </div>
        </div>
        
        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">{{ performanceHistory.length }}</div>
            <div class="stat-label">历史数据</div>
          </div>
        </div>
      </div>
      
      <div class="overview-actions">
        <button class="btn btn-primary" @click="exportPerformanceReport">
          📊 导出报告
        </button>
        <button class="btn btn-secondary" @click="clearAllAlerts">
          🧹 清除警告
        </button>
      </div>
    </div>

    <!-- 核心性能指标 -->
    <div class="section">
      <h2>📊 核心性能指标</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">🔥</div>
            <div class="metric-info">
              <div class="metric-label">CPU使用率</div>
              <div class="metric-value">{{ performanceMetrics.cpu.toFixed(1) }}%</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="getMetricStatus(performanceMetrics.cpu, { warning: 70, critical: 90 })"
              :style="{ width: `${performanceMetrics.cpu}%` }"
            />
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">🧠</div>
            <div class="metric-info">
              <div class="metric-label">内存使用率</div>
              <div class="metric-value">{{ performanceMetrics.memory.toFixed(1) }}%</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="getMetricStatus(performanceMetrics.memory, { warning: 75, critical: 90 })"
              :style="{ width: `${performanceMetrics.memory}%` }"
            />
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">🌐</div>
            <div class="metric-info">
              <div class="metric-label">网络延迟</div>
              <div class="metric-value">{{ performanceMetrics.network.toFixed(0) }}ms</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="getMetricStatus(performanceMetrics.network, { warning: 200, critical: 500 })"
              :style="{ width: `${Math.min(100, performanceMetrics.network / 5)}%` }"
            />
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">🎯</div>
            <div class="metric-info">
              <div class="metric-label">帧率 (FPS)</div>
              <div class="metric-value">{{ performanceMetrics.fps.toFixed(0) }}</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="performanceMetrics.fps >= 50 ? 'good' : performanceMetrics.fps >= 30 ? 'warning' : 'critical'"
              :style="{ width: `${(performanceMetrics.fps / 60) * 100}%` }"
            />
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">⏱️</div>
            <div class="metric-info">
              <div class="metric-label">响应时间</div>
              <div class="metric-value">{{ performanceMetrics.responseTime.toFixed(0) }}ms</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="getMetricStatus(performanceMetrics.responseTime, { warning: 1000, critical: 2000 })"
              :style="{ width: `${Math.min(100, performanceMetrics.responseTime / 30)}%` }"
            />
          </div>
        </div>
        
        <div class="metric-card">
          <div class="metric-header">
            <div class="metric-icon">🚫</div>
            <div class="metric-info">
              <div class="metric-label">错误率</div>
              <div class="metric-value">{{ performanceMetrics.errorRate.toFixed(2) }}%</div>
            </div>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill"
              :class="getMetricStatus(performanceMetrics.errorRate, { warning: 2, critical: 5 })"
              :style="{ width: `${performanceMetrics.errorRate * 10}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 性能警告 -->
    <div v-if="performanceAlerts.length > 0" class="section">
      <h2>🚨 性能警告</h2>
      <div class="alerts-list">
        <div v-for="alert in performanceAlerts" :key="alert.id" class="alert-item">
          <div :class="['alert-indicator', alert.type, { resolved: alert.resolved }]">
            {{ alert.type === 'error' ? '🔴' : alert.type === 'warning' ? '🟡' : '🔵' }}
          </div>
          <div class="alert-content">
            <div class="alert-message">{{ alert.message }}</div>
            <div class="alert-meta">
              <span class="alert-metric">{{ alert.metric }}</span>
              <span class="alert-time">{{ alert.timestamp }}</span>
            </div>
          </div>
          <div class="alert-actions">
            <button 
              v-if="!alert.resolved"
              class="btn btn-sm btn-primary"
              @click="resolveAlert(alert.id)"
            >
              ✅ 解决
            </button>
            <span v-else class="resolved-badge">已解决</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能测试 -->
    <div class="section">
      <h2>🧪 性能测试</h2>
      <div class="tests-grid">
        <div v-for="test in performanceTests" :key="test.id" class="test-card">
          <div class="test-header">
            <div class="test-info">
              <h3 class="test-name">{{ test.name }}</h3>
              <div class="test-meta">
                <span :class="['test-status', test.status]">
                  {{ test.status === 'completed' ? '✅ 已完成' : 
                     test.status === 'running' ? '⏳ 运行中' : '⏸️ 待运行' }}
                </span>
                <span class="test-duration">{{ test.duration }}</span>
              </div>
            </div>
            <div class="test-score">
              <div v-if="test.score > 0" class="score-display">
                <div class="score-number">{{ test.score }}</div>
                <div class="score-text">分</div>
              </div>
            </div>
          </div>
          
          <div v-if="Object.keys(test.details).length > 0" class="test-details">
            <div v-for="(value, key) in test.details" :key="key" class="detail-item">
              <span class="detail-key">{{ key }}:</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>
          
          <div class="test-actions">
            <button 
              class="btn btn-primary"
              :disabled="test.status === 'running'"
              @click="runPerformanceTest(test.name)"
            >
              {{ test.status === 'running' ? '⏳ 运行中...' : '🧪 运行测试' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div class="section">
      <h2>💡 优化建议</h2>
      <div class="suggestions-list">
        <div v-for="suggestion in optimizationSuggestions" :key="suggestion.id" class="suggestion-card">
          <div class="suggestion-header">
            <div class="suggestion-info">
              <h3 class="suggestion-title">{{ suggestion.title }}</h3>
              <p class="suggestion-description">{{ suggestion.description }}</p>
            </div>
            <div class="suggestion-meta">
              <span :class="['priority-badge', suggestion.priority]">
                {{ suggestion.priority === 'high' ? '🔴 高' : 
                   suggestion.priority === 'medium' ? '🟡 中' : '🟢 低' }}
              </span>
            </div>
          </div>
          
          <div class="suggestion-details">
            <div class="suggestion-impact">
              <span class="impact-label">预期收益:</span>
              <span class="impact-value">{{ suggestion.impact }}</span>
            </div>
            
            <div class="suggestion-category">
              <span class="category-label">分类:</span>
              <span class="category-value">{{ suggestion.category }}</span>
            </div>
          </div>
          
          <div class="suggestion-actions">
            <button 
              v-if="!suggestion.implemented"
              class="btn btn-success"
              @click="implementSuggestion(suggestion.id)"
            >
              🚀 实施建议
            </button>
            <span v-else class="implemented-badge">✅ 已实施</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.performance {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.performance-overview {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
}

.overall-score {
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
}

.score-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.overview-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.metric-icon {
  font-size: 2rem;
}

.metric-info {
  flex: 1;
}

.metric-label {
  color: #666;
  font-size: 0.9rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.metric-bar {
  width: 100%;
  height: 8px;
  background: #f1f3f4;
  border-radius: 4px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.metric-fill.good {
  background: #28a745;
}

.metric-fill.warning {
  background: #ffc107;
}

.metric-fill.critical {
  background: #dc3545;
}

.alerts-list {
  display: grid;
  gap: 1rem;
}

.alert-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-item.resolved {
  opacity: 0.7;
}

.alert-indicator {
  font-size: 1.5rem;
}

.alert-content {
  flex: 1;
}

.alert-message {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.alert-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.alert-metric {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
}

.resolved-badge {
  background: #d4edda;
  color: #155724;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.tests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.test-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.test-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.test-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
}

.test-status {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.test-status.completed {
  background: #d4edda;
  color: #155724;
}

.test-status.running {
  background: #fff3cd;
  color: #856404;
}

.test-status.pending {
  background: #e2e3e5;
  color: #383d41;
}

.test-duration {
  color: #666;
}

.score-display {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.score-number {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.score-text {
  font-size: 0.8rem;
  color: #666;
}

.test-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-key {
  font-weight: bold;
  color: #666;
}

.detail-value {
  color: #2c3e50;
}

.suggestions-list {
  display: grid;
  gap: 1.5rem;
}

.suggestion-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.suggestion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.suggestion-title {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.suggestion-description {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.priority-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  white-space: nowrap;
}

.suggestion-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.suggestion-impact,
.suggestion-category {
  display: flex;
  gap: 0.5rem;
}

.impact-label,
.category-label {
  font-weight: bold;
  color: #666;
}

.impact-value {
  color: #28a745;
  font-weight: bold;
}

.category-value {
  color: #667eea;
  text-transform: capitalize;
}

.implemented-badge {
  background: #d4edda;
  color: #155724;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: bold;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

@media (max-width: 768px) {
  .performance-overview {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .quick-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .tests-grid {
    grid-template-columns: 1fr;
  }
  
  .test-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .suggestion-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .suggestion-details {
    grid-template-columns: 1fr;
  }
}
</style>
