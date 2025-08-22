<script setup>
import { useBattery } from '@ldesign/device/vue'
import { computed, ref } from 'vue'

const isLoaded = ref(false)
const loading = ref(false)

const {
  batteryInfo,
  loadModule,
  unloadModule: unloadBatteryModule,
} = useBattery()

const batteryLevel = computed(() => {
  return batteryInfo.value ? Math.round(batteryInfo.value.level * 100) : 0
})

const isCharging = computed(() => {
  return batteryInfo.value?.charging || false
})

async function loadBatteryModule() {
  loading.value = true
  try {
    await loadModule()
    isLoaded.value = true
  }
  catch (error) {
    console.error('加载电池模块失败:', error)
  }
  finally {
    loading.value = false
  }
}

function unloadModule() {
  unloadBatteryModule()
  isLoaded.value = false
}

function formatTime(seconds) {
  if (!seconds || seconds === Infinity) {
    return '未知'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟`
}
</script>

<template>
  <div class="card">
    <h3>🔋 电池信息</h3>

    <div v-if="!isLoaded" class="loading-state">
      <button class="load-btn" :disabled="loading" @click="loadBatteryModule">
        {{ loading ? '加载中...' : '🔋 加载电池模块' }}
      </button>
    </div>

    <div v-else class="info-grid">
      <div class="battery-level">
        <div class="level-container">
          <div class="level-bar">
            <div
              class="level-fill"
              :style="{ width: `${batteryLevel}%` }"
              :class="{ low: batteryLevel < 20, charging: isCharging }"
            />
          </div>
          <span class="level-text">{{ batteryLevel }}%</span>
        </div>
      </div>

      <div class="info-item">
        <span class="label">充电状态:</span>
        <span
          class="status"
          :class="{ 'charging': isCharging, 'not-charging': !isCharging }"
        >
          {{ isCharging ? '充电中' : '未充电' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">充电时间:</span>
        <span class="value">{{ formatTime(batteryInfo?.chargingTime) }}</span>
      </div>

      <div class="info-item">
        <span class="label">放电时间:</span>
        <span class="value">{{
          formatTime(batteryInfo?.dischargingTime)
        }}</span>
      </div>
    </div>

    <div v-if="isLoaded" class="controls">
      <button class="unload-btn" @click="unloadModule">
        ❌ 卸载模块
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ffc107;
}

.card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state {
  text-align: center;
  padding: 20px 0;
}

.load-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ffc107 0%, #ff8c00 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.battery-level {
  margin-bottom: 20px;
}

.level-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
}

.level-fill.low {
  background: linear-gradient(90deg, #dc3545 0%, #fd7e14 100%);
}

.level-fill.charging {
  background: linear-gradient(90deg, #007bff 0%, #6610f2 100%);
  animation: charging 2s ease-in-out infinite alternate;
}

@keyframes charging {
  0% {
    opacity: 0.7;
  }

  100% {
    opacity: 1;
  }
}

.level-text {
  font-weight: 600;
  color: #495057;
  min-width: 40px;
  text-align: right;
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  color: #495057;
}

.value {
  color: #6c757d;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status.charging {
  background: #d1ecf1;
  color: #0c5460;
}

.status.not-charging {
  background: #fff3cd;
  color: #856404;
}

.controls {
  margin-top: 16px;
  text-align: center;
}

.unload-btn {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.unload-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}
</style>
