<script setup>
import { useGeolocation } from '@ldesign/device/vue'
import { ref } from 'vue'

const isLoaded = ref(false)
const loading = ref(false)
const error = ref(null)
const timestamp = ref(null)

const {
  position,
  latitude: _latitude,
  longitude: _longitude,
  accuracy: _accuracy,
  loadModule,
  unloadModule: unloadGeolocationModule,
  getCurrentPosition: getPosition,
} = useGeolocation()

async function loadGeolocationModule() {
  loading.value = true
  error.value = null

  try {
    await loadModule()
    await getCurrentPosition()
    isLoaded.value = true
  }
  catch (err) {
    error.value = getErrorMessage(err)
  }
  finally {
    loading.value = false
  }
}

async function getCurrentPosition() {
  loading.value = true
  error.value = null

  try {
    await getPosition()
    timestamp.value = new Date()
  }
  catch (err) {
    error.value = getErrorMessage(err)
  }
  finally {
    loading.value = false
  }
}

function retry() {
  error.value = null
  loadGeolocationModule()
}

function unloadModule() {
  unloadGeolocationModule()
  isLoaded.value = false
  error.value = null
  timestamp.value = null
}

function getErrorMessage(err) {
  switch (err.code) {
    case 1:
      return '用户拒绝了位置访问请求'
    case 2:
      return '位置信息不可用'
    case 3:
      return '获取位置信息超时'
    default:
      return err.message || '获取位置信息失败'
  }
}

function formatCoordinate(coord) {
  return coord ? coord.toFixed(6) : '未知'
}

function formatAccuracy(acc) {
  return acc ? `±${Math.round(acc)} 米` : '未知'
}

function formatTimestamp(ts) {
  return ts ? ts.toLocaleString() : '未知'
}
</script>

<template>
  <div class="card">
    <h3>📍 地理位置</h3>

    <div v-if="!isLoaded" class="loading-state">
      <button
        class="load-btn"
        :disabled="loading"
        @click="loadGeolocationModule"
      >
        {{ loading ? '加载中...' : '📍 获取位置信息' }}
      </button>
      <p class="note">
        需要用户授权访问位置信息
      </p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-message">
        <span class="error-icon">⚠️</span>
        <span>{{ error }}</span>
      </div>
      <button class="retry-btn" @click="retry">
        🔄 重试
      </button>
    </div>

    <div v-else class="info-grid">
      <div class="coordinates">
        <div class="coord-item">
          <span class="coord-label">纬度:</span>
          <span class="coord-value">{{
            formatCoordinate(position?.latitude)
          }}</span>
        </div>
        <div class="coord-item">
          <span class="coord-label">经度:</span>
          <span class="coord-value">{{
            formatCoordinate(position?.longitude)
          }}</span>
        </div>
      </div>

      <div class="info-item">
        <span class="label">精度:</span>
        <span class="value">{{ formatAccuracy(position?.accuracy) }}</span>
      </div>

      <div v-if="position?.altitude" class="info-item">
        <span class="label">海拔:</span>
        <span class="value">{{ Math.round(position.altitude) }} 米</span>
      </div>

      <div v-if="position?.speed" class="info-item">
        <span class="label">速度:</span>
        <span class="value">{{ Math.round(position.speed * 3.6) }} km/h</span>
      </div>

      <div v-if="position?.heading" class="info-item">
        <span class="label">方向:</span>
        <span class="value">{{ Math.round(position.heading) }}°</span>
      </div>

      <div class="timestamp">
        <span class="label">更新时间:</span>
        <span class="value">{{ formatTimestamp(timestamp) }}</span>
      </div>
    </div>

    <div v-if="isLoaded" class="controls">
      <button
        class="refresh-btn"
        :disabled="loading"
        @click="getCurrentPosition"
      >
        {{ loading ? '获取中...' : '🔄 刷新位置' }}
      </button>
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
  border-left: 4px solid #17a2b8;
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

.note {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #6c757d;
  font-style: italic;
}

.error-state {
  text-align: center;
  padding: 20px 0;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #dc3545;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.error-icon {
  font-size: 1.2rem;
}

.load-btn,
.retry-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-btn:hover:not(:disabled),
.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.coordinates {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.coord-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.coord-label {
  font-weight: 600;
  color: #495057;
}

.coord-value {
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  color: #007bff;
  font-weight: 600;
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

.timestamp {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #f8f9fa;
}

.controls {
  margin-top: 16px;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.refresh-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
