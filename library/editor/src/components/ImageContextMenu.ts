/**
 * 图片右键菜单组件
 */

import { getLucideIcon } from '../utils/icons'

export interface ContextMenuItem {
  label: string
  icon?: string
  action?: () => void
  submenu?: ContextMenuItem[]
  divider?: boolean
}

export class ImageContextMenu {
  private menu: HTMLDivElement
  private currentImage: HTMLElement | null = null
  private visible = false

  constructor() {
    this.menu = this.createMenu()
    document.body.appendChild(this.menu)
    this.attachGlobalListeners()
  }

  private createMenu(): HTMLDivElement {
    const menu = document.createElement('div')
    menu.className = 'ldesign-image-context-menu'
    menu.style.display = 'none'
    menu.style.position = 'fixed'
    menu.style.zIndex = '10000'
    
    return menu
  }

  private attachGlobalListeners(): void {
    // 点击其他地方关闭菜单 (包括左键和右键)
    document.addEventListener('mousedown', (e) => {
      // 如果点击的不是菜单本身，关闭菜单
      if (this.visible && !this.menu.contains(e.target as Node)) {
        e.preventDefault()
        this.hide()
      }
    })

    // 右键点击其他地方也关闭菜单
    document.addEventListener('contextmenu', (e) => {
      // 如果右键点击的不是图片或菜单，关闭菜单
      const target = e.target as HTMLElement
      const isImage = target.closest('.ldesign-image-wrapper')
      const isMenu = target.closest('.ldesign-image-context-menu')
      
      if (this.visible && !isImage && !isMenu) {
        this.hide()
      }
    })

    // ESC键关闭菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.hide()
      }
    })

    // 滚动时关闭菜单
    document.addEventListener('scroll', () => {
      if (this.visible) {
        this.hide()
      }
    }, true)
  }

  public show(x: number, y: number, imageWrapper: HTMLElement): void {
    // 如果已经显示，先隐藏
    if (this.visible) {
      this.hide()
      setTimeout(() => this.show(x, y, imageWrapper), 100)
      return
    }
    
    this.currentImage = imageWrapper
    this.updateMenuContent()
    
    // 移除隐藏动画类
    this.menu.classList.remove('hiding')
    
    // 先设置到临时位置以获取尺寸
    this.menu.style.display = 'block'
    this.menu.style.opacity = '0'
    this.menu.style.left = '0px'
    this.menu.style.top = '0px'
    
    // 计算位置，防止超出屏幕
    requestAnimationFrame(() => {
      const menuRect = this.menu.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const padding = 10
      
      let posX = x
      let posY = y
      
      // 水平位置调整
      if (x + menuRect.width + padding > windowWidth) {
        // 如果右边空间不足，尝试显示在左边
        posX = Math.max(padding, x - menuRect.width)
      }
      
      // 垂直位置调整
      // 由于菜单有最大高度限制(70vh)，我们需要考虑实际可见高度
      const maxMenuHeight = windowHeight * 0.7
      const actualMenuHeight = Math.min(menuRect.height, maxMenuHeight)
      
      if (y + actualMenuHeight + padding > windowHeight) {
        // 如果下方空间不足，向上调整
        posY = Math.max(padding, windowHeight - actualMenuHeight - padding)
      }
      
      // 确保不超出左边和顶部边界
      posX = Math.max(padding, posX)
      posY = Math.max(padding, posY)
      
      this.menu.style.left = `${posX}px`
      this.menu.style.top = `${posY}px`
      this.menu.style.opacity = '1'
      this.visible = true
    })
  }
      
      // 确保不超出屏幕边界
      posX = Math.max(10, Math.min(posX, windowWidth - menuRect.width - 10))
      posY = Math.max(10, Math.min(posY, windowHeight - 100))
      
      this.menu.style.left = `${posX}px`
      this.menu.style.top = `${posY}px`
      this.menu.style.opacity = '1'
      this.visible = true
    })
  }

  public hide(): void {
    if (!this.visible) return
    
    // 添加隐藏动画类
    this.menu.classList.add('hiding')
    this.visible = false
    
    // 动画结束后隐藏
    setTimeout(() => {
      if (!this.visible) {
        this.menu.style.display = 'none'
        this.menu.classList.remove('hiding')
        this.currentImage = null
      }
    }, 150)
  }

  private updateMenuContent(): void {
    if (!this.currentImage) return
    
    const items = this.getMenuItems()
    this.menu.innerHTML = ''
    
    items.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div')
        divider.className = 'ldesign-context-menu-divider'
        this.menu.appendChild(divider)
      } else {
        const menuItem = this.createMenuItem(item)
        this.menu.appendChild(menuItem)
      }
    })
  }

  private createMenuItem(item: ContextMenuItem): HTMLDivElement {
    const menuItem = document.createElement('div')
    menuItem.className = 'ldesign-context-menu-item'
    
    if (item.submenu) {
      menuItem.classList.add('has-submenu')
    }
    
    // 图标
    if (item.icon) {
      const icon = document.createElement('span')
      icon.className = 'ldesign-context-menu-icon'
      icon.innerHTML = item.icon
      menuItem.appendChild(icon)
    }
    
    // 标签
    const label = document.createElement('span')
    label.className = 'ldesign-context-menu-label'
    label.textContent = item.label
    menuItem.appendChild(label)
    
    // 子菜单箭头
    if (item.submenu) {
      const arrow = document.createElement('span')
      arrow.className = 'ldesign-context-menu-arrow'
      arrow.innerHTML = getLucideIcon('chevronRight')
      menuItem.appendChild(arrow)
      
      // 创建子菜单
      const submenu = this.createSubmenu(item.submenu)
      menuItem.appendChild(submenu)
      
      // 鼠标悬停时调整子菜单位置
      menuItem.addEventListener('mouseenter', () => {
        const itemRect = menuItem.getBoundingClientRect()
        const submenuRect = submenu.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const windowWidth = window.innerWidth
        
        // 默认在右侧显示
        submenu.style.left = 'calc(100% - 4px)'
        submenu.style.right = 'auto'
        
        // 如果右侧空间不足，显示在左侧
        if (itemRect.right + submenuRect.width > windowWidth - 10) {
          submenu.style.left = 'auto'
          submenu.style.right = 'calc(100% - 4px)'
        }
        
        // 垂直位置调整
        const submenuHeight = Math.min(submenuRect.height, windowHeight * 0.5)
        if (itemRect.top + submenuHeight > windowHeight - 10) {
          // 如果超出底部，向上调整
          const offset = itemRect.top + submenuHeight - windowHeight + 10
          submenu.style.top = `-${offset + 6}px`
        } else {
          submenu.style.top = '-6px'
        }
      })
    }
    
    // 点击事件
    if (item.action) {
      menuItem.addEventListener('click', (e) => {
        e.stopPropagation()
        item.action!()
        this.hide()
      })
    }
    
    return menuItem
  }

  private createSubmenu(items: ContextMenuItem[]): HTMLDivElement {
    const submenu = document.createElement('div')
    submenu.className = 'ldesign-context-submenu'
    
    items.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div')
        divider.className = 'ldesign-context-menu-divider'
        submenu.appendChild(divider)
      } else {
        const menuItem = this.createMenuItem(item)
        submenu.appendChild(menuItem)
      }
    })
    
    return submenu
  }

  private getMenuItems(): ContextMenuItem[] {
    if (!this.currentImage) return []
    
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return []
    
    return [
      {
        label: '调整大小',
        icon: getLucideIcon('resize'),
        submenu: [
          {
            label: '25%',
            icon: getLucideIcon('minimize'),
            action: () => this.setImageSize('25%')
          },
          {
            label: '50%',
            icon: getLucideIcon('minimize'),
            action: () => this.setImageSize('50%')
          },
          {
            label: '75%',
            icon: getLucideIcon('maximize'),
            action: () => this.setImageSize('75%')
          },
          {
            label: '100%',
            icon: getLucideIcon('maximize'),
            action: () => this.setImageSize('100%')
          },
          {
            label: '原始大小',
            icon: getLucideIcon('image'),
            action: () => this.setImageSize('auto')
          },
          { divider: true },
          {
            label: '自定义尺寸...',
            icon: getLucideIcon('resize'),
            action: () => this.showCustomSizeDialog()
          }
        ]
      },
      {
        label: '填充模式',
        icon: getLucideIcon('maximize'),
        submenu: [
          {
            label: '填充 (Fill)',
            action: () => this.setObjectFit('fill')
          },
          {
            label: '包含 (Contain)',
            action: () => this.setObjectFit('contain')
          },
          {
            label: '覆盖 (Cover)',
            action: () => this.setObjectFit('cover')
          },
          {
            label: '无 (None)',
            action: () => this.setObjectFit('none')
          },
          {
            label: '缩小 (Scale-down)',
            action: () => this.setObjectFit('scale-down')
          }
        ]
      },
      {
        label: '对齊方式',
        icon: getLucideIcon('alignCenter'),
        submenu: [
          {
            label: '左对齊',
            icon: getLucideIcon('alignLeft'),
            action: () => this.setImageAlign('left')
          },
          {
            label: '居中',
            icon: getLucideIcon('alignCenter'),
            action: () => this.setImageAlign('center')
          },
          {
            label: '右对齊',
            icon: getLucideIcon('alignRight'),
            action: () => this.setImageAlign('right')
          }
        ]
      },
      {
        label: '文本环绕',
        icon: getLucideIcon('wrapText'),
        submenu: [
          {
            label: '行内',
            icon: getLucideIcon('alignCenter'),
            action: () => this.setWrapMode('inline')
          },
          {
            label: '块级',
            icon: getLucideIcon('square'),
            action: () => this.setWrapMode('block')
          },
          {
            label: '左浮动',
            icon: getLucideIcon('floatLeft'),
            action: () => this.setWrapMode('float-left')
          },
          {
            label: '右浮动',
            icon: getLucideIcon('floatRight'),
            action: () => this.setWrapMode('float-right')
          }
        ]
      },
      { divider: true },
      {
        label: '边框',
        icon: getLucideIcon('square'),
        submenu: [
          {
            label: '无边框',
            action: () => this.setBorder('none')
          },
          {
            label: '细边框',
            action: () => this.setBorder('thin')
          },
          {
            label: '中边框',
            action: () => this.setBorder('medium')
          },
          {
            label: '粗边框',
            action: () => this.setBorder('thick')
          }
        ]
      },
      {
        label: '圆角',
        icon: getLucideIcon('cornerRadius'),
        submenu: [
          {
            label: '无圆角',
            action: () => this.setBorderRadius('none')
          },
          {
            label: '小圆角',
            action: () => this.setBorderRadius('sm')
          },
          {
            label: '中圆角',
            action: () => this.setBorderRadius('md')
          },
          {
            label: '大圆角',
            action: () => this.setBorderRadius('lg')
          },
          {
            label: '圆形',
            icon: getLucideIcon('circle'),
            action: () => this.setBorderRadius('full')
          }
        ]
      },
      {
        label: '阴影',
        icon: getLucideIcon('shadow'),
        submenu: [
          {
            label: '无阴影',
            action: () => this.setShadow('none')
          },
          {
            label: '小阴影',
            action: () => this.setShadow('sm')
          },
          {
            label: '中阴影',
            action: () => this.setShadow('md')
          },
          {
            label: '大阴影',
            action: () => this.setShadow('lg')
          }
        ]
      },
      { divider: true },
      {
        label: '滤镜效果',
        icon: getLucideIcon('palette'),
        submenu: [
          {
            label: '无滤镜',
            action: () => this.setFilter('none')
          },
          {
            label: '灰度',
            action: () => this.setFilter('grayscale')
          },
          {
            label: '褐色',
            action: () => this.setFilter('sepia')
          },
          {
            label: '轻微模糊',
            action: () => this.setFilter('blur-light')
          },
          {
            label: '中度模糊',
            action: () => this.setFilter('blur-medium')
          },
          {
            label: '强烈模糊',
            action: () => this.setFilter('blur-heavy')
          },
          { divider: true },
          {
            label: '增亮 20%',
            action: () => this.setFilter('brightness-120')
          },
          {
            label: '增亮 40%',
            action: () => this.setFilter('brightness-140')
          },
          {
            label: '减暗 20%',
            action: () => this.setFilter('brightness-80')
          },
          {
            label: '减暗 40%',
            action: () => this.setFilter('brightness-60')
          },
          { divider: true },
          {
            label: '高对比度',
            action: () => this.setFilter('contrast-high')
          },
          {
            label: '低对比度',
            action: () => this.setFilter('contrast-low')
          },
          { divider: true },
          {
            label: '高饱和度',
            action: () => this.setFilter('saturate-high')
          },
          {
            label: '低饱和度',
            action: () => this.setFilter('saturate-low')
          },
          { divider: true },
          {
            label: '色相旋转 90°',
            action: () => this.setFilter('hue-rotate-90')
          },
          {
            label: '色相旋转 180°',
            action: () => this.setFilter('hue-rotate-180')
          },
          {
            label: '色相旋转 270°',
            action: () => this.setFilter('hue-rotate-270')
          },
          { divider: true },
          {
            label: '反色',
            action: () => this.setFilter('invert')
          }
        ]
      },
      { divider: true },
      {
        label: '复制图片',
        icon: getLucideIcon('copy'),
        action: () => this.copyImage()
      },
      {
        label: '替换图片',
        icon: getLucideIcon('replace'),
        action: () => this.replaceImage()
      },
      {
        label: '删除图片',
        icon: getLucideIcon('trash'),
        action: () => this.deleteImage()
      },
      { divider: true },
      {
        label: '图片属性',
        icon: getLucideIcon('info'),
        action: () => this.showImageProperties()
      }
    ]
  }

  private setImageSize(size: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    if (size === 'auto') {
      img.style.width = 'auto'
      img.style.height = 'auto'
      img.style.maxWidth = '100%'
      this.currentImage.style.width = 'auto'
    } else {
      // 计算实际宽度
      const editorContent = this.currentImage.closest('.ldesign-editor-content') as HTMLElement
      if (editorContent) {
        const maxWidth = editorContent.offsetWidth
        const targetWidth = Math.min(maxWidth * (parseInt(size) / 100), maxWidth)
        img.style.width = `${targetWidth}px`
        img.style.height = 'auto'
        img.style.maxWidth = '100%'
        this.currentImage.style.width = `${targetWidth}px`
      } else {
        img.style.width = size
        img.style.height = 'auto'
        img.style.maxWidth = '100%'
        this.currentImage.style.width = size
      }
    }
    
    this.triggerContentChange()
  }

  private setImageAlign(align: string): void {
    if (!this.currentImage) return
    
    // 清除浮动类
    this.currentImage.classList.remove('wrap-float-left', 'wrap-float-right')
    this.currentImage.style.float = 'none'
    
    switch (align) {
      case 'left':
        this.currentImage.style.marginLeft = '0'
        this.currentImage.style.marginRight = 'auto'
        this.currentImage.style.display = 'block'
        break
      case 'center':
        this.currentImage.style.marginLeft = 'auto'
        this.currentImage.style.marginRight = 'auto'
        this.currentImage.style.display = 'block'
        break
      case 'right':
        this.currentImage.style.marginLeft = 'auto'
        this.currentImage.style.marginRight = '0'
        this.currentImage.style.display = 'block'
        break
    }
    
    this.triggerContentChange()
  }

  private setWrapMode(mode: string): void {
    if (!this.currentImage) return
    
    // 清除所有环绕类
    this.currentImage.classList.remove('wrap-inline', 'wrap-block', 'wrap-float-left', 'wrap-float-right')
    
    switch (mode) {
      case 'inline':
        this.currentImage.style.display = 'inline-block'
        this.currentImage.style.float = 'none'
        this.currentImage.classList.add('wrap-inline')
        break
      case 'block':
        this.currentImage.style.display = 'block'
        this.currentImage.style.float = 'none'
        this.currentImage.classList.add('wrap-block')
        break
      case 'float-left':
        this.currentImage.style.display = 'block'
        this.currentImage.style.float = 'left'
        this.currentImage.style.marginRight = '15px'
        this.currentImage.style.marginBottom = '10px'
        this.currentImage.classList.add('wrap-float-left')
        break
      case 'float-right':
        this.currentImage.style.display = 'block'
        this.currentImage.style.float = 'right'
        this.currentImage.style.marginLeft = '15px'
        this.currentImage.style.marginBottom = '10px'
        this.currentImage.classList.add('wrap-float-right')
        break
    }
    
    this.triggerContentChange()
  }

  private setBorder(style: string): void {
    if (!this.currentImage) return
    
    // 清除所有边框类
    this.currentImage.classList.remove('border-thin', 'border-medium', 'border-thick')
    
    if (style !== 'none') {
      this.currentImage.classList.add(`border-${style}`)
    }
    
    this.triggerContentChange()
  }

  private setBorderRadius(size: string): void {
    if (!this.currentImage) return
    
    // 清除所有圆角类
    this.currentImage.classList.remove('rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full')
    
    if (size !== 'none') {
      this.currentImage.classList.add(`rounded-${size}`)
    }
    
    this.triggerContentChange()
  }

  private setShadow(size: string): void {
    if (!this.currentImage) return
    
    // 清除所有阴影类
    this.currentImage.classList.remove('shadow-sm', 'shadow-md', 'shadow-lg')
    
    if (size !== 'none') {
      this.currentImage.classList.add(`shadow-${size}`)
    }
    
    this.triggerContentChange()
  }

  private setFilter(filter: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    // 清除所有滤镜类 - 更高效的方式
    const filterClasses = Array.from(this.currentImage.classList)
      .filter(cls => cls.startsWith('filter-'))
    
    filterClasses.forEach(cls => {
      this.currentImage!.classList.remove(cls)
    })
    
    // 如果不是“无滤镜”，添加新的滤镜类
    if (filter !== 'none') {
      this.currentImage.classList.add(`filter-${filter}`)
      
      // 为某些特殊滤镜添加额外的视觉反馈
      if (filter.includes('blur')) {
        img.style.transition = 'filter 0.3s ease'
      }
    } else {
      // 重置滤镜
      img.style.filter = ''
      img.style.transition = ''
    }
    
    this.triggerContentChange()
  }

  private copyImage(): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    // 创建一个临时的canvas来复制图片
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    ctx.drawImage(img, 0, 0)
    
    canvas.toBlob(blob => {
      if (!blob) return
      
      const item = new ClipboardItem({ 'image/png': blob })
      navigator.clipboard.write([item]).then(() => {
        this.showToast('图片已复制到剪贴板')
      })
    })
  }

  private replaceImage(): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
        img.alt = file.name
        this.triggerContentChange()
      }
      reader.readAsDataURL(file)
    }
    
    input.click()
  }

  private deleteImage(): void {
    if (!this.currentImage) return
    
    if (confirm('确定要删除这张图片吗？')) {
      this.currentImage.remove()
      this.triggerContentChange()
    }
  }

  private showImageProperties(): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    const info = `
图片信息：
━━━━━━━━━━━━━━━━━━━━
文件名：${img.alt || '未命名'}
原始尺寸：${img.naturalWidth} × ${img.naturalHeight} 像素
当前尺寸：${img.offsetWidth} × ${img.offsetHeight} 像素
文件地址：${img.src.substring(0, 50)}...
    `.trim()
    
    alert(info)
  }

  private showToast(message: string): void {
    const toast = document.createElement('div')
    toast.className = 'ldesign-toast'
    toast.textContent = message
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 10001;
      font-size: 14px;
    `
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.remove()
    }, 2000)
  }

  private setObjectFit(fit: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    // 设置object-fit属性
    img.style.objectFit = fit as any
    
    // 如果设置了object-fit，需要确保图片有明确的宽高
    if (fit !== 'fill' && !img.style.width && !img.style.height) {
      // 默认设置为100%宽度
      img.style.width = '100%'
      img.style.height = 'auto'
    }
    
    this.triggerContentChange()
  }

  private showCustomSizeDialog(): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    // 创建对话框
    const dialog = document.createElement('div')
    dialog.className = 'ldesign-size-dialog'
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      z-index: 10002;
      min-width: 300px;
    `
    
    // 获取当前尺寸
    const currentWidth = img.offsetWidth
    const currentHeight = img.offsetHeight
    
    dialog.innerHTML = `
      <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #111827;">设置图片尺寸</h3>
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 13px; color: #4b5563;">宽度 (px):</label>
        <input type="number" id="img-width" value="${currentWidth}" style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;" />
      </div>
      <div style="margin-bottom: 12px;">
        <label style="display: block; margin-bottom: 4px; font-size: 13px; color: #4b5563;">高度 (px):</label>
        <input type="number" id="img-height" value="${currentHeight}" style="width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;" />
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: flex; align-items: center; font-size: 13px; color: #4b5563; cursor: pointer;">
          <input type="checkbox" id="keep-ratio" checked style="margin-right: 6px;" />
          保持宽高比
        </label>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        <button id="cancel-btn" style="padding: 6px 16px; border: 1px solid #d1d5db; border-radius: 4px; background: white; color: #4b5563; font-size: 13px; cursor: pointer;">取消</button>
        <button id="apply-btn" style="padding: 6px 16px; border: none; border-radius: 4px; background: #3b82f6; color: white; font-size: 13px; cursor: pointer;">应用</button>
      </div>
    `
    
    document.body.appendChild(dialog)
    
    // 获取元素
    const widthInput = dialog.querySelector('#img-width') as HTMLInputElement
    const heightInput = dialog.querySelector('#img-height') as HTMLInputElement
    const keepRatioCheckbox = dialog.querySelector('#keep-ratio') as HTMLInputElement
    const cancelBtn = dialog.querySelector('#cancel-btn') as HTMLButtonElement
    const applyBtn = dialog.querySelector('#apply-btn') as HTMLButtonElement
    
    // 宽高比
    const aspectRatio = currentWidth / currentHeight
    
    // 事件处理
    widthInput.addEventListener('input', () => {
      if (keepRatioCheckbox.checked) {
        const width = parseInt(widthInput.value) || 0
        heightInput.value = Math.round(width / aspectRatio).toString()
      }
    })
    
    heightInput.addEventListener('input', () => {
      if (keepRatioCheckbox.checked) {
        const height = parseInt(heightInput.value) || 0
        widthInput.value = Math.round(height * aspectRatio).toString()
      }
    })
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(dialog)
    })
    
    applyBtn.addEventListener('click', () => {
      const width = parseInt(widthInput.value) || 0
      const height = parseInt(heightInput.value) || 0
      
      if (width > 0 && height > 0) {
        img.style.width = `${width}px`
        img.style.height = `${height}px`
        img.style.maxWidth = 'none'
        img.style.objectFit = img.style.objectFit || 'contain'
        this.currentImage.style.width = `${width}px`
        this.currentImage.style.height = `${height}px`
        this.triggerContentChange()
      }
      
      // 关闭对话框
      document.body.removeChild(dialog)
      // 隐藏菜单
      this.hide()
    })
    
    // ESC关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(dialog)
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
    
    // 自动聚焦
    widthInput.focus()
    widthInput.select()
  }

  private triggerContentChange(): void {
    const event = new Event('input', { bubbles: true })
    const editorContent = this.currentImage?.closest('.ldesign-editor-content')
    if (editorContent) {
      editorContent.dispatchEvent(event)
    }
  }
}

// 创建单例实例
let contextMenuInstance: ImageContextMenu | null = null

export function getImageContextMenu(): ImageContextMenu {
  if (!contextMenuInstance) {
    contextMenuInstance = new ImageContextMenu()
  }
  return contextMenuInstance
}