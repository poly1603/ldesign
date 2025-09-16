/**
 * 简化版本的图片裁剪器 - 用于演示
 */

import { ref } from 'vue'

export class SimpleCropper {
  constructor(container, options = {}) {
    this.container = container
    this.options = {
      aspectRatio: 'free',
      theme: 'light',
      showGrid: true,
      responsive: true,
      ...options
    }
    
    this.image = null
    this.cropData = {
      x: 0,
      y: 0,
      width: 200,
      height: 200
    }
    
    this.eventListeners = new Map()
    this.isReady = false
    
    this.init()
  }
  
  init() {
    if (!this.container) {
      throw new Error('Container element is required')
    }
    
    // 创建基本的DOM结构
    this.container.innerHTML = `
      <div class="simple-cropper">
        <div class="cropper-canvas-container">
          <canvas class="cropper-canvas"></canvas>
          <div class="cropper-crop-box">
            <div class="cropper-view-box"></div>
            <div class="cropper-dashed dashed-h"></div>
            <div class="cropper-dashed dashed-v"></div>
            <div class="cropper-center"></div>
            <div class="cropper-face"></div>
            <div class="cropper-line line-e"></div>
            <div class="cropper-line line-n"></div>
            <div class="cropper-line line-w"></div>
            <div class="cropper-line line-s"></div>
            <div class="cropper-point point-e"></div>
            <div class="cropper-point point-n"></div>
            <div class="cropper-point point-w"></div>
            <div class="cropper-point point-s"></div>
            <div class="cropper-point point-ne"></div>
            <div class="cropper-point point-nw"></div>
            <div class="cropper-point point-sw"></div>
            <div class="cropper-point point-se"></div>
          </div>
        </div>
      </div>
    `
    
    this.canvas = this.container.querySelector('.cropper-canvas')
    this.ctx = this.canvas.getContext('2d')
    this.cropBox = this.container.querySelector('.cropper-crop-box')
    
    // 添加基本样式
    this.addStyles()

    // 添加事件监听
    this.addEventListeners()

    this.isReady = true
    this.emit('ready', { type: 'ready' })
  }

  addEventListeners() {
    if (!this.cropBox) return

    let isDragging = false
    let startX = 0
    let startY = 0
    let startLeft = 0
    let startTop = 0

    // 裁剪框拖拽
    this.cropBox.addEventListener('mousedown', (e) => {
      if (e.target === this.cropBox || e.target.classList.contains('cropper-face')) {
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        startLeft = parseInt(this.cropBox.style.left) || 0
        startTop = parseInt(this.cropBox.style.top) || 0
        e.preventDefault()
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return

      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      const newLeft = startLeft + deltaX
      const newTop = startTop + deltaY

      // 边界检查
      const containerRect = this.container.getBoundingClientRect()
      const cropBoxRect = this.cropBox.getBoundingClientRect()

      if (newLeft >= 0 && newLeft + cropBoxRect.width <= containerRect.width) {
        this.cropBox.style.left = `${newLeft}px`
      }

      if (newTop >= 0 && newTop + cropBoxRect.height <= containerRect.height) {
        this.cropBox.style.top = `${newTop}px`
      }

      this.updateCropDataFromBox()
    })

    document.addEventListener('mouseup', () => {
      isDragging = false
    })
  }

  updateCropDataFromBox() {
    if (!this.cropBox) return

    const left = parseInt(this.cropBox.style.left) || 0
    const top = parseInt(this.cropBox.style.top) || 0
    const width = parseInt(this.cropBox.style.width) || 200
    const height = parseInt(this.cropBox.style.height) || 200

    this.cropData = { x: left, y: top, width, height }

    this.emit('cropChange', {
      type: 'cropChange',
      cropData: this.cropData
    })
  }

  addStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .simple-cropper {
        position: relative;
        width: 100%;
        height: 400px;
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
      }
      
      .cropper-canvas-container {
        position: relative;
        width: 100%;
        height: 100%;
      }
      
      .cropper-canvas {
        max-width: 100%;
        max-height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
      
      .cropper-crop-box {
        position: absolute;
        top: 50px;
        left: 50px;
        width: 200px;
        height: 200px;
        border: 2px solid #39f;
        cursor: move;
      }
      
      .cropper-view-box {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: 1px solid #39f;
        outline-color: rgba(51, 153, 255, 0.75);
      }
      
      .cropper-dashed {
        position: absolute;
        border: 0 dashed #eee;
      }
      
      .dashed-h {
        top: 33.33333%;
        left: 0;
        width: 100%;
        height: 33.33333%;
        border-top-width: 1px;
        border-bottom-width: 1px;
      }
      
      .dashed-v {
        top: 0;
        left: 33.33333%;
        width: 33.33333%;
        height: 100%;
        border-left-width: 1px;
        border-right-width: 1px;
      }
      
      .cropper-center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        background: #39f;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.75;
      }
      
      .cropper-point {
        position: absolute;
        width: 8px;
        height: 8px;
        background: #39f;
        border-radius: 50%;
      }
      
      .point-e { top: 50%; right: -4px; transform: translateY(-50%); cursor: e-resize; }
      .point-n { top: -4px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
      .point-w { top: 50%; left: -4px; transform: translateY(-50%); cursor: w-resize; }
      .point-s { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
      .point-ne { top: -4px; right: -4px; cursor: ne-resize; }
      .point-nw { top: -4px; left: -4px; cursor: nw-resize; }
      .point-sw { bottom: -4px; left: -4px; cursor: sw-resize; }
      .point-se { bottom: -4px; right: -4px; cursor: se-resize; }
    `
    
    if (!document.querySelector('#simple-cropper-styles')) {
      style.id = 'simple-cropper-styles'
      document.head.appendChild(style)
    }
  }
  
  async setImageSource(source) {
    try {
      this.emit('imageLoad', { type: 'imageLoad' })
      
      let imageUrl
      if (source instanceof File) {
        imageUrl = URL.createObjectURL(source)
      } else if (typeof source === 'string') {
        imageUrl = source
      } else {
        throw new Error('Unsupported image source')
      }
      
      const img = new Image()
      img.onload = () => {
        this.image = img
        this.drawImage()
        this.emit('imageLoad', { 
          type: 'imageLoad',
          imageData: {
            width: img.naturalWidth,
            height: img.naturalHeight
          }
        })
      }
      
      img.onerror = () => {
        this.emit('error', new Error('Failed to load image'))
      }
      
      img.src = imageUrl
      
    } catch (error) {
      this.emit('error', error)
    }
  }
  
  drawImage() {
    if (!this.image || !this.canvas) return

    const containerRect = this.container.getBoundingClientRect()
    const maxWidth = containerRect.width - 20
    const maxHeight = containerRect.height - 20

    let { width, height } = this.image

    // 计算适合容器的尺寸
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width *= ratio
    height *= ratio

    this.canvas.width = width
    this.canvas.height = height

    this.ctx.clearRect(0, 0, width, height)
    this.ctx.drawImage(this.image, 0, 0, width, height)

    // 更新裁剪框位置
    this.updateCropBox()

    // 触发图片加载完成事件
    this.emit('imageLoad', {
      type: 'imageLoad',
      imageData: {
        width: this.image.naturalWidth,
        height: this.image.naturalHeight,
        displayWidth: width,
        displayHeight: height
      }
    })
  }

  updateCropBox() {
    if (!this.cropBox || !this.canvas) return

    const canvasRect = this.canvas.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    // 计算裁剪框相对于容器的位置
    const left = canvasRect.left - containerRect.left + 50
    const top = canvasRect.top - containerRect.top + 50

    this.cropBox.style.left = `${left}px`
    this.cropBox.style.top = `${top}px`

    // 确保裁剪框不超出图片边界
    const maxWidth = Math.min(200, canvasRect.width - 100)
    const maxHeight = Math.min(200, canvasRect.height - 100)

    this.cropBox.style.width = `${maxWidth}px`
    this.cropBox.style.height = `${maxHeight}px`

    // 更新裁剪数据
    this.cropData = {
      x: 50,
      y: 50,
      width: maxWidth,
      height: maxHeight
    }

    this.emit('cropChange', {
      type: 'cropChange',
      cropData: this.cropData
    })
  }
  
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }
  
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }
  
  async export(options = {}) {
    const { format = 'png', quality = 0.9 } = options
    
    if (!this.image) {
      throw new Error('No image loaded')
    }
    
    // 创建导出canvas
    const exportCanvas = document.createElement('canvas')
    const exportCtx = exportCanvas.getContext('2d')
    
    exportCanvas.width = this.cropData.width
    exportCanvas.height = this.cropData.height
    
    // 绘制裁剪区域
    exportCtx.drawImage(
      this.image,
      this.cropData.x, this.cropData.y, this.cropData.width, this.cropData.height,
      0, 0, this.cropData.width, this.cropData.height
    )
    
    return {
      canvas: exportCanvas,
      dataURL: exportCanvas.toDataURL(`image/${format}`, quality),
      blob: await new Promise(resolve => {
        exportCanvas.toBlob(resolve, `image/${format}`, quality)
      })
    }
  }
  
  // 添加一些实用方法
  rotate(angle) {
    // 简化版旋转 - 只是触发事件
    this.emit('rotate', { type: 'rotate', angle })
    console.log(`旋转 ${angle} 度`)
  }

  scale(factor) {
    // 简化版缩放 - 只是触发事件
    this.emit('scale', { type: 'scale', factor })
    console.log(`缩放 ${factor} 倍`)
  }

  flip(direction) {
    // 简化版翻转 - 只是触发事件
    this.emit('flip', { type: 'flip', direction })
    console.log(`${direction} 翻转`)
  }

  reset() {
    // 重置裁剪区域
    if (this.cropBox) {
      this.cropBox.style.left = '50px'
      this.cropBox.style.top = '50px'
      this.cropBox.style.width = '200px'
      this.cropBox.style.height = '200px'
      this.updateCropDataFromBox()
    }
    this.emit('reset', { type: 'reset' })
    console.log('重置裁剪区域')
  }

  setCropArea(cropData) {
    if (!this.cropBox || !cropData) return

    this.cropBox.style.left = `${cropData.x}px`
    this.cropBox.style.top = `${cropData.y}px`
    this.cropBox.style.width = `${cropData.width}px`
    this.cropBox.style.height = `${cropData.height}px`

    this.updateCropDataFromBox()
  }

  getCropData() {
    return { ...this.cropData }
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.eventListeners.clear()
    this.isReady = false
  }
}

// Vue 组件
export const SimpleImageCropper = {
  name: 'SimpleImageCropper',
  props: {
    src: String,
    theme: { type: String, default: 'light' },
    aspectRatio: { type: String, default: 'free' },
    showToolbar: { type: Boolean, default: true },
    showControlPanel: { type: Boolean, default: false }
  },
  emits: ['ready', 'crop-change', 'export', 'error'],
  template: `
    <div class="simple-image-cropper">
      <div ref="cropperContainer" class="cropper-container"></div>
    </div>
  `,
  mounted() {
    this.initCropper()
  },
  beforeUnmount() {
    if (this.cropper) {
      this.cropper.destroy()
    }
  },
  methods: {
    initCropper() {
      this.cropper = new SimpleCropper(this.$refs.cropperContainer, {
        theme: this.theme,
        aspectRatio: this.aspectRatio
      })
      
      this.cropper.on('ready', (data) => {
        this.$emit('ready', data)
      })
      
      this.cropper.on('crop-change', (data) => {
        this.$emit('crop-change', data)
      })
      
      this.cropper.on('error', (error) => {
        this.$emit('error', error)
      })
      
      if (this.src) {
        this.cropper.setImageSource(this.src)
      }
    },
    
    async exportImage(options) {
      if (this.cropper) {
        const result = await this.cropper.export(options)
        this.$emit('export', result)
        return result
      }
    }
  },
  watch: {
    src(newSrc) {
      if (this.cropper && newSrc) {
        this.cropper.setImageSource(newSrc)
      }
    }
  }
}

// Vue Hook
export function useSimpleCropper(options = {}) {
  const cropperRef = ref(null)
  const cropper = ref(null)
  const isReady = ref(false)
  const cropData = ref(null)
  
  const initCropper = () => {
    if (cropperRef.value && !cropper.value) {
      cropper.value = new SimpleCropper(cropperRef.value, options)
      
      cropper.value.on('ready', () => {
        isReady.value = true
      })
      
      cropper.value.on('crop-change', (data) => {
        cropData.value = data.cropData
      })
    }
  }
  
  const setImageSource = async (source) => {
    if (cropper.value) {
      await cropper.value.setImageSource(source)
    }
  }
  
  const exportImage = async (exportOptions) => {
    if (cropper.value) {
      return await cropper.value.export(exportOptions)
    }
  }
  
  return {
    cropperRef,
    cropper,
    isReady,
    cropData,
    initCropper,
    setImageSource,
    exportImage
  }
}

// Vue 指令
export const vSimpleCropper = {
  mounted(el, binding) {
    const options = binding.value || {}
    const cropper = new SimpleCropper(el, options)
    el._simpleCropper = cropper
  },

  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      const cropper = el._simpleCropper
      if (cropper && binding.value.src) {
        cropper.setImageSource(binding.value.src)
      }
    }
  },

  unmounted(el) {
    if (el._simpleCropper) {
      el._simpleCropper.destroy()
      delete el._simpleCropper
    }
  }
}

// 获取指令实例
export const getSimpleCropperInstance = (el) => {
  return el._simpleCropper
}
