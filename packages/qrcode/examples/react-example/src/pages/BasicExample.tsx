/**
 * React 基础二维码生成示例
 * 展示 @ldesign/qrcode 的基本使用方法
 */

import React, { useState, useRef, useEffect } from 'react'
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode'

const BasicExample: React.FC = () => {
  // 状态管理
  const [qrText, setQrText] = useState('https://github.com/ldesign/qrcode')
  const [qrSize, setQrSize] = useState(200)
  const [qrFormat, setQrFormat] = useState<'canvas' | 'svg' | 'image'>('canvas')
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [qrMargin, setQrMargin] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<QRCodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // DOM 引用
  const qrContainer = useRef<HTMLDivElement>(null)

  // 快速示例数据
  const quickExamples = [
    { label: '网站URL', text: 'https://www.ldesign.com', size: 200 },
    { label: '联系方式', text: 'tel:+86-138-0013-8000', size: 180 },
    { label: '邮箱地址', text: 'mailto:contact@ldesign.com', size: 200 },
    { label: '短文本', text: 'Hello LDesign!', size: 150 },
    { label: '长文本', text: '这是一个包含中文字符的长文本示例，用于测试二维码生成器对不同字符集的支持能力。', size: 250 }
  ]

  /**
   * 生成二维码
   */
  const generateQRCodeHandler = async (): Promise<void> => {
    if (!qrText.trim()) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const options: SimpleQRCodeOptions = {
        size: qrSize,
        format: qrFormat,
        errorCorrectionLevel: errorLevel,
        margin: qrMargin
      }

      const qrResult = await generateQRCode(qrText, options)
      setResult(qrResult)

      // 渲染二维码到容器
      if (qrContainer.current && qrResult.element) {
        qrContainer.current.innerHTML = ''
        qrContainer.current.appendChild(qrResult.element)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成二维码失败')
      console.error('二维码生成失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 下载二维码
   */
  const downloadQRCode = (): void => {
    if (!result) return

    try {
      const link = document.createElement('a')
      link.download = `qrcode-${Date.now()}.${qrFormat === 'svg' ? 'svg' : 'png'}`
      
      if (qrFormat === 'svg' && result.svg) {
        const blob = new Blob([result.svg], { type: 'image/svg+xml' })
        link.href = URL.createObjectURL(blob)
      } else if (result.dataURL) {
        link.href = result.dataURL
      }
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('下载失败:', err)
    }
  }

  /**
   * 加载快速示例
   */
  const loadExample = (example: typeof quickExamples[0]): void => {
    setQrText(example.text)
    setQrSize(example.size)
  }

  /**
   * 格式化时间
   */
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString()
  }

  // 初始生成
  useEffect(() => {
    generateQRCodeHandler()
  }, [])

  return (
    <div className="basic-example">
      <h2 className="section-title">基础二维码生成示例</h2>
      <p className="section-description">
        展示 @ldesign/qrcode 的基本使用方法，包括文本输入、格式选择和基本配置。
      </p>

      <div className="grid grid-2">
        {/* 配置面板 */}
        <div className="card">
          <h3 className="card-title">配置选项</h3>
          
          <div className="form-group">
            <label className="form-label">输入文本或URL</label>
            <textarea
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              className="form-input form-textarea"
              placeholder="请输入要生成二维码的文本或URL..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">二维码大小</label>
            <input
              type="range"
              min="100"
              max="500"
              step="10"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{qrSize}px</span>
          </div>

          <div className="form-group">
            <label className="form-label">输出格式</label>
            <select 
              value={qrFormat} 
              onChange={(e) => setQrFormat(e.target.value as 'canvas' | 'svg' | 'image')}
              className="form-input"
            >
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
              <option value="image">Image</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">错误纠正级别</label>
            <select 
              value={errorLevel} 
              onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              className="form-input"
            >
              <option value="L">L (低) - 约7%</option>
              <option value="M">M (中) - 约15%</option>
              <option value="Q">Q (四分位) - 约25%</option>
              <option value="H">H (高) - 约30%</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">边距</label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={qrMargin}
              onChange={(e) => setQrMargin(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{qrMargin}</span>
          </div>

          <div className="form-actions">
            <button 
              onClick={generateQRCodeHandler} 
              className="btn btn-primary" 
              disabled={!qrText.trim() || isLoading}
            >
              {isLoading ? '生成中...' : '生成二维码'}
            </button>
            <button 
              onClick={downloadQRCode} 
              className="btn" 
              disabled={!result}
            >
              下载二维码
            </button>
          </div>
        </div>

        {/* 预览面板 */}
        <div className="card">
          <h3 className="card-title">二维码预览</h3>
          
          <div className="qr-preview">
            {isLoading && (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>正在生成二维码...</p>
              </div>
            )}
            
            {error && (
              <div className="error">
                <p className="error-message">{error}</p>
                <button onClick={generateQRCodeHandler} className="btn btn-primary">重试</button>
              </div>
            )}
            
            {result && !isLoading && !error && (
              <div className="qr-result">
                <div className="qr-container" ref={qrContainer}></div>
                <div className="qr-info">
                  <p><strong>格式:</strong> {result.format}</p>
                  <p><strong>尺寸:</strong> {result.size}px</p>
                  <p><strong>生成时间:</strong> {formatTime(result.timestamp)}</p>
                  {result.fromCache && <p><strong>来源:</strong> 缓存</p>}
                </div>
              </div>
            )}
            
            {!result && !isLoading && !error && (
              <div className="placeholder">
                <div className="placeholder-icon">📱</div>
                <p>请输入文本并点击生成按钮</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快速示例 */}
      <div className="card">
        <h3 className="card-title">快速示例</h3>
        <div className="quick-examples">
          {quickExamples.map((example, index) => (
            <button
              key={index}
              onClick={() => loadExample(example)}
              className="btn example-btn"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BasicExample
