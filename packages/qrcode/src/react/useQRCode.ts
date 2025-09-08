/**
 * React Hook for QR Code generation
 * 提供与Vue版本一致的API
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { QRCodeGenerator } from '../core/generator'
import { createError, getDefaultOptions } from '../utils'

/**
 * useQRCode Hook的返回类型
 */
export interface UseQRCodeReturn {
  // 状态
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
  
  // 方法
  generate: (text?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  regenerate: () => Promise<QRCodeResult>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  
  // 生成器实例
  generator: QRCodeGenerator
}

/**
 * React Hook for QR Code generation
 * 
 * @param initialOptions - 初始配置选项
 * @returns Hook返回对象
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { result, loading, error, generate } = useQRCode({
 *     data: 'Hello World',
 *     size: 200,
 *     format: 'canvas'
 *   })
 * 
 *   useEffect(() => {
 *     generate()
 *   }, [])
 * 
 *   if (loading) return <div>Loading...</div>
 *   if (error) return <div>Error: {error.message}</div>
 *   
 *   return <div>QR Code generated!</div>
 * }
 * ```
 */
export function useQRCode(initialOptions: QRCodeOptions): UseQRCodeReturn {
  // 状态管理
  const [result, setResult] = useState<QRCodeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<QRCodeError | null>(null)
  
  // 生成器实例引用
  const generatorRef = useRef<QRCodeGenerator>()
  const optionsRef = useRef<QRCodeOptions>(initialOptions)

  // 初始化生成器
  useEffect(() => {
    const options = { ...getDefaultOptions(), ...initialOptions }
    generatorRef.current = new QRCodeGenerator(options)
    optionsRef.current = options

    // 清理函数
    return () => {
      if (generatorRef.current) {
        generatorRef.current.destroy()
      }
    }
  }, [])

  // 更新选项
  useEffect(() => {
    if (generatorRef.current) {
      const newOptions = { ...optionsRef.current, ...initialOptions }
      generatorRef.current.updateOptions(newOptions)
      optionsRef.current = newOptions
    }
  }, [initialOptions])

  /**
   * 生成二维码
   */
  const generate = useCallback(async (
    text?: string,
    newOptions?: Partial<QRCodeOptions>,
  ): Promise<QRCodeResult> => {
    if (!generatorRef.current) {
      throw createError('Generator not initialized', 'GENERATOR_NOT_INITIALIZED')
    }

    const finalText = String(text || optionsRef.current.data || '')
    if (!finalText.trim()) {
      throw createError('Text cannot be empty', 'INVALID_TEXT')
    }

    setLoading(true)
    setError(null)

    try {
      // 如果提供了新选项，临时更新
      if (newOptions) {
        generatorRef.current.updateOptions(newOptions)
      }

      const qrResult = await generatorRef.current.generate(finalText)
      setResult(qrResult)
      return qrResult
    } catch (err) {
      const qrError = err as QRCodeError
      setError(qrError)
      throw qrError
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * 重新生成二维码
   */
  const regenerate = useCallback(async (): Promise<QRCodeResult> => {
    return await generate()
  }, [generate])

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    if (generatorRef.current) {
      generatorRef.current.clearCache()
    }
  }, [])

  /**
   * 获取性能指标
   */
  const getMetrics = useCallback((): PerformanceMetric[] => {
    if (generatorRef.current) {
      return generatorRef.current.getPerformanceMetrics()
    }
    return []
  }, [])

  return {
    result,
    loading,
    error,
    generate,
    regenerate,
    clearCache,
    getMetrics,
    generator: generatorRef.current!,
  }
}

/**
 * 简化版的useQRCode Hook，用于快速生成
 * 
 * @param text - 要编码的文本
 * @param options - 配置选项
 * @returns 简化的Hook返回对象
 * 
 * @example
 * ```tsx
 * function SimpleComponent() {
 *   const { result, loading } = useQRCodeSimple('Hello World', {
 *     size: 150,
 *     format: 'svg'
 *   })
 * 
 *   if (loading) return <div>Generating...</div>
 *   
 *   return <div dangerouslySetInnerHTML={{ __html: result?.data || '' }} />
 * }
 * ```
 */
export function useQRCodeSimple(
  text: string,
  options: Partial<QRCodeOptions> = {},
): Pick<UseQRCodeReturn, 'result' | 'loading' | 'error'> {
  const fullOptions: QRCodeOptions = {
    ...getDefaultOptions(),
    ...options,
    data: text,
  }

  const { result, loading, error, generate } = useQRCode(fullOptions)

  // 自动生成
  useEffect(() => {
    if (text.trim()) {
      generate(text)
    }
  }, [text, generate])

  return { result, loading, error }
}
