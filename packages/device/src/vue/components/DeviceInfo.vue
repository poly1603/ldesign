<script setup lang="ts">
import type { BatteryInfo, NetworkInfo } from '../../types'
import { computed, onMounted, ref } from 'vue'
import { DeviceDetector } from '../../core/DeviceDetector'
import { useDevice } from '../composables/useDevice'

interface Props {
  /** 是否显示网络信息 */
  showNetwork?: boolean
  /** 是否显示电池信息 */
  showBattery?: boolean
  /** 主题模式 */
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<Props>(), {
  showNetwork: false,
  showBattery: false,
  theme: 'auto',
})

// 使用设备检测 hook
const { deviceType, orientation, deviceInfo, isTouchDevice, refresh: refreshDevice } = useDevice()

// 扩展信息
const networkInfo = ref<NetworkInfo | null>(null)
const batteryInfo = ref<BatteryInfo | null>(null)
const loading = ref(false)

// 设备检测器实例
let detector: DeviceDetector | null = null

// 计算属性
const themeClass = computed(() => {
  if (props.theme === 'auto') {
    return 'device-info--auto'
  }
  return `device-info--${props.theme}`
})

const deviceTypeText = computed(() => {
  const typeMap = {
    mobile: '移动设备',
    tablet: '平板设备',
    desktop: '桌面设备',
  }
  return typeMap[deviceType.value] || '未知'
})

const orientationText = computed(() => {
  return orientation.value === 'portrait' ? '竖屏' : '横屏'
})

const screenSize = computed(() => {
  if (!deviceInfo.value)
    return '未知'
  return `${deviceInfo.value.width} × ${deviceInfo.value.height}`
})

const networkTypeText = computed(() => {
  if (!networkInfo.value)
    return '未知'
  const typeMap = {
    wifi: 'WiFi',
    cellular: '蜂窝网络',
    ethernet: '以太网',
    bluetooth: '蓝牙',
    unknown: '未知',
  }
  return typeMap[networkInfo.value.type] || '未知'
})

const batteryLevel = computed(() => {
  return batteryInfo.value ? Math.round(batteryInfo.value.level * 100) : 0
})

const batteryLevelClass = computed(() => {
  const level = batteryLevel.value
  if (level <= 20)
    return 'device-info__battery-fill--low'
  if (level <= 50)
    return 'device-info__battery-fill--medium'
  return 'device-info__battery-fill--high'
})

// 方法
async function refresh() {
  loading.value = true
  try {
    refreshDevice()
    await loadExtendedInfo()
  }
  finally {
    loading.value = false
  }
}

async function loadExtendedInfo() {
  if (!detector) {
    detector = new DeviceDetector()
  }

  // 加载网络信息
  if (props.showNetwork) {
    try {
      const network = await detector.loadModule('network')
      networkInfo.value = network.getData()
    }
    catch (error) {
      console.warn('Failed to load network info:', error)
    }
  }

  // 加载电池信息
  if (props.showBattery) {
    try {
      const battery = await detector.loadModule('battery')
      batteryInfo.value = battery.getData()
    }
    catch (error) {
      console.warn('Failed to load battery info:', error)
    }
  }
}

// 生命周期
onMounted(() => {
  loadExtendedInfo()
})
</script>

<template>
  <div class="device-info" :class="themeClass">
    <div class="device-info__header">
      <h3 class="device-info__title">
        <span class="device-info__icon">📱</span>
        设备信息
      </h3>
      <button
        class="device-info__refresh"
        :disabled="loading"
        title="刷新设备信息"
        @click="refresh"
      >
        <span class="device-info__refresh-icon" :class="{ rotating: loading }">🔄</span>
      </button>
    </div>

    <div class="device-info__content">
      <!-- 基础设备信息 -->
      <div class="device-info__section">
        <h4 class="device-info__section-title">
          基础信息
        </h4>
        <div class="device-info__grid">
          <div class="device-info__item">
            <span class="device-info__label">设备类型:</span>
            <span class="device-info__value device-info__badge" :class="`device-info__badge--${deviceType}`">
              {{ deviceTypeText }}
            </span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">屏幕方向:</span>
            <span class="device-info__value">{{ orientationText }}</span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">屏幕尺寸:</span>
            <span class="device-info__value">{{ screenSize }}</span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">像素比:</span>
            <span class="device-info__value">{{ deviceInfo?.pixelRatio || 1 }}</span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">触摸设备:</span>
            <span class="device-info__value">{{ isTouchDevice ? '是' : '否' }}</span>
          </div>
        </div>
      </div>

      <!-- 系统信息 -->
      <div v-if="deviceInfo" class="device-info__section">
        <h4 class="device-info__section-title">
          系统信息
        </h4>
        <div class="device-info__grid">
          <div class="device-info__item">
            <span class="device-info__label">操作系统:</span>
            <span class="device-info__value">{{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">浏览器:</span>
            <span class="device-info__value">{{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</span>
          </div>
        </div>
      </div>

      <!-- 网络信息 -->
      <div v-if="showNetwork && networkInfo" class="device-info__section">
        <h4 class="device-info__section-title">
          网络信息
        </h4>
        <div class="device-info__grid">
          <div class="device-info__item">
            <span class="device-info__label">连接状态:</span>
            <span class="device-info__value device-info__status" :class="`device-info__status--${networkInfo.status}`">
              {{ networkInfo.status === 'online' ? '在线' : '离线' }}
            </span>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">连接类型:</span>
            <span class="device-info__value">{{ networkTypeText }}</span>
          </div>
          <div v-if="networkInfo.downlink" class="device-info__item">
            <span class="device-info__label">下载速度:</span>
            <span class="device-info__value">{{ networkInfo.downlink }} Mbps</span>
          </div>
        </div>
      </div>

      <!-- 电池信息 -->
      <div v-if="showBattery && batteryInfo" class="device-info__section">
        <h4 class="device-info__section-title">
          电池信息
        </h4>
        <div class="device-info__grid">
          <div class="device-info__item">
            <span class="device-info__label">电量:</span>
            <div class="device-info__battery">
              <div class="device-info__battery-bar">
                <div
                  class="device-info__battery-fill"
                  :style="{ width: `${batteryLevel}%` }"
                  :class="batteryLevelClass"
                />
              </div>
              <span class="device-info__value">{{ batteryLevel }}%</span>
            </div>
          </div>
          <div class="device-info__item">
            <span class="device-info__label">充电状态:</span>
            <span class="device-info__value">{{ batteryInfo.charging ? '充电中' : '未充电' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-info {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #ffffff;
  color: #333333;
  max-width: 600px;
}

.device-info--dark {
  background: #1a1a1a;
  color: #ffffff;
  border-color: #333333;
}

.device-info--auto {
  background: var(--device-info-bg, #ffffff);
  color: var(--device-info-color, #333333);
  border-color: var(--device-info-border, #e1e5e9);
}

.device-info__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid currentColor;
  opacity: 0.2;
}

.device-info__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-info__icon {
  font-size: 20px;
}

.device-info__refresh {
  background: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.device-info__refresh:hover:not(:disabled) {
  opacity: 1;
}

.device-info__refresh:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.device-info__refresh-icon {
  display: inline-block;
  transition: transform 0.3s;
}

.device-info__refresh-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.device-info__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.device-info__section {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
  padding: 12px;
}

.device-info--dark .device-info__section {
  background: rgba(255, 255, 255, 0.05);
}

.device-info__section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666666;
}

.device-info--dark .device-info__section-title {
  color: #cccccc;
}

.device-info__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

@media (min-width: 480px) {
  .device-info__grid {
    grid-template-columns: 1fr 1fr;
  }
}

.device-info__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.device-info__label {
  font-size: 13px;
  color: #666666;
  font-weight: 500;
}

.device-info--dark .device-info__label {
  color: #aaaaaa;
}

.device-info__value {
  font-size: 13px;
  font-weight: 600;
  text-align: right;
}

.device-info__badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.device-info__badge--mobile {
  background: #e3f2fd;
  color: #1976d2;
}

.device-info__badge--tablet {
  background: #f3e5f5;
  color: #7b1fa2;
}

.device-info__badge--desktop {
  background: #e8f5e8;
  color: #388e3c;
}

.device-info__status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.device-info__status--online {
  background: #e8f5e8;
  color: #388e3c;
}

.device-info__status--offline {
  background: #ffebee;
  color: #d32f2f;
}

.device-info__battery {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-info__battery-bar {
  width: 60px;
  height: 12px;
  background: #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
}

.device-info__battery-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 6px;
}

.device-info__battery-fill--high {
  background: #4caf50;
}

.device-info__battery-fill--medium {
  background: #ff9800;
}

.device-info__battery-fill--low {
  background: #f44336;
}
</style>
