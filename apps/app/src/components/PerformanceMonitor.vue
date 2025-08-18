<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useAppStore } from '../stores/app'
import { useI18n } from '@ldesign/i18n/vue'

const appStore = useAppStore()
const { t } = useI18n()

// 响应式状态
const isMinimized = ref(false)
const chartCanvas = ref<HTMLCanvasElement>()

// 计算属性
const stats = computed(() => appStore.performanceStats)
const recentRecords = computed(() =>
  appStore.recentNavigationRecords.slice(-10).reverse()
)

// 方法
function toggleMinimize() {
  isMinimized.value = !isMinimized.value
}

function clearData() {
  if (confirm(t('home.performanceMonitor.clearData') + '?')) {
    appStore.clearNavigationRecords()
  }
}

function getDurationClass(duration: number) {
  if (duration < 100) return 'fast'
  if (duration < 300) return 'normal'
  if (duration < 500) return 'slow'
  return 'very-slow'
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 绘制性能图表
function drawChart() {
  if (!chartCanvas.value) return

  const canvas = chartCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const records = appStore.recentNavigationRecords.slice(-20)
  if (records.length === 0) return

  // 清除画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // 设置样式
  ctx.strokeStyle = '#646cff'
  ctx.fillStyle = 'rgba(100, 108, 255, 0.1)'
  ctx.lineWidth = 2

  // 计算数据范围
  const durations = records.map(r => r.duration)
  const maxDuration = Math.max(...durations)
  const minDuration = Math.min(...durations)
  const range = maxDuration - minDuration || 1

  // 绘制区域
  const padding = 10
  const width = canvas.width - padding * 2
  const height = canvas.height - padding * 2

  // 绘制折线图
  ctx.beginPath()
  records.forEach((record, index) => {
    const x = padding + (index / (records.length - 1)) * width
    const y =
      padding + height - ((record.duration - minDuration) / range) * height

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // 绘制填充区域
  ctx.lineTo(padding + width, padding + height)
  ctx.lineTo(padding, padding + height)
  ctx.closePath()
  ctx.fill()

  // 绘制数据点
  ctx.fillStyle = '#646cff'
  records.forEach((record, index) => {
    const x = padding + (index / (records.length - 1)) * width
    const y =
      padding + height - ((record.duration - minDuration) / range) * height

    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}

// 监听数据变化，重新绘制图表
watch(
  () => appStore.recentNavigationRecords,
  () => {
    nextTick(() => {
      drawChart()
    })
  },
  { deep: true }
)

// 组件挂载时绘制图表
onMounted(() => {
  nextTick(() => {
    drawChart()
  })
})
</script>

<template>
  <div class="performance-monitor" :class="{ 'is-minimized': isMinimized }">
    <!-- 标题栏 -->
    <div class="monitor-header" @click="toggleMinimize">
      <div class="header-title">
        <span class="icon">📊</span>
        <span>{{ t('home.performanceMonitor.title') }}</span>
      </div>
      <div class="header-actions">
        <button
          class="btn-icon"
          :title="t('home.performanceMonitor.clearData')"
          @click.stop="clearData"
        >
          🗑️
        </button>
        <button
          class="btn-icon"
          :title="t('home.performanceMonitor.toggleChart')"
          @click.stop="toggleMinimize"
        >
          {{ isMinimized ? '📈' : '📉' }}
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div v-if="!isMinimized" class="monitor-content">
      <!-- 实时统计 -->
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">
            {{ t('home.performanceMonitor.totalNavigations') }}
          </div>
          <div class="stat-value">
            {{ stats.totalNavigations }}
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ t('home.performanceMonitor.averageTime') }}
          </div>
          <div class="stat-value">{{ stats.averageDuration.toFixed(2) }}ms</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ t('home.performanceMonitor.fastestNavigation') }}
          </div>
          <div class="stat-value">{{ stats.minDuration.toFixed(2) }}ms</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">
            {{ t('home.performanceMonitor.slowestNavigation') }}
          </div>
          <div class="stat-value">{{ stats.maxDuration.toFixed(2) }}ms</div>
        </div>
      </div>

      <!-- 最近导航记录 -->
      <div class="recent-navigations">
        <h4>{{ t('home.performanceMonitor.recentNavigations') }}</h4>
        <div class="navigation-list">
          <div
            v-for="record in recentRecords"
            :key="`${record.timestamp}-${record.from}-${record.to}`"
            class="navigation-item"
            :class="getDurationClass(record.duration)"
          >
            <div class="navigation-path">
              <span class="from">{{ record.from || '/' }}</span>
              <span class="arrow">→</span>
              <span class="to">{{ record.to }}</span>
            </div>
            <div class="navigation-duration">
              {{ record.duration.toFixed(2) }}ms
            </div>
            <div class="navigation-time">
              {{ formatTime(record.timestamp) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 性能图表 -->
      <div class="performance-chart">
        <h4>{{ t('home.performanceMonitor.navigationTrend') }}</h4>
        <div class="chart-container">
          <canvas ref="chartCanvas" width="300" height="100" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);

  &.is-minimized {
    width: 200px;
  }
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-color-secondary);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  user-select: none;

  .header-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-weight: 500;

    .icon {
      font-size: 16px;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-xs);

    .btn-icon {
      background: none;
      border: none;
      padding: var(--spacing-xs);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 12px;
      transition: background-color var(--transition-fast);

      &:hover {
        background: var(--bg-color-tertiary);
      }
    }
  }
}

.monitor-content {
  padding: var(--spacing-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);

  .stat-item {
    text-align: center;
    padding: var(--spacing-sm);
    background: var(--bg-color-secondary);
    border-radius: var(--radius-md);

    .stat-label {
      font-size: var(--font-size-xs);
      color: var(--text-color-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .stat-value {
      font-size: var(--font-size-md);
      font-weight: 600;
      color: var(--primary-color);
    }
  }
}

.recent-navigations {
  margin-bottom: var(--spacing-md);

  h4 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-color);
  }

  .navigation-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .navigation-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
    background: var(--bg-color-secondary);
    border-radius: var(--radius-sm);
    font-size: var(--font-size-xs);

    &.fast {
      border-left: 3px solid var(--success-color);
    }

    &.normal {
      border-left: 3px solid var(--info-color);
    }

    &.slow {
      border-left: 3px solid var(--warning-color);
    }

    &.very-slow {
      border-left: 3px solid var(--error-color);
    }

    .navigation-path {
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      min-width: 0;

      .from,
      .to {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .from {
        color: var(--text-color-secondary);
        max-width: 60px;
      }

      .arrow {
        color: var(--text-color-disabled);
        flex-shrink: 0;
      }

      .to {
        color: var(--text-color);
        max-width: 80px;
      }
    }

    .navigation-duration {
      font-weight: 500;
      margin: 0 var(--spacing-xs);
      flex-shrink: 0;
    }

    .navigation-time {
      color: var(--text-color-secondary);
      font-size: 10px;
      flex-shrink: 0;
    }
  }
}

.performance-chart {
  h4 {
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-sm);
    color: var(--text-color);
  }

  .chart-container {
    background: var(--bg-color-secondary);
    border-radius: var(--radius-md);
    padding: var(--spacing-sm);

    canvas {
      width: 100%;
      height: 100px;
    }
  }
}

@media (max-width: 768px) {
  .performance-monitor {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    margin: var(--spacing-md) 0;
  }
}
</style>
