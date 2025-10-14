/**
 * 图片插件 - 统一的图片处理插件
 * 包含图片插入、右键菜单、编辑功能
 */

import type { Plugin } from '../types'
import { getLucideIcon } from '../utils/icons'

/**
 * 图片右键菜单管理器
 */
class ImageContextMenu {
  private menu: HTMLDivElement | null = null
  private currentImage: HTMLImageElement | null = null
  private editor: any

  constructor(editor: any) {
    this.editor = editor
    this.init()
  }

  private init(): void {
    // 监听编辑器内的右键事件
    if (this.editor.contentElement) {
      this.editor.contentElement.addEventListener('contextmenu', this.handleContextMenu.bind(this))
    }

    // 点击其他地方关闭菜单
    document.addEventListener('click', () => this.hideMenu())
    
    // ESC键关闭菜单
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideMenu()
    })
  }

  private handleContextMenu(e: MouseEvent): void {
    const target = e.target as HTMLElement
    
    // 检查是否点击在图片上
    if (target.tagName === 'IMG') {
      e.preventDefault()
      e.stopPropagation()
      this.currentImage = target as HTMLImageElement
      this.showMenu(e.clientX, e.clientY)
    }
  }

  private showMenu(x: number, y: number): void {
    this.hideMenu()
    
    // 创建菜单
    this.menu = document.createElement('div')
    this.menu.className = 'ldesign-image-menu'
    this.menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 4px;
      min-width: 200px;
      z-index: 10000;
      font-size: 14px;
      color: #374151;
      user-select: none;
    `
    
    // 菜单项配置
    const items = [
      {
        label: '调整大小',
        icon: 'maximize2',
        submenu: [
          { label: '原始大小', action: () => this.setSize('auto', 'auto') },
          { label: '适应宽度', action: () => this.setSize('100%', 'auto') },
          { label: '小 (300px)', action: () => this.setSize('300px', 'auto') },
          { label: '中 (500px)', action: () => this.setSize('500px', 'auto') },
          { label: '大 (800px)', action: () => this.setSize('800px', 'auto') },
          { label: '自定义...', action: () => this.setCustomSize() }
        ]
      },
      {
        label: '填充模式',
        icon: 'square',
        submenu: [
          { label: 'contain', action: () => this.setObjectFit('contain') },
          { label: 'cover', action: () => this.setObjectFit('cover') },
          { label: 'fill', action: () => this.setObjectFit('fill') },
          { label: 'none', action: () => this.setObjectFit('none') },
          { label: 'scale-down', action: () => this.setObjectFit('scale-down') }
        ]
      },
      {
        label: '滤镜',
        icon: 'sparkles',
        submenu: [
          { label: '无滤镜', action: () => this.setFilter('') },
          { label: '模糊', action: () => this.setFilter('blur(2px)') },
          { label: '灰度', action: () => this.setFilter('grayscale(100%)') },
          { label: '褐色', action: () => this.setFilter('sepia(100%)') },
          { label: '反色', action: () => this.setFilter('invert(100%)') },
          { label: '高亮', action: () => this.setFilter('brightness(150%)') },
          { label: '高对比', action: () => this.setFilter('contrast(150%)') }
        ]
      },
      { divider: true },
      { label: '复制图片', icon: 'copy', action: () => this.copyImage() },
      { label: '图片信息', icon: 'info', action: () => this.showInfo() },
      { label: '设置标题', icon: 'type', action: () => this.setTitle() },
      { divider: true },
      { label: '删除', icon: 'trash2', action: () => this.deleteImage() }
    ]
    
    // 渲染菜单项
    this.renderMenuItems(items, this.menu)
    
    // 添加到页面
    document.body.appendChild(this.menu)
    
    // 调整位置
    requestAnimationFrame(() => {
      if (!this.menu) return
      const rect = this.menu.getBoundingClientRect()
      if (x + rect.width > window.innerWidth) {
        this.menu.style.left = `${window.innerWidth - rect.width - 10}px`
      }
      if (y + rect.height > window.innerHeight) {
        this.menu.style.top = `${window.innerHeight - rect.height - 10}px`
      }
    })
  }

  private renderMenuItems(items: any[], container: HTMLElement, level: number = 0): void {
    items.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div')
        divider.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 0;'
        container.appendChild(divider)
      } else {
        const menuItem = document.createElement('div')
        menuItem.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.2s;
          position: relative;
        `
        
        // 图标
        if (item.icon) {
          const icon = document.createElement('span')
          icon.style.cssText = 'width: 16px; height: 16px; opacity: 0.7;'
          icon.innerHTML = getLucideIcon(item.icon)
          menuItem.appendChild(icon)
        }
        
        // 标签
        const label = document.createElement('span')
        label.textContent = item.label
        label.style.flex = '1'
        menuItem.appendChild(label)
        
        // 子菜单箭头
        if (item.submenu) {
          const arrow = document.createElement('span')
          arrow.style.cssText = 'width: 16px; height: 16px; opacity: 0.5;'
          arrow.innerHTML = getLucideIcon('chevronRight')
          menuItem.appendChild(arrow)
          
          // 创建子菜单
          const submenu = document.createElement('div')
          submenu.style.cssText = `
            position: absolute;
            left: 100%;
            top: 0;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 4px;
            min-width: 150px;
            display: none;
            margin-left: 4px;
          `
          
          this.renderMenuItems(item.submenu, submenu, level + 1)
          menuItem.appendChild(submenu)
          
          // 悬停显示子菜单
          menuItem.onmouseenter = () => {
            submenu.style.display = 'block'
            menuItem.style.background = '#f3f4f6'
          }
          
          menuItem.onmouseleave = () => {
            submenu.style.display = 'none'
            menuItem.style.background = 'transparent'
          }
        } else {
          // 悬停效果
          menuItem.onmouseenter = () => {
            menuItem.style.background = '#f3f4f6'
          }
          
          menuItem.onmouseleave = () => {
            menuItem.style.background = 'transparent'
          }
          
          // 点击动作
          if (item.action) {
            menuItem.onclick = (e) => {
              e.stopPropagation()
              item.action()
              this.hideMenu()
            }
          }
        }
        
        container.appendChild(menuItem)
      }
    })
  }

  private hideMenu(): void {
    if (this.menu) {
      this.menu.remove()
      this.menu = null
    }
  }

  // 功能实现
  private setSize(width: string, height: string): void {
    if (!this.currentImage) return
    this.currentImage.style.width = width
    this.currentImage.style.height = height
    this.triggerChange()
  }

  private setCustomSize(): void {
    if (!this.currentImage) return
    const width = prompt('设置宽度 (如: 300px, 50%, auto):', this.currentImage.style.width || 'auto')
    if (width !== null) {
      this.currentImage.style.width = width
      this.currentImage.style.height = 'auto'
      this.triggerChange()
    }
  }

  private setObjectFit(fit: string): void {
    if (!this.currentImage) return
    this.currentImage.style.objectFit = fit as any
    this.triggerChange()
  }

  private setFilter(filter: string): void {
    if (!this.currentImage) return
    this.currentImage.style.filter = filter
    this.triggerChange()
  }

  private setTitle(): void {
    if (!this.currentImage) return
    const title = prompt('设置图片标题:', this.currentImage.title || '')
    if (title !== null) {
      this.currentImage.title = title
      this.triggerChange()
    }
  }

  private async copyImage(): Promise<void> {
    if (!this.currentImage) return
    try {
      await navigator.clipboard.writeText(this.currentImage.src)
      alert('图片地址已复制')
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  private showInfo(): void {
    if (!this.currentImage) return
    alert(`图片信息:
标题: ${this.currentImage.title || '无'}
Alt文本: ${this.currentImage.alt || '无'}
原始尺寸: ${this.currentImage.naturalWidth} × ${this.currentImage.naturalHeight}
显示尺寸: ${this.currentImage.offsetWidth} × ${this.currentImage.offsetHeight}
地址: ${this.currentImage.src}`)
  }

  private deleteImage(): void {
    if (!this.currentImage) return
    if (confirm('确定删除这张图片吗？')) {
      this.currentImage.remove()
      this.currentImage = null
      this.triggerChange()
    }
  }

  private triggerChange(): void {
    const event = new Event('input', { bubbles: true })
    this.editor.contentElement?.dispatchEvent(event)
  }
}

/**
 * 图片插件
 */
export const ImagePlugin: Plugin = {
  name: 'image',
  
  install(editor: any) {
    // 初始化右键菜单
    const contextMenu = new ImageContextMenu(editor)
    
    // 注册上传图片命令（不注册insertImage，由MediaDialogPlugin处理）
    if (!editor.commands.get('uploadImage')) {
      editor.commands.register('uploadImage', () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const url = e.target?.result as string
              document.execCommand('insertImage', false, url)
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      })
    }
    
    console.log('[ImagePlugin] 已加载')
  }
}

export default ImagePlugin
