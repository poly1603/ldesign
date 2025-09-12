/**
 * 简单的构建脚本，用于生成可在浏览器中使用的JavaScript文件
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 创建一个简化版本的Cropper类，用于测试工具栏
const cropperCode = `
/**
 * 简化版Cropper类，用于测试工具栏功能
 */
class SimpleCropper {
  constructor(options) {
    this.options = options
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container)
      : options.container
    
    if (!this.container) {
      throw new Error('Container not found')
    }
    
    this.currentImage = null
    this.toolbar = null
    
    // 初始化工具栏
    if (options.toolbar && options.toolbar.show !== false) {
      this.initializeToolbar(options.toolbar)
    }
  }
  
  async setImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.currentImage = img
        this.renderCropper()
        resolve()
      }
      img.onerror = reject
      img.crossOrigin = 'anonymous'
      img.src = src
    })
  }
  
  renderCropper() {
    if (!this.currentImage) return
    
    const containerRect = this.container.getBoundingClientRect()
    const imgAspect = this.currentImage.naturalWidth / this.currentImage.naturalHeight
    const containerAspect = containerRect.width / containerRect.height
    
    let displayWidth, displayHeight
    if (imgAspect > containerAspect) {
      displayWidth = containerRect.width * 0.8
      displayHeight = displayWidth / imgAspect
    } else {
      displayHeight = containerRect.height * 0.8
      displayWidth = displayHeight * imgAspect
    }
    
    this.container.innerHTML = \`
      <div style="position: relative; width: 100%; height: 100%; background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        <img src="\${this.currentImage.src}" 
             style="width: \${displayWidth}px; height: \${displayHeight}px; object-fit: contain;">
        
        <!-- 裁剪区域 -->
        <div style="position: absolute; 
             border: 2px solid #722ED1;
             background: rgba(114, 46, 209, 0.1);
             left: 50px; top: 50px; width: 200px; height: 150px;
             cursor: move;
             box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);">
        </div>
      </div>
    \`
    
    // 重新初始化工具栏
    if (this.toolbar) {
      this.toolbar.render()
    }
  }
  
  initializeToolbar(config) {
    this.toolbar = new SimpleToolbar(this.container, this, config)
  }
  
  // 工具栏功能方法
  zoom(ratio) {
    console.log('缩放:', ratio)
  }
  
  rotate(angle) {
    console.log('旋转:', angle)
  }
  
  scaleX(scale) {
    console.log('水平缩放:', scale)
  }
  
  scaleY(scale) {
    console.log('垂直缩放:', scale)
  }
  
  reset() {
    console.log('重置')
    if (this.currentImage) {
      this.renderCropper()
    }
  }
  
  setShape(shape) {
    console.log('设置形状:', shape)
  }
  
  setAspectRatio(ratio) {
    console.log('设置宽高比:', ratio)
  }
  
  updateConfig(config) {
    console.log('更新配置:', config)
  }
  
  getCroppedCanvas() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // 设置裁剪区域尺寸
    const cropWidth = 200
    const cropHeight = 150
    canvas.width = cropWidth
    canvas.height = cropHeight

    if (this.currentImage) {
      // 计算图片在容器中的显示尺寸
      const containerRect = this.container.getBoundingClientRect()
      const imgAspect = this.currentImage.naturalWidth / this.currentImage.naturalHeight
      const containerAspect = containerRect.width / containerRect.height

      let displayWidth, displayHeight
      if (imgAspect > containerAspect) {
        displayWidth = containerRect.width * 0.8
        displayHeight = displayWidth / imgAspect
      } else {
        displayHeight = containerRect.height * 0.8
        displayWidth = displayHeight * imgAspect
      }

      // 计算裁剪区域在原图中的位置和尺寸
      const scaleX = this.currentImage.naturalWidth / displayWidth
      const scaleY = this.currentImage.naturalHeight / displayHeight

      // 裁剪区域在显示图片中的位置（固定为50, 50, 200, 150）
      const cropX = 50 * scaleX
      const cropY = 50 * scaleY
      const cropSourceWidth = cropWidth * scaleX
      const cropSourceHeight = cropHeight * scaleY

      // 绘制裁剪后的图片
      ctx.drawImage(
        this.currentImage,
        cropX, cropY, cropSourceWidth, cropSourceHeight,  // 源图片裁剪区域
        0, 0, cropWidth, cropHeight  // 目标canvas区域
      )
    } else {
      // 如果没有图片，绘制一个占位符
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, cropWidth, cropHeight)
      ctx.fillStyle = '#999'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('No Image', cropWidth / 2, cropHeight / 2)
    }

    return canvas
  }

  getCroppedDataURL(config = {}) {
    const canvas = this.getCroppedCanvas()
    const format = config.format || 'image/png'
    const quality = config.quality || 0.9
    return canvas.toDataURL(format, quality)
  }

  async getCroppedBlob(config = {}) {
    const canvas = this.getCroppedCanvas()
    const format = config.format || 'image/png'
    const quality = config.quality || 0.9

    return new Promise((resolve) => {
      canvas.toBlob(resolve, format, quality)
    })
  }

  on(event, callback) {
    console.log('监听事件:', event)
  }
}

/**
 * 简化版工具栏类
 */
class SimpleToolbar {
  constructor(container, cropper, config) {
    this.container = container
    this.cropper = cropper
    this.config = {
      show: true,
      position: 'bottom',
      theme: 'light',
      ...config
    }
    
    this.render()
  }
  
  render() {
    // 移除现有工具栏
    const existing = this.container.querySelector('.ldesign-cropper__toolbar')
    if (existing) {
      existing.remove()
    }
    
    if (!this.config.show) return
    
    const toolbar = document.createElement('div')
    toolbar.className = \`ldesign-cropper__toolbar ldesign-cropper__toolbar--\${this.config.position}\`
    toolbar.setAttribute('data-theme', this.config.theme)
    
    toolbar.innerHTML = \`
      <button class="ldesign-cropper__toolbar-button" data-tool="zoom-in" title="放大">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="zoom-out" title="缩小">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="rotate-left" title="左转">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="rotate-right" title="右转">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="flip-horizontal" title="水平翻转">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/><path d="M12 20v2"/><path d="M12 14v2"/><path d="M12 8v2"/><path d="M12 2v2"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="flip-vertical" title="垂直翻转">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M4 12H2"/><path d="M10 12H8"/><path d="M16 12h-2"/><path d="M22 12h-2"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button ldesign-cropper__toolbar-button--active" data-tool="shape-rectangle" title="矩形">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="shape-circle" title="圆形">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </button>
      
      <select class="ldesign-cropper__toolbar-select" data-tool="aspect-ratio" title="宽高比">
        <option value="">自由</option>
        <option value="1">1:1</option>
        <option value="1.333">4:3</option>
        <option value="1.777">16:9</option>
        <option value="0.75">3:4</option>
      </select>
      
      <select class="ldesign-cropper__toolbar-select" data-tool="mask-opacity" title="遮罩透明度">
        <option value="0">0%</option>
        <option value="0.25">25%</option>
        <option value="0.5" selected>50%</option>
        <option value="0.75">75%</option>
        <option value="1">100%</option>
      </select>
      
      <select class="ldesign-cropper__toolbar-select" data-tool="export-format" title="导出格式">
        <option value="png">PNG</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WEBP</option>
      </select>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="crop" title="裁剪">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>
        </svg>
      </button>
      
      <button class="ldesign-cropper__toolbar-button" data-tool="download" title="下载">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </button>
    \`
    
    this.container.appendChild(toolbar)
    this.bindEvents(toolbar)
  }
  
  bindEvents(toolbar) {
    const buttons = toolbar.querySelectorAll('.ldesign-cropper__toolbar-button')
    const selects = toolbar.querySelectorAll('.ldesign-cropper__toolbar-select')
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const tool = button.getAttribute('data-tool')
        this.handleToolClick(tool, button)
      })
    })
    
    selects.forEach(select => {
      select.addEventListener('change', () => {
        const tool = select.getAttribute('data-tool')
        const value = select.value
        this.handleSelectChange(tool, value)
      })
    })
  }
  
  handleToolClick(tool, button) {
    console.log('工具点击:', tool)
    
    switch (tool) {
      case 'zoom-in':
        this.cropper.zoom(1.1)
        break
      case 'zoom-out':
        this.cropper.zoom(0.9)
        break
      case 'rotate-left':
        this.cropper.rotate(-90)
        break
      case 'rotate-right':
        this.cropper.rotate(90)
        break
      case 'flip-horizontal':
        this.cropper.scaleX(-1)
        break
      case 'flip-vertical':
        this.cropper.scaleY(-1)
        break
      case 'reset':
        this.cropper.reset()
        break
      case 'shape-rectangle':
        this.cropper.setShape('rectangle')
        this.updateShapeButtons(button)
        break
      case 'shape-circle':
        this.cropper.setShape('circle')
        this.updateShapeButtons(button)
        break
      case 'crop':
        this.handleCrop()
        break
      case 'download':
        this.handleDownload()
        break
    }
  }
  
  handleSelectChange(tool, value) {
    console.log('选择器变更:', tool, value)
    
    switch (tool) {
      case 'aspect-ratio':
        const ratio = value ? parseFloat(value) : null
        this.cropper.setAspectRatio(ratio)
        break
      case 'mask-opacity':
        this.cropper.updateConfig({ maskOpacity: parseFloat(value) })
        break
      case 'export-format':
        console.log('导出格式:', value)
        break
    }
  }
  
  updateShapeButtons(activeButton) {
    const toolbar = activeButton.closest('.ldesign-cropper__toolbar')
    toolbar.querySelectorAll('[data-tool^="shape-"]').forEach(btn => {
      btn.classList.remove('ldesign-cropper__toolbar-button--active')
    })
    activeButton.classList.add('ldesign-cropper__toolbar-button--active')
  }
  
  handleCrop() {
    const canvas = this.cropper.getCroppedCanvas()
    const event = new CustomEvent('crop', { detail: { canvas } })
    this.container.dispatchEvent(event)
  }
  
  handleDownload() {
    const canvas = this.cropper.getCroppedCanvas()
    const link = document.createElement('a')
    link.download = \`cropped-image-\${Date.now()}.png\`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}

// 导出到全局
window.SimpleCropper = SimpleCropper
window.SimpleToolbar = SimpleToolbar
`

// 写入文件
fs.writeFileSync(path.join(__dirname, 'dist', 'simple-cropper.js'), cropperCode)
console.log('简化版Cropper已生成到 dist/simple-cropper.js')
