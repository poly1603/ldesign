/**
 * @file 批量处理UI组件
 * @description 批量处理的用户界面，包括文件上传、进度显示、操作配置等
 */

import { 
  BatchProcessor, 
  type BatchItem, 
  type BatchOperationConfig, 
  BatchStatus, 
  BatchOperation 
} from './batch-processor'

/**
 * 批量处理UI配置
 */
export interface BatchUIConfig {
  /** 主题 */
  theme: 'light' | 'dark'
  /** 是否显示预览 */
  showPreview: boolean
  /** 最大预览图片数量 */
  maxPreviewItems: number
  /** 预览图片大小 */
  previewSize: number
  /** 允许的文件类型 */
  acceptedFileTypes: string[]
  /** 最大文件大小（字节） */
  maxFileSize: number
}

/**
 * 批量处理UI类
 */
export class BatchUI {
  /** 批量处理器 */
  private batchProcessor: BatchProcessor

  /** 容器元素 */
  private container: HTMLElement

  /** 配置选项 */
  private config: BatchUIConfig

  /** UI元素引用 */
  private elements: {
    dropZone?: HTMLElement
    fileInput?: HTMLInputElement
    itemsList?: HTMLElement
    progressBar?: HTMLElement
    progressText?: HTMLElement
    operationsPanel?: HTMLElement
    controlButtons?: HTMLElement
    statusSummary?: HTMLElement
  } = {}

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: BatchUIConfig = {
    theme: 'light',
    showPreview: true,
    maxPreviewItems: 50,
    previewSize: 120,
    acceptedFileTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxFileSize: 50 * 1024 * 1024 // 50MB
  }

  /**
   * 构造函数
   */
  constructor(
    container: HTMLElement,
    batchProcessor: BatchProcessor,
    config: Partial<BatchUIConfig> = {}
  ) {
    this.container = container
    this.batchProcessor = batchProcessor
    this.config = { ...BatchUI.DEFAULT_CONFIG, ...config }

    this.init()
    this.bindEvents()
  }

  /**
   * 初始化UI
   */
  private init(): void {
    this.container.className = `batch-ui batch-ui--${this.config.theme}`
    
    this.container.innerHTML = `
      <div class="batch-ui__header">
        <h2 class="batch-ui__title">批量处理</h2>
        <div class="batch-ui__status-summary">
          <span class="batch-ui__item-count">0 项目</span>
          <span class="batch-ui__separator">·</span>
          <span class="batch-ui__status-text">准备就绪</span>
        </div>
      </div>

      <div class="batch-ui__upload-section">
        <div class="batch-ui__drop-zone">
          <div class="batch-ui__drop-zone-content">
            <svg class="batch-ui__upload-icon" viewBox="0 0 24 24" width="48" height="48">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M14 2v6h6M16 13l-4-4-4 4M12 17V9" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            <p class="batch-ui__drop-text">拖拽图片到此处或点击选择文件</p>
            <p class="batch-ui__drop-hint">支持 JPG, PNG, WebP, GIF 格式，单个文件不超过 50MB</p>
            <button class="batch-ui__select-btn">选择文件</button>
          </div>
          <input type="file" class="batch-ui__file-input" multiple accept="${this.config.acceptedFileTypes.join(',')}">
        </div>
      </div>

      <div class="batch-ui__operations-section">
        <div class="batch-ui__operations-header">
          <h3>处理操作</h3>
          <button class="batch-ui__toggle-operations">收起</button>
        </div>
        <div class="batch-ui__operations-panel">
          ${this.createOperationsHTML()}
        </div>
      </div>

      <div class="batch-ui__items-section">
        <div class="batch-ui__items-header">
          <h3>处理列表</h3>
          <div class="batch-ui__items-actions">
            <button class="batch-ui__clear-btn">清空列表</button>
            <button class="batch-ui__remove-completed-btn">移除已完成</button>
          </div>
        </div>
        <div class="batch-ui__items-list"></div>
      </div>

      <div class="batch-ui__progress-section">
        <div class="batch-ui__progress-bar">
          <div class="batch-ui__progress-fill"></div>
        </div>
        <div class="batch-ui__progress-text">0% 完成 (0/0)</div>
      </div>

      <div class="batch-ui__controls">
        <button class="batch-ui__start-btn" disabled>开始处理</button>
        <button class="batch-ui__stop-btn" disabled>停止处理</button>
        <button class="batch-ui__download-btn" disabled>下载全部</button>
      </div>
    `

    // 获取元素引用
    this.elements = {
      dropZone: this.container.querySelector('.batch-ui__drop-zone')!,
      fileInput: this.container.querySelector('.batch-ui__file-input')! as HTMLInputElement,
      itemsList: this.container.querySelector('.batch-ui__items-list')!,
      progressBar: this.container.querySelector('.batch-ui__progress-fill')!,
      progressText: this.container.querySelector('.batch-ui__progress-text')!,
      operationsPanel: this.container.querySelector('.batch-ui__operations-panel')!,
      controlButtons: this.container.querySelector('.batch-ui__controls')!,
      statusSummary: this.container.querySelector('.batch-ui__status-summary')!
    }

    this.createStyles()
  }

  /**
   * 创建操作面板HTML
   */
  private createOperationsHTML(): string {
    return `
      <!-- 裁剪操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-crop" class="batch-ui__operation-checkbox">
          <label for="op-crop" class="batch-ui__operation-label">裁剪</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <label>X坐标:</label>
            <input type="number" name="crop-x" value="0" min="0">
          </div>
          <div class="batch-ui__param-group">
            <label>Y坐标:</label>
            <input type="number" name="crop-y" value="0" min="0">
          </div>
          <div class="batch-ui__param-group">
            <label>宽度:</label>
            <input type="number" name="crop-width" value="800" min="1">
          </div>
          <div class="batch-ui__param-group">
            <label>高度:</label>
            <input type="number" name="crop-height" value="600" min="1">
          </div>
        </div>
      </div>

      <!-- 缩放操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-resize" class="batch-ui__operation-checkbox">
          <label for="op-resize" class="batch-ui__operation-label">缩放</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <label>宽度:</label>
            <input type="number" name="resize-width" value="800" min="1">
          </div>
          <div class="batch-ui__param-group">
            <label>高度:</label>
            <input type="number" name="resize-height" value="600" min="1">
          </div>
          <div class="batch-ui__param-group">
            <input type="checkbox" name="resize-aspect-ratio" checked>
            <label>保持宽高比</label>
          </div>
        </div>
      </div>

      <!-- 旋转操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-rotate" class="batch-ui__operation-checkbox">
          <label for="op-rotate" class="batch-ui__operation-label">旋转</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <label>角度:</label>
            <input type="number" name="rotate-angle" value="90" min="-360" max="360" step="15">
          </div>
        </div>
      </div>

      <!-- 翻转操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-flip" class="batch-ui__operation-checkbox">
          <label for="op-flip" class="batch-ui__operation-label">翻转</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <input type="checkbox" name="flip-horizontal">
            <label>水平翻转</label>
          </div>
          <div class="batch-ui__param-group">
            <input type="checkbox" name="flip-vertical">
            <label>垂直翻转</label>
          </div>
        </div>
      </div>

      <!-- 滤镜操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-filter" class="batch-ui__operation-checkbox">
          <label for="op-filter" class="batch-ui__operation-label">滤镜</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <label>滤镜类型:</label>
            <select name="filter-type">
              <option value="grayscale">黑白</option>
              <option value="sepia">怀旧</option>
              <option value="blur">模糊</option>
              <option value="sharpen">锐化</option>
            </select>
          </div>
          <div class="batch-ui__param-group">
            <label>强度:</label>
            <input type="range" name="filter-intensity" min="0" max="1" step="0.1" value="1">
            <span class="batch-ui__range-value">100%</span>
          </div>
        </div>
      </div>

      <!-- 水印操作 -->
      <div class="batch-ui__operation">
        <div class="batch-ui__operation-header">
          <input type="checkbox" id="op-watermark" class="batch-ui__operation-checkbox">
          <label for="op-watermark" class="batch-ui__operation-label">水印</label>
        </div>
        <div class="batch-ui__operation-params">
          <div class="batch-ui__param-group">
            <label>文字:</label>
            <input type="text" name="watermark-text" value="© 2024" placeholder="输入水印文字">
          </div>
          <div class="batch-ui__param-group">
            <label>位置:</label>
            <select name="watermark-position">
              <option value="top-left">左上角</option>
              <option value="top-right">右上角</option>
              <option value="bottom-left">左下角</option>
              <option value="bottom-right">右下角</option>
              <option value="center">居中</option>
            </select>
          </div>
          <div class="batch-ui__param-group">
            <label>大小:</label>
            <input type="number" name="watermark-size" value="24" min="12" max="100">
          </div>
          <div class="batch-ui__param-group">
            <label>不透明度:</label>
            <input type="range" name="watermark-opacity" min="0" max="1" step="0.1" value="0.5">
            <span class="batch-ui__range-value">50%</span>
          </div>
          <div class="batch-ui__param-group">
            <label>颜色:</label>
            <input type="color" name="watermark-color" value="#ffffff">
          </div>
        </div>
      </div>
    `
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 文件选择和拖拽
    this.bindFileEvents()
    
    // 批量处理器事件
    this.bindProcessorEvents()
    
    // UI控制事件
    this.bindControlEvents()
    
    // 操作面板事件
    this.bindOperationEvents()
  }

  /**
   * 绑定文件事件
   */
  private bindFileEvents(): void {
    const { dropZone, fileInput } = this.elements

    // 点击选择文件
    const selectBtn = this.container.querySelector('.batch-ui__select-btn')!
    selectBtn.addEventListener('click', () => {
      fileInput!.click()
    })

    // 文件输入变化
    fileInput!.addEventListener('change', (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      this.handleFileUpload(files)
      // 清空input，允许重复选择相同文件
      fileInput!.value = ''
    })

    // 拖拽事件
    dropZone!.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropZone!.classList.add('batch-ui__drop-zone--dragover')
    })

    dropZone!.addEventListener('dragleave', (e) => {
      e.preventDefault()
      dropZone!.classList.remove('batch-ui__drop-zone--dragover')
    })

    dropZone!.addEventListener('drop', (e) => {
      e.preventDefault()
      dropZone!.classList.remove('batch-ui__drop-zone--dragover')
      
      const files = Array.from(e.dataTransfer?.files || [])
      this.handleFileUpload(files)
    })
  }

  /**
   * 绑定批量处理器事件
   */
  private bindProcessorEvents(): void {
    this.batchProcessor.on('itemAdded', (data: any) => {
      this.addItemToList(data.item)
      this.updateUI()
    })

    this.batchProcessor.on('itemRemoved', (data: any) => {
      this.removeItemFromList(data.item.id)
      this.updateUI()
    })

    this.batchProcessor.on('itemStarted', (data: any) => {
      this.updateItemStatus(data.item)
    })

    this.batchProcessor.on('itemProgress', (data: any) => {
      this.updateItemProgress(data.item)
    })

    this.batchProcessor.on('itemCompleted', (data: any) => {
      this.updateItemStatus(data.item)
      this.updateUI()
    })

    this.batchProcessor.on('itemError', (data: any) => {
      this.updateItemStatus(data.item)
    })

    this.batchProcessor.on('processingStarted', () => {
      this.updateControlButtons(true)
    })

    this.batchProcessor.on('processingCompleted', () => {
      this.updateControlButtons(false)
      this.updateUI()
    })

    this.batchProcessor.on('progressUpdated', (data: any) => {
      this.updateProgress(data.progress)
    })
  }

  /**
   * 绑定控制事件
   */
  private bindControlEvents(): void {
    // 开始处理
    const startBtn = this.container.querySelector('.batch-ui__start-btn')!
    startBtn.addEventListener('click', () => {
      this.startProcessing()
    })

    // 停止处理
    const stopBtn = this.container.querySelector('.batch-ui__stop-btn')!
    stopBtn.addEventListener('click', () => {
      this.batchProcessor.stopProcessing()
    })

    // 下载全部
    const downloadBtn = this.container.querySelector('.batch-ui__download-btn')!
    downloadBtn.addEventListener('click', () => {
      this.batchProcessor.downloadAll().catch(error => {
        console.error('Download failed:', error)
        alert('下载失败：' + error.message)
      })
    })

    // 清空列表
    const clearBtn = this.container.querySelector('.batch-ui__clear-btn')!
    clearBtn.addEventListener('click', () => {
      if (confirm('确定要清空所有项目吗？')) {
        this.batchProcessor.clear()
        this.elements.itemsList!.innerHTML = ''
        this.updateUI()
      }
    })

    // 移除已完成
    const removeCompletedBtn = this.container.querySelector('.batch-ui__remove-completed-btn')!
    removeCompletedBtn.addEventListener('click', () => {
      const completedItems = this.batchProcessor.getItems().filter(
        item => item.status === BatchStatus.COMPLETED
      )
      completedItems.forEach(item => {
        this.batchProcessor.removeItem(item.id)
      })
    })

    // 切换操作面板
    const toggleBtn = this.container.querySelector('.batch-ui__toggle-operations')!
    toggleBtn.addEventListener('click', () => {
      const panel = this.elements.operationsPanel!
      const isCollapsed = panel.style.display === 'none'
      panel.style.display = isCollapsed ? 'block' : 'none'
      toggleBtn.textContent = isCollapsed ? '收起' : '展开'
    })
  }

  /**
   * 绑定操作面板事件
   */
  private bindOperationEvents(): void {
    // 范围输入更新显示
    const rangeInputs = this.container.querySelectorAll('input[type="range"]')
    rangeInputs.forEach(input => {
      const updateRangeValue = () => {
        const valueSpan = input.parentElement?.querySelector('.batch-ui__range-value')
        if (valueSpan) {
          const value = parseFloat((input as HTMLInputElement).value)
          valueSpan.textContent = `${Math.round(value * 100)}%`
        }
      }
      
      input.addEventListener('input', updateRangeValue)
      updateRangeValue() // 初始化显示
    })

    // 操作参数变化时自动更新配置
    const operationInputs = this.container.querySelectorAll('.batch-ui__operation input, .batch-ui__operation select')
    operationInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateOperationsConfig()
      })
    })
  }

  /**
   * 处理文件上传
   */
  private async handleFileUpload(files: File[]): Promise<void> {
    // 过滤文件类型和大小
    const validFiles = files.filter(file => {
      if (!this.config.acceptedFileTypes.includes(file.type)) {
        alert(`不支持的文件类型: ${file.name}`)
        return false
      }
      if (file.size > this.config.maxFileSize) {
        alert(`文件过大: ${file.name}`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      await this.batchProcessor.addFiles(validFiles)
    } catch (error) {
      console.error('Error adding files:', error)
      alert('添加文件失败')
    }
  }

  /**
   * 添加项目到列表
   */
  private addItemToList(item: BatchItem): void {
    const itemElement = document.createElement('div')
    itemElement.className = 'batch-ui__item'
    itemElement.dataset.itemId = item.id
    
    itemElement.innerHTML = `
      <div class="batch-ui__item-preview">
        <img src="${URL.createObjectURL(item.file)}" alt="${item.file.name}" loading="lazy">
      </div>
      <div class="batch-ui__item-info">
        <div class="batch-ui__item-name">${item.file.name}</div>
        <div class="batch-ui__item-size">${this.formatFileSize(item.file.size)}</div>
        <div class="batch-ui__item-dimensions" id="dimensions-${item.id}">加载中...</div>
      </div>
      <div class="batch-ui__item-status">
        <div class="batch-ui__item-status-text">${this.getStatusText(item.status)}</div>
        <div class="batch-ui__item-progress">
          <div class="batch-ui__item-progress-bar">
            <div class="batch-ui__item-progress-fill" style="width: ${item.progress}%"></div>
          </div>
          <div class="batch-ui__item-progress-text">${item.progress}%</div>
        </div>
      </div>
      <div class="batch-ui__item-actions">
        <button class="batch-ui__item-remove" title="移除">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    `

    // 绑定移除按钮事件
    const removeBtn = itemElement.querySelector('.batch-ui__item-remove')!
    removeBtn.addEventListener('click', () => {
      this.batchProcessor.removeItem(item.id)
    })

    // 获取图片尺寸
    item.originalImage.onload = () => {
      const dimensionsEl = document.getElementById(`dimensions-${item.id}`)
      if (dimensionsEl) {
        dimensionsEl.textContent = `${item.originalImage.width} × ${item.originalImage.height}`
      }
    }

    this.elements.itemsList!.appendChild(itemElement)
  }

  /**
   * 从列表移除项目
   */
  private removeItemFromList(itemId: string): void {
    const itemElement = this.elements.itemsList!.querySelector(`[data-item-id="${itemId}"]`)
    if (itemElement) {
      // 清理预览图片的URL
      const img = itemElement.querySelector('img')
      if (img?.src) {
        URL.revokeObjectURL(img.src)
      }
      
      itemElement.remove()
    }
  }

  /**
   * 更新项目状态
   */
  private updateItemStatus(item: BatchItem): void {
    const itemElement = this.elements.itemsList!.querySelector(`[data-item-id="${item.id}"]`)
    if (!itemElement) return

    const statusText = itemElement.querySelector('.batch-ui__item-status-text')!
    const progressFill = itemElement.querySelector('.batch-ui__item-progress-fill')! as HTMLElement
    const progressText = itemElement.querySelector('.batch-ui__item-progress-text')!

    statusText.textContent = this.getStatusText(item.status)
    progressFill.style.width = `${item.progress}%`
    progressText.textContent = `${Math.round(item.progress)}%`

    // 更新项目样式
    itemElement.className = `batch-ui__item batch-ui__item--${item.status}`

    // 显示错误信息
    if (item.status === BatchStatus.ERROR && item.error) {
      statusText.textContent = `错误: ${item.error}`
    }
  }

  /**
   * 更新项目进度
   */
  private updateItemProgress(item: BatchItem): void {
    const itemElement = this.elements.itemsList!.querySelector(`[data-item-id="${item.id}"]`)
    if (!itemElement) return

    const progressFill = itemElement.querySelector('.batch-ui__item-progress-fill')! as HTMLElement
    const progressText = itemElement.querySelector('.batch-ui__item-progress-text')!

    progressFill.style.width = `${item.progress}%`
    progressText.textContent = `${Math.round(item.progress)}%`
  }

  /**
   * 更新整体进度
   */
  private updateProgress(progress: { completed: number; total: number; percentage: number }): void {
    this.elements.progressBar!.style.width = `${progress.percentage}%`
    this.elements.progressText!.textContent = `${Math.round(progress.percentage)}% 完成 (${progress.completed}/${progress.total})`
  }

  /**
   * 更新控制按钮
   */
  private updateControlButtons(isProcessing: boolean): void {
    const startBtn = this.container.querySelector('.batch-ui__start-btn')! as HTMLButtonElement
    const stopBtn = this.container.querySelector('.batch-ui__stop-btn')! as HTMLButtonElement
    
    startBtn.disabled = isProcessing
    stopBtn.disabled = !isProcessing
  }

  /**
   * 更新UI状态
   */
  private updateUI(): void {
    const items = this.batchProcessor.getItems()
    const progress = this.batchProcessor.getProgress()
    const completedItems = items.filter(item => item.status === BatchStatus.COMPLETED)

    // 更新状态摘要
    const itemCount = this.elements.statusSummary!.querySelector('.batch-ui__item-count')!
    const statusText = this.elements.statusSummary!.querySelector('.batch-ui__status-text')!
    
    itemCount.textContent = `${items.length} 项目`
    
    if (items.length === 0) {
      statusText.textContent = '准备就绪'
    } else if (progress.completed === progress.total) {
      statusText.textContent = '全部完成'
    } else {
      statusText.textContent = `${progress.completed}/${progress.total} 已完成`
    }

    // 更新按钮状态
    const startBtn = this.container.querySelector('.batch-ui__start-btn')! as HTMLButtonElement
    const downloadBtn = this.container.querySelector('.batch-ui__download-btn')! as HTMLButtonElement
    
    startBtn.disabled = items.length === 0
    downloadBtn.disabled = completedItems.length === 0

    // 更新整体进度
    this.updateProgress(progress)
  }

  /**
   * 开始处理
   */
  private async startProcessing(): Promise<void> {
    // 更新操作配置
    this.updateOperationsConfig()
    
    try {
      await this.batchProcessor.startProcessing()
    } catch (error) {
      console.error('Processing failed:', error)
      alert('处理失败：' + error)
    }
  }

  /**
   * 更新操作配置
   */
  private updateOperationsConfig(): void {
    const operations: BatchOperationConfig[] = []

    // 裁剪
    const cropEnabled = (this.container.querySelector('#op-crop') as HTMLInputElement).checked
    if (cropEnabled) {
      const x = parseInt((this.container.querySelector('[name="crop-x"]') as HTMLInputElement).value)
      const y = parseInt((this.container.querySelector('[name="crop-y"]') as HTMLInputElement).value)
      const width = parseInt((this.container.querySelector('[name="crop-width"]') as HTMLInputElement).value)
      const height = parseInt((this.container.querySelector('[name="crop-height"]') as HTMLInputElement).value)
      
      operations.push({
        type: BatchOperation.CROP,
        enabled: true,
        name: '裁剪',
        params: { x, y, width, height }
      })
    }

    // 缩放
    const resizeEnabled = (this.container.querySelector('#op-resize') as HTMLInputElement).checked
    if (resizeEnabled) {
      const width = parseInt((this.container.querySelector('[name="resize-width"]') as HTMLInputElement).value)
      const height = parseInt((this.container.querySelector('[name="resize-height"]') as HTMLInputElement).value)
      const maintainAspectRatio = (this.container.querySelector('[name="resize-aspect-ratio"]') as HTMLInputElement).checked
      
      operations.push({
        type: BatchOperation.RESIZE,
        enabled: true,
        name: '缩放',
        params: { width, height, maintainAspectRatio }
      })
    }

    // 旋转
    const rotateEnabled = (this.container.querySelector('#op-rotate') as HTMLInputElement).checked
    if (rotateEnabled) {
      const angle = parseInt((this.container.querySelector('[name="rotate-angle"]') as HTMLInputElement).value)
      
      operations.push({
        type: BatchOperation.ROTATE,
        enabled: true,
        name: '旋转',
        params: { angle }
      })
    }

    // 翻转
    const flipEnabled = (this.container.querySelector('#op-flip') as HTMLInputElement).checked
    if (flipEnabled) {
      const horizontal = (this.container.querySelector('[name="flip-horizontal"]') as HTMLInputElement).checked
      const vertical = (this.container.querySelector('[name="flip-vertical"]') as HTMLInputElement).checked
      
      operations.push({
        type: BatchOperation.FLIP,
        enabled: true,
        name: '翻转',
        params: { horizontal, vertical }
      })
    }

    // 滤镜
    const filterEnabled = (this.container.querySelector('#op-filter') as HTMLInputElement).checked
    if (filterEnabled) {
      const filterType = (this.container.querySelector('[name="filter-type"]') as HTMLSelectElement).value
      const intensity = parseFloat((this.container.querySelector('[name="filter-intensity"]') as HTMLInputElement).value)
      
      operations.push({
        type: BatchOperation.FILTER,
        enabled: true,
        name: '滤镜',
        params: { filterType, intensity }
      })
    }

    // 水印
    const watermarkEnabled = (this.container.querySelector('#op-watermark') as HTMLInputElement).checked
    if (watermarkEnabled) {
      const text = (this.container.querySelector('[name="watermark-text"]') as HTMLInputElement).value
      const position = (this.container.querySelector('[name="watermark-position"]') as HTMLSelectElement).value
      const size = parseInt((this.container.querySelector('[name="watermark-size"]') as HTMLInputElement).value)
      const opacity = parseFloat((this.container.querySelector('[name="watermark-opacity"]') as HTMLInputElement).value)
      const color = (this.container.querySelector('[name="watermark-color"]') as HTMLInputElement).value
      
      operations.push({
        type: BatchOperation.WATERMARK,
        enabled: true,
        name: '水印',
        params: { text, position, size, opacity, color }
      })
    }

    this.batchProcessor.setOperations(operations)
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: BatchStatus): string {
    switch (status) {
      case BatchStatus.PENDING:
        return '等待中'
      case BatchStatus.PROCESSING:
        return '处理中'
      case BatchStatus.COMPLETED:
        return '已完成'
      case BatchStatus.ERROR:
        return '出错'
      case BatchStatus.CANCELLED:
        return '已取消'
      default:
        return '未知'
    }
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 创建样式
   */
  private createStyles(): void {
    const styleId = 'batch-ui-styles'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .batch-ui {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .batch-ui--dark {
        background: #2d3748;
        color: #e2e8f0;
      }

      .batch-ui__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #e2e8f0;
      }

      .batch-ui--dark .batch-ui__header {
        border-bottom-color: #4a5568;
      }

      .batch-ui__title {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
      }

      .batch-ui__status-summary {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: #6b7280;
      }

      .batch-ui--dark .batch-ui__status-summary {
        color: #9ca3af;
      }

      .batch-ui__separator {
        opacity: 0.5;
      }

      .batch-ui__upload-section {
        margin-bottom: 32px;
      }

      .batch-ui__drop-zone {
        border: 2px dashed #d1d5db;
        border-radius: 12px;
        padding: 48px 24px;
        text-align: center;
        transition: all 0.2s ease;
        cursor: pointer;
        position: relative;
      }

      .batch-ui__drop-zone:hover {
        border-color: #3b82f6;
        background: #f8faff;
      }

      .batch-ui__drop-zone--dragover {
        border-color: #3b82f6;
        background: #eff6ff;
      }

      .batch-ui--dark .batch-ui__drop-zone {
        border-color: #4a5568;
        background: #1a202c;
      }

      .batch-ui--dark .batch-ui__drop-zone:hover {
        border-color: #63b3ed;
        background: #2c5282;
      }

      .batch-ui__upload-icon {
        color: #9ca3af;
        margin-bottom: 16px;
      }

      .batch-ui__drop-text {
        font-size: 18px;
        font-weight: 500;
        margin: 0 0 8px 0;
      }

      .batch-ui__drop-hint {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 24px 0;
      }

      .batch-ui__select-btn {
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .batch-ui__select-btn:hover {
        background: #2563eb;
      }

      .batch-ui__file-input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      .batch-ui__operations-section {
        margin-bottom: 32px;
      }

      .batch-ui__operations-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .batch-ui__operations-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .batch-ui__toggle-operations {
        background: none;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 12px;
        cursor: pointer;
      }

      .batch-ui__operations-panel {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
      }

      .batch-ui--dark .batch-ui__operations-panel {
        background: #1a202c;
        border-color: #4a5568;
      }

      .batch-ui__operation {
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        padding: 16px;
      }

      .batch-ui--dark .batch-ui__operation {
        border-color: #4a5568;
      }

      .batch-ui__operation-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .batch-ui__operation-checkbox {
        margin: 0;
      }

      .batch-ui__operation-label {
        font-weight: 500;
        cursor: pointer;
      }

      .batch-ui__operation-params {
        display: grid;
        gap: 12px;
      }

      .batch-ui__param-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .batch-ui__param-group label {
        min-width: 60px;
        font-size: 12px;
        color: #6b7280;
      }

      .batch-ui__param-group input,
      .batch-ui__param-group select {
        flex: 1;
        padding: 6px 8px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        font-size: 13px;
      }

      .batch-ui--dark .batch-ui__param-group input,
      .batch-ui--dark .batch-ui__param-group select {
        background: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
      }

      .batch-ui__range-value {
        min-width: 40px;
        font-size: 12px;
        color: #6b7280;
      }

      .batch-ui__items-section {
        margin-bottom: 24px;
      }

      .batch-ui__items-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
      }

      .batch-ui__items-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .batch-ui__items-actions {
        display: flex;
        gap: 8px;
      }

      .batch-ui__items-actions button {
        background: none;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
      }

      .batch-ui__items-list {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        max-height: 400px;
        overflow-y: auto;
      }

      .batch-ui--dark .batch-ui__items-list {
        background: #1a202c;
        border-color: #4a5568;
      }

      .batch-ui__item {
        display: grid;
        grid-template-columns: 80px 1fr auto auto;
        gap: 16px;
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        align-items: center;
      }

      .batch-ui--dark .batch-ui__item {
        border-bottom-color: #374151;
      }

      .batch-ui__item:last-child {
        border-bottom: none;
      }

      .batch-ui__item--processing {
        background: #fef3c7;
      }

      .batch-ui__item--completed {
        background: #d1fae5;
      }

      .batch-ui__item--error {
        background: #fee2e2;
      }

      .batch-ui__item-preview {
        width: 64px;
        height: 64px;
        border-radius: 6px;
        overflow: hidden;
        background: #f3f4f6;
      }

      .batch-ui__item-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .batch-ui__item-info {
        min-width: 0;
      }

      .batch-ui__item-name {
        font-weight: 500;
        margin-bottom: 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .batch-ui__item-size,
      .batch-ui__item-dimensions {
        font-size: 12px;
        color: #6b7280;
      }

      .batch-ui__item-status {
        text-align: right;
        min-width: 100px;
      }

      .batch-ui__item-status-text {
        font-size: 12px;
        font-weight: 500;
        margin-bottom: 8px;
      }

      .batch-ui__item-progress {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .batch-ui__item-progress-bar {
        width: 60px;
        height: 4px;
        background: #e5e7eb;
        border-radius: 2px;
        overflow: hidden;
      }

      .batch-ui__item-progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.2s ease;
      }

      .batch-ui__item-progress-text {
        font-size: 10px;
        color: #6b7280;
        min-width: 30px;
      }

      .batch-ui__item-actions {
        display: flex;
        align-items: center;
      }

      .batch-ui__item-remove {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #ef4444;
        border-radius: 4px;
      }

      .batch-ui__item-remove:hover {
        background: #fee2e2;
      }

      .batch-ui__progress-section {
        margin-bottom: 24px;
      }

      .batch-ui__progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .batch-ui__progress-fill {
        height: 100%;
        background: #3b82f6;
        transition: width 0.3s ease;
        width: 0%;
      }

      .batch-ui__progress-text {
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      }

      .batch-ui__controls {
        display: flex;
        justify-content: center;
        gap: 16px;
      }

      .batch-ui__controls button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .batch-ui__controls button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .batch-ui__start-btn {
        background: #10b981;
        color: white;
      }

      .batch-ui__start-btn:hover:not(:disabled) {
        background: #059669;
      }

      .batch-ui__stop-btn {
        background: #ef4444;
        color: white;
      }

      .batch-ui__stop-btn:hover:not(:disabled) {
        background: #dc2626;
      }

      .batch-ui__download-btn {
        background: #3b82f6;
        color: white;
      }

      .batch-ui__download-btn:hover:not(:disabled) {
        background: #2563eb;
      }
    `
    
    document.head.appendChild(style)
  }

  /**
   * 销毁UI
   */
  destroy(): void {
    // 清理所有预览图片的URL
    const images = this.container.querySelectorAll('.batch-ui__item-preview img')
    images.forEach(img => {
      if ((img as HTMLImageElement).src) {
        URL.revokeObjectURL((img as HTMLImageElement).src)
      }
    })

    this.container.innerHTML = ''
  }
}
