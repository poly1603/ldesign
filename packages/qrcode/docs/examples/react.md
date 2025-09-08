# React使用示例

## 基础使用

### 组件方式

```jsx
import React from 'react'
import { QRCode } from '@ldesign/qrcode/react'

function BasicExample() {
  const handleGenerated = (result) => {
    console.log('二维码生成成功:', result)
  }

  const handleError = (error) => {
    console.error('生成失败:', error)
  }

  return (
    <div>
      <h2>基础二维码</h2>
      <QRCode 
        text="Hello React!"
        size={200}
        format="canvas"
      />
      
      <h2>带下载功能</h2>
      <QRCode 
        text="https://reactjs.org"
        size={300}
        format="svg"
        showDownloadButton={true}
        downloadButtonText="下载二维码"
        downloadFilename="react-qrcode"
        onGenerated={handleGenerated}
        onError={handleError}
      />
    </div>
  )
}

export default BasicExample
```

### Hook方式

```jsx
import React, { useState, useEffect, useRef } from 'react'
import { useQRCode } from '@ldesign/qrcode/react'

function HookExample() {
  const [inputText, setInputText] = useState('Hello React Hook!')
  const containerRef = useRef(null)

  const { result, loading, error, generate, regenerate, clearCache } = useQRCode({
    data: inputText,
    size: 250,
    format: 'canvas',
    color: {
      foreground: '#2563eb',
      background: '#f8fafc'
    }
  })

  // 渲染结果到容器
  useEffect(() => {
    if (result && containerRef.current) {
      containerRef.current.innerHTML = ''
      containerRef.current.appendChild(result.element)
    }
  }, [result])

  const handleInputChange = (e) => {
    setInputText(e.target.value)
  }

  const handleGenerate = () => {
    if (inputText.trim()) {
      generate(inputText)
    }
  }

  return (
    <div>
      <input 
        type="text"
        value={inputText}
        onChange={handleInputChange}
        placeholder="输入要生成的文本"
        onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
      />
      
      {loading && <div>生成中...</div>}
      {error && <div>错误: {error.message}</div>}
      {result && <div ref={containerRef}></div>}
      
      <div>
        <button onClick={handleGenerate} disabled={loading}>
          生成
        </button>
        <button onClick={regenerate} disabled={loading}>
          重新生成
        </button>
        <button onClick={clearCache}>
          清除缓存
        </button>
      </div>
    </div>
  )
}

export default HookExample
```

### 使用useRef访问组件方法

```jsx
import React, { useRef, useState } from 'react'
import { QRCode } from '@ldesign/qrcode/react'

function RefExample() {
  const qrRef = useRef(null)
  const [text, setText] = useState('Hello Ref!')

  const handleGenerate = async () => {
    if (qrRef.current) {
      try {
        const result = await qrRef.current.generate(text)
        console.log('生成成功:', result)
      } catch (error) {
        console.error('生成失败:', error)
      }
    }
  }

  const handleDownload = async () => {
    if (qrRef.current) {
      try {
        await qrRef.current.download()
        console.log('下载成功')
      } catch (error) {
        console.error('下载失败:', error)
      }
    }
  }

  const getMetrics = () => {
    if (qrRef.current) {
      const metrics = qrRef.current.getMetrics()
      console.log('性能指标:', metrics)
    }
  }

  return (
    <div>
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文本"
      />
      
      <QRCode 
        ref={qrRef}
        text={text}
        size={250}
        format="canvas"
      />
      
      <div>
        <button onClick={handleGenerate}>手动生成</button>
        <button onClick={handleDownload}>下载</button>
        <button onClick={getMetrics}>查看性能</button>
      </div>
    </div>
  )
}

export default RefExample
```

## 高级功能

### 响应式二维码组件

```jsx
import React, { useState, useMemo } from 'react'
import { QRCode } from '@ldesign/qrcode/react'

function ResponsiveQRCode() {
  const [text, setText] = useState('https://reactjs.org')
  const [size, setSize] = useState(300)
  const [format, setFormat] = useState('svg')
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [enableLogo, setEnableLogo] = useState(false)

  const colorOptions = useMemo(() => ({
    foreground: foregroundColor,
    background: backgroundColor
  }), [foregroundColor, backgroundColor])

  const logoOptions = useMemo(() => 
    enableLogo ? {
      src: '/logo.png',
      size: size * 0.2,
      shape: 'circle'
    } : undefined,
    [enableLogo, size]
  )

  const styleOptions = useMemo(() => ({
    dotStyle: 'rounded',
    cornerStyle: 'circle'
  }), [])

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
      <div style={{ flexShrink: 0 }}>
        <QRCode 
          text={text}
          size={size}
          format={format}
          color={colorOptions}
          logo={logoOptions}
          style={styleOptions}
        />
      </div>
      
      <div style={{ flex: 1, maxWidth: '300px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            文本内容:
          </label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            尺寸: {size}px
          </label>
          <input 
            type="range"
            min="100"
            max="500"
            step="10"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            格式:
          </label>
          <select 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
            <option value="image">Image</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            前景色:
          </label>
          <input 
            type="color"
            value={foregroundColor}
            onChange={(e) => setForegroundColor(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            背景色:
          </label>
          <input 
            type="color"
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox"
              checked={enableLogo}
              onChange={(e) => setEnableLogo(e.target.checked)}
            />
            启用Logo
          </label>
        </div>
      </div>
    </div>
  )
}

export default ResponsiveQRCode
```

### 批量生成组件

```jsx
import React, { useState } from 'react'
import { QRCode, useQRCodeSimple } from '@ldesign/qrcode/react'

function BatchGenerator() {
  const [textList, setTextList] = useState(`https://reactjs.org
https://github.com/facebook/react
https://vitejs.dev
https://nextjs.org`)
  
  const [batchSize, setBatchSize] = useState(150)
  const [batchFormat, setBatchFormat] = useState('svg')
  const [results, setResults] = useState([])
  const [generating, setGenerating] = useState(false)

  const generateBatch = async () => {
    const texts = textList
      .split('\n')
      .map(text => text.trim())
      .filter(text => text.length > 0)
    
    if (texts.length === 0) return
    
    setGenerating(true)
    setResults([])
    
    try {
      // 使用Promise.all并行生成
      const batchResults = await Promise.all(
        texts.map(async (text, index) => {
          // 这里可以使用批量生成API
          return { text, index }
        })
      )
      
      setResults(batchResults)
    } catch (error) {
      console.error('批量生成失败:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>批量二维码生成</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <textarea 
          value={textList}
          onChange={(e) => setTextList(e.target.value)}
          placeholder="每行一个文本，将生成对应的二维码"
          rows={6}
          style={{ 
            width: '100%', 
            padding: '1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}
        />
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            尺寸:
            <input 
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              min="100"
              max="500"
              style={{ padding: '0.5rem' }}
            />
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            格式:
            <select 
              value={batchFormat}
              onChange={(e) => setBatchFormat(e.target.value)}
              style={{ padding: '0.5rem' }}
            >
              <option value="canvas">Canvas</option>
              <option value="svg">SVG</option>
            </select>
          </label>
          
          <button 
            onClick={generateBatch}
            disabled={generating}
            style={{
              padding: '0.5rem 1rem',
              background: generating ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: generating ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? '生成中...' : '批量生成'}
          </button>
        </div>
      </div>
      
      {results.length > 0 && (
        <div>
          <h3>生成结果 ({results.length}个)</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {results.map((item, index) => (
              <QRCodeItem 
                key={index}
                text={item.text}
                size={batchSize}
                format={batchFormat}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 单个二维码项组件
function QRCodeItem({ text, size, format, index }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '1rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem'
    }}>
      <QRCode 
        text={text}
        size={size}
        format={format}
        showDownloadButton={true}
        downloadFilename={`qrcode-${index + 1}`}
      />
      <p style={{
        marginTop: '0.5rem',
        fontSize: '0.875rem',
        color: '#6b7280',
        wordBreak: 'break-all'
      }}>
        {text}
      </p>
    </div>
  )
}

export default BatchGenerator
```

## 自定义Hook

### 二维码历史管理Hook

```jsx
import { useState, useCallback, useRef } from 'react'
import { useQRCode } from '@ldesign/qrcode/react'

function useQRCodeHistory(initialOptions = {}, maxHistory = 10) {
  const [history, setHistory] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const historyRef = useRef([])
  
  const { result, loading, error, generate, clearCache } = useQRCode(initialOptions)

  // 添加到历史记录
  const addToHistory = useCallback((result) => {
    const newItem = {
      result,
      timestamp: Date.now(),
      text: result.data
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(newItem)
      
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory)
      }
      
      historyRef.current = newHistory
      return newHistory
    })
    
    setCurrentIndex(prev => Math.min(prev + 1, maxHistory - 1))
  }, [currentIndex, maxHistory])

  // 监听结果变化
  React.useEffect(() => {
    if (result) {
      addToHistory(result)
    }
  }, [result, addToHistory])

  // 撤销
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  // 重做
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, history.length])

  // 清除历史
  const clearHistory = useCallback(() => {
    setHistory([])
    setCurrentIndex(-1)
    historyRef.current = []
  }, [])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1
  const currentHistory = history[currentIndex]

  return {
    // 基础功能
    result,
    loading,
    error,
    generate,
    clearCache,
    
    // 历史管理
    history,
    currentHistory,
    currentIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory
  }
}

export default useQRCodeHistory
```

### 使用历史管理Hook

```jsx
import React, { useState, useRef, useEffect } from 'react'
import useQRCodeHistory from './useQRCodeHistory'

function QRCodeManager() {
  const [inputText, setInputText] = useState('Hello History!')
  const containerRef = useRef(null)

  const {
    result,
    loading,
    error,
    generate,
    history,
    currentHistory,
    currentIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory
  } = useQRCodeHistory({
    size: 250,
    format: 'svg'
  })

  // 渲染当前历史记录
  useEffect(() => {
    if (currentHistory && containerRef.current) {
      containerRef.current.innerHTML = ''
      const element = currentHistory.result.element.cloneNode(true)
      containerRef.current.appendChild(element)
    }
  }, [currentHistory])

  const handleGenerate = () => {
    if (inputText.trim()) {
      generate(inputText)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入文本"
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          style={{ 
            padding: '0.5rem', 
            marginRight: '1rem',
            width: '300px'
          }}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading}
          style={{ padding: '0.5rem 1rem' }}
        >
          {loading ? '生成中...' : '生成'}
        </button>
        
        <div style={{ marginTop: '1rem' }}>
          <button onClick={undo} disabled={!canUndo}>撤销</button>
          <button onClick={redo} disabled={!canRedo}>重做</button>
          <button onClick={clearHistory}>清除历史</button>
          <span style={{ marginLeft: '1rem' }}>
            {currentIndex + 1} / {history.length}
          </span>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          {error && <div style={{ color: 'red' }}>错误: {error.message}</div>}
          {currentHistory && (
            <div>
              <div ref={containerRef}></div>
              <p>生成时间: {formatTime(currentHistory.timestamp)}</p>
            </div>
          )}
        </div>
        
        <div style={{ width: '200px' }}>
          <h3>历史记录</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {history.map((item, index) => (
              <div 
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.25rem',
                  marginBottom: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: index === currentIndex ? '#e5e7eb' : 'white'
                }}
              >
                <small>{formatTime(item.timestamp)}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QRCodeManager
```
