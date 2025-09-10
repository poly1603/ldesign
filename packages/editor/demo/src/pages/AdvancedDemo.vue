<template>
  <div class="advanced-demo">
    <div class="demo-header">
      <h1>🔬 高级功能演示</h1>
      <p>展示 LDesign Editor 的高级特性和技术细节</p>
    </div>

    <div class="demo-content">
      <!-- 编辑器实例 -->
      <div class="editor-panel">
        <h2>📝 编辑器实例</h2>
        <UnifiedEditor />
      </div>

      <!-- 技术信息面板 -->
      <div class="info-panel">
        <div class="info-section">
          <h3>🏗️ 架构信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <strong>核心架构:</strong> 模块化插件系统
            </div>
            <div class="info-item">
              <strong>状态管理:</strong> 事件驱动 + 命令模式
            </div>
            <div class="info-item">
              <strong>类型安全:</strong> 100% TypeScript 覆盖
            </div>
            <div class="info-item">
              <strong>主题系统:</strong> CSS 变量动态切换
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>🔌 已加载插件</h3>
          <div class="plugin-list">
            <div class="plugin-item" v-for="plugin in loadedPlugins" :key="plugin.name">
              <span class="plugin-icon">{{ plugin.icon }}</span>
              <span class="plugin-name">{{ plugin.name }}</span>
              <span class="plugin-status">{{ plugin.status }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>📊 实时统计</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">{{ stats.totalElements }}</div>
              <div class="stat-label">DOM 元素</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.memoryUsage }}MB</div>
              <div class="stat-label">内存使用</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.renderTime }}ms</div>
              <div class="stat-label">渲染时间</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ stats.eventCount }}</div>
              <div class="stat-label">事件数量</div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>🛠️ 开发工具</h3>
          <div class="tool-buttons">
            <button @click="exportDebugInfo" class="tool-btn">
              📋 导出调试信息
            </button>
            <button @click="clearConsole" class="tool-btn">
              🧹 清空控制台
            </button>
            <button @click="runPerformanceTest" class="tool-btn">
              ⚡ 性能测试
            </button>
            <button @click="toggleDebugMode" class="tool-btn">
              🐛 调试模式
            </button>
          </div>
        </div>

        <div class="info-section">
          <h3>🌐 环境信息</h3>
          <div class="env-info">
            <div class="env-item">
              <strong>浏览器:</strong> {{ browserInfo.name }} {{ browserInfo.version }}
            </div>
            <div class="env-item">
              <strong>设备:</strong> {{ deviceInfo.type }} ({{ deviceInfo.screen }})
            </div>
            <div class="env-item">
              <strong>支持特性:</strong> {{ supportedFeatures.join(', ') }}
            </div>
            <div class="env-item">
              <strong>构建时间:</strong> {{ buildInfo.timestamp }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import UnifiedEditor from '../components/UnifiedEditor.vue'

// 响应式数据
const loadedPlugins = ref([
  { name: 'BoldPlugin', icon: '💪', status: '✅ 已加载' },
  { name: 'ItalicPlugin', icon: '📐', status: '✅ 已加载' },
  { name: 'UnderlinePlugin', icon: '📏', status: '✅ 已加载' },
  { name: 'HeadingPlugin', icon: '📰', status: '✅ 已加载' },
  { name: 'ListPlugin', icon: '📝', status: '✅ 已加载' },
  { name: 'BlockquotePlugin', icon: '💬', status: '✅ 已加载' },
  { name: 'ImagePlugin', icon: '🖼️', status: '✅ 已加载' },
  { name: 'LinkPlugin', icon: '🔗', status: '✅ 已加载' }
])

const stats = reactive({
  totalElements: 0,
  memoryUsage: 0,
  renderTime: 0,
  eventCount: 0
})

const browserInfo = reactive({
  name: '',
  version: ''
})

const deviceInfo = reactive({
  type: '',
  screen: ''
})

const supportedFeatures = ref<string[]>([])

const buildInfo = reactive({
  timestamp: new Date().toLocaleString()
})

let statsInterval: number | null = null

// 生命周期
onMounted(() => {
  console.log('🔬 高级演示页面已加载')
  initializeDemo()
  startStatsMonitoring()
})

onUnmounted(() => {
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})

// 初始化演示
function initializeDemo() {
  // 获取浏览器信息
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) {
    browserInfo.name = 'Chrome'
    browserInfo.version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Firefox')) {
    browserInfo.name = 'Firefox'
    browserInfo.version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (userAgent.includes('Safari')) {
    browserInfo.name = 'Safari'
    browserInfo.version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else {
    browserInfo.name = 'Unknown'
    browserInfo.version = 'Unknown'
  }

  // 获取设备信息
  deviceInfo.type = /Mobi|Android/i.test(userAgent) ? '移动设备' : '桌面设备'
  deviceInfo.screen = `${screen.width}x${screen.height}`

  // 检测支持的特性
  const features = []
  if ('clipboard' in navigator) features.push('剪贴板API')
  if ('serviceWorker' in navigator) features.push('Service Worker')
  if ('webkitSpeechRecognition' in window) features.push('语音识别')
  if ('IntersectionObserver' in window) features.push('交叉观察器')
  if ('ResizeObserver' in window) features.push('尺寸观察器')
  supportedFeatures.value = features
}

// 开始统计监控
function startStatsMonitoring() {
  statsInterval = setInterval(() => {
    updateStats()
  }, 1000) as unknown as number
}

// 更新统计信息
function updateStats() {
  // DOM 元素数量
  stats.totalElements = document.querySelectorAll('*').length

  // 内存使用（如果支持）
  if ('memory' in performance) {
    const memory = (performance as any).memory
    stats.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  }

  // 渲染时间
  const paintEntries = performance.getEntriesByType('paint')
  if (paintEntries.length > 0) {
    stats.renderTime = Math.round(paintEntries[paintEntries.length - 1].startTime)
  }

  // 事件数量（模拟）
  stats.eventCount = Math.floor(Math.random() * 100) + 50
}

// 导出调试信息
function exportDebugInfo() {
  const debugInfo = {
    timestamp: new Date().toISOString(),
    browser: browserInfo,
    device: deviceInfo,
    features: supportedFeatures.value,
    plugins: loadedPlugins.value,
    stats: stats,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  const blob = new Blob([JSON.stringify(debugInfo, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `ldesign-editor-debug-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
  console.log('📋 调试信息已导出', debugInfo)
}

// 清空控制台
function clearConsole() {
  console.clear()
  console.log('🧹 控制台已清空')
}

// 运行性能测试
function runPerformanceTest() {
  console.log('⚡ 开始性能测试...')
  
  const startTime = performance.now()
  
  // 模拟一些操作
  for (let i = 0; i < 10000; i++) {
    const div = document.createElement('div')
    div.textContent = `测试元素 ${i}`
  }
  
  const endTime = performance.now()
  const duration = endTime - startTime
  
  console.log(`⚡ 性能测试完成，耗时: ${duration.toFixed(2)}ms`)
  alert(`性能测试完成！\n耗时: ${duration.toFixed(2)}ms`)
}

// 切换调试模式
function toggleDebugMode() {
  const body = document.body
  const isDebugMode = body.classList.contains('debug-mode')
  
  if (isDebugMode) {
    body.classList.remove('debug-mode')
    console.log('🐛 调试模式已关闭')
  } else {
    body.classList.add('debug-mode')
    console.log('🐛 调试模式已开启')
  }
}
</script>

<style lang="less" scoped>
.advanced-demo {
  padding: var(--ls-padding-base);
  max-width: 1400px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);

  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
    font-size: var(--ls-font-size-h1);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-lg);
  }
}

.demo-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--ls-spacing-lg);
  min-height: 0;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;

  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
    font-size: var(--ls-font-size-h3);
  }

  :deep(.unified-editor) {
    flex: 1;
  }
}

.info-panel {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
  overflow-y: auto;
}

.info-section {
  margin-bottom: var(--ls-margin-lg);

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
    font-size: var(--ls-font-size-lg);
    border-bottom: 1px solid var(--ldesign-border-color);
    padding-bottom: var(--ls-padding-xs);
  }
}

.info-grid {
  display: grid;
  gap: var(--ls-spacing-sm);

  .info-item {
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-sm);
  }
}

.plugin-list {
  display: grid;
  gap: var(--ls-spacing-xs);

  .plugin-item {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-sm);

    .plugin-icon {
      font-size: var(--ls-font-size-base);
    }

    .plugin-name {
      flex: 1;
      font-weight: 500;
    }

    .plugin-status {
      color: var(--ldesign-success-color);
      font-size: var(--ls-font-size-xs);
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ls-spacing-sm);

  .stat-card {
    text-align: center;
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);

    .stat-value {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      color: var(--ldesign-brand-color);
      margin-bottom: var(--ls-margin-xs);
    }

    .stat-label {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.tool-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--ls-spacing-sm);

  .tool-btn {
    padding: var(--ls-padding-sm);
    background: var(--ldesign-brand-color);
    color: var(--ldesign-font-white-1);
    border: none;
    border-radius: var(--ls-border-radius-sm);
    cursor: pointer;
    font-size: var(--ls-font-size-xs);
    transition: all 0.2s ease;

    &:hover {
      background: var(--ldesign-brand-color-hover);
    }

    &:active {
      background: var(--ldesign-brand-color-active);
    }
  }
}

.env-info {
  display: grid;
  gap: var(--ls-spacing-sm);

  .env-item {
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    font-size: var(--ls-font-size-xs);
    font-family: 'Monaco', 'Menlo', monospace;
  }
}

@media (max-width: 1024px) {
  .demo-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }

  .info-panel {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .advanced-demo {
    padding: var(--ls-padding-sm);
    height: calc(100vh - 80px);
  }

  .demo-header {
    margin-bottom: var(--ls-margin-base);

    h1 {
      font-size: var(--ls-font-size-h2);
    }

    p {
      font-size: var(--ls-font-size-base);
    }
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tool-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
