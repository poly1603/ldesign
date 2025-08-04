<script setup lang="ts">
import { useSystemThemeSync, useTheme } from '@ldesign/color/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { currentMode } = useTheme()
const { systemTheme, syncWithSystem: syncFn } = useSystemThemeSync()
const { showNotification } = useNotification()

const autoSync = ref(false)
let syncInterval: number | null = null

const isSynced = computed(() => {
  return systemTheme.value === currentMode.value
})

const syncStatus = computed(() => {
  return isSynced.value ? '已同步' : '未同步'
})

async function syncWithSystem() {
  try {
    await syncFn()
    showNotification('已同步系统主题', 'success')
  }
  catch {
    showNotification('同步失败', 'error')
  }
}

function toggleAutoSync() {
  autoSync.value = !autoSync.value

  if (autoSync.value) {
    // 开启自动同步
    syncInterval = window.setInterval(() => {
      if (!isSynced.value) {
        syncWithSystem()
      }
    }, 2000)
    showNotification('已开启自动同步', 'info')
  }
  else {
    // 关闭自动同步
    if (syncInterval) {
      clearInterval(syncInterval)
      syncInterval = null
    }
    showNotification('已关闭自动同步', 'info')
  }
}

onMounted(() => {
  // 初始同步检查
  if (!isSynced.value) {
    showNotification('检测到系统主题与应用主题不一致', 'warning')
  }
})

onUnmounted(() => {
  if (syncInterval) {
    clearInterval(syncInterval)
  }
})
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      🌙 系统主题同步
    </h2>

    <div class="sync-info">
      <div class="info-item">
        <span class="info-label">系统主题:</span>
        <span class="info-value">{{ systemTheme }}</span>
        <span class="status-indicator" :class="[systemTheme]" />
      </div>

      <div class="info-item">
        <span class="info-label">应用主题:</span>
        <span class="info-value">{{ currentMode }}</span>
        <span class="status-indicator" :class="[currentMode]" />
      </div>

      <div class="info-item">
        <span class="info-label">同步状态:</span>
        <span class="info-value">{{ syncStatus }}</span>
        <span class="sync-indicator" :class="[{ synced: isSynced }]" />
      </div>
    </div>

    <div class="sync-actions">
      <button
        class="btn btn-primary btn-sm"
        @click="syncWithSystem"
      >
        🔄 同步系统主题
      </button>

      <button
        class="btn btn-secondary btn-sm"
        @click="toggleAutoSync"
      >
        {{ autoSync ? '🔓 关闭自动同步' : '🔒 开启自动同步' }}
      </button>
    </div>

    <div class="sync-description">
      <p>
        系统主题检测功能会自动监听操作系统的主题设置变化，
        当系统切换亮色/暗色模式时，应用主题也会相应调整。
      </p>
    </div>
  </div>
</template>

<style scoped>
.sync-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--color-gray-1, #fafafa);
  border-radius: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-label {
  font-weight: 500;
  color: var(--color-text, #333);
  min-width: 80px;
}

.info-value {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  background: var(--color-background, #ffffff);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  border: 1px solid var(--color-border, #e8e8e8);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.status-indicator.light {
  background: #ffd700;
  box-shadow: 0 0 4px rgba(255, 215, 0, 0.5);
}

.status-indicator.dark {
  background: #4a5568;
  box-shadow: 0 0 4px rgba(74, 85, 104, 0.5);
}

.sync-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-danger, #ff4d4f);
  display: inline-block;
  transition: background-color 0.3s ease;
}

.sync-indicator.synced {
  background: var(--color-success, #52c41a);
}

.sync-actions {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.sync-description {
  padding: 1rem;
  background: var(--color-primary-1, #e6f7ff);
  border-radius: 6px;
  border-left: 4px solid var(--color-primary, #1890ff);
}

.sync-description p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary, #666);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .sync-actions {
    flex-direction: column;
  }

  .info-item {
    flex-wrap: wrap;
  }

  .info-label {
    min-width: auto;
  }
}
</style>
