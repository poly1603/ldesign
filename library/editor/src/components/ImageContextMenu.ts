/**
 * 图片右键菜单组件
 */

import { getLucideIcon } from '../utils/icons'
import { Modal, Toast } from './UIComponents'

export interface ContextMenuItem {
  label?: string
  icon?: string
  action?: () => void
  submenu?: ContextMenuItem[]
  divider?: boolean
}

export class ImageContextMenu {
  private menu: HTMLDivElement
  private menuContent: HTMLDivElement
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
    
    // 创建内容滚动容器
    this.menuContent = document.createElement('div')
    this.menuContent.className = 'ldesign-image-context-menu-content'
    menu.appendChild(this.menuContent)
    
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

  public hide(): void {
    if (!this.visible) return
    
    // 清理所有子菜单
    this.menuContent.querySelectorAll('.ldesign-context-menu-item').forEach(item => {
      const cleanup = (item as any).__cleanup
      if (cleanup) {
        cleanup()
      }
    })
    
    // 清理所有可能遗留的子菜单
    document.querySelectorAll('.ldesign-context-submenu').forEach(submenu => {
      if (document.body.contains(submenu)) {
        document.body.removeChild(submenu)
      }
    })
    
    // 添加隐藏动画类
    this.menu.classList.add('hiding')
    this.visible = false
    
    // 动画结束后隐藏
    setTimeout(() => {
      if (!this.visible) {
        this.menu.style.display = 'none'
        this.menu.classList.remove('hiding')
        this.menuContent.innerHTML = '' // 清空内容以释放事件监听器
        this.currentImage = null
      }
    }, 150)
  }

  private updateMenuContent(): void {
    if (!this.currentImage) return
    
    const items = this.getMenuItems()
    this.menuContent.innerHTML = ''
    
    items.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div')
        divider.className = 'ldesign-context-menu-divider'
        this.menuContent.appendChild(divider)
      } else {
        const menuItem = this.createMenuItem(item)
        this.menuContent.appendChild(menuItem)
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
    if (item.label) {
      const label = document.createElement('span')
      label.className = 'ldesign-context-menu-label'
      label.textContent = item.label
      menuItem.appendChild(label)
    }
    
    // 子菜单箭头
    if (item.submenu) {
      const arrow = document.createElement('span')
      arrow.className = 'ldesign-context-menu-arrow'
      arrow.innerHTML = getLucideIcon('chevronRight')
      menuItem.appendChild(arrow)
      
      // 创建子菜单并添加到body
      const submenu = this.createSubmenu(item.submenu)
      document.body.appendChild(submenu)
      
      // 鼠标悬停时显示并调整子菜单位置
      let hideTimeout: number | null = null
      
      menuItem.addEventListener('mouseenter', () => {
        // 清除隐藏定时器
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          hideTimeout = null
        }
        
        // 隐藏其他可能打开的子菜单
        document.querySelectorAll('.ldesign-context-submenu').forEach(s => {
          if (s !== submenu) {
            (s as HTMLElement).style.display = 'none'
          }
        })
        
        // 显示子菜单
        submenu.style.display = 'block'
        
        // 获取位置信息
        const itemRect = menuItem.getBoundingClientRect()
        const menuRect = this.menu.getBoundingClientRect()
        
        // 初始位置：在菜单项右侧
        let left = itemRect.right - 4
        let top = itemRect.top
        
        // 临时设置位置以获取准确的尺寸
        submenu.style.left = `${left}px`
        submenu.style.top = `${top}px`
        
        // 强制重排以获取正确的尺寸
        const submenuRect = submenu.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const windowWidth = window.innerWidth
        
        // 如果右侧空间不足，显示在左侧
        if (left + submenuRect.width > windowWidth - 10) {
          left = itemRect.left - submenuRect.width + 4
        }
        
        // 垂直位置调整
        if (top + submenuRect.height > windowHeight - 10) {
          // 如果超出底部，向上调整
          top = Math.max(10, windowHeight - submenuRect.height - 10)
        }
        
        // 设置最终位置
        submenu.style.left = `${left}px`
        submenu.style.top = `${top}px`
        submenu.style.visibility = 'visible'
        submenu.style.opacity = '1'
        submenu.style.transform = 'translateX(0)'
      })
      
      // 鼠标离开时隐藏子菜单
      menuItem.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement
        
        // 如果鼠标移动到了子菜单上，不隐藏
        if (relatedTarget && submenu.contains(relatedTarget)) {
          return
        }
        
        // 延迟隐藏
        hideTimeout = window.setTimeout(() => {
          submenu.style.visibility = 'hidden'
          submenu.style.opacity = '0'
          submenu.style.transform = 'translateX(-10px)'
          setTimeout(() => {
            submenu.style.display = 'none'
          }, 200)
        }, 150)
      })
      
      // 子菜单的鼠标事件处理
      submenu.addEventListener('mouseenter', () => {
        // 清除隐藏定时器
        if (hideTimeout) {
          clearTimeout(hideTimeout)
          hideTimeout = null
        }
      })
      
      submenu.addEventListener('mouseleave', (e) => {
        const relatedTarget = e.relatedTarget as HTMLElement
        
        // 如果鼠标移回到父菜单项，保持显示
        if (relatedTarget && menuItem.contains(relatedTarget)) {
          return
        }
        
        // 否则隐藏子菜单
        hideTimeout = window.setTimeout(() => {
          submenu.style.visibility = 'hidden'
          submenu.style.opacity = '0'
          submenu.style.transform = 'translateX(-10px)'
          setTimeout(() => {
            submenu.style.display = 'none'
          }, 200)
        }, 150)
      })
      
      // 清理函数 - 当主菜单隐藏时移除子菜单
      const cleanup = () => {
        if (document.body.contains(submenu)) {
          document.body.removeChild(submenu)
        }
      }
      // 保存清理函数以便后续调用
      ;(menuItem as any).__cleanup = cleanup
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
        // Create submenu item directly instead of recursive createMenuItem
        const menuItem = document.createElement('div')
        menuItem.className = 'ldesign-context-menu-item'
        
        // Icon
        if (item.icon) {
          const icon = document.createElement('span')
          icon.className = 'ldesign-context-menu-icon'
          icon.innerHTML = item.icon
          menuItem.appendChild(icon)
        }
        
        // Label
        if (item.label) {
          const label = document.createElement('span')
          label.className = 'ldesign-context-menu-label'
          label.textContent = item.label
          menuItem.appendChild(label)
        }
        
        // Click handler for submenu items
        if (item.action) {
          menuItem.addEventListener('click', (e) => {
            e.stopPropagation()
            e.preventDefault()
            
            console.log('Submenu item clicked:', item.label)
            
            // Execute the action
            try {
              item.action!()
              console.log('Action executed successfully for:', item.label)
            } catch (error) {
              console.error('Error executing action for', item.label, error)
            }
            
            // Hide the main menu
            this.hide()
          })
          
          // Add hover effect
          menuItem.style.cursor = 'pointer'
        }
        
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
        icon: getLucideIcon('maximize2'),
        submenu: [
          {
            label: '25%',
            action: () => this.setImageSize('25%')
          },
          {
            label: '50%',
            action: () => this.setImageSize('50%')
          },
          {
            label: '75%',
            action: () => this.setImageSize('75%')
          },
          {
            label: '100%',
            action: () => this.setImageSize('100%')
          },
          { divider: true },
          {
            label: '自定义...',
            icon: getLucideIcon('settings'),
            action: () => this.showCustomSizeDialog()
          }
        ]
      },
      {
        label: '对齐方式',
        icon: getLucideIcon('alignCenter'),
        submenu: [
          {
            label: '左对齐',
            icon: getLucideIcon('alignLeft'),
            action: () => this.setImageAlign('left')
          },
          {
            label: '居中',
            icon: getLucideIcon('alignCenter'),
            action: () => this.setImageAlign('center')
          },
          {
            label: '右对齐',
            icon: getLucideIcon('alignRight'),
            action: () => this.setImageAlign('right')
          }
        ]
      },
      {
        label: '滤镜效果',
        icon: getLucideIcon('sparkles'),
        submenu: [
          {
            label: '无滤镜',
            action: () => this.setFilter('none')
          },
          { divider: true },
          {
            label: '模糊',
            action: () => this.setFilter('blur')
          },
          {
            label: '锐化',
            action: () => this.setFilter('sharpen')
          },
          {
            label: '黑白',
            action: () => this.setFilter('grayscale')
          },
          {
            label: '褐色',
            action: () => this.setFilter('sepia')
          },
          {
            label: '反转',
            action: () => this.setFilter('invert')
          },
          { divider: true },
          {
            label: '亮度增强',
            action: () => this.setFilter('brightness')
          },
          {
            label: '对比度增强',
            action: () => this.setFilter('contrast')
          },
          {
            label: '饱和度增强',
            action: () => this.setFilter('saturate')
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
        icon: getLucideIcon('upload'),
        action: () => this.replaceImage()
      },
      { divider: true },
      {
        label: '图片属性',
        icon: getLucideIcon('info'),
        action: () => this.showImageProperties()
      },
      { divider: true },
      {
        label: '删除',
        icon: getLucideIcon('trash2'),
        action: () => this.deleteImage()
      }
    ]
  }

  private setImageSize(size: string): void {
    if (!this.currentImage) return
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) return
    
    console.log('Setting image size to:', size);
    
    // 重置样式
    img.style.width = '';
    img.style.height = '';
    img.style.maxWidth = '';
    this.currentImage.style.width = '';
    
    if (size === '100%') {
      img.style.width = '100%'
      img.style.height = 'auto'
      this.currentImage.style.width = '100%'
    } else if (size === 'auto') {
      img.style.width = 'auto'
      img.style.height = 'auto'
      img.style.maxWidth = '100%'
      this.currentImage.style.width = 'auto'
    } else {
      // 设置百分比宽度
      img.style.width = size;
      img.style.height = 'auto';
      img.style.maxWidth = '100%';
      this.currentImage.style.width = size;
    }
    
    console.log('Image size set - img width:', img.style.width, 'wrapper width:', this.currentImage.style.width);
    
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
    if (!this.currentImage) {
      console.error('No current image');
      return;
    }
    const img = this.currentImage.querySelector('img') as HTMLImageElement
    if (!img) {
      console.error('No img element found in wrapper');
      return;
    }
    
    console.log('Setting filter:', filter);
    
    // 直接设置img元素的filter样式
    switch(filter) {
      case 'none':
        img.style.filter = '';
        break;
      case 'blur':
        img.style.filter = 'blur(4px)';
        break;
      case 'sharpen':
        img.style.filter = 'contrast(1.5) brightness(1.1)';
        break;
      case 'grayscale':
        img.style.filter = 'grayscale(1)';
        break;
      case 'sepia':
        img.style.filter = 'sepia(1)';
        break;
      case 'invert':
        img.style.filter = 'invert(1)';
        break;
      case 'brightness':
        img.style.filter = 'brightness(1.3)';
        break;
      case 'contrast':
        img.style.filter = 'contrast(1.3)';
        break;
      case 'saturate':
        img.style.filter = 'saturate(1.5)';
        break;
      default:
        img.style.filter = '';
    }
    
    // 添加平滑过渡效果
    img.style.transition = 'filter 0.3s ease';
    
    console.log('Filter applied:', filter, 'Result:', img.style.filter);
    
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
    
    // 获取文件名
    const fileName = img.alt || img.src.split('/').pop()?.split('?')[0] || '未命名'
    
    // 创建内容元素
    const content = document.createElement('div')
    content.innerHTML = `
      <div style="space-y-3;">
        <div style="padding: 16px; background: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            ${getLucideIcon('image')}
            <span style="margin-left: 8px; font-weight: 600; color: #111827;">${fileName}</span>
          </div>
          <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 14px;">
            <span style="color: #6b7280;">原始尺寸:</span>
            <span style="color: #111827; font-weight: 500;">${img.naturalWidth} × ${img.naturalHeight} 像素</span>
            
            <span style="color: #6b7280;">当前尺寸:</span>
            <span style="color: #111827; font-weight: 500;">${img.offsetWidth} × ${img.offsetHeight} 像素</span>
            
            <span style="color: #6b7280;">缩放比例:</span>
            <span style="color: #111827; font-weight: 500;">${Math.round(img.offsetWidth / img.naturalWidth * 100)}%</span>
          </div>
        </div>
        
        <div style="margin-bottom: 12px;">
          <label style="display: block; margin-bottom: 6px; font-size: 13px; color: #6b7280; font-weight: 500;">图片地址</label>
          <div style="position: relative;">
            <input type="text" readonly value="${img.src}" 
              style="width: 100%; padding: 8px 12px; padding-right: 40px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; color: #374151; background: #f9fafb; cursor: text;"
              onfocus="this.select()" />
            <button onclick="navigator.clipboard.writeText('${img.src}'); this.innerHTML='${getLucideIcon('check')}'; setTimeout(() => this.innerHTML='${getLucideIcon('copy')}', 2000)"
              style="position: absolute; right: 4px; top: 50%; transform: translateY(-50%); padding: 6px; background: white; border: 1px solid #d1d5db; border-radius: 4px; cursor: pointer; transition: all 0.2s;"
              onmouseover="this.style.background='#f3f4f6'"
              onmouseout="this.style.background='white'">
              ${getLucideIcon('copy')}
            </button>
          </div>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 6px;">
          <div style="display: flex; align-items: start; font-size: 13px; color: #1e40af;">
            ${getLucideIcon('info')}
            <div style="margin-left: 8px;">
              <div style="font-weight: 500; margin-bottom: 4px;">提示</div>
              <div style="color: #3730a3;">右键点击图片可以访问更多编辑选项，包括调整大小、添加滤镜、设置边框等。</div>
            </div>
          </div>
        </div>
      </div>
    `
    
    // 创建模态框
    new Modal({
      title: '图片属性',
      content: content,
      width: 480,
      confirmText: '确定',
      showCancel: false,
      onConfirm: () => {
        // 模态框会自动关闭
      }
    })
  }

  private showToast(message: string): void {
    Toast.show(message, 'success', 3000)
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
    
    // 获取当前尺寸
    const currentWidth = img.offsetWidth
    const currentHeight = img.offsetHeight
    const aspectRatio = currentWidth / currentHeight
    
    // 创建内容元素
    const content = document.createElement('div')
    content.innerHTML = `
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151; font-weight: 500;">宽度 (px)</label>
        <input type="number" id="img-width" value="${currentWidth}" 
          style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: all 0.2s;" 
          onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
          onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'" />
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 6px; font-size: 14px; color: #374151; font-weight: 500;">高度 (px)</label>
        <input type="number" id="img-height" value="${currentHeight}" 
          style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; transition: all 0.2s;"
          onfocus="this.style.borderColor='#3b82f6'; this.style.outline='none'; this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
          onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'" />
      </div>
      <div style="margin-bottom: 8px;">
        <label style="display: flex; align-items: center; font-size: 14px; color: #374151; cursor: pointer; user-select: none;">
          <input type="checkbox" id="keep-ratio" checked 
            style="margin-right: 8px; width: 16px; height: 16px; cursor: pointer;" />
          <span style="display: flex; align-items: center;">
            ${getLucideIcon('link')}
            <span style="margin-left: 4px;">保持宽高比</span>
          </span>
        </label>
      </div>
      <div style="padding: 12px; background: #f9fafb; border-radius: 6px; margin-top: 16px;">
        <div style="display: flex; align-items: center; font-size: 12px; color: #6b7280;">
          ${getLucideIcon('info')}
          <span style="margin-left: 8px;">原始尺寸: ${img.naturalWidth} × ${img.naturalHeight} px</span>
        </div>
      </div>
    `
    
    // 获取输入元素
    const widthInput = content.querySelector('#img-width') as HTMLInputElement
    const heightInput = content.querySelector('#img-height') as HTMLInputElement
    const keepRatioCheckbox = content.querySelector('#keep-ratio') as HTMLInputElement
    
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
    
    // 创建模态框
    new Modal({
      title: '设置图片尺寸',
      content: content,
      width: 360,
      confirmText: '应用',
      cancelText: '取消',
      showCancel: true,
      onConfirm: () => {
        const width = parseInt(widthInput.value) || 0
        const height = parseInt(heightInput.value) || 0
        
        if (width > 0 && height > 0) {
          img.style.width = `${width}px`
          img.style.height = `${height}px`
          img.style.maxWidth = 'none'
          img.style.objectFit = img.style.objectFit || 'contain'
          if (this.currentImage) {
            this.currentImage.style.width = `${width}px`
            this.currentImage.style.height = `${height}px`
          }
          this.triggerContentChange()
        }
        
        // 隐藏右键菜单
        this.hide()
      },
      onCancel: () => {
        // 隐藏右键菜单
        this.hide()
      }
    })
    
    // 自动聚焦并选中宽度输入框
    setTimeout(() => {
      widthInput.focus()
      widthInput.select()
    }, 100)
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