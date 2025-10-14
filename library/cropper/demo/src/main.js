/**
 * @ldesign/cropper 演示应用主入口
 */

// 直接从源码导入核心 Cropper 类，通过 Vite alias 配置
import { Cropper } from '@ldesign/cropper'
import '../../src/styles/cropper.css'
import { initUI } from './components/ui.js'
import { initControls } from './components/controls.js'
import { initPresets } from './components/presets.js'
import { initFilters } from './components/filters.js'
import { initHistory } from './utils/history.js'
import { initKeyboard } from './utils/keyboard.js'
import { loadSampleImages } from './utils/samples.js'

// 全局状态管理
window.appState = {
  cropper: null,
  currentImage: null,
  history: [],
  historyIndex: -1,
  settings: {
    aspectRatio: NaN,
    viewMode: 1,
    dragMode: 'crop',
    cropBoxMovable: true,
    cropBoxResizable: true,
    background: true,
    modal: true,
    guides: true,
    center: true,
    highlight: true,
    autoCrop: true,
    initialCropBoxSize: 0.8,
    responsive: true,
    restore: false,
    checkCrossOrigin: true,
    checkOrientation: true,
    rotatable: true,
    scalable: true,
    zoomable: true,
    zoomOnTouch: true,
    zoomOnWheel: true,
    wheelZoomRatio: 0.1,
    toggleDragModeOnDblclick: true,
    minContainerWidth: 200,
    minContainerHeight: 100,
    minCropBoxWidth: 0,
    minCropBoxHeight: 0,
    toolbar: true
  },
  filters: {
    brightness: 100,
    contrast: 100,
    saturate: 100,
    grayscale: 0,
    sepia: 0,
    hueRotate: 0,
    blur: 0,
    invert: 0
  }
}

// 初始化应用
async function initApp() {
  try {
    // 隐藏加载屏幕
    const loadingScreen = document.querySelector('.loading-screen')
    
    // 初始化UI组件
    await initUI()
    
    // 初始化控制面板
    initControls()
    
    // 初始化预设模板
    initPresets()
    
    // 初始化滤镜控制
    initFilters()
    
    // 初始化历史记录管理
    initHistory()
    
    // 初始化键盘快捷键
    initKeyboard()
    
    // 加载示例图片
    await loadSampleImages()
    
    // 初始化裁剪器
    initCropper()
    
    // 隐藏加载屏幕
    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      setTimeout(() => {
        loadingScreen.style.display = 'none'
      }, 300)
    }
    
    // 显示欢迎提示
    showWelcomeToast()
    
  } catch (error) {
    console.error('应用初始化失败:', error)
    showErrorToast('应用初始化失败，请刷新页面重试')
  }
}

// 初始化裁剪器
function initCropper(imageSrc = null) {
  const container = document.getElementById('cropper-container')
  
  if (!container) {
    console.error('裁剪器容器未找到')
    return
  }
  
  // 销毁旧的裁剪器实例
  if (window.appState.cropper) {
    window.appState.cropper.destroy()
    window.appState.cropper = null
  }
  
  // 清空容器
  container.innerHTML = ''
  
  // 创建配置选项
  const options = {
    ...window.appState.settings,
    src: imageSrc,
    placeholder: {
      text: '点击或拖拽图片到这里',
      subtext: '支持 JPG、PNG、GIF、WEBP 格式（最大 20MB）',
      clickToUpload: true,
      dragAndDrop: true,
      acceptedFiles: 'image/*',
      maxFileSize: 20,
      className: 'custom-placeholder'
    },
    presets: {
      includeDefaults: true
    },
    ready: handleCropperReady,
    cropstart: handleCropStart,
    crop: handleCrop,
    cropend: handleCropEnd,
    zoom: handleZoom,
    upload: handleUpload,
    uploadError: handleUploadError
  }
  
  // 创建新的裁剪器实例
  window.appState.cropper = new Cropper(container, options)
}

// 处理裁剪器准备就绪
function handleCropperReady(event) {
  console.log('裁剪器已准备就绪', event)
  updateStatus('就绪')
  updateDataDisplay()
  
  // 监听预设应用事件
  if (window.appState.cropper && window.appState.cropper.element) {
    window.appState.cropper.element.addEventListener('preset:applied', handlePresetApplied)
  }
}

// 处理裁剪开始
function handleCropStart(event) {
  console.log('开始裁剪', event)
  updateStatus('裁剪中...')
}

// 处理裁剪中
function handleCrop(event) {
  updateDataDisplay()
  updateExportDimensionsFromCropBox()
}

// 处理裁剪结束
function handleCropEnd(event) {
  console.log('裁剪结束', event)
  updateStatus('就绪')
  saveToHistory()
}

// 处理缩放
function handleZoom(event) {
  const { zoom } = event.detail
  updateZoomDisplay(zoom)
}

// 处理文件上传
function handleUpload(event) {
  const { file } = event.detail
  console.log('文件已上传:', file)
  showSuccessToast(`已加载图片: ${file.name}`)
  window.appState.currentImage = file
}

// 处理上传错误
function handleUploadError(event) {
  const { message } = event.detail
  console.error('上传错误:', message)
  showErrorToast(message)
}

// 处理预设应用事件
function handlePresetApplied(event) {
  const { preset } = event.detail
  console.log('预设已应用:', preset)
  
  // 更新导出尺寸
  const exportWidth = document.getElementById('export-width')
  const exportHeight = document.getElementById('export-height')
  
  if (exportWidth && exportHeight && preset) {
    if (preset.width && preset.height) {
      exportWidth.value = preset.width
      exportHeight.value = preset.height
    } else {
      // 如果预设没有具体尺寸，使用当前裁剪框的宽高比计算
      updateExportDimensionsFromCropBox()
    }
  }
}

// 更新状态显示
function updateStatus(status) {
  const statusEl = document.getElementById('status-text')
  if (statusEl) {
    statusEl.textContent = status
  }
}

// 更新数据显示
function updateDataDisplay() {
  if (!window.appState.cropper) return
  
  const data = window.appState.cropper.getData()
  const imageData = window.appState.cropper.getImageData()
  
  const dataDisplay = document.getElementById('crop-data')
  if (dataDisplay && data) {
    dataDisplay.innerHTML = `
      <div class="data-item">
        <span class="label">X:</span>
        <span class="value">${Math.round(data.x)}px</span>
      </div>
      <div class="data-item">
        <span class="label">Y:</span>
        <span class="value">${Math.round(data.y)}px</span>
      </div>
      <div class="data-item">
        <span class="label">宽:</span>
        <span class="value">${Math.round(data.width)}px</span>
      </div>
      <div class="data-item">
        <span class="label">高:</span>
        <span class="value">${Math.round(data.height)}px</span>
      </div>
      <div class="data-item">
        <span class="label">旋转:</span>
        <span class="value">${data.rotate || 0}°</span>
      </div>
      <div class="data-item">
        <span class="label">缩放X:</span>
        <span class="value">${(data.scaleX || 1).toFixed(2)}</span>
      </div>
      <div class="data-item">
        <span class="label">缩放Y:</span>
        <span class="value">${(data.scaleY || 1).toFixed(2)}</span>
      </div>
    `
  }
}

// 更新缩放显示
function updateZoomDisplay(zoom) {
  const zoomDisplay = document.getElementById('zoom-value')
  if (zoomDisplay) {
    zoomDisplay.textContent = `${Math.round(zoom * 100)}%`
  }
  
  const zoomSlider = document.getElementById('zoom-slider')
  if (zoomSlider) {
    zoomSlider.value = zoom * 100
  }
}

// 保存到历史记录
function saveToHistory() {
  if (!window.appState.cropper) return
  
  const data = window.appState.cropper.getData()
  const imageData = window.appState.cropper.getImageData()
  
  // 添加到历史记录
  window.appState.history = window.appState.history.slice(0, window.appState.historyIndex + 1)
  window.appState.history.push({
    data: { ...data },
    imageData: { ...imageData },
    timestamp: Date.now()
  })
  window.appState.historyIndex++
  
  // 限制历史记录数量
  if (window.appState.history.length > 50) {
    window.appState.history.shift()
    window.appState.historyIndex--
  }
  
  updateHistoryButtons()
}

// 更新历史记录按钮状态
function updateHistoryButtons() {
  const undoBtn = document.getElementById('undo-btn')
  const redoBtn = document.getElementById('redo-btn')
  
  if (undoBtn) {
    undoBtn.disabled = window.appState.historyIndex <= 0
  }
  
  if (redoBtn) {
    redoBtn.disabled = window.appState.historyIndex >= window.appState.history.length - 1
  }
}

// 显示成功提示
function showSuccessToast(message) {
  showToast(message, 'success')
}

// 显示错误提示
function showErrorToast(message) {
  showToast(message, 'error')
}

// 显示提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  // 动画显示
  setTimeout(() => {
    toast.classList.add('show')
  }, 10)
  
  // 3秒后移除
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// 显示欢迎提示
function showWelcomeToast() {
  showToast('欢迎使用 @ldesign/cropper 图片裁剪器！', 'info')
}

// 从裁剪框更新导出尺寸
function updateExportDimensionsFromCropBox() {
  if (!window.appState.cropper) return
  
  const cropData = window.appState.cropper.getCropBoxData()
  const imageData = window.appState.cropper.getImageData()
  
  if (!cropData || !imageData) return
  
  const exportWidth = document.getElementById('export-width')
  const exportHeight = document.getElementById('export-height')
  
  if (exportWidth && exportHeight) {
    // Keep aspect ratio but scale to reasonable export size
    const aspectRatio = cropData.width / cropData.height
    
    // Use current values as base, or default to crop box size
    let width = parseInt(exportWidth.value) || Math.round(cropData.width)
    let height = parseInt(exportHeight.value) || Math.round(cropData.height)
    
    // If aspect ratio changed significantly, update one dimension
    const currentAspectRatio = width / height
    if (Math.abs(aspectRatio - currentAspectRatio) > 0.01) {
      // Keep width, adjust height to match crop box aspect ratio
      height = Math.round(width / aspectRatio)
      exportHeight.value = height
    }
  }
}

// 导出全局函数
window.initCropper = initCropper
window.showToast = showToast
window.showSuccessToast = showSuccessToast
window.showErrorToast = showErrorToast
window.updateDataDisplay = updateDataDisplay
window.updateZoomDisplay = updateZoomDisplay
window.saveToHistory = saveToHistory
window.updateHistoryButtons = updateHistoryButtons
window.updateExportDimensionsFromCropBox = updateExportDimensionsFromCropBox

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp)