<script setup>
import { useDevice } from '@ldesign/device/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const { detector } = useDevice()

// 性能监控数据
const detectionCount = ref(0)
const totalDetectionTime = ref(0)
const memoryUsage = ref({ used: 0, total: 0 })
const loadedModules = ref([])
const isMonitoring = ref(false)

// 计算属性
const avgDetectionTime = computed(() => {
  return detectionCount.value > 0
    ? (totalDetectionTime.value / detectionCount.value).toFixed(2)
    : '0'
})

const memoryUsageText = computed(() => {
  if (memoryUsage.value.total === 0)
    return '不支持'
  return `${memoryUsage.value.used}MB / ${memoryUsage.value.total}MB`
})

const loadedModulesText = computed(() => {
  return loadedModules.value.length > 0 ? loadedModules.value.join(', ') : '无'
})

// 更新性能信息
function updatePerformanceInfo() {
  // 获取内存使用情况（如果支持）
  if (performance.memory) {
    memoryUsage.value = {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
    }
  }

  // 获取已加载模块
  if (detector && detector.getLoadedModules) {
    loadedModules.value = detector.getLoadedModules()
  }
}

// 性能测试
async function performanceTest() {
  if (!detector)
    return

  const iterations = 100
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    detector.getDeviceInfo()
  }

  const endTime = performance.now()
  const testTime = endTime - startTime

  detectionCount.value += iterations
  totalDetectionTime.value += testTime

  updatePerformanceInfo()
}

// 重置统计
function resetStats() {
  detectionCount.value = 0
  totalDetectionTime.value = 0
  updatePerformanceInfo()
}

// 开始/停止监控
function toggleMonitoring() {
  isMonitoring.value = !isMonitoring.value
}

// 定时更新
let updateInterval = null

onMounted(() => {
  updatePerformanceInfo()
  updateInterval = setInterval(updatePerformanceInfo, 2000)
})

onUnmounted(() => {
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<template>
  <div class="card">
    <h3>⚡ 性能监控</h3>

    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-label">检测次数:</span>
        <span class="stat-value">{{ detectionCount }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">平均检测时间:</span>
        <span class="stat-value">{{ avgDetectionTime }}ms</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">内存使用:</span>
        <span class="stat-value">{{ memoryUsageText }}</span>
      </div>

      <div class="stat-item">
        <span class="stat-label">已加载模块:</span>
        <span class="stat-value">{{ loadedModulesText }}</span>
      </div>
    </div>

    <div class="controls">
      <button class="btn primary" @click="performanceTest">
        🚀 性能测试
      </button>

      <button class="btn secondary" @click="resetStats">
        🔄 重置统计
      </button>

      <button
        class="btn"
        :class="{ active: isMonitoring }"
        @click="toggleMonitoring"
      >
        {{ isMonitoring ? '⏹️ 停止监控' : '▶️ 开始监控' }}
      </button>
    </div>

    <div v-if="isMonitoring" class="monitoring-indicator">
      <div class="pulse" />
      <span>实时监控中...</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #28a745;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 600;
  color: #495057;
}

.stat-value {
  color: #28a745;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.btn {
  flex: 1;
  min-width: 120px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #6c757d;
  color: white;
}

.btn.primary {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.btn.secondary {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
}

.btn.active {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn:active {
  transform: translateY(0);
}

.monitoring-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 600;
}

.pulse {
  width: 8px;
  height: 8px;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
  }

  .btn {
    min-width: auto;
  }
}
</style>
