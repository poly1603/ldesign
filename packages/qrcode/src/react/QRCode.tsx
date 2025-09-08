/**
 * React QR Code Component
 * 提供与Vue版本一致的API和功能
 */

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { useQRCode } from './useQRCode'
import { download } from '../helpers'

/**
 * QRCode组件的Props接口
 */
export interface QRCodeProps extends Partial<QRCodeOptions> {
  // 基础属性
  text?: string
  className?: string
  style?: React.CSSProperties
  
  // 显示选项
  showDownloadButton?: boolean
  downloadButtonText?: string
  downloadFilename?: string
  
  // 事件回调
  onGenerated?: (result: QRCodeResult) => void
  onError?: (error: QRCodeError) => void
  onDownload?: (result: QRCodeResult) => void
  
  // 加载状态自定义
  loadingComponent?: React.ReactNode
  errorComponent?: (error: QRCodeError) => React.ReactNode
}

/**
 * QRCode组件的引用接口
 */
export interface QRCodeRef {
  generate: (text?: string, options?: Partial<QRCodeOptions>) => Promise<QRCodeResult>
  regenerate: () => Promise<QRCodeResult>
  download: () => Promise<void>
  clearCache: () => void
  getMetrics: () => PerformanceMetric[]
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
  isLoading: boolean
  generator: any
}

/**
 * React QR Code Component
 * 
 * @example
 * ```tsx
 * // 基础使用
 * <QRCode 
 *   text="Hello World"
 *   size={200}
 *   format="canvas"
 * />
 * 
 * // 带下载功能
 * <QRCode 
 *   text="https://example.com"
 *   size={300}
 *   format="svg"
 *   showDownloadButton={true}
 *   downloadButtonText="下载二维码"
 *   onGenerated={(result) => console.log('Generated:', result)}
 * />
 * 
 * // 使用引用
 * const qrRef = useRef<QRCodeRef>(null)
 * 
 * <QRCode 
 *   ref={qrRef}
 *   text="Dynamic content"
 *   onError={(error) => console.error(error)}
 * />
 * 
 * // 手动生成
 * qrRef.current?.generate('New content')
 * ```
 */
export const QRCode = forwardRef<QRCodeRef, QRCodeProps>(({
  // 基础属性
  text,
  data,
  className = '',
  style = {},
  
  // 显示选项
  showDownloadButton = false,
  downloadButtonText = '下载二维码',
  downloadFilename = 'qrcode',
  
  // 事件回调
  onGenerated,
  onError,
  onDownload,
  
  // 加载状态自定义
  loadingComponent,
  errorComponent,
  
  // 其他QR码选项
  ...qrOptions
}, ref) => {
  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const svgRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 构建完整选项
  const options: QRCodeOptions = {
    data: text || data || '',
    size: 200,
    format: 'canvas',
    ...qrOptions,
  }

  // 使用Hook
  const {
    result,
    loading,
    error,
    generate,
    regenerate,
    clearCache,
    getMetrics,
    generator,
  } = useQRCode(options)

  // 处理下载
  const handleDownload = async () => {
    if (!result) return

    try {
      await download(result, downloadFilename)
      onDownload?.(result)
    } catch (err) {
      const qrError = err as QRCodeError
      onError?.(qrError)
    }
  }

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    generate,
    regenerate,
    download: handleDownload,
    clearCache,
    getMetrics,
    result,
    loading,
    error,
    isLoading: loading,
    generator,
  }), [generate, regenerate, handleDownload, clearCache, getMetrics, result, loading, error, generator])

  // 自动生成
  useEffect(() => {
    const textToGenerate = text || data
    if (textToGenerate && textToGenerate.trim()) {
      generate(textToGenerate)
    }
  }, [text, data, generate])

  // 事件处理
  useEffect(() => {
    if (result) {
      onGenerated?.(result)
      
      // 渲染到对应的元素
      if (options.format === 'canvas' && canvasRef.current && result.element) {
        const canvas = canvasRef.current
        const sourceCanvas = result.element as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = sourceCanvas.width
          canvas.height = sourceCanvas.height
          ctx.drawImage(sourceCanvas, 0, 0)
        }
      }
    }
  }, [result, onGenerated, options.format])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // 计算实际尺寸
  const actualWidth = options.size || 200
  const actualHeight = options.size || 200

  // 容器样式
  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    ...style,
  }

  // 渲染加载状态
  if (loading) {
    return (
      <div 
        ref={containerRef}
        className={`qrcode-container qrcode-loading ${className}`}
        style={containerStyle}
      >
        {loadingComponent || (
          <div className="qrcode-loading-default">
            <div>生成中...</div>
          </div>
        )}
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div 
        ref={containerRef}
        className={`qrcode-container qrcode-error ${className}`}
        style={containerStyle}
      >
        {errorComponent ? errorComponent(error) : (
          <div className="qrcode-error-default">
            <div>生成失败: {error.message}</div>
          </div>
        )}
      </div>
    )
  }

  // 渲染二维码内容
  return (
    <div 
      ref={containerRef}
      className={`qrcode-container ${className}`}
      style={containerStyle}
    >
      <div className="qrcode-content">
        {/* Canvas渲染 */}
        {options.format === 'canvas' && result && (
          <canvas
            ref={canvasRef}
            width={actualWidth}
            height={actualHeight}
            className="qrcode-canvas"
          />
        )}

        {/* SVG渲染 */}
        {options.format === 'svg' && result && (
          <div
            ref={svgRef}
            className="qrcode-svg"
            dangerouslySetInnerHTML={{ __html: result.data }}
          />
        )}

        {/* Image渲染 */}
        {options.format === 'image' && result && (
          <img
            ref={imageRef}
            src={result.data}
            width={actualWidth}
            height={actualHeight}
            alt={`QR Code: ${text || data}`}
            className="qrcode-image"
          />
        )}
      </div>

      {/* 下载按钮 */}
      {showDownloadButton && result && (
        <div className="qrcode-actions">
          <button
            type="button"
            onClick={handleDownload}
            className="qrcode-download-button"
          >
            {downloadButtonText}
          </button>
        </div>
      )}
    </div>
  )
})

QRCode.displayName = 'QRCode'
