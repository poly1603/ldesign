// 使用真正的 Cropper 类进行测试
import { Cropper, checkCompatibility } from '@ldesign/cropper'
// 暂时注释掉样式导入，先测试基本功能
// import '../../src/styles/index.less'

// 全局变量
let cropper = null
let performanceMonitor = null

// DOM 元素
const elements = {
  status: document.getElementById('status'),
  fileInput: document.getElementById('fileInput'),
  themeSelect: document.getElementById('themeSelect'),
  shapeSelect: document.getElementById('shapeSelect'),
  aspectRatioSelect: document.getElementById('aspectRatioSelect'),
  showGrid: document.getElementById('showGrid'),
  showCenterLines: document.getElementById('showCenterLines'),
  showCropInfo: document.getElementById('showCropInfo'),
  cropperContainer: document.getElementById('cropperContainer'),
  imageInfo: document.getElementById('imageInfo'),
  cropInfo: document.getElementById('cropInfo'),
  transformInfo: document.getElementById('transformInfo'),
  fps: document.getElementById('fps'),
  memory: document.getElementById('memory'),
  previewSection: document.getElementById('previewSection'),
  previewImage: document.getElementById('previewImage')
}

// 初始化应用
async function initApp() {
  try {
    updateStatus('正在初始化裁剪器...', true)
    
    // 检查浏览器支持
    const compatibility = checkCompatibility()
    if (!compatibility.supported) {
      throw new Error('当前浏览器不支持裁剪器功能: ' + compatibility.warnings.join(', '))
    }

    // 创建裁剪器实例
    cropper = new Cropper(elements.cropperContainer, {
      theme: 'light',
      cropShape: 'rectangle',
      aspectRatio: null,
      enableGestures: true,
      enableKeyboard: true,
      showGrid: true,
      showCenterLines: true,
      showCropInfo: true,
      minCropSize: { width: 50, height: 50 },
      responsive: true,
      enableTouch: true
    })

    // 绑定事件监听器
    bindEventListeners()
    
    // 启动性能监控
    startPerformanceMonitor()
    
    // 加载示例图片
    await loadSampleImage()
    
    updateStatus('裁剪器初始化完成！', false)
    
  } catch (error) {
    console.error('初始化失败:', error)
    updateStatus(`初始化失败: ${error.message}`, false, 'error')
  }
}

// 绑定事件监听器
function bindEventListeners() {
  // 裁剪器事件
  cropper.on('ready', onCropperReady)
  cropper.on('image-loaded', onImageLoaded)
  cropper.on('crop-change', onCropChange)
  cropper.on('transform-update', onTransform)
  cropper.on('error', onError)

  // 控制面板事件
  elements.fileInput.addEventListener('change', handleFileSelect)
  elements.themeSelect.addEventListener('change', handleThemeChange)
  elements.shapeSelect.addEventListener('change', handleShapeChange)
  elements.aspectRatioSelect.addEventListener('change', handleAspectRatioChange)
  elements.showGrid.addEventListener('change', handleDisplayOptionsChange)
  elements.showCenterLines.addEventListener('change', handleDisplayOptionsChange)
  elements.showCropInfo.addEventListener('change', handleDisplayOptionsChange)

  // 键盘快捷键
  document.addEventListener('keydown', handleKeydown)
}

// 裁剪器事件处理
function onCropperReady(event) {
  console.log('裁剪器准备就绪:', event.detail)
  updateStatus('裁剪器准备就绪', false)
}

function onImageLoaded(event) {
  console.log('图片加载完成:', event)
  updateImageInfo(event)
  updateStatus('图片加载完成', false)
}

function onCropChange(event) {
  console.log('裁剪区域变化:', event)
  updateCropInfo(event)
}

function onTransform(event) {
  console.log('变换操作:', event)
  updateTransformInfo(event)
}

function onError(event) {
  console.error('裁剪器错误:', event)
  updateStatus(`错误: ${event.message || event}`, false, 'error')
}

// 控制面板事件处理
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    loadImageFile(file)
  }
}

function handleThemeChange(event) {
  const theme = event.target.value
  cropper.setTheme(theme)
  updateStatus(`主题已切换为: ${theme}`, false)
}

function handleShapeChange(event) {
  const shape = event.target.value
  cropper.updateConfig({ cropShape: shape })
  updateStatus(`裁剪形状已切换为: ${shape}`, false)
}

function handleAspectRatioChange(event) {
  const ratio = event.target.value
  const aspectRatio = ratio === 'free' ? null : parseFloat(ratio)
  cropper.updateConfig({ aspectRatio })
  updateStatus(`宽高比已设置为: ${ratio === 'free' ? '自由' : ratio}`, false)
}

function handleDisplayOptionsChange() {
  const config = {
    showGrid: elements.showGrid.checked,
    showCenterLines: elements.showCenterLines.checked,
    showCropInfo: elements.showCropInfo.checked
  }
  cropper.updateConfig(config)
}

function handleKeydown(event) {
  if (!cropper || !cropper.hasImage()) return

  switch (event.key) {
    case 'r':
    case 'R':
      if (event.ctrlKey) {
        event.preventDefault()
        resetCrop()
      }
      break
    case 'ArrowLeft':
      if (event.ctrlKey) {
        event.preventDefault()
        rotateLeft()
      }
      break
    case 'ArrowRight':
      if (event.ctrlKey) {
        event.preventDefault()
        rotateRight()
      }
      break
    case '=':
    case '+':
      if (event.ctrlKey) {
        event.preventDefault()
        zoomIn()
      }
      break
    case '-':
      if (event.ctrlKey) {
        event.preventDefault()
        zoomOut()
      }
      break
    case 'Enter':
      if (event.ctrlKey) {
        event.preventDefault()
        exportImage()
      }
      break
  }
}

// 工具函数
function updateStatus(message, loading = false, type = 'info') {
  const statusEl = elements.status
  statusEl.innerHTML = loading ? 
    `<span class="loading"></span>${message}` : 
    message
  
  statusEl.className = `status-bar ${type}`
  
  if (!loading && type === 'info') {
    setTimeout(() => {
      statusEl.style.display = 'none'
    }, 3000)
  } else {
    statusEl.style.display = 'block'
  }
}

function updateImageInfo(imageData) {
  const info = `
    <div class="info-item">
      <strong>尺寸:</strong> ${imageData.width} × ${imageData.height}<br>
      <strong>格式:</strong> ${imageData.type || '未知'}<br>
      <strong>大小:</strong> ${formatFileSize(imageData.size || 0)}
    </div>
  `
  elements.imageInfo.innerHTML = info
}

function updateCropInfo(cropData) {
  if (!cropData) {
    elements.cropInfo.innerHTML = '<div class="info-item">未设置裁剪区域</div>'
    return
  }

  const info = `
    <div class="info-item">
      <strong>位置:</strong> (${Math.round(cropData.x)}, ${Math.round(cropData.y)})<br>
      <strong>尺寸:</strong> ${Math.round(cropData.width)} × ${Math.round(cropData.height)}<br>
      <strong>形状:</strong> ${cropData.shape}
    </div>
  `
  elements.cropInfo.innerHTML = info
}

function updateTransformInfo(transformData) {
  if (!transformData) {
    elements.transformInfo.innerHTML = '<div class="info-item">无变换操作</div>'
    return
  }

  const flipStatus = getFlipStatus(transformData)
  const info = `
    <div class="info-item">
      <strong>缩放:</strong> ${transformData.scale.toFixed(2)}×<br>
      <strong>旋转:</strong> ${transformData.rotation}°<br>
      <strong>翻转:</strong> ${flipStatus}
    </div>
  `
  elements.transformInfo.innerHTML = info
}

function getFlipStatus(transformData) {
  const { flipX, flipY } = transformData
  if (flipX && flipY) return '水平+垂直'
  if (flipX) return '水平'
  if (flipY) return '垂直'
  return '无'
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 性能监控
function startPerformanceMonitor() {
  let frameCount = 0
  let lastTime = performance.now()

  function updatePerformance() {
    frameCount++
    const currentTime = performance.now()
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round(frameCount * 1000 / (currentTime - lastTime))
      elements.fps.textContent = fps
      
      // 内存使用情况（如果支持）
      if (performance.memory) {
        const memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
        elements.memory.textContent = `${memory} MB`
      } else {
        elements.memory.textContent = '不支持'
      }
      
      frameCount = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(updatePerformance)
  }
  
  updatePerformance()
}

// 图片操作函数
async function loadSampleImage() {
  try {
    updateStatus('正在加载示例图片...', true)
    // 使用 Picsum 提供的随机图片
    await cropper.loadImage('https://picsum.photos/800/600?random=1')
  } catch (error) {
    console.warn('加载示例图片失败:', error)
    updateStatus('示例图片加载失败，请手动选择图片', false, 'warning')
  }
}

async function loadImageFile(file) {
  try {
    updateStatus('正在加载图片...', true)
    await cropper.loadImage(file)
  } catch (error) {
    console.error('加载图片失败:', error)
    updateStatus(`加载图片失败: ${error.message}`, false, 'error')
  }
}

// 全局操作函数（供HTML调用）
window.selectImage = () => {
  elements.fileInput.click()
}

window.resetCrop = () => {
  if (!cropper) return
  cropper.resetCrop()
  updateStatus('裁剪区域已重置', false)
}

window.rotateLeft = () => {
  if (!cropper) return
  cropper.rotate(-90)
  updateStatus('向左旋转90°', false)
}

window.rotateRight = () => {
  if (!cropper) return
  cropper.rotate(90)
  updateStatus('向右旋转90°', false)
}

window.flipHorizontal = () => {
  if (!cropper) return
  cropper.flip('horizontal')
  updateStatus('水平翻转', false)
}

window.flipVertical = () => {
  if (!cropper) return
  cropper.flip('vertical')
  updateStatus('垂直翻转', false)
}

window.zoomIn = () => {
  if (!cropper) return
  cropper.zoom(0.1)
  updateStatus('放大', false)
}

window.zoomOut = () => {
  if (!cropper) return
  cropper.zoom(-0.1)
  updateStatus('缩小', false)
}

window.exportImage = async () => {
  if (!cropper || !cropper.hasImage()) {
    updateStatus('请先加载图片', false, 'warning')
    return
  }

  try {
    updateStatus('正在导出图片...', true)
    
    const blob = await cropper.getCroppedBlob({
      type: 'image/jpeg',
      quality: 0.9
    })
    
    const url = URL.createObjectURL(blob)
    elements.previewImage.src = url
    elements.previewSection.style.display = 'block'
    
    updateStatus('图片导出成功', false)
    
    // 滚动到预览区域
    elements.previewSection.scrollIntoView({ behavior: 'smooth' })
    
  } catch (error) {
    console.error('导出失败:', error)
    updateStatus(`导出失败: ${error.message}`, false, 'error')
  }
}

window.downloadImage = () => {
  const src = elements.previewImage.src
  if (!src) return
  
  const a = document.createElement('a')
  a.href = src
  a.download = `cropped-image-${Date.now()}.jpg`
  a.click()
  
  updateStatus('图片下载开始', false)
}

window.clearPreview = () => {
  const src = elements.previewImage.src
  if (src && src.startsWith('blob:')) {
    URL.revokeObjectURL(src)
  }
  elements.previewImage.src = ''
  elements.previewSection.style.display = 'none'
  updateStatus('预览已清除', false)
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp)
