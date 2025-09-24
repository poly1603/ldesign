/**
 * React 样式定制示例
 * 展示 @ldesign/qrcode 的样式定制功能
 */

import React, { useState, useRef } from 'react'
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode'

const StyleExample: React.FC = () => {
  const [qrText, setQrText] = useState('https://www.ldesign.com/style-demo')
  const [qrSize, setQrSize] = useState(250)
  const [foregroundColor, setForegroundColor] = useState('#722ED1')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [margin, setMargin] = useState(4)
  const [isLoading, setIsLoading] = useState(false)

  const qrContainer = useRef<HTMLDivElement>(null)
  const presetContainer = useRef<HTMLDivElement>(null)

  // 预设样式
  const presetStyles = [
    {
      name: '经典',
      style: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff'
      }
    },
    {
      name: '现代',
      style: {
        foregroundColor: '#722ED1',
        backgroundColor: '#f1ecf9'
      }
    },
    {
      name: '渐变',
      style: {
        foregroundColor: '#722ED1',
        backgroundColor: '#ffffff'
      }
    },
    {
      name: '优雅',
      style: {
        foregroundColor: '#35165f',
        backgroundColor: '#f8f8f8'
      }
    }
  ]

  /**
   * 生成样式化二维码
   */
  const generateStyledQRCode = async (): Promise<void> => {
    if (!qrText.trim()) return

    setIsLoading(true)
    try {
      const options: SimpleQRCodeOptions = {
        size: qrSize,
        format: 'canvas',
        margin: margin,
        foregroundColor: foregroundColor,
        backgroundColor: backgroundColor
      }

      const qrResult = await generateQRCode(qrText, options)

      if (qrContainer.current && qrResult.element) {
        qrContainer.current.innerHTML = ''
        qrContainer.current.appendChild(qrResult.element)
      }
    } catch (err) {
      console.error('生成样式化二维码失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 生成预设样式对比
   */
  const generatePresetComparison = async (): Promise<void> => {
    if (!qrText.trim()) return

    setIsLoading(true)
    try {
      if (presetContainer.current) {
        presetContainer.current.innerHTML = ''

        for (const preset of presetStyles) {
          const options: SimpleQRCodeOptions = {
            size: 180,
            format: 'canvas',
            margin: 4,
            foregroundColor: preset.style.foregroundColor,
            backgroundColor: preset.style.backgroundColor
          }

          const result = await generateQRCode(qrText, options)

          if (result.element) {
            const wrapper = document.createElement('div')
            wrapper.className = 'preset-item'
            
            const title = document.createElement('h4')
            title.textContent = preset.name
            title.className = 'preset-title'
            wrapper.appendChild(title)
            
            wrapper.appendChild(result.element)
            
            const info = document.createElement('div')
            info.className = 'preset-info'
            info.innerHTML = `
              <p>前景: ${preset.style.foregroundColor}</p>
              <p>背景: ${preset.style.backgroundColor}</p>
            `
            wrapper.appendChild(info)
            
            presetContainer.current!.appendChild(wrapper)
          }
        }
      }
    } catch (err) {
      console.error('生成预设样式失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 应用预设样式
   */
  const applyPreset = (preset: typeof presetStyles[0]): void => {
    setForegroundColor(preset.style.foregroundColor)
    setBackgroundColor(preset.style.backgroundColor)
  }

  return (
    <div className="style-example">
      <h2 className="section-title">样式定制示例</h2>
      <p className="section-description">
        展示 @ldesign/qrcode 的样式定制功能，包括颜色、渐变、形状和边框等自定义选项。
      </p>

      <div className="grid grid-2">
        {/* 样式配置 */}
        <div className="card">
          <h3 className="card-title">样式配置</h3>
          
          <div className="form-group">
            <label className="form-label">二维码文本</label>
            <input
              type="text"
              value={qrText}
              onChange={(e) => setQrText(e.target.value)}
              className="form-input"
              placeholder="输入二维码内容..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">二维码大小</label>
            <input
              type="range"
              min="150"
              max="400"
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{qrSize}px</span>
          </div>

          <h4 className="subsection-title">颜色配置</h4>
          
          <div className="form-group">
            <label className="form-label">前景色</label>
            <div className="color-input-group">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="form-input color-text"
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">背景色</label>
            <div className="color-input-group">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="color-picker"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="form-input color-text"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">边距</label>
            <input
              type="range"
              min="0"
              max="20"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="form-range"
            />
            <span className="range-value">{margin}px</span>
          </div>

          <button 
            onClick={generateStyledQRCode} 
            className="btn btn-primary" 
            disabled={!qrText.trim() || isLoading}
          >
            生成样式化二维码
          </button>
        </div>

        {/* 样式预览 */}
        <div className="card">
          <h3 className="card-title">样式预览</h3>
          
          <div className="qr-preview">
            <div className="qr-container" ref={qrContainer}></div>
          </div>

          <div className="current-style-info">
            <h4 className="subsection-title">当前样式配置</h4>
            <div className="style-info">
              <p><strong>前景色:</strong> {foregroundColor}</p>
              <p><strong>背景色:</strong> {backgroundColor}</p>
              <p><strong>边距:</strong> {margin}px</p>
            </div>
          </div>

          <h4 className="subsection-title">预设样式</h4>
          <div className="preset-buttons">
            {presetStyles.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="btn preset-btn"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 样式对比 */}
      <div className="card">
        <h3 className="card-title">样式对比</h3>
        <button 
          onClick={generatePresetComparison} 
          className="btn btn-primary" 
          disabled={!qrText.trim() || isLoading}
        >
          生成对比示例
        </button>
        <div className="preset-comparison">
          <div className="preset-container" ref={presetContainer}></div>
        </div>
      </div>
    </div>
  )
}

export default StyleExample
