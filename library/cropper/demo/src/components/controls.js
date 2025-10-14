/**
 * 控制面板组件
 */

import { getIcon } from '../utils/icons.js'

export function initControls() {
  initBasicControls()
  initAdvancedControls()
  initExportOptions()
}

// 初始化基础控制
function initBasicControls() {
  const container = document.getElementById('basic-controls')
  if (!container) return
  
  container.innerHTML = `
    <!-- 视图模式 -->
    <div class="form-group">
      <label class="form-label">视图模式</label>
      <select class="form-control" id="view-mode">
        <option value="0">无限制</option>
        <option value="1" selected>限制在画布内</option>
        <option value="2">限制在容器内</option>
        <option value="3">限制在容器内(无缩放)</option>
      </select>
    </div>
    
    <!-- 拖拽模式 -->
    <div class="form-group">
      <label class="form-label">拖拽模式</label>
      <select class="form-control" id="drag-mode">
        <option value="crop" selected>裁剪</option>
        <option value="move">移动</option>
        <option value="none">禁用</option>
      </select>
    </div>
    
    <!-- 宽高比 -->
    <div class="form-group">
      <label class="form-label">宽高比</label>
      <select class="form-control" id="aspect-ratio">
        <option value="NaN" selected>自由</option>
        <option value="1">1:1 (正方形)</option>
        <option value="1.3333">4:3</option>
        <option value="1.7778">16:9</option>
        <option value="0.6667">2:3 (竖版)</option>
        <option value="0.5625">9:16 (手机)</option>
      </select>
    </div>
    
    <!-- 复选框选项 -->
    <div class="checkbox-group">
      <input type="checkbox" id="auto-crop" checked>
      <label class="checkbox-label" for="auto-crop">自动裁剪</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="modal" checked>
      <label class="checkbox-label" for="modal">显示遮罩</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="guides" checked>
      <label class="checkbox-label" for="guides">显示辅助线</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="center" checked>
      <label class="checkbox-label" for="center">显示中心点</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="highlight" checked>
      <label class="checkbox-label" for="highlight">高亮裁剪区</label>
    </div>
  `
  
  // 绑定事件
  bindBasicControlEvents()
}

// 绑定基础控制事件
function bindBasicControlEvents() {
  // 视图模式
  document.getElementById('view-mode')?.addEventListener('change', (e) => {
    window.appState.settings.viewMode = parseInt(e.target.value)
    recreateCropper()
  })
  
  // 拖拽模式
  document.getElementById('drag-mode')?.addEventListener('change', (e) => {
    window.appState.settings.dragMode = e.target.value
    // 拖拽模式需要通过重新创建裁剪器来应用
    recreateCropper()
  })
  
  // 宽高比
  document.getElementById('aspect-ratio')?.addEventListener('change', (e) => {
    const value = e.target.value === 'NaN' ? NaN : parseFloat(e.target.value)
    window.appState.settings.aspectRatio = value
    // 宽高比需要通过重新创建裁剪器来应用
    recreateCropper()
  })
  
  // 复选框选项
  const checkboxes = [
    { id: 'auto-crop', setting: 'autoCrop' },
    { id: 'modal', setting: 'modal' },
    { id: 'guides', setting: 'guides' },
    { id: 'center', setting: 'center' },
    { id: 'highlight', setting: 'highlight' }
  ]
  
  checkboxes.forEach(({ id, setting }) => {
    document.getElementById(id)?.addEventListener('change', (e) => {
      window.appState.settings[setting] = e.target.checked
      recreateCropper()
    })
  })
}

// 初始化高级控制
function initAdvancedControls() {
  const container = document.getElementById('advanced-controls')
  if (!container) return
  
  container.innerHTML = `
    <!-- 缩放滑块 -->
    <div class="slider-group">
      <div class="slider-header">
        <span class="slider-label">缩放</span>
        <span class="slider-value" id="manual-zoom-value">100%</span>
      </div>
      <input type="range" class="slider" id="zoom-slider"
        min="10" max="400" value="100" step="10">
    </div>
    
    <!-- 旋转滑块 -->
    <div class="slider-group">
      <div class="slider-header">
        <span class="slider-label">旋转</span>
        <span class="slider-value" id="rotate-value">0°</span>
      </div>
      <input type="range" class="slider" id="rotate-slider"
        min="-180" max="180" value="0" step="1">
    </div>
    
    <!-- 不透明度滑块 -->
    <div class="slider-group">
      <div class="slider-header">
        <span class="slider-label">遮罩不透明度</span>
        <span class="slider-value" id="modal-opacity-value">30%</span>
      </div>
      <input type="range" class="slider" id="modal-opacity"
        min="0" max="100" value="30" step="5">
    </div>
    
    <!-- 最小裁剪框尺寸 -->
    <div class="form-group">
      <label class="form-label">最小裁剪框宽度</label>
      <input type="number" class="form-control" id="min-crop-width"
        min="0" max="500" value="0" step="10">
    </div>
    
    <div class="form-group">
      <label class="form-label">最小裁剪框高度</label>
      <input type="number" class="form-control" id="min-crop-height"
        min="0" max="500" value="0" step="10">
    </div>
    
    <!-- 高级选项 -->
    <div class="checkbox-group">
      <input type="checkbox" id="crop-box-movable" checked>
      <label class="checkbox-label" for="crop-box-movable">可移动裁剪框</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="crop-box-resizable" checked>
      <label class="checkbox-label" for="crop-box-resizable">可调整裁剪框</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="zoom-on-wheel" checked>
      <label class="checkbox-label" for="zoom-on-wheel">滚轮缩放</label>
    </div>
    
    <div class="checkbox-group">
      <input type="checkbox" id="zoom-on-touch" checked>
      <label class="checkbox-label" for="zoom-on-touch">触摸缩放</label>
    </div>
  `
  
  bindAdvancedControlEvents()
}

// 绑定高级控制事件
function bindAdvancedControlEvents() {
  // 缩放滑块
  const zoomSlider = document.getElementById('zoom-slider')
  const zoomValue = document.getElementById('manual-zoom-value')
  
  zoomSlider?.addEventListener('input', (e) => {
    const zoom = parseInt(e.target.value) / 100
    if (zoomValue) zoomValue.textContent = `${e.target.value}%`
    
    if (window.appState.cropper) {
      const imageData = window.appState.cropper.getImageData()
      if (imageData) {
        window.appState.cropper.scale(zoom, zoom)
      }
    }
  })
  
  // 旋转滑块
  const rotateSlider = document.getElementById('rotate-slider')
  const rotateValue = document.getElementById('rotate-value')
  
  rotateSlider?.addEventListener('input', (e) => {
    const angle = parseInt(e.target.value)
    if (rotateValue) rotateValue.textContent = `${angle}°`
    
    if (window.appState.cropper) {
      window.appState.cropper.rotateTo(angle)
    }
  })
  
  // 遮罩不透明度
  const opacitySlider = document.getElementById('modal-opacity')
  const opacityValue = document.getElementById('modal-opacity-value')
  
  opacitySlider?.addEventListener('input', (e) => {
    const opacity = parseInt(e.target.value)
    if (opacityValue) opacityValue.textContent = `${opacity}%`
    
    window.appState.settings.modalOpacity = opacity / 100
    recreateCropper()
  })
  
  // 最小尺寸
  document.getElementById('min-crop-width')?.addEventListener('change', (e) => {
    window.appState.settings.minCropBoxWidth = parseInt(e.target.value)
    recreateCropper()
  })
  
  document.getElementById('min-crop-height')?.addEventListener('change', (e) => {
    window.appState.settings.minCropBoxHeight = parseInt(e.target.value)
    recreateCropper()
  })
  
  // 高级选项复选框
  const advancedCheckboxes = [
    { id: 'crop-box-movable', setting: 'cropBoxMovable' },
    { id: 'crop-box-resizable', setting: 'cropBoxResizable' },
    { id: 'zoom-on-wheel', setting: 'zoomOnWheel' },
    { id: 'zoom-on-touch', setting: 'zoomOnTouch' }
  ]
  
  advancedCheckboxes.forEach(({ id, setting }) => {
    document.getElementById(id)?.addEventListener('change', (e) => {
      window.appState.settings[setting] = e.target.checked
      recreateCropper()
    })
  })
}

// 初始化导出选项
function initExportOptions() {
  const container = document.getElementById('export-options')
  if (!container) return
  
  container.innerHTML = `
    <!-- 导出格式 -->
    <div class="form-group">
      <label class="form-label">导出格式</label>
      <select class="form-control" id="export-format">
        <option value="image/png">PNG</option>
        <option value="image/jpeg">JPEG</option>
        <option value="image/webp">WebP</option>
      </select>
    </div>
    
    <!-- 导出质量 -->
    <div class="slider-group">
      <div class="slider-header">
        <span class="slider-label">导出质量</span>
        <span class="slider-value" id="export-quality-value">90%</span>
      </div>
      <input type="range" class="slider" id="export-quality"
        min="10" max="100" value="90" step="5">
    </div>
    
    <!-- 导出尺寸 -->
    <div class="form-group">
      <label class="form-label">导出宽度</label>
      <input type="number" class="form-control" id="export-width"
        min="100" max="4096" value="800" step="100">
    </div>
    
    <div class="form-group">
      <label class="form-label">导出高度</label>
      <input type="number" class="form-control" id="export-height"
        min="100" max="4096" value="600" step="100">
    </div>
    
    <!-- 导出按钮组 -->
    <div style="display: flex; gap: 10px; margin-top: 15px;">
      <button class="btn btn-primary" id="export-image" style="flex: 1">
        ${getIcon('save')} 导出图片
      </button>
      <button class="btn btn-ghost" id="copy-data" style="flex: 1">
        ${getIcon('copy')} 复制数据
      </button>
    </div>
  `
  
  bindExportEvents()
}

// 绑定导出事件
function bindExportEvents() {
  // 质量滑块
  const qualitySlider = document.getElementById('export-quality')
  const qualityValue = document.getElementById('export-quality-value')
  
  qualitySlider?.addEventListener('input', (e) => {
    if (qualityValue) qualityValue.textContent = `${e.target.value}%`
  })
  
  // 导出图片按钮
  document.getElementById('export-image')?.addEventListener('click', () => {
    if (!window.appState.cropper) {
      window.showErrorToast('请先加载图片')
      return
    }
    
    const format = document.getElementById('export-format').value
    const quality = parseInt(document.getElementById('export-quality').value) / 100
    const width = parseInt(document.getElementById('export-width').value)
    const height = parseInt(document.getElementById('export-height').value)
    
    try {
      const canvas = window.appState.cropper.getCroppedCanvas({
        width,
        height,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      })
      
      if (canvas) {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          const ext = format.split('/')[1]
          a.href = url
          a.download = `cropped-${Date.now()}.${ext}`
          a.click()
          URL.revokeObjectURL(url)
          window.showSuccessToast('图片已导出')
        }, format, quality)
      } else {
        window.showErrorToast('请先选择裁剪区域')
      }
    } catch (error) {
      window.showErrorToast('导出失败: ' + error.message)
    }
  })
  
  // 复制数据按钮
  document.getElementById('copy-data')?.addEventListener('click', () => {
    if (!window.appState.cropper) {
      window.showErrorToast('请先加载图片')
      return
    }
    
    const data = window.appState.cropper.getData()
    const json = JSON.stringify(data, null, 2)
    
    navigator.clipboard.writeText(json).then(() => {
      window.showSuccessToast('数据已复制到剪贴板')
    }).catch(() => {
      window.showErrorToast('复制失败')
    })
  })
}

// 重新创建裁剪器
function recreateCropper() {
  const currentSrc = window.appState.cropper?.getImageData()?.src || null
  if (currentSrc) {
    window.initCropper(currentSrc)
  }
}