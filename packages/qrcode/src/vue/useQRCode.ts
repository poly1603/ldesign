import { ref, computed, onUnmounted, type Ref } from 'vue'
import { QRCodeGenerator } from '../core/generator'
import { downloadFile, createError } from '../utils'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric
} from '../types'

/**
 * Vue Hook for QRCode generation
 */
export interface UseQRCodeReturn {
  // 状态
  result: Ref<QRCodeResult | null>
  loading: Ref<boolean>
  error: Ref<QRCodeError | null>
  options: Ref<QRCodeOptions>

  // 计算属性
  isReady: Ref<boolean>
  dataURL: Ref<string | null>
  format: Ref<string | null>
  element: Ref<HTMLCanvasElement | SVGElement | HTMLImageElement | null>

  // 方法
  generate: (text: string, newOptions?: QRCodeOptions) => Promise<QRCodeResult>
  updateOptions: (newOptions: Partial<QRCodeOptions>) => void
  regenerate: () => Promise<QRCodeResult | null>
  download: (result?: QRCodeResult, filename?: string) => Promise<void>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  clearMetrics: () => void
  getCacheStats: () => { size: number; maxSize: number }
  reset: () => void
  destroy: () => void
}

/**
 * 主要的二维码Hook
 */
export function useQRCode(initialOptions?: QRCodeOptions): UseQRCodeReturn {
  // 状态
  const result = ref<QRCodeResult | null>(null)
  const loading = ref(false)
  const error = ref<QRCodeError | null>(null)
  const options = ref<QRCodeOptions>(initialOptions || { data: '', size: 200, format: 'canvas' })

  // 生成器实例
  const generator = new QRCodeGenerator(initialOptions)

  // 计算属性
  const isReady = computed(() => !!result.value && !loading.value)
  const dataURL = computed(() => result.value?.dataURL || null)
  const format = computed(() => result.value?.format || null)
  const element = computed(() => result.value?.element || null)

  /**
   * 生成二维码
   */
  const generate = async (
    text?: string,
    newOptions?: QRCodeOptions
  ): Promise<QRCodeResult> => {
    const finalText = text || options.value.data || ''
    if (!finalText.trim()) {
      throw createError('Text cannot be empty', 'INVALID_TEXT')
    }

    loading.value = true
    error.value = null

    try {
      const finalOptions = { ...options.value, ...newOptions }
      const qrResult = await generator.generate(finalText, finalOptions)

      result.value = qrResult
      return qrResult
    } catch (err) {
      const qrError = err instanceof Error
        ? createError(err.message, 'GENERATION_ERROR')
        : createError('An unknown error occurred', 'UNKNOWN_ERROR')

      error.value = qrError
      throw qrError
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新选项
   */
  const updateOptions = (newOptions: Partial<QRCodeOptions>): void => {
    options.value = { ...options.value, ...newOptions }
  }

  /**
   * 重新生成（使用当前结果的文本和选项）
   */
  const regenerate = async (): Promise<QRCodeResult | null> => {
    const text = result.value?.text || options.value.data
    if (!text) {
      throw createError('No text available for regeneration', 'NO_TEXT')
    }

    return await generate(text)
  }

  /**
   * 下载二维码
   */
  const download = async (
    downloadResult?: QRCodeResult,
    filename?: string
  ): Promise<void> => {
    const targetResult = downloadResult || result.value
    if (!targetResult) {
      throw createError('No result to download', 'NO_RESULT')
    }

    try {
      const finalFilename = filename || 'qrcode'
      await downloadFile(targetResult.dataURL || '', finalFilename, targetResult.format)
    } catch (err) {
      throw createError(`Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`, 'DOWNLOAD_ERROR')
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = (): void => {
    generator.clearCache()
  }

  /**
   * 获取性能指标
   */
  const getMetrics = (): PerformanceMetric[] => {
    return generator.getPerformanceMetrics()
  }

  /**
   * 清除性能指标
   */
  const clearMetrics = (): void => {
    generator.clearPerformanceMetrics()
  }

  /**
   * 获取缓存统计
   */
  const getCacheStats = (): { size: number; maxSize: number } => {
    return generator.getCacheStats()
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    result.value = null
    loading.value = false
    error.value = null
  }

  /**
   * 销毁Hook
   */
  const destroy = (): void => {
    reset()
    generator.destroy()
  }

  // 组件卸载时清理
  onUnmounted(() => {
    destroy()
  })

  return {
    // 状态
    result: result as Ref<QRCodeResult | null>,
    loading: loading as Ref<boolean>,
    error: error as Ref<QRCodeError | null>,
    options: options as Ref<QRCodeOptions>,

    // 计算属性
    isReady,
    dataURL,
    format,
    element,

    // 方法
    generate,
    updateOptions,
    regenerate,
    download,
    clearCache,
    getMetrics,
    clearMetrics,
    getCacheStats,
    reset,
    destroy
  }
}

/**
 * 简化版Hook - 只用于生成
 */
export function useQRCodeGenerator() {
  const generator = new QRCodeGenerator()

  const generate = async (
    text: string,
    options?: QRCodeOptions
  ): Promise<QRCodeResult> => {
    return await generator.generate(text, options || {})
  }

  const download = async (
    result: QRCodeResult,
    filename?: string
  ): Promise<void> => {
    const finalFilename = filename || 'qrcode'
    await downloadFile(result.dataURL || '', finalFilename, result.format)
  }

  return {
    generate,
    download,
    clearCache: () => generator.clearCache(),
    getMetrics: () => generator.getPerformanceMetrics(),
    destroy: () => generator.destroy()
  }
}

/**
 * 响应式二维码Hook
 */
export function useReactiveQRCode(
  text: Ref<string>,
  options?: Ref<QRCodeOptions> | QRCodeOptions
) {
  const qrCode = useQRCode()
  const optionsRef = ref(options || { data: '', size: 200, format: 'canvas' })

  // 监听文本和选项变化
  const { watchEffect } = require('vue')

  watchEffect(async () => {
    if (text.value.trim()) {
      try {
        await qrCode.generate(text.value, optionsRef.value as QRCodeOptions)
      } catch (err) {
        console.error('QRCode generation failed:', err)
      }
    }
  })

  return qrCode
}

/**
 * 批量生成Hook
 */
export function useBatchQRCode() {
  const generator = new QRCodeGenerator({
    enableCache: true
  })

  const generateBatch = async (
    items: Array<{ text: string; options?: QRCodeOptions; id?: string }>
  ): Promise<Array<QRCodeResult & { id?: string }>> => {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const result = await generator.generate(item.text, item.options || {})
        return { ...result, id: item.id }
      })
    )

    return results.flatMap(r => r.status === 'fulfilled' ? [r.value] : [])
  }

  return {
    generateBatch,
    clearCache: () => generator.clearCache(),
    getMetrics: () => generator.getPerformanceMetrics(),
    destroy: () => generator.destroy()
  }
}
