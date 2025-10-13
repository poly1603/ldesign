/**
 * 增强版图片插件
 * 支持拖动调整大小、文本环绕、对齐等功能
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
import { getImageContextMenu } from '../components/ImageContextMenu'
import { getLucideIcon } from '../utils/icons'

/**
 * 图片包装器类
 */
export class ImageWrapper {
  private wrapper: HTMLDivElement
  private img: HTMLImageElement
  private isResizing = false
  private startX = 0
  private startY = 0
  private startWidth = 0
  private startHeight = 0
  private aspectRatio = 1
  private currentHandle: string | null = null

  constructor(img: HTMLImageElement) {
    this.img = img
    this.wrapper = this.createWrapper()
    this.initializeImage()
    this.addResizeHandles()
    this.attachEventListeners()
  }

  private createWrapper(): HTMLDivElement {
    const wrapper = document.createElement('div')
    wrapper.className = 'ldesign-image-wrapper'
    wrapper.contentEditable = 'false'
    wrapper.style.position = 'relative'
    wrapper.style.display = 'inline-block'
    wrapper.style.maxWidth = '100%'
    wrapper.setAttribute('data-image-wrapper', 'true')
    return wrapper
  }

  private initializeImage(): void {
    // 保存原始图片的属性
    const src = this.img.src
    const alt = this.img.alt || ''
    const style = this.img.getAttribute('style') || ''
    const className = this.img.className || ''
    
    // 替换原图片
    if (this.img.parentNode) {
      this.img.parentNode.replaceChild(this.wrapper, this.img)
    }
    
    // 设置图片属性
    this.img.style.display = 'block'
    this.img.style.maxWidth = '100%'
    this.img.style.height = 'auto'
    this.img.draggable = false
    
    // 如果有自定义样式，保留它们
    if (style) {
      const styles = style.split(';').filter(s => s.trim())
      styles.forEach(s => {
        const [prop, value] = s.split(':').map(v => v.trim())
        if (prop && value && !['position', 'display'].includes(prop)) {
          (this.img.style as any)[this.toCamelCase(prop)] = value
        }
      })
    }
    
    if (className) {
      this.img.className = className
    }
    
    this.wrapper.appendChild(this.img)
    
    // 计算宽高比
    this.img.onload = () => {
      this.aspectRatio = this.img.naturalWidth / this.img.naturalHeight
    }
    
    if (this.img.complete) {
      this.aspectRatio = this.img.naturalWidth / this.img.naturalHeight
    }
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  }

  private addResizeHandles(): void {
    const handles = [
      { position: 'nw', cursor: 'nw-resize' },
      { position: 'ne', cursor: 'ne-resize' },
      { position: 'sw', cursor: 'sw-resize' },
      { position: 'se', cursor: 'se-resize' },
      { position: 'n', cursor: 'n-resize' },
      { position: 's', cursor: 's-resize' },
      { position: 'e', cursor: 'e-resize' },
      { position: 'w', cursor: 'w-resize' }
    ]

    handles.forEach(({ position, cursor }) => {
      const handle = document.createElement('div')
      handle.className = `ldesign-image-handle ldesign-image-handle-${position}`
      handle.style.cursor = cursor
      handle.setAttribute('data-handle', position)
      this.wrapper.appendChild(handle)
    })
  }

  private attachEventListeners(): void {
    // 点击图片时显示/隐藏控制手柄
    this.wrapper.addEventListener('click', (e) => {
      e.stopPropagation()
      this.toggleActive()
    })

    // 右键菜单
    this.wrapper.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      // 显示右键菜单
      const contextMenu = getImageContextMenu()
      contextMenu.show(e.clientX, e.clientY, this.wrapper)
      
      // 激活图片
      if (!this.wrapper.classList.contains('active')) {
        this.toggleActive()
      }
    })

    // 监听所有手柄的鼠标事件
    const handles = this.wrapper.querySelectorAll('.ldesign-image-handle')
    handles.forEach(handle => {
      handle.addEventListener('mousedown', this.handleMouseDown.bind(this))
    })

    // 全局事件
    document.addEventListener('mousedown', this.handleDocumentClick.bind(this))
  }

  private toggleActive(): void {
    const isActive = this.wrapper.classList.contains('active')
    
    // 移除其他图片的激活状态
    document.querySelectorAll('.ldesign-image-wrapper.active').forEach(w => {
      if (w !== this.wrapper) {
        w.classList.remove('active')
      }
    })
    
    // 切换当前图片的激活状态
    if (!isActive) {
      this.wrapper.classList.add('active')
      this.showImageToolbar()
    } else {
      this.wrapper.classList.remove('active')
      this.hideImageToolbar()
    }
  }

  private handleDocumentClick(e: MouseEvent): void {
    if (!this.wrapper.contains(e.target as Node)) {
      this.wrapper.classList.remove('active')
      this.hideImageToolbar()
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault()
    e.stopPropagation()
    
    this.isResizing = true
    this.startX = e.clientX
    this.startY = e.clientY
    this.startWidth = this.img.offsetWidth
    this.startHeight = this.img.offsetHeight
    this.currentHandle = (e.target as HTMLElement).getAttribute('data-handle')
    
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    
    // 添加正在调整大小的类
    this.wrapper.classList.add('resizing')
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isResizing || !this.currentHandle) return
    
    const deltaX = e.clientX - this.startX
    const deltaY = e.clientY - this.startY
    
    let newWidth = this.startWidth
    let newHeight = this.startHeight
    
    switch (this.currentHandle) {
      case 'e':
        newWidth = this.startWidth + deltaX
        break
      case 'w':
        newWidth = this.startWidth - deltaX
        break
      case 's':
        newHeight = this.startHeight + deltaY
        break
      case 'n':
        newHeight = this.startHeight - deltaY
        break
      case 'se':
        newWidth = this.startWidth + deltaX
        newHeight = this.startHeight + deltaY
        break
      case 'sw':
        newWidth = this.startWidth - deltaX
        newHeight = this.startHeight + deltaY
        break
      case 'ne':
        newWidth = this.startWidth + deltaX
        newHeight = this.startHeight - deltaY
        break
      case 'nw':
        newWidth = this.startWidth - deltaX
        newHeight = this.startHeight - deltaY
        break
    }
    
    // 限制最小尺寸
    newWidth = Math.max(50, newWidth)
    newHeight = Math.max(50, newHeight)
    
    // 保持宽高比（按住Shift键时）
    if (e.shiftKey && this.aspectRatio) {
      if (['e', 'w', 'se', 'sw', 'ne', 'nw'].includes(this.currentHandle)) {
        newHeight = newWidth / this.aspectRatio
      } else {
        newWidth = newHeight * this.aspectRatio
      }
    }
    
    // 应用新尺寸
    this.img.style.width = `${newWidth}px`
    this.img.style.height = `${newHeight}px`
    this.wrapper.style.width = `${newWidth}px`
    
    // 显示尺寸提示
    this.showSizeTooltip(newWidth, newHeight)
    
    // 触发输入事件
    this.triggerContentChange()
  }

  private handleMouseUp(): void {
    this.isResizing = false
    this.currentHandle = null
    this.wrapper.classList.remove('resizing')
    this.hideSizeTooltip()
    
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
  }

  private showSizeTooltip(width: number, height: number): void {
    let tooltip = this.wrapper.querySelector('.ldesign-image-size-tooltip') as HTMLDivElement
    if (!tooltip) {
      tooltip = document.createElement('div')
      tooltip.className = 'ldesign-image-size-tooltip'
      this.wrapper.appendChild(tooltip)
    }
    
    tooltip.textContent = `${Math.round(width)} × ${Math.round(height)}`
    tooltip.style.display = 'block'
  }

  private hideSizeTooltip(): void {
    const tooltip = this.wrapper.querySelector('.ldesign-image-size-tooltip')
    if (tooltip) {
      (tooltip as HTMLElement).style.display = 'none'
    }
  }

  private showImageToolbar(): void {
    // 创建或显示图片工具栏
    let toolbar = this.wrapper.querySelector('.ldesign-image-toolbar') as HTMLDivElement
    
    if (!toolbar) {
      toolbar = this.createImageToolbar()
      // 将工具栏添加到图片包装器内部
      this.wrapper.appendChild(toolbar)
    }
    
    // 延迟计算位置，确保 DOM 已经更新
    requestAnimationFrame(() => {
      // 显示工具栏
      toolbar.classList.add('show')
      
      // 计算位置，使工具栏显示在图片上方
      const toolbarHeight = toolbar.offsetHeight || 40
      
      // 获取编辑器容器的位置信息
      const editorContent = this.wrapper.closest('.ldesign-editor-content') as HTMLElement
      const wrapperRect = this.wrapper.getBoundingClientRect()
      const editorRect = editorContent ? editorContent.getBoundingClientRect() : null
      
      // 计算上方可用空间
      const spaceAbove = editorRect 
        ? wrapperRect.top - editorRect.top 
        : wrapperRect.top
      
      if (spaceAbove >= toolbarHeight + 15) {
        // 上方有足够空间，显示在图片上方
        toolbar.style.position = 'absolute'
        toolbar.style.top = `-${toolbarHeight + 8}px`
        toolbar.style.bottom = 'auto'
      } else {
        // 上方空间不足，显示在图片内部顶部
        toolbar.style.position = 'absolute'
        toolbar.style.top = '8px'
        toolbar.style.bottom = 'auto'
        // 添加背景半透明效果，以便更好地看清工具栏
        toolbar.style.background = 'rgba(255, 255, 255, 0.95)'
      }
      
      // 水平居中
      toolbar.style.left = '50%'
      toolbar.style.transform = 'translateX(-50%)'
      
      // 确保工具栏不会超出屏幕左右边界
      const toolbarRect = toolbar.getBoundingClientRect()
      if (toolbarRect.left < 10) {
        toolbar.style.left = '10px'
        toolbar.style.transform = 'none'
      } else if (toolbarRect.right > window.innerWidth - 10) {
        toolbar.style.left = 'auto'
        toolbar.style.right = '10px'
        toolbar.style.transform = 'none'
      }
    })
  }

  private hideImageToolbar(): void {
    const toolbar = this.wrapper.querySelector('.ldesign-image-toolbar')
    if (toolbar) {
      toolbar.classList.remove('show')
    }
  }

  private createImageToolbar(): HTMLDivElement {
    const toolbar = document.createElement('div')
    toolbar.className = 'ldesign-image-toolbar'
    
    // 文本环绕选项
    const wrapOptions = [
      { value: 'inline', icon: getLucideIcon('alignCenter'), title: '行内显示' },
      { value: 'block', icon: getLucideIcon('square'), title: '块级显示' },
      { value: 'float-left', icon: getLucideIcon('floatLeft'), title: '左侧浮动' },
      { value: 'float-right', icon: getLucideIcon('floatRight'), title: '右侧浮动' }
    ]
    
    wrapOptions.forEach(option => {
      const btn = document.createElement('button')
      btn.className = 'ldesign-image-toolbar-btn'
      btn.innerHTML = `
        <span class="icon">${option.icon}</span>
        <span class="label">${option.title}</span>
      `
      btn.title = option.title
      btn.setAttribute('data-wrap', option.value)
      btn.onclick = () => this.setWrapMode(option.value)
      toolbar.appendChild(btn)
    })
    
    // 分隔符
    const separator = document.createElement('div')
    separator.className = 'ldesign-image-toolbar-separator'
    toolbar.appendChild(separator)
    
    // 对齐选项
    const alignOptions = [
      { value: 'left', icon: getLucideIcon('alignLeft'), title: '左对齐' },
      { value: 'center', icon: getLucideIcon('alignCenter'), title: '居中对齐' },
      { value: 'right', icon: getLucideIcon('alignRight'), title: '右对齐' }
    ]
    
    alignOptions.forEach(option => {
      const btn = document.createElement('button')
      btn.className = 'ldesign-image-toolbar-btn'
      btn.innerHTML = `
        <span class="icon">${option.icon}</span>
        <span class="label">${option.title}</span>
      `
      btn.title = option.title
      btn.setAttribute('data-align', option.value)
      btn.onclick = () => this.setAlignment(option.value)
      toolbar.appendChild(btn)
    })
    
    return toolbar
  }

  public setImageSize(size: string): void {
    if (size === 'auto') {
      this.img.style.width = 'auto'
      this.img.style.height = 'auto'
      this.img.style.maxWidth = '100%'
      this.wrapper.style.width = 'auto'
    } else if (size.includes('px')) {
      // 固定像素尺寸
      this.img.style.width = size
      this.img.style.height = 'auto'
      this.img.style.maxWidth = 'none'
      this.wrapper.style.width = size
    } else {
      // 百分比尺寸
      const editorContent = this.wrapper.closest('.ldesign-editor-content') as HTMLElement
      if (editorContent) {
        const maxWidth = editorContent.offsetWidth - 40 // 减去内边距
        const percentage = parseInt(size) / 100
        const targetWidth = Math.min(maxWidth * percentage, maxWidth)
        this.img.style.width = `${targetWidth}px`
        this.img.style.height = 'auto'
        this.img.style.maxWidth = '100%'
        this.wrapper.style.width = `${targetWidth}px`
      } else {
        this.img.style.width = size
        this.img.style.height = 'auto'
        this.img.style.maxWidth = '100%'
        this.wrapper.style.width = size
      }
    }
    
    this.triggerContentChange()
  }

  public setFixedSize(width: number, height: number): void {
    this.img.style.width = `${width}px`
    this.img.style.height = `${height}px`
    this.img.style.maxWidth = 'none'
    this.wrapper.style.width = `${width}px`
    this.wrapper.style.height = `${height}px`
    this.triggerContentChange()
  }

  public setObjectFit(fit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'): void {
    this.img.style.objectFit = fit
    // 如果设置了object-fit且没有固定尺寸，设置默认尺寸
    if (!this.img.style.width || this.img.style.width === 'auto') {
      this.img.style.width = '100%'
    }
    if (!this.img.style.height || this.img.style.height === 'auto') {
      this.img.style.height = '300px' // 默认高度
    }
    this.triggerContentChange()
  }

  private setWrapMode(mode: string): void {
    // 清除之前的环绕模式
    this.wrapper.classList.remove('wrap-inline', 'wrap-block', 'wrap-float-left', 'wrap-float-right')
    
    switch (mode) {
      case 'inline':
        this.wrapper.style.display = 'inline-block'
        this.wrapper.style.float = 'none'
        this.wrapper.classList.add('wrap-inline')
        break
      case 'block':
        this.wrapper.style.display = 'block'
        this.wrapper.style.float = 'none'
        this.wrapper.classList.add('wrap-block')
        break
      case 'float-left':
        this.wrapper.style.display = 'block'
        this.wrapper.style.float = 'left'
        this.wrapper.style.marginRight = '15px'
        this.wrapper.style.marginBottom = '10px'
        this.wrapper.classList.add('wrap-float-left')
        break
      case 'float-right':
        this.wrapper.style.display = 'block'
        this.wrapper.style.float = 'right'
        this.wrapper.style.marginLeft = '15px'
        this.wrapper.style.marginBottom = '10px'
        this.wrapper.classList.add('wrap-float-right')
        break
    }
    
    this.triggerContentChange()
  }

  private setAlignment(align: string): void {
    // 只对块级元素有效
    if (this.wrapper.style.float === 'left' || this.wrapper.style.float === 'right') {
      return
    }
    
    switch (align) {
      case 'left':
        this.wrapper.style.marginLeft = '0'
        this.wrapper.style.marginRight = 'auto'
        break
      case 'center':
        this.wrapper.style.marginLeft = 'auto'
        this.wrapper.style.marginRight = 'auto'
        break
      case 'right':
        this.wrapper.style.marginLeft = 'auto'
        this.wrapper.style.marginRight = '0'
        break
    }
    
    this.triggerContentChange()
  }

  private triggerContentChange(): void {
    const event = new Event('input', { bubbles: true })
    const editorContent = this.wrapper.closest('.ldesign-editor-content')
    if (editorContent) {
      editorContent.dispatchEvent(event)
    }
  }

  static wrapExistingImages(container: HTMLElement): void {
    const images = container.querySelectorAll('img:not([data-wrapped])')
    images.forEach(img => {
      if (img.closest('[data-image-wrapper]')) return
      img.setAttribute('data-wrapped', 'true')
      new ImageWrapper(img as HTMLImageElement)
    })
  }
}

/**
 * 插入增强版图片
 */
const insertEnhancedImage: Command = (state, dispatch, src?: string) => {
  if (!dispatch) return true

  const url = src || prompt('请输入图片地址:', 'https://')
  if (!url) return false

  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return false

  const range = selection.getRangeAt(0)
  const img = document.createElement('img')
  img.src = url
  img.alt = '图片'

  range.deleteContents()
  range.insertNode(img)

  // 包装图片
  new ImageWrapper(img)

  return true
}

/**
 * 上传增强版图片
 */
const uploadEnhancedImage: Command = (state, dispatch) => {
  if (!dispatch) return true

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true

  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files
    if (!files || files.length === 0) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = document.createElement('img')
        img.src = e.target?.result as string
        img.alt = file.name
        
        range.insertNode(img)
        
        // 包装图片
        new ImageWrapper(img)
        
        // 在图片后插入换行
        const br = document.createElement('br')
        range.insertNode(br)
      }
      reader.readAsDataURL(file)
    })
  }

  input.click()
  return true
}

/**
 * 初始化已有图片
 */
const initializeImages: Command = (state, dispatch) => {
  if (!dispatch) return true
  
  const editorContent = document.querySelector('.ldesign-editor-content')
  if (editorContent) {
    ImageWrapper.wrapExistingImages(editorContent as HTMLElement)
  }
  
  return true
}

/**
 * 增强版图片插件
 */
export const ImageEnhancedPlugin: Plugin = createPlugin({
  name: 'imageEnhanced',
  commands: {
    insertEnhancedImage,
    uploadEnhancedImage,
    initializeImages
  },
  toolbar: [{
    name: 'imageEnhanced',
    title: '插入图片',
    icon: 'image',
    command: uploadEnhancedImage
  }],
  init: (editor) => {
    // 监听编辑器内容变化，自动包装新插入的图片
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            const img = node as HTMLImageElement
            if (!img.closest('[data-image-wrapper]')) {
              new ImageWrapper(img)
            }
          }
        })
      })
    })
    
    const content = editor.querySelector('.ldesign-editor-content')
    if (content) {
      observer.observe(content, {
        childList: true,
        subtree: true
      })
      
      // 初始化已有图片
      ImageWrapper.wrapExistingImages(content as HTMLElement)
    }
  }
})