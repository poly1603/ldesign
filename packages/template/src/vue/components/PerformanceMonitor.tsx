/**
 * 性能监控组件
 * 用于显示模板系统的性能指标
 */

import { computed, defineComponent, onMounted, onUnmounted, ref, shallowRef } from 'vue'

export interface PerformanceData {
  /** 内存使用情况 */
  memory?: {
    used: number
    total: number
    percentage: number
  }
  /** 渲染性能 */
  rendering?: {
    fps: number
    frameTime: number
  }
  /** 模板加载性能 */
  templates?: {
    cacheHits: number
    cacheMisses: number
    averageLoadTime: number
    preloadQueueSize: number
  }
}

export default defineComponent({
  name: 'PerformanceMonitor',
  props: {
    /** 是否显示详细信息 */
    detailed: {
      type: Boolean,
      default: false,
    },
    /** 更新间隔（毫秒） */
    updateInterval: {
      type: Number,
      default: 1000,
    },
    /** 是否自动隐藏 */
    autoHide: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    // 注意：这里需要从全局获取 manager 实例
    // 在实际使用中，应该通过 provide/inject 或其他方式获取
    const manager = ref<any>(null)
    const isVisible = ref(true)
    const performanceData = shallowRef<PerformanceData>({})

    let updateTimer: number | null = null
    let frameId: number | null = null
    let lastFrameTime = performance.now()
    let frameCount = 0
    let fps = 0

    // 计算 FPS
    const calculateFPS = () => {
      const now = performance.now()
      frameCount++

      if (now - lastFrameTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastFrameTime))
        frameCount = 0
        lastFrameTime = now
      }

      frameId = requestAnimationFrame(calculateFPS)
    }

    // 获取内存信息
    const getMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        return {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          percentage: Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100),
        }
      }
      return undefined
    }

    // 更新性能数据
    const updatePerformanceData = () => {
      const templateMetrics = manager.value?.getPerformanceMetrics?.()

      performanceData.value = {
        memory: getMemoryInfo(),
        rendering: {
          fps,
          frameTime: 1000 / fps,
        },
        templates: templateMetrics,
      }

      emit('update', performanceData.value)
    }

    // 格式化数字
    const formatNumber = (num: number, decimals = 1) => {
      return num.toFixed(decimals)
    }

    // 格式化字节
    const formatBytes = (bytes: number) => {
      return `${bytes} MB`
    }

    // 性能等级
    const performanceLevel = computed(() => {
      const { rendering } = performanceData.value

      if (!rendering) return 'unknown'

      if (rendering.fps >= 55) return 'excellent'
      if (rendering.fps >= 45) return 'good'
      if (rendering.fps >= 30) return 'fair'
      return 'poor'
    })

    // 性能等级颜色
    const performanceColor = computed(() => {
      switch (performanceLevel.value) {
        case 'excellent':
          return '#52c41a'
        case 'good':
          return '#1890ff'
        case 'fair':
          return '#faad14'
        case 'poor':
          return '#f5222d'
        default:
          return '#d9d9d9'
      }
    })

    // 缓存命中率
    const cacheHitRate = computed(() => {
      const { templates } = performanceData.value
      if (!templates || templates.cacheHits + templates.cacheMisses === 0) {
        return 0
      }
      return Math.round((templates.cacheHits / (templates.cacheHits + templates.cacheMisses)) * 100)
    })

    onMounted(() => {
      // 开始 FPS 计算
      calculateFPS()

      // 开始定期更新
      updateTimer = window.setInterval(updatePerformanceData, props.updateInterval)

      // 立即更新一次
      updatePerformanceData()
    })

    onUnmounted(() => {
      // 清理定时器
      if (updateTimer) {
        clearInterval(updateTimer)
        updateTimer = null
      }

      // 清理动画帧
      if (frameId) {
        cancelAnimationFrame(frameId)
        frameId = null
      }

      // 清理性能数据引用
      performanceData.value = {}
      manager.value = null
    })

    return () => {
      if (!isVisible.value && props.autoHide) {
        return null
      }

      const { memory, rendering, templates } = performanceData.value

      return (
        <div class="performance-monitor">
          <div class="performance-header">
            <h4>性能监控</h4>
            <button class="toggle-btn" onClick={() => (isVisible.value = !isVisible.value)}>
              {isVisible.value ? '隐藏' : '显示'}
            </button>
          </div>

          {isVisible.value && (
            <div class="performance-content">
              {/* 渲染性能 */}
              {rendering && (
                <div class="performance-section">
                  <h5>渲染性能</h5>
                  <div class="metrics">
                    <div class="metric">
                      <span class="label">FPS:</span>
                      <span class="value" style={{ color: performanceColor.value }}>
                        {rendering.fps}
                      </span>
                    </div>
                    <div class="metric">
                      <span class="label">帧时间:</span>
                      <span class="value">
                        {formatNumber(rendering.frameTime)}
                        ms
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 内存使用 */}
              {memory && (
                <div class="performance-section">
                  <h5>内存使用</h5>
                  <div class="metrics">
                    <div class="metric">
                      <span class="label">已用:</span>
                      <span class="value">{formatBytes(memory.used)}</span>
                    </div>
                    <div class="metric">
                      <span class="label">总计:</span>
                      <span class="value">{formatBytes(memory.total)}</span>
                    </div>
                    <div class="metric">
                      <span class="label">使用率:</span>
                      <span class="value">{memory.percentage}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 模板性能 */}
              {templates && (
                <div class="performance-section">
                  <h5>模板性能</h5>
                  <div class="metrics">
                    <div class="metric">
                      <span class="label">缓存命中率:</span>
                      <span class="value">{cacheHitRate.value}%</span>
                    </div>
                    <div class="metric">
                      <span class="label">平均加载时间:</span>
                      <span class="value">
                        {formatNumber(templates.averageLoadTime)}
                        ms
                      </span>
                    </div>
                    {props.detailed && (
                      <>
                        <div class="metric">
                          <span class="label">缓存命中:</span>
                          <span class="value">{templates.cacheHits}</span>
                        </div>
                        <div class="metric">
                          <span class="label">缓存未命中:</span>
                          <span class="value">{templates.cacheMisses}</span>
                        </div>
                        <div class="metric">
                          <span class="label">预加载队列:</span>
                          <span class="value">{templates.preloadQueueSize}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }
  },
})
