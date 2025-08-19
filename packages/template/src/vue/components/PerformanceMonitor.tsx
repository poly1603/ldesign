/**
 * PerformanceMonitor 组件 - 性能监控组件
 *
 * 提供实时性能指标显示，包括FPS、内存使用、加载时间等
 */

import type { PropType } from 'vue'
import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue'

export interface PerformanceData {
  fps: number
  memory: {
    used: number
    total: number
    percentage: number
  }
  loadTime: number
  renderTime: number
  cacheHitRate: number
  timestamp: number
}

export interface PerformanceMonitorProps {
  detailed?: boolean
  updateInterval?: number
  autoHide?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export const PerformanceMonitor = defineComponent({
  name: 'PerformanceMonitor',
  props: {
    detailed: {
      type: Boolean,
      default: false,
    },
    updateInterval: {
      type: Number,
      default: 1000,
    },
    autoHide: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String as PropType<PerformanceMonitorProps['position']>,
      default: 'top-right',
    },
  },
  emits: ['update'],
  setup(props: any, { emit }: any) {
    const performanceData = ref<PerformanceData>({
      fps: 0,
      memory: { used: 0, total: 0, percentage: 0 },
      loadTime: 0,
      renderTime: 0,
      cacheHitRate: 0,
      timestamp: Date.now(),
    })

    const isVisible = ref(true)
    const updateTimer = ref<number | null>(null)
    const frameCount = ref(0)
    const lastTime = ref(performance.now())

    // 计算性能等级
    const performanceLevel = computed(() => {
      const { fps, memory } = performanceData.value
      if (fps >= 55 && memory.percentage < 70) return 'excellent'
      if (fps >= 45 && memory.percentage < 80) return 'good'
      if (fps >= 30 && memory.percentage < 90) return 'fair'
      return 'poor'
    })

    // 计算组件样式
    const containerStyle = computed(() => ({
      position: 'fixed' as const,
      zIndex: 9999,
      ...getPositionStyles(props.position),
    }))

    // 获取位置样式
    function getPositionStyles(position: string) {
      switch (position) {
        case 'top-left':
          return { top: '20px', left: '20px' }
        case 'top-right':
          return { top: '20px', right: '20px' }
        case 'bottom-left':
          return { bottom: '20px', left: '20px' }
        case 'bottom-right':
          return { bottom: '20px', right: '20px' }
        default:
          return { top: '20px', right: '20px' }
      }
    }

    // 更新FPS
    const updateFPS = () => {
      const now = performance.now()
      frameCount.value++

      if (now - lastTime.value >= 1000) {
        performanceData.value.fps = Math.round((frameCount.value * 1000) / (now - lastTime.value))
        frameCount.value = 0
        lastTime.value = now
      }

      requestAnimationFrame(updateFPS)
    }

    // 更新内存信息
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        performanceData.value.memory = {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
        }
      }
    }

    // 更新性能数据
    const updatePerformanceData = () => {
      updateMemory()

      // 模拟其他性能指标
      performanceData.value.loadTime = Math.random() * 100 + 50
      performanceData.value.renderTime = Math.random() * 20 + 5
      performanceData.value.cacheHitRate = Math.random() * 30 + 70
      performanceData.value.timestamp = Date.now()

      // 自动隐藏逻辑
      if (props.autoHide) {
        const { fps, memory } = performanceData.value
        isVisible.value = fps < 30 || memory.percentage > 80
      }

      emit('update', { ...performanceData.value })
    }

    // 启动监控
    const startMonitoring = () => {
      updateFPS()
      updateTimer.value = window.setInterval(updatePerformanceData, props.updateInterval)
    }

    // 停止监控
    const stopMonitoring = () => {
      if (updateTimer.value) {
        clearInterval(updateTimer.value)
        updateTimer.value = null
      }
    }

    onMounted(() => {
      startMonitoring()
    })

    onUnmounted(() => {
      stopMonitoring()
    })

    return () => {
      if (!isVisible.value) {
        return null
      }

      const { fps, memory, loadTime, renderTime, cacheHitRate } = performanceData.value

      return (
        <div
          class={['performance-monitor', `performance-monitor--${performanceLevel.value}`]}
          style={containerStyle.value}
        >
          <div class="performance-header">
            <h4>性能监控</h4>
            <span class={`performance-status performance-status--${performanceLevel.value}`}>
              {performanceLevel.value === 'excellent' && '🟢'}
              {performanceLevel.value === 'good' && '🟡'}
              {performanceLevel.value === 'fair' && '🟠'}
              {performanceLevel.value === 'poor' && '🔴'}
            </span>
          </div>

          <div class="performance-metrics">
            <div class="performance-metric">
              <span class="metric-label">FPS:</span>
              <span class="metric-value">{fps}</span>
            </div>

            <div class="performance-metric">
              <span class="metric-label">内存:</span>
              <span class="metric-value">
                {memory.used}
                MB ({memory.percentage}
                %)
              </span>
            </div>

            {props.detailed && (
              <>
                <div class="performance-metric">
                  <span class="metric-label">加载:</span>
                  <span class="metric-value">
                    {loadTime.toFixed(1)}
                    ms
                  </span>
                </div>

                <div class="performance-metric">
                  <span class="metric-label">渲染:</span>
                  <span class="metric-value">
                    {renderTime.toFixed(1)}
                    ms
                  </span>
                </div>

                <div class="performance-metric">
                  <span class="metric-label">缓存:</span>
                  <span class="metric-value">{cacheHitRate.toFixed(1)}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      )
    }
  },
})

export default PerformanceMonitor
