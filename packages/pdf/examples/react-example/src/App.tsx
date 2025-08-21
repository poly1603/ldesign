import type { PdfViewerConfig } from './types'
import React, { useCallback, useState } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FileUpload } from './components/FileUpload'
import { PdfViewer } from './components/PdfViewer'
import './App.css'

/**
 * 主应用组件
 * 演示PDF查看器的完整功能和集成方式
 */
function App() {
  // 当前加载的PDF文件
  const [currentFile, setCurrentFile] = useState<File | null>(null)

  // 主题配置
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // PDF查看器配置
  const [config, setConfig] = useState<PdfViewerConfig>({
    enableSearch: true,
    enableThumbnails: false,
    enableDownload: true,
    enablePrint: true,
    initialZoom: 'fit-width',
    theme: 'light',
  })

  // 处理文件上传
  const handleFileUpload = useCallback((file: File) => {
    console.log('文件上传:', file.name, file.size)
    setCurrentFile(file)
  }, [])

  // 处理文件上传错误
  const handleFileError = useCallback((error: string) => {
    console.error('文件上传错误:', error)
    alert(`文件上传失败: ${error}`)
  }, [])

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setConfig(prev => ({ ...prev, theme: newTheme }))
  }, [theme])

  // 切换缩略图显示
  const toggleThumbnails = useCallback(() => {
    setConfig(prev => ({ ...prev, enableThumbnails: !prev.enableThumbnails }))
  }, [])

  // 重置应用状态
  const handleReset = useCallback(() => {
    setCurrentFile(null)
    setConfig({
      enableSearch: true,
      enableThumbnails: false,
      enableDownload: true,
      enablePrint: true,
      initialZoom: 'fit-width',
      theme,
    })
  }, [theme])

  return (
    <ErrorBoundary>
      <div className={`app ${theme}`}>
        {/* 应用头部 */}
        <header className="app__header">
          <div className="app__header-content">
            <h1 className="app__title">
              📄 PDF查看器 React示例
            </h1>

            <div className="app__header-controls">
              {/* 主题切换 */}
              <button
                className="app__theme-toggle"
                onClick={toggleTheme}
                title={`切换到${theme === 'light' ? '深色' : '浅色'}主题`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>

              {/* 缩略图切换 */}
              <button
                className={`app__toggle ${config.enableThumbnails ? 'active' : ''}`}
                onClick={toggleThumbnails}
                title="切换缩略图显示"
              >
                🖼️ 缩略图
              </button>

              {/* 重置按钮 */}
              <button
                className="app__reset"
                onClick={handleReset}
                title="重置应用"
              >
                🔄 重置
              </button>
            </div>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="app__main">
          {!currentFile ? (
            /* 文件上传区域 */
            <div className="app__upload-section">
              <div className="app__upload-container">
                <h2 className="app__upload-title">
                  选择PDF文件开始预览
                </h2>
                <p className="app__upload-description">
                  支持拖拽上传或点击选择文件，最大支持50MB的PDF文档
                </p>

                <FileUpload
                  onFileSelect={handleFileUpload}
                  onError={handleFileError}
                  accept=".pdf"
                  maxSize={50 * 1024 * 1024} // 50MB
                  className="app__file-upload"
                />

                {/* 功能特性说明 */}
                <div className="app__features">
                  <h3 className="app__features-title">功能特性</h3>
                  <div className="app__features-grid">
                    <div className="app__feature">
                      <span className="app__feature-icon">🔍</span>
                      <span className="app__feature-text">文本搜索</span>
                    </div>
                    <div className="app__feature">
                      <span className="app__feature-icon">📄</span>
                      <span className="app__feature-text">页面导航</span>
                    </div>
                    <div className="app__feature">
                      <span className="app__feature-icon">🔍</span>
                      <span className="app__feature-text">缩放控制</span>
                    </div>
                    <div className="app__feature">
                      <span className="app__feature-icon">⌨️</span>
                      <span className="app__feature-text">键盘快捷键</span>
                    </div>
                    <div className="app__feature">
                      <span className="app__feature-icon">🖼️</span>
                      <span className="app__feature-text">缩略图预览</span>
                    </div>
                    <div className="app__feature">
                      <span className="app__feature-icon">🎨</span>
                      <span className="app__feature-text">主题切换</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PDF查看器 */
            <div className="app__viewer-section">
              <PdfViewer
                file={currentFile}
                config={config}
                className="app__pdf-viewer"
                onError={(error) => {
                  console.error('PDF查看器错误:', error)
                  alert(`PDF加载失败: ${error.message}`)
                }}
                onLoadSuccess={(info) => {
                  console.log('PDF加载成功:', info)
                }}
                onPageChange={(page) => {
                  console.log('页面切换:', page)
                }}
                onZoomChange={(zoom) => {
                  console.log('缩放变化:', zoom)
                }}
                onSearchResult={(results) => {
                  console.log('搜索结果:', results)
                }}
              />
            </div>
          )}
        </main>

        {/* 应用底部 */}
        <footer className="app__footer">
          <div className="app__footer-content">
            <p className="app__footer-text">
              PDF查看器 React示例 - 基于 @ldesign/pdf 组件包
            </p>
            <div className="app__footer-links">
              <a
                href="#"
                className="app__footer-link"
                onClick={(e) => {
                  e.preventDefault()
                  alert('这是一个示例链接')
                }}
              >
                📖 文档
              </a>
              <a
                href="#"
                className="app__footer-link"
                onClick={(e) => {
                  e.preventDefault()
                  alert('这是一个示例链接')
                }}
              >
                🐛 反馈
              </a>
              <a
                href="#"
                className="app__footer-link"
                onClick={(e) => {
                  e.preventDefault()
                  alert('这是一个示例链接')
                }}
              >
                ⭐ GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  )
}

export default App
