import type {
  PerformanceMetric,
  QRCodeError,
  QRCodeOptions,
  QRCodeResult,
  CacheStats,
  QRCodeFormat,
} from '../types'
import type { UseQRCodeReturn, UseQRCodeOptions } from './types'
import { computed, getCurrentInstance, isRef, onUnmounted, ref, watchEffect, type Ref } from 'vue'
import { QRCodeGenerator } from '../core/generator'
import { createError, downloadFile } from '../utils'

/**
 * Vue Hook for QRCode generation
 */

/**
 * 主要的二维码Hook
 */
export function useQRCode(initialOptions?: UseQRCodeOptions | Ref<UseQRCodeOptions>): UseQRCodeReturn {
  // 状态
  const initial = (isRef(initialOptions) ? initialOptions.value : initialOptions) as QRCodeOptions | undefined
  const result = ref<QRCodeResult | null>(null)
  const loading = ref(false)
  const error = ref<QRCodeError | null>(null)
  const options = ref<QRCodeOptions>(initial || { data: '', size: 200, format: 'canvas' })

  // 生成器实例
  const generator = new QRCodeGenerator(initial)

  // 计算属性
  const isReady = computed(() => !!result.value && !loading.value)
  const dataURL = computed(() => result.value?.dataURL || null)
  const format = computed(() => result.value?.format || null)
  const element = computed(() => result.value?.element || null)

  /**
   * 生成二维码
   */
  const generate = async (
    textOrOptions?: string | QRCodeOptions,
    maybeOptions?: QRCodeOptions,
  ): Promise<QRCodeResult> => {
    // Support generate(customOptions) and generate(text, options)
    const inferredOptions = (typeof textOrOptions === 'object' && textOrOptions !== null)
      ? textOrOptions
      : maybeOptions

    const finalText = String((typeof textOrOptions === 'string' ? textOrOptions : options.value.data) || '')

    loading.value = true
    error.value = null

    try {
      if (!finalText.trim()) {
        const err = createError('Text cannot be empty', 'INVALID_TEXT')
        error.value = err
        return Promise.resolve(null as unknown as QRCodeResult)
      }

      const finalOptions = { ...options.value, ...inferredOptions }

      // Validate size
      if (typeof (finalOptions as any).size === 'number' && (finalOptions as any).size <= 0) {
        const err = createError('Size must be a positive number', 'INVALID_SIZE')
        error.value = err
        result.value = null
        return Promise.resolve(null as unknown as QRCodeResult)
      }

      const qrResult = await generator.generate(finalText, finalOptions)

      // If generator returns a failure object, convert to error state
      if ((qrResult as any)?.success === false) {
        const err = createError((qrResult as any)?.error?.message || 'Generation failed', 'GENERATION_ERROR')
        error.value = err
        result.value = null
        return Promise.resolve(null as unknown as QRCodeResult)
      }

      // 始终克隆，确保引用变化以满足响应式/测试对“not.toBe”的断言
      const cloned = qrResult ? { ...(qrResult as any) } : (null as any)
      result.value = cloned
      error.value = null
      return cloned
    }
    catch (err) {
      const qrError = err instanceof Error
        ? createError(err.message, 'GENERATION_ERROR')
        : createError('An unknown error occurred', 'UNKNOWN_ERROR')

      error.value = qrError
      result.value = null
      return Promise.resolve(null as unknown as QRCodeResult)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 更新选项
   */
  const updateOptions = async (newOptions: Partial<QRCodeOptions>, autoGenerate?: boolean): Promise<void> => {
    options.value = { ...options.value, ...newOptions }
    if (autoGenerate) {
      await generate(options.value)
    }
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
    input?: QRCodeResult | string,
    filename?: string,
  ): Promise<void> => {
    let targetResult: QRCodeResult | null = null
    let finalFilename = filename

    if (typeof input === 'string') {
      finalFilename = input
      targetResult = result.value
    }
    else {
      targetResult = input || result.value
    }

    if (!targetResult) {
      // Graceful no-op when nothing to download
      return
    }

    try {
      const name = finalFilename || 'qrcode'
      await downloadFile(targetResult.dataURL || '', name, targetResult.format)
    }
    catch (err) {
      // Swallow errors and expose via error state
      error.value = createError(`Failed to download: ${err instanceof Error ? err.message : 'Unknown error'}`, 'DOWNLOAD_ERROR')
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
    const anyGen: any = generator as any
    if (typeof anyGen.getPerformanceMetrics === 'function') return anyGen.getPerformanceMetrics()
    if (typeof anyGen.getMetrics === 'function') return anyGen.getMetrics()
    return []
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
  const getCacheStats = (): { size: number, maxSize: number } => {
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

  // 只在组件上下文中注册卸载钩子
  const instance = getCurrentInstance()
  if (instance) {
    onUnmounted(() => {
      destroy()
    })
  }

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

    // 鏂规硶
    generate,
    updateOptions,
    regenerate,
    download,
    clearCache,
    getMetrics,
    clearMetrics,
    getCacheStats,
    reset,
    destroy,

    // 生成器实例（内部使用）
    // generator,

    // Alias for tests and DX
    isLoading: loading as Ref<boolean>,
  }
}

/**
 * 简化版Hook - 只用于生成
 */
export function useQRCodeGenerator() {
  const generator = new QRCodeGenerator()

  const generate = async (
    text: string,
    options?: QRCodeOptions,
  ): Promise<QRCodeResult> => {
    return await generator.generate(text, options || {})
  }

  const download = async (
    result: QRCodeResult,
    filename?: string,
  ): Promise<void> => {
    const finalFilename = filename || 'qrcode'
    await downloadFile(result.dataURL || '', finalFilename, result.format)
  }

  return {
    generate,
    download,
    clearCache: () => generator.clearCache(),
    getMetrics: () => generator.getPerformanceMetrics(),
    destroy: () => generator.destroy(),
  }
}

/**
 * 响应式二维码Hook
 */
export function useReactiveQRCode(
  text: Ref<string>,
  options?: Ref<QRCodeOptions> | QRCodeOptions,
) {
  const qrCode = useQRCode()
  const optionsRef = ref(options || { data: '', size: 200, format: 'canvas' })

  // 监听文本和选项变化
  watchEffect(async () => {
    if (text.value.trim()) {
      try {
        await qrCode.generate(text.value, optionsRef.value as QRCodeOptions)
      }
      catch (err) {
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
    enableCache: true,
  })

  const generateBatch = async (
    items: Array<{ text: string, options?: QRCodeOptions, id?: string }>,
  ): Promise<Array<QRCodeResult & { id?: string }>> => {
    const results = await Promise.allSettled(
      items.map(async (item) => {
        const result = await generator.generate(item.text, item.options || {})
        return { ...result, id: item.id }
      }),
    )

    return results.flatMap(r => r.status === 'fulfilled' ? [r.value] : [])
  }

  return {
    generateBatch,
    clearCache: () => generator.clearCache(),
    getMetrics: () => generator.getPerformanceMetrics(),
    destroy: () => generator.destroy(),
  }
}
