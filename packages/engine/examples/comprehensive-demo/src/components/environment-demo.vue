<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const envInfo = reactive({
  browser: '',
  os: '',
  deviceType: '',
  screenSize: '',
  networkStatus: '',
})

const features = reactive<Record<string, boolean>>({})

const performanceMetrics = reactive({
  memory: '',
  cpu: '',
  latency: '',
  fps: '',
})

const adaptationStrategy = ref('auto')
const adaptationResult = ref<any>(null)
const isMonitoring = ref(false)
const monitoringLogs = reactive<any[]>([])

let monitoringInterval: number | null = null

// 方法
function refreshEnvInfo() {
  try {
    // 获取浏览器信息
    const userAgent = navigator.userAgent
    envInfo.browser = getBrowserName(userAgent)
    envInfo.os = getOSName(userAgent)
    envInfo.deviceType = getDeviceType()
    envInfo.screenSize = `${window.screen.width}x${window.screen.height}`
    envInfo.networkStatus = getNetworkStatus()

    emit('log', 'info', '环境信息已刷新', envInfo)
  }
  catch (error: any) {
    emit('log', 'error', '刷新环境信息失败', error)
  }
}

function checkFeatures() {
  try {
    const featureChecks = {
      'WebGL': !!window.WebGLRenderingContext,
      'WebGL2': !!window.WebGL2RenderingContext,
      'WebAssembly': typeof WebAssembly !== 'undefined',
      'ServiceWorker': 'serviceWorker' in navigator,
      'WebWorker': typeof Worker !== 'undefined',
      'LocalStorage': typeof Storage !== 'undefined',
      'SessionStorage': typeof sessionStorage !== 'undefined',
      'IndexedDB': 'indexedDB' in window,
      'WebRTC': !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      'Geolocation': 'geolocation' in navigator,
      'DeviceMotion': 'DeviceMotionEvent' in window,
      'TouchEvents': 'ontouchstart' in window,
      'PointerEvents': 'PointerEvent' in window,
      'WebSockets': 'WebSocket' in window,
      'Fetch': 'fetch' in window,
      'ES6Modules': 'noModule' in HTMLScriptElement.prototype,
      'CSS Grid': CSS.supports('display', 'grid'),
      'CSS Flexbox': CSS.supports('display', 'flex'),
      'CSS Variables': CSS.supports('color', 'var(--test)'),
    }

    Object.assign(features, featureChecks)
    emit('log', 'info', '特性检测完成', featureChecks)
  }
  catch (error: any) {
    emit('log', 'error', '特性检测失败', error)
  }
}

function measurePerformance() {
  try {
    // 内存使用情况
    if ('memory' in performance) {
      const memory = (performance as any).memory
      performanceMetrics.memory = `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
    }
    else {
      performanceMetrics.memory = '不支持'
    }

    // CPU 使用情况 (模拟)
    const start = performance.now()
    for (let i = 0; i < 100000; i++) {
      Math.random()
    }
    const end = performance.now()
    performanceMetrics.cpu = `${(end - start).toFixed(2)} ms`

    // 网络延迟 (模拟)
    const latency = Math.floor(Math.random() * 100) + 10
    performanceMetrics.latency = `${latency} ms`

    // 帧率检测
    let frameCount = 0
    const startTime = performance.now()

    const countFrames = () => {
      frameCount++
      if (performance.now() - startTime < 1000) {
        requestAnimationFrame(countFrames)
      }
      else {
        performanceMetrics.fps = `${frameCount} FPS`
      }
    }

    requestAnimationFrame(countFrames)

    emit('log', 'info', '性能测量完成', performanceMetrics)
  }
  catch (error: any) {
    emit('log', 'error', '性能测量失败', error)
  }
}

function applyAdaptation() {
  try {
    const adaptations: Record<string, any> = {
      'auto': {
        strategy: '自动适配',
        settings: {
          animations: envInfo.deviceType !== 'mobile',
          lazyLoading: true,
          imageOptimization: envInfo.deviceType === 'mobile',
          caching: true,
        },
      },
      'mobile': {
        strategy: '移动端优化',
        settings: {
          animations: false,
          lazyLoading: true,
          imageOptimization: true,
          touchOptimization: true,
          reducedMotion: true,
        },
      },
      'desktop': {
        strategy: '桌面端优化',
        settings: {
          animations: true,
          lazyLoading: false,
          imageOptimization: false,
          keyboardShortcuts: true,
          hoverEffects: true,
        },
      },
      'low-end': {
        strategy: '低端设备优化',
        settings: {
          animations: false,
          lazyLoading: true,
          imageOptimization: true,
          reducedQuality: true,
          minimalUI: true,
        },
      },
      'high-end': {
        strategy: '高端设备优化',
        settings: {
          animations: true,
          lazyLoading: false,
          imageOptimization: false,
          highQuality: true,
          advancedFeatures: true,
        },
      },
    }

    adaptationResult.value = adaptations[adaptationStrategy.value]
    emit('log', 'success', `应用适配策略: ${adaptationStrategy.value}`, adaptationResult.value)
  }
  catch (error: any) {
    emit('log', 'error', '应用适配失败', error)
  }
}

function resetAdaptation() {
  adaptationResult.value = null
  adaptationStrategy.value = 'auto'
  emit('log', 'info', '重置适配策略')
}

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
    // 监控环境变化
    const currentScreenSize = `${window.screen.width}x${window.screen.height}`
    if (currentScreenSize !== envInfo.screenSize) {
      addMonitoringLog('change', '屏幕尺寸变化', {
        old: envInfo.screenSize,
        new: currentScreenSize,
      })
      envInfo.screenSize = currentScreenSize
    }

    // 监控网络状态
    const currentNetworkStatus = getNetworkStatus()
    if (currentNetworkStatus !== envInfo.networkStatus) {
      addMonitoringLog('change', '网络状态变化', {
        old: envInfo.networkStatus,
        new: currentNetworkStatus,
      })
      envInfo.networkStatus = currentNetworkStatus
    }

    // 监控性能
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const memoryUsage = memory.usedJSHeapSize / 1024 / 1024
      if (memoryUsage > 50) { // 超过 50MB
        addMonitoringLog('warning', '内存使用过高', { usage: `${memoryUsage.toFixed(2)} MB` })
      }
    }
  }, 2000)

  addMonitoringLog('info', '开始环境监控')
  emit('log', 'info', '开始环境监控')
}

function stopMonitoring() {
  isMonitoring.value = false

  if (monitoringInterval) {
    clearInterval(monitoringInterval)
    monitoringInterval = null
  }

  addMonitoringLog('info', '停止环境监控')
  emit('log', 'info', '停止环境监控')
}

function addMonitoringLog(type: string, message: string, data?: any) {
  monitoringLogs.push({
    timestamp: Date.now(),
    type,
    message,
    data,
  })

  // 限制日志数量
  if (monitoringLogs.length > 50) {
    monitoringLogs.splice(0, monitoringLogs.length - 50)
  }
}

// 辅助函数
function getBrowserName(userAgent: string) {
  if (userAgent.includes('Chrome'))
    return 'Chrome'
  if (userAgent.includes('Firefox'))
    return 'Firefox'
  if (userAgent.includes('Safari'))
    return 'Safari'
  if (userAgent.includes('Edge'))
    return 'Edge'
  return '未知浏览器'
}

function getOSName(userAgent: string) {
  if (userAgent.includes('Windows'))
    return 'Windows'
  if (userAgent.includes('Mac'))
    return 'macOS'
  if (userAgent.includes('Linux'))
    return 'Linux'
  if (userAgent.includes('Android'))
    return 'Android'
  if (userAgent.includes('iOS'))
    return 'iOS'
  return '未知系统'
}

function getDeviceType() {
  const width = window.screen.width
  if (width < 768)
    return 'mobile'
  if (width < 1024)
    return 'tablet'
  return 'desktop'
}

function getNetworkStatus() {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    return `${connection.effectiveType || '未知'} (${connection.downlink || 0} Mbps)`
  }
  return navigator.onLine ? '在线' : '离线'
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  refreshEnvInfo()
  checkFeatures()
  measurePerformance()
  emit('log', 'info', '环境管理器演示已加载')
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }
})
</script>

<template>
  <div class="environment-demo">
    <div class="demo-header">
      <h2>🌍 环境管理器演示</h2>
      <p>EnvironmentManager 提供了环境检测和适配功能，自动识别运行环境并提供相应的优化策略。</p>
    </div>

    <div class="demo-grid">
      <!-- 环境信息 -->
      <div class="card">
        <div class="card-header">
          <h3>环境信息</h3>
        </div>
        <div class="card-body">
          <div class="env-info">
            <div class="info-item">
              <label>浏览器:</label>
              <span>{{ envInfo.browser }}</span>
            </div>
            <div class="info-item">
              <label>操作系统:</label>
              <span>{{ envInfo.os }}</span>
            </div>
            <div class="info-item">
              <label>设备类型:</label>
              <span>{{ envInfo.deviceType }}</span>
            </div>
            <div class="info-item">
              <label>屏幕尺寸:</label>
              <span>{{ envInfo.screenSize }}</span>
            </div>
            <div class="info-item">
              <label>网络状态:</label>
              <span>{{ envInfo.networkStatus }}</span>
            </div>
          </div>

          <div class="form-group">
            <button class="btn btn-secondary" @click="refreshEnvInfo">
              刷新环境信息
            </button>
          </div>
        </div>
      </div>

      <!-- 特性检测 -->
      <div class="card">
        <div class="card-header">
          <h3>特性检测</h3>
        </div>
        <div class="card-body">
          <div class="features-list">
            <div
              v-for="(feature, key) in features"
              :key="key"
              class="feature-item"
            >
              <span class="feature-name">{{ key }}</span>
              <span class="feature-status" :class="{ supported: feature }">
                {{ feature ? '✅ 支持' : '❌ 不支持' }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <button class="btn btn-secondary" @click="checkFeatures">
              检测特性
            </button>
          </div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="card">
        <div class="card-header">
          <h3>性能指标</h3>
        </div>
        <div class="card-body">
          <div class="performance-metrics">
            <div class="metric-item">
              <label>内存使用:</label>
              <span>{{ performanceMetrics.memory }}</span>
            </div>
            <div class="metric-item">
              <label>CPU 使用:</label>
              <span>{{ performanceMetrics.cpu }}</span>
            </div>
            <div class="metric-item">
              <label>网络延迟:</label>
              <span>{{ performanceMetrics.latency }}</span>
            </div>
            <div class="metric-item">
              <label>帧率:</label>
              <span>{{ performanceMetrics.fps }}</span>
            </div>
          </div>

          <div class="form-group">
            <button class="btn btn-secondary" @click="measurePerformance">
              测量性能
            </button>
          </div>
        </div>
      </div>

      <!-- 环境适配 -->
      <div class="card">
        <div class="card-header">
          <h3>环境适配</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>适配策略</label>
            <select v-model="adaptationStrategy">
              <option value="auto">
                自动适配
              </option>
              <option value="mobile">
                移动端优化
              </option>
              <option value="desktop">
                桌面端优化
              </option>
              <option value="low-end">
                低端设备优化
              </option>
              <option value="high-end">
                高端设备优化
              </option>
            </select>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="applyAdaptation">
                应用适配
              </button>
              <button class="btn btn-secondary" @click="resetAdaptation">
                重置适配
              </button>
            </div>
          </div>

          <div v-if="adaptationResult" class="adaptation-result">
            <h4>适配结果</h4>
            <pre>{{ JSON.stringify(adaptationResult, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 环境监控 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>环境监控</h3>
          <button class="btn btn-secondary btn-sm" @click="toggleMonitoring">
            {{ isMonitoring ? '停止监控' : '开始监控' }}
          </button>
        </div>
        <div class="card-body">
          <div class="monitoring-status">
            <span class="status-indicator" :class="{ active: isMonitoring }" />
            <span>{{ isMonitoring ? '监控中...' : '未监控' }}</span>
          </div>

          <div class="monitoring-logs">
            <div
              v-for="(log, index) in monitoringLogs"
              :key="index"
              class="monitoring-log-item"
              :class="log.type"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-type">{{ log.type.toUpperCase() }}</span>
              <span class="log-message">{{ log.message }}</span>
              <span v-if="log.data" class="log-data">{{ JSON.stringify(log.data) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.environment-demo {
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

  .env-info, .performance-metrics {
    .info-item, .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      label {
        font-weight: 500;
        color: var(--text-primary);
      }

      span {
        color: var(--text-secondary);
        font-family: monospace;
      }
    }
  }

  .features-list {
    .feature-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid var(--border-color);

      .feature-name {
        font-weight: 500;
        color: var(--text-primary);
      }

      .feature-status {
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 4px;
        background: var(--error-color);
        color: white;

        &.supported {
          background: var(--success-color);
        }
      }
    }
  }

  .adaptation-result {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    pre {
      background: var(--bg-secondary);
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      font-size: 12px;
      overflow-x: auto;
    }
  }

  .monitoring-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--error-color);

      &.active {
        background: var(--success-color);
        animation: pulse 2s infinite;
      }
    }
  }

  .monitoring-logs {
    max-height: 300px;
    overflow-y: auto;

    .monitoring-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      &.warning {
        background: rgba(255, 193, 7, 0.1);
      }

      &.change {
        background: rgba(23, 162, 184, 0.1);
      }

      .log-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .log-type {
        font-weight: bold;
        min-width: 60px;

        &:contains('WARNING') {
          color: var(--warning-color);
        }

        &:contains('CHANGE') {
          color: var(--info-color);
        }

        &:contains('INFO') {
          color: var(--success-color);
        }
      }

      .log-message {
        flex: 1;
        color: var(--text-primary);
      }

      .log-data {
        color: var(--text-muted);
        font-style: italic;
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

@media (max-width: 768px) {
  .environment-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
