/**
 * UI组件初始化
 */

import { getIcon } from '../utils/icons.js'

export async function initUI() {
  const app = document.getElementById('app')
  
  app.innerHTML = `
    <div class="app-container">
      <!-- 头部 -->
      <header class="app-header">
        <div class="app-title">
          <div class="app-logo">C</div>
          <h1>@ldesign/cropper</h1>
          <span class="version">v1.0.0</span>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" id="upload-btn">
            ${getIcon('upload')} 上传图片
          </button>
          <button class="btn btn-secondary" id="export-btn">
            ${getIcon('save')} 导出结果
          </button>
        </div>
      </header>
      
      <!-- 主内容 -->
      <div class="main-content">
        <!-- 左侧工具面板 -->
        <aside class="sidebar left-sidebar">
          <!-- 基础设置 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('settings')} 基础设置
            </h3>
            <div id="basic-controls"></div>
          </div>
          
          <!-- 预设模板 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('ruler')} 预设模板
            </h3>
            <div id="preset-templates"></div>
          </div>
          
          <!-- 示例图片 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('image')} 示例图片
            </h3>
            <div id="sample-images"></div>
          </div>
        </aside>
        
        <!-- 中间裁剪区域 -->
        <div class="cropper-wrapper">
          <div id="cropper-container"></div>
          
          <!-- 工具栏 -->
          <div class="toolbar" id="toolbar">
            <div class="tool-group">
              <button class="btn btn-icon btn-ghost" title="向左旋转90°" id="rotate-left">
                ${getIcon('rotateLeft')}
              </button>
              <button class="btn btn-icon btn-ghost" title="向右旋转90°" id="rotate-right">
                ${getIcon('rotateRight')}
              </button>
            </div>
            
            <div class="tool-group">
              <button class="btn btn-icon btn-ghost" title="水平翻转" id="flip-h">
                ${getIcon('flipHorizontal')}
              </button>
              <button class="btn btn-icon btn-ghost" title="垂直翻转" id="flip-v">
                ${getIcon('flipVertical')}
              </button>
            </div>
            
            <div class="tool-group">
              <button class="btn btn-icon btn-ghost" title="放大" id="zoom-in">
                ${getIcon('zoomIn')}
              </button>
              <button class="btn btn-icon btn-ghost" title="缩小" id="zoom-out">
                ${getIcon('zoomOut')}
              </button>
              <button class="btn btn-icon btn-ghost" title="适应窗口" id="zoom-fit">
                ${getIcon('maximize')}
              </button>
            </div>
            
            <div class="tool-group">
              <button class="btn btn-icon btn-ghost" title="撤销" id="undo-btn" disabled>
                ${getIcon('undo')}
              </button>
              <button class="btn btn-icon btn-ghost" title="重做" id="redo-btn" disabled>
                ${getIcon('redo')}
              </button>
            </div>
            
            <div class="tool-group">
              <button class="btn btn-icon btn-ghost" title="重置" id="reset-btn">
                ${getIcon('refresh')}
              </button>
              <button class="btn btn-icon btn-ghost" title="清除裁剪框" id="clear-btn">
                ${getIcon('x')}
              </button>
            </div>
          </div>
          
          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-indicator"></div>
            <span id="status-text">就绪</span>
            <span style="margin-left: auto;">
              缩放: <span id="zoom-value">100%</span>
            </span>
          </div>
        </div>
        
        <!-- 右侧信息面板 -->
        <aside class="sidebar right-sidebar">
          <!-- 裁剪数据 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('barChart')} 裁剪数据
            </h3>
            <div id="crop-data">
              <div class="data-item">
                <span class="label">X:</span>
                <span class="value">-</span>
              </div>
              <div class="data-item">
                <span class="label">Y:</span>
                <span class="value">-</span>
              </div>
              <div class="data-item">
                <span class="label">宽:</span>
                <span class="value">-</span>
              </div>
              <div class="data-item">
                <span class="label">高:</span>
                <span class="value">-</span>
              </div>
              <div class="data-item">
                <span class="label">旋转:</span>
                <span class="value">0°</span>
              </div>
              <div class="data-item">
                <span class="label">缩放X:</span>
                <span class="value">1.00</span>
              </div>
              <div class="data-item">
                <span class="label">缩放Y:</span>
                <span class="value">1.00</span>
              </div>
            </div>
          </div>
          
          <!-- 滤镜效果 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('sparkles')} 滤镜效果
            </h3>
            <div id="filter-controls"></div>
          </div>
          
          <!-- 高级设置 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('wrench')} 高级设置
            </h3>
            <div id="advanced-controls"></div>
          </div>
          
          <!-- 导出选项 -->
          <div class="sidebar-section">
            <h3 class="section-title">
              ${getIcon('save')} 导出选项
            </h3>
            <div id="export-options"></div>
          </div>
        </aside>
      </div>
    </div>
  `
  
  // 绑定头部按钮事件
  bindHeaderEvents()
  
  // 绑定工具栏事件
  bindToolbarEvents()
}

// 绑定头部按钮事件
function bindHeaderEvents() {
  // 上传按钮
  const uploadBtn = document.getElementById('upload-btn')
  if (uploadBtn) {
    uploadBtn.addEventListener('click', handleUploadClick)
  }
  
  // 导出按钮
  const exportBtn = document.getElementById('export-btn')
  if (exportBtn) {
    exportBtn.addEventListener('click', handleExportClick)
  }
}

// 绑定工具栏事件
function bindToolbarEvents() {
  // 旋转
  document.getElementById('rotate-left')?.addEventListener('click', () => {
    window.appState.cropper?.rotate(-90)
  })
  
  document.getElementById('rotate-right')?.addEventListener('click', () => {
    window.appState.cropper?.rotate(90)
  })
  
  // 翻转
  document.getElementById('flip-h')?.addEventListener('click', () => {
    const data = window.appState.cropper?.getData()
    if (data) {
      window.appState.cropper.scaleX(-data.scaleX)
    }
  })
  
  document.getElementById('flip-v')?.addEventListener('click', () => {
    const data = window.appState.cropper?.getData()
    if (data) {
      window.appState.cropper.scaleY(-data.scaleY)
    }
  })
  
  // 缩放
  document.getElementById('zoom-in')?.addEventListener('click', () => {
    const imageData = window.appState.cropper?.getImageData()
    if (imageData) {
      window.appState.cropper.scale(imageData.scaleX * 1.1, imageData.scaleY * 1.1)
    }
  })
  
  document.getElementById('zoom-out')?.addEventListener('click', () => {
    const imageData = window.appState.cropper?.getImageData()
    if (imageData) {
      window.appState.cropper.scale(imageData.scaleX * 0.9, imageData.scaleY * 0.9)
    }
  })
  
  document.getElementById('zoom-fit')?.addEventListener('click', () => {
    window.appState.cropper?.reset()
  })
  
  // 撤销/重做
  document.getElementById('undo-btn')?.addEventListener('click', handleUndo)
  document.getElementById('redo-btn')?.addEventListener('click', handleRedo)
  
  // 重置/清除
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    window.appState.cropper?.reset()
    window.showSuccessToast('已重置')
  })
  
  document.getElementById('clear-btn')?.addEventListener('click', () => {
    window.appState.cropper?.clear()
    window.showSuccessToast('已清除裁剪框')
  })
}

// 处理上传点击
function handleUploadClick() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  
  input.addEventListener('change', (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        window.initCropper(e.target.result)
        window.showSuccessToast(`已加载: ${file.name}`)
      }
      reader.readAsDataURL(file)
    }
  })
  
  input.click()
}

// 处理导出点击
function handleExportClick() {
  if (!window.appState.cropper) {
    window.showErrorToast('请先加载图片')
    return
  }
  
  try {
    const canvas = window.appState.cropper.getCroppedCanvas({
      width: 800,
      height: 600,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    })
    
    if (canvas) {
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cropped-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
        window.showSuccessToast('图片已导出')
      }, 'image/png')
    } else {
      window.showErrorToast('请先选择裁剪区域')
    }
  } catch (error) {
    window.showErrorToast('导出失败: ' + error.message)
  }
}

// 处理撤销
function handleUndo() {
  if (window.appState.historyIndex > 0) {
    window.appState.historyIndex--
    const state = window.appState.history[window.appState.historyIndex]
    if (state && window.appState.cropper) {
      window.appState.cropper.setData(state.data)
      window.updateHistoryButtons()
      window.showToast('已撤销')
    }
  }
}

// 处理重做
function handleRedo() {
  if (window.appState.historyIndex < window.appState.history.length - 1) {
    window.appState.historyIndex++
    const state = window.appState.history[window.appState.historyIndex]
    if (state && window.appState.cropper) {
      window.appState.cropper.setData(state.data)
      window.updateHistoryButtons()
      window.showToast('已重做')
    }
  }
}