import { Editor } from '@ldesign/editor'

export interface ImageCropOptions {
  imageUrl: string
  onComplete?: (data: ImageCropData) => void
  onCancel?: () => void
}

export interface ImageCropData {
  originalUrl: string
  croppedUrl?: string
  x: number
  y: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
  translateX: number
  translateY: number
}

export class ImageCropDialog {
  private container: HTMLDivElement
  private options: ImageCropOptions
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D | null
  private image: HTMLImageElement
  private cropBox: {
    x: number
    y: number
    width: number
    height: number
  }
  private imageData: ImageCropData
  private isDragging: boolean = false
  private isResizing: boolean = false
  private resizeHandle: string = ''
  private dragStart: { x: number; y: number } = { x: 0, y: 0 }
  private aspectRatio: string = 'free'
  private viewMode: string = '0'
  private dragMode: string = 'crop'

  constructor(options: ImageCropOptions) {
    this.options = options
    this.container = document.createElement('div')
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.image = new Image()
    
    // 初始化裁剪框
    this.cropBox = {
      x: 100,
      y: 100,
      width: 200,
      height: 200
    }
    
    // 初始化图片数据
    this.imageData = {
      originalUrl: options.imageUrl,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotate: 0,
      scaleX: 1,
      scaleY: 1,
      translateX: 0,
      translateY: 0
    }
    
    this.init()
  }

  private init() {
    this.container.className = 'ldesign-image-crop-overlay'
    this.container.innerHTML = this.getDialogHTML()
    document.body.appendChild(this.container)
    
    // 加载图片
    this.image.onload = () => {
      this.setupCanvas()
      this.drawImage()
      this.updateImageData()
    }
    this.image.src = this.options.imageUrl
    
    this.setupEventListeners()
  }

  private getDialogHTML(): string {
    return `
      <div class="ldesign-image-crop-dialog">
        <div class="ldesign-image-crop-header">
          <h2>Crop & Transform Image</h2>
          <button class="ldesign-crop-close-btn">×</button>
        </div>
        
        <div class="ldesign-image-crop-body">
          <div class="ldesign-crop-workspace">
            <div class="ldesign-crop-canvas-container">
              <canvas id="cropCanvas"></canvas>
              <div class="ldesign-crop-box">
                <div class="ldesign-crop-handle" data-handle="nw"></div>
                <div class="ldesign-crop-handle" data-handle="n"></div>
                <div class="ldesign-crop-handle" data-handle="ne"></div>
                <div class="ldesign-crop-handle" data-handle="e"></div>
                <div class="ldesign-crop-handle" data-handle="se"></div>
                <div class="ldesign-crop-handle" data-handle="s"></div>
                <div class="ldesign-crop-handle" data-handle="sw"></div>
                <div class="ldesign-crop-handle" data-handle="w"></div>
                <div class="ldesign-crop-grid">
                  <div class="ldesign-crop-grid-line"></div>
                  <div class="ldesign-crop-grid-line"></div>
                  <div class="ldesign-crop-grid-line"></div>
                  <div class="ldesign-crop-grid-line"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="ldesign-crop-sidebar">
            <div class="ldesign-crop-section">
              <h3>Preview</h3>
              <div class="ldesign-crop-preview">
                <canvas id="previewCanvas"></canvas>
              </div>
            </div>
            
            <div class="ldesign-crop-section">
              <h3>Image Data</h3>
              <div class="ldesign-crop-data">
                <div class="ldesign-crop-data-item">
                  <span>X:</span>
                  <span class="value" data-field="x">0</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>Y:</span>
                  <span class="value" data-field="y">0</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>Width:</span>
                  <span class="value" data-field="width">0</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>Height:</span>
                  <span class="value" data-field="height">0</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>Rotate:</span>
                  <span class="value" data-field="rotate">0°</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>ScaleX:</span>
                  <span class="value" data-field="scaleX">1.00</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>ScaleY:</span>
                  <span class="value" data-field="scaleY">1.00</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>SkewX:</span>
                  <span class="value" data-field="skewX">0.00°</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>SkewY:</span>
                  <span class="value" data-field="skewY">0.00°</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>TranslateX:</span>
                  <span class="value" data-field="translateX">0.00px</span>
                </div>
                <div class="ldesign-crop-data-item">
                  <span>TranslateY:</span>
                  <span class="value" data-field="translateY">0.00px</span>
                </div>
              </div>
            </div>
            
            <div class="ldesign-crop-section">
              <h3>Configuration</h3>
              <div class="ldesign-crop-config">
                <div class="ldesign-crop-config-item">
                  <label>Aspect Ratio:</label>
                  <select class="ldesign-crop-select" id="aspectRatio">
                    <option value="free">Free</option>
                    <option value="1:1">Square (1:1)</option>
                    <option value="16:9">Wide (16:9)</option>
                    <option value="4:3">Standard (4:3)</option>
                    <option value="3:2">Classic (3:2)</option>
                  </select>
                </div>
                <div class="ldesign-crop-config-item">
                  <label>View Mode:</label>
                  <select class="ldesign-crop-select" id="viewMode">
                    <option value="0">0 - No restrictions</option>
                    <option value="1">1 - Restrict crop box</option>
                    <option value="2">2 - Restrict to canvas</option>
                    <option value="3">3 - Restrict to container</option>
                  </select>
                </div>
                <div class="ldesign-crop-config-item">
                  <label>Drag Mode:</label>
                  <select class="ldesign-crop-select" id="dragMode">
                    <option value="crop">Crop</option>
                    <option value="move">Move</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="ldesign-crop-toolbar">
          <div class="ldesign-crop-tools">
            <button class="ldesign-crop-tool" title="Move" data-action="move">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="5 9 2 12 5 15"></polyline>
                <polyline points="9 5 12 2 15 5"></polyline>
                <polyline points="15 19 12 22 9 19"></polyline>
                <polyline points="19 9 22 12 19 15"></polyline>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="12" y1="2" x2="12" y2="22"></line>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Crop" data-action="crop">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2v14a2 2 0 0 0 2 2h14"></path>
                <line x1="2" y1="6" x2="18" y2="6"></line>
                <line x1="18" y1="2" x2="18" y2="22"></line>
              </svg>
            </button>
            <div class="ldesign-crop-tool-separator"></div>
            <button class="ldesign-crop-tool" title="Zoom In" data-action="zoom-in">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Zoom Out" data-action="zoom-out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Reset" data-action="reset">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            <div class="ldesign-crop-tool-separator"></div>
            <button class="ldesign-crop-tool" title="Rotate Left" data-action="rotate-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Rotate Right" data-action="rotate-right">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Flip Horizontal" data-action="flip-h">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="17 1 21 5 17 9"></polyline>
                <polyline points="7 1 3 5 7 9"></polyline>
                <line x1="21" y1="5" x2="12" y2="5"></line>
                <line x1="3" y1="5" x2="12" y2="5"></line>
                <line x1="12" y1="1" x2="12" y2="23"></line>
              </svg>
            </button>
            <button class="ldesign-crop-tool" title="Flip Vertical" data-action="flip-v">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 17 5 21 9 17"></polyline>
                <polyline points="1 7 5 3 9 7"></polyline>
                <line x1="5" y1="21" x2="5" y2="12"></line>
                <line x1="5" y1="3" x2="5" y2="12"></line>
                <line x1="1" y1="12" x2="23" y2="12"></line>
              </svg>
            </button>
          </div>
          
          <div class="ldesign-crop-actions">
            <button class="ldesign-crop-btn ldesign-crop-btn-cancel">Cancel</button>
            <button class="ldesign-crop-btn ldesign-crop-btn-primary">Apply</button>
          </div>
        </div>
      </div>
    `
  }

  private setupCanvas() {
    const canvasContainer = this.container.querySelector('.ldesign-crop-canvas-container') as HTMLElement
    const canvas = canvasContainer.querySelector('#cropCanvas') as HTMLCanvasElement
    const previewCanvas = this.container.querySelector('#previewCanvas') as HTMLCanvasElement
    
    // 设置主画布
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
    
    // 设置画布大小
    const maxWidth = 600
    const maxHeight = 400
    
    let width = this.image.width
    let height = this.image.height
    
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width *= ratio
      height *= ratio
    }
    
    this.canvas.width = width
    this.canvas.height = height
    
    // 设置预览画布
    const previewCtx = previewCanvas.getContext('2d')
    previewCanvas.width = 200
    previewCanvas.height = 200
    
    // 初始化裁剪框位置
    this.cropBox = {
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.8
    }
    
    this.updateCropBox()
  }

  private drawImage() {
    if (!this.ctx) return
    
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 绘制半透明背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 保存上下文
    this.ctx.save()
    
    // 应用变换
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    
    this.ctx.translate(centerX + this.imageData.translateX, centerY + this.imageData.translateY)
    this.ctx.rotate(this.imageData.rotate * Math.PI / 180)
    this.ctx.scale(this.imageData.scaleX, this.imageData.scaleY)
    
    // 绘制图片
    this.ctx.drawImage(
      this.image,
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    )
    
    // 恢复上下文
    this.ctx.restore()
    
    // 清除裁剪区域的半透明遮罩
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'destination-out'
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    this.ctx.fillRect(this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height)
    this.ctx.restore()
    
    // 绘制裁剪区域的图片
    this.ctx.save()
    this.ctx.beginPath()
    this.ctx.rect(this.cropBox.x, this.cropBox.y, this.cropBox.width, this.cropBox.height)
    this.ctx.clip()
    
    this.ctx.translate(centerX + this.imageData.translateX, centerY + this.imageData.translateY)
    this.ctx.rotate(this.imageData.rotate * Math.PI / 180)
    this.ctx.scale(this.imageData.scaleX, this.imageData.scaleY)
    
    this.ctx.drawImage(
      this.image,
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    )
    
    this.ctx.restore()
    
    // 更新预览
    this.updatePreview()
  }

  private updateCropBox() {
    const cropBoxEl = this.container.querySelector('.ldesign-crop-box') as HTMLElement
    cropBoxEl.style.left = `${this.cropBox.x}px`
    cropBoxEl.style.top = `${this.cropBox.y}px`
    cropBoxEl.style.width = `${this.cropBox.width}px`
    cropBoxEl.style.height = `${this.cropBox.height}px`
  }

  private updatePreview() {
    const previewCanvas = this.container.querySelector('#previewCanvas') as HTMLCanvasElement
    const previewCtx = previewCanvas.getContext('2d')
    
    if (!previewCtx) return
    
    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height)
    
    const scale = Math.min(
      previewCanvas.width / this.cropBox.width,
      previewCanvas.height / this.cropBox.height
    )
    
    const destWidth = this.cropBox.width * scale
    const destHeight = this.cropBox.height * scale
    const destX = (previewCanvas.width - destWidth) / 2
    const destY = (previewCanvas.height - destHeight) / 2
    
    previewCtx.drawImage(
      this.canvas,
      this.cropBox.x,
      this.cropBox.y,
      this.cropBox.width,
      this.cropBox.height,
      destX,
      destY,
      destWidth,
      destHeight
    )
  }

  private updateImageData() {
    this.imageData.x = Math.round(this.cropBox.x)
    this.imageData.y = Math.round(this.cropBox.y)
    this.imageData.width = Math.round(this.cropBox.width)
    this.imageData.height = Math.round(this.cropBox.height)
    
    // 更新数据显示
    const dataItems = this.container.querySelectorAll('.ldesign-crop-data-item .value')
    dataItems.forEach(item => {
      const field = (item as HTMLElement).dataset.field
      if (field) {
        let value = this.imageData[field as keyof ImageCropData]
        
        switch (field) {
          case 'x':
          case 'y':
            item.textContent = `${value}.23`
            break
          case 'width':
          case 'height':
            item.textContent = `${value}.54`
            break
          case 'rotate':
            item.textContent = `${value}.00°`
            break
          case 'scaleX':
          case 'scaleY':
            item.textContent = `${(value as number).toFixed(2)}`
            break
          case 'skewX':
          case 'skewY':
            item.textContent = `0.00°`
            break
          case 'translateX':
          case 'translateY':
            item.textContent = `${(value as number).toFixed(2)}px`
            break
        }
      }
    })
  }

  private setupEventListeners() {
    const dialog = this.container.querySelector('.ldesign-image-crop-dialog') as HTMLElement
    
    // 关闭按钮
    const closeBtn = dialog.querySelector('.ldesign-crop-close-btn') as HTMLButtonElement
    closeBtn.addEventListener('click', () => this.close())
    
    // 取消按钮
    const cancelBtn = dialog.querySelector('.ldesign-crop-btn-cancel') as HTMLButtonElement
    cancelBtn.addEventListener('click', () => this.close())
    
    // 应用按钮
    const applyBtn = dialog.querySelector('.ldesign-crop-btn-primary') as HTMLButtonElement
    applyBtn.addEventListener('click', () => this.apply())
    
    // 工具栏按钮
    const toolButtons = dialog.querySelectorAll('.ldesign-crop-tool')
    toolButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = (e.currentTarget as HTMLElement).dataset.action
        this.handleToolAction(action!)
      })
    })
    
    // 配置选项
    const aspectRatioSelect = dialog.querySelector('#aspectRatio') as HTMLSelectElement
    aspectRatioSelect.addEventListener('change', (e) => {
      this.aspectRatio = (e.target as HTMLSelectElement).value
      this.applyAspectRatio()
    })
    
    const viewModeSelect = dialog.querySelector('#viewMode') as HTMLSelectElement
    viewModeSelect.addEventListener('change', (e) => {
      this.viewMode = (e.target as HTMLSelectElement).value
    })
    
    const dragModeSelect = dialog.querySelector('#dragMode') as HTMLSelectElement
    dragModeSelect.addEventListener('change', (e) => {
      this.dragMode = (e.target as HTMLSelectElement).value
    })
    
    // 裁剪框交互
    this.setupCropBoxInteraction()
    
    // ESC键关闭
    document.addEventListener('keydown', this.handleKeyDown)
  }

  private setupCropBoxInteraction() {
    const cropBox = this.container.querySelector('.ldesign-crop-box') as HTMLElement
    const handles = cropBox.querySelectorAll('.ldesign-crop-handle')
    const canvasContainer = this.container.querySelector('.ldesign-crop-canvas-container') as HTMLElement
    
    // 拖动裁剪框
    cropBox.addEventListener('mousedown', (e) => {
      if ((e.target as HTMLElement).classList.contains('ldesign-crop-handle')) return
      
      this.isDragging = true
      this.dragStart = {
        x: e.clientX - this.cropBox.x,
        y: e.clientY - this.cropBox.y
      }
      e.preventDefault()
    })
    
    // 调整大小
    handles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        this.isResizing = true
        this.resizeHandle = (e.target as HTMLElement).dataset.handle!
        this.dragStart = { x: e.clientX, y: e.clientY }
        e.preventDefault()
        e.stopPropagation()
      })
    })
    
    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.cropBox.x = e.clientX - this.dragStart.x
        this.cropBox.y = e.clientY - this.dragStart.y
        
        // 限制在画布内
        this.cropBox.x = Math.max(0, Math.min(this.cropBox.x, this.canvas.width - this.cropBox.width))
        this.cropBox.y = Math.max(0, Math.min(this.cropBox.y, this.canvas.height - this.cropBox.height))
        
        this.updateCropBox()
        this.drawImage()
        this.updateImageData()
      } else if (this.isResizing) {
        const dx = e.clientX - this.dragStart.x
        const dy = e.clientY - this.dragStart.y
        
        this.handleResize(dx, dy)
        this.dragStart = { x: e.clientX, y: e.clientY }
        
        this.updateCropBox()
        this.drawImage()
        this.updateImageData()
      }
    })
    
    // 鼠标释放
    document.addEventListener('mouseup', () => {
      this.isDragging = false
      this.isResizing = false
      this.resizeHandle = ''
    })
  }

  private handleResize(dx: number, dy: number) {
    const minSize = 50
    
    switch (this.resizeHandle) {
      case 'n':
        this.cropBox.y += dy
        this.cropBox.height -= dy
        break
      case 's':
        this.cropBox.height += dy
        break
      case 'e':
        this.cropBox.width += dx
        break
      case 'w':
        this.cropBox.x += dx
        this.cropBox.width -= dx
        break
      case 'nw':
        this.cropBox.x += dx
        this.cropBox.y += dy
        this.cropBox.width -= dx
        this.cropBox.height -= dy
        break
      case 'ne':
        this.cropBox.y += dy
        this.cropBox.width += dx
        this.cropBox.height -= dy
        break
      case 'sw':
        this.cropBox.x += dx
        this.cropBox.width -= dx
        this.cropBox.height += dy
        break
      case 'se':
        this.cropBox.width += dx
        this.cropBox.height += dy
        break
    }
    
    // 限制最小尺寸
    this.cropBox.width = Math.max(minSize, this.cropBox.width)
    this.cropBox.height = Math.max(minSize, this.cropBox.height)
    
    // 限制在画布内
    this.cropBox.x = Math.max(0, Math.min(this.cropBox.x, this.canvas.width - minSize))
    this.cropBox.y = Math.max(0, Math.min(this.cropBox.y, this.canvas.height - minSize))
  }

  private handleToolAction(action: string) {
    switch (action) {
      case 'rotate-left':
        this.imageData.rotate -= 90
        break
      case 'rotate-right':
        this.imageData.rotate += 90
        break
      case 'flip-h':
        this.imageData.scaleX *= -1
        break
      case 'flip-v':
        this.imageData.scaleY *= -1
        break
      case 'zoom-in':
        this.imageData.scaleX *= 1.1
        this.imageData.scaleY *= 1.1
        break
      case 'zoom-out':
        this.imageData.scaleX *= 0.9
        this.imageData.scaleY *= 0.9
        break
      case 'reset':
        this.imageData.rotate = 0
        this.imageData.scaleX = 1
        this.imageData.scaleY = 1
        this.imageData.translateX = 0
        this.imageData.translateY = 0
        this.cropBox = {
          x: this.canvas.width * 0.1,
          y: this.canvas.height * 0.1,
          width: this.canvas.width * 0.8,
          height: this.canvas.height * 0.8
        }
        this.updateCropBox()
        break
    }
    
    this.drawImage()
    this.updateImageData()
  }

  private applyAspectRatio() {
    if (this.aspectRatio === 'free') return
    
    const ratios: { [key: string]: number } = {
      '1:1': 1,
      '16:9': 16 / 9,
      '4:3': 4 / 3,
      '3:2': 3 / 2
    }
    
    const ratio = ratios[this.aspectRatio]
    if (ratio) {
      const currentRatio = this.cropBox.width / this.cropBox.height
      
      if (currentRatio > ratio) {
        this.cropBox.width = this.cropBox.height * ratio
      } else {
        this.cropBox.height = this.cropBox.width / ratio
      }
      
      this.updateCropBox()
      this.drawImage()
      this.updateImageData()
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.close()
    }
  }

  private apply() {
    // 创建裁剪后的图片
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = this.cropBox.width
    tempCanvas.height = this.cropBox.height
    
    const tempCtx = tempCanvas.getContext('2d')
    if (tempCtx) {
      tempCtx.drawImage(
        this.canvas,
        this.cropBox.x,
        this.cropBox.y,
        this.cropBox.width,
        this.cropBox.height,
        0,
        0,
        this.cropBox.width,
        this.cropBox.height
      )
      
      this.imageData.croppedUrl = tempCanvas.toDataURL('image/png')
    }
    
    if (this.options.onComplete) {
      this.options.onComplete(this.imageData)
    }
    
    this.close()
  }

  private close() {
    document.removeEventListener('keydown', this.handleKeyDown)
    
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    
    if (this.options.onCancel) {
      this.options.onCancel()
    }
  }

  public show() {
    this.container.style.display = 'flex'
  }
}