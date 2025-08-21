<script setup lang="ts">
import { getSystemTheme } from '@ldesign/color'
import { useTheme } from '@ldesign/color/vue'
import { onMounted, ref } from 'vue'
import { useNotification } from '@/composables/useNotification'

const { themeManager, currentTheme, currentMode, availableThemes } = useTheme()
const { showNotification } = useNotification()

const stats = ref({
  themeCount: 0,
  currentTheme: '',
  currentMode: '',
  cacheStatus: '已启用',
  idleProcessing: '已启用',
  systemTheme: '',
})

function refreshStats() {
  stats.value = {
    themeCount: availableThemes.value.length,
    currentTheme: currentTheme.value,
    currentMode: currentMode.value,
    cacheStatus: '已启用',
    idleProcessing: '已启用',
    systemTheme: getSystemTheme(),
  }
}

async function preGenerateAll() {
  try {
    await themeManager.preGenerateAllThemes()
    showNotification('所有主题预生成完成', 'success')
  }
  catch {
    showNotification('预生成失败', 'error')
  }
}

onMounted(() => {
  refreshStats()

  // 定期更新统计信息
  setInterval(refreshStats, 5000)
})
</script>

<template>
  <div class="card">
    <h2 class="card-title">
      📊 性能监控
    </h2>
    <p class="card-description">
      实时监控主题系统的性能状态和统计信息
    </p>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-value">
          {{ stats.themeCount }}
        </div>
        <div class="stat-label">
          主题数量
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          {{ stats.currentTheme }}
        </div>
        <div class="stat-label">
          当前主题
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          {{ stats.currentMode }}
        </div>
        <div class="stat-label">
          当前模式
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          {{ stats.cacheStatus }}
        </div>
        <div class="stat-label">
          缓存状态
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          {{ stats.idleProcessing }}
        </div>
        <div class="stat-label">
          闲时处理
        </div>
      </div>

      <div class="stat-item">
        <div class="stat-value">
          {{ stats.systemTheme }}
        </div>
        <div class="stat-label">
          系统主题
        </div>
      </div>
    </div>

    <div class="performance-actions">
      <button class="btn btn-secondary" @click="preGenerateAll">
        <span class="icon">⚡</span>
        预生成所有主题
      </button>
      <button class="btn btn-secondary" @click="refreshStats">
        <span class="icon">🔄</span>
        刷新统计
      </button>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  text-align: center;
  padding: 1rem 0.5rem;
  border: 1px solid var(--color-border, #e8e8e8);
  border-radius: 6px;
  background: var(--color-background, #ffffff);
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary, #1890ff);
  margin-bottom: 0.25rem;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.performance-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .performance-actions {
    flex-direction: column;
  }
}
</style>
