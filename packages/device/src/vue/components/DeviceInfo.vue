<template>
  <div 
    :class="[
      'device-info',
      `device-info--${mode}`,
      `device-info--${deviceInfo?.type || 'unknown'}`,
      {
        'device-info--loading': isLoading,
        'device-info--error': hasError
      }
    ]"
  >
    <!-- 加载状态 -->
    <div v-if="isLoading" class="device-info__loading">
      <div class="device-info__spinner"></div>
      <span>正在检测设备信息...</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="hasError" class="device-info__error">
      <div class="device-info__error-icon">⚠️</div>
      <div class="device-info__error-content">
        <h4>设备信息获取失败</h4>
        <p>{{ errorMessage }}</p>
        <button @click="refresh" class="device-info__retry-btn">
          重试
        </button>
      </div>
    </div>

    <!-- 设备信息内容 -->
    <div v-else-if="deviceInfo" class="device-info__content">
      <!-- 紧凑模式 -->
      <template v-if="mode === 'compact'">
        <div class="device-info__compact">
          <div class="device-info__icon">
            {{ getDeviceIcon(deviceInfo.type) }}
          </div>
          <div class="device-info__basic">
            <span class="device-info__type">{{ getDeviceTypeText(deviceInfo.type) }}</span>
            <span class="device-info__size">{{ deviceInfo.screen.width }}×{{ deviceInfo.screen.height }}</span>
          </div>
          <div v-if="showRefresh" class="device-info__actions">
            <button @click="refresh" class="device-info__refresh-btn" title="刷新">
              🔄
            </button>
          </div>
        </div>
      </template>

      <!-- 详细模式 -->
      <template v-else>
        <div class="device-info__header">
          <div class="device-info__title">
            <span class="device-info__icon">{{ getDeviceIcon(deviceInfo.type) }}</span>
            <h3>{{ getDeviceTypeText(deviceInfo.type) }}</h3>
          </div>
          <button v-if="showRefresh" @click="refresh" class="device-info__refresh-btn">
            刷新
          </button>
        </div>

        <div class="device-info__sections">
          <!-- 基本信息 -->
          <div class="device-info__section">
            <h4>基本信息</h4>
            <div class="device-info__grid">
              <div class="device-info__item">
                <label>设备类型</label>
                <span>{{ getDeviceTypeText(deviceInfo.type) }}</span>
              </div>
              <div class="device-info__item">
                <label>屏幕方向</label>
                <span>{{ getOrientationText(deviceInfo.orientation) }}</span>
              </div>
              <div class="device-info__item">
                <label>触摸支持</label>
                <span>{{ deviceInfo.features.touch ? '支持' : '不支持' }}</span>
              </div>
            </div>
          </div>

          <!-- 屏幕信息 -->
          <div class="device-info__section">
            <h4>屏幕信息</h4>
            <div class="device-info__grid">
              <div class="device-info__item">
                <label>视口尺寸</label>
                <span>{{ deviceInfo.screen.width }}×{{ deviceInfo.screen.height }}</span>
              </div>
              <div class="device-info__item">
                <label>设备像素比</label>
                <span>{{ deviceInfo.screen.pixelRatio }}</span>
              </div>
              <div class="device-info__item">
                <label>可用尺寸</label>
                <span>{{ deviceInfo.screen.availWidth }}×{{ deviceInfo.screen.availHeight }}</span>
              </div>
            </div>
          </div>

          <!-- 浏览器信息 -->
          <div class="device-info__section">
            <h4>浏览器信息</h4>
            <div class="device-info__grid">
              <div class="device-info__item">
                <label>浏览器</label>
                <span>{{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</span>
              </div>
              <div class="device-info__item">
                <label>引擎</label>
                <span>{{ deviceInfo.browser.engine }}</span>
              </div>
            </div>
          </div>

          <!-- 操作系统信息 -->
          <div class="device-info__section">
            <h4>操作系统</h4>
            <div class="device-info__grid">
              <div class="device-info__item">
                <label>系统</label>
                <span>{{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</span>
              </div>
              <div class="device-info__item">
                <label>平台</label>
                <span>{{ deviceInfo.os.platform }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 自定义插槽 -->
    <div v-if="$slots.default" class="device-info__custom">
      <slot :device-info="deviceInfo" :refresh="refresh" :is-loading="isLoading" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DeviceInfo, DeviceType, Orientation } from '../../types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDevice } from '../composables/useDevice'

/**
 * DeviceInfo 组件属性定义
 */
interface Props {
  /** 显示模式：compact（紧凑）或 detailed（详细） */
  mode?: 'compact' | 'detailed'
  /** 是否显示刷新按钮 */
  showRefresh?: boolean
  /** 自动刷新间隔（毫秒），0 表示不自动刷新 */
  autoRefresh?: number
  /** 自定义样式类名 */
  customClass?: string
}

/**
 * 组件事件定义
 */
interface Emits {
  /** 设备信息更新事件 */
  (e: 'update', deviceInfo: DeviceInfo): void
  /** 刷新事件 */
  (e: 'refresh'): void
  /** 错误事件 */
  (e: 'error', error: string): void
}

// 定义 props 和 emits
const props = withDefaults(defineProps<Props>(), {
  mode: 'detailed',
  showRefresh: true,
  autoRefresh: 0,
})

const emit = defineEmits<Emits>()

// 使用设备检测 composable
const { deviceInfo, refresh: refreshDevice } = useDevice()

// 组件状态
const isLoading = ref(true)
const errorMessage = ref('')

// 计算属性
const hasError = computed(() => !!errorMessage.value)

// 自动刷新定时器
let autoRefreshTimer: number | null = null

/**
 * 获取设备类型图标
 */
function getDeviceIcon(type: DeviceType): string {
  const icons = {
    mobile: '📱',
    tablet: '📱',
    desktop: '💻',
  }
  return icons[type] || '❓'
}

/**
 * 获取设备类型文本
 */
function getDeviceTypeText(type: DeviceType): string {
  const texts = {
    mobile: '移动设备',
    tablet: '平板设备',
    desktop: '桌面设备',
  }
  return texts[type] || '未知设备'
}

/**
 * 获取屏幕方向文本
 */
function getOrientationText(orientation: Orientation): string {
  const texts = {
    portrait: '竖屏',
    landscape: '横屏',
  }
  return texts[orientation] || '未知'
}

/**
 * 刷新设备信息
 */
async function refresh() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    await refreshDevice()
    
    if (deviceInfo.value) {
      emit('update', deviceInfo.value)
    }
    
    emit('refresh')
  } catch (error) {
    const message = error instanceof Error ? error.message : '刷新失败'
    errorMessage.value = message
    emit('error', message)
  } finally {
    isLoading.value = false
  }
}

/**
 * 设置自动刷新
 */
function setupAutoRefresh() {
  if (props.autoRefresh > 0) {
    autoRefreshTimer = window.setInterval(() => {
      refresh()
    }, props.autoRefresh)
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

// 监听 props 变化
watch(() => props.autoRefresh, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    clearAutoRefresh()
    setupAutoRefresh()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  clearAutoRefresh()
})

// 监听设备信息变化
watch(deviceInfo, (newInfo) => {
  if (newInfo) {
    emit('update', newInfo)
  }
}, { deep: true })
</script>

<style scoped>
.device-info {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.device-info--compact {
  padding: 12px;
}

.device-info--detailed {
  padding: 16px;
}

.device-info--loading {
  opacity: 0.7;
}

/* 加载状态 */
.device-info__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: #666;
}

.device-info__spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e1e5e9;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.device-info__error {
  display: flex;
  align-items: center;
  padding: 16px;
  color: #dc3545;
}

.device-info__error-icon {
  font-size: 24px;
  margin-right: 12px;
}

.device-info__error-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.device-info__error-content p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #6c757d;
}

.device-info__retry-btn {
  padding: 4px 8px;
  font-size: 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 紧凑模式 */
.device-info__compact {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-info__icon {
  font-size: 20px;
}

.device-info__basic {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-info__type {
  font-weight: 600;
  font-size: 14px;
}

.device-info__size {
  font-size: 12px;
  color: #6c757d;
}

/* 详细模式 */
.device-info__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e1e5e9;
}

.device-info__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-info__title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.device-info__refresh-btn {
  padding: 6px 12px;
  font-size: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.device-info__refresh-btn:hover {
  background: #0056b3;
}

.device-info__sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-info__section h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
}

.device-info__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.device-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.device-info__item label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.device-info__item span {
  font-size: 12px;
  font-weight: 600;
}

/* 自定义内容 */
.device-info__custom {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e1e5e9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-info__grid {
    grid-template-columns: 1fr;
  }
  
  .device-info__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
