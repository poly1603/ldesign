<script setup>
import { useNetwork } from '@ldesign/device/vue'
import { ref } from 'vue'

const isLoaded = ref(false)
const loading = ref(false)

const {
  networkInfo,
  isOnline: _isOnline,
  loadModule,
  unloadModule: unloadNetworkModule,
} = useNetwork()

async function loadNetworkModule() {
  loading.value = true
  try {
    await loadModule()
    isLoaded.value = true
  }
  catch (error) {
    console.error('加载网络模块失败:', error)
  }
  finally {
    loading.value = false
  }
}

function unloadModule() {
  unloadNetworkModule()
  isLoaded.value = false
}
</script>

<template>
  <div class="card">
    <h3>🌐 网络信息</h3>

    <div v-if="!isLoaded" class="loading-state">
      <button class="load-btn" :disabled="loading" @click="loadNetworkModule">
        {{ loading ? '加载中...' : '📡 加载网络模块' }}
      </button>
    </div>

    <div v-else class="info-grid">
      <div class="info-item">
        <span class="label">连接状态:</span>
        <span class="status" :class="networkInfo?.status">
          {{ networkInfo?.status || '未知' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">连接类型:</span>
        <span class="value">{{ networkInfo?.type || '未知' }}</span>
      </div>

      <div class="info-item">
        <span class="label">下载速度:</span>
        <span class="value">
          {{ networkInfo?.downlink ? `${networkInfo.downlink} Mbps` : '未知' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">往返时间:</span>
        <span class="value">
          {{ networkInfo?.rtt ? `${networkInfo.rtt} ms` : '未知' }}
        </span>
      </div>

      <div class="info-item">
        <span class="label">节省流量:</span>
        <span class="value">{{ networkInfo?.saveData ? '是' : '否' }}</span>
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

.loading-state {
  text-align: center;
  padding: 20px 0;
}

.load-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  text-transform: uppercase;
}

.status.online {
  background: #d4edda;
  color: #155724;
}

.status.offline {
  background: #f8d7da;
  color: #721c24;
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
