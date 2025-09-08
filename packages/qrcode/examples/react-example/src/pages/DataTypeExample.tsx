/**
 * React 数据类型示例
 * 展示 @ldesign/qrcode 支持的各种数据类型
 */

import React, { useState, useRef } from 'react'
import { generateQRCode, type QRCodeResult, type SimpleQRCodeOptions } from '@ldesign/qrcode'

interface DataType {
  id: string
  label: string
  icon: string
  defaultData: string
  description: string
}

const DataTypeExample: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('')
  const [currentData, setCurrentData] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const qrContainer = useRef<HTMLDivElement>(null)

  // 数据类型配置
  const dataTypes: DataType[] = [
    {
      id: 'url',
      label: 'URL链接',
      icon: '🌐',
      defaultData: 'https://www.ldesign.com',
      description: '网站链接、在线资源等'
    },
    {
      id: 'wifi',
      label: 'WiFi网络',
      icon: '📶',
      defaultData: 'WIFI:T:WPA;S:LDesign-Office;P:password123;H:false;',
      description: 'WiFi连接信息'
    },
    {
      id: 'contact',
      label: '联系人',
      icon: '👤',
      defaultData: 'BEGIN:VCARD\nVERSION:3.0\nFN:LDesign Team\nORG:LDesign\nTEL:+86-138-0013-8000\nEMAIL:contact@ldesign.com\nURL:https://www.ldesign.com\nEND:VCARD',
      description: '联系人名片信息'
    },
    {
      id: 'email',
      label: '邮件',
      icon: '📧',
      defaultData: 'mailto:contact@ldesign.com?subject=Hello&body=Hi there!',
      description: '预填写邮件内容'
    },
    {
      id: 'sms',
      label: '短信',
      icon: '💬',
      defaultData: 'sms:+86-138-0013-8000?body=Hello from LDesign!',
      description: '预填写短信内容'
    },
    {
      id: 'phone',
      label: '电话',
      icon: '📞',
      defaultData: 'tel:+86-138-0013-8000',
      description: '电话号码'
    },
    {
      id: 'location',
      label: '地理位置',
      icon: '📍',
      defaultData: 'geo:39.9042,116.4074',
      description: '地理坐标位置'
    },
    {
      id: 'text',
      label: '纯文本',
      icon: '📝',
      defaultData: 'Hello, this is a text message from LDesign!',
      description: '普通文本内容'
    }
  ]

  // 快速示例
  const quickExamples = [
    {
      icon: '🌐',
      title: '官网链接',
      description: 'LDesign官方网站',
      data: 'https://www.ldesign.com'
    },
    {
      icon: '📶',
      title: 'WiFi连接',
      description: '办公室WiFi信息',
      data: 'WIFI:T:WPA;S:LDesign-Office;P:***'
    },
    {
      icon: '👤',
      title: '联系名片',
      description: 'LDesign团队联系方式',
      data: 'BEGIN:VCARD...'
    },
    {
      icon: '📧',
      title: '发送邮件',
      description: '预填写邮件内容',
      data: 'mailto:contact@ldesign.com'
    },
    {
      icon: '📍',
      title: '地理位置',
      description: 'LDesign总部位置',
      data: 'geo:39.9042,116.4074'
    }
  ]

  /**
   * 选择数据类型
   */
  const selectDataType = (type: DataType): void => {
    setSelectedType(type.id)
    setCurrentData(type.defaultData)
  }

  /**
   * 生成二维码
   */
  const generateQRCodeHandler = async (): Promise<void> => {
    if (!currentData.trim()) return

    setIsLoading(true)
    try {
      const options: SimpleQRCodeOptions = {
        size: 250,
        format: 'canvas',
        errorCorrectionLevel: 'M'
      }

      const qrResult = await generateQRCode(currentData, options)

      if (qrContainer.current && qrResult.element) {
        qrContainer.current.innerHTML = ''
        qrContainer.current.appendChild(qrResult.element)
      }
    } catch (err) {
      console.error('生成二维码失败:', err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * 复制数据到剪贴板
   */
  const copyData = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(currentData)
      alert('数据已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  /**
   * 加载快速示例
   */
  const loadExample = (data: string): void => {
    setCurrentData(data)
    setSelectedType('')
  }

  return (
    <div className="datatype-example">
      <h2 className="section-title">数据类型示例</h2>
      <p className="section-description">
        展示 @ldesign/qrcode 支持的各种数据类型，包括URL、WiFi、联系人、地理位置、邮件等。
      </p>

      <div className="grid grid-2">
        {/* 数据类型选择 */}
        <div className="card">
          <h3 className="card-title">数据类型</h3>
          
          <div className="datatype-grid">
            {dataTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => selectDataType(type)}
                className={`datatype-btn ${selectedType === type.id ? 'active' : ''}`}
              >
                <div className="datatype-icon">{type.icon}</div>
                <div className="datatype-label">{type.label}</div>
              </button>
            ))}
          </div>

          {selectedType && (
            <div className="selected-type-info">
              <h4 className="subsection-title">
                {dataTypes.find(t => t.id === selectedType)?.label}
              </h4>
              <p className="type-description">
                {dataTypes.find(t => t.id === selectedType)?.description}
              </p>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">数据内容</label>
            <textarea
              value={currentData}
              onChange={(e) => setCurrentData(e.target.value)}
              className="form-input form-textarea"
              placeholder="请选择数据类型或直接输入内容..."
              rows={6}
            />
          </div>

          <div className="form-actions">
            <button 
              onClick={generateQRCodeHandler} 
              className="btn btn-primary" 
              disabled={!currentData.trim() || isLoading}
            >
              生成二维码
            </button>
            <button 
              onClick={copyData} 
              className="btn" 
              disabled={!currentData.trim()}
            >
              复制数据
            </button>
          </div>
        </div>

        {/* 二维码预览 */}
        <div className="card">
          <h3 className="card-title">二维码预览</h3>
          
          <div className="qr-preview">
            {isLoading && (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>正在生成二维码...</p>
              </div>
            )}
            
            {!isLoading && currentData && (
              <div className="qr-container" ref={qrContainer}></div>
            )}
            
            {!currentData && !isLoading && (
              <div className="placeholder">
                <div className="placeholder-icon">📱</div>
                <p>选择数据类型并填写信息</p>
              </div>
            )}
          </div>

          {currentData && (
            <div className="data-preview">
              <h4 className="subsection-title">数据预览</h4>
              <pre className="data-content">{currentData}</pre>
            </div>
          )}
        </div>
      </div>

      {/* 快速示例 */}
      <div className="card">
        <h3 className="card-title">快速示例</h3>
        <div className="quick-examples-grid">
          {quickExamples.map((example, index) => (
            <div
              key={index}
              onClick={() => loadExample(example.data)}
              className="example-card"
            >
              <div className="example-icon">{example.icon}</div>
              <h4 className="example-title">{example.title}</h4>
              <p className="example-description">{example.description}</p>
              <div className="example-data">{example.data}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DataTypeExample
