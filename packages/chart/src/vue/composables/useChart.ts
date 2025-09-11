/**
 * useChart Composable
 * 
 * 提供响应式的图表管理功能
 */

import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { Ref } from 'vue'
import { Chart } from '../../core/Chart'
import type { ChartData, ChartConfig, ChartEventType, EventHandler, ThemeConfig } from '../../core/types'
import type { UseChartOptions, UseChartReturn, VueChartInstance } from '../types'
import { debounce } from '../../utils/helpers'

/**
 * 图表 Composable
 * 
 * @param options - 图表选项
 * @returns 图表管理对象
 * 
 * @example
 * ```typescript
 * const {
 *   chartRef,
 *   chartInstance,
 *   updateData,
 *   loading,
 *   error
 * } = useChart({
 *   type: 'line',
 *   data: chartData,
 *   config: { title: '销售趋势' }
 * })
 * ```
 */
export function useChart(options: UseChartOptions): UseChartReturn {
  // ============================================================================
  // 响应式状态
  // ============================================================================

  /** 图表容器引用 */
  const chartRef = ref<HTMLElement | null>(null)
  
  /** 图表实例 */
  const chartInstance = ref<VueChartInstance | null>(null)
  
  /** 加载状态 */
  const loading = ref(false)
  
  /** 错误信息 */
  const error = ref<string | Error | null>(null)
  
  /** 当前数据 */
  const currentData = ref<ChartData>(options.data || [])
  
  /** 当前配置 */
  const currentConfig = ref<Partial<ChartConfig>>(options.config || {})
  
  /** 当前主题 */
  const currentTheme = ref<string | ThemeConfig>(options.theme || 'light')

  // ============================================================================
  // 计算属性
  // ============================================================================

  /** 图表是否已准备就绪 */
  const ready = computed(() => {
    return chartInstance.value !== null && !loading.value && !error.value
  })

  // ============================================================================
  // 防抖函数
  // ============================================================================

  const debouncedUpdateData = debounce((data: ChartData) => {
    if (chartInstance.value) {
      try {
        chartInstance.value.updateData(data)
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }
  }, options.debounceDelay || 300)

  const debouncedUpdateConfig = debounce((config: Partial<ChartConfig>) => {
    if (chartInstance.value) {
      try {
        chartInstance.value.updateConfig(config)
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }
  }, options.debounceDelay || 300)

  const debouncedResize = debounce((width?: number, height?: number) => {
    if (chartInstance.value) {
      try {
        chartInstance.value.resize(width && height ? { width, height } : undefined)
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }
  }, options.debounceDelay || 300)

  // ============================================================================
  // 核心方法
  // ============================================================================

  /**
   * 初始化图表
   */
  const initChart = async () => {
    if (!chartRef.value) {
      error.value = new Error('图表容器未找到')
      return
    }

    try {
      loading.value = true
      error.value = null

      // 创建图表实例
      const instance = new Chart(chartRef.value, {
        type: options.type,
        data: currentData.value,
        ...currentConfig.value,
        theme: currentTheme.value
      }) as VueChartInstance

      // 添加 Vue 相关属性
      instance.vueComponent = getCurrentInstance()
      instance.watchers = []

      chartInstance.value = instance
      
      // 等待下一个 tick 确保 DOM 更新完成
      await nextTick()
      
      loading.value = false
    } catch (err) {
      loading.value = false
      error.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  /**
   * 销毁图表
   */
  const destroyChart = () => {
    if (chartInstance.value) {
      try {
        // 清理监听器
        if (chartInstance.value.watchers) {
          chartInstance.value.watchers.forEach(unwatch => unwatch())
          chartInstance.value.watchers = []
        }
        
        // 销毁图表实例
        chartInstance.value.dispose()
        chartInstance.value = null
      } catch (err) {
        console.error('销毁图表时发生错误:', err)
      }
    }
  }

  // ============================================================================
  // 公共 API 方法
  // ============================================================================

  /**
   * 更新图表数据
   */
  const updateData = (data: ChartData) => {
    currentData.value = data
    debouncedUpdateData(data)
  }

  /**
   * 更新图表配置
   */
  const updateConfig = (config: Partial<ChartConfig>) => {
    currentConfig.value = { ...currentConfig.value, ...config }
    debouncedUpdateConfig(currentConfig.value)
  }

  /**
   * 设置主题
   */
  const setTheme = (theme: string | ThemeConfig) => {
    currentTheme.value = theme
    if (chartInstance.value) {
      try {
        chartInstance.value.setTheme(theme)
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }
  }

  /**
   * 调整图表大小
   */
  const resize = (width?: number, height?: number) => {
    debouncedResize(width, height)
  }

  /**
   * 显示加载状态
   */
  const showLoading = (text?: string) => {
    if (chartInstance.value) {
      chartInstance.value.showLoading(text)
    }
    loading.value = true
  }

  /**
   * 隐藏加载状态
   */
  const hideLoading = () => {
    if (chartInstance.value) {
      chartInstance.value.hideLoading()
    }
    loading.value = false
  }

  /**
   * 清空图表
   */
  const clear = () => {
    if (chartInstance.value) {
      try {
        chartInstance.value.clear()
      } catch (err) {
        error.value = err instanceof Error ? err : new Error(String(err))
      }
    }
  }

  /**
   * 销毁图表
   */
  const dispose = () => {
    destroyChart()
  }

  /**
   * 导出图片
   */
  const exportImage = async (type: 'png' | 'jpeg' | 'svg' = 'png', options?: any): Promise<Blob> => {
    if (!chartInstance.value) {
      throw new Error('图表实例未初始化')
    }
    return chartInstance.value.exportImage(type, options)
  }

  /**
   * 导出 PDF
   */
  const exportPDF = async (options?: any): Promise<Blob> => {
    if (!chartInstance.value) {
      throw new Error('图表实例未初始化')
    }
    return chartInstance.value.exportPDF(options)
  }

  /**
   * 导出数据
   */
  const exportData = async (format: 'excel' | 'csv' | 'json' = 'excel', options?: any): Promise<Blob> => {
    if (!chartInstance.value) {
      throw new Error('图表实例未初始化')
    }
    return chartInstance.value.exportData(format, options)
  }

  /**
   * 注册事件监听器
   */
  const on = (eventType: ChartEventType, handler: EventHandler) => {
    if (chartInstance.value) {
      chartInstance.value.on(eventType, handler)
    }
  }

  /**
   * 移除事件监听器
   */
  const off = (eventType: ChartEventType, handler?: EventHandler) => {
    if (chartInstance.value) {
      chartInstance.value.off(eventType, handler)
    }
  }

  // ============================================================================
  // 生命周期钩子
  // ============================================================================

  onMounted(() => {
    if (options.immediate !== false) {
      initChart()
    }
  })

  onUnmounted(() => {
    destroyChart()
  })

  // ============================================================================
  // 响应式监听
  // ============================================================================

  // 监听容器变化，重新初始化图表
  watch(chartRef, (newRef, oldRef) => {
    if (newRef && newRef !== oldRef) {
      if (chartInstance.value) {
        destroyChart()
      }
      initChart()
    }
  })

  // 自动调整大小
  if (options.autoResize !== false) {
    // 这里可以添加 ResizeObserver 监听容器大小变化
    // 由于在 Vue 环境中，通常由父组件控制大小，所以暂时省略
  }

  // ============================================================================
  // 返回 API
  // ============================================================================

  return {
    chartRef,
    chartInstance: chartInstance as Ref<BaseChartInstance | null>,
    loading,
    error,
    ready,
    updateData,
    updateConfig,
    setTheme,
    resize,
    showLoading,
    hideLoading,
    clear,
    dispose,
    exportImage,
    exportPDF,
    exportData,
    on,
    off
  }
}

/**
 * 获取当前组件实例（兼容性处理）
 */
function getCurrentInstance() {
  try {
    // 尝试导入 Vue 的 getCurrentInstance
    const { getCurrentInstance: getVueInstance } = require('vue')
    return getVueInstance()
  } catch {
    // 如果导入失败，返回 null
    return null
  }
}
