/**
 * Image Plugin - Unified image handling plugin
 * Contains image insertion, context menu, and editing features
 */

import type { Plugin } from '../../types'
import { getLucideIcon } from '../../ui/icons/lucide'

/**
 * Image Context Menu Manager
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
    // Listen for right-click events in the editor
    if (this.editor.contentElement) {
      this.editor.contentElement.addEventListener('contextmenu', this.handleContextMenu.bind(this))
    }

    // Close menu when clicking elsewhere
    document.addEventListener('click', () => this.hideMenu())
    
    // Close menu with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hideMenu()
    })
  }

  private handleContextMenu(e: MouseEvent): void {
    const target = e.target as HTMLElement
    
    // Check if clicked on an image
    if (target.tagName === 'IMG') {
      e.preventDefault()
      e.stopPropagation()
      this.currentImage = target as HTMLImageElement
      this.showMenu(e.clientX, e.clientY)
    }
  }

  private showMenu(x: number, y: number): void {
    this.hideMenu()
    
    // Create menu
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
    
    // Menu items configuration
    const items = [
      {
        label: 'Resize',
        icon: 'maximize2',
        submenu: [
          { label: 'Original Size', action: () => this.setSize('auto', 'auto') },
          { label: 'Fit Width', action: () => this.setSize('100%', 'auto') },
          { label: 'Small (300px)', action: () => this.setSize('300px', 'auto') },
          { label: 'Medium (500px)', action: () => this.setSize('500px', 'auto') },
          { label: 'Large (800px)', action: () => this.setSize('800px', 'auto') },
          { label: 'Custom...', action: () => this.setCustomSize() }
        ]
      },
      {
        label: 'Object Fit',
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
        label: 'Filters',
        icon: 'sparkles',
        submenu: [
          { label: 'No Filter', action: () => this.setFilter('') },
          { label: 'Blur', action: () => this.setFilter('blur(2px)') },
          { label: 'Grayscale', action: () => this.setFilter('grayscale(100%)') },
          { label: 'Sepia', action: () => this.setFilter('sepia(100%)') },
          { label: 'Invert', action: () => this.setFilter('invert(100%)') },
          { label: 'Brightness', action: () => this.setFilter('brightness(150%)') },
          { label: 'Contrast', action: () => this.setFilter('contrast(150%)') }
        ]
      },
      { divider: true },
      { label: 'Copy Image', icon: 'copy', action: () => this.copyImage() },
      { label: 'Image Info', icon: 'info', action: () => this.showInfo() },
      { label: 'Set Title', icon: 'type', action: () => this.setTitle() },
      { divider: true },
      { label: 'Delete', icon: 'trash2', action: () => this.deleteImage() }
    ]
    
    // Render menu items
    this.renderMenuItems(items, this.menu)
    
    // Add to page
    document.body.appendChild(this.menu)
    
    // Adjust position
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
        
        // Icon
        if (item.icon) {
          const icon = document.createElement('span')
          icon.style.cssText = 'width: 16px; height: 16px; opacity: 0.7;'
          icon.innerHTML = getLucideIcon(item.icon)
          menuItem.appendChild(icon)
        }
        
        // Label
        const label = document.createElement('span')
        label.textContent = item.label
        label.style.flex = '1'
        menuItem.appendChild(label)
        
        // Submenu arrow
        if (item.submenu) {
          const arrow = document.createElement('span')
          arrow.style.cssText = 'width: 16px; height: 16px; opacity: 0.5;'
          arrow.innerHTML = getLucideIcon('chevronRight')
          menuItem.appendChild(arrow)
          
          // Create submenu
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
          
          // Show submenu on hover
          menuItem.onmouseenter = () => {
            submenu.style.display = 'block'
            menuItem.style.background = '#f3f4f6'
          }
          
          menuItem.onmouseleave = () => {
            submenu.style.display = 'none'
            menuItem.style.background = 'transparent'
          }
        } else {
          // Hover effect
          menuItem.onmouseenter = () => {
            menuItem.style.background = '#f3f4f6'
          }
          
          menuItem.onmouseleave = () => {
            menuItem.style.background = 'transparent'
          }
          
          // Click action
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

  // Feature implementations
  private setSize(width: string, height: string): void {
    if (!this.currentImage) return
    this.currentImage.style.width = width
    this.currentImage.style.height = height
    this.triggerChange()
  }

  private setCustomSize(): void {
    if (!this.currentImage) return
    const width = prompt('Set width (e.g. 300px, 50%, auto):', this.currentImage.style.width || 'auto')
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
    const title = prompt('Set image title:', this.currentImage.title || '')
    if (title !== null) {
      this.currentImage.title = title
      this.triggerChange()
    }
  }

  private async copyImage(): Promise<void> {
    if (!this.currentImage) return
    try {
      await navigator.clipboard.writeText(this.currentImage.src)
      alert('Image URL copied!')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  private showInfo(): void {
    if (!this.currentImage) return
    alert(`Image Info:\nTitle: ${this.currentImage.title || 'None'}\nAlt text: ${this.currentImage.alt || 'None'}\nOriginal size: ${this.currentImage.naturalWidth} × ${this.currentImage.naturalHeight}\nDisplay size: ${this.currentImage.offsetWidth} × ${this.currentImage.offsetHeight}\nURL: ${this.currentImage.src}`)
  }

  private deleteImage(): void {
    if (!this.currentImage) return
    if (confirm('Delete this image?')) {
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
 * Image Plugin
 */
export const ImagePlugin: Plugin = {
  name: 'image',
  
  install(editor: any) {
    // Use unified context menu from MediaContextMenuPlugin to avoid duplicate bindings
    
    // Register upload image command (insertImage is handled by MediaDialogPlugin)
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
              // Insert image with default left alignment
              const alt = file.name || 'Image'
              const html = `<img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; display: block; margin: 10px 0;">`
              if (typeof editor.insertHTML === 'function') {
                editor.insertHTML(html)
              } else {
                document.execCommand('insertHTML', false, html)
              }
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
      })
    }
    
    console.log('[ImagePlugin] Loaded')
  }
}

export default ImagePlugin