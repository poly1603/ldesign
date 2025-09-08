/**
 * React 高级功能示例
 * 展示 @ldesign/qrcode 的高级功能
 */

import React, { useState, useRef } from 'react'
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode'

const AdvancedExample: React.FC = () => {
  const [logoQRText, setLogoQRText] = useState('https://www.ldesign.com')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(50)
  const [batchText, setBatchText] = useState('https://www.ldesign.com\nhttps://github.com/ldesign\nmailto:contact@ldesign.com\ntel:+86-138-0013-8000\nLDesign 设计系统')
  const [batchSize, setBatchSize] = useState(150)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<QRCodeResult[]>([])

  const logoContainer = useRef<HTMLDivElement>(null)
  const batchContainer = useRef<HTMLDivElement>(null)

  /**
   * 处理 Logo 文件上传
   */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  /**
   * 生成带 Logo 的二维码
   */
  const generateLogoQRCode = async (): Promise<void> => {
    if (!logoQRText.trim()) return

    setIsLoading(true)
    try {
      const logoOptions = logoPreview ? {
        src: logoPreview,
        size: logoSize
      } : undefined

      const options: SimpleQRCodeOptions = {
        size: 250,
        format: 'canvas',
        errorCorrectionLevel: 'H', // 使用高纠错级别以支持 Logo
        logo: logoOptions
      }

      const result = await generateQRCode(logoQRText, options)
      
      if (logoContainer.current && result.element) {
        logoContainer.current.innerHTML = ''
        logoContainer.current.appendChild(result.element)
      }
    } catch (err) {
      console.error('生成带Logo二维码失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 批量生成二维码
   */
  const generateBatchQRCodes = async (): Promise<void> => {
    if (!batchText.trim()) return

    setIsLoading(true)
    setResults([])

    try {
      const texts = batchText.split('\n').filter(text => text.trim())
      const results: QRCodeResult[] = []

      // 逐个生成二维码
      for (const text of texts) {
        const result = await generateQRCode(text.trim(), {
          size: batchSize,
          format: 'canvas',
          errorCorrectionLevel: 'M'
        })
        results.push(result)
      }

      setResults(results)

      // 渲染到容器
      if (batchContainer.current) {
        batchContainer.current.innerHTML = ''
        results.forEach((result, index) => {
          if (result.element) {
            const wrapper = document.createElement('div')
            wrapper.className = 'batch-item'
            wrapper.appendChild(result.element)
            
            const label = document.createElement('p')
            label.textContent = texts[index]
            label.className = 'batch-label'
            wrapper.appendChild(label)
            
            batchContainer.current!.appendChild(wrapper)
          }
        })
      }
    } catch (err) {
      console.error('批量生成失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="advanced-example">
      <h2 className="section-title">高级功能示例</h2>
      <p className="section-description">
        展示 @ldesign/qrcode 的高级功能，包括 Logo 嵌入、批量生成、缓存管理和性能监控。
      </p>

      <div className="grid grid-2">
        {/* Logo 嵌入 */}
        <div className="card">
          <h3 className="card-title">Logo 嵌入</h3>
          
          <div className="form-group">
            <label className="form-label">二维码文本</label>
            <input
              type="text"
              value={logoQRText}
              onChange={(e) => setLogoQRText(e.target.value)}
              className="form-input"
              placeholder="输入二维码内容..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Logo 图片</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="form-input"
            />
            {logoPreview && (
              <div className="logo-preview">
                <img src={logoPreview} alt="Logo预览" style={{ maxWidth: '100px', maxHeight: '100px' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Logo 大小</label>
            <input
              type="range"
              min="20"
              max="100"
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{logoSize}px</span>
          </div>

          <button 
            onClick={generateLogoQRCode} 
            className="btn btn-primary" 
            disabled={!logoQRText.trim() || isLoading}
          >
            生成带Logo的二维码
          </button>

          <div className="qr-preview">
            <div className="qr-container" ref={logoContainer}></div>
          </div>
        </div>

        {/* 批量生成 */}
        <div className="card">
          <h3 className="card-title">批量生成</h3>
          
          <div className="form-group">
            <label className="form-label">批量文本 (每行一个)</label>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="form-input form-textarea"
              placeholder="输入多行文本，每行生成一个二维码..."
              rows={5}
            />
          </div>

          <div className="form-group">
            <label className="form-label">批量大小</label>
            <input
              type="range"
              min="100"
              max="300"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{batchSize}px</span>
          </div>

          <button 
            onClick={generateBatchQRCodes} 
            className="btn btn-primary" 
            disabled={!batchText.trim() || isLoading}
          >
            {isLoading ? '生成中...' : '批量生成'}
          </button>

          <div className="batch-results">
            <div className="batch-container" ref={batchContainer}></div>
            {results.length > 0 && (
              <p className="batch-info">
                成功生成 {results.length} 个二维码
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 缓存管理 */}
      <div className="card">
        <h3 className="card-title">缓存管理</h3>
        <div className="cache-actions">
          <button className="btn">查看缓存信息</button>
          <button className="btn">清空缓存</button>
          <button className="btn">测试缓存性能</button>
        </div>
        <p className="cache-info">
          缓存功能可以显著提升相同内容二维码的生成速度，减少重复计算。
        </p>
      </div>
    </div>
  )
}

export default AdvancedExample
