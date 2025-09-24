<script setup lang="ts">
import type { NetworkInfo, NetworkStatus, NetworkType } from '../../types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useNetwork } from '../composables/useDevice'

/**
 * NetworkStatus 组件属性定义
 */
interface Props {
  /** 显示模式 */
  displayMode?: 'icon' | 'text' | 'detailed' | 'progress'
  /** 是否显示详细信息（仅在 detailed 模式下有效） */
  showDetails?: boolean
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 自动刷新间隔（毫秒），0 表示不自动刷新 */
  autoRefresh?: number
  /** 刷新间隔（毫秒） */
  refreshInterval?: number
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 网络状态更新事件 */
  (e: 'update', networkInfo: NetworkInfo): void
  /** 状态变化事件 */
  (e: 'statusChange', status: NetworkStatus): void
  /** 刷新事件 */
  (e: 'refresh'): void
  /** 错误事件 */
  (e: 'error', error: string): void
}

// 定义 props 和 emits
const props = withDefaults(defineProps<Props>(), {
  displayMode: 'detailed',
  showDetails: true,
  showRefresh: false,
  autoRefresh: 0,
  refreshInterval: 30000,
})

const emit = defineEmits<Emits>()

// 使用网络检测 composable
const { networkInfo, isLoaded, loadModule } = useNetwork()

// 组件状态
const isLoading = ref(true)
const errorMessage = ref('')
const lastStatus = ref<NetworkStatus>()

// 计算属性
const hasError = computed(() => !!errorMessage.value)

// 自动刷新定时器
let autoRefreshTimer: number | null = null

/**
 * 获取网络状态图标
 */
function getStatusIcon(status: NetworkStatus): string {
  const icons = {
    online: '🟢',
    offline: '🔴',
  }
  return icons[status] || '⚪'
}

/**
 * 获取网络状态文本
 */
function getStatusText(status: NetworkStatus): string {
  const texts = {
    online: '在线',
    offline: '离线',
  }
  return texts[status] || '未知'
}

/**
 * 获取连接类型文本
 */
function getConnectionTypeText(type: NetworkType): string {
  const texts = {
    wifi: 'WiFi',
    cellular: '移动网络',
    ethernet: '以太网',
    bluetooth: '蓝牙',
    wimax: 'WiMAX',
    other: '其他',
    unknown: '未知',
    none: '无连接',
  }
  return texts[type] || '未知'
}

/**
 * 获取网速百分比（用于进度条显示）
 */
function getSpeedPercentage(speed?: number): number {
  if (!speed)
    return 0
  // 假设 100 Mbps 为满速
  return Math.min((speed / 100) * 100, 100)
}

/**
 * 刷新网络状态
 */
async function refresh() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    if (!isLoaded.value) {
      await loadModule()
    }

    emit('refresh')
  }
  catch (error) {
    const message = error instanceof Error ? error.message : '刷新失败'
    errorMessage.value = message
    emit('error', message)
  }
  finally {
    isLoading.value = false
  }
}

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
  const interval = props.autoRefresh || props.refreshInterval
  if (interval > 0) {
    autoRefreshTimer = window.setInterval(() => {
      refresh()
    }, interval)
  }
}

/**
 * 清理自动刷新
 */
function clearAutoRefresh() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
    autoRefreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  await refresh()
  setupAutoRefresh()
})

onUnmounted(() => {
  clearAutoRefresh()
})

// 监听网络信息变化
watch(networkInfo, (newInfo) => {
  if (newInfo) {
    emit('update', newInfo)

    // 检查状态是否变化
    if (lastStatus.value !== newInfo.status) {
      lastStatus.value = newInfo.status
      emit('statusChange', newInfo.status)
    }
  }
}, { deep: true })

// 监听 props 变化
watch(() => [props.autoRefresh, props.refreshInterval], () => {
  clearAutoRefresh()
  setupAutoRefresh()
})
</script>

<template>
  <div
    class="network-status" :class="[
      `network-status--${displayMode}`,
      `network-status--${networkInfo?.status || 'unknown'}`,
      {
        'network-status--loading': isLoading,
        'network-status--error': hasError,
      },
    ]"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="network-status__loading">
      <div class="network-status__spinner" />
      <span v-if="displayMode !== 'icon'">检测网络状态...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="network-status__error">
      <span class="network-status__error-icon">⚠️</span>
      <span v-if="displayMode !== 'icon'">网络检测失败</span>
    </div>

    <!-- 网络状态内容 -->
    <div v-else-if="networkInfo" class="network-status__content">
      <!-- 图标模式 -->
      <template v-if="displayMode === 'icon'">
        <span
          class="network-status__icon" :class="[`network-status__icon--${networkInfo.status}`]"
          :title="getStatusText(networkInfo.status)"
        >
          {{ getStatusIcon(networkInfo.status) }}
        </span>
      </template>

      <!-- 文字模式 -->
      <template v-else-if="displayMode === 'text'">
        <span class="network-status__text">
          {{ getStatusText(networkInfo.status) }}
        </span>
      </template>

      <!-- 详细模式 -->
      <template v-else-if="displayMode === 'detailed'">
        <div class="network-status__detailed">
          <div class="network-status__main">
            <span class="network-status__icon">{{ getStatusIcon(networkInfo.status) }}</span>
            <div class="network-status__info">
              <div class="network-status__status">
                {{ getStatusText(networkInfo.status) }}
              </div>
              <div class="network-status__type">
                {{ getConnectionTypeText(networkInfo.type) }}
              </div>
            </div>
          </div>

          <div v-if="showDetails && networkInfo.status === 'online'" class="network-status__details">
            <div v-if="networkInfo.downlink" class="network-status__detail">
              <label>下载速度</label>
              <span>{{ networkInfo.downlink.toFixed(1) }} Mbps</span>
            </div>
            <div v-if="networkInfo.rtt" class="network-status__detail">
              <label>延迟</label>
              <span>{{ networkInfo.rtt }} ms</span>
            </div>
            <div v-if="networkInfo.saveData !== undefined" class="network-status__detail">
              <label>省流模式</label>
              <span>{{ networkInfo.saveData ? '开启' : '关闭' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- 进度条模式 -->
      <template v-else-if="displayMode === 'progress'">
        <div class="network-status__progress">
          <div class="network-status__progress-header">
            <span>{{ getStatusText(networkInfo.status) }}</span>
            <span v-if="networkInfo.downlink">{{ networkInfo.downlink.toFixed(1) }} Mbps</span>
          </div>
          <div class="network-status__progress-bar">
            <div
              class="network-status__progress-fill"
              :style="{ width: `${getSpeedPercentage(networkInfo.downlink)}%` }"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- 刷新按钮 -->
    <button
      v-if="showRefresh && displayMode !== 'icon'"
      class="network-status__refresh"
      :disabled="isLoading"
      @click="refresh"
    >
      🔄
    </button>
  </div>
</template>

<style scoped>
.network-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 加载状态 */
.network-status__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
}

.network-status__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.network-status__error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc3545;
  font-size: 14px;
}

/* 图标模式 */
.network-status__icon {
  font-size: 16px;
  cursor: default;
}

.network-status__icon--online {
  color: #28a745;
}

.network-status__icon--offline {
  color: #dc3545;
}

/* 文字模式 */
.network-status__text {
  font-size: 14px;
  font-weight: 500;
}

.network-status--online .network-status__text {
  color: #28a745;
}

.network-status--offline .network-status__text {
  color: #dc3545;
}

/* 详细模式 */
.network-status__detailed {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-status__main {
  display: flex;
  align-items: center;
  gap: 8px;
}

.network-status__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.network-status__status {
  font-size: 14px;
  font-weight: 600;
}

.network-status__type {
  font-size: 12px;
  color: #6c757d;
}

.network-status__details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 24px;
}

.network-status__detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.network-status__detail label {
  color: #6c757d;
}

.network-status__detail span {
  font-weight: 500;
}

/* 进度条模式 */
.network-status__progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.network-status__progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.network-status__progress-bar {
  height: 4px;
  background: #e1e5e9;
  border-radius: 2px;
  overflow: hidden;
}

.network-status__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
}

.network-status--offline .network-status__progress-fill {
  background: #dc3545;
}

/* 刷新按钮 */
.network-status__refresh {
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.network-status__refresh:hover {
  opacity: 1;
}

.network-status__refresh:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* 不同显示模式的样式调整 */
.network-status--icon {
  justify-content: center;
}

.network-status--text {
  justify-content: flex-start;
}

.network-status--detailed {
  padding: 8px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
}

.network-status--progress {
  padding: 6px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: #ffffff;
}
</style>
